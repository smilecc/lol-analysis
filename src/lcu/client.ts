import { lcuRequest } from "@/utils";
import { AxiosPromise, AxiosResponse } from "axios";

export namespace LCUClient {
  export interface LCUClientInfo {
    processId: number;
    port: number;
    token: string;
  }

  export interface IUserInfo {
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
  export function getUserInfo(): AxiosPromise<IUserInfo> {
    return lcuRequest.get("/lol-summoner/v1/current-summoner");
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
}
