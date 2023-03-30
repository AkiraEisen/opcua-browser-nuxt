// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ['~/assets/styles/tailwind.css', 'element-plus/dist/index.css', 'vue-json-pretty/lib/styles.css'],
  buildModules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  plugin: ['@/plugins/vue-json-pretty'],
  pinia: {
    autoImports: [
      // automatically imports `defineStore`
      'defineStore', // import { defineStore } from 'pinia'
      ['defineStore', 'definePiniaStore'], // import { defineStore as definePiniaStore } from 'pinia'
    ],
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})
