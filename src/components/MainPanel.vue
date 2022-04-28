<script setup lang="ts">
import { LCUEventHandler, LCUClient, ILCUEventHandlerEvent, GameScoreCalculator, IRoomMessagesEvent } from '@/lcu';
import { IHorse, useCommonStore } from '@/stores';
import { last, meanBy } from 'lodash';
import { onBeforeMount, reactive, ref } from 'vue';
import { NSpin } from 'naive-ui';

interface IGamingSummoner {
  avatarUrl: string;
  summonerId: number;
  summoner: LCUClient.ISummonerInfo;
  matchs: LCUClient.IGameMatch;
  scores: { score: number; kda: number; }[];
  score: number;
  kda: number;
  horse: IHorse;
  rankedStats: LCUClient.IRankedStats;
}

const commonStore = useCommonStore();
const eventHandler = ref(new LCUEventHandler());
const state = reactive({
  loading: false,
  gaming: false,
  summoners: [] as IGamingSummoner[],
  chatRoomId: '',
});

onBeforeMount(() => {
  eventHandler.value.startListen([]);

  eventHandler.value.on('onGameStop', () => {
    state.gaming = false;
    state.summoners = [];
  });

  eventHandler.value.on('onSelectSession', async (event: ILCUEventHandlerEvent<IRoomMessagesEvent>) => {
    console.log(event.data.roomId);
    if (state.summoners.length) {
      return;
    }

    state.loading = true;
    state.gaming = true;
    console.log('onSelectSession', event);
    state.chatRoomId = event.data.roomId;
    const joindMessages = event.data.messages.filter(it => it.type == "system" && it.body == "joined_room");
    // 查询对局玩家信息
    const { data: summonersInfo } = await LCUClient.listSummoners(joindMessages.map(it => it.fromSummonerId));
    // 查询玩家详细信息
    let summoners: IGamingSummoner[] = await Promise.all(summonersInfo.map(async summoner => {
      try {
        const { data: matchs } = await LCUClient.listMatchsBySummonerId(summoner.accountId);
        const { data: rankedStats } = await LCUClient.getRankedStats(summoner.puuid);

        // 计算分数
        const scores = matchs.games.games.map(game => {
          const calculator = GameScoreCalculator.build(game);
          return {
            score: calculator.calc(),
            kda: calculator.kda,
          };
        });

        // 计算平均数
        const score = meanBy(scores, 'score');
        const kda = meanBy(scores, 'kda');

        return LCUClient
          .getProfileIcon(summoner.profileIconId)
          .then(res => {
            return {
              avatarUrl: LCUClient.arrayToBlobUrl(res.data),
              summoner,
              summonerId: summoner.accountId,
              matchs,
              scores,
              score,
              kda,
              rankedStats,
              horse: GameScoreCalculator.calcHorse(commonStore.config.horses, score),
            }
          })
      } catch {
        return {};
      }
    })) as any;

    summoners = summoners.filter(it => it != null);
    summoners.sort((l, r) => r.score - l.score);
    state.summoners = summoners;
    console.log('玩家信息', summoners);
    sendSummonersHorseMessage();
    state.loading = false;
  });
});

/**
 * 发送马匹信息到聊天
 */
async function sendSummonersHorseMessage() {
  if (!commonStore.config.sendHorseMessage) {
    return;
  }

  for (const summoner of state.summoners) {
    if (commonStore.config.ignoreSelf && summoner.summonerId == commonStore.userInfo?.summonerId) {
      continue;
    }

    if (summoner.matchs.games.games.length) {
      const lastMatch = last(summoner.matchs.games.games);
      const lastStats = lastMatch?.participants[0].stats;
      await LCUClient.sendMessage(
        state.chatRoomId,
        `我方【${summoner.summoner.displayName}】鉴定为${summoner.horse.name} 上场战绩: ${lastStats?.kills}/${lastStats?.deaths}/${lastStats?.assists} 最近十场KDA: ${summoner.kda.toFixed(2)} 综合评价得分: ${summoner.score.toFixed(2)}`
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}
</script>

<template>
  <div class="p-5 min-h-inherit flex flex-col">
    <div class="flex">
      <div>
        <img :src="commonStore.userProfileIcon" class=" w-16 h-16 rounded-full border-2 border-white" />
      </div>
      <div class="ml-3 flex flex-col justify-center">
        <div class="text-base">{{ commonStore.userInfo?.displayName }}</div>
        <div class="text-xs mt-0.5">LV. {{ commonStore.userInfo?.summonerLevel }}</div>
      </div>
    </div>

    <div v-if="state.gaming">
      <n-spin v-if="state.loading" />
      <div class="mt-5">
        <h1 class="text-xl mb-4">对局玩家</h1>
        <div v-for="summoner in state.summoners" :key="summoner.summonerId" class="flex mb-5">
          <div class="mr-3">
            <img :src="summoner.avatarUrl" class="w-12 h-12 rounded-full border-2 border-white" />
          </div>
          <div class="flex flex-col justify-center">
            <div class="text-sm mb-0.5">{{ summoner.summoner.displayName }} LV. {{ summoner.summoner.summonerLevel }}
            </div>
            <div class="text-xs flex">
              <div>{{ summoner.horse.name }}</div>
              <div class="mx-1"> => </div>
              <div class="mr-2">评分: {{ summoner.score.toFixed(2) }} KDA: {{ summoner.kda.toFixed(2) }}</div>
              <div class="mr-2">单双段位: {{ LCUClient.getRankName(summoner.rankedStats.queueMap.RANKED_SOLO_5x5.tier) }}
              </div>
              <div class="mr-2">灵活段位: {{ LCUClient.getRankName(summoner.rankedStats.queueMap.RANKED_FLEX_SR.tier) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="flex flex-1 items-center justify-center">
      <div class="pb-5 text-base">当前不在对局中</div>
    </div>
  </div>
</template>
