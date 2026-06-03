import bcrypt from 'bcryptjs'
import { getDb } from '../../db/index'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, email, password } = body

  if (!username || !email || !password) {
    throw createError({ statusCode: 400, statusMessage: '请填写所有字段' })
  }
  if (username.length < 2 || username.length > 20) {
    throw createError({ statusCode: 400, statusMessage: '用户名长度 2-20 个字符' })
  }
  if (password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: '密码至少 6 个字符' })
  }

  const db = await getDb()

  const existing = (await db.query('SELECT id FROM users WHERE email = ? OR username = ?', [email, username])).rows[0]
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: '邮箱或用户名已被注册' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const result = await db.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword])

  const { token } = await createSession(result.lastInsertRowid!)
  setCookie(event, 'session_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  })

  return { success: true, user: { id: result.lastInsertRowid, username, email } }
})
