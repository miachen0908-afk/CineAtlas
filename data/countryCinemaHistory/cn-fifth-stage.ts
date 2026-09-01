import type { CinemaHistoryStage } from "@/types/cinema";

export const chinaFifthStage: CinemaHistoryStage = {
  id: "postwar-revival-and-artistic-peak",
  title: "战后复兴与艺术高峰",
  shortTitle: "战后电影",
  yearStart: 1945,
  yearEnd: 1949,
  yearLabel: "1945—1949",
  summary:
    "抗战胜利后，上海重新成为中国电影生产中心。战争创伤、通货膨胀、贫富分化和社会动荡进入银幕，现实主义电影再次达到高峰。昆仑、文华等电影公司成为重要创作力量。与此同时，东北解放区建立新的电影生产机构，为1949年以后中国电影的发展奠定基础。",
  events: [
    {
      id: "spring-river-flows-east-1947",
      year: 1947,
      title: "《一江春水向东流》引起观影热潮",
      description:
        "蔡楚生、郑君里联合导演《一江春水向东流》，由白杨、陶金、舒绣文、上官云珠等主演。影片将一个家庭的离散与抗战前后的社会变化结合，上映后引起巨大反响，成为战后最具影响力的国产电影之一。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-spring-river-flows-east-1947",
          title: "一江春水向东流",
          genre: "社会现实片",
          credits: [
            { role: "导演", name: "蔡楚生、郑君里" },
            { role: "主演", name: "白杨、陶金、舒绣文、上官云珠" },
          ],
          synopsis:
            "素芬与丈夫张忠良因战争分离。抗战结束后，已经改变命运的张忠良与仍在贫困中生活的妻儿再次相遇。",
          significance:
            "以家庭悲剧浓缩战争和战后社会变化，是中国战后现实主义电影的代表作。",
        },
      ],
    },
    {
      id: "eight-thousand-li-1947",
      year: 1947,
      title: "《八千里路云和月》表现抗战青年的战后命运",
      description:
        "史东山导演《八千里路云和月》，由白杨、陶金主演。影片从抗战演剧队青年的经历写到抗战胜利后的现实生活，将理想主义与战后社会困境形成对照，引起观众共鸣。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-eight-thousand-li-1947",
          title: "八千里路云和月",
          genre: "社会现实片",
          credits: [
            { role: "导演", name: "史东山" },
            { role: "主演", name: "白杨、陶金" },
          ],
          synopsis:
            "一群青年在抗战期间参加救亡宣传，胜利后却面对贫困、失业和社会不公。",
          significance:
            "连接抗战与战后社会，表现一代知识青年从民族救亡走向现实困境的经历。",
        },
      ],
    },
    {
      id: "phony-phoenix-1947",
      year: 1947,
      title: "《假凤虚凰》以喜剧讽刺都市社会",
      description:
        "黄佐临导演《假凤虚凰》，石挥、李丽华主演，以都市男女婚恋为核心展开讽刺。影片通过身份误认和婚姻选择表现都市生活，在沉重的现实主义电影之外，显示战后喜剧电影仍具有活跃的商业市场。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-phony-phoenix-1947",
          title: "假凤虚凰",
          genre: "都市喜剧片",
          credits: [
            { role: "导演", name: "黄佐临" },
            { role: "主演", name: "石挥、李丽华" },
          ],
          synopsis:
            "理发师与女子在相亲过程中都试图掩饰自己的真实身份，由此产生一系列误会。",
          significance:
            "以轻喜剧方式讽刺都市社会的身份、金钱和婚姻观念，是战后都市喜剧代表作。",
        },
      ],
    },
    {
      id: "spring-in-a-small-town-1948",
      year: 1948,
      title: "《小城之春》探索人物内心世界",
      description:
        "费穆导演、李天济编剧的《小城之春》上映，由石羽、韦伟、李纬等主演。影片没有直接表现战争，而是通过一个破败家庭中的情感关系表现战后创伤。其含蓄的镜头、旁白和心理叙事，使中国电影出现不同于社会现实主义的艺术探索。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-spring-in-a-small-town-1948",
          title: "小城之春",
          genre: "剧情片",
          credits: [
            { role: "导演", name: "费穆" },
            { role: "编剧", name: "李天济" },
            { role: "主演", name: "石羽、韦伟、李纬" },
          ],
          synopsis:
            "战后小城中，周玉纹与患病丈夫生活沉闷。昔日恋人的到来重新唤起她的情感，也使家庭关系陷入矛盾。",
          significance:
            "以细腻的心理描写和电影语言表现战后人的精神状态，后来被广泛视为中国电影史的重要经典。",
        },
      ],
    },
    {
      id: "myriad-lights-1948",
      year: 1948,
      title: "《万家灯火》聚焦普通城市家庭",
      description:
        "沈浮导演《万家灯火》，由上官云珠、蓝马等主演。影片把镜头对准上海普通职员家庭，通过住房、物价、失业和家庭矛盾表现战后城市生活，引起普通观众共鸣。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-myriad-lights-1948",
          title: "万家灯火",
          genre: "社会现实片",
          credits: [
            { role: "导演", name: "沈浮" },
            { role: "主演", name: "上官云珠、蓝马" },
          ],
          synopsis:
            "一个普通城市家庭在物价上涨和生活压力中不断发生矛盾，并努力维持家庭生活。",
          significance:
            "以日常家庭生活表现战后经济和社会问题，是战后现实主义电影的重要作品。",
        },
      ],
    },
    {
      id: "crows-and-sparrows-1948",
      year: 1948,
      title: "《乌鸦与麻雀》以住房故事讽刺现实",
      description:
        "郑君里导演《乌鸦与麻雀》，赵丹、上官云珠、吴茵等主演。影片以一栋上海住宅中的房客与房东为中心，将住房纠纷与战后社会现实结合，以讽刺和群像方式表现普通市民的生活。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-crows-and-sparrows-1948",
          title: "乌鸦与麻雀",
          genre: "社会讽刺片",
          credits: [
            { role: "导演", name: "郑君里" },
            { role: "主演", name: "赵丹、上官云珠、吴茵" },
          ],
          synopsis:
            "房东企图出售房屋并赶走住户，几个普通家庭为了自己的住所共同寻找解决办法。",
          significance:
            "通过小人物和日常空间表现社会矛盾，是战后社会讽刺电影的重要代表。",
        },
      ],
    },
    {
      id: "northeast-film-studio-founded-1948",
      year: 1948,
      title: "东北电影制片厂建立",
      description:
        "东北电影制片厂在东北解放区建立并发展电影生产，组织来自延安及各地的电影工作者开展新闻纪录、译制和故事片制作。它使解放区电影从流动性的纪录和宣传工作逐渐转向较完整的制片体系，并成为中华人民共和国成立后重要的电影生产基地。",
      type: "institution",
    },
    {
      id: "the-bridge-1949",
      year: 1949,
      title: "《桥》完成，新电影生产体系开始形成",
      description:
        "王滨导演、东北电影制片厂摄制《桥》，以东北铁路工人为主要人物。影片将工人作为故事主人公，表现他们修复桥梁、支援战争的过程，体现解放区电影与此前上海商业电影不同的创作方向。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-the-bridge-1949",
          title: "桥",
          genre: "剧情片",
          credits: [
            { role: "导演", name: "王滨" },
            { role: "主演", name: "王家乙、吕班等" },
          ],
          synopsis:
            "铁路工人为支援前线克服技术和生产困难，完成桥梁修复任务。",
          significance:
            "东北电影制片厂早期故事片代表，通常被视为新中国电影生产体系形成过程中的重要作品。",
        },
      ],
    },
    {
      id: "new-historical-stage-1949",
      year: 1949,
      title: "中国电影进入新的历史阶段",
      description:
        "中华人民共和国成立后，上海原有电影公司与东北等地形成的新电影机构进入重新整合阶段。战后上海电影留下的现实主义传统，与解放区形成的工农兵题材、新闻纪录和国营制片体系共同进入新的历史环境。中国电影的生产制度、创作主体和银幕人物由此发生根本变化。",
      type: "historical",
    },
  ],
  representativeFilmIds: [],
  representativePersonIds: [],
};
