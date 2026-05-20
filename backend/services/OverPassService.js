const getNearbyLabs = async (lat, lon, radiusKm = 10, maxResults = 8) => {
  const searchTerms = [
    "hospital",
    "pathology lab",
    "diagnostic centre",
    "clinic",
    "pharmacy",
  ];

  const degreePad = (km) => km / 111;
  const radii = [radiusKm, 25, 50];
  const seenNames = new Set();
  let allResults = [];

  for (const r of radii) {
    const pad = degreePad(r);
    const viewbox = [lon - pad, lat + pad, lon + pad, lat - pad].join(",");

    for (const term of searchTerms) {
      try {
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.searchParams.set("q",             term);
        url.searchParams.set("format",        "json");
        url.searchParams.set("limit",         "10");
        url.searchParams.set("addressdetails","1");
        url.searchParams.set("viewbox",       viewbox);
        url.searchParams.set("bounded",       "1");

        const response = await fetch(url.toString(), {
          headers: {
            "User-Agent":      "HealthLense/1.0 (healthlense@dev.local)",
            "Accept-Language": "en",
          },
          signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) {
          console.warn(`[Nominatim] ${response.status} for "${term}"`);
          await sleep(1100);
          continue;
        }

        const places = await response.json();

        for (const place of places) {
          const name = place.display_name?.split(",")[0]?.trim();
          if (!name || seenNames.has(name.toLowerCase())) continue;

          const plLat = parseFloat(place.lat);
          const plLon = parseFloat(place.lon);
          const dist  = haversineKm(lat, lon, plLat, plLon);
          if (dist > r) continue;

          seenNames.add(name.toLowerCase());
          allResults.push({
            name,
            lat:      plLat,
            lon:      plLon,
            address: [
              place.address?.road,
              place.address?.suburb  ||
              place.address?.village ||
              place.address?.town,
              place.address?.city    ||
              place.address?.county,
            ].filter(Boolean).join(", "),
            distance: parseFloat(dist.toFixed(2)),
            type:     getCategoryLabel(term),
            phone:    null,
          });
        }

        // Nominatim ToS: max 1 req/sec
        await sleep(1100);

      } catch (err) {
        console.warn(`[Nominatim] Error for "${term}":`, err.message);
        await sleep(1100);
      }
    }

    const sorted = allResults
      .sort((a, b) => a.distance - b.distance)
      .slice(0, maxResults);

    if (sorted.length >= 3) {
      console.log(`[Nominatim] ✓ ${sorted.length} places within ${r}km`);
      return sorted;
    }

    console.log(`[Nominatim] ${allResults.length} results at ${r}km, expanding...`);
  }

  const final = allResults
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxResults);

  console.log(`[Nominatim] Returning ${final.length} total results`);
  return final;
};

const getCategoryLabel = (term) => ({
  "hospital":  "Hospital",
  "pathology lab": "Pathology Lab",
  "diagnostic centre": "Diagnostic Centre",
  "clinic": "Clinic",
  "pharmacy": "Pharmacy",
}[term] || "Health");

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) *
    Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};


const deg2rad = (deg) => deg * (Math.PI / 180);


module.exports = { getNearbyLabs };