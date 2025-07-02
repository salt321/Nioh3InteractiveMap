// Get DOM elements
const mapContainer = document.getElementById('mapContainer');
const customMenu = document.getElementById('customMenu');
const mapImage = document.getElementById('mapImage');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');

// Map and grid configuration constants
const MAP_WIDTH = 2160;
const MAP_HEIGHT = 2295;
const ROWS = 150;
const COLS = 150;
const CELL_W = MAP_WIDTH / COLS;
const CELL_H = MAP_HEIGHT / ROWS;

// Expose these globally for debugging or external usage
window.ROWS = ROWS;
window.COLS = COLS;
window.CELL_W = CELL_W;
window.CELL_H = CELL_H;
window.MAP_WIDTH = MAP_WIDTH;
window.MAP_HEIGHT = MAP_HEIGHT;

// Initialize grid data structure: 2D array of cells with properties
const grid = [];
for (let r = 0; r < ROWS; r++) {
  const row = [];
  for (let c = 0; c < COLS; c++) {
    row.push({
      height: 0,
      walkable: true,
      x: c,
      y: ROWS - 1 - r // invert y axis to match coordinate system
    });
  }
  grid.push(row);
}

// Convert pixel coordinates to grid cell indices, with bounds clamping
function pixelToCell(px, py) {
  return {
    row: Math.min(ROWS - 1, Math.max(0, Math.floor(py / CELL_H))),
    col: Math.min(COLS - 1, Math.max(0, Math.floor(px / CELL_W)))
  };
}

// Convert grid cell indices to pixel coordinates (top-left corner of the cell)
function cellToPixel(row, col) {
  return {
    x: col * CELL_W,
    y: row * CELL_H
  };
}

// Initial transform state
let scale = 1;
const minScale = 0.85;
const maxScale = 5;
const scaleStep = 0.1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

// Clamp the offsets so the map image doesn't move out of container bounds
function clampOffsets() {
  const containerWidth = mapContainer.clientWidth;
  const containerHeight = mapContainer.clientHeight;
  const imageWidth = mapImage.naturalWidth;
  const imageHeight = mapImage.naturalHeight;

  const displayWidth = imageWidth * scale;
  const displayHeight = imageHeight * scale;

  let offsetX_min = Math.min(0, containerWidth - displayWidth);
  let offsetY_min = Math.min(0, containerHeight - displayHeight);

  offsetX = Math.min(0, Math.max(offsetX_min, offsetX));
  offsetY = Math.min(0, Math.max(offsetY_min, offsetY));
}

// Setup grid overlay canvas and 2D drawing context for debugging
const gridCanvas = document.getElementById('gridOverlay');
const ctx = gridCanvas.getContext('2d');
let debugOn = false;

// Resize the grid canvas to match scaled map image size (physical pixels)
function resizeGridCanvas() {
  const imageNaturalWidth = mapImage.naturalWidth;
  const imageNaturalHeight = mapImage.naturalHeight;

  gridCanvas.width = imageNaturalWidth * scale;
  gridCanvas.height = imageNaturalHeight * scale;

  // Keep CSS size in sync with physical size to avoid stretching
  gridCanvas.style.width = gridCanvas.width + 'px';
  gridCanvas.style.height = gridCanvas.height + 'px';
}

