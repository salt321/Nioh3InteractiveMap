📘 [中文版本 (Chinese)](./README.zh.md) | 📗 [日本語版 (Japanese)](./README.ja.md)

# Nioh 3 Interactive Map

> A fully interactive web-based map designed for *Nioh 3*.  
> Supports zoom, drag, custom markers, terrain highlighting.

---

## 🔧 Features

-  **Custom Markers** – Add points of interest like bosses, items, shortcuts
-  **Zoom & Pan** – Navigate freely across a high-resolution map
-  **Terrain Highlighting** – Clear visual distinction between playable and background areas
-  **Static Deployment** – Host on GitHub Pages, works entirely client-side

---

## 📦 Project Structure

```plaintext
.
├── index.html           # Main page
├── style.css            # Map styling
├── js/                  # JavaScript files
│   ├── map.js           # Logic for zooming, dragging, and markers
│   └── map_editing_tool.js # Editing tool logic
├── assets/              # Nioh3 related assets (pics, musics, buttons, etc)
│   └── xxx
└── data/
    └── markers.json     # Customizable marker data
