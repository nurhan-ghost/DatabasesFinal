import { Router } from "express";
import { listShoes, getShoe, createShoe, updateShoe, deleteShoe, incStock } from "../controllers/shoes.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", listShoes);
router.get("/:id", getShoe);

router.post("/", requireAuth, requireAdmin, createShoe);
router.put("/:id", requireAuth, requireAdmin, updateShoe);
router.delete("/:id", requireAuth, requireAdmin, deleteShoe);
router.patch("/:id/stock", requireAuth, requireAdmin, incStock);

export default router;
