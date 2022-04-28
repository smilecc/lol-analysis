# 评分机制

在默认情况下，本软件的评分机制如下：

```
KDA + 获胜加2分 + 一血加2分 + 一塔加2分 + 辅助加5分 + 视野得分（视野得分100分记满分5分） + 分钟补刀（平均分钟补刀12刀记满分5分） + 伤害转化率乘1.5
```

## 自定义评分公式

如果您觉得该评分公式无法满足您的需求，本软件支持在设置界面自定义评分公式。

默认评分公式为：

```
KDA + sif(WIN, 2) + sif(FIRST_BOOLD, 2) + sif(FIRST_TOWER, 2) + score(VISION_SCORE, 100, 5) + score(MINIONS_KILLS / TIME_MINUTE, 12, 5) + (DAMAGE / GLOD * 1.5) + sif(IS_SUPPORT, 5)
```

### 可用的函数

#### sif

该函数起到替代三目运算符的作用，当条件成立时，返回`trueValue`，否则返回`falseValue`。

```
function(condition: boolean, trueValue: number, falseValue: number): number
```

#### score

该函数用于对某个计分项目进行评分，具体实现如下。

```js
score(value: number, maxValue: number, maxScore: number) {
    const current = Math.min(value, maxValue);
    return (current / maxScore) * maxScore;
}
```

以分钟补刀为例 `score(MINIONS_KILLS / TIME_MINUTE, 12, 5)` 为例，参数1计算游戏实际分钟补刀数，参数2给出满分（为每分钟12个补刀），参数3为该项总分。

如某一对局，玩家每分钟补刀6个，则实际记2.5分。

### 可用的环境变量

以下环境变量除特殊标注类型以外，均为`number`。

- WIN: bool 是否获胜
- KILLS: 击杀数量
- ASSISTS: 助攻数量
- DEATHS: 死亡数量
- VISION_SCORE: 视野得分
- KDA: 战损比，计算公式为 (击杀 + 助攻) / 死亡 \* 3
- FIRST_BOOLD: bool 是否取得一血
- FIRST_TOWER: bool 是否取得一塔
- MINIONS_KILLS: 补刀数量
- DAMAGE: 总伤害量（对英雄）
- GLOD: 金币数量
- TIME_MINUTE: 游戏时长（分钟）
- TIME_SECOND: 游戏时长（秒）
- IS_SUPPORT: 是否为辅助位置

以上数据均为程序基础定义，除以上数据以外，我还提供了在公式中使用原始对局数据，只需在原始数据的键名前加`_`即可使用原始字段，例如下面的演示数据中的`assists`，在公式中使用`_assists`即可获取到该数据。

以下为一场对局的原始状态数据，字段很多，我也没有全部吃透，需要您自行理解字段含义。

```js
{
  assists: 7,
  causedEarlySurrender: false,
  champLevel: 12,
  combatPlayerScore: 0,
  damageDealtToObjectives: 1362,
  damageDealtToTurrets: 0,
  damageSelfMitigated: 5545,
  deaths: 10,
  doubleKills: 0,
  earlySurrenderAccomplice: false,
  firstBloodAssist: false,
  firstBloodKill: false,
  firstInhibitorAssist: false,
  firstInhibitorKill: false,
  firstTowerAssist: false,
  firstTowerKill: false,
  gameEndedInEarlySurrender: false,
  gameEndedInSurrender: true,
  goldEarned: 7980,
  goldSpent: 7800,
  inhibitorKills: 0,
  item0: 6672,
  item1: 3094,
  item2: 3006,
  item3: 1018,
  item4: 0,
  item5: 0,
  item6: 3340,
  killingSprees: 1,
  kills: 3,
  largestCriticalStrike: 309,
  largestKillingSpree: 2,
  largestMultiKill: 1,
  longestTimeSpentLiving: 368,
  magicDamageDealt: 2652,
  magicDamageDealtToChampions: 1029,
  magicalDamageTaken: 4201,
  neutralMinionsKilled: 8,
  neutralMinionsKilledEnemyJungle: 0,
  neutralMinionsKilledTeamJungle: 5,
  objectivePlayerScore: 0,
  participantId: 0,
  pentaKills: 0,
  perk0: 8008,
  perk0Var1: 15,
  perk0Var2: 2,
  perk0Var3: 0,
  perk1: 8009,
  perk1Var1: 1137,
  perk1Var2: 0,
  perk1Var3: 0,
  perk2: 9103,
  perk2Var1: 0,
  perk2Var2: 0,
  perk2Var3: 0,
  perk3: 8014,
  perk3Var1: 150,
  perk3Var2: 0,
  perk3Var3: 0,
  perk4: 8304,
  perk4Var1: 9,
  perk4Var2: 4,
  perk4Var3: 5,
  perk5: 8345,
  perk5Var1: 3,
  perk5Var2: 0,
  perk5Var3: 0,
  perkPrimaryStyle: 8000,
  perkSubStyle: 8300,
  physicalDamageDealt: 55726,
  physicalDamageDealtToChampions: 9470,
  physicalDamageTaken: 14186,
  playerScore0: 0,
  playerScore1: 0,
  playerScore2: 0,
  playerScore3: 0,
  playerScore4: 0,
  playerScore5: 0,
  playerScore6: 0,
  playerScore7: 0,
  playerScore8: 0,
  playerScore9: 0,
  quadraKills: 0,
  sightWardsBoughtInGame: 0,
  teamEarlySurrendered: false,
  timeCCingOthers: 10,
  totalDamageDealt: 61411,
  totalDamageDealtToChampions: 11239,
  totalDamageTaken: 19262,
  totalHeal: 2836,
  totalMinionsKilled: 90,
  totalPlayerScore: 0,
  totalScoreRank: 0,
  totalTimeCrowdControlDealt: 51,
  totalUnitsHealed: 4,
  tripleKills: 0,
  trueDamageDealt: 3032,
  trueDamageDealtToChampions: 740,
  trueDamageTaken: 874,
  turretKills: 0,
  unrealKills: 0,
  visionScore: 13,
  visionWardsBoughtInGame: 0,
  wardsKilled: 1,
  wardsPlaced: 8,
  win: false,
}
```