// Draw the grid lines over the map for debug visualization
function drawGrid() {
  if (!ctx) return;
  ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
  ctx.beginPath();

  const cellHeight = gridCanvas.height / ROWS;
  const cellWidth = gridCanvas.width / COLS;

  // Draw horizontal lines
  for (let i = 1; i < ROWS; i++) {
    const y = i * cellHeight;
    ctx.moveTo(0, y);
    ctx.lineTo(gridCanvas.width, y);
  }
  // Draw vertical lines
  for (let j = 1; j < COLS; j++) {
    const x = j * cellWidth;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, gridCanvas.height);
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

// Apply CSS transform to map image and grid canvas (if debug on)
function updateTransform() {
  const mapTransform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
  mapImage.style.transform = mapTransform;

  if (debugOn) {
    // Grid canvas only translates; resizing done separately
    gridCanvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    resizeGridCanvas();
    drawGrid();
  }
}

// Disable default browser ctrl+wheel zooming
window.addEventListener('wheel', e => {
  if (e.ctrlKey) e.preventDefault();
}, { passive: false });

// Disable native right-click context menu globally
window.addEventListener('contextmenu', e => e.preventDefault());

// When map image loads, calculate initial scale and center it in container
mapImage.onload = () => {
  const containerWidth = mapContainer.clientWidth;
  const containerHeight = mapContainer.clientHeight;
  const imageWidth = mapImage.naturalWidth;
  const imageHeight = mapImage.naturalHeight;

  const scaleX = containerWidth / imageWidth;
  const scaleY = containerHeight / imageHeight;
  scale = Math.min(scaleX, scaleY) * 2.5; // Start zoomed in 2.5x

  if (scale > maxScale) scale = maxScale;
  if (scale < minScale) scale = minScale;

  offsetX = (containerWidth - imageWidth * scale) / 2;
  offsetY = (containerHeight - imageHeight * scale) / 2;

  clampOffsets();
  updateTransform();
};

// Zoom in/out buttons bind to zoomAtCenter function
zoomInBtn.onclick = () => zoomAtCenter(true);
zoomOutBtn.onclick = () => zoomAtCenter(false);

// Zoom function that zooms in or out centered on container center
function zoomAtCenter(zoomIn) {
  const rect = mapContainer.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  // Calculate map coordinates under center point before zoom
  const imageX = (centerX - offsetX) / scale;
  const imageY = (centerY - offsetY) / scale;

  // Update scale within limits
  scale = zoomIn ? Math.min(maxScale, scale + scaleStep) : Math.max(minScale, scale - scaleStep);

  // Adjust offsets to keep zoom centered on same map point
  offsetX = centerX - imageX * scale;
  offsetY = centerY - imageY * scale;

  clampOffsets();
  updateTransform();
}

// Mouse drag to pan functionality
mapContainer.addEventListener('mousedown', e => {
  isDragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  mapContainer.style.cursor = 'grabbing';
});

mapContainer.addEventListener('mousemove', e => {
  if (!isDragging) return;
  offsetX += e.clientX - dragStartX;
  offsetY += e.clientY - dragStartY;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  clampOffsets();
  updateTransform();
});

mapContainer.addEventListener('mouseup', () => {
  isDragging = false;
  mapContainer.style.cursor = 'grab';
});
mapContainer.addEventListener('mouseleave', () => {
  isDragging = false;
  mapContainer.style.cursor = 'grab';
});

// Zoom on mouse wheel around cursor position
mapContainer.addEventListener('wheel', (e) => {
  e.preventDefault();
  const rect = mapContainer.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const imageX = (mouseX - offsetX) / scale;
  const imageY = (mouseY - offsetY) / scale;

  scale = e.deltaY < 0 ? Math.min(maxScale, scale + scaleStep) : Math.max(minScale, scale - scaleStep);
  offsetX = mouseX - imageX * scale;
  offsetY = mouseY - imageY * scale;

  clampOffsets();
  updateTransform();
}, { passive: false });

// Sidebar menu toggle button
const menuToggleBtn = document.getElementById('menuToggle');
const sideMenu = document.getElementById('sideMenu');
menuToggleBtn.addEventListener('click', () => {
  const isOpen = sideMenu.classList.toggle('open');
  mapContainer.classList.toggle('menu-open', isOpen);
  menuToggleBtn.classList.toggle('menu-open', isOpen);
});

// Music player controls
const musicToggleBtn = document.getElementById('musicToggle');
const bgMusic = document.getElementById('bgMusic');
const volumeControl = document.getElementById('volumeControl');
let isPlaying = false;

// Update music toggle button UI
function updateButton() {
  musicToggleBtn.classList.toggle('paused', !isPlaying);
}

// Try autoplay music on page load
function tryAutoPlay() {
  bgMusic.play().then(() => {
    isPlaying = true;
    updateButton();
  }).catch(() => {
    isPlaying = false;
    updateButton();
  });
}

// Music toggle button click handler
musicToggleBtn.addEventListener('click', () => {
  if (!isPlaying) {
    bgMusic.play().then(() => {
      isPlaying = true;
      updateButton();
    }).catch(() => {
      alert('auto-playing failed, please press "play" by yourself');
    });
  } else {
    bgMusic.pause();
    isPlaying = false;
    updateButton();
  }
});

// Set initial volume and update volume on slider input
bgMusic.volume = 0.3;
volumeControl.addEventListener('input', () => {
  bgMusic.volume = volumeControl.value / 100;
});

window.addEventListener('load', () => {
  tryAutoPlay();
});

// === Debug Grid toggle and export ===
const debugBtn = document.getElementById('debugToggle');

debugBtn.addEventListener('click', () => {
  debugOn = !debugOn;
  if (debugOn) {
    resizeGridCanvas();
    drawGrid();
    gridCanvas.style.display = 'block';
    gridCanvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

    // Export grid array as JSON file for debugging or external use
    const dataStr = JSON.stringify(grid, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'positionData.json';
    a.click();
    URL.revokeObjectURL(url);

  } else {
    gridCanvas.style.display = 'none';
  }
});

// Redraw grid canvas on window resize when debug is on
window.addEventListener('resize', () => {
  if (debugOn) {
    resizeGridCanvas();
    drawGrid();
  }
});

// Toggle walkable property on clicked grid cell (only in debug mode)
mapContainer.addEventListener('click', (e) => {
  if (!debugOn) return;

  const rect = mapContainer.getBoundingClientRect();
  const mouseX = (e.clientX - rect.left - offsetX) / scale;
  const mouseY = (e.clientY - rect.top - offsetY) / scale;
  const { row, col } = pixelToCell(mouseX, mouseY);

  grid[row][col].walkable = !grid[row][col].walkable;
  console.log(`Cell [${row}, ${col}] walkable:`, grid[row][col].walkable);

  // You can add code here to redraw cells with colors based on walkable
});

// Expose some useful methods globally for debugging or external manipulation
window.getGrid = () => grid;
window.getScale = () => scale;
window.getOffset = () => ({ x: offsetX, y: offsetY });
window.setOffset = (x, y) => {
  offsetX = x;
  offsetY = y;
  updateTransform();
};

// Highlight grid cell under mouse cursor in debug mode
function enableGridHoverHighlight() {
  let lastHoverRow = -1;
  let lastHoverCol = -1;

  function onMouseMove(e) {
    if (!debugOn) return;

    const rect = mapContainer.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - offsetX) / scale;
    const mouseY = (e.clientY - rect.top - offsetY) / scale;

    const row = Math.floor(mouseY / CELL_H);
    const col = Math.floor(mouseX / CELL_W);

    if (row === lastHoverRow && col === lastHoverCol) return;
    lastHoverRow = row;
    lastHoverCol = col;

    ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
    drawGrid();

    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;

    const cellW = gridCanvas.width / COLS;
    const cellH = gridCanvas.height / ROWS;

    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(col * cellW, row * cellH, cellW, cellH);
  }

  mapContainer.addEventListener('mousemove', onMouseMove);

  // Return a function to disable this hover highlight behavior
  return () => {
    mapContainer.removeEventListener('mousemove', onMouseMove);
  };
}

const disableHover = enableGridHoverHighlight();
// Call disableHover() if you want to disable hover highlight

// Custom context menu handling
document.addEventListener('DOMContentLoaded', () => {
  const menu = document.getElementById('customMenu');

  // Show custom menu on right-click, position it at mouse cursor
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    menu.style.display = 'block';
    menu.style.left = `${e.pageX}px`;
    menu.style.top = `${e.pageY}px`;
  });

  // Hide custom menu on any click elsewhere
  document.addEventListener('click', () => {
    menu.style.display = 'none';
  });
});
