import mongoose from "mongoose";

const routeSchema = new mongoose.Schema({
  routeId: { type: String, required: true, unique: true },
  origin: { lat: Number, lng: Number },
  dest: { lat: Number, lng: Number },
  mode: String,
  distance_km: Number,
  duration_min: Number,
  emission_g: Number,
  polyline: String,
});

export const Route = mongoose.model("Route", routeSchema);
