// =============================================
// facturas.js - Lógica página Mis Facturas
// =============================================

const facturasData = [
  {
    id: 'SK-MO79XLN7',
    fecha: '20/4/2026, 9:12:13',
    nombre: 'alan ramirez',
    correo: 'aala@gmail.com',
    estado: 'procesando',
    total: 139.00,
    articulos: [
      { nombre: 'Air Runner Blue', marca: 'Nike',        talla: 28, qty: 1, precio: 129.00 },
      { nombre: 'Junior Bolt',     marca: 'Nike',        talla: 30, qty: 1, precio: 10.00  }
    ]
  },
  {
    id: 'SK-MO660QVY',
    fecha: '19/4/2026, 14:34:55',
    nombre: 'alan ramirez',
    correo: 'aala@gmail.com',
    estado: 'cancelado',
    motivoCancelacion: 'Producto cancelado',
    total: 89.00,
    articulos: [
      { nombre: 'Speed Track Pro', marca: 'Puma', talla: 42, qty: 1, precio: 89.00 }
    ]
  },
  {
    id: 'SK-MO441RTX',
    fecha: '15/4/2026, 11:05:44',
    nombre: 'alan ramirez',
    correo: 'aala@gmail.com',
    estado: 'completado',
    total: 258.00,
    articulos: [
      { nombre: 'Fresh Foam 1080', marca: 'New Balance', talla: 40, qty: 1, precio: 159.00 },
      { nombre: 'Dunk High Street', marca: 'Nike',       talla: 40, qty: 1, precio: 99.00  }
    ]
  }
];

let estadoActivo = 'todos';

function puedeDescargarFactura(estado) {
  return estado === 'procesando' || estado === 'completado';
}

// ===================== RENDER =====================
function renderFacturas(lista) {
  const container = document.getElementById('facturasList');
  const emptyMsg  = document.getElementById('facturasEmpty');
  container.innerHTML = '';

  if (!lista.length) { emptyMsg.classList.remove('hidden'); return; }
  emptyMsg.classList.add('hidden');

  lista.forEach(f => {
    const estados = {
      procesando: { label: 'Procesando', cls: 'badge-procesando' },
      completado:  { label: 'Completado',  cls: 'badge-completado'  },
      cancelado:   { label: 'Cancelado',   cls: 'badge-cancelado'   }
    };
    const { label, cls } = estados[f.estado] || { label: f.estado, cls: '' };
    const totalArt = f.articulos.reduce((s, i) => s + i.qty, 0);
    const mostrarBotonPDF = puedeDescargarFactura(f.estado);

    const card = document.createElement('div');
    card.className = `factura-card ${f.estado === 'cancelado' ? 'card-cancelada' : ''}`;
    card.innerHTML = `
      <div class="fc-left">
        <div class="fc-icon-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="#1a6fff" stroke-width="1.8" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div class="fc-datos">
          <div class="fc-titulo-row">
            <span class="fc-numero">Factura ${f.id}</span>
            <span class="estado-badge ${cls}">${label}</span>
          </div>
          <p class="fc-meta">${f.fecha} · ${f.nombre} · ${f.correo}</p>
          ${f.motivoCancelacion ? `<p class="fc-cancelacion-msg">⊘ ${f.motivoCancelacion}</p>` : ''}
        </div>
      </div>
      <div class="fc-right">
        <div class="fc-monto">
          <span class="fc-total">$${f.total.toFixed(2)}</span>
          <span class="fc-art-count">${totalArt} artículo${totalArt !== 1 ? 's' : ''}</span>
        </div>
        <button class="btn-ver-pedido" onclick="verPedido('${f.id}')">Ver pedido</button>
        ${mostrarBotonPDF ? `
        <button class="btn-pdf" onclick="descargarPDF('${f.id}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          PDF
        </button>` : ''}
      </div>`;
    container.appendChild(card);
  });
}

