package dev.eveintel.android

import io.ktor.client.HttpClient
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.call.body
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.get
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.Serializable
import java.net.URI

/** Shape of `GET /api/version` on the standalone intel site. */
@Serializable
data class VersionInfo(
    val version: String,
    val daemonUrl: String? = null,
    val apkUrl: String? = null,
    val whatsNew: List<String> = emptyList(),
)

/**
 * Checked once at startup, the same as the desktop app: a tablet propped beside the monitor is not
 * somewhere anyone goes looking for an update banner, so this has to surface it unprompted, but only
 * once per session rather than nagging on a timer.
 */
object UpdateChecker {

    private const val VERSION_URL = "https://intel.evedeck.space/api/version"

    /**
     * Returns the remote [VersionInfo] only when it is strictly newer than [currentVersion], and
     * only after validating [VersionInfo.apkUrl] is a plain http(s) link -- a malformed or spoofed
     * response must not end up handed to an [android.content.Intent] unchecked. Any failure --
     * timeout, network error, bad JSON -- is swallowed and returns null, matching the desktop app's
     * silent-on-error behaviour.
     */
    suspend fun check(currentVersion: String): VersionInfo? = runCatching {
        val client = HttpClient(OkHttp) {
            install(HttpTimeout) {
                requestTimeoutMillis = 10_000
                connectTimeoutMillis = 10_000
                socketTimeoutMillis = 10_000
            }
            install(ContentNegotiation) {
                json()
            }
        }
        try {
            val info = client.get(VERSION_URL).body<VersionInfo>()
            if (!isNewer(info.version, currentVersion)) return@runCatching null
            info.copy(apkUrl = info.apkUrl?.takeIf { it.isHttpOrHttps() })
        } finally {
            client.close()
        }
    }.getOrNull()

    private fun String.isHttpOrHttps(): Boolean =
        runCatching { URI(this).scheme?.lowercase() }.getOrNull() in setOf("http", "https")

    /** Simple X.Y.Z integer-triple comparison. Anything malformed on either side is "not newer". */
    private fun isNewer(remote: String, local: String): Boolean {
        val remoteParts = remote.toVersionTriple() ?: return false
        val localParts = local.toVersionTriple() ?: return false
        for (i in 0..2) {
            if (remoteParts[i] != localParts[i]) return remoteParts[i] > localParts[i]
        }
        return false
    }

    private fun String.toVersionTriple(): IntArray? {
        val parts = trim().removePrefix("v").split(".")
        if (parts.size < 3) return null
        return try {
            IntArray(3) { parts[it].takeWhile(Char::isDigit).toInt() }
        } catch (e: NumberFormatException) {
            null
        }
    }
}
