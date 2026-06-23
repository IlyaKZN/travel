import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initTelegram } from './composables/useTelegram'
import { initTheme } from './composables/useTheme'
import './index.css'

initTelegram()
initTheme()

createApp(App).use(router).mount('#app')
