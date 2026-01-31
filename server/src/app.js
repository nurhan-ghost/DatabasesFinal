import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import shoesRoutes from "./routes/shoes.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import { notFound, errorHandler } from "./middleware/error.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*", credentials: false }));
  app.use(morgan("dev"));
  app.use(rateLimit({ windowMs: 60_000, max: 120 }));

  app.get("/", (req, res) => res.json({ ok: true, name: "Shoe Store API" }));

  app.use("/api/auth", authRoutes);
  app.use("/api/shoes", shoesRoutes);
  app.use("/api/orders", ordersRoutes);
  app.use("/api/analytics", analyticsRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
