
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import roomsRouter from "./routes/rooms.js";
import adminRouter from "./routes/admin.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/rooms", roomsRouter);
app.use("/admin", adminRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Info pública del servidor (el cliente la consulta antes de mostrar el formulario)
app.get("/info", (_req, res) => {
  res.json({
    name: process.env.SERVER_NAME || "SCPeak Server",
    requiresPassword: !!process.env.SERVER_PASSWORD,
  });
});

app.listen(PORT, () => {
  console.log(`[SCPeak API] Escuchando en http://localhost:${PORT}`);
});
