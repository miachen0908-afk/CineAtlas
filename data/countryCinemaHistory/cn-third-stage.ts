import type { CinemaHistoryStage } from "@/types/cinema";

export const chinaThirdStage: CinemaHistoryStage = {
  id: "left-wing-film-and-sound-transition",
  title: "左翼电影运动与有声转型",
  shortTitle: "左翼电影",
  yearStart: 1932,
  yearEnd: 1937,
  yearLabel: "1932—1937",
  summary: `九一八事变和一·二八事变后，民族危机加深，电影创作开始由商业娱乐转向社会现实。1932年前后，左翼文化工作者进入电影界，推动电影关注阶级差距、女性处境、民族危机和普通人的生活。同时，有声电影逐渐普及，电影语言从默片向声画结合转型。1937年全面抗战爆发，上海电影业原有格局被打破。`,
  events: [
    {
      id: "left-wing-film-movement-rises-1932", year: 1932,
      title: "左翼电影运动兴起",
      description: "左翼文化工作者陆续进入明星、联华等电影公司，通过编剧、导演和评论参与电影创作。电影题材开始明显转向社会现实，城市贫困、阶级矛盾和民族危机成为重要内容。",
      type: "movement",
    },
    {
      id: "left-wing-film-year-1933", year: 1933,
      title: "“左翼电影年”",
      description: "1933年前后，《狂流》《春蚕》《三个摩登女性》《小玩意》等影片集中出现，中国电影现实主义创作进入高潮。",
      type: "movement",
      archiveFilms: [
        { id: "torrent-1933", title: "狂流", genre: "社会现实片", credits: [{ role: "导演", name: "程步高" }, { role: "编剧", name: "夏衍" }, { role: "主演", name: "胡蝶" }], synopsis: "洪水袭击乡村，不同阶层的人面对灾难表现出不同态度。", significance: "左翼电影运动早期代表作，将自然灾害与社会矛盾结合。" },
        { id: "spring-silkworm-1933", title: "春蚕", genre: "社会现实片", credits: [{ role: "导演", name: "程步高" }, { role: "编剧", name: "夏衍" }, { role: "原作", name: "茅盾" }], synopsis: "江南蚕农辛苦养蚕，却因经济萧条和市场变化陷入困境。", significance: "中国早期现实主义电影代表，将镜头转向农村经济和普通劳动者。" },
      ],
    },
    {
      id: "urban-underclass-films-1934", year: 1934,
      title: "电影深入都市底层生活",
      description: "电影创作进一步关注失业、贫困和社会不平等，《神女》《渔光曲》等成为这一时期的重要作品。",
      type: "film",
      archiveFilms: [
        { id: "goddess-1934", title: "神女", genre: "社会现实片", credits: [{ role: "导演", name: "吴永刚" }, { role: "主演", name: "阮玲玉" }], synopsis: "一名单身母亲为抚养儿子被迫成为妓女，却不断遭受社会歧视和压迫。", significance: "通过女性命运表现都市底层生活，也是阮玲玉最重要的代表作之一。" },
        { id: "fishermans-song-1934", title: "渔光曲", genre: "社会现实片", credits: [{ role: "导演", name: "蔡楚生" }, { role: "主演", name: "王人美、韩兰根" }], synopsis: "贫苦渔民家庭在生活压力和社会变迁中不断挣扎，最终走向悲剧。", significance: "现实主义电影的重要代表，并在国际电影节获得荣誉，扩大了中国电影的国际影响。" },
      ],
    },
    {
      id: "realism-matures-1935", year: 1935,
      title: "现实主义电影走向成熟",
      description: "民族危机和社会矛盾进一步进入电影创作，《新女性》《大路》《风云儿女》等作品集中出现。",
      type: "film",
      archiveFilms: [
        { id: "new-woman-1935", title: "新女性", genre: "社会现实片", credits: [{ role: "导演", name: "蔡楚生" }, { role: "主演", name: "阮玲玉" }], synopsis: "知识女性韦明希望独立生活，却在经济压力、社会偏见和舆论攻击中走向悲剧。", significance: "集中表现现代女性追求独立所面对的社会困境。" },
        { id: "the-big-road-1935", title: "大路", genre: "社会现实片", credits: [{ role: "导演", name: "孙瑜" }, { role: "主演", name: "金焰、黎莉莉" }], synopsis: "一群青年参加公路建设，在劳动与战争威胁中表现出团结和牺牲精神。", significance: "将青年、劳动与民族救亡结合，体现电影主题由社会批判向民族意识扩展。" },
        { id: "children-of-troubled-times-1935", title: "风云儿女", genre: "抗战题材片", credits: [{ role: "导演", name: "许幸之" }, { role: "编剧", name: "田汉、夏衍" }, { role: "主演", name: "袁牧之、王人美" }], synopsis: "青年知识分子在民族危机中逐渐放弃个人安逸，走向抗敌救亡。", significance: "主题歌《义勇军进行曲》后来成为中华人民共和国国歌，成为中国电影与民族救亡运动结合的重要象征。" },
      ],
    },
    {
      id: "ruan-lingyu-dies-1935", year: 1935,
      title: "阮玲玉去世",
      description: "阮玲玉因私人生活受到媒体持续报道和舆论压力，于1935年去世。她塑造了大量受到家庭、贫困和社会制度压迫的女性形象，成为中国默片时代最具代表性的电影演员之一。",
      type: "person",
    },
    {
      id: "sound-film-spreads-1935-1936", year: 1935, endYear: 1936,
      title: "有声电影逐渐普及",
      description: "随着录音技术和影院设备改善，有声电影逐渐取代默片。对白、音乐和歌曲成为电影叙事的重要组成部分。《马路天使》《十字街头》等作品进一步将声音、都市空间和现实主义叙事结合，中国电影基本完成从默片向有声片的转型。",
      type: "technology",
    },
    {
      id: "urban-realism-peaks-1937", year: 1937,
      title: "都市现实主义电影达到高峰",
      description: "30年代都市现实主义电影将青年生活、都市空间、音乐喜剧与社会现实结合，形成这一时期的重要创作高峰。",
      type: "film",
      archiveFilms: [
        { id: "crossroads-1937", title: "十字街头", genre: "都市社会片", credits: [{ role: "导演", name: "沈西苓" }, { role: "主演", name: "赵丹、白杨" }], synopsis: "几名青年在上海面对失业、贫困和爱情困境，在现实压力中寻找生活出路。", significance: "以轻喜剧方式表现都市青年生活，是30年代现实主义电影的重要代表。" },
        { id: "street-angel-1937", title: "马路天使", genre: "都市社会片", credits: [{ role: "导演", name: "袁牧之" }, { role: "主演", name: "赵丹、周璇" }], synopsis: "歌女小红与吹鼓手陈少平生活在上海底层，在爱情和贫困中相互扶持。", significance: "将音乐、喜剧和社会现实结合，是中国早期有声电影的重要代表，也确立了周璇的银幕明星地位。" },
      ],
    },
    {
      id: "full-scale-war-breaks-out-1937", year: 1937,
      title: "全面抗战爆发",
      description: "七七事变和淞沪会战后，全面抗战爆发。上海电影生产受到战争冲击，大批电影工作者转移到内地及香港。中国电影的核心主题由30年代的社会现实批判进一步转向民族救亡和抗战宣传，进入新的历史阶段。",
      type: "historical",
    },
  ],
  representativeFilmIds: [],
  representativePersonIds: [],
};
