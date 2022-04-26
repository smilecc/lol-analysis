<script setup lang="ts">
import { LCUClient } from '@/lcu';
import { useCommonStore } from '@/stores';
import { Event, listen } from '@tauri-apps/api/event';
import { onBeforeMount, reactive } from 'vue';
import lodash from 'lodash';

const commonStore = useCommonStore();
const state = reactive({
  isSubscribedWS: false,
});

const onSelectSession = lodash.debounce((event: LCUClient.IWSEevent) => {
  console.warn('获取到对局会话', event);
  const roomId = (event.data.chatDetails.chatRoomName as string).split('@')[0];
  LCUClient.getRoomMessages(roomId);
}, 2 * 1000);

const onGameStart = lodash.debounce((event: LCUClient.IWSEevent) => {
  console.warn('对局开始', event);
}, 2 * 1000);

function listenWS() {
  if (state.isSubscribedWS) {
    return;
  }
  state.isSubscribedWS = true;

  listen('on-ws', (e: Event<string>) => {
    const [, , payload] = JSON.parse(e.payload);
    const event = payload as LCUClient.IWSEevent;

    if (event.uri == '/lol-champ-select-legacy/v1/implementation-active' && event.data) {
      onGameStart(event);
    }

    if (event.uri == '/lol-champ-select/v1/session' && event.eventType == 'Update') {
      onSelectSession(event);
    }
  });
}

onBeforeMount(() => {
  listenWS();
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
