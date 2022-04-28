import lodash from "lodash";
import { LCUClient } from "./client";
import { Event, listen } from "@tauri-apps/api/event";

export interface ILCUEventHandlerEvent<T = any> {
  name: string;
  data: T;
  sourceEvent: LCUClient.IWSEevent;
}

export type LCUEventHandlerCallback = (event: ILCUEventHandlerEvent) => void;

export type LCUEventHandlerCallbackRecord = {
  id: number;
  callback: LCUEventHandlerCallback;
  eventName: string;
};

export type ILCUEventHandlerEvents = keyof Omit<
  { [Key in keyof LCUEventHandler]: any },
  "on"
>;

export interface IRoomMessagesEvent {
  roomId: string;
  messages: LCUClient.IRoomMessage[];
}

export class LCUEventHandler {
  protected isSubscribedWS = false;
  protected listenEvents: string[] = [];
  protected callbacks: LCUEventHandlerCallbackRecord[] = [];

  /**
   * 开始监听
   */
  startListen(events: ILCUEventHandlerEvents[] = []) {
    if (this.isSubscribedWS) {
      console.error("已经在监听LCU事件");
      return;
    }
    this.listenEvents = events;
    this.isSubscribedWS = true;

    listen("on-ws", (e: Event<string>) => {
      const [, , payload] = JSON.parse(e.payload);
      const event = payload as LCUClient.IWSEevent;

      if (event.uri == "/lol-champ-select-legacy/v1/implementation-active") {
        if (event.data) {
          this.call("onGameStart", event);
        } else {
          this.call("onGameStop", event);
        }
      }

      if (
        event.uri == "/lol-champ-select/v1/session" &&
        event.eventType == "Update"
      ) {
        this.call("onSelectSession", event);
      }
    });
  }

  /**
   * 增加事件监听
   * @param event
   * @param callback
   */
  on(event: ILCUEventHandlerEvents, callback: LCUEventHandlerCallback): number {
    const callbackId = new Date().getTime();
    this.callbacks.push({
      id: callbackId,
      eventName: event,
      callback,
    });
    return callbackId;
  }

  /**
   * 防抖调用事件处理函数
   */
  protected call = lodash.debounce(
    async (funcName: ILCUEventHandlerEvents, event: LCUClient.IWSEevent) => {
      if (
        (this.listenEvents.length == 0 ||
          this.listenEvents.includes(funcName)) &&
        typeof this[funcName] == "function"
      ) {
        const data = await (this[funcName] as any)(event);

        // 触发回调消息
        this.callbacks
          .filter((it) => it.eventName == funcName)
          .forEach((it) =>
            it.callback({
              name: funcName,
              data,
              sourceEvent: event,
            })
          );
      }
    },
    2 * 1000
  );

  /**
   * 处理对局会话开始
   */
  async onSelectSession(
    event: LCUClient.IWSEevent<{ chatDetails: { chatRoomName: string } }>
  ): Promise<IRoomMessagesEvent | undefined> {
    console.warn("获取到对局会话", event);
    const roomId = event.data.chatDetails.chatRoomName.split("@")[0];
    if (roomId) {
      const roomMessages = await LCUClient.getRoomMessages(roomId);
      return {
        messages: roomMessages.data,
        roomId,
      };
    }
  }

  /**
   * 处理对局开始
   */
  async onGameStart(event: LCUClient.IWSEevent) {
    console.warn("对局开始", event);
  }

  /**
   * 处理对局终止
   */
  async onGameStop(event: LCUClient.IWSEevent) {
    console.warn("对局终止", event);
  }
}
