import Order from "../models/Order.js";

export async function topSold(req, res) {
  const limit = Math.min(20, Math.max(1, Number(req.query.limit || 5)));

  const data = await Order.aggregate([
    { $unwind: "$items" },
    { $group: { _id: "$items.shoeId", sold: { $sum: "$items.quantity" } } },
    { $lookup: { from: "shoes", localField: "_id", foreignField: "_id", as: "shoe" } },
    { $unwind: "$shoe" },
    { $project: { _id: 0, shoeId: "$_id", model: "$shoe.model", brand: "$shoe.brand.name", sold: 1 } },
    { $sort: { sold: -1 } },
    { $limit: limit }
  ]);

  res.json(data);
}

export async function revenueByBrand(req, res) {
  const data = await Order.aggregate([
    { $unwind: "$items" },
    { $lookup: { from: "shoes", localField: "items.shoeId", foreignField: "_id", as: "shoe" } },
    { $unwind: "$shoe" },
    {
      $group: {
        _id: "$shoe.brand.name",
        revenue: { $sum: { $multiply: ["$items.quantity", "$items.price_at_purchase"] } },
        ordersCount: { $addToSet: "$_id" }
      }
    },
    { $project: { _id: 0, brand: "$_id", revenue: 1, orders: { $size: "$ordersCount" } } },
    { $sort: { revenue: -1 } }
  ]);

  res.json(data);
}
