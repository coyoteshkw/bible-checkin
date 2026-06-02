import { defineEventHandler } from 'h3'
import { requireAuth } from '../../middleware/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  return { user }
})
