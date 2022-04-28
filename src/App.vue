<script setup lang="ts">
import { onBeforeMount, reactive, watch, computed } from 'vue';
// import { Base64 } from 'js-base64';
import { useCommonStore } from './stores';
import { darkTheme, NConfigProvider, NSpin, NIcon, NTooltip } from 'naive-ui';
import { SettingsSharp, CloseSharp } from '@vicons/ionicons5';
import { LCUClient } from './lcu';
import MainPanel from '@/components/MainPanel.vue';
import ConfigPanel from '@/components/ConfigPanel.vue';
import { lcuRequest, retry } from '@/utils';

const state = reactive({});
const commonStore = useCommonStore();

async function initData() {
  console.log('更新客户端数据');
  if (commonStore.lcuClientInfo.processId == 0) {
    commonStore.userInfo = undefined;
    commonStore.userProfileIcon = '';
    commonStore.loading = false;
    return;
  }

  commonStore.loading = true;
  retry(async (next) => {
    // 加载用户信息
    const { data: userInfo } = await LCUClient.getCurrentSummoner();
    if (!userInfo || !userInfo.displayName) {
      next();
      return;
    }

    commonStore.userInfo = userInfo;

    // 加载用户图标
    const { data: iconArray } = await LCUClient.getProfileIcon(userInfo.profileIconId);
    commonStore.userProfileIcon = LCUClient.arrayToBlobUrl(iconArray);
  }, 2000, 20)
    .finally(() => {
      commonStore.loading = false;
      console.log('finish');
    });
}

watch(() => commonStore.lcuClientInfo.processId, initData);
const isLoading = computed(() => {
  if (commonStore.loading || !commonStore.init) {
    return true;
  }

  if (commonStore.lcuClientInfo.processId != 0 && !commonStore.userInfo) {
    return true;
  }

  return false;
});

onBeforeMount(() => {
  commonStore.subscribeLCUCommand();
  initData();
});
</script>

<template>
  <n-config-provider :theme="darkTheme">
    <n-spin :show="isLoading" description="正在加载数据">
      <div class="min-h-screen bg-zinc-900">
        <div v-if="!isLoading" v-show="commonStore.panel == 'Main'" class="min-h-inherit">
          <div v-if="commonStore.userInfo" class="min-h-inherit">
            <main-panel />
          </div>
          <div v-else class="flex flex-col items-center justify-center min-h-screen">
            <div class="text-lg">未检测到《英雄联盟》客户端</div>
            <div class="text-sm mt-3">请先启动客户端</div>
          </div>
        </div>
        <div v-show="commonStore.panel == 'Config'" class="h-full">
          <config-panel />
        </div>
      </div>
      <div class="fixed top-8 right-8">
        <n-tooltip v-if="commonStore.panel == 'Main'">
          <template #trigger>
            <n-icon color="#eee" size="20" class="cursor-pointer" @click="commonStore.panel = 'Config'">
              <settings-sharp />
            </n-icon>
          </template>
          <div>设置</div>
        </n-tooltip>
        <n-tooltip v-else-if="commonStore.panel == 'Config'">
          <template #trigger>
            <n-icon color="#eee" size="20" class="cursor-pointer" @click="commonStore.panel = 'Main'">
              <close-sharp />
            </n-icon>
          </template>
          <div>关闭</div>
        </n-tooltip>
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
  user-select: none;
}

.min-h-inherit {
  min-height: inherit;
}
</style>
