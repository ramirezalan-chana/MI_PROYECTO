/* ============================================================
   Menu.js — Lógica principal de STREETKICKS
   Requiere: UserAuth.js, Carrito_S.js, Carrito_M.js
   ============================================================ */

/* ---------- DATOS DE PRODUCTOS ---------- */
const productos = [
  {
    id: 0,
    marca: "Nike · Kids",
    nombre: "Junior Bolt",
    precio: 89.99,
    desc: "Diversión en cada paso con amortiguación perfecta para los más pequeños.",
    info: "Material: Tela deportiva\nMarca: Nike",
    imgs: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500&q=80",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&q=80"
    ]
  },
  {
    id: 1,
    marca: "Nike · Running",
    nombre: "Air Runner Blue",
    precio: 129,
    desc: "Diseño aerodinámico ideal para corredores que buscan velocidad y comodidad.",
    info: "Material: Mesh transpirable y suela de goma EVA\nMarca: Nike",
    imgs: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&q=80"
    ]
  },
  {
    id: 2,
    marca: "Puma · Street",
    nombre: "Street Force",
    precio: 74.99,
    desc: "Estilo urbano sin límites, diseñado para quienes viven la calle.",
    info: "Material: Cuero sintético y suela de goma\nMarca: Puma",
    imgs: [
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80"
    ]
  },
  {
    id: 3,
    marca: "New Balance · Pro",
    nombre: "EcoStep Pro",
    precio: 129.99,
    desc: "Rendimiento sostenible con materiales reciclados de alta tecnología.",
    info: "Material: Tejido reciclado y foam verde\nMarca: New Balance",
    imgs: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&q=80",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500&q=80",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80"
    ]
  }
];

const tallas = [26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46];

let currentProduct = null;
let selectedSize   = null;
let cart = (() => {
  try { return JSON.parse(localStorage.getItem('sk_cart')) || []; }
  catch { return []; }
})();

/* ============================================================
   MODAL DE PRODUCTO
   ============================================================ */
