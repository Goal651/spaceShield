package com.spaceshield.server.client.response;

/**
 * Mapped fireball record — built from FireballResponseDto after zipping
 * fields[] with data[][].
 * All fields are nullable except date, energy, and impactEnergy (guaranteed by
 * CNEOS).
 */
public record FireballDto(

        String date, // peak brightness datetime (GMT), format: "YYYY-MM-DD hh:mm:ss"

        String lat, // decimal degrees, null if location unknown
        String latDir, // "N" or "S", null if location unknown

        String lon, // decimal degrees, null if location unknown
        String lonDir, // "E" or "W", null if location unknown

        String alt, // altitude at peak brightness (km), nullable

        String energy, // total radiated energy (×10¹⁰ joules) — never null
        String impactEnergy, // total impact energy (kilotons) — never null

        String vx, // entry velocity X component (km/s), nullable
        String vy, // entry velocity Y component (km/s), nullable
        String vz // entry velocity Z component (km/s), nullable
) {

    /**
     * Maps a raw columnar row (List<String>) using the fields index from
     * FireballResponseDto.
     * Call this from your mapper after iterating response.data().
     *
     * Example:
     * FireballResponseDto res = ...;
     * List<String> fields = res.fields();
     * res.data().stream()
     * .map(row -> FireballDto.fromRow(fields, row))
     * .toList();
     */
    public static FireballDto fromRow(java.util.List<String> fields, java.util.List<String> row) {
        java.util.Map<String, String> map = new java.util.HashMap<>();
        for (int i = 0; i < fields.size(); i++) {
            map.put(fields.get(i), i < row.size() ? row.get(i) : null);
        }
        return new FireballDto(
                map.get("date"),
                map.get("lat"),
                map.get("lat-dir"),
                map.get("lon"),
                map.get("lon-dir"),
                map.get("alt"),
                map.get("energy"),
                map.get("impact-e"),
                map.get("vx"),
                map.get("vy"),
                map.get("vz"));
    }
}
