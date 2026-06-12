import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, rooms } from "../db/schema.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(authMiddleware);

// ── Usuarios ──

// GET /admin/users — Listar todos los usuarios
router.get("/users", requireRole("admin", "moderator"), async (_req, res) => {
  try {
    const all = await db
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.createdAt);
    res.json(all);
  } catch (err) {
    console.error("Admin users error:", err);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// PATCH /admin/users/:id — Cambiar rol
router.patch("/users/:id", requireRole("admin"), async (req, res) => {
  try {
    const { role } = req.body;
    if (!["admin", "moderator", "user"].includes(role)) {
      res.status(400).json({ error: "Rol inválido. Usa: admin, moderator, user" });
      return;
    }
    if (req.user!.userId === req.params.id) {
      res.status(400).json({ error: "No puedes cambiar tu propio rol" });
      return;
    }
    await db.update(users).set({ role }).where(eq(users.id, req.params.id));
    res.json({ ok: true });
  } catch (err) {
    console.error("Admin patch user error:", err);
    res.status(500).json({ error: "Error al actualizar rol" });
  }
});

// DELETE /admin/users/:id — Eliminar usuario
router.delete("/users/:id", requireRole("admin"), async (req, res) => {
  try {
    if (req.user!.userId === req.params.id) {
      res.status(400).json({ error: "No puedes eliminarte a ti mismo" });
      return;
    }
    await db.delete(users).where(eq(users.id, req.params.id));
    res.json({ ok: true });
  } catch (err) {
    console.error("Admin delete user error:", err);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

// ── Salas ──

// DELETE /admin/rooms/:name — Eliminar sala
router.delete("/rooms/:name", requireRole("admin", "moderator"), async (req, res) => {
  try {
    await db.delete(rooms).where(eq(rooms.name, req.params.name));
    res.json({ ok: true });
  } catch (err) {
    console.error("Admin delete room error:", err);
    res.status(500).json({ error: "Error al eliminar sala" });
  }
});

export default router;
