import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    shoeId: { type: mongoose.Schema.Types.ObjectId, ref: "Shoe", required: true },
    model: { type: String, required: true }, // snapshot
    size: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price_at_purchase: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerSnapshot: {
      fullName: { type: String, required: true },
      phone: { type: String, default: "" },
      address: { type: String, default: "" }
    },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "completed", "cancelled"],
      default: "pending"
    },
    items: { type: [itemSchema], required: true },
    total_price: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