function openProduct(idx) {
  currentProduct = productos[idx];
  selectedSize   = null;

  document.getElementById('pmBrand').textContent  = currentProduct.marca;
  document.getElementById('pmName').textContent   = currentProduct.nombre;
  document.getElementById('pmPrice').textContent  = '$' + currentProduct.precio.toFixed(2);
  document.getElementById('pmDesc').textContent   = currentProduct.desc;
  document.getElementById('pmInfoBox').innerHTML  = currentProduct.info
    .split('\n').map(l => `<p>${l}</p>`).join('');
  document.getElementById('pmMainImg').src        = currentProduct.imgs[0];
  document.getElementById('selectedSize').textContent = '-';

  /* Miniaturas */
  const thumbs = document.getElementById('pmThumbs');
  thumbs.innerHTML = '';
  currentProduct.imgs.forEach((src, i) => {
    const t = document.createElement('img');
    t.src       = src;
    t.className = i === 0 ? 'thumb active' : 'thumb';
    t.onclick   = () => {
      document.getElementById('pmMainImg').src = src;
      thumbs.querySelectorAll('.thumb').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
    };
    thumbs.appendChild(t);
  });

  /* Grid de tallas */
  const grid = document.getElementById('pmSizeGrid');
  grid.innerHTML = '';
  tallas.forEach(s => {
    const btn = document.createElement('button');
    btn.textContent = s;
    btn.className   = 'size-btn';
    btn.onclick     = () => {
      grid.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = s;
      document.getElementById('selectedSize').textContent = s;
    };
    grid.appendChild(btn);
  });

  document.getElementById('productOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProduct(e) {
  if (e.target === document.getElementById('productOverlay')) closeProductModal();
}

function closeProductModal() {
  document.getElementById('productOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

function addToCart() {
  if (!selectedSize) { alert('Selecciona una talla primero.'); return; }
  const ex = cart.find(i => i.nombre === currentProduct.nombre && i.talla === selectedSize);
  if (ex) ex.qty++;
  else cart.push({ ...currentProduct, talla: selectedSize, qty: 1 });
  updateCartBadge();
  syncCartStorage();
  closeProductModal();
}

/* ============================================================
   CARRITO
   ============================================================ */
function updateCartBadge() {
  document.getElementById('cartBadge').textContent = cart.reduce((s, i) => s + i.qty, 0);
}

function syncCartStorage() {
  localStorage.setItem('sk_cart', JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent('cartUpdated'));
}

function openCartPanel() {
  renderCart();
  document.getElementById('cartOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

function closeCartEvent(e) {
  if (e.target === document.getElementById('cartOverlay')) closeCart();
}

function renderCart() {
  const c = document.getElementById('cartItems');
  c.innerHTML = '';
  if (!cart.length) {
    c.innerHTML = '<p style="text-align:center;color:#999;padding:2rem">Tu carrito está vacío</p>';
    document.getElementById('cartTotal').textContent = '$0.00';
    return;
  }
  let total = 0;
  cart.forEach((item, idx) => {
    total += item.precio * item.qty;
    const d = document.createElement('div');
    d.className = 'cart-item';
    d.innerHTML = `
      <img src="${item.imgs[0]}" alt="${item.nombre}"/>
      <div class="ci-info">
        <p class="ci-name">${item.nombre}</p>
        <p class="ci-sub">Talla ${item.talla} · $${item.precio.toFixed(2)}</p>
        <div class="ci-qty">
          <button onclick="changeQty(${idx},-1)">−</button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${idx},1)">+</button>
        </div>
      </div>
      <div class="ci-right">
        <button class="ci-delete" onclick="removeItem(${idx})">🗑</button>
        <span class="ci-total">$${(item.precio * item.qty).toFixed(2)}</span>
      </div>`;
    c.appendChild(d);
  });
  document.getElementById('cartTotal').textContent = '$' + total.toFixed(2);
}

function changeQty(idx, d) {
  cart[idx].qty += d;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  updateCartBadge();
  syncCartStorage();
  renderCart();
}

function removeItem(idx) {
  cart.splice(idx, 1);
  updateCartBadge();
  syncCartStorage();
  renderCart();
}

/* ============================================================
   CHECKOUT
   ============================================================ */
function openCheckout() {
  if (!cart.length) return;
  closeCart();
  showPane(0);

  const total = cart.reduce((s, i) => s + i.precio * i.qty, 0);
  document.getElementById('btnPagar').textContent = '🔒 Pagar $' + total.toFixed(2);

  /* Pre-llenar correo si hay sesión activa */
  if (window.UserAuth && UserAuth.isAuthenticated()) {
    const u = UserAuth.getUser();
    if (u && u.email) document.getElementById('inEmail').value = u.email;
  } else {
    document.getElementById('inEmail').value = '';
  }

  document.getElementById('checkoutOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCheckoutEvent(e) {
  if (e.target === document.getElementById('checkoutOverlay')) closeCheckout();
}

function closeCheckout() {
  document.getElementById('checkoutOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

function showPane(n) {
  document.querySelectorAll('.checkout-pane').forEach((p, i) => p.classList.toggle('hidden', i !== n));
  document.querySelectorAll('.step').forEach((s, i) => s.classList.toggle('active', i <= n));
}

function nextStep(cur) {
  if (cur === 0) {
    const email = document.getElementById('inEmail').value.trim();
    const pass  = document.getElementById('inPass').value;
    let ok = true;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showErr('errEmail', 'Ingresa un correo válido'); ok = false;
    } else clearErr('errEmail');
    if (pass.length < 6) {
      showErr('errPass', 'Mínimo 6 caracteres'); ok = false;
    } else clearErr('errPass');
    if (ok) showPane(1);

  } else if (cur === 1) {
    const nombre  = document.getElementById('inNombre').value.trim();
    const calle   = document.getElementById('inCalle').value.trim();
    const ciudad  = document.getElementById('inCiudad').value.trim();
    const cp      = document.getElementById('inCP').value.trim();
    const pais    = document.getElementById('inPais').value;
    let ok = true;
    if (!nombre || /\d/.test(nombre)) { showErr('errNombre', 'Solo se permiten letras'); ok = false; } else clearErr('errNombre');
    if (!calle)                        { showErr('errCalle',  'Ingresa tu calle');         ok = false; } else clearErr('errCalle');
    if (!ciudad || /\d/.test(ciudad))  { showErr('errCiudad', 'Solo se permiten letras'); ok = false; } else clearErr('errCiudad');
    if (!cp || !/^\d+$/.test(cp))      { showErr('errCP',     'Solo se permiten números'); ok = false; } else clearErr('errCP');
    if (!pais)                         { showErr('errPais',   'Selecciona un país');       ok = false; } else clearErr('errPais');
    if (ok) {
      const total = cart.reduce((s, i) => s + i.precio * i.qty, 0);
      document.getElementById('resCorreo').textContent   = 'Correo: ' + document.getElementById('inEmail').value;
      document.getElementById('resEnvio').textContent    = 'Envío a: ' + nombre + ', ' + ciudad + ', ' + pais;
      document.getElementById('resArticulos').textContent= 'Artículos: ' + cart.reduce((s, i) => s + i.qty, 0);
      document.getElementById('resTotal').textContent    = '$' + total.toFixed(2);
      showPane(2);
    }
  } else if (cur === 2) {
    showPane(3);
  }
}

function pagarAhora() {
  const num  = document.getElementById('inCardNum').value.replace(/\s/g, '');
  const name = document.getElementById('inCardName').value.trim();
  const exp  = document.getElementById('inCardExp').value;
  const cvc  = document.getElementById('inCardCvc').value;
  let ok = true;
  if (num.length < 16)              { showErr('errCardNum',  'Número inválido (16 dígitos)'); ok = false; } else clearErr('errCardNum');
  if (!name || /\d/.test(name))     { showErr('errCardName', 'Solo letras, sin números');     ok = false; } else clearErr('errCardName');
  if (!/^\d{2}\/\d{2}$/.test(exp)) { showErr('errCardExp',  'Formato MM/AA');                ok = false; } else clearErr('errCardExp');
  if (cvc.length < 3)               { showErr('errCardCvc',  'CVC inválido (mín 3 dígitos)'); ok = false; } else clearErr('errCardCvc');
  if (ok) {
    closeCheckout();
    localStorage.setItem('pagoProcesado', 'true');
    cart = [];
    updateCartBadge();
    syncCartStorage();
    document.getElementById('successOverlay').classList.add('active');
  }
}

function closeSuccess() {
  document.getElementById('successOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

/* ============================================================
   HELPERS DE FORMULARIO
   ============================================================ */
function soloLetras(input, errId)  { input.value = input.value.replace(/[0-9]/g, ''); clearErr(errId); }
function soloLetrasCard(input)     { input.value = input.value.replace(/[0-9]/g, ''); updateCardDisplay(); clearErr('errCardName'); }
function soloNumeros(input, errId) { input.value = input.value.replace(/\D/g, ''); clearErr(errId); }

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

function showErr(id, msg) { document.getElementById(id).textContent = msg; }
function clearErr(id)     { document.getElementById(id).textContent = ''; }

/* ============================================================
   CHIP DE USUARIO EN MENÚ
   ============================================================ */
function initMenuUserChip() {
  const chip      = document.getElementById('menuUserChip');
  const dropdown  = document.getElementById('menuUserDropdown');
  const dropName  = document.getElementById('menuUserDropdownName');
  const dropEmail = document.getElementById('menuUserDropdownEmail');
  const btnIrUsr  = document.getElementById('btnIrUsuario');

  if (!window.UserAuth) { setTimeout(initMenuUserChip, 100); return; }

  const user          = UserAuth.getUser();
  const authenticated = UserAuth.isAuthenticated();

  if (!authenticated || !user) {
    chip.classList.add('hidden');
    if (btnIrUsr) btnIrUsr.style.display = '';
    return;
  }

  if (btnIrUsr) btnIrUsr.style.display = 'none';
  chip.classList.remove('hidden');

  const displayName      = (user.name || user.email || 'Usuario').trim();
  dropName.textContent   = displayName;
  dropEmail.textContent  = user.email || '';

  /* Reemplazar nodo para evitar listeners duplicados */
  chip.replaceWith(chip.cloneNode(true));
  const chipFresh     = document.getElementById('menuUserChip');
  const dropdownFresh = document.getElementById('menuUserDropdown');
  const logoutFresh   = document.getElementById('menuUserLogout');

  chipFresh.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = !dropdownFresh.classList.contains('hidden');
    dropdownFresh.classList.toggle('hidden', isOpen);
    chipFresh.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
  });

  logoutFresh.addEventListener('click', () => {
    UserAuth.logout();
    localStorage.removeItem('sk_cart');
    window.location.reload();
  });

  document.addEventListener('click', (e) => {
    const slot = document.getElementById('menuUserSlot');
    if (slot && !slot.contains(e.target)) {
      dropdownFresh.classList.add('hidden');
      chipFresh.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ============================================================
   CARRUSEL
   ============================================================ */
function initCarousel() {
  const track  = document.getElementById('carouselTrack');
  const dots   = document.querySelectorAll('.dot');
  let carouselIndex = 0;
  const carouselCount = track.querySelectorAll('.shoe-card').length;
  let carouselTimer = null;
  let resumeTimer   = null;

  function goToSlide(i) {
    const w = track.querySelector('.shoe-card').offsetWidth + 16;
    track.scrollTo({ left: w * i, behavior: 'smooth' });
    dots.forEach((d, j) => d.classList.toggle('active', j === i));
    carouselIndex = i;
  }

  /* Exponer globalmente para los onclick inline */
  window.goToSlide = goToSlide;

  track.addEventListener('scroll', () => {
    const w = track.querySelector('.shoe-card').offsetWidth + 16;
    const i = Math.round(track.scrollLeft / w);
    dots.forEach((d, j) => d.classList.toggle('active', j === i));
  });

  function startCarousel()   { clearInterval(carouselTimer); carouselTimer = setInterval(() => { carouselIndex = (carouselIndex + 1) % carouselCount; goToSlide(carouselIndex); }, 3000); }
  function stopCarousel()    { clearInterval(carouselTimer); carouselTimer = null; }
  function scheduleResume()  { clearTimeout(resumeTimer); resumeTimer = setTimeout(() => startCarousel(), 4500); }
  function cancelResume()    { clearTimeout(resumeTimer); }

  startCarousel();
  track.addEventListener('mouseenter', () => { stopCarousel(); cancelResume(); });
  track.addEventListener('mouseleave', () => { scheduleResume(); });
}

/* ============================================================
   INICIALIZACIÓN GENERAL (DOMContentLoaded)
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  /* Menú hamburguesa */
  document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.toggle('open');
    document.getElementById('menuToggle').classList.toggle('active');
  });

  /* Botón carrito → redirigir a Carrito.html */
  document.getElementById('openCart').addEventListener('click', () => {
    window.location.href = 'Carrito.html';
  });

  /* Badge inicial */
  updateCartBadge();

  /* Carrusel */
  initCarousel();

  /* Chip de usuario */
  initMenuUserChip();
});