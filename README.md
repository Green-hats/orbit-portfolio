# Greenhats Portfolio

个人作品集的源码和可直接部署的静态网页。英文页为 `index.html`，中文页由英文页生成。当前线上地址：[greenhats.dev](https://greenhats.dev/)。

## 文件结构

```text
peach-orbit-portfolio/
├── dist/                 可直接作为网站根目录部署
│   ├── index.html        英文页面，也是中文页面的布局来源
│   ├── zh.html           生成的中文页面
│   ├── styles.css        样式与响应式布局
│   ├── site.js           环形导航、页面切换及交互
│   └── assets/
│       ├── images/       网站实际使用的压缩图片
│       ├── fonts/        字体及对应许可证
│       ├── tech/         技术栈图标及许可证
│       └── favicon.svg
├── originals/            保留原始角色图与项目截图，不参与部署
├── scripts/build_zh.py   从 index.html 生成 zh.html
├── docs/交付说明.md       交付包的详细说明与内容来源
├── requirements.txt      中文页面生成脚本的依赖
└── .openai/hosting.json  旧的 Sites 配置；当前线上使用独立服务器
```

设计稿与设计说明位于相邻的 `peach-orbit-design/` 文件夹。`Greenhats-Portfolio-Website/` 及同名 ZIP 是从 `dist/` 整理出的交付副本，说明文件来自 `docs/交付说明.md`。

## 本地查看与修改

在项目根目录运行：

```bash
python3 -m http.server 8766 --directory dist
```

打开 `http://127.0.0.1:8766/`。修改英文页面布局或内容后，重新生成中文页：

```bash
python3 -m pip install -r requirements.txt
python3 scripts/build_zh.py
```

部署时只需复制 `dist/` 内的文件。`originals/` 中的高清原图用于留存和重新导出，不应让浏览器下载。静态图片的引用均指向 `dist/assets/images/`。
