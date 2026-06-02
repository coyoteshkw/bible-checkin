import { defineEventHandler, readBody, createError, setCookie } from 'h3'
import bcrypt from 'bcryptjs'
import { getDb } from '../../db/index'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: '请填写邮箱和密码' })
  }

  const db = getDb()
  const user = db.prepare('SELECT id, username, email, password FROM users WHERE email = ?').get(email) as any

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '邮箱或密码错误' })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: '邮箱或密码错误' })
  }

  const { token } = createSession(user.id)
  setCookie(event, 'session_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  })

  return { success: true, user: { id: user.id, username: user.username, email: user.email } }
})
