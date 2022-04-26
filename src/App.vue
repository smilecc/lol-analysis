<script setup lang="ts">
import { onBeforeMount, reactive, watch } from 'vue';
// import { Base64 } from 'js-base64';
import { useCommonStore } from './stores';
import { darkTheme, NConfigProvider, NSpin } from 'naive-ui';
import { LCUClient } from './lcu';
import MainPanel from '@/components/MainPanel.vue';

const state = reactive({});
const commonStore = useCommonStore();

async function initData() {
  console.log('更新客户端数据');
  if (commonStore.lcuClientInfo.processId == 0) {
    commonStore.userInfo = undefined;
    commonStore.userProfileIcon = '';
    return;
  }

  commonStore.loading = true;
  try {
    // 加载用户信息
    const { data: userInfo } = await LCUClient.getUserInfo();
    commonStore.userInfo = userInfo;

    // 加载用户图标
    const { data: iconArray } = await LCUClient.getProfileIcon(userInfo.profileIconId);
    commonStore.userProfileIcon = LCUClient.arrayToBlobUrl(iconArray);
  } finally {
    commonStore.loading = false;
  }
}

watch(() => commonStore.lcuClientInfo.processId, initData);

onBeforeMount(() => {
  commonStore.subscribeLCUCommand();
});
</script>

<template>
  <n-config-provider :theme="darkTheme">
    <n-spin :show="commonStore.loading" description="正在加载数据">
      <div class="min-h-screen bg-zinc-900">
        <div v-if="!commonStore.loading">
          <div v-if="commonStore.userInfo">
            <main-panel />
          </div>
          <div v-else class="flex flex-col items-center justify-center min-h-screen">
            <div class="text-lg">未检测到《英雄联盟》客户端</div>
            <div class="text-sm mt-3">请先启动客户端</div>
          </div>
        </div>
      </div>
    </n-spin>
  </n-config-provider>
</template>

<style>
@font-face {
  font-family: sy-regular;
  src: url(/sy-regular.ttf);
}

#app {
  color: #fff;
  font-family: sy-regular, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
</style>
