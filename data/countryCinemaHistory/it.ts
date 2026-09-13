import type { CountryCinemaHistory } from "@/types/cinema";
import { italyStage1 } from "./it-stage-1";
import { italyStage2 } from "./it-stage-2";
import { italyStage3 } from "./it-stage-3";
import { italyStage4 } from "./it-stage-4";
import { italyStage5 } from "./it-stage-5";
import { italyStage6 } from "./it-stage-6";
import { italyStage7 } from "./it-stage-7";
import { italyStage8 } from "./it-stage-8";

export const italyCinemaHistory: CountryCinemaHistory = {
  countryCode: "it",
  contentStatus: "curated",
  introduction: "意大利电影从早期默片史诗出发，经历法西斯电影体制、新现实主义、作者电影与类型工业黄金时代、电视冲击、产业重组及平台化转型，持续在现实主义传统、地域文化与跨国生产之间发展。",
  stages: [
    italyStage1,
    italyStage2,
    italyStage3,
    italyStage4,
    italyStage5,
    italyStage6,
    italyStage7,
    italyStage8,
  ],
};
