// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  nitro: {
    plugins: ['~/server/db/index.ts']
  },
  runtimeConfig: {
    sessionSecret: process.env.NUXT_SESSION_SECRET || 'dev-secret-change-in-production'
  },
  compatibilityDate: '2026-06-02'
})
