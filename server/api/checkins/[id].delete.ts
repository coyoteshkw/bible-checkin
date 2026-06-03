import { getDb } from '../../db/index'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const db = await getDb()

  const existing = (await db.query('SELECT * FROM check_ins WHERE id = ? AND user_id = ?', [id, user.id])).rows[0]
  if (!existing) throw createError({ statusCode: 404, statusMessage: '记录不存在' })

  await db.execute('DELETE FROM check_ins WHERE id = ?', [id])
  return { success: true }
})
