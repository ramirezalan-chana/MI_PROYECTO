/* =============================================
   Ckeckout.js — Lógica del modal de checkout
   Incluye validaciones, flujo de pasos y
   generación automática de factura HTML.
   ============================================= */

// ---------- NAVEGACIÓN DE PANELES ----------

document.addEventListener('DOMContentLoaded', () => {
  initCheckoutPage();
});

function showPane(n) {
  document.querySelectorAll('.co-pane').forEach((p, i) => {
    p.classList.toggle('hidden', i !== n);
  });

  // Actualizar dots de pasos
  document.querySelectorAll('.co-step').forEach((s, i) => {
    s.classList.remove('active', 'done');
    if (i < n)  s.classList.add('done');
    if (i === n) s.classList.add('active');
  });

  // Colorear líneas entre pasos
  document.querySelectorAll('.co-step-line').forEach((l, i) => {
    l.classList.toggle('done', i < n);
  });
}

function nextStep(cur) {

  // ---- PASO 0: Correo ----
  if (cur === 0) {
    const email = document.getElementById('inEmail').value.trim();
    let ok = true;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showErr('errEmail', 'Ingresa un correo válido'); ok = false;
    } else clearErr('errEmail');

    if (ok) showPane(1);

  // ---- PASO 1: Dirección ----
  } else if (cur === 1) {
    const nombre = document.getElementById('inNombre').value.trim();
    const calle  = document.getElementById('inCalle').value.trim();
    const ciudad = document.getElementById('inCiudad').value.trim();
    const cp     = document.getElementById('inCP').value.trim();
    const pais   = document.getElementById('inPais').value;
    let ok = true;

    if (!nombre || /\d/.test(nombre)) { showErr('errNombre', 'Solo se permiten letras'); ok = false; } else clearErr('errNombre');
    if (!calle)  { showErr('errCalle', 'Ingresa tu calle'); ok = false; } else clearErr('errCalle');
    if (!ciudad || /\d/.test(ciudad)) { showErr('errCiudad', 'Solo se permiten letras'); ok = false; } else clearErr('errCiudad');
    if (!cp || !/^\d+$/.test(cp)) { showErr('errCP', 'Solo se permiten números'); ok = false; } else clearErr('errCP');
    if (!pais) { showErr('errPais', 'Selecciona un país'); ok = false; } else clearErr('errPais');

    if (ok) {
      prepareOrderSummary({
        email: document.getElementById('inEmail').value,
        nombre,
        ciudad,
        pais
      });
      showPane(2);
    }

  // ---- PASO 2: Resumen → Pago ----
  } else if (cur === 2) {
    showPane(3);
  }
}

// ---------- PAGO ----------

function pagarAhora() {
  const num  = document.getElementById('inCardNum').value.replace(/\s/g, '');
  const name = document.getElementById('inCardName').value.trim();
  const exp  = document.getElementById('inCardExp').value;
  const cvc  = document.getElementById('inCardCvc').value;
  let ok = true;

  if (num.length < 16)          { showErr('errCardNum',  'Número inválido (16 dígitos)'); ok = false; } else clearErr('errCardNum');
  if (!name || /\d/.test(name)) { showErr('errCardName', 'Solo letras, sin números');     ok = false; } else clearErr('errCardName');
  if (!/^\d{2}\/\d{2}$/.test(exp)) { showErr('errCardExp', 'Formato MM/AA');              ok = false; } else clearErr('errCardExp');
  if (cvc.length < 3)           { showErr('errCardCvc',  'CVC inválido (mín 3 dígitos)'); ok = false; } else clearErr('errCardCvc');

  if (ok) {
    const resumen = getCheckoutTotals();
    const identity = getCheckoutIdentity();

    // Guardar datos para la factura
    localStorage.setItem('pagoProcesado', 'true');
    localStorage.setItem('facturaData', JSON.stringify({
      email:    identity.email,
      nombre:   identity.nombre,
      calle:    identity.calle,
      ciudad:   identity.ciudad,
      cp:       identity.cp,
      pais:     identity.pais,
      total:    '$' + resumen.total.toFixed(2),
      articulos: CartState.getCart(),
      fecha:    new Date().toLocaleDateString('es-EC', { year:'numeric', month:'long', day:'numeric' }),
      numFactura: 'INV-' + Math.floor(100000 + Math.random() * 900000)
    }));

    const overlay = document.getElementById('checkoutOverlay');
    if (overlay) closeCheckout();
    CartState.clearCart();
    document.getElementById('successOverlay').classList.add('active');
  }
}

// ---------- FACTURA ----------

