import type { CinemaHistoryStage } from "@/types/cinema";

export const chinaSeventhStage: CinemaHistoryStage = {
  id: "cultural-revolution-cinema",
  title: "“文革”时期电影",
  shortTitle: "文革电影",
  yearStart: 1966,
  yearEnd: 1976,
  yearLabel: "1966—1976",
  summary:
    "1966年“文化大革命”开始后，中国电影生产受到严重冲击，大批此前拍摄的影片被停止放映，许多电影工作者受到批判。1967—1969年前后故事片生产一度基本停顿。1970年以后，样板戏被集中摄制成电影；随后故事片生产逐步恢复，但创作受到严格的政治和文艺规范限制。",
  events: [
    {
      id: "normal-feature-production-disrupted-1966",
      year: 1966,
      title: "正常故事片生产受到冲击",
      description:
        "“文化大革命”开始后，《早春二月》《舞台姐妹》等此前拍摄的影片受到批判，大批电影工作者停止正常创作。中国电影原有的导演、演员和制片体系受到严重冲击，此后数年故事片生产大幅减少。",
      type: "historical",
    },
    {
      id: "taking-tiger-mountain-by-strategy-1970",
      year: 1970,
      title: "《智取威虎山》将样板戏搬上银幕",
      description:
        "谢铁骊导演现代京剧电影《智取威虎山》，将舞台上的样板戏通过电影摄影、剪辑和布景重新呈现。影片在全国大规模放映，标志样板戏电影成为这一时期最重要的电影形态之一。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-taking-tiger-mountain-by-strategy-1970",
          title: "智取威虎山",
          genre: "现代京剧／戏曲片",
          credits: [{ role: "导演", name: "谢铁骊" }],
          synopsis:
            "解放军侦察员杨子荣深入土匪据点威虎山，通过智谋配合部队消灭土匪。",
          significance:
            "文革时期样板戏电影的代表作，体现戏剧舞台表演与电影手段的结合。",
        },
      ],
    },
    {
      id: "1971-a-red-lantern",
      year: 1971,
      title: "《红灯记》成为样板戏电影代表",
      description:
        "成荫导演京剧电影《红灯记》，由浩亮、刘长瑜、高玉倩等主演。影片通过李玉和一家三代的革命故事塑造英雄人物，在全国反复放映，其人物、唱段和视觉形象产生广泛影响。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-red-lantern-1971",
          title: "红灯记",
          genre: "现代京剧／戏曲片",
          credits: [
            { role: "导演", name: "成荫" },
            { role: "主演", name: "浩亮、刘长瑜、高玉倩" },
          ],
          synopsis:
            "抗日战争时期，铁路工人李玉和一家三代为向游击队传递密电码与日军斗争。",
          significance:
            "样板戏电影的重要代表，集中体现这一时期革命英雄人物的塑造方式。",
        },
      ],
    },
    {
      id: "1971-b-red-detachment-of-women-ballet",
      year: 1971,
      title: "《红色娘子军》由舞剧进入电影",
      description:
        "潘文展、傅杰导演芭蕾舞剧电影《红色娘子军》。与1961年谢晋导演的故事片相比，新版通过芭蕾舞、音乐和电影摄影重新表现吴琼花参加革命的故事，成为文革时期传播最广的样板戏电影之一。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-red-detachment-of-women-ballet-1971",
          title: "红色娘子军",
          genre: "芭蕾舞剧电影",
          credits: [{ role: "导演", name: "潘文展、傅杰" }],
          synopsis:
            "吴琼花逃离地主压迫，加入红军娘子军，并在革命斗争中成长。",
          significance:
            "将西方芭蕾形式与中国革命题材结合，是文革时期舞剧电影的代表作品。",
        },
      ],
    },
    {
      id: "white-haired-girl-ballet-1972",
      year: 1972,
      title: "《白毛女》完成芭蕾舞剧电影化",
      description:
        "桑弧导演芭蕾舞剧电影《白毛女》，将1940年代以来不断改编的“白毛女”故事再次搬上银幕。影片通过舞蹈、音乐和电影镜头表现喜儿的遭遇，使这一故事成为不同历史阶段持续被改编的重要革命文艺文本。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-white-haired-girl-ballet-1972",
          title: "白毛女",
          genre: "芭蕾舞剧电影",
          credits: [{ role: "导演", name: "桑弧" }],
          synopsis:
            "贫苦农民女儿喜儿受到地主压迫，被迫逃入深山，最终在革命力量帮助下获得解放。",
          significance:
            "体现革命经典在戏剧、舞蹈和电影之间不断转换的过程。",
        },
      ],
    },
    {
      id: "feature-production-resumes-1973",
      year: 1973,
      title: "故事片生产开始恢复",
      description:
        "谢铁骊导演《海港》等样板戏电影继续上映的同时，停顿多年的普通故事片生产开始逐渐恢复。此后的电影不再完全由样板戏电影构成，农村、工业、战争和青年生活重新进入故事片，但人物和情节仍受到明确的政治表达规范影响。",
      type: "industry",
    },
    {
      id: "pioneers-1974",
      year: 1974,
      title: "《创业》表现工业建设",
      description:
        "于彦夫导演《创业》，以石油工业建设为题材，塑造石油工人在艰苦环境中进行生产建设的群体形象。影片上映后产生较大影响，也因其创作和评价问题卷入当时复杂的政治环境。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-pioneers-1974",
          title: "创业",
          genre: "工业题材片",
          credits: [
            { role: "导演", name: "于彦夫" },
            { role: "主演", name: "张连文" },
          ],
          synopsis:
            "以石油工人为主人公，表现他们克服困难、建设油田的过程。",
          significance:
            "文革后期工业题材故事片的代表，体现电影生产由样板戏逐渐向故事片扩展。",
        },
      ],
    },
    {
      id: "1975-a-sparkling-red-star",
      year: 1975,
      title: "《闪闪的红星》成为儿童电影代表",
      description:
        "李俊、李昂导演《闪闪的红星》，由祝新运主演。影片以少年潘冬子的成长为核心，将儿童叙事、革命历史和音乐结合。《红星歌》《映山红》等歌曲随影片广泛传播。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-sparkling-red-star-1975",
          title: "闪闪的红星",
          genre: "儿童／革命战争片",
          credits: [
            { role: "导演", name: "李俊、李昂" },
            { role: "主演", name: "祝新运" },
          ],
          synopsis:
            "少年潘冬子在红军离开后经历斗争和成长，最终走上革命道路。",
          significance:
            "文革后期影响广泛的故事片，塑造了这一时期最具代表性的儿童银幕形象之一。",
        },
      ],
    },
    {
      id: "1975-b-hai-xia",
      year: 1975,
      title: "《海霞》塑造女性民兵形象",
      description:
        "钱江、陈怀皑、王好为导演《海霞》，吴海燕主演，以海岛女民兵的成长经历为主要内容。影片的海岛景观、人物形象和音乐受到观众关注，使其成为文革后期较有影响力的故事片。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-hai-xia-1975",
          title: "海霞",
          genre: "剧情片",
          credits: [
            { role: "导演", name: "钱江、陈怀皑、王好为" },
            { role: "主演", name: "吴海燕" },
          ],
          synopsis:
            "海岛姑娘海霞在社会变迁中成长，并组织女民兵保卫海岛。",
          significance:
            "文革后期女性题材故事片代表，也体现这一时期故事片在人物和影像表达上的有限恢复。",
        },
      ],
    },
    {
      id: "cultural-revolution-ends-1976",
      year: 1976,
      title: "文革结束，电影创作开始转向",
      description:
        "1976年“文化大革命”结束，持续十年的特殊电影生产环境随之发生变化。此前受到限制的电影工作者逐渐恢复创作，故事片生产开始增加。随着社会重新讨论历史、个人命运和现实生活，中国电影很快进入以伤痕反思、现实主义复兴和新一代导演成长为特征的新阶段。",
      type: "historical",
    },
  ],
  representativeFilmIds: [],
  representativePersonIds: [],
};
