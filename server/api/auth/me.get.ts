import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  return { user }
})