function descargarFactura() {
  let datos;
  try {
    datos = JSON.parse(localStorage.getItem('facturaData'));
  } catch { datos = null; }

  if (!datos) { alert('No se encontraron datos de factura.'); return; }

  const filas = (datos.articulos || []).map(i =>
    `<tr>
      <td>${i.nombre || i.name || 'Producto'}</td>
      <td style="text-align:center">${i.talla || '—'}</td>
      <td style="text-align:center">${i.qty}</td>
      <td style="text-align:right">$${(i.precio * i.qty).toFixed(2)}</td>
    </tr>`
  ).join('');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Factura ${datos.numFactura}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Barlow',sans-serif;background:#f9fafb;color:#111;padding:40px 20px}
  .factura{max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 30px rgba(0,0,0,.1)}
  .fac-header{background:#111;color:#fff;padding:28px 32px;display:flex;justify-content:space-between;align-items:flex-start}
  .fac-logo{font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:2rem;letter-spacing:1px}
  .fac-logo span{color:#f5c842}
  .fac-num{text-align:right}
  .fac-num p{font-size:.8rem;color:#9ca3af}
  .fac-num h3{font-family:'Barlow Condensed',sans-serif;font-size:1.2rem;font-weight:700;color:#fff}
  .fac-body{padding:28px 32px}
  .fac-info{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px}
  .fac-info-block h4{font-size:.7rem;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:4px}
  .fac-info-block p{font-size:.9rem;color:#374151}
  table{width:100%;border-collapse:collapse;margin-bottom:20px}
  thead tr{background:#f3f4f6}
  th{padding:10px 12px;font-size:.75rem;text-transform:uppercase;letter-spacing:.5px;color:#6b7280;font-weight:600;text-align:left}
  td{padding:10px 12px;font-size:.88rem;border-bottom:1px solid #f3f4f6;color:#374151}
  .fac-total{display:flex;justify-content:flex-end}
  .fac-total-box{background:#111;color:#fff;padding:14px 24px;border-radius:10px;min-width:200px}
  .fac-total-box p{font-size:.75rem;color:#9ca3af;margin-bottom:2px}
  .fac-total-box span{font-family:'Barlow Condensed',sans-serif;font-size:1.8rem;font-weight:900}
  .fac-footer{text-align:center;padding:18px;font-size:.78rem;color:#9ca3af;border-top:1px solid #f3f4f6}
</style>
</head>
<body>
<div class="factura">
  <div class="fac-header">
    <div class="fac-logo">STREET<span>KICKS</span></div>
    <div class="fac-num">
      <p>Nº de factura</p>
      <h3>${datos.numFactura}</h3>
      <p style="margin-top:4px">${datos.fecha}</p>
    </div>
  </div>
  <div class="fac-body">
    <div class="fac-info">
      <div class="fac-info-block">
        <h4>Facturado a</h4>
        <p>${datos.nombre}</p>
        <p>${datos.calle}</p>
        <p>${datos.ciudad}, ${datos.cp}</p>
        <p>${datos.pais}</p>
      </div>
      <div class="fac-info-block">
        <h4>Correo</h4>
        <p>${datos.email}</p>
        <h4 style="margin-top:12px">Estado</h4>
        <p style="color:#10b981;font-weight:600">✅ Pagado (simulado)</p>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th style="text-align:center">Talla</th>
          <th style="text-align:center">Qty</th>
          <th style="text-align:right">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${filas || '<tr><td colspan="4" style="color:#9ca3af">Sin artículos</td></tr>'}
      </tbody>
    </table>
    <div class="fac-total">
      <div class="fac-total-box">
        <p>Total pagado</p>
        <span>${datos.total}</span>
      </div>
    </div>
  </div>
  <div class="fac-footer">
    STREETKICKS · Factura de simulación · Sin valor fiscal real
  </div>
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = datos.numFactura + '.html';
  a.click();
}

// ---------- CERRAR OVERLAYS ----------

function closeCheckout() {
  const overlay = document.getElementById('checkoutOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    return;
  }

  if (document.body.dataset.checkoutPage === 'true') {
    window.location.href = 'Carrito.html';
  }
}
function closeCheckoutEvent(e) {
  const overlay = document.getElementById('checkoutOverlay');
  if (overlay && e.target === overlay) closeCheckout();
}

// ---------- VALIDACIONES / FORMATEO ----------

function soloLetras(input, errId) {
  input.value = input.value.replace(/[0-9]/g, '');
  clearErr(errId);
}
function soloLetrasCard(input) {
  input.value = input.value.replace(/[0-9]/g, '');
  updateCardDisplay();
  clearErr('errCardName');
}
function soloNumeros(input, errId) {
  input.value = input.value.replace(/\D/g, '');
  clearErr(errId);
}
function formatCardNum(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 16);
  input.value = v.replace(/(.{4})/g, '$1 ').trim();
  const d = v.padEnd(16, '•');
  document.getElementById('cardDotsDisplay').textContent =
    d.substring(0,4) + ' ' + d.substring(4,8) + ' ' + d.substring(8,12) + ' ' + d.substring(12,16);
  clearErr('errCardNum');
}
function formatExp(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 4);
  if (v.length >= 3) v = v.substring(0, 2) + '/' + v.substring(2);
  input.value = v;
  document.getElementById('cardExpDisplay').textContent = v || 'MM/AA';
  clearErr('errCardExp');
}
function updateCardDisplay() {
  const n = document.getElementById('inCardName').value.toUpperCase();
  document.getElementById('cardNameDisplay').textContent = n || 'TU NOMBRE';
}
function togglePass() {
  const i = document.getElementById('inPass');
  i.type = i.type === 'password' ? 'text' : 'password';
}
function showErr(id, msg) { const el = document.getElementById(id); if (el) el.textContent = msg; }
function clearErr(id)     { const el = document.getElementById(id); if (el) el.textContent = ''; }

function initCheckoutPage() {
  if (!document.getElementById('checkoutShell')) return;

  document.body.dataset.checkoutPage = 'true';
  renderCheckoutSummary();
  updatePayButton();

  const user = window.UserAuth && UserAuth.isAuthenticated() ? UserAuth.getUser() : null;
  if (user) {
    fillCheckoutFromUser(user);
    prepareOrderSummary({
      email: user.email,
      nombre: user.name,
      ciudad: user.city,
      pais: user.country
    });
    showPane(2);
    return;
  }

  showPane(0);
}

function getCheckoutTotals() {
  const subtotal = CartState.getTotal();
  const envio = subtotal > 100 ? 0 : 9.99;

  return {
    subtotal,
    envio,
    total: subtotal + envio
  };
}

function renderCheckoutSummary() {
  const shell = document.getElementById('checkoutShell');
  const empty = document.getElementById('checkoutEmpty');
  const items = document.getElementById('checkoutItems');
  if (!shell || !empty || !items) return;

  const cart = CartState.getCart();
  if (!cart.length) {
    shell.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }

  shell.classList.remove('hidden');
  empty.classList.add('hidden');

  items.innerHTML = '';
  cart.forEach(item => {
    const row = document.createElement('article');
    row.className = 'checkout-item';
    row.innerHTML = `
      <img src="${item.imgs ? item.imgs[0] : item.img}" alt="${item.nombre}" />
      <div>
        <h3>${item.nombre}</h3>
        <p>${item.marca || 'STREETKICKS'} · Talla ${item.talla} · x${item.qty}</p>
      </div>
      <strong>$${(item.precio * item.qty).toFixed(2)}</strong>
    `;
    items.appendChild(row);
  });

  const resumen = getCheckoutTotals();
  setText('checkoutSubtotal', '$' + resumen.subtotal.toFixed(2));
  setText('checkoutEnvio', resumen.envio === 0 ? 'Gratis' : '$' + resumen.envio.toFixed(2));
  setText('checkoutTotal', '$' + resumen.total.toFixed(2));
}

function updatePayButton() {
  const btn = document.getElementById('btnPagar');
  if (!btn) return;

  const resumen = getCheckoutTotals();
  btn.textContent = 'Pagar $' + resumen.total.toFixed(2);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function fillCheckoutFromUser(user) {
  setInputValue('inEmail', user.email || '');
  setInputValue('inNombre', user.name || '');
  setInputValue('inCalle', user.street || '');
  setInputValue('inCiudad', user.city || '');
  setInputValue('inCP', user.postalCode || '');
  setSelectValue('inPais', user.country || '');
}

function prepareOrderSummary(data) {
  const resumen = getCheckoutTotals();
  setText('resCorreo', data.email || '—');
  setText('resEnvioCheck', [data.nombre, data.ciudad, data.pais].filter(Boolean).join(', ') || '—');
  setText('resArticulos', CartState.getTotalItems() + ' artículo(s)');
  setText('resTotalCheck', '$' + resumen.total.toFixed(2));
}

function getCheckoutIdentity() {
  const user = window.UserAuth && UserAuth.isAuthenticated() ? UserAuth.getUser() : null;
  if (user) {
    return {
      email: user.email || '',
      nombre: user.name || '',
      calle: user.street || '',
      ciudad: user.city || '',
      cp: user.postalCode || '',
      pais: user.country || ''
    };
  }

  return {
    email: document.getElementById('inEmail').value.trim(),
    nombre: document.getElementById('inNombre').value.trim(),
    calle: document.getElementById('inCalle').value.trim(),
    ciudad: document.getElementById('inCiudad').value.trim(),
    cp: document.getElementById('inCP').value.trim(),
    pais: document.getElementById('inPais').value
  };
}

function setInputValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function setSelectValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}
