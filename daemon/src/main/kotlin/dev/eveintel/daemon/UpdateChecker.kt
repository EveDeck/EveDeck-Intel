package dev.eveintel.daemon

import dev.eveintel.wire.WireJson
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.engine.cio.CIO
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.request.get
import io.ktor.http.isSuccess
import kotlinx.serialization.Serializable

/**
 * What `GET https://intel.evedeck.space/api/version` returns. See
 * `site/src/app/api/version/route.ts` for the source of truth.
 */
@Serializable
data class VersionInfo(
    val version: String,
    val daemonUrl: String? = null,
    val apkUrl: String? = null,
    val whatsNew: List<String> = emptyList(),
)

/**
 * A one-shot, startup-only check against the intel site's version endpoint -- there is no repeating
 * timer, matching the main EveDeck app's update banner.
 *
 * Never throws and never surfaces an error to the user: a failed check (network error, timeout,
 * non-200, malformed JSON) just means "no update," the same as actually being up to date.
 */
object UpdateChecker {

    /** Bumped by hand alongside `android/build.gradle.kts` and `site/src/lib/release.ts` on every
     *  release -- there is no single source of truth for the daemon's own version yet. */
    const val CURRENT_VERSION = "0.2.0"

    private const val ENDPOINT = "https://intel.evedeck.space/api/version"

    /** Returns the remote [VersionInfo] only if it is strictly newer than [currentVersion], else null. */
    suspend fun check(currentVersion: String = CURRENT_VERSION): VersionInfo? = runCatching {
        val http = HttpClient(CIO) {
            install(HttpTimeout) {
                requestTimeoutMillis = 10_000
                connectTimeoutMillis = 10_000
            }
        }
        try {
            val response = http.get(ENDPOINT)
            if (!response.status.isSuccess()) return@runCatching null
            val body = WireJson.decodeFromString(VersionInfo.serializer(), response.body())
            if (!isNewer(body.version, currentVersion)) return@runCatching null
            body.copy(daemonUrl = body.daemonUrl?.takeIf { isHttpUrl(it) })
        } finally {
            http.close()
        }
    }.getOrNull()

    /** True if [remote] is a strictly newer X.Y.Z version than [current]. Anything that doesn't parse
     *  as exactly three dot-separated integers on either side is treated as "not newer". */
    internal fun isNewer(remote: String, current: String): Boolean {
        val remoteParts = parseSemver(remote) ?: return false
        val currentParts = parseSemver(current) ?: return false
        for (i in 0..2) {
            if (remoteParts[i] != currentParts[i]) return remoteParts[i] > currentParts[i]
        }
        return false
    }

    private fun parseSemver(version: String): List<Int>? {
        val parts = version.trim().split(".")
        if (parts.size != 3) return null
        return parts.map { it.toIntOrNull() ?: return null }
    }

    /** Never trust a manifest response to point anywhere but http(s) before it is ever opened. */
    private fun isHttpUrl(url: String): Boolean = runCatching {
        val scheme = java.net.URI(url).scheme?.lowercase()
        scheme == "http" || scheme == "https"
    }.getOrDefault(false)
}
