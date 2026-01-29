import { Router } from "express";
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";

const router = Router();

const ensureDatabase = (_req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Banco de dados indisponível. Configure MONGODB_URI.",
    });
  }
  return next();
};

router.get("/", ensureDatabase, async (_req, res) => {
  const items = await Transaction.find().sort({ date: -1 });
  res.json(items);
});

router.post("/", ensureDatabase, async (req, res) => {
  const { type, amount, category, date, description = "" } = req.body;

  if (!type || !amount || !category || !date) {
    return res.status(400).json({
      message: "Campos obrigatórios: tipo, valor, categoria e data.",
    });
  }

  const transaction = await Transaction.create({
    type,
    amount,
    category,
    date,
    description,
  });

  return res.status(201).json(transaction);
});

export default router;
