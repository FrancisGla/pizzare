const IMG_SRC = "logo3d.png";
const canvas = document.getElementById('puzzleCanvas');
const ctx = canvas.getContext('2d', { alpha: true });

let img = new Image();
img.src = IMG_SRC;

let pieces = [];
let cols = 4, rows = 4;
let pieceW, pieceH;
let dragging = null, offsetX = 0, offsetY = 0;
let scrollLocked = false;

/* Empêche le scroll mobile pendant le drag */
function lockScroll() {
  if (!scrollLocked) {
    document.body.style.overflow = 'hidden';
    scrollLocked = true;
  }
}
function unlockScroll() {
  document.body.style.overflow = '';
  scrollLocked = false;
}

function keepInsideCanvas(piece) {
  const rect = canvas.getBoundingClientRect(); // taille visible
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const maxX = canvas.width - piece.w;
  const maxY = canvas.height - piece.h;

  piece.x = Math.max(0, Math.min(piece.x, maxX));
  piece.y = Math.max(0, Math.min(piece.y, maxY));
}


function buildPieces() {
  pieces = [];
  pieceW = Math.floor(img.width / cols);
  pieceH = Math.floor(img.height / rows);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const sx = c * pieceW;
      const sy = r * pieceH;
      const sw = (c === cols - 1) ? img.width - sx : pieceW;
      const sh = (r === rows - 1) ? img.height - sy : pieceH;

      const p = {
        sx, sy, sw, sh,
        x: Math.random() * (canvas.width - canvas.width / cols),
        y: Math.random() * (canvas.height - canvas.height / rows),
        tx: c * (canvas.width / cols),
        ty: r * (canvas.height / rows),
        w: canvas.width / cols,
        h: canvas.height / rows,
        placed: false
      };

      keepInsideCanvas(p);
      pieces.push(p);
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const p of pieces) {
    ctx.drawImage(img, p.sx, p.sy, p.sw, p.sh, p.x, p.y, p.w, p.h);
  }
}

function isInside(piece, mx, my) {
  return mx > piece.x && mx < piece.x + piece.w && my > piece.y && my < piece.y + piece.h;
}

function startDrag(mx, my) {
  for (let i = pieces.length - 1; i >= 0; i--) {
    const p = pieces[i];
    if (isInside(p, mx, my) && !p.placed) {
      dragging = p;
      offsetX = mx - p.x;
      offsetY = my - p.y;
      pieces.splice(i, 1);
      pieces.push(p);
      lockScroll();
      break;
    }
  }
}

function moveDrag(mx, my) {
  if (dragging) {
    dragging.x = mx - offsetX;
    dragging.y = my - offsetY;
    keepInsideCanvas(dragging);
    draw();
  }
}

function stopDrag() {
  if (dragging) {
    if (
      Math.abs(dragging.x - dragging.tx) < 20 &&
      Math.abs(dragging.y - dragging.ty) < 20
    ) {
      dragging.x = dragging.tx;
      dragging.y = dragging.ty;
      dragging.placed = true;
    }
    dragging = null;
    draw();
    unlockScroll();
  }
}

canvas.addEventListener("mousedown", e => {
  const rect = canvas.getBoundingClientRect();
  startDrag(e.clientX - rect.left, e.clientY - rect.top);
});

canvas.addEventListener("mousemove", e => {
  if (dragging) {
    const rect = canvas.getBoundingClientRect();
    moveDrag(e.clientX - rect.left, e.clientY - rect.top);
  }
});

canvas.addEventListener("mouseup", stopDrag);
canvas.addEventListener("mouseleave", stopDrag);

canvas.addEventListener("touchstart", e => {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  startDrag(touch.clientX - rect.left, touch.clientY - rect.top);
}, { passive: false });

canvas.addEventListener("touchmove", e => {
  if (dragging) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    moveDrag(touch.clientX - rect.left, touch.clientY - rect.top);
  }
}, { passive: false });

canvas.addEventListener("touchend", stopDrag);

img.onload = () => {
  const rect = canvas.getBoundingClientRect();
  const size = Math.min(rect.width, rect.height);
  canvas.width = size;
  canvas.height = size;
  buildPieces();
  draw();
};

