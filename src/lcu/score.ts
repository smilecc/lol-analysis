import { LCUClient } from ".";
import { first, last } from "lodash";
import evaluate from "static-eval";
import * as esprima from "esprima";
import { IHorse, useCommonStore } from "@/stores";

export class GameScoreCalculator {
  game: LCUClient.Game | null = null;
  stats: LCUClient.Stats | null = null;
  timeline: LCUClient.Timeline | null = null;
  kda: number = 0;
  expression: string | null = null;

  constructor(game: LCUClient.Game) {
    this.game = game;
    const participant = first(game.participants)!;
    this.stats = participant.stats;
    this.timeline = participant.timeline;
    this.kda =
      ((participant.stats.kills + participant.stats.assists) /
        (participant.stats.deaths || 1)) *
      3;
  }

  static build(
    game: LCUClient.Game,
    expression: string | null = null
  ): GameScoreCalculator {
    const calculator = new GameScoreCalculator(game);
    calculator.expression = expression;
    return calculator;
  }

  getExpression() {
    if (this.expression) {
      return this.expression;
    }

    const commonStore = useCommonStore();
    return commonStore.config.scoreExpression;
  }

  getEnv() {
    return {
      WIN: this.stats?.win,
      KILLS: this.stats?.kills,
      ASSISTS: this.stats?.assists,
      DEATHS: this.stats?.deaths,
      VISION_SCORE: this.stats?.visionScore,
      KDA: this.kda,
      FIRST_BOOLD: this.stats?.firstBloodKill,
      FIRST_TOWER: this.stats?.firstTowerKill,
      MINIONS_KILLS:
        this.stats!.totalMinionsKilled + this.stats!.neutralMinionsKilled,
      DAMAGE: this.stats?.totalDamageDealtToChampions,
      GLOD: this.stats?.goldEarned,
      TIME_MINUTE: this.game!.gameDuration / 60,
      TIME_SECOND: this.game!.gameDuration,
      IS_SUPPORT: this.timeline?.role == "DUO_SUPPORT",
    };
  }

  protected calcScore(value: number, maxValue: number, maxScore: number) {
    const current = Math.min(value, maxValue);
    return (current / maxScore) * maxScore;
  }

  calc(): number {
    const ast = esprima.parseScript(this.getExpression()).body[0];
    const expression = (ast as any).expression;
    const env = this.getEnv();

    const otherEnv: Record<string, any> = {};
    for (const key in this.stats) {
      otherEnv[`_${key}`] = (this.stats as any)[key];
    }

    const score = evaluate(expression, {
      ...env,
      ...otherEnv,
      sif: (condition: boolean, onTrue: number, onFalse = 0) =>
        condition ? onTrue : onFalse,
      score: this.calcScore,
    });

    return score;
  }

  static calcHorse(horseConfig: IHorse[], score: number) {
    const horses = horseConfig.sort((l, r) => l.score - r.score);
    const horse = horses.find((it) => it.score >= score);
    if (!horse) {
      return last(horses)!;
    } else {
      return horse;
    }
  }
}