// ===================== FILTROS =====================
function filtrarFacturas() {
  const q = document.getElementById('searchFacturas').value.toLowerCase();
  const res = facturasData.filter(f => {
    const matchEstado   = estadoActivo === 'todos' || f.estado === estadoActivo;
    const matchBusqueda = !q || f.id.toLowerCase().includes(q) || f.nombre.toLowerCase().includes(q) || f.correo.toLowerCase().includes(q);
    return matchEstado && matchBusqueda;
  });
  renderFacturas(res);
}

function setEstado(estado, btn) {
  estadoActivo = estado;
  document.querySelectorAll('.filtro-estado').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filtrarFacturas();
}

// ===================== MODAL PEDIDO =====================
function verPedido(id) {
  const f = facturasData.find(x => x.id === id);
  if (!f) return;

  const estados = { procesando: { label: 'Procesando', cls: 'badge-procesando' }, completado: { label: 'Completado', cls: 'badge-completado' }, cancelado: { label: 'Cancelado', cls: 'badge-cancelado' } };
  const { label, cls } = estados[f.estado];
  const subtotal = f.articulos.reduce((s, i) => s + i.precio * i.qty, 0);
  const envio    = subtotal > 100 ? 0 : 9.99;
  const total    = subtotal + envio;

  document.getElementById('pedidoContent').innerHTML = `
    <div class="pm-top">
      <div>
        <h2 class="pm-titulo">Pedido ${f.id}</h2>
        <p class="pm-meta">${f.fecha} · ${f.nombre} · ${f.correo}</p>
      </div>
      <span class="estado-badge ${cls}">${label}</span>
    </div>

    <div class="pm-tabla">
      <div class="pm-thead">
        <span>Producto</span><span>Talla</span><span>Cant.</span><span style="text-align:right">Precio</span>
      </div>
      ${f.articulos.map(a => `
      <div class="pm-trow">
        <div>
          <p class="pm-art-n">${a.nombre}</p>
          <p class="pm-art-m">${a.marca}</p>
        </div>
        <span>${a.talla}</span>
        <span>${a.qty}</span>
        <span class="pm-art-p">$${(a.precio * a.qty).toFixed(2)}</span>
      </div>`).join('')}
    </div>

    <div class="pm-totales">
      <div class="pm-tot"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
      <div class="pm-tot"><span>Envío</span><span>${envio === 0 ? 'Gratis' : '$' + envio.toFixed(2)}</span></div>
      <div class="pm-tot pm-tot-final"><span>Total</span><span>$${total.toFixed(2)}</span></div>
    </div>

    <div class="pm-acciones">
      ${puedeDescargarFactura(f.estado) ? `
      <button class="btn-pdf" onclick="descargarPDF('${f.id}')">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        Descargar PDF
      </button>` : ''}
      ${f.estado === 'procesando' ? `<button class="btn-cancelar-pedido" onclick="cancelarPedido('${f.id}')">Cancelar pedido</button>` : ''}
    </div>`;

  document.getElementById('pedidoOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePedido() {
  document.getElementById('pedidoOverlay').classList.remove('active');
  document.body.style.overflow = '';
}
function closePedidoEvent(e) {
  if (e.target === document.getElementById('pedidoOverlay')) closePedido();
}

// ===================== CANCELAR =====================
function cancelarPedido(id) {
  if (!confirm('¿Seguro que deseas cancelar este pedido?')) return;
  const f = facturasData.find(x => x.id === id);
  if (f) { f.estado = 'cancelado'; f.motivoCancelacion = 'Cancelado por el cliente'; }
  closePedido();
  filtrarFacturas();
}

// ===================== PDF =====================
function descargarPDF(id) {
  const f = facturasData.find(x => x.id === id);
  if (!f) return;
  if (!puedeDescargarFactura(f.estado)) {
    alert('No puedes descargar la factura de un pedido cancelado.');
    return;
  }
  const subtotal = f.articulos.reduce((s, i) => s + i.precio * i.qty, 0);
  const envio    = subtotal > 100 ? 0 : 9.99;
  const total    = subtotal + envio;
  const estadoLabels = { procesando: 'Procesando', completado: 'Completado', cancelado: 'Cancelado' };

  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"/><title>Factura ${f.id}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Segoe UI',sans-serif;color:#0a0a0a;background:#fff;padding:40px;}
  .wrap{max-width:700px;margin:0 auto;}
  .hd{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:1.5rem;border-bottom:3px solid #1a6fff;margin-bottom:2rem;}
  .logo{font-size:1.9rem;font-weight:900;} .logo span{color:#1a6fff;}
  .meta{text-align:right;font-size:.83rem;color:#555;line-height:1.8;}
  .meta strong{font-size:1rem;color:#0a0a0a;display:block;}
  .badge{display:inline-block;padding:.2rem .7rem;border-radius:999px;font-size:.72rem;font-weight:700;margin-top:.3rem;}
  .procesando{background:#fff3cd;color:#856404;}
  .completado{background:#d1fae5;color:#065f46;}
  .cancelado{background:#fee2e2;color:#991b1b;}
  .sec{margin-bottom:1.5rem;}
  .sec-title{font-size:.72rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#888;margin-bottom:.6rem;padding-bottom:.35rem;border-bottom:1px solid #e0e3ea;}
  .datos p{font-size:.87rem;line-height:1.8;color:#333;}
  table{width:100%;border-collapse:collapse;margin-bottom:1.5rem;}
  th{background:#f4f5f7;padding:.6rem 1rem;text-align:left;font-size:.72rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#666;}
  td{padding:.75rem 1rem;border-bottom:1px solid #e0e3ea;font-size:.87rem;}
  td:last-child{text-align:right;font-weight:700;}
  .tots{margin-left:auto;width:250px;}
  .tot-row{display:flex;justify-content:space-between;padding:.4rem 0;font-size:.87rem;border-bottom:1px solid #e0e3ea;}
  .tot-row.fin{font-weight:700;font-size:1rem;border:none;padding-top:.5rem;color:#1a6fff;}
  .footer{margin-top:2.5rem;padding-top:1rem;border-top:1px solid #e0e3ea;font-size:.75rem;color:#aaa;text-align:center;line-height:1.8;}
  .print-btn{display:block;margin:1.2rem auto 0;padding:.6rem 1.5rem;background:#1a6fff;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:.88rem;font-weight:600;}
  @media print{.print-btn{display:none;}}
</style></head><body>
<div class="wrap">
  <div class="hd">
    <div><div class="logo">STREET<span>KICKS</span></div><p style="font-size:.8rem;color:#888;margin-top:.25rem">streetkicks.com</p></div>
    <div class="meta"><strong>Factura ${f.id}</strong><span>Fecha: ${f.fecha}</span><br/><span class="badge ${f.estado}">${estadoLabels[f.estado]}</span></div>
  </div>
  <div class="sec"><p class="sec-title">Datos del cliente</p><div class="datos"><p><strong>Nombre:</strong> ${f.nombre}</p><p><strong>Correo:</strong> ${f.correo}</p></div></div>
  <div class="sec"><p class="sec-title">Detalle del pedido</p>
    <table>
      <thead><tr><th>Producto</th><th>Marca</th><th>Talla</th><th>Cant.</th><th style="text-align:right">Unit.</th><th style="text-align:right">Subtotal</th></tr></thead>
      <tbody>${f.articulos.map(a=>`<tr><td>${a.nombre}</td><td>${a.marca}</td><td>${a.talla}</td><td>${a.qty}</td><td style="text-align:right">$${a.precio.toFixed(2)}</td><td>$${(a.precio*a.qty).toFixed(2)}</td></tr>`).join('')}</tbody>
    </table>
  </div>
  <div class="tots">
    <div class="tot-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
    <div class="tot-row"><span>Envío</span><span>${envio===0?'Gratis':'$'+envio.toFixed(2)}</span></div>
    <div class="tot-row fin"><span>TOTAL</span><span>$${total.toFixed(2)}</span></div>
  </div>
  <div class="footer"><p>Factura de demostración. No se realizó ningún cobro real.</p><p>STREETKICKS © 2026</p><button class="print-btn" onclick="window.print()">🖨 Imprimir / Guardar PDF</button></div>
</div></body></html>`);
  win.document.close();
}

document.addEventListener('DOMContentLoaded', filtrarFacturas);
