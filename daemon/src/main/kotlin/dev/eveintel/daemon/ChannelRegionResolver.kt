package dev.eveintel.daemon

import dev.eveintel.parse.ChatLogFormat
import dev.eveintel.parse.MotdRegions
import dev.eveintel.universe.Universe
import java.nio.ByteBuffer
import java.nio.channels.FileChannel
import java.nio.charset.StandardCharsets
import java.nio.file.Path
import java.nio.file.StandardOpenOption

/**
 * Works out which EVE regions each intel channel covers, so abbreviations like "9UY" resolve
 * without the user hand-typing a region list.
 *
 * A channel's MOTD is the primary source: EVE logs it as the very first message of every fresh
 * session ("EVE System > Channel MOTD: ..."), regardless of [Config.startFromEnd], so this reads
 * just the head of whichever file [ChannelRegistry] most recently saw for that channel -- cheap,
 * and it self-corrects when the MOTD changes, since that always means a new session and therefore
 * a new file. A manual per-channel override (from [Config], set in the settings window) always
 * wins over whatever the MOTD says.
 */
class ChannelRegionResolver(
    private val universe: Universe,
    private val overrides: () -> Map<String, Set<Int>>,
) {
    private data class Detected(val path: Path, val regionIds: Set<Int>)

    private val detected = mutableMapOf<String, Detected>()

    /** Regions actually used for scoping: the manual override if set, else what the MOTD says. */
    fun regionIdsFor(channel: String): Set<Int> =
        overrides()[channel] ?: detected[channel]?.regionIds ?: emptySet()

    /** What the MOTD alone says, for the settings UI to show as a hint even when overridden. */
    fun detectedRegionIdsFor(channel: String): Set<Int> = detected[channel]?.regionIds ?: emptySet()

    /** Re-derives [channel]'s regions from [path]'s MOTD, unless that exact file was already read. */
    fun update(channel: String, path: Path) {
        if (detected[channel]?.path == path) return
        detected[channel] = Detected(path, readMotdRegions(path))
    }

    private fun readMotdRegions(path: Path): Set<Int> = runCatching {
        FileChannel.open(path, StandardOpenOption.READ).use { channel ->
            val length = minOf(channel.size(), HEAD_BYTES).toInt()
            if (length <= 0) return@use emptySet<Int>()
            val buffer = ByteBuffer.allocate(length)
            channel.read(buffer, 0)
            buffer.flip()
            val text = StandardCharsets.UTF_16LE.decode(buffer).toString()
            text.lines().firstNotNullOfOrNull { line ->
                ChatLogFormat.parseMessage(line)
                    ?.let(ChatLogFormat::parseChannelMotd)
                    ?.let { MotdRegions.parse(it, universe) }
            } ?: emptySet()
        }
    }.getOrDefault(emptySet())

    private companion object {
        const val HEAD_BYTES = 8L * 1024
    }
}

/** Caches one [dev.eveintel.parse.IntelParser] per channel, rebuilt only when its regions change. */
class ChannelParsers(
    private val universe: Universe,
    private val regionResolver: ChannelRegionResolver,
) {
    private data class Cached(val regionIds: Set<Int>, val parser: dev.eveintel.parse.IntelParser)

    private val cache = mutableMapOf<String, Cached>()

    fun forChannel(channel: String): dev.eveintel.parse.IntelParser {
        val regionIds = regionResolver.regionIdsFor(channel)
        cache[channel]?.let { if (it.regionIds == regionIds) return it.parser }
        val parser = dev.eveintel.parse.IntelParser(universe, regionIds)
        cache[channel] = Cached(regionIds, parser)
        return parser
    }
}
