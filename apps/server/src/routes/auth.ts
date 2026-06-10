import { Router, type Router as RouterType } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import type { AuthPayload, LoginRequest, RegisterRequest } from "@scpeak/shared";

const router: RouterType = Router();
const SALT_ROUNDS = 10;

router.post("/register", async (req, res) => {
  try {
    const { username, password, serverPassword } = req.body as RegisterRequest;

    if (!username || !password || password.length < 6) {
      res.status(400).json({ error: "Usuario y contraseña (mín. 6 caracteres) requeridos" });
      return;
    }

    // Validar contraseña del servidor si está configurada
    const requiredServerPassword = process.env.SERVER_PASSWORD;
    if (requiredServerPassword && serverPassword !== requiredServerPassword) {
      res.status(403).json({ error: "Contraseña del servidor incorrecta" });
      return;
    }

    const existing = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (existing) {
      res.status(409).json({ error: "El usuario ya existe" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const [user] = await db
      .insert(users)
      .values({ username, passwordHash })
      .returning({ id: users.id, username: users.username });

    const payload: AuthPayload = { userId: user.id, username: user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" });

    res.status(201).json({ token, user: payload });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body as LoginRequest;

    if (!username || !password) {
      res.status(400).json({ error: "Usuario y contraseña requeridos" });
      return;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!user) {
      res.status(401).json({ error: "Credenciales inválidas" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Credenciales inválidas" });
      return;
    }

    const payload: AuthPayload = { userId: user.id, username: user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" });

    res.json({ token, user: payload });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
