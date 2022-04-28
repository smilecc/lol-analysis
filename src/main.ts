import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./main.css";
import VConsole from "vconsole";
import { CONFIG_STOREAGE } from "./config";

const meta = document.createElement("meta");
meta.name = "naive-ui-style";
document.head.appendChild(meta);

const config = JSON.parse(window.localStorage.getItem(CONFIG_STOREAGE) || "{}");
if (config?.debug) {
  new VConsole({ theme: "dark" });
}

console.log(import.meta.env);
createApp(App).use(createPinia()).mount("#app");
