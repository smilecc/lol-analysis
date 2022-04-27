<script lang="ts" setup>
import { useCommonStore } from '@/stores';
import { app } from '@tauri-apps/api';
import { NAnchor, NAnchorLink } from 'naive-ui';
import { onBeforeMount, reactive } from 'vue';

const commonStore = useCommonStore();
const state = reactive({
  version: '',
});

onBeforeMount(async () => {
  state.version = await app.getVersion();
});
</script>

<template>
  <div class="flex">
    <div class="bg-zinc-800 min-h-screen pt-6 px-4">
      <n-anchor :bound="30">
        <n-anchor-link title="应用设定" href="#应用设定" />
        <n-anchor-link title="关于" href="#关于" />

      </n-anchor>
    </div>

    <div class="ml-5 pb-10 h-screen w-full overflow-scroll overflow-x-hidden">
      <div class="pt-5" id="应用设定">
        <h1>应用设定</h1>
        <div class="h-screen"></div>
      </div>

      <div class="pt-5" id="关于">
        <h1>关于</h1>
        <div>
          <h2>应用版本</h2>
          <div class="text-xs">v{{ state.version }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
h1 {
  @apply text-xl mb-3;
}

h2 {
  @apply text-sm text-zinc-300 mb-1;
}

div {
  @apply text-xs text-zinc-200;
}
</style>
