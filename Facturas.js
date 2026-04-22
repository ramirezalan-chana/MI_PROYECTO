function verPedido(id) {
  const f = facturasData.find(x => x.id === id);
  if (!f) return;

  const subtotal = f.articulos.reduce((s, i) => s + i.precio * i.qty, 0);
  const envio = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + envio;

  // Renderizamos el contenido con el diseño de la imagen 3
  document.getElementById('pedidoContent').innerHTML = `
    <div class="detalle-pedido-box">
      <div class="pm-top">
        <div>
          <h2 class="pm-titulo">Pedido ${f.id}</h2>
          <p class="pm-meta">${f.fecha}</p>
        </div>
        <span class="estado-badge badge-completado">Procesando</span>
      </div>

      <div class="detalle-section">
        <h4>Productos</h4>
        <div class="info-card-gray">
          ${f.articulos.map(a => `
            <div class="detalle-prod-item">
              <div class="detalle-prod-img" style="background-image: url('imagenes/zapa-ejemplo.jpg'); background-size: cover;"></div>
              <div class="detalle-prod-info">
                <h5>${a.nombre}</h5>
                <p>Talla ${a.talla} · Cantidad ${a.qty}</p>
              </div>
              <div style="margin-left: auto; font-weight: 700;">$${a.precio.toFixed(2)}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="detalle-section">
        <h4>Resumen</h4>
        <div class="info-card-gray">
          <div class="resumen-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
          <div class="resumen-row"><span>Envío</span><span style="color:#10b981">${envio === 0 ? 'Gratis' : '$'+envio.toFixed(2)}</span></div>
          <div class="resumen-row total-bold"><span>Total</span><span>$${total.toFixed(2)}</span></div>
        </div>
      </div>

      <div class="detalle-grid-info">
        <div class="detalle-section">
          <h4>Envío</h4>
          <div class="info-card-gray">
            <div class="info-item-flex">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
               <span>${f.correo}</span>
            </div>
            <div class="info-item-flex">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
               <span><strong>${f.nombre}</strong><br>Calle Ficticia 123, Quito</span>
            </div>
          </div>
        </div>

        <div class="detalle-section">
          <h4>Pago</h4>
          <div class="info-card-gray">
             <div class="info-item-flex">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
               <span>Visa •••• 4242</span>
            </div>
          </div>
        </div>
      </div>

      <div class="detalle-footer-btns">
        <button class="btn-full-blue" onclick="descargarPDF('${f.id}')">Descargar factura PDF</button>
        <button class="btn-full-cancel" onclick="cancelarPedido('${f.id}')">Cancelar pedido</button>
      </div>
    </div>
  `;

  document.getElementById('pedidoOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}