import type { CinemaHistoryStage } from "@/types/cinema";

export const chinaSixthStage: CinemaHistoryStage = {
  id: "seventeen-years-cinema",
  title: "“十七年”电影",
  shortTitle: "十七年",
  yearStart: 1949,
  yearEnd: 1966,
  yearLabel: "1949—1966",
  summary:
    "中华人民共和国成立后，中国电影逐步建立以国营制片厂为主体的生产体系。北京、上海、长春等地成为主要生产基地，工农兵、革命历史和社会主义建设成为重要银幕题材。十七年间，电影创作受到政治环境影响，也形成了战争片、喜剧片、戏曲片、动画片等具有时代特色的作品。",
  events: [
    {
      id: "this-life-of-mine-1950",
      year: 1950,
      title: "《我这一辈子》表现旧社会底层人生",
      description:
        "石挥自导自演《我这一辈子》，根据老舍小说改编，以一个普通巡警的一生观察清末至民国时期的社会变化。影片延续40年代现实主义传统，石挥的表演和影片对普通人物命运的刻画成为这一时期的重要创作成果。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-this-life-of-mine-1950",
          title: "我这一辈子",
          genre: "社会剧情片",
          credits: [
            { role: "导演", name: "石挥" },
            { role: "主演", name: "石挥" },
            { role: "原作", name: "老舍" },
          ],
          synopsis:
            "一个普通巡警经历时代动荡，在贫困和社会压迫中度过一生。",
          significance:
            "延续战后现实主义电影传统，以小人物命运表现近代社会变迁。",
        },
      ],
    },
    {
      id: "life-of-wu-xun-1951",
      year: 1951,
      title: "《武训传》引发全国性电影批判",
      description:
        "孙瑜导演、赵丹主演的《武训传》上映，以清末武训行乞兴学的经历为故事核心。影片上映后受到政治批判，并引发全国范围的讨论。这场批判深刻影响了此后电影创作与文艺政策的关系。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-life-of-wu-xun-1951",
          title: "武训传",
          genre: "传记片",
          credits: [
            { role: "导演", name: "孙瑜" },
            { role: "主演", name: "赵丹" },
          ],
          synopsis:
            "武训依靠行乞积累资金，希望通过兴办义学帮助穷人获得教育。",
          significance:
            "影片引发的全国性批判成为新中国早期电影史的重要事件，显示电影创作与政治评价之间日益紧密的关系。",
        },
      ],
    },
    {
      id: "butterfly-lovers-1954",
      year: 1954,
      title: "《梁山伯与祝英台》推动彩色戏曲电影发展",
      description:
        "桑弧、黄沙导演越剧电影《梁山伯与祝英台》，由袁雪芬、范瑞娟主演。影片将传统戏曲表演与彩色电影技术结合，并在国内外获得广泛传播，成为新中国早期戏曲电影的重要代表。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-butterfly-lovers-1954",
          title: "梁山伯与祝英台",
          genre: "越剧戏曲片",
          credits: [
            { role: "导演", name: "桑弧、黄沙" },
            { role: "主演", name: "袁雪芬、范瑞娟" },
          ],
          synopsis:
            "祝英台女扮男装求学，与梁山伯相爱，却因封建婚姻制度阻隔最终成为悲剧。",
          significance:
            "新中国早期彩色戏曲电影代表，推动传统戏曲通过电影获得更广泛传播。",
        },
      ],
    },
    {
      id: "new-years-sacrifice-1956",
      year: 1956,
      title: "《祝福》将鲁迅作品搬上彩色银幕",
      description:
        "桑弧导演、白杨主演《祝福》，根据鲁迅小说改编。影片以祥林嫂的悲剧命运批判封建礼教，并使用彩色摄影完成文学经典的银幕改编。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-new-years-sacrifice-1956",
          title: "祝福",
          genre: "文学改编片",
          credits: [
            { role: "导演", name: "桑弧" },
            { role: "主演", name: "白杨" },
            { role: "原作", name: "鲁迅" },
          ],
          synopsis:
            "祥林嫂在丧夫、再嫁和失子后不断受到封建礼教和社会偏见排斥，最终走向悲剧。",
          significance:
            "新中国文学名著改编的重要作品，也是中国早期彩色故事片代表。",
        },
      ],
    },
    {
      id: "woman-basketball-player-no-5-1957",
      year: 1957,
      title: "《女篮五号》表现新的青年形象",
      description:
        "谢晋导演《女篮五号》，由刘琼、秦怡等主演，以篮球运动员的成长经历连接新旧两个时代。影片将体育、青春和个人命运结合，使社会主义时期的青年生活成为银幕的重要内容，也成为谢晋导演生涯的代表性起点。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-woman-basketball-player-no-5-1957",
          title: "女篮五号",
          genre: "体育片",
          credits: [
            { role: "导演", name: "谢晋" },
            { role: "主演", name: "刘琼、秦怡" },
          ],
          synopsis:
            "围绕两代篮球运动员的经历展开，通过体育事业表现人物在新旧社会中的不同命运。",
          significance:
            "中国早期彩色体育故事片代表，塑造了新中国电影中的青年和体育工作者形象。",
        },
      ],
    },
    {
      id: "shop-of-the-lin-family-1959",
      year: 1959,
      title: "《林家铺子》延续现实主义文学改编",
      description:
        "水华导演、夏衍改编的《林家铺子》上映，根据茅盾小说创作。影片通过一家小商铺的经营困境表现20世纪30年代社会经济环境，将文学现实主义传统转化为成熟的电影叙事。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-shop-of-the-lin-family-1959",
          title: "林家铺子",
          genre: "社会剧情片",
          credits: [
            { role: "导演", name: "水华" },
            { role: "编剧", name: "夏衍" },
            { role: "原作", name: "茅盾" },
          ],
          synopsis:
            "小商人林老板努力维持店铺经营，却在经济压力和社会矛盾中逐渐陷入困境。",
          significance: "十七年时期文学改编和现实主义电影的重要代表。",
        },
      ],
    },
    {
      id: "song-of-youth-1959",
      year: 1959,
      title: "《青春之歌》塑造革命知识青年",
      description:
        "崔嵬、陈怀皑导演《青春之歌》，根据杨沫同名小说改编，由谢芳主演。影片通过林道静的成长表现知识青年从追求个人自由走向参加革命的过程，成为国庆十周年前后具有代表性的革命历史题材作品。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-song-of-youth-1959",
          title: "青春之歌",
          genre: "革命历史片",
          credits: [
            { role: "导演", name: "崔嵬、陈怀皑" },
            { role: "主演", name: "谢芳" },
            { role: "原作", name: "杨沫" },
          ],
          synopsis:
            "青年女性林道静在社会动荡中逐渐接受革命思想，并走上革命道路。",
          significance:
            "塑造了十七年电影中具有代表性的革命青年女性形象。",
        },
      ],
    },
    {
      id: "five-golden-flowers-1960",
      year: 1960,
      title: "《五朵金花》形成轻喜剧表达",
      description:
        "王家乙导演《五朵金花》，以云南大理为背景，将爱情故事、民族生活和社会主义建设结合。影片轻松明快的风格受到观众欢迎，并在海外传播，成为十七年时期少数具有鲜明喜剧和爱情色彩的作品。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-five-golden-flowers-1960",
          title: "五朵金花",
          genre: "爱情喜剧片",
          credits: [
            { role: "导演", name: "王家乙" },
            { role: "主演", name: "杨丽坤、莫梓江" },
          ],
          synopsis:
            "青年阿鹏寻找心爱的金花，却接连遇到几个同名女子，由此产生一系列误会。",
          significance:
            "将民族风情、爱情喜剧和新时代生活结合，是十七年电影中具有代表性的轻喜剧作品。",
        },
      ],
    },
    {
      id: "red-detachment-of-women-1961",
      year: 1961,
      title: "《红色娘子军》成为革命战争片代表",
      description:
        "谢晋导演《红色娘子军》，由祝希娟、王心刚主演。影片塑造吴琼花从受压迫女性成长为革命战士的过程，上映后产生广泛影响，并成为此后同名舞剧等艺术形式的重要基础。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-red-detachment-of-women-1961",
          title: "红色娘子军",
          genre: "革命战争片",
          credits: [
            { role: "导演", name: "谢晋" },
            { role: "主演", name: "祝希娟、王心刚" },
          ],
          synopsis:
            "海南女子吴琼花逃离地主压迫，加入红军娘子军，在革命斗争中逐渐成长。",
          significance:
            "将女性解放、人物成长与革命历史结合，是十七年革命战争电影的重要代表。",
        },
      ],
    },
    {
      id: "havoc-in-heaven-1961",
      year: 1961,
      title: "《大闹天宫》建立中国动画的民族风格",
      description:
        "万籁鸣导演、上海美术电影制片厂制作的《大闹天宫》开始推出，影片根据《西游记》改编。作品吸收京剧、壁画和传统绘画等艺术元素，在造型、动作和色彩上形成鲜明的民族风格，并在国际上获得较高评价。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-havoc-in-heaven-1961",
          title: "大闹天宫",
          genre: "动画片",
          credits: [{ role: "导演", name: "万籁鸣" }],
          synopsis:
            "孙悟空反抗天庭束缚，与天兵天将展开斗争，大闹天宫。",
          significance:
            "中国动画“民族化”探索的代表作，也是中国动画电影史最具影响力的作品之一。",
        },
      ],
    },
    {
      id: "early-spring-in-february-1963",
      year: 1963,
      title: "《早春二月》探索知识分子的复杂心理",
      description:
        "谢铁骊导演《早春二月》，根据柔石小说《二月》改编，由孙道临、谢芳主演。影片通过知识分子的理想、爱情和社会责任展开人物冲突，以细腻的心理描写形成不同于革命战争片的创作风格。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-early-spring-in-february-1963",
          title: "早春二月",
          genre: "文学改编片",
          credits: [
            { role: "导演", name: "谢铁骊" },
            { role: "主演", name: "孙道临、谢芳" },
            { role: "原作", name: "柔石《二月》" },
          ],
          synopsis:
            "知识青年萧涧秋来到江南小镇，希望帮助身边的人，却在爱情、同情和社会现实之间陷入矛盾。",
          significance:
            "以人物心理和人道主义情感见长，是十七年时期较具艺术探索性的作品。",
        },
      ],
    },
    {
      id: "zhang-ga-the-soldier-boy-1964",
      year: 1964,
      title: "《小兵张嘎》塑造儿童抗战英雄",
      description:
        "崔嵬、欧阳红樱导演《小兵张嘎》，以抗日战争时期的少年张嘎为主人公。影片将战争、儿童成长和幽默元素结合，张嘎成为中国电影中具有代表性的少年英雄形象。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-zhang-ga-the-soldier-boy-1964",
          title: "小兵张嘎",
          genre: "儿童／战争片",
          credits: [
            { role: "导演", name: "崔嵬、欧阳红樱" },
            { role: "主演", name: "安吉斯" },
          ],
          synopsis:
            "少年张嘎在抗日战争中参加革命队伍，并在战斗中逐渐成长。",
          significance:
            "十七年时期儿童战争电影代表，塑造了影响广泛的少年英雄形象。",
        },
      ],
    },
    {
      id: "stage-sisters-1965",
      year: 1965,
      title: "《舞台姐妹》回望女性与戏曲艺人的命运",
      description:
        "谢晋导演《舞台姐妹》，由谢芳、曹银娣主演，以越剧女演员的经历表现旧社会到新社会的时代变化。影片将女性命运、戏曲行业和社会变迁结合，是谢晋在十七年时期的重要作品。",
      type: "film",
      archiveFilms: [
        {
          id: "archive-stage-sisters-1965",
          title: "舞台姐妹",
          genre: "剧情片",
          credits: [
            { role: "导演", name: "谢晋" },
            { role: "主演", name: "谢芳、曹银娣" },
          ],
          synopsis:
            "两名越剧女演员从乡村戏班进入上海，在不同人生选择中经历友情、分离与重逢。",
          significance:
            "以女性和戏曲艺人的命运表现时代变迁，也是十七年电影结束前的重要作品。",
        },
      ],
    },
    {
      id: "seventeen-years-stage-ends-1966",
      year: 1966,
      title: "十七年电影阶段结束",
      description:
        "“文化大革命”开始后，正常故事片生产和既有电影创作体系受到严重冲击，大量电影和电影工作者受到批判。1949年以来逐步形成的电影创作格局由此中断，中国电影进入一个高度政治化并以“样板戏”电影为代表的特殊时期。",
      type: "historical",
    },
  ],
  representativeFilmIds: [],
  representativePersonIds: [],
};
