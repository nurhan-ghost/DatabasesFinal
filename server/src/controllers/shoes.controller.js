import Shoe from "../models/Shoe.js";

export async function listShoes(req, res) {
  const {
    page = 1,
    limit = 10,
    brand,
    category,
    minPrice,
    maxPrice,
    q,
    sort = "new" // new|price_asc|price_desc
  } = req.query;

  const filter = {};
  if (brand) filter["brand.name"] = brand;
  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (q) filter.$text = { $search: q };

  const sortMap = {
    new: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 }
  };

  const p = Math.max(1, Number(page));
  const l = Math.min(50, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    Shoe.find(filter).sort(sortMap[sort] || sortMap.new).skip((p - 1) * l).limit(l),
    Shoe.countDocuments(filter)
  ]);

  res.json({ page: p, limit: l, total, items });
}

export async function getShoe(req, res) {
  const shoe = await Shoe.findById(req.params.id);
  if (!shoe) return res.status(404).json({ message: "Shoe not found" });
  res.json(shoe);
}

export async function createShoe(req, res) {
  const shoe = await Shoe.create(req.body);
  res.status(201).json(shoe);
}

export async function updateShoe(req, res) {
  const shoe = await Shoe.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!shoe) return res.status(404).json({ message: "Shoe not found" });
  res.json(shoe);
}

export async function deleteShoe(req, res) {
  const shoe = await Shoe.findByIdAndDelete(req.params.id);
  if (!shoe) return res.status(404).json({ message: "Shoe not found" });
  res.json({ message: "Deleted" });
}

// advanced update: $inc stock
export async function incStock(req, res) {
  const { delta } = req.body || {};
  if (typeof delta !== "number") return res.status(400).json({ message: "delta (number) required" });

  const shoe = await Shoe.findByIdAndUpdate(
    req.params.id,
    { $inc: { stock_quantity: delta } },
    { new: true, runValidators: true }
  );
  if (!shoe) return res.status(404).json({ message: "Shoe not found" });
  res.json(shoe);
}
