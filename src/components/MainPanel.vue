<script setup lang="ts">
import { LCUEventHandler } from '@/lcu';
import { useCommonStore } from '@/stores';
import { onBeforeMount, reactive, ref } from 'vue';

const commonStore = useCommonStore();
const eventHandler = ref(new LCUEventHandler());

onBeforeMount(() => {
  eventHandler.value.startListen(['onSelectSession']);
  eventHandler.value.on('onSelectSession', (event) => {
    console.log('onSelectSession', event);
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
