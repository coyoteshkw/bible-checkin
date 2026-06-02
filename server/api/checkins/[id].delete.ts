import { defineEventHandler, getRouterParam } from 'h3'
import { getDb } from '../../db/index'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const id = getRouterParam(event, 'id')
  const db = getDb()

  const existing = db.prepare('SELECT * FROM check_ins WHERE id = ? AND user_id = ?').get(id, user.id)
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: '记录不存在' })
  }

  db.prepare('DELETE FROM check_ins WHERE id = ?').run(id)
  return { success: true }
})
