import mongoose from "mongoose";

const routeSchema = new mongoose.Schema({
  routeId: { type: String, required: true, unique: true },

  // Origin with both coordinates and display name
  origin: {
    lat: { type: Number },
    lng: { type: Number },
  },
  origin_name: { type: String }, // e.g., "MG Road, Bengaluru"

  // Destination with both coordinates and display name
  dest: {
    lat: { type: Number },
    lng: { type: Number },
  },
  dest_name: { type: String }, // e.g., "Koramangala, Bengaluru"

  // Transport & metrics
  mode: { type: String },
  distance_km: { type: Number },
  duration_min: { type: Number },
  emission_g: { type: Number },

  // Store full geometry as JSON string
  polyline: { type: String },
});

// Add indexes for faster search by name or mode
routeSchema.index({ origin_name: "text", dest_name: "text", mode: 1 });

export const Route = mongoose.model("Route", routeSchema);
