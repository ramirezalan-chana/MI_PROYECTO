// ============================================================
//  Pedidos.js — StreetKicks · Mis Pedidos
// ============================================================

// ── Datos de pedidos ─────────────────────────────────────
const orders = [
  {
    id: 'SK-MO7MBSUC',
    status: 'transit',
    statusLabel: 'En tránsito',
    chipClass: 'chip-transit',
    date: '20/4/2026, 14:59:11',
    items: 1,
    price: '$119.00',
    emoji: '👟',
    progressClass: 'transit',
    progressLabel: '62% completado',
    canTrack: true
  },
  {
    id: 'SK-XR9KPQTZ',
    status: 'processing',
    statusLabel: 'Procesando',
    chipClass: 'chip-processing',
    date: '19/4/2026, 10:23:44',
    items: 2,
    price: '$247.00',
    emoji: '👟',
    progressClass: 'processing',
    progressLabel: 'Preparando envío',
    canTrack: false
  },
  {
    id: 'SK-BN3TLWUE',
    status: 'ready',
    statusLabel: 'Listo para retirar',
    chipClass: 'chip-ready',
    date: '14/4/2026, 08:11:30',
    items: 1,
    price: '$89.00',
    emoji: '👟',
    progressClass: 'ready',
    progressLabel: 'Disponible en punto',
    canTrack: true
  },
  {
    id: 'SK-DV2CWMJA',
    status: 'delivered',
    statusLabel: 'Entregado',
    chipClass: 'chip-delivered',
    date: '02/4/2026, 16:45:00',
    items: 3,
    price: '$320.00',
    emoji: '👟',
    progressClass: 'delivered',
    progressLabel: 'Completado',
    canTrack: false
  }
];

// ── Estado activo de filtro ──────────────────────────────
let activeFilter = 'all';

// ── Cambiar filtro ───────────────────────────────────────
function filterOrders(filter, el) {
  activeFilter = filter;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderOrders();
}

// ── Renderizar tarjetas ──────────────────────────────────
function renderOrders() {
  const list = document.getElementById('ordersList');
  const filtered = activeFilter === 'all'
    ? orders
    : orders.filter(o => o.status === activeFilter);

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty">
        <div class="empty-icon">📦</div>
        <div class="empty-title">Sin pedidos</div>
        <div class="empty-sub">No tienes pedidos en este estado.</div>
      </div>`;
    return;
  }

  list.innerHTML = filtered.map((o, i) => `
    <div class="order-card" style="animation-delay:${i * 0.06}s">
      <div class="order-main">
        <div class="order-img">${o.emoji}</div>
        <div class="order-details">
          <div class="order-id-row">
            <span class="order-id">Pedido ${o.id}</span>
            <span class="chip ${o.chipClass}">${o.statusLabel}</span>
          </div>
          <div class="order-date">${o.date} · ${o.items} artículo(s)</div>
        </div>
        <div class="order-right">
          <span class="order-price">${o.price}</span>
          <svg class="chevron" width="16" height="16" fill="none" stroke="currentColor"
               stroke-width="2" viewBox="0 0 24 24">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </div>
      <div class="order-progress">
        <div class="mini-track">
          <div class="mini-fill ${o.progressClass}"></div>
        </div>
        <div class="mini-labels">
          <span>Confirmado</span>
          <span>${o.progressLabel}</span>
          <span>Entregado</span>
        </div>
      </div>
      ${o.canTrack
        ? `<button class="track-btn" onclick="goToTracking()">
             <svg width="13" height="13" fill="none" stroke="currentColor"
                  stroke-width="2.2" viewBox="0 0 24 24">
               <circle cx="12" cy="12" r="10"/>
               <circle cx="12" cy="12" r="3"/>
             </svg>
             Ver tracking en tiempo real
           </button>`
        : `<button class="track-btn muted-btn">Ver detalles del pedido</button>`
      }
    </div>
  `).join('');
}

// ── Navegar a Tracking ───────────────────────────────────
function goToTracking() {
  window.location.href = 'Tracking.html';
}

// ── Inicializar ──────────────────────────────────────────
renderOrders();