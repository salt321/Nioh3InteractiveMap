const mapContainer = document.getElementById('mapContainer');
const mapImage = document.getElementById('mapImage');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');






let scale = 1;
const minScale = 0.85;
const maxScale = 5;
const scaleStep = 0.1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

function clampOffsets() {
  const containerWidth = mapContainer.clientWidth;
  const containerHeight = mapContainer.clientHeight;
  const imageWidth = mapImage.naturalWidth;
  const imageHeight = mapImage.naturalHeight;

  const displayWidth = imageWidth * scale;
  const displayHeight = imageHeight * scale;

  let offsetX_min = Math.min(0, containerWidth - displayWidth);
  let offsetX_max = 0;
  let offsetY_min = Math.min(0, containerHeight - displayHeight);
  let offsetY_max = 0;

  if (displayWidth < containerWidth) {
    offsetX_min = offsetX_max = (containerWidth - displayWidth) / 2;
  }
  if (displayHeight < containerHeight) {
    offsetY_min = offsetY_max = (containerHeight - displayHeight) / 2;
  }

  offsetX = Math.min(offsetX_max, Math.max(offsetX_min, offsetX));
  offsetY = Math.min(offsetY_max, Math.max(offsetY_min, offsetY));
}

function updateTransform() {
  mapImage.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
}

// Defaut method Ctrl+ wheel banned
window.addEventListener('wheel', e => {
  if (e.ctrlKey) e.preventDefault();
}, { passive: false });

// Init Container
mapImage.onload = () => {
  const containerWidth = mapContainer.clientWidth;
  const containerHeight = mapContainer.clientHeight;
  const imageWidth = mapImage.naturalWidth;
  const imageHeight = mapImage.naturalHeight;

  const scaleX = containerWidth / imageWidth;
  const scaleY = containerHeight / imageHeight;
  scale = Math.min(scaleX, scaleY);

  scale = Math.min(scale * 2.5, maxScale);
  if (scale < minScale) scale = minScale;

  offsetX = (containerWidth - imageWidth * scale) / 2;
  offsetY = (containerHeight - imageHeight * scale) / 2;

  clampOffsets();
  updateTransform();
};

// Zooming Button Related
zoomInBtn.onclick = () => {
  zoomAtCenter(true);
};
zoomOutBtn.onclick = () => {
  zoomAtCenter(false);
};

function zoomAtCenter(zoomIn) {
  const rect = mapContainer.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const imageX = (centerX - offsetX) / scale;
  const imageY = (centerY - offsetY) / scale;

  scale = zoomIn
    ? Math.min(maxScale, scale + scaleStep)
    : Math.max(minScale, scale - scaleStep);

  offsetX = centerX - imageX * scale;
  offsetY = centerY - imageY * scale;

  clampOffsets();
  updateTransform();
}

// Mouse Left Button Drag Event Related
mapContainer.addEventListener('mousedown', (e) => {
  isDragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  mapContainer.style.cursor = 'grabbing';
});

mapContainer.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  offsetX += dx;
  offsetY += dy;
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

// Mouse Wheel Event Related
mapContainer.addEventListener('wheel', (e) => {
  e.preventDefault();
  const rect = mapContainer.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const imageX = (mouseX - offsetX) / scale;
  const imageY = (mouseY - offsetY) / scale;

  if (e.deltaY < 0) {
    scale = Math.min(maxScale, scale + scaleStep);
  } else {
    scale = Math.max(minScale, scale - scaleStep);
  }

  offsetX = mouseX - imageX * scale;
  offsetY = mouseY - imageY * scale;

  clampOffsets();
  updateTransform();
}, { passive: false });

/* --- Menu Control Related --- */
const menuToggleBtn = document.getElementById('menuToggle');
const sideMenu = document.getElementById('sideMenu');

menuToggleBtn.addEventListener('click', () => {
  const isOpen = sideMenu.classList.toggle('open');
  if (isOpen) {
    mapContainer.classList.add('menu-open');
    menuToggleBtn.classList.add('menu-open');
  } else {
    mapContainer.classList.remove('menu-open');
    menuToggleBtn.classList.remove('menu-open');
  }
});

/* --- Music Control related --- */
const musicToggleBtn = document.getElementById('musicToggle');
const bgMusic = document.getElementById('bgMusic');
const volumeControl = document.getElementById('volumeControl');
let isPlaying = false;

function updateButton() {
  if (isPlaying) {
    musicToggleBtn.classList.remove('paused');
  } else {
    musicToggleBtn.classList.add('paused');
  }
}

function tryAutoPlay() {
  bgMusic.play().then(() => {
    isPlaying = true;
    updateButton();
  }).catch(() => {
    isPlaying = false;
    updateButton();
  });
}

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

// init music volume to max
bgMusic.volume = 1.0;

// volume control event and calculations
volumeControl.addEventListener('input', () => {
  const vol = volumeControl.value / 100;  // 0 ~ 1
  bgMusic.volume = vol;
});

window.addEventListener('load', () => {
  tryAutoPlay();
});
