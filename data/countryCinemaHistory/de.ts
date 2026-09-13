import type { CountryCinemaHistory } from "@/types/cinema";
import { germanyStage1 } from "./de-stage-1";
import { germanyStage2 } from "./de-stage-2";
import { germanyStage3 } from "./de-stage-3";
import { germanyStage4 } from "./de-stage-4";
import { germanyStage5 } from "./de-stage-5";
import { germanyStage6 } from "./de-stage-6";
import { germanyStage7 } from "./de-stage-7";
import { germanyStage8 } from "./de-stage-8";

export const germanyCinemaHistory: CountryCinemaHistory = {
  countryCode: "de",
  contentStatus: "curated",
  introduction: "德国电影从早期活动影像与帝国时期制片工业出发，经历魏玛电影、纳粹电影体制、战后废墟电影、两德分化、新德国电影、统一后的身份重构以及数字平台时代，持续围绕历史记忆、社会制度与电影语言展开创新。",
  stages: [
    germanyStage1,
    germanyStage2,
    germanyStage3,
    germanyStage4,
    germanyStage5,
    germanyStage6,
    germanyStage7,
    germanyStage8,
  ],
};
