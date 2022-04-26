import { http } from "@tauri-apps/api";
import { Body, ResponseType } from "@tauri-apps/api/http";
import { useCommonStore } from "@/stores";
import axios, { AxiosAdapter } from "axios";
import { Base64 } from "js-base64";

const TauriAdapter: AxiosAdapter = (config) => {
  return new Promise((resolve, reject) => {
    let body: undefined | Body = undefined;

    if (config.data) {
      if (typeof config.data == "object") {
        body = Body.json(config.data);
      } else {
        body = Body.text(config.data);
      }
    }

    http
      .fetch(config.baseURL + config.url!, {
        method: config.method?.toUpperCase() as any,
        headers: config.headers,
        query: config.params,
        body,
        responseType:
          config.responseType == "blob"
            ? ResponseType.Binary
            : ResponseType.JSON,
      })
      .then((resp) => {
        resolve({
          status: resp.status,
          statusText: "ok",
          config,
          data: resp.data,
          headers: resp.headers,
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const _lcuAxios = axios.create({
  adapter: TauriAdapter,
});

_lcuAxios.interceptors.request.use(async (config) => {
  const commonStore = useCommonStore();
  config.baseURL = `https://127.0.0.1:${commonStore.lcuClientInfo.port}`;
  console.debug("commonStore", commonStore);
  console.debug("config.baseURL", config.baseURL);

  if (!!commonStore.lcuClientInfo.processId) {
    const auth = Base64.encode(`riot:${commonStore.lcuClientInfo.token}`);
    console.debug("Authorization", auth);

    config.headers = {
      Authorization: `Basic ${auth}`,
      "User-Agent": "LeagueOfLegendsClient/12.7.433.4138 (CEF 91)",
      ...(config.headers || {}),
    };
  }

  return config;
});

_lcuAxios.interceptors.response.use((response) => {
  console.log("收到LCU请求响应", response);
  return response;
});

export const lcuRequest = _lcuAxios;
