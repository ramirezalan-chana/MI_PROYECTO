function initMiniCart() {
  const btn = document.getElementById('openCart');
  if (!btn) return;

  // Crear mini carrito
  const mini = document.createElement('div');
  mini.id = 'miniCart';
  mini.className = 'mini-cart';
  mini.innerHTML = `
    <div class="mini-cart-header">
      <span>Tu carrito</span>
      <a href="carrito.html" class="mini-ver-todo">Ver todo →</a>
    </div>
    <div class="mini-cart-items" id="miniCartItems"></div>
    <div class="mini-cart-footer">
      <div class="mini-total-row">
        <span>Total</span>
        <span id="miniTotal">$0.00</span>
      </div>
      <a href="carrito.html" class="btn-primary mini-checkout-btn">Ir al carrito</a>
    </div>`;
  btn.parentElement.style.position = 'relative';
  btn.parentElement.appendChild(mini);

  // Hover
  let hideTimer;
  btn.addEventListener('mouseenter', () => { clearTimeout(hideTimer); renderMiniCart(); mini.classList.add('visible'); });
  btn.addEventListener('mouseleave', () => { hideTimer = setTimeout(() => mini.classList.remove('visible'), 300); });
  mini.addEventListener('mouseenter', () => clearTimeout(hideTimer));
  mini.addEventListener('mouseleave', () => { hideTimer = setTimeout(() => mini.classList.remove('visible'), 300); });

  // Click en ícono → ir a página carrito
  btn.addEventListener('click', () => { window.location.href = 'carrito.html'; });

  // Actualizar badge
  window.addEventListener('cartUpdated', () => { updateBadge(); renderMiniCart(); });
  updateBadge();
}

function updateBadge() {
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = CartState.getTotalItems();
}

function renderMiniCart() {
  const container = document.getElementById('miniCartItems');
  const totalEl = document.getElementById('miniTotal');
  if (!container) return;

  const cart = CartState.getCart();
  container.innerHTML = '';

  if (!cart.length) {
    container.innerHTML = '<p class="mini-empty">Tu carrito está vacío</p>';
    if (totalEl) totalEl.textContent = '$0.00';
    return;
  }

  cart.slice(0, 4).forEach(item => {
    const d = document.createElement('div');
    d.className = 'mini-item';
    d.innerHTML = `
      <img src="${item.imgs ? item.imgs[0] : item.img}" alt="${item.nombre}" />
      <div class="mini-item-info">
        <p class="mini-item-name">${item.nombre}</p>
        <p class="mini-item-sub">Talla ${item.talla} · x${item.qty}</p>
      </div>
      <span class="mini-item-precio">$${(item.precio * item.qty).toFixed(2)}</span>`;
    container.appendChild(d);
  });

  if (cart.length > 4) {
    const more = document.createElement('p');
    more.className = 'mini-more';
    more.textContent = `+${cart.length - 4} producto${cart.length - 4 > 1 ? 's' : ''} más`;
    container.appendChild(more);
  }

  if (totalEl) totalEl.textContent = '$' + CartState.getTotal().toFixed(2);
}

document.addEventListener('DOMContentLoaded', initMiniCart);