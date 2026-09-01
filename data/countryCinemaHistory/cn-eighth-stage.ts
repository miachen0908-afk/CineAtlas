import type { CinemaHistoryStage } from "@/types/cinema";

export const chinaEighthStage: CinemaHistoryStage = {
  id: "new-period-revival",
  title: "新时期电影复兴",
  shortTitle: "新时期",
  yearStart: 1977,
  yearEnd: 1989,
  yearLabel: "1977—1989",
  summary:
    "“文化大革命”结束后，中国电影逐渐恢复正常生产。电影创作从历史反思和现实主义复兴开始，重新关注普通人的情感、命运和社会生活。80年代，第四代导演重新活跃，第五代导演登上影坛，电影语言发生明显变化。与此同时，娱乐片和商业类型片重新发展，中国电影开始形成更加多元的创作格局。",
  events: [
    {
      id: "evening-rain-1978",
      year: 1978,
      title: "《巴山夜雨》开启历史反思",
      description:
        "吴永刚、吴贻弓导演《巴山夜雨》，以一艘长江客轮上的人物关系表现特殊年代给普通人造成的伤害。影片不再以简单的英雄与反派组织人物，而是通过普通人的遭遇表现历史创伤，成为新时期人道主义电影的重要作品。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-evening-rain-1978",
          title: "巴山夜雨",
          genre: "剧情片",
          credits: [
            { role: "导演", name: "吴永刚、吴贻弓" },
            { role: "主演", name: "李志舆、张瑜" },
          ],
          synopsis:
            "一名受到迫害的诗人在押送途中，与船上的不同人物相遇，人们逐渐对他的遭遇产生理解和同情。",
          significance:
            "以普通人的情感和尊严反思历史创伤，体现新时期电影的人道主义转向。",
        },
      ],
    },
    {
      id: "1980-a-romance-on-lushan-mountain",
      year: 1980,
      title: "《庐山恋》引发爱情电影热潮",
      description:
        "黄祖模导演《庐山恋》，由张瑜、郭凯敏主演。影片以庐山风景和青年爱情为核心，弱化传统政治冲突，大量表现服装、旅游和个人情感。上映后受到观众欢迎，张瑜也成为80年代初具有代表性的电影明星。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-romance-on-lushan-mountain-1980",
          title: "庐山恋",
          genre: "爱情片",
          credits: [
            { role: "导演", name: "黄祖模" },
            { role: "主演", name: "张瑜、郭凯敏" },
          ],
          synopsis:
            "海外归来的周筠与青年耿桦在庐山相识相爱，两人的感情经历家庭和时代变化的考验。",
          significance:
            "新时期爱情电影的重要代表，推动个人情感重新成为中国电影的重要表现内容。",
        },
      ],
    },
    {
      id: "1980-b-legend-of-tianyun-mountain",
      year: 1980,
      title: "《天云山传奇》引起历史反思",
      description:
        "谢晋导演《天云山传奇》，根据鲁彦周小说改编，由石维坚、王馥荔等主演。影片通过几个人物跨越二十余年的命运变化反思政治运动对知识分子和普通人的影响，引起广泛社会讨论。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-legend-of-tianyun-mountain-1980",
          title: "天云山传奇",
          genre: "剧情片",
          credits: [
            { role: "导演", name: "谢晋" },
            { role: "主演", name: "石维坚、王馥荔" },
          ],
          synopsis:
            "青年知识分子罗群在政治运动中受到错误对待，他与身边几名女性的命运也因此发生改变。",
          significance: "新时期“伤痕电影”和历史反思电影的重要代表。",
        },
      ],
    },
    {
      id: "1982-a-rickshaw-boy",
      year: 1982,
      title: "《骆驼祥子》重新连接文学现实主义传统",
      description:
        "凌子风导演《骆驼祥子》，根据老舍同名小说改编，由张丰毅、斯琴高娃主演。影片通过祥子和虎妞的命运重新表现旧北京底层社会，延续中国电影长期存在的文学改编和现实主义传统。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-rickshaw-boy-1982",
          title: "骆驼祥子",
          genre: "文学改编片",
          credits: [
            { role: "导演", name: "凌子风" },
            { role: "主演", name: "张丰毅、斯琴高娃" },
            { role: "原作", name: "老舍" },
          ],
          synopsis:
            "人力车夫祥子希望依靠劳动改变生活，却在不断的打击中逐渐失去原有的人生理想。",
          significance:
            "80年代文学名著改编的重要作品，也是现实主义电影复兴的代表之一。",
        },
      ],
    },
    {
      id: "1982-b-the-herdsman",
      year: 1982,
      title: "《牧马人》形成广泛社会影响",
      description:
        "谢晋导演《牧马人》，朱时茂、丛珊主演，根据张贤亮小说改编。影片将知识分子的历史遭遇、家庭关系和个人选择结合，上映后获得大量观众，片中的人物和台词成为当时流行文化的一部分。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-the-herdsman-1982",
          title: "牧马人",
          genre: "剧情片",
          credits: [
            { role: "导演", name: "谢晋" },
            { role: "主演", name: "朱时茂、丛珊" },
          ],
          synopsis:
            "知识分子许灵均经历长期磨难后，在妻子和普通劳动者的帮助下重新建立生活。",
          significance:
            "将历史反思与家庭情感结合，是谢晋新时期电影的重要代表。",
        },
      ],
    },
    {
      id: "my-memories-of-old-beijing-1983",
      year: 1983,
      title: "《城南旧事》形成第四代导演的诗意表达",
      description:
        "吴贻弓导演《城南旧事》，根据林海音同名小说改编。影片通过儿童英子的视角回忆旧北京生活，以散文化结构和含蓄情感区别于传统戏剧化叙事，成为第四代导演的重要代表作品。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-my-memories-of-old-beijing-1983",
          title: "城南旧事",
          genre: "剧情片",
          credits: [
            { role: "导演", name: "吴贻弓" },
            { role: "主演", name: "沈洁" },
            { role: "原作", name: "林海音" },
          ],
          synopsis:
            "小女孩英子在北京生活期间遇到不同人物，并在一次次离别中逐渐认识成人世界。",
          significance:
            "以儿童视角、生活化叙事和诗意影像表现个人记忆，体现第四代导演的美学探索。",
        },
      ],
    },
    {
      id: "yellow-earth-1984",
      year: 1984,
      title: "《黄土地》标志第五代导演登场",
      description:
        "陈凯歌导演、张艺谋摄影的《黄土地》完成，由王学圻、薛白主演。影片减少传统戏剧冲突，通过黄土高原、民歌和人物空间关系进行视觉表达。其构图和影像风格明显区别于此前电影，成为第五代导演崛起的重要标志。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-yellow-earth-1984",
          title: "黄土地",
          genre: "剧情片",
          credits: [
            { role: "导演", name: "陈凯歌" },
            { role: "摄影", name: "张艺谋" },
            { role: "主演", name: "王学圻、薛白" },
          ],
          synopsis:
            "八路军文艺工作者来到陕北收集民歌，与当地少女翠巧一家相遇。",
          significance:
            "突破传统电影叙事和视觉方式，通常被视为第五代导演登上中国影坛的标志性作品。",
        },
      ],
    },
    {
      id: "black-cannon-incident-1985",
      year: 1985,
      title: "《黑炮事件》探索现代社会与个人处境",
      description:
        "黄建新导演《黑炮事件》，刘子枫主演，以一个看似普通的电报事件展开故事。影片通过荒诞和讽刺表现现代工业管理体制中的人与制度，使第五代电影不再局限于历史、乡土和民族文化题材。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-black-cannon-incident-1985",
          title: "黑炮事件",
          genre: "社会讽刺片",
          credits: [
            { role: "导演", name: "黄建新" },
            { role: "主演", name: "刘子枫" },
          ],
          synopsis:
            "工程师赵书信寻找一枚丢失的棋子，却因一封电报受到调查，并由此影响工作和生活。",
          significance:
            "以现代都市和工业社会为背景，是80年代社会讽刺电影的重要代表。",
        },
      ],
    },
    {
      id: "hibiscus-town-1986",
      year: 1986,
      title: "《芙蓉镇》成为历史反思电影代表",
      description:
        "谢晋导演《芙蓉镇》，根据古华小说改编，由刘晓庆、姜文主演。影片通过胡玉音和秦书田的命运表现政治运动对普通人生活的影响，上映后产生广泛社会反响。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-hibiscus-town-1986",
          title: "芙蓉镇",
          genre: "剧情片",
          credits: [
            { role: "导演", name: "谢晋" },
            { role: "主演", name: "刘晓庆、姜文" },
            { role: "原作", name: "古华" },
          ],
          synopsis:
            "经营米豆腐的胡玉音在政治运动中遭遇命运变化，并与秦书田在困境中相互扶持。",
          significance:
            "新时期历史反思电影的重要代表，也是谢晋电影创作的代表作之一。",
        },
      ],
    },
    {
      id: "red-sorghum-1987",
      year: 1987,
      title: "《红高粱》推动中国电影走向国际",
      description:
        "张艺谋首次独立执导故事片《红高粱》，由巩俐、姜文主演，根据莫言小说改编。影片以强烈的色彩、民间仪式和生命意识形成鲜明风格。1988年获得柏林国际电影节金熊奖，中国大陆电影由此获得更广泛的国际关注。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-red-sorghum-1987",
          title: "红高粱",
          genre: "剧情片",
          credits: [
            { role: "导演", name: "张艺谋" },
            { role: "主演", name: "巩俐、姜文" },
            { role: "原作", name: "莫言" },
          ],
          synopsis:
            "九儿嫁入山东一家酿酒作坊，并与余占鳌共同生活；抗战爆发后，人物命运发生剧烈变化。",
          significance:
            "第五代导演的重要代表作，并获得柏林国际电影节金熊奖，成为中国电影国际传播的重要节点。",
        },
      ],
    },
    {
      id: "the-troubleshooters-1988",
      year: 1988,
      title: "《顽主》表现都市青年文化",
      description:
        "米家山导演《顽主》，根据王朔小说改编，由张国立、葛优、梁天主演。影片以调侃、荒诞和反讽表现80年代城市生活，与此前严肃的历史反思形成明显区别，显示大众文化和都市消费社会开始进入电影。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-the-troubleshooters-1988",
          title: "顽主",
          genre: "都市喜剧片",
          credits: [
            { role: "导演", name: "米家山" },
            { role: "主演", name: "张国立、葛优、梁天" },
            { role: "原作", name: "王朔" },
          ],
          synopsis:
            "三个青年成立“替人排忧、替人解难、替人受过”的公司，由此卷入各种荒诞的都市事件。",
          significance:
            "代表80年代后期都市文化和喜剧电影的新变化，也预示90年代大众文化电影的兴起。",
        },
      ],
    },
    {
      id: "1989-a-black-snow",
      year: 1989,
      title: "《本命年》表现城市边缘青年",
      description:
        "谢飞导演《本命年》，姜文主演，根据刘恒小说《黑的雪》改编。影片将镜头对准改革年代的城市边缘人物，以冷静的现实主义方式表现个人与快速变化的社会之间的疏离。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-black-snow-1989",
          title: "本命年",
          genre: "都市剧情片",
          credits: [
            { role: "导演", name: "谢飞" },
            { role: "主演", name: "姜文" },
            { role: "原作", name: "刘恒《黑的雪》" },
          ],
          synopsis:
            "青年李慧泉刑满释放后试图重新开始生活，却始终难以真正融入周围社会。",
          significance:
            "将80年代末城市生活中的孤独和个人困境带入电影，为90年代更加个人化、边缘化的电影创作提供了新的方向。",
        },
      ],
    },
    {
      id: "1989-b-new-period-turning-point",
      year: 1989,
      title: "新时期电影进入新的转折",
      description:
        "经过十余年的恢复和探索，中国电影已经形成第四代、第五代导演并存的创作格局，历史反思、文学改编、艺术探索和商业娱乐同时发展。进入90年代后，电视普及、观众分流和市场环境变化开始对传统电影体制形成新的压力。中国电影由80年代以思想解放和艺术探索为核心的“新时期电影”，逐渐进入市场化改革与多元电影文化并存的新阶段。",
      type: "historical",
    },
  ],
  representativeFilmIds: [],
  representativePersonIds: [],
};
