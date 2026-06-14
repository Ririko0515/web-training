// biome-ignore lint/correctness/noUnusedImports: チュートリアルで使うため残す
import { eq } from "drizzle-orm";
import { Hono } from "hono";
// biome-ignore lint/correctness/noUnusedImports: チュートリアルで使うため残す
import { db } from "../../db/client.js";
// biome-ignore lint/correctness/noUnusedImports: チュートリアルで使うため残す
import { messages } from "../../db/schema.js";
// biome-ignore lint/correctness/noUnusedImports: チュートリアルで使うため残す
import { MessageRequest } from "../models/message.js";

export const messageRoutes = new Hono();

// ここに追記
messageRoutes.get("/", async (c) => {
  const rows = await db.select().from(messages);
  return c.json(rows);
});

messageRoutes.post("/", async (c) => {
  const body = await c.req.json<MessageRequest>();
  if (!body?.message || !body?.userName) {
    return c.json({ error: "invalid format" }, 400);
  }

  const [result] = await db.insert(messages).values({
    message: body.message,
    userName: body.userName,
  });
  const [created] = await db
    .select()
    .from(messages)
    .where(eq(messages.id, result.insertId));
  return c.json(created, 201);
});