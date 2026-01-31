import { Router } from "express";
import { createOrder, myOrders, listOrdersAdmin, updateOrderStatus, deleteOrder } from "../controllers/orders.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, createOrder);
router.get("/my", requireAuth, myOrders);

router.get("/", requireAuth, requireAdmin, listOrdersAdmin);
router.patch("/:id/status", requireAuth, requireAdmin, updateOrderStatus);
router.delete("/:id", requireAuth, deleteOrder);

export default router;
