import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./main.css";
import VConsole from "vconsole";

const meta = document.createElement("meta");
meta.name = "naive-ui-style";
document.head.appendChild(meta);

if (import.meta.env.PROD) {
  new VConsole({ theme: "dark" });
}

console.log(import.meta.env);
createApp(App).use(createPinia()).mount("#app");
