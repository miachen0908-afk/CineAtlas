import type { CountryCinemaHistory } from "@/types/cinema";
import { usStage1 } from "./us-stage-1";
import { usStage2 } from "./us-stage-2";
import { usStage3 } from "./us-stage-3";
import { usStage4 } from "./us-stage-4";
import { usStage5 } from "./us-stage-5";
import { usStage6 } from "./us-stage-6";
import { usStage7 } from "./us-stage-7";
import { usStage8 } from "./us-stage-8";
import { usStage9 } from "./us-stage-9";
import { usStage10 } from "./us-stage-10";

export const unitedStatesCinemaHistory: CountryCinemaHistory = {
  countryCode: "us",
  contentStatus: "curated",
  introduction: "美国电影从早期活动影像和镍币影院出发，经历制片厂体系、有声革命、电视冲击、新好莱坞、大片工业、数字化与流媒体平台化，持续塑造全球电影生产与观看方式。",
  stages: [
    usStage1,
    usStage2,
    usStage3,
    usStage4,
    usStage5,
    usStage6,
    usStage7,
    usStage8,
    usStage9,
    usStage10,
  ],
};
