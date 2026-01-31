import mongoose from "mongoose";

const shoeSchema = new mongoose.Schema(
  {
    model: { type: String, required: true, trim: true },
    category: { type: String, default: "sneakers", trim: true },
    color: { type: String, default: "", trim: true },
    sizes: { type: [Number], default: [40, 41, 42] },
    price: { type: Number, required: true, min: 0 },
    stock_quantity: { type: Number, required: true, min: 0 },
    brand: {
      name: { type: String, required: true, trim: true },
      country: { type: String, default: "", trim: true }
    }
  },
  { timestamps: true }
);

// indexes (optimization)
shoeSchema.index({ "brand.name": 1, price: 1 });
shoeSchema.index({ model: "text", category: "text" });

export default mongoose.model("Shoe", shoeSchema);
