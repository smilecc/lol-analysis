import { defineStore } from "pinia";
import { LCUClient } from "@/lcu";
import { emit, Event, listen } from "@tauri-apps/api/event";
import { Base64 } from "js-base64";
import { CONFIG_STOREAGE } from "@/config";

function loadConfig(): IConfig {
  const config = window.localStorage.getItem(CONFIG_STOREAGE);
  if (!config) {
    return DEFAULT_CONFIG;
  }

  return JSON.parse(config);
}

export const useCommonStore = defineStore("common", {
  state: () => {
    return {
      lcuClientInfo: {
        processId: 0,
        port: 0,
        token: "",
      } as LCUClient.LCUClientInfo,
      isLCUSubscribed: false,
      init: false,
      loading: true,
      userInfo: undefined as LCUClient.ISummonerInfo | undefined,
      userProfileIcon: "",
      panel: "Main" as "Main" | "Config",
      config: loadConfig(),
    };
  },
  actions: {
    subscribeLCUCommand() {
      if (this.isLCUSubscribed) {
        console.warn("已经订阅LCU，不再重复订阅");
        return;
      }
      this.isLCUSubscribed = true;

      setInterval(() => emit("load-lcu-command"), 1000);
      listen("lcu-command-info", (event: Event<any>) => {
        if (event.payload) {
          // 如果之前的进程ID和当前进程ID不一样 则重新触发ws监听
          if (
            this.lcuClientInfo.processId != event.payload.process_id &&
            event.payload.process_id != 0
          ) {
            const auth = Base64.encode(`riot:${event.payload.token}`);
            emit("listen-ws", `${event.payload.port},Basic ${auth}`);
          }

          this.lcuClientInfo.port = event.payload.port as number;
          this.lcuClientInfo.processId = event.payload.process_id as number;
          this.lcuClientInfo.token = event.payload.token as string;
          if (this.init == false) {
            this.init = true;
          }
        }
        console.debug(event);
      });

      listen("on-ws", (payload) => {
        console.debug("ws-event", payload, payload.payload);
      });
    },
    setConfig(config: IConfig) {
      this.config = config;
      this.config.horses.sort((l, r) => l.score - r.score);
      window.localStorage.setItem(CONFIG_STOREAGE, JSON.stringify(this.config));
    },
  },
});

export const DEFAULT_CONFIG: IConfig = {
  debug: false,
  autoAcceptReady: true,
  sendHorseMessage: true,
  ignoreSelf: true,
  scoreExpression:
    "KDA + sif(WIN, 2) + sif(FIRST_BOOLD, 2) + sif(FIRST_TOWER, 2) + score(VISION_SCORE, 100, 5) + score(MINIONS_KILLS / TIME_MINUTE, 12, 5) + (DAMAGE / GLOD * 1.5) + sif(IS_SUPPORT, 5)",
  horses: [
    {
      name: "牛马",
      score: 20,
    },
    {
      name: "下等马",
      score: 30,
    },
    {
      name: "中等马",
      score: 40,
    },
    {
      name: "上等马",
      score: 50,
    },
    {
      name: "小代",
      score: 60,
    },
    {
      name: "通天代",
      score: 70,
    },
  ],
};

export interface IConfig {
  sendHorseMessage: boolean;
  ignoreSelf: boolean;
  scoreExpression: string;
  horses: IHorse[];
  autoAcceptReady: boolean;
  debug: boolean;
}

export interface IHorse {
  name: string;
  score: number;
}
