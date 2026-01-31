import { Router } from "express";
import { topSold, revenueByBrand } from "../controllers/analytics.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/top-sold", requireAuth, requireAdmin, topSold);
router.get("/revenue-by-brand", requireAuth, requireAdmin, revenueByBrand);

export default router;
