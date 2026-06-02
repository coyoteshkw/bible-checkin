import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  return { user }
})
