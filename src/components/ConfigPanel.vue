<script lang="ts" setup>
import { GameScoreCalculator, SCORE_TEST_DATAS } from '@/lcu';
import { IConfig, useCommonStore } from '@/stores';
import { app } from '@tauri-apps/api';
import { mean } from 'lodash';
import { NButton, NAnchor, NAnchorLink, NInput, NInputNumber, NList, NListItem, NIcon, NDataTable, NFormItem, NSwitch } from 'naive-ui';
import { CheckmarkSharp, CloseSharp } from '@vicons/ionicons5';
import { onBeforeMount, reactive, watch, h } from 'vue';
import { TableColumns } from 'naive-ui/lib/data-table/src/interface';

const commonStore = useCommonStore();
const state = reactive({
  savePanelVisible: false,
  ignoreNextConfigChange: false,
  version: '',
  config: JSON.parse(JSON.stringify(commonStore.config)) as IConfig,
  testScores: [] as string[],
  scoreSuccess: null as boolean | null,
});

/**
 * 保存配置
 */
function saveConfig() {
  commonStore.setConfig(state.config);
  state.savePanelVisible = false;
}

/**
 * 取消配置
 */
function cancelConfig() {
  state.ignoreNextConfigChange = true;
  state.config = JSON.parse(JSON.stringify(commonStore.config));
  state.savePanelVisible = false;
}

/**
 * 模拟计算分数
 */
function testEvaluate() {
  state.testScores = [];
  const scores: number[] = [];
  try {
    SCORE_TEST_DATAS.games.games.forEach(game => {
      const calculator = GameScoreCalculator.build(game, state.config.scoreExpression);
      const score = calculator.calc();
      scores.push(score);
      state.testScores.unshift(`测试得分: ${score} 数据: ${JSON.stringify(calculator.getEnv())}`);
      console.log('测试得分', score, calculator.getEnv());
    })

    const score = mean(scores);
    const horse = GameScoreCalculator.calcHorse(state.config.horses, score);
    state.testScores.unshift(`平均得分 ${score} 鉴定为【${horse?.name}】`);
    state.scoreSuccess = true;
  } catch (e) {
    state.testScores.push(`计算错误 ${JSON.stringify(e)}`);
    state.scoreSuccess = false;
    console.error(e);
  }
}

// 监听配置项变化
watch(() => ({ ...state.config }), () => {
  if (state.ignoreNextConfigChange) {
    state.ignoreNextConfigChange = false;
    return;
  }
  state.savePanelVisible = true;
}, { deep: true });

onBeforeMount(async () => {
  state.version = await app.getVersion();
});


const HorseColumns: TableColumns = [
  {
    title: '名称',
    key: 'name',
    render(row, index) {
      return h(NInput as any, {
        value: row.name,
        onUpdateValue(v: string) {
          state.config.horses[index].name = v
        }
      })
    }
  },
  {
    title: '分数',
    key: 'score',
    render(row, index) {
      return h(NInputNumber as any, {
        value: row.score,
        onUpdateValue(v: number) {
          state.config.horses[index].score = v
        }
      })
    }
  },

];
</script>

<template>
  <transition name="fade">
    <div class="fixed rounded-md bottom-5 left-5 right-5 bg-zinc-700 p-3 flex justify-between items-center z-50"
      v-if="state.savePanelVisible">
      <div class="!text-sm">您修改了配置，是否要保存？</div>
      <div>
        <n-button secondary class="!mr-2" @click="cancelConfig">取消</n-button>
        <n-button type="primary" @click="saveConfig">保存设定</n-button>
      </div>
    </div>
  </transition>

  <div class="flex">
    <div class="bg-zinc-800 min-h-screen pt-6 px-4">
      <n-anchor :bound="30">
        <n-anchor-link title="应用设定" href="#应用设定">
          <n-anchor-link title="基础设定" href="#基础设定" />
          <n-anchor-link title="马匹称号" href="#马匹称号" />
          <n-anchor-link title="评分计算" href="#评分计算" />
        </n-anchor-link>
        <n-anchor-link title="关于" href="#关于" />
      </n-anchor>
    </div>

    <div class="ml-5 pb-10 pr-5 h-screen w-full overflow-scroll overflow-x-hidden">
      <div class="pt-5" id="应用设定">
        <h1>应用设定</h1>
        <div id="基础设定">
          <h2>基础设定</h2>
          <div class="title-summary">应用的基础开关设定</div>
          <n-form-item label="是否发送马匹信息">
            <n-switch v-model:value="state.config.sendHorseMessage" />
          </n-form-item>
          <n-form-item label="是否忽略自己的马匹信息">
            <n-switch v-model:value="state.config.ignoreSelf" />
          </n-form-item>
        </div>
        <div id="马匹称号">
          <h2>马匹称号</h2>
          <div class="title-summary">马匹称号与分数配置</div>

          <n-data-table :columns="HorseColumns" :data="state.config.horses" />
        </div>
        <div id="评分计算">
          <h2>评分计算公式</h2>
          <div class="title-summary">自定义评分计算公式</div>

          <n-input type="textarea" placeholder="请输入评分计算公式" v-model:value="state.config.scoreExpression" />
          <div class="mt-2">
            <n-button @click="testEvaluate" icon-placement="right" class="!mr-2">
              模拟计算
              <template #icon>
                <n-icon v-if="state.scoreSuccess !== null">
                  <checkmark-sharp v-if="state.scoreSuccess" />
                  <close-sharp v-else />
                </n-icon>
              </template>
            </n-button>
            <n-button v-if="state.testScores.length" @click="state.testScores = []">清除结果</n-button>
          </div>

          <n-list bordered class="mt-2" v-if="state.testScores.length">
            <n-list-item v-for="(item, index) in state.testScores" :key="index">
              <div class="break-all">{{ item }}</div>
            </n-list-item>
          </n-list>
        </div>
      </div>

      <div class="pt-5" id="关于">
        <h1>关于</h1>
        <div>
          <h2>应用版本</h2>
          <div class="text-xs">v{{ state.version }}</div>
          <div class="bottom-space"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
h1 {
  @apply text-3xl mb-0;
}

h2 {
  @apply text-lg text-zinc-300 mb-1 pt-4;
}

div {
  @apply text-xs text-zinc-200;
}

.title-summary {
  @apply  !text-xs !text-zinc-300 mb-5;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.bottom-space {
  height: 50vh;
}
</style>
