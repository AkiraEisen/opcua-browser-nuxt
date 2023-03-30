import VueJsonPretty from 'vue-json-pretty'
import {defineNuxtPlugin} from "nuxt/app";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueJsonPretty)
})
