import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VNetworkGraph from 'v-network-graph'
import 'v-network-graph/lib/style.css'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())
app.use(VNetworkGraph)
app.mount('#app')
