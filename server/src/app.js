import express from "express";
import cors from "cors";
import healthRouter from "./routes/health.js";
import transactionRouter from "./routes/transactions.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/health", healthRouter);
app.use("/transactions", transactionRouter);

export default app;
