import axios from "axios";

/**
 * Geocode a place name to { lat, lng } using OpenStreetMap Nominatim.
 * Returns null if not found.
 */
export async function geocodePlace(placeName) {
  if (!placeName) return null;
  try {
    const url = "https://nominatim.openstreetmap.org/search";
    const res = await axios.get(url, {
      params: {
        q: placeName,
        format: "json",
        limit: 1,
      },
      headers: { "User-Agent": "EcoCommute-App" },
    });

    if (res.data && res.data.length > 0) {
      const loc = res.data[0];
      return {
        lat: parseFloat(loc.lat),
        lng: parseFloat(loc.lon),
        display_name: loc.display_name,
      };
    }
    return null;
  } catch (err) {
    console.error("Geocoding failed:", err.message);
    return null;
  }
}
