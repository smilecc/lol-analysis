import { createApp } from 'vue'
import { createPinia } from 'pinia';
import App from './App.vue'
import "./main.css";
// import VConsole from 'vconsole';

// new VConsole({ theme: 'dark' });
createApp(App).use(createPinia()).mount('#app')
