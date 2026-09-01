import type { CinemaHistoryStage } from "@/types/cinema";

export const chinaFourthStage: CinemaHistoryStage = {
  id: "wartime-film-and-regional-divergence",
  title: "抗战电影与区域分化",
  shortTitle: "抗战电影",
  yearStart: 1937,
  yearEnd: 1945,
  yearLabel: "1937—1945",
  summary:
    "1937年全面抗战爆发，以上海为中心的电影工业被战争打破。电影工作者分散到武汉、重庆、香港、延安以及上海租界等不同区域，形成多区域并存的电影生产格局。抗战救亡成为重要主题，新闻纪录、抗战故事片、商业类型片和动画电影分别在不同区域发展。",
  events: [
    { id: "eight-hundred-heroes-1938", year: 1938, title: "《八百壮士》将真实战事搬上银幕", description: "应云卫导演《八百壮士》，以1937年四行仓库保卫战为背景，将刚刚发生的抗战事件迅速转化为电影。影片强化了电影的民族动员作用，成为抗战初期具有代表性的国防电影。", type: "film", archiveFilms: [{ id: "archive-eight-hundred-heroes-1938", title: "八百壮士", genre: "抗战片", credits: [{ role: "导演", name: "应云卫" }, { role: "主演", name: "袁牧之、陈波儿" }], synopsis: "表现中国军队坚守四行仓库、抵抗日军进攻的故事。", significance: "将真实战争事件直接搬上银幕，体现抗战时期电影与民族救亡运动的紧密结合。" }] },
    { id: "mulan-joins-army-1939", year: 1939, title: "《木兰从军》成为“孤岛”时期的卖座影片", description: "卜万苍导演、欧阳予倩编剧的《木兰从军》在上海上映，由陈云裳主演。影片借花木兰代父从军的传统故事回应现实中的民族战争，在上海“孤岛”环境中获得广泛关注，历史题材由此成为表达民族意识的重要方式。", type: "film", archiveFilms: [{ id: "archive-mulan-joins-army-1939", title: "木兰从军", genre: "古装／历史片", credits: [{ role: "导演", name: "卜万苍" }, { role: "编剧", name: "欧阳予倩" }, { role: "主演", name: "陈云裳" }], synopsis: "花木兰女扮男装、代父从军，在战场上建立功勋。", significance: "借传统英雄故事表达民族意识，是上海“孤岛”时期具有代表性的商业电影。" }] },
    { id: "defend-our-land-1939", year: 1939, title: "《保卫我们的土地》表现普通人的抗战", description: "史东山导演《保卫我们的土地》，将镜头从战场英雄转向受到战争冲击的普通民众。影片强调保卫家园与全民抗战，使农民和普通劳动者成为抗战电影的重要人物。", type: "film", archiveFilms: [{ id: "archive-defend-our-land-1939", title: "保卫我们的土地", genre: "抗战片", credits: [{ role: "导演", name: "史东山" }, { role: "主演", name: "魏鹤龄" }], synopsis: "普通民众在侵略战争中失去家园，并逐渐投入民族抗战。", significance: "把民族战争与普通人的生活联系起来，强化了全民抗战的电影表达。" }] },
    { id: "light-of-east-asia-1940", year: 1940, title: "《东亚之光》表现战俘反战", description: "何非光导演《东亚之光》，以被俘日军士兵为主要人物，通过反战叙事表现日本军国主义给中日人民带来的伤害。影片拓展了抗战电影的表现角度，使抗战电影不再只是正面战场叙事。", type: "film", archiveFilms: [{ id: "archive-light-of-east-asia-1940", title: "东亚之光", genre: "抗战／反战片", credits: [{ role: "导演", name: "何非光" }], synopsis: "围绕被俘日军士兵展开，通过人物思想变化表现战争与军国主义造成的伤害。", significance: "从反战角度表现抗日主题，扩大了抗战电影的叙事范围。" }] },
    { id: "iron-fan-princess-1941", year: 1941, title: "《铁扇公主》推动中国动画电影发展", description: "万籁鸣、万古蟾导演的《铁扇公主》在上海完成并上映。影片以《西游记》为基础制作成长篇动画，在战争环境中仍获得市场关注，并传播到亚洲其他地区，显示中国动画已经具备制作长篇作品的能力。", type: "film", archiveFilms: [{ id: "archive-iron-fan-princess-1941", title: "铁扇公主", genre: "动画片", credits: [{ role: "导演", name: "万籁鸣、万古蟾" }], synopsis: "孙悟空等人为越过火焰山，向铁扇公主借取芭蕉扇。", significance: "中国第一部长篇动画电影，也是亚洲早期重要动画长片，标志中国动画制作进入新的阶段。" }] },
    { id: "home-1941", year: 1941, title: "《家》延续上海家庭伦理片传统", description: "卜万苍导演巴金小说改编电影《家》，由袁美云、陈云裳等主演。影片通过封建大家庭中的婚姻和青年命运表现传统家庭制度的压迫，使五四以来的家庭批判主题在战争时期继续延续。", type: "film", archiveFilms: [{ id: "archive-home-1941", title: "家", genre: "家庭伦理片", credits: [{ role: "导演", name: "卜万苍" }, { role: "原作", name: "巴金" }, { role: "主演", name: "袁美云、陈云裳" }], synopsis: "围绕封建大家庭中的青年爱情、婚姻和代际冲突展开。", significance: "延续中国电影长期关注的家庭伦理主题，并将现代文学名著进一步引入商业电影。" }] },
    { id: "eternal-glory-1943", year: 1943, title: "《万世流芳》成为沦陷时期的重要商业大片", description: "卜万苍、朱石麟等导演《万世流芳》，由李香兰、陈云裳等主演，以林则徐禁烟为题材。影片制作规模较大，歌曲《卖糖歌》《戒烟歌》等广泛传播，并取得较大的商业反响。但由于影片产生于日本控制下的上海电影体制，其民族叙事与殖民政治之间存在复杂关系。", type: "film", archiveFilms: [{ id: "archive-eternal-glory-1943", title: "万世流芳", genre: "历史片", credits: [{ role: "导演", name: "卜万苍、朱石麟等" }, { role: "主演", name: "李香兰、陈云裳" }], synopsis: "以林则徐禁烟和鸦片战争为背景，表现禁烟与民族抗争。", significance: "沦陷时期上海重要商业电影，也体现战争环境下电影生产、民族叙事与政治控制之间的复杂关系。" }] },
    { id: "war-victory-realignment-1945", year: 1945, title: "抗战胜利，电影生产格局重新调整", description: "抗战胜利后，分散在重庆、香港等地的电影工作者陆续返回上海。战争时期形成的多区域电影生产开始重新汇合。八年战争带来的社会创伤、贫困和普通人的生存困境，很快成为战后电影的重要内容，并推动中国电影进入新的现实主义高峰。", type: "historical" },
  ],
  representativeFilmIds: [],
  representativePersonIds: [],
};
