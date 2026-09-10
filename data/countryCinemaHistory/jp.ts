import type { CountryCinemaHistory } from "@/types/cinema";
import { japanStage1 } from "./jp-stage-1";
import { japanStage2 } from "./jp-stage-2";
import { japanStage3 } from "./jp-stage-3";
import { japanStage4 } from "./jp-stage-4";
import { japanStage5 } from "./jp-stage-5";
import { japanStage6 } from "./jp-stage-6";
import { japanStage7 } from "./jp-stage-7";
import { japanStage8 } from "./jp-stage-8";
import { japanStage9 } from "./jp-stage-9";

export const japanCinemaHistory: CountryCinemaHistory = {
  countryCode: "jp",
  contentStatus: "curated",
  introduction: "日本电影从活动写真传入、默片语言成熟和有声化，经历战时统制、战后重建与制片厂黄金时代，并在产业转型、动画国际化、数字媒介和流媒体发展中延续至今。",
  stages: [
    japanStage1,
    japanStage2,
    japanStage3,
    japanStage4,
    japanStage5,
    japanStage6,
    japanStage7,
    japanStage8,
    japanStage9,
  ],
};
