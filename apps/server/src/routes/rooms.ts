import { Router, type Router as RouterType } from "express";
import { db } from "../db/index.js";
import { rooms } from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";
import { generateLiveKitToken } from "../services/livekit.js";
import type { JoinRoomRequest } from "@scpeak/shared";
import { eq } from "drizzle-orm";

const router: RouterType = Router();

router.use(authMiddleware);

router.get("/", async (_req, res) => {
  try {
    const allRooms = await db.select().from(rooms);
    res.json(allRooms);
  } catch (err) {
    console.error("List rooms error:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/join", async (req, res) => {
  try {
    const { roomName } = req.body as JoinRoomRequest;

    if (!roomName) {
      res.status(400).json({ error: "Nombre de sala requerido" });
      return;
    }

    // Crear la sala si no existe
    const existing = await db.query.rooms.findFirst({
      where: eq(rooms.name, roomName),
    });

    if (!existing) {
      await db.insert(rooms).values({ name: roomName });
    }

    const token = await generateLiveKitToken(
      req.user!.userId,
      req.user!.username,
      roomName
    );

    res.json({ token, roomName });
  } catch (err) {
    console.error("Join room error:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Token de monitor: se une como oyente con identidad distinta para testear el flujo completo
router.post("/monitor", async (req, res) => {
  try {
    const { roomName } = req.body as JoinRoomRequest;

    if (!roomName) {
      res.status(400).json({ error: "Nombre de sala requerido" });
      return;
    }

    const token = await generateLiveKitToken(
      `${req.user!.userId}-monitor`,
      `${req.user!.username} (monitor)`,
      roomName,
      { canPublish: false }
    );

    res.json({ token, roomName });
  } catch (err) {
    console.error("Monitor room error:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
