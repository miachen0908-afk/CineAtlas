# 影迹 · CineAtlas

一个以三维电影地球、国家电影史时间轴和影人档案为核心的世界电影史教学网站。

项目提供两种互不干扰的运行方式：

| 版本 | 用途 | 数据与功能 |
| --- | --- | --- |
| 内容维护版 | 教师与团队本地使用 | 连接 SQLite/Turso，保留内容编辑和版本记录 |
| 公开展示版 | 比赛、课堂与公众访问 | 纯静态文件，无编辑入口，无运行时数据库依赖 |

## 环境要求

- Node.js 20.9 或更高版本
- npm

## 内容维护版

复制 `.env.example` 为 `.env.local`，填写实际数据库配置后运行：

```bash
npm install
npm run dev
```

默认访问地址为 <http://localhost:3000>。维护版中的电影史编辑、保存和版本恢复功能保持可用。

## 生成公开展示版

公开版使用项目内的 `data/public-snapshot.json`，浏览者访问网站时不会连接 Turso 或本地 SQLite。

先在可以连接维护数据库的环境中更新公开快照：

```bash
npm run snapshot:public
```

再生成纯静态网站：

```bash
npm run build:public
```

最终文件位于 `out/`。可先在本机预览：

```bash
python3 -m http.server 4173 --directory out
```

然后打开 <http://localhost:4173>。

## 发布到腾讯云

将 `out/` 目录中的全部内容上传到腾讯云 COS 静态网站托管或部署到服务器的 Nginx 网站根目录。公开构建使用目录式链接，例如 `/country/cn/` 对应 `country/cn/index.html`，不需要依赖 Next.js 服务端。

更新公开内容时按以下顺序操作：

1. 在内容维护版中完成编辑并保存。
2. 运行 `npm run snapshot:public`，把当前数据库内容固化到项目快照。
3. 提交新的快照和代码。
4. 运行 `npm run build:public`。
5. 用新的 `out/` 覆盖线上静态文件。

## 常用检查

```bash
npx tsc --noEmit
npm run lint
npm run build
npm run build:public
```

不要提交 `.env.local`、数据库令牌或编辑口令。公开快照只包含展示所需的影片和电影史内容，不包含数据库凭据。
