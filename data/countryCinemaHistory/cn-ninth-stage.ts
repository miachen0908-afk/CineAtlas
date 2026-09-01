import type { CinemaHistoryStage } from "@/types/cinema";

export const chinaNinthStage: CinemaHistoryStage = {
  id: "market-transition-and-diversification",
  title: "市场转型与多元探索",
  shortTitle: "市场转型",
  yearStart: 1990,
  yearEnd: 1999,
  yearLabel: "1990—1999",
  summary:
    "20世纪90年代，电视普及和娱乐方式增加使传统影院观众大量流失，中国电影开始推进发行放映和市场化改革。第五代导演继续活跃，第六代导演开始出现，主旋律电影、艺术电影、都市喜剧和商业大片并行发展。1994年以后，进口分账大片进入中国市场；1997年《甲方乙方》的成功，则推动国产贺岁片和商业电影形成新的市场模式。",
  events: [
    {
      id: "ju-dou-1990",
      year: 1990,
      title: "《菊豆》延续第五代电影的视觉探索",
      description:
        "张艺谋、杨凤良导演《菊豆》，由巩俐、李保田主演，根据刘恒小说改编。影片以封闭的染坊空间和强烈的色彩表现人物欲望与传统伦理冲突，并获得国际电影节关注。",
      type: "film",
      archiveFilms: [{ id: "archive-ju-dou-1990", title: "菊豆", genre: "剧情片", credits: [{ role: "导演", name: "张艺谋、杨凤良" }, { role: "主演", name: "巩俐、李保田" }, { role: "原作", name: "刘恒" }], synopsis: "年轻女子菊豆嫁给染坊老板后，与丈夫的侄子产生感情，最终陷入家庭和伦理悲剧。", significance: "第五代电影视觉美学的重要作品，并成为较早获得奥斯卡最佳外语片提名的中国大陆电影之一。" }],
    },
    {
      id: "raise-the-red-lantern-1991",
      year: 1991,
      title: "《大红灯笼高高挂》扩大中国电影国际影响",
      description:
        "张艺谋导演《大红灯笼高高挂》，巩俐主演，根据苏童小说《妻妾成群》改编。影片以封闭宅院、仪式和色彩构成高度风格化的视觉空间，在国际电影节和海外市场受到广泛关注。",
      type: "film",
      archiveFilms: [{ id: "archive-raise-the-red-lantern-1991", title: "大红灯笼高高挂", genre: "剧情片", credits: [{ role: "导演", name: "张艺谋" }, { role: "主演", name: "巩俐" }, { role: "原作", name: "苏童《妻妾成群》" }], synopsis: "颂莲进入一个封建大家庭成为四姨太，在妻妾之间的竞争和家族规则中逐渐走向精神崩溃。", significance: "第五代导演国际传播的重要作品，进一步确立张艺谋和巩俐的国际知名度。" }],
    },
    {
      id: "the-story-of-qiu-ju-1992",
      year: 1992,
      title: "《秋菊打官司》转向普通人的现实生活",
      description:
        "张艺谋导演《秋菊打官司》，巩俐主演，根据陈源斌小说改编。影片大量采用实景和接近纪实的拍摄方式，将镜头从高度风格化的历史空间转向当代农村社会。",
      type: "film",
      archiveFilms: [{ id: "archive-the-story-of-qiu-ju-1992", title: "秋菊打官司", genre: "现实题材片", credits: [{ role: "导演", name: "张艺谋" }, { role: "主演", name: "巩俐" }], synopsis: "农村妇女秋菊因为丈夫受到村长伤害，坚持逐级申诉，希望得到一个“说法”。", significance: "通过普通人的维权经历表现基层社会关系，体现第五代导演向当代现实题材的转变。" }],
    },
    {
      id: "farewell-my-concubine-1993",
      year: 1993,
      title: "《霸王别姬》成为华语电影国际化的重要节点",
      description:
        "陈凯歌导演《霸王别姬》，张国荣、张丰毅、巩俐主演，根据李碧华小说改编。影片通过两名京剧演员跨越数十年的命运表现个人、艺术与历史之间的关系，并获得第46届戛纳国际电影节金棕榈奖。",
      type: "film",
      archiveFilms: [{ id: "archive-farewell-my-concubine-1993", title: "霸王别姬", genre: "历史剧情片", credits: [{ role: "导演", name: "陈凯歌" }, { role: "主演", name: "张国荣、张丰毅、巩俐" }, { role: "原作", name: "李碧华" }], synopsis: "程蝶衣与段小楼从少年学戏到成为京剧名角，两人的关系随着时代变化不断发生改变。", significance: "获得戛纳电影节金棕榈奖，是中国电影国际传播史上的标志性作品。" }],
    },
    {
      id: "beijing-bastards-1993",
      year: 1993,
      title: "《北京杂种》呈现第六代导演的城市经验",
      description:
        "张元导演《北京杂种》，将镜头对准北京摇滚音乐人和城市青年。影片采用低成本、现场感和非传统叙事方式，与第五代导演的历史文化寓言形成明显区别，第六代导演开始以个人经验和当代城市生活进入中国电影。",
      type: "film",
      archiveFilms: [{ id: "archive-beijing-bastards-1993", title: "北京杂种", genre: "独立／都市电影", credits: [{ role: "导演", name: "张元" }, { role: "主演", name: "崔健等" }], synopsis: "围绕北京一群音乐人和青年人的生活展开，表现他们的爱情、友情和生存状态。", significance: "第六代导演早期代表作品之一，体现90年代中国电影向城市边缘人物和个人经验转移。" }],
    },
    {
      id: "to-live-1994",
      year: 1994,
      title: "《活着》以普通家庭表现时代变迁",
      description:
        "张艺谋导演《活着》，葛优、巩俐主演，根据余华同名小说改编。影片通过一个普通家庭跨越数十年的命运，将宏大历史转化为个人生存经验，并在戛纳电影节获得重要奖项。",
      type: "film",
      archiveFilms: [{ id: "archive-to-live-1994", title: "活着", genre: "历史剧情片", credits: [{ role: "导演", name: "张艺谋" }, { role: "主演", name: "葛优、巩俐" }, { role: "原作", name: "余华" }], synopsis: "福贵一家经历战争和社会变化，在一次次失去中努力维持普通人的生活。", significance: "以家庭和个人命运表现历史，是第五代导演90年代现实主义转向的重要代表。" }],
    },
    {
      id: "imported-blockbusters-1994",
      year: 1994,
      title: "进口分账大片进入中国电影市场",
      description: "中国电影市场开始以分账方式引进海外商业大片。随后上映的《亡命天涯》等影片吸引大量观众重新进入影院。进口大片带来新的商业竞争，也使票房、档期、营销和影院体验越来越成为中国电影产业的重要问题。",
      type: "industry",
    },
    {
      id: "in-the-heat-of-the-sun-1994",
      year: 1994,
      title: "《阳光灿烂的日子》重新书写个人记忆",
      description:
        "姜文导演处女作《阳光灿烂的日子》，夏雨主演，根据王朔小说《动物凶猛》改编。影片以少年马小军的回忆重新表现特殊年代，不再直接进行历史批判，而是将青春、欲望、记忆和时代经验结合。",
      type: "film",
      archiveFilms: [{ id: "archive-in-the-heat-of-the-sun-1994", title: "阳光灿烂的日子", genre: "青春剧情片", credits: [{ role: "导演", name: "姜文" }, { role: "主演", name: "夏雨、宁静" }, { role: "原作", name: "王朔《动物凶猛》" }], synopsis: "少年马小军在北京度过青春时期，并在友情、爱情和想象中不断重新理解自己的过去。", significance: "以个人记忆取代宏大历史叙事，成为90年代中国电影的重要作品。" }],
    },
    {
      id: "red-cherry-1995",
      year: 1995,
      title: "《红樱桃》探索国产商业大片",
      description: "叶大鹰导演《红樱桃》，郭柯宇主演，以第二次世界大战为背景展开跨国战争故事。影片采用较大规模制作和商业化宣传方式，并取得较高票房，显示国产电影开始主动寻找能够与进口大片竞争的商业模式。",
      type: "film",
      archiveFilms: [{ id: "archive-red-cherry-1995", title: "红樱桃", genre: "战争剧情片", credits: [{ role: "导演", name: "叶大鹰" }, { role: "主演", name: "郭柯宇" }], synopsis: "中国少年在苏联经历德国入侵和战争创伤，个人命运被卷入第二次世界大战。", significance: "90年代国产商业大片探索的重要作品之一。" }],
    },
    {
      id: "the-dream-factory-1997",
      year: 1997,
      title: "《甲方乙方》开启国产贺岁片模式",
      description: "冯小刚导演《甲方乙方》，葛优、刘蓓、何冰等主演。影片以轻松喜剧回应都市观众的娱乐需求，在年末档期取得商业成功。“贺岁片”由此成为中国电影市场的重要概念，冯小刚也逐渐成为90年代末最重要的商业片导演之一。",
      type: "film",
      archiveFilms: [{ id: "archive-the-dream-factory-1997", title: "甲方乙方", genre: "都市喜剧片", credits: [{ role: "导演", name: "冯小刚" }, { role: "主演", name: "葛优、刘蓓、何冰" }], synopsis: "几个年轻人经营“好梦一日游”，帮助普通人短暂实现各种人生梦想。", significance: "推动中国大陆贺岁片形成稳定的商业模式，标志国产电影更加主动地面向市场和大众观众。" }],
    },
    {
      id: "not-one-less-1998",
      year: 1998,
      title: "《一个都不能少》关注农村教育",
      description: "张艺谋导演《一个都不能少》，大量使用非职业演员，以接近纪实的方式表现农村教育问题。影片将第五代导演的创作进一步转向当代普通人的现实生活，并获得威尼斯国际电影节金狮奖。",
      type: "film",
      archiveFilms: [{ id: "archive-not-one-less-1998", title: "一个都不能少", genre: "现实题材片", credits: [{ role: "导演", name: "张艺谋" }, { role: "主演", name: "魏敏芝" }], synopsis: "农村代课教师魏敏芝为了保证学生“一个都不能少”，前往城市寻找辍学学生。", significance: "以非职业演员和纪实风格关注农村教育问题，并获得威尼斯电影节金狮奖。" }],
    },
    {
      id: "be-there-or-be-square-1998",
      year: 1998,
      title: "《不见不散》巩固贺岁片市场",
      description: "冯小刚导演《不见不散》，葛优、徐帆主演，将故事放到海外华人生活环境中。影片延续都市喜剧和明星组合，在商业上取得成功，使年末观看国产贺岁片逐渐成为稳定的消费习惯。",
      type: "film",
      archiveFilms: [{ id: "archive-be-there-or-be-square-1998", title: "不见不散", genre: "爱情喜剧片", credits: [{ role: "导演", name: "冯小刚" }, { role: "主演", name: "葛优、徐帆" }], synopsis: "两个生活在美国的中国人在不断相遇和分离中逐渐产生感情。", significance: "进一步巩固国产贺岁片模式，显示档期、明星和类型开始成为电影市场的重要商业要素。" }],
    },
    {
      id: "the-road-home-1999",
      year: 1999,
      title: "《我的父亲母亲》连接商业市场与艺术电影",
      description: "张艺谋导演《我的父亲母亲》，章子怡主演，根据鲍十小说改编。影片以简单的乡村爱情故事和鲜明的影像风格获得关注，章子怡也由此进入公众视野。",
      type: "film",
      archiveFilms: [{ id: "archive-the-road-home-1999", title: "我的父亲母亲", genre: "爱情片", credits: [{ role: "导演", name: "张艺谋" }, { role: "主演", name: "章子怡、郑昊" }, { role: "原作", name: "鲍十" }], synopsis: "通过儿子的回忆，讲述父亲与母亲年轻时期在乡村相识相爱的故事。", significance: "延续第五代导演的视觉美学，同时以更加通俗的情感叙事连接艺术表达与大众观众。" }],
    },
    {
      id: "cinema-on-the-eve-of-industrialization-1999",
      year: 1999,
      title: "中国电影进入产业化前夜",
      description: "经过整个90年代的市场改革，中国电影已经形成第五代、第六代、主旋律电影和商业电影并存的格局。进口分账大片带来市场竞争，贺岁片重新吸引城市观众，国际电影节则为中国艺术电影提供另一条传播路径。进入21世纪后，院线改革、商业大片和电影产业化将进一步改变中国电影的生产和市场结构。",
      type: "historical",
    },
  ],
  representativeFilmIds: [],
  representativePersonIds: [],
};
