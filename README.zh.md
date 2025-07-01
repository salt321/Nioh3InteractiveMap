
---

##  `README.zh.md`（中文）

```markdown
📘 [English Version](./README.md) | 📗 [日本語版](./README.ja.md)

# 仁王3互动地图

> 一个专为《仁王3》设计的互动式地图工具。  
> 支持缩放、拖拽、自定义标注、地形高亮，可部署至 GitHub Pages。纯前端实现，无需后端。

---

## 🔧 功能特性

-  **自定义标注** – 标注 Boss、宝箱、捷径等重要位置
-  **地图缩放与拖动** – 自由查看高清地图
-  **地形亮度处理** – 区分可探索与背景区域
-  **静态部署** – 可直接部署至 GitHub Pages

---

## 📦 项目结构

```plaintext
.
├── index.html        # 主页面
├── style.css         # 样式表
├── map.js            # 缩放、拖拽、标点逻辑
├── assets/
│   └── map.png       # 地图图片（支持4K）
└── data/
    └── markers.json  # 可自定义标注数据
