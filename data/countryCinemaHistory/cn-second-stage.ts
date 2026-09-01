import type { CinemaHistoryStage } from "@/types/cinema";

export const chinaSecondStage: CinemaHistoryStage = {
  id: "rise-of-national-film-industry",
  title: "民族电影业的兴起",
  shortTitle: "民族影业",
  yearStart: 1923,
  yearEnd: 1931,
  yearLabel: "1923—1931",
  summary: `20世纪20年代，上海城市商业和大众娱乐迅速发展，电影院数量增加，国产电影逐渐形成稳定的观众市场。1923年《孤儿救祖记》的成功证明国产长故事片具有商业潜力，大量资本开始进入电影行业。明星、天一、民新、大中华百合等影片公司相继发展，中国电影由早期零散摄制进入较稳定的商业化生产阶段。

这一时期，家庭伦理、爱情、古装、武侠和神怪等类型不断发展，电影明星和商业宣传开始成为电影工业的重要组成部分。1928年以后，《火烧红莲寺》带动武侠神怪片热潮。1930年联华影业公司成立，电影行业进一步走向规模化和专业化。1931年《歌女红牡丹》上映，中国电影开始进入有声电影时代。`,
  events: [
    {
      id: "orphan-rescues-ancestor-1923", year: 1923,
      title: "《孤儿救祖记》推动国产电影发展",
      description: "明星影片公司推出长故事片《孤儿救祖记》，影片将家庭伦理故事与社会教化结合，获得商业成功。它不仅帮助明星公司确立了以长故事片为主的生产方向，也吸引更多资本进入电影行业。",
      type: "film",
      archiveFilms: [{ id: "archive-orphan-rescues-ancestor-1923", title: "孤儿救祖记", genre: "家庭伦理片", credits: [{ role: "导演", name: "张石川" }, { role: "编剧", name: "郑正秋" }, { role: "主演", name: "王汉伦、郑小秋" }], synopsis: "富家女子余蔚如婚后生子，却因家庭财产纠纷遭到陷害，被迫离开家庭。多年以后，她的儿子长大并揭露真相，最终使家庭重新团聚。", significance: "中国早期家庭伦理片代表作。影片的商业成功证明国产长故事片具有稳定的市场，也推动中国电影由早期探索进入持续生产阶段。" }],
    },
    {
      id: "national-film-companies-emerge-1924-1925", year: 1924, endYear: 1925,
      title: "民族电影公司大量出现",
      description: "国产电影的商业前景吸引越来越多投资者进入电影行业。大中华、百合、长城、神州、民新等影片公司相继开展电影生产。不同公司逐渐形成自己的创作方向，行业由少数公司的尝试发展为多个制片机构共同竞争。",
      type: "industry",
    },
    {
      id: "tianyi-film-company-founded-1925", year: 1925,
      title: "天一影片公司成立",
      description: "邵醉翁、邵邨人、邵仁枚、邵逸夫兄弟创办天一影片公司。天一公司重视传统故事和大众娱乐，积极把民间传说、古典小说和戏曲故事改编成电影，并开拓东南亚华人市场。",
      type: "industry",
      archiveFilms: [{ id: "butterfly-lovers-pain-1925", title: "梁祝痛史", genre: "古装爱情片", credits: [{ role: "导演", name: "邵醉翁" }], synopsis: "根据梁山伯与祝英台的民间传说改编，讲述梁山伯与祝英台相爱却受到封建礼教阻碍，最终以悲剧结束的故事。", significance: "体现早期电影公司利用传统文化资源进行商业类型片生产的方式，也推动古装片成为20年代国产电影的重要类型。" }],
    },
    {
      id: "film-industry-competition-intensifies-1926", year: 1926,
      title: "电影行业竞争加剧",
      description: "随着电影公司数量增加，国产电影市场竞争日益激烈。明星、大中华百合、民新等公司在发行和放映领域展开联合，希望扩大国产影片市场。电影杂志、明星照片和影片广告大量出现，早期电影明星制度逐渐形成。",
      type: "industry",
    },
    {
      id: "martial-arts-supernatural-rise-1927-1928", year: 1927, endYear: 1928,
      title: "武侠神怪片兴起",
      description: "明星影片公司拍摄《火烧红莲寺》，并于1928年上映。影片将武侠小说、神怪想象和电影特技结合，获得巨大商业成功。此后明星公司连续拍摄多集，其他电影公司也大量制作武侠、神怪和古装影片。",
      type: "film",
      archiveFilms: [{ id: "burning-red-lotus-temple-1928", title: "火烧红莲寺", genre: "武侠神怪片", credits: [{ role: "导演", name: "张石川" }, { role: "主演", name: "夏佩珍、胡蝶" }], synopsis: "影片根据平江不肖生小说《江湖奇侠传》改编，围绕江湖侠客、红莲寺和正邪冲突展开故事，并加入飞剑、法术等神怪元素。", significance: "中国早期武侠神怪片的重要代表。影片的成功推动武侠片形成成熟的商业类型，也显示电影公司已经能够通过系列化生产持续吸引观众。" }],
    },
    {
      id: "commercial-genre-production-1928-1930", year: 1928, endYear: 1930,
      title: "商业类型片大量生产",
      description: "《火烧红莲寺》成功后，武侠、神怪、古装等影片迅速增加。各电影公司围绕热门题材展开模仿和竞争。商业类型片扩大了国产电影的观众基础，也推动电影制作数量快速增长，但大量重复生产和粗制滥造引起知识界和电影界批评。",
      type: "industry",
    },
    {
      id: "lianhua-film-company-founded-1930", year: 1930,
      title: "联华影业公司成立",
      description: "罗明佑整合华北电影有限公司、民新影片公司、大中华百合等电影力量，成立联华影业公司。联华重视影片的艺术质量和社会内容，并吸收孙瑜、卜万苍、蔡楚生等电影工作者，民族电影工业进一步走向规模化。",
      type: "industry",
    },
    {
      id: "urban-social-turn-1930-1931", year: 1930, endYear: 1931,
      title: "电影开始转向都市与社会生活",
      description: "联华推出《野草闲花》《恋爱与义务》《桃花泣血记》等影片。电影中的人物和空间逐渐从传统家庭和古装世界转向现代都市、青年爱情和社会阶层。",
      type: "film",
      archiveFilms: [
        { id: "love-and-duty-1931", title: "恋爱与义务", genre: "爱情片", credits: [{ role: "导演", name: "卜万苍" }, { role: "主演", name: "阮玲玉、金焰" }], synopsis: "女主人公在爱情、婚姻和家庭责任之间作出选择，个人情感不断受到社会伦理和现实生活的限制。", significance: "通过女性命运讨论自由爱情与传统家庭责任之间的矛盾，也是阮玲玉早期的重要代表作。" },
        { id: "peach-blossom-weeps-blood-1931", title: "桃花泣血记", genre: "爱情片", credits: [{ role: "导演", name: "卜万苍" }, { role: "主演", name: "阮玲玉、金焰" }], synopsis: "富家青年与贫苦女子相爱，却因家庭和社会阶层差异受到阻碍，最终走向悲剧。", significance: "将爱情故事与贫富差距、阶层观念结合，体现中国电影由单纯商业娱乐逐渐转向现实社会问题。" },
      ],
    },
    {
      id: "chinese-sound-film-emerges-1931", year: 1931,
      title: "中国有声电影出现",
      description: "明星影片公司推出《歌女红牡丹》，采用蜡盘配音方式，使人物对白和歌曲能够与电影画面同步播放。电影从此不再完全依靠字幕、现场乐队和电影解说员，中国电影开始由无声电影向有声电影转型。",
      type: "technology",
      archiveFilms: [{ id: "sing-song-girl-red-peony-1931", title: "歌女红牡丹", genre: "家庭伦理片／有声片", credits: [{ role: "导演", name: "张石川" }, { role: "主演", name: "胡蝶" }], synopsis: "歌女红牡丹忍受丈夫的挥霍和虐待，在家庭矛盾与生活困境中维持家庭，最终经历一系列命运变化。", significance: "中国第一部成功公映的蜡盘配音有声故事片，标志着中国电影开始进入有声电影时代。" }],
    },
    {
      id: "national-cinema-new-stage-1931", year: 1931,
      title: "民族电影进入新的历史阶段",
      description: "“九一八”事变爆发后，中国社会的民族危机进一步加深。电影工作者开始重新思考电影与现实社会、民族国家之间的关系。单纯追求娱乐效果的武侠神怪片逐渐受到批评，社会现实、民族危机和普通人的生活开始成为电影创作更加重要的内容。",
      type: "historical",
    },
  ],
  representativeFilmIds: [],
  representativePersonIds: [],
};
