import mongoose from "mongoose";
import Order from "../models/Order.js";
import Shoe from "../models/Shoe.js";
import User from "../models/User.js";

export async function createOrder(req, res) {
  const { items } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: "items[] required" });

  const user = await User.findById(req.user._id);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const built = [];
    let total = 0;

    for (const it of items) {
      const { shoeId, size, quantity } = it || {};
      if (!shoeId || !size || !quantity) throw new Error("Each item needs shoeId, size, quantity");

      const shoe = await Shoe.findById(shoeId).session(session);
      if (!shoe) throw new Error("Shoe not found");
      if (!shoe.sizes.includes(Number(size))) throw new Error("Size not available");
      if (shoe.stock_quantity < Number(quantity)) throw new Error("Not enough stock");

      await Shoe.updateOne({ _id: shoe._id }, { $inc: { stock_quantity: -Number(quantity) } }).session(session);

      built.push({
        shoeId: shoe._id,
        model: shoe.model,
        size: Number(size),
        quantity: Number(quantity),
        price_at_purchase: shoe.price
      });

      total += shoe.price * Number(quantity);
    }

    const order = await Order.create(
      [{
        userId: user._id,
        customerSnapshot: { fullName: user.fullName, phone: user.phone, address: user.address },
        status: "pending",
        items: built,
        total_price: total
      }],
      { session }
    );

    await session.commitTransaction();
    res.status(201).json(order[0]);
  } catch (e) {
    await session.abortTransaction();
    res.status(400).json({ message: e.message });
  } finally {
    session.endSession();
  }
}

export async function myOrders(req, res) {
  const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
}

export async function listOrdersAdmin(req, res) {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const p = Math.max(1, Number(page));
  const l = Math.min(50, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l),
    Order.countDocuments(filter)
  ]);

  res.json({ page: p, limit: l, total, items });
}

export async function updateOrderStatus(req, res) {
  const { status } = req.body || {};
  const allowed = ["pending", "paid", "shipped", "completed", "cancelled"];
  if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

  const order = await Order.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true });
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
}

export async function deleteOrder(req, res) {
  const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, userId: req.user._id };
  const order = await Order.findOneAndDelete(filter);
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json({ message: "Deleted" });
}
