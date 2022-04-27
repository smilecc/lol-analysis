import { defineStore } from "pinia";
import { LCUClient } from "@/lcu";
import { emit, Event, listen } from "@tauri-apps/api/event";
import { Base64 } from "js-base64";

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
        console.debug("ws-event", payload);
      });
    },
  },
});
