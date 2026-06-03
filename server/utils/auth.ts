import { getDb } from '../db/index'
import { getCookie, setCookie, deleteCookie, createError } from 'h3'
import crypto from 'crypto'

export function createSessionToken(): string {
  return crypto.randomUUID()
}

export async function createSession(userId: number): Promise<{ token: string }> {
  const db = await getDb()
  const token = createSessionToken()
  await db.execute('INSERT INTO sessions (id, user_id) VALUES (?, ?)', [token, userId])
  return { token }
}

export async function deleteSession(token: string): Promise<void> {
  const db = await getDb()
  await db.execute('DELETE FROM sessions WHERE id = ?', [token])
}

export async function getSessionUser(token: string): Promise<{ id: number; username: string; email: string } | null> {
  const db = await getDb()
  const row = (await db.query('SELECT u.id, u.username, u.email FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?', [token])).rows[0] as any
  return row || null
}

export async function requireAuth(event: any): Promise<{ id: number; username: string; email: string }> {
  const token = getCookie(event, 'session_token')
  if (!token) throw createError({ statusCode: 401, statusMessage: '未登录' })
  const user = await getSessionUser(token)
  if (!user) throw createError({ statusCode: 401, statusMessage: '会话已过期' })
  return user
}
