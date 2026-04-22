// ============================================================
//  Tracking.js — StreetKicks · Tracking de Envío
// ============================================================

// ── Temporizador regresivo (47 min) ──────────────────────
let totalSeconds = 47 * 60;

function updateTimer() {
  if (totalSeconds <= 0) return;
  totalSeconds--;

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  document.getElementById('etaHours').textContent = String(h).padStart(2, '0');
  document.getElementById('etaMins').textContent  = String(m).padStart(2, '0');
  document.getElementById('etaSecs').textContent  = String(s).padStart(2, '0');
}

setInterval(updateTimer, 1000);

// ── Animación del camión sobre curva Bézier ───────────────
// Puntos de control en el espacio 900×320 del SVG:
//   P0=(145,210)  P1=(300,210)  P2=(400,130)  P3=(680,95)

const truck        = document.getElementById('truckMarker');
const progressFill = document.getElementById('progressFill');
const progressPct  = document.getElementById('progressPct');

let t = 0.62;              // posición inicial en la ruta (0 → 1)
const DURATION = 60;       // segundos para un recorrido completo

/**
 * Interpolación cúbica de Bézier para un solo eje.
 * @param {number} t  Parámetro 0–1
 * @param {number} p0 Punto de inicio
 * @param {number} p1 Primer punto de control
 * @param {number} p2 Segundo punto de control
 * @param {number} p3 Punto de fin
 */
function bezier(t, p0, p1, p2, p3) {
  const mt = 1 - t;
  return mt * mt * mt * p0
       + 3 * mt * mt * t * p1
       + 3 * mt * t  * t * p2
       +     t  * t  * t * p3;
}

function animateTruck() {
  // Coordenadas en el viewBox 900×320
  const px = bezier(t, 145, 300, 400, 680);
  const py = bezier(t, 210, 210, 130,  95);

  // Convertir a porcentaje del contenedor real
  truck.style.left = (px / 900 * 100) + '%';
  truck.style.top  = (py / 320 * 100) + '%';

  // Progreso: arranca en 62 % y termina en 100 %
  const pct = Math.round(62 + t * 38);
  progressFill.style.width = pct + '%';
  progressPct.textContent  = pct + '% completado';

  // Avanzar t a 60 fps
  t += 1 / (DURATION * 60);
  if (t > 1) t = 0;        // reiniciar al llegar al destino

  requestAnimationFrame(animateTruck);
}

// Iniciar animación
animateTruck();