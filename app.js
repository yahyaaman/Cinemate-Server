import express from "express";
import userRoutes from "./routes/user.js";
import collectionRoutes from "./routes/collection.js";
import cors from "cors";

export const app = express();

app.use(express.json({ limit: 52428800 }));

app.use(cors());
app.use(express.json());
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/collection", collectionRoutes);
