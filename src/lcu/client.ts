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

  export interface IRankedStats {
    earnedRegaliaRewardIds: any[];
    highestPreviousSeasonAchievedDivision: Division;
    highestPreviousSeasonAchievedTier: Tier;
    highestPreviousSeasonEndDivision: Division;
    highestPreviousSeasonEndTier: Tier;
    highestRankedEntry: HighestRankedEntry;
    highestRankedEntrySR: HighestRankedEntry;
    queueMap: QueueMap;
    queues: HighestRankedEntry[];
    rankedRegaliaLevel: number;
    seasons: Seasons;
    splitsProgress: { [key: string]: number };
  }

  export type Division = string;

  export interface HighestRankedEntry {
    division: Division;
    isProvisional: boolean;
    leaguePoints: number;
    losses: number;
    miniSeriesProgress: string;
    previousSeasonAchievedDivision: Division;
    previousSeasonAchievedTier: Tier;
    previousSeasonEndDivision: Division;
    previousSeasonEndTier: Tier;
    provisionalGameThreshold: number;
    provisionalGamesRemaining: number;
    queueType: string;
    ratedRating: number;
    ratedTier: Tier;
    tier: Tier;
    warnings: null;
    wins: number;
  }

  export type Tier = string;

  export interface QueueMap {
    RANKED_FLEX_SR: HighestRankedEntry;
    RANKED_SOLO_5x5: HighestRankedEntry;
    RANKED_TFT: HighestRankedEntry;
    RANKED_TFT_PAIRS: HighestRankedEntry;
    RANKED_TFT_TURBO: HighestRankedEntry;
  }

  export interface Seasons {
    RANKED_FLEX_SR: Ranked;
    RANKED_SOLO_5x5: Ranked;
    RANKED_TFT: Ranked;
    RANKED_TFT_PAIRS: Ranked;
    RANKED_TFT_TURBO: Ranked;
  }

  export interface Ranked {
    currentSeasonEnd: number;
    currentSeasonId: number;
    nextSeasonStart: number;
  }

  /**
   * 查询段位
   * @param puuid
   * @returns
   */
  export function getRankedStats(puuid: string): AxiosPromise<IRankedStats> {
    return lcuRequest.get(`/lol-ranked/v1/ranked-stats/${puuid}`);
  }

  export function getRankName(tier: Tier) {
    switch (tier) {
      case "CHALLENGER":
        return "最强王者";
      case "GRANDMASTER":
        return "傲世宗师";
      case "MASTER":
        return "超凡大师";
      case "DIAMOND":
        return "璀璨钻石";
      case "PLATINUM":
        return "华贵铂金";
      case "GOLD":
        return "荣耀黄金";
      case "SILVER":
        return "不屈白银";
      case "BRONZE":
        return "英勇黄铜";
      case "IRON":
        return "坚韧黑铁";
      case "UNRANKED":
      case "NONE":
      default:
        return "没有段位";
    }
  }

  export interface IGameMatch {
    accountId: number;
    games: Games;
    platformId: PlatformID;
  }

  export type PlatformID = string;

  export interface Games {
    gameBeginDate: string;
    gameCount: number;
    gameEndDate: string;
    gameIndexBegin: number;
    gameIndexEnd: number;
    games: Game[];
  }

  export interface Game {
    gameCreation: number;
    gameCreationDate: string;
    gameDuration: number;
    gameId: number;
    gameMode: GameMode;
    gameType: GameType;
    gameVersion: string;
    mapId: number;
    participantIdentities: ParticipantIdentity[];
    participants: Participant[];
    platformId: PlatformID;
    queueId: number;
    seasonId: number;
    teams: any[];
  }

  export type GameMode = "ARAM" | "CLASSIC" | "TFT" | "URF" | "PRACTICETOOL";
  export type GameType = "MATCHED_GAME";

  export interface ParticipantIdentity {
    participantId: number;
    player: Player;
  }

  export interface Player {
    accountId: number;
    currentAccountId: number;
    currentPlatformId: PlatformID;
    matchHistoryUri: string;
    platformId: PlatformID;
    profileIcon: number;
    summonerId: number;
    summonerName: string;
  }

  export interface Participant {
    championId: number;
    highestAchievedSeasonTier: string;
    participantId: number;
    spell1Id: number;
    spell2Id: number;
    stats: Stats;
    teamId: number;
    timeline: Timeline;
  }

  export interface Stats {
    assists: number;
    causedEarlySurrender: boolean;
    champLevel: number;
    combatPlayerScore: number;
    damageDealtToObjectives: number;
    damageDealtToTurrets: number;
    damageSelfMitigated: number;
    deaths: number;
    doubleKills: number;
    earlySurrenderAccomplice: boolean;
    firstBloodAssist: boolean;
    firstBloodKill: boolean;
    firstInhibitorAssist: boolean;
    firstInhibitorKill: boolean;
    firstTowerAssist: boolean;
    firstTowerKill: boolean;
    gameEndedInEarlySurrender: boolean;
    gameEndedInSurrender: boolean;
    goldEarned: number;
    goldSpent: number;
    inhibitorKills: number;
    item0: number;
    item1: number;
    item2: number;
    item3: number;
    item4: number;
    item5: number;
    item6: number;
    killingSprees: number;
    kills: number;
    largestCriticalStrike: number;
    largestKillingSpree: number;
    largestMultiKill: number;
    longestTimeSpentLiving: number;
    magicDamageDealt: number;
    magicDamageDealtToChampions: number;
    magicalDamageTaken: number;
    neutralMinionsKilled: number;
    neutralMinionsKilledEnemyJungle: number;
    neutralMinionsKilledTeamJungle: number;
    objectivePlayerScore: number;
    participantId: number;
    pentaKills: number;
    perk0: number;
    perk0Var1: number;
    perk0Var2: number;
    perk0Var3: number;
    perk1: number;
    perk1Var1: number;
    perk1Var2: number;
    perk1Var3: number;
    perk2: number;
    perk2Var1: number;
    perk2Var2: number;
    perk2Var3: number;
    perk3: number;
    perk3Var1: number;
    perk3Var2: number;
    perk3Var3: number;
    perk4: number;
    perk4Var1: number;
    perk4Var2: number;
    perk4Var3: number;
    perk5: number;
    perk5Var1: number;
    perk5Var2: number;
    perk5Var3: number;
    perkPrimaryStyle: number;
    perkSubStyle: number;
    physicalDamageDealt: number;
    physicalDamageDealtToChampions: number;
    physicalDamageTaken: number;
    playerScore0: number;
    playerScore1: number;
    playerScore2: number;
    playerScore3: number;
    playerScore4: number;
    playerScore5: number;
    playerScore6: number;
    playerScore7: number;
    playerScore8: number;
    playerScore9: number;
    quadraKills: number;
    sightWardsBoughtInGame: number;
    teamEarlySurrendered: boolean;
    timeCCingOthers: number;
    totalDamageDealt: number;
    totalDamageDealtToChampions: number;
    totalDamageTaken: number;
    totalHeal: number;
    totalMinionsKilled: number;
    totalPlayerScore: number;
    totalScoreRank: number;
    totalTimeCrowdControlDealt: number;
    totalUnitsHealed: number;
    tripleKills: number;
    trueDamageDealt: number;
    trueDamageDealtToChampions: number;
    trueDamageTaken: number;
    turretKills: number;
    unrealKills: number;
    visionScore: number;
    visionWardsBoughtInGame: number;
    wardsKilled: number;
    wardsPlaced: number;
    win: boolean;
  }

  export interface Timeline {
    creepsPerMinDeltas: { [key: string]: number };
    csDiffPerMinDeltas: DiffPerMinDeltas;
    damageTakenDiffPerMinDeltas: DiffPerMinDeltas;
    damageTakenPerMinDeltas: { [key: string]: number };
    goldPerMinDeltas: { [key: string]: number };
    lane: Lane;
    participantId: number;
    role: Role;
    xpDiffPerMinDeltas: DiffPerMinDeltas;
    xpPerMinDeltas: { [key: string]: number };
  }

  export interface DiffPerMinDeltas {
    [key: string]: number;
  }

  export type Lane = "NONE" | "TOP" | "JUNGLE" | "MIDDLE" | "BOTTOM";
  export type Role = "DUO" | "DUO_SUPPORT" | "DUO_CARRY" | "NONE";

  export function listMatchsBySummonerId(
    summonerId: number
  ): AxiosPromise<IGameMatch> {
    return lcuRequest.get(
      `/lol-match-history/v3/matchlist/account/${summonerId}?begIndex=0&endIndex=10`
    );
  }

  export function listMatchsByPuuid(puuid: string): AxiosPromise<IGameMatch> {
    return lcuRequest.get(
      `/lol-match-history/v1/products/lol/${puuid}/matches?begIndex=0&endIndex=10`
    );
  }

  /**
   * 发送消息到房间
   * @param roomId
   * @param text
   * @returns
   */
  export function sendMessage(roomId: string, text: string) {
    return lcuRequest.post(`/lol-chat/v1/conversations/${roomId}/messages`, {
      type: "chat",
      body: text,
    });
  }

  /**
   * 接受游戏对局
   * @returns 
   */
  export function acceptReady() {
    return lcuRequest.post(`/lol-matchmaking/v1/ready-check/accept`, {});
  }
}
