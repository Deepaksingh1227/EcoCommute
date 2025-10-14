// backend/src/services/emission.js

// emission factors g CO2 per km (simple demo values)
const EMISSION_FACTORS = {
  petrol_car: 192, // 🚗
  electric_car: 50, // ⚡
  bus: 105, // 🚌
  bike: 40, // 🏍 (Motorbike)
  cycling: 0, // 🚴 Human-powered → Zero
};

// named export
export function computeEmission(distance_km, vehicle = "petrol_car") {
  const factor = EMISSION_FACTORS[vehicle] ?? EMISSION_FACTORS.petrol_car;
  const grams = distance_km * factor;
  return grams;
}
