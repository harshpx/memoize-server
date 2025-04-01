import express from "express";
import "dotenv/config";
import connectDB from "./utils/dbConnection.js";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";

const app = express();

await connectDB();

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
  res.json({ message: `api running on ${process.env.ENV} environment` });
});

app.use("/api/user", userRoutes);
app.use("/api/note", noteRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

// export default app;