import type { CountryCinemaHistory } from "@/types/cinema";
import { indiaStage1 } from "./in-stage-1";
import { indiaStage2 } from "./in-stage-2";
import { indiaStage3 } from "./in-stage-3";
import { indiaStage4 } from "./in-stage-4";
import { indiaStage5 } from "./in-stage-5";
import { indiaStage6 } from "./in-stage-6";
import { indiaStage7 } from "./in-stage-7";
import { indiaStage8 } from "./in-stage-8";
import { indiaStage9 } from "./in-stage-9";

export const indiaCinemaHistory: CountryCinemaHistory = {
  countryCode: "in",
  contentStatus: "curated",
  introduction: "印度电影从殖民时期的巡回放映与本土影像实践出发，经历无声长片、有声制片厂、独立建国后的经典电影、平行电影、综合娱乐片、全球化宝莱坞、区域产业崛起以及流媒体与泛印度电影时代，形成多语言、多中心的电影文化。",
  stages: [
    indiaStage1,
    indiaStage2,
    indiaStage3,
    indiaStage4,
    indiaStage5,
    indiaStage6,
    indiaStage7,
    indiaStage8,
    indiaStage9,
  ],
};
