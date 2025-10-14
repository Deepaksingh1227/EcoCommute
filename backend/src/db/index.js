import mongoose from "mongoose";

export async function initDb() {
  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      dbName: "EcoCommute",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected ✅");
  } catch (err) {
    console.error("MongoDB init error:", err);
    process.exit(1);
  }
}

// User schema with authentication fields
export const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true, lowercase: true },
  password: { type: String, required: true },
  preferences: { type: Object, default: {} },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", UserSchema);

// Route schema
export const RouteSchema = new mongoose.Schema({
  routeId: { type: String, required: true, unique: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  origin: {
    lat: Number,
    lng: Number,
  },
  dest: {
    lat: Number,
    lng: Number,
  },
  mode: String,
  distance_km: Number,
  duration_min: Number,
  emission_g: Number,
  polyline: String,
  created_at: { type: Date, default: Date.now },
});

export const Route = mongoose.model("Route", RouteSchema);

// Choice schema
export const ChoiceSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  route_id: { type: mongoose.Schema.Types.ObjectId, ref: "Route" },
  chosen_at: { type: Date, default: Date.now },
});

export const Choice = mongoose.model("Choice", ChoiceSchema);