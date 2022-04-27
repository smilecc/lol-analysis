<script setup lang="ts">
import { LCUEventHandler, LCUClient, ILCUEventHandlerEvent } from '@/lcu';
import { useCommonStore } from '@/stores';
import { onBeforeMount, reactive, ref } from 'vue';

const commonStore = useCommonStore();
const eventHandler = ref(new LCUEventHandler());

onBeforeMount(() => {
  eventHandler.value.startListen([]);

  eventHandler.value.on('onSelectSession', async (event: ILCUEventHandlerEvent<LCUClient.IRoomMessage[]>) => {
    console.log('onSelectSession', event);
    const joindMessages = event.data.filter(it => it.type == "system" && it.body == "joined_room");
    // 查询对局玩家信息
    const { data: summoners } = await LCUClient.listSummoners(joindMessages.map(it => it.fromSummonerId));
    // 查询对局玩家头像
    const summonerIcons = await Promise.all(summoners.map(summoner => {
      // LCUClient.listMatchsBySummonerId(summoner.accountId);
      LCUClient.listMatchsByPuuid(summoner.puuid);
      return LCUClient
        .getProfileIcon(summoner.profileIconId)
        .then(res => {
          return {
            url: LCUClient.arrayToBlobUrl(res.data),
            summoner,
            summonerId: summoner.accountId,
          }
        })
    }));

    
  });
});
</script>

<template>
  <div class="p-5">
    <div class="flex">
      <div>
        <img :src="commonStore.userProfileIcon" class=" w-16 h-16 rounded-full border-2 border-white" />
      </div>
      <div class="ml-3 flex flex-col justify-center">
        <div class="text-base">{{ commonStore.userInfo?.displayName }}</div>
        <div class="text-xs mt-0.5">LV. {{ commonStore.userInfo?.summonerLevel }}</div>
      </div>
    </div>
  </div>
</template>
