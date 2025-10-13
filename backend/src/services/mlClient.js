// backend/src/services/mlClient.js
import axios from "axios";

const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8000/predict";

export async function predictDelay(features, retries = 2) {
  try {
    const res = await axios.post(ML_URL, { features });
    return res.data;
  } catch (err) {
    console.error(`ML service call failed: ${err.message}`);
    if (retries > 0) {
      // Retry once after 500ms
      await new Promise((r) => setTimeout(r, 500));
      return predictDelay(features, retries - 1);
    }
    // fallback: naive duration
    return { predicted_duration_min: (features.distance_km / 40) * 60 };
  }
}
