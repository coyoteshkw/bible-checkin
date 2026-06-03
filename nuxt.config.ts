// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxtjs/tailwindcss"],
  tailwindcss: {
    config: {
      darkMode: "class",
    },
  },
  nitro: {
    plugins: ["~/server/db/index.ts"],
  },
  runtimeConfig: {
    sessionSecret:
      process.env.NUXT_SESSION_SECRET || "dev-secret-change-in-production",
  },
  compatibilityDate: "2026-06-02",
  app: {
    head: {
      meta: [
        {
          name: "google-site-verification",
          content: "JcadAm97tmXoVw9woFKeKhL-p9SuC6YYJSteU37O7xM",
        },
      ],
    },
  },
});
