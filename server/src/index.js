import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";

dotenv.config();

const { MONGODB_URI, PORT = 3000 } = process.env;

const connectToDatabase = async () => {
  if (!MONGODB_URI) {
    console.warn("MONGODB_URI não definido. API iniciada sem conexão.");
    return;
  }

  await mongoose.connect(MONGODB_URI);
  console.log("MongoDB conectado.");
};

connectToDatabase().catch((error) => {
  console.error("Erro ao conectar no MongoDB:", error);
});

app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
