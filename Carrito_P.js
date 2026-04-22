document.addEventListener('DOMContentLoaded', () => {
  renderCartPage();
  window.addEventListener('cartUpdated', renderCartPage);

  const container = document.getElementById('cartPageItems');
  if (container) {
    container.addEventListener('click', handleCartActions);
  }
});

function renderCartPage() {
  const cart = CartState.getCart();
  const container = document.getElementById('cartPageItems');
  const emptyMsg = document.getElementById('cartEmpty');
  const cartContent = document.getElementById('cartContent');
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = CartState.getTotalItems();

  if (!cart.length) {
    if (emptyMsg) emptyMsg.classList.remove('hidden');
    if (cartContent) cartContent.classList.add('hidden');
    return;
  }
  if (emptyMsg) emptyMsg.classList.add('hidden');
  if (cartContent) cartContent.classList.remove('hidden');

  container.innerHTML = '';
  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-row';
    const talla = String(item.talla ?? '');
    row.innerHTML = `
      <div class="cart-row-img">
        <img src="${item.imgs ? item.imgs[0] : item.img}" alt="${item.nombre}" />
      </div>
      <div class="cart-row-info">
        <p class="cart-row-marca">${item.marca}</p>
        <h3 class="cart-row-nombre">${item.nombre}</h3>
        <p class="cart-row-talla">Talla: ${item.talla}</p>
      </div>
      <div class="cart-row-qty">
        <button type="button" class="cart-qty-btn" data-action="decrease" data-id="${item.id}" data-talla="${escapeHtmlAttr(talla)}">−</button>
        <span>${item.qty}</span>
        <button type="button" class="cart-qty-btn" data-action="increase" data-id="${item.id}" data-talla="${escapeHtmlAttr(talla)}">+</button>
      </div>
      <div class="cart-row-precio">
        <span class="cart-item-total">$${(item.precio * item.qty).toFixed(2)}</span>
        <button type="button" class="cart-row-delete" data-action="remove" data-id="${item.id}" data-talla="${escapeHtmlAttr(talla)}">Eliminar</button>
      </div>`;
    container.appendChild(row);
  });

  updateResumen(cart);
}

function updateResumen(cart) {
  const subtotal = CartState.getTotal();
  const envio = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + envio;

  const el = id => document.getElementById(id);
  if (el('resSubtotal')) el('resSubtotal').textContent = '$' + subtotal.toFixed(2);
  if (el('resEnvio'))    el('resEnvio').textContent    = envio === 0 ? 'Gratis' : '$' + envio.toFixed(2);
  if (el('resTotal'))    el('resTotal').textContent    = '$' + total.toFixed(2);
  if (el('btnPagarPage')) el('btnPagarPage').textContent = 'Proceder al pago · $' + total.toFixed(2);
}

function handleCartActions(event) {
  const btn = event.target.closest('button[data-action]');
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const talla = btn.dataset.talla;
  const action = btn.dataset.action;

  if (action === 'increase') {
    CartState.changeQty(id, talla, 1);
  } else if (action === 'decrease') {
    CartState.changeQty(id, talla, -1);
  } else if (action === 'remove') {
    CartState.removeItem(id, talla);
  }
}

function escapeHtmlAttr(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ===================== FACTURA =====================
function generarFactura() {
  const cart = CartState.getCart();
  if (!cart.length) return;

  const subtotal = CartState.getTotal();
  const envio = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + envio;
  const fecha = new Date().toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric' });
  const num = 'SK-' + Date.now().toString().slice(-6);

  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Factura ${num}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Segoe UI',sans-serif;color:#0a0a0a;background:#fff;padding:40px;}
    .factura{max-width:700px;margin:0 auto;}
    .f-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:2px solid #1a6fff;}
    .f-logo{font-size:1.8rem;font-weight:900;letter-spacing:-1px;}
    .f-logo span{color:#1a6fff;}
    .f-info{text-align:right;font-size:.85rem;color:#555;}
    .f-info strong{display:block;font-size:1rem;color:#0a0a0a;}
    .f-title{font-size:1.4rem;font-weight:700;margin-bottom:1.5rem;color:#1a6fff;}
    table{width:100%;border-collapse:collapse;margin-bottom:1.5rem;}
    th{background:#f4f5f7;padding:.7rem 1rem;text-align:left;font-size:.8rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#666;}
    td{padding:.85rem 1rem;border-bottom:1px solid #e0e3ea;font-size:.9rem;}
    .f-totales{margin-left:auto;width:280px;}
    .f-totales-row{display:flex;justify-content:space-between;padding:.5rem 0;font-size:.9rem;border-bottom:1px solid #e0e3ea;}
    .f-totales-row.total{font-weight:700;font-size:1.1rem;border-bottom:none;padding-top:.75rem;color:#1a6fff;}
    .f-footer{margin-top:2rem;padding-top:1rem;border-top:1px solid #e0e3ea;font-size:.8rem;color:#999;text-align:center;}
    .f-badge{display:inline-block;background:#e8f0ff;color:#1a6fff;padding:.2rem .7rem;border-radius:999px;font-size:.78rem;font-weight:700;}
    @media print{body{padding:20px;} button{display:none;}}
  </style>
</head>
<body>
<div class="factura">
  <div class="f-header">
    <div>
      <div class="f-logo">STREET<span>KICKS</span></div>
      <p style="font-size:.82rem;color:#666;margin-top:.3rem">streetkicks.com · contacto@streetkicks.com</p>
    </div>
    <div class="f-info">
      <strong>Factura ${num}</strong>
      <span>Fecha: ${fecha}</span>
      <span class="f-badge" style="margin-top:.4rem;display:block">PAGO SIMULADO</span>
    </div>
  </div>

  <p class="f-title">Detalle de compra</p>

  <table>
    <thead>
      <tr>
        <th>Producto</th>
        <th>Marca</th>
        <th>Talla</th>
        <th>Cant.</th>
        <th style="text-align:right">Precio unit.</th>
        <th style="text-align:right">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${cart.map(i => `
      <tr>
        <td>${i.nombre}</td>
        <td>${i.marca}</td>
        <td>${i.talla}</td>
        <td>${i.qty}</td>
        <td style="text-align:right">$${i.precio.toFixed(2)}</td>
        <td style="text-align:right">$${(i.precio * i.qty).toFixed(2)}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  <div class="f-totales">
    <div class="f-totales-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
    <div class="f-totales-row"><span>Envío</span><span>${envio === 0 ? 'Gratis' : '$' + envio.toFixed(2)}</span></div>
    <div class="f-totales-row total"><span>TOTAL</span><span>$${total.toFixed(2)}</span></div>
  </div>

  <div class="f-footer">
    <p>Esta es una factura de demostración. No se realizó ningún cobro real.</p>
    <p style="margin-top:.3rem">STREETKICKS © 2026 · Todos los derechos reservados</p>
    <button onclick="window.print()" style="margin-top:1rem;padding:.6rem 1.5rem;background:#1a6fff;color:white;border:none;border-radius:8px;cursor:pointer;font-size:.9rem;font-weight:600">🖨 Imprimir / Guardar PDF</button>
  </div>
</div>
</body></html>`);
  win.document.close();
}
