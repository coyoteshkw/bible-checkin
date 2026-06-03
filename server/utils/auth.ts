import { getDb } from '../db/index'
import { getCookie, setCookie, deleteCookie, createError } from 'h3'
import crypto from 'crypto'

// 生成 session token
export function createSessionToken(): string {
  return crypto.randomUUID()
}

// 创建 session
export async function createSession(userId: number): Promise<{ token: string }> {
  const db = getDb()
  const token = createSessionToken()
  await db.prepare('INSERT INTO sessions (id, user_id) VALUES (?, ?)').run(token, userId)
  return { token }
}

// 删除 session
export async function deleteSession(token: string): Promise<void> {
  const db = getDb()
  await db.prepare('DELETE FROM sessions WHERE id = ?').run(token)
}

// 验证 session 并获取用户
export async function getSessionUser(token: string): Promise<{ id: number; username: string; email: string } | null> {
  const db = getDb()
  const row = await db.prepare(`
    SELECT u.id, u.username, u.email
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ?
  `).get(token) as { id: number; username: string; email: string } | undefined

  return row || null
}

// 需要登录的 API 助手
export async function requireAuth(event: any): Promise<{ id: number; username: string; email: string }> {
  const token = getCookie(event, 'session_token')
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: '未登录' })
  }
  const user = await getSessionUser(token)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '会话已过期' })
  }
  return user
}
