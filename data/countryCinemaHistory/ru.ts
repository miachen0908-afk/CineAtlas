import type { CountryCinemaHistory } from "@/types/cinema";
import { russiaStage1 } from "./ru-stage-1";
import { russiaStage2 } from "./ru-stage-2";
import { russiaStage3 } from "./ru-stage-3";
import { russiaStage4 } from "./ru-stage-4";
import { russiaStage5 } from "./ru-stage-5";
import { russiaStage6 } from "./ru-stage-6";
import { russiaStage7 } from "./ru-stage-7";
import { russiaStage8 } from "./ru-stage-8";
import { russiaStage9 } from "./ru-stage-9";
import { russiaStage10 } from "./ru-stage-10";

export const russiaCinemaHistory: CountryCinemaHistory = {
  countryCode: "ru",
  contentStatus: "curated",
  introduction: "俄罗斯电影从帝俄时期的早期放映与民族制片出发，经历苏联蒙太奇先锋、社会主义现实主义、战争动员、电影解冻、作者电影、改革与公开性、后苏联产业重建以及平台化和战争环境下的产业重组，持续连接历史记忆、国家制度与电影语言。",
  stages: [
    russiaStage1,
    russiaStage2,
    russiaStage3,
    russiaStage4,
    russiaStage5,
    russiaStage6,
    russiaStage7,
    russiaStage8,
    russiaStage9,
    russiaStage10,
  ],
};
