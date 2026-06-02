import { getDb } from '../db/index'
import { getCookie, setCookie, deleteCookie, createError } from 'h3'
import crypto from 'crypto'

// 生成 session token
export function createSessionToken(): string {
  return crypto.randomUUID()
}

// 创建 session
export function createSession(userId: number): { token: string } {
  const db = getDb()
  const token = createSessionToken()
  db.prepare('INSERT INTO sessions (id, user_id) VALUES (?, ?)').run(token, userId)
  return { token }
}

// 删除 session
export function deleteSession(token: string): void {
  const db = getDb()
  db.prepare('DELETE FROM sessions WHERE id = ?').run(token)
}

// 验证 session 并获取用户
export function getSessionUser(token: string): { id: number; username: string; email: string } | null {
  const db = getDb()
  const row = db.prepare(`
    SELECT u.id, u.username, u.email
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ?
  `).get(token) as { id: number; username: string; email: string } | undefined

  return row || null
}

// 需要登录的 API 助手
export function requireAuth(event: any): { id: number; username: string; email: string } {
  const token = getCookie(event, 'session_token')
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: '未登录' })
  }
  const user = getSessionUser(token)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '会话已过期' })
  }
  return user
}
