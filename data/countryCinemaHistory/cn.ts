import type { CountryCinemaHistory } from "@/types/cinema";
import { chinaSecondStage } from "./cn-second-stage";
import { chinaThirdStage } from "./cn-third-stage";
import { chinaFourthStage } from "./cn-fourth-stage";
import { chinaFifthStage } from "./cn-fifth-stage";
import { chinaSixthStage } from "./cn-sixth-stage";
import { chinaSeventhStage } from "./cn-seventh-stage";
import { chinaEighthStage } from "./cn-eighth-stage";
import { chinaNinthStage } from "./cn-ninth-stage";
import { chinaTenthIndustrializationStage } from "./cn-tenth-industrialization-stage";
import { chinaTenthDigitalStage } from "./cn-tenth-digital-stage";
import { chinaTenthPlatformStage } from "./cn-tenth-platform-stage";

export const chinaCinemaHistory: CountryCinemaHistory = {
  countryCode: "cn",
  contentStatus: "curated",
  contentNotice:
    "本页面分期综合参考多种中国电影史著述，用于教学与浏览。不同研究者对部分阶段的起止年份和命名存在不同认识。",
  introduction:
    "中国电影史的阶段、事件、影片与人物档案将沿同一条纵向时间轴持续整理。当前已建立正式断代框架，具体内容仍待逐阶段校订补充。",
  stages: [
    {
      id: "introduction-and-early-exploration",
      title: "电影传入与早期探索",
      shortTitle: "早期探索",
      yearStart: 1896,
      yearEnd: 1922,
      yearLabel: "1896—1922",
      summary:
        "19世纪末，电影随上海租界商业娱乐和近代都市文化传入中国，最初被称为“西洋影戏”。此后，中国照相师、戏剧工作者和出版机构开始尝试摄制电影，内容从戏曲记录逐渐扩展到故事短片和社会题材。1921年前后，长故事片集中出现；1922年明星影片公司成立，中国电影开始走向较稳定的公司化生产。",
      events: [
        {
          id: "film-arrives-in-china-1896",
          year: 1896,
          title: "电影传入中国",
          description:
            "上海徐园“又一村”出现有记录的电影放映。电影当时被称为“西洋影戏”，常与戏曲、杂技等节目共同演出。",
          type: "historical",
        },
        {
          id: "independent-filmmaking-begins-1905",
          year: 1905,
          title: "中国人开始自主摄制电影",
          description:
            "北京丰泰照相馆经营者任庆泰邀请京剧演员谭鑫培，拍摄京剧《定军山》的部分表演。这部影片通常被视为中国人自主摄制电影的开端。",
          type: "film",
          archiveFilms: [
            {
              id: "ding-jun-shan-1905",
              title: "定军山",
              genre: "戏曲记录片",
              credits: [
                { role: "摄制", name: "任庆泰" },
                { role: "主演", name: "谭鑫培" },
              ],
              synopsis: "记录谭鑫培表演京剧《定军山》的部分武打和舞蹈场面。",
              significance:
                "中国人自主摄制电影的重要开端，体现早期电影与传统戏曲的紧密联系。",
            },
          ],
        },
        {
          id: "early-film-company-1909",
          year: 1909,
          title: "早期电影公司出现",
          description:
            "亚细亚影戏公司在上海开展电影摄制和经营活动，为中国早期电影工作者提供设备和商业条件。",
          type: "industry",
        },
        {
          id: "story-short-films-emerge-1913",
          year: 1913,
          title: "故事短片开始形成",
          description:
            "张石川、郑正秋与亚细亚影戏公司合作摄制《难夫难妻》，将文明戏和社会讽刺引入电影叙事。",
          type: "film",
          archiveFilms: [
            {
              id: "the-difficult-couple-1913",
              title: "难夫难妻",
              genre: "家庭伦理片",
              credits: [
                { role: "编剧", name: "郑正秋" },
                { role: "导演", name: "张石川、郑正秋" },
              ],
              synopsis: "一对互不相识的男女，在家庭安排下完成包办婚姻。",
              significance:
                "中国早期故事短片代表，开启电影关注婚姻和家庭伦理的传统。",
            },
          ],
        },
        {
          id: "publishing-industry-enters-film-1917",
          year: 1917,
          endYear: 1918,
          title: "出版机构进入电影业",
          description:
            "商务印书馆开始开展电影业务，随后成立活动影戏部，摄制新闻、风景、教育和戏曲等不同类型的影片。",
          type: "industry",
        },
        {
          id: "feature-films-concentrated-1921",
          year: 1921,
          title: "长故事片集中出现",
          description:
            "中国电影开始由短片向长篇故事叙事发展，《阎瑞生》《海誓》《红粉骷髅》等影片相继问世。",
          type: "film",
          archiveFilms: [
            {
              id: "yan-ruisheng-1921",
              title: "阎瑞生",
              genre: "犯罪片",
              credits: [{ role: "导演", name: "任彭年" }],
              synopsis:
                "根据上海真实案件改编，讲述阎瑞生谋财害命并最终被捕的故事。",
              significance: "中国早期长故事片和新闻事件改编电影代表。",
            },
            {
              id: "sea-oath-1921",
              title: "海誓",
              genre: "爱情片",
              credits: [
                { role: "导演", name: "但杜宇" },
                { role: "主演", name: "殷明珠" },
              ],
              synopsis: "围绕青年男女的爱情波折展开，表现对自由爱情的追求。",
              significance: "推动爱情题材和中国早期电影明星文化的发展。",
            },
            {
              id: "pink-skeleton-1921",
              title: "红粉骷髅",
              genre: "侦探片",
              credits: [{ role: "导演", name: "管海峰" }],
              synopsis: "围绕犯罪、侦查和神秘事件展开悬念故事。",
              significance: "体现中国早期电影对侦探类型和商业叙事的探索。",
            },
          ],
        },
        {
          id: "mingxing-film-company-founded-1922",
          year: 1922,
          title: "明星影片公司成立",
          description:
            "张石川、郑正秋、周剑云等人在上海创办明星影片公司，中国电影开始由临时摄制走向较稳定的公司化生产。同年，明星公司摄制《劳工之爱情》。",
          type: "industry",
          archiveFilms: [
            {
              id: "labourers-love-1922",
              title: "劳工之爱情",
              genre: "爱情喜剧",
              credits: [
                { role: "导演", name: "张石川" },
                { role: "主演", name: "郑鹧鸪、余瑛" },
              ],
              synopsis:
                "木匠郑木匠利用活动楼梯帮助医生增加病人，最终赢得医生女儿的爱情。",
              significance:
                "中国早期爱情喜剧代表，也是现存较完整的中国早期故事片。",
            },
          ],
        },
      ],
      representativeFilmIds: [],
      representativePersonIds: [],
    },
    chinaSecondStage,
    chinaThirdStage,
    chinaFourthStage,
    chinaFifthStage,
    chinaSixthStage,
    chinaSeventhStage,
    chinaEighthStage,
    chinaNinthStage,
    {
      id: "industrialization-and-digital-era",
      title: "产业化与数字时代",
      shortTitle: "新世纪",
      yearStart: 2000,
      yearEnd: null,
      yearLabel: "2000—至今",
      summary:
        "2000年至今：中国电影的产业化、数字化与平台化\n2000年以来，中国电影完成了从产业化起步到数字化扩张，再到工业深化与平台融合的转变。\n2002年前后，院线制改革与《英雄》的成功开启“大片时代”，资本、明星、营销和规模化发行成为电影产业的重要力量。2010年代，数字放映、影院扩张和互联网购票推动市场高速增长，《泰囧》《战狼2》《我不是药神》等影片显示喜剧、新主流和现实题材均具备巨大市场潜力，《流浪地球》《哪吒之魔童降世》则推动科幻与动画进入工业化阶段。\n2020年以来，疫情加速电影与网络平台的关系变化，春节档等重点档期进一步集中。《流浪地球2》《封神第一部》《哪吒之魔童闹海》等作品显示，中国电影的竞争逐渐从票房规模转向类型开发、视效技术、系列化生产和完整工业体系。电影也开始与流媒体、短视频、游戏等数字文化产业形成更紧密的融合。",
      events: [],
      representativeFilmIds: [],
      representativePersonIds: [],
      subStages: [
        chinaTenthIndustrializationStage,
        chinaTenthDigitalStage,
        chinaTenthPlatformStage,
      ],
    },
  ],
};
