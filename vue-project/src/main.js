import './assets/main.css'
import './assets/colors.css'
import './assets/theme.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')
