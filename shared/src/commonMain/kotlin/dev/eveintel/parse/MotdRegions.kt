package dev.eveintel.parse

import dev.eveintel.universe.Universe

/**
 * Extracts the regions a channel's MOTD claims to cover.
 *
 * Corp/alliance intel channels list their covered regions `//`-separated at the very start of the
 * MOTD, e.g. `Detorid // Cache // Wicked Creek // Insmother  Please contact...`. The chat log
 * flattens the MOTD's own line breaks to spaces, so the free-form rules text after the region list
 * ends up glued onto the last region name with no delimiter left to find it by -- so the last
 * segment is matched by longest known-region-name prefix instead of taken whole.
 */
object MotdRegions {
    fun parse(motdText: String, universe: Universe): Set<Int> {
        val segments = motdText.split("//").map { it.trim() }.filter { it.isNotEmpty() }
        if (segments.isEmpty()) return emptySet()

        val maxWords = universe.regionIdsByLowerName.keys
            .maxOfOrNull { it.count { ch -> ch == ' ' } + 1 } ?: 1

        val ids = mutableSetOf<Int>()
        segments.forEachIndexed { index, segment ->
            val id = if (index < segments.lastIndex) {
                universe.regionIdsByLowerName[segment.lowercase()]
            } else {
                longestRegionPrefix(segment, universe, maxWords)
            }
            id?.let { ids.add(it) }
        }
        return ids
    }

    private fun longestRegionPrefix(segment: String, universe: Universe, maxWords: Int): Int? {
        val words = segment.split(' ').filter { it.isNotBlank() }
        for (wordCount in minOf(words.size, maxWords) downTo 1) {
            val candidate = words.take(wordCount).joinToString(" ").lowercase()
            universe.regionIdsByLowerName[candidate]?.let { return it }
        }
        return null
    }
}
