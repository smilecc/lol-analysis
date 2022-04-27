import { lcuRequest } from "@/utils";
import { AxiosPromise, AxiosResponse } from "axios";

export namespace LCUClient {
  export interface LCUClientInfo {
    processId: number;
    port: number;
    token: string;
  }

  export interface IWSEevent<T = any> {
    uri: string;
    eventType: "Create" | "Update" | "Delete";
    data: T;
  }

  export interface ISummonerInfo {
    accountId: number;
    displayName: string;
    internalName: string;
    nameChangeFlag: boolean;
    percentCompleteForNextLevel: number;
    privacy: string;
    profileIconId: number;
    puuid: string;
    rerollPoints: IRerollPoints;
    summonerId: number;
    summonerLevel: number;
    unnamed: boolean;
    xpSinceLastLevel: number;
    xpUntilNextLevel: number;
  }

  export interface IRerollPoints {
    currentPoints: number;
    maxRolls: number;
    numberOfRolls: number;
    pointsCostToRoll: number;
    pointsToReroll: number;
  }

  /**
   * 查询用户基础信息
   * @returns
   */
  export function getCurrentSummoner(): AxiosPromise<ISummonerInfo> {
    return lcuRequest.get("/lol-summoner/v1/current-summoner");
  }

  export function getSummonerInfo(
    summonerId: number | string
  ): AxiosPromise<ISummonerInfo> {
    return lcuRequest.get(`/lol-summoner/v1/summoners/${summonerId}`);
  }

  export function listSummoners(
    summonerIds: number[]
  ): AxiosPromise<ISummonerInfo[]> {
    return lcuRequest.get(
      `/lol-summoner/v2/summoners?ids=${JSON.stringify(summonerIds)}`
    );
  }

  /**
   * 获取用户图标
   * @param iconId 图标ID
   * @returns
   */
  export function getProfileIcon(
    iconId: string | number
  ): AxiosPromise<number[]> {
    return lcuRequest.get(
      `/lol-game-data/assets/v1/profile-icons/${iconId}.jpg`,
      {
        responseType: "blob",
      }
    );
  }

  /**
   * 图片数组转图片地址
   * @param array 图片数据
   * @param type 图片类型 默认jpg
   * @returns
   */
  export function arrayToBlobUrl(array: number[], type = "image/jpeg"): string {
    return URL.createObjectURL(new Blob([new Uint8Array(array)], { type }));
  }

  export interface IRoomMessage {
    body: string;
    fromId: string;
    fromPid: string;
    fromSummonerId: number;
    id: string;
    isHistorical: boolean;
    timestamp: string;
    type: string;
  }

  /**
   * 查询房间信息
   * @param roomId
   * @returns
   */
  export function getRoomMessages(
    roomId: string
  ): AxiosPromise<IRoomMessage[]> {
    return lcuRequest.get(`/lol-chat/v1/conversations/${roomId}/messages`);
  }

  export function getRankedStats() {}

  export function listMatchsBySummonerId(summonerId: number) {
    return lcuRequest.get(
      `/lol-match-history/v3/matchlist/account/${summonerId}?begIndex=0&endIndex=10`
    );
  }

  export function listMatchsByPuuid(puuid: string) {
    return lcuRequest.get(
      `/lol-match-history/v1/products/lol/${puuid}/matches?begIndex=0&endIndex=10`
    );
  }
}
