import type { CountryCinemaHistory } from "@/types/cinema";
import { franceStage1 } from "./fr-stage-1";
import { franceStage2 } from "./fr-stage-2";
import { franceStage3 } from "./fr-stage-3";
import { franceStage4 } from "./fr-stage-4";
import { franceStage5 } from "./fr-stage-5";
import { franceStage6 } from "./fr-stage-6";
import { franceStage7 } from "./fr-stage-7";
import { franceStage8 } from "./fr-stage-8";
import { franceStage9 } from "./fr-stage-9";
import { franceStage10 } from "./fr-stage-10";

export const franceCinemaHistory: CountryCinemaHistory = {
  countryCode: "fr",
  contentStatus: "curated",
  introduction: "法国电影从活动影像的诞生与早期制片工业出发，经历默片先锋、诗意现实主义、占领时期、战后电影制度、新浪潮、政治电影、视听产业重组及平台化转型，持续影响电影语言、作者观念与公共文化政策。",
  stages: [
    franceStage1,
    franceStage2,
    franceStage3,
    franceStage4,
    franceStage5,
    franceStage6,
    franceStage7,
    franceStage8,
    franceStage9,
    franceStage10,
  ],
};
