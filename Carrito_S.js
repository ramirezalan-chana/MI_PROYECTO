
const CartState = (() => {
  const STORAGE_KEY = 'sk_cart';
  const MAX_QTY_PER_ITEM = 4;

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  function sameItem(item, id, talla) {
    return Number(item.id) === Number(id) && String(item.talla) === String(talla);
  }

  function addItem(producto, talla) {
    const cart = getCart();
    const ex = cart.find(i => sameItem(i, producto.id, talla));
    if (ex) {
      if (ex.qty >= MAX_QTY_PER_ITEM) {
        alert('Solo puedes agregar hasta 4 unidades de este producto.');
        return false;
      }
      ex.qty++;
    } else {
      cart.push({ ...producto, talla, qty: 1 });
    }
    saveCart(cart);
    dispatchUpdate();
    return true;
  }

  function removeItem(id, talla) {
    const cart = getCart().filter(i => !sameItem(i, id, talla));
    saveCart(cart);
    dispatchUpdate();
  }

  function changeQty(id, talla, delta) {
    const cart = getCart();
    const item = cart.find(i => sameItem(i, id, talla));
    if (item) {
      if (delta > 0 && item.qty >= MAX_QTY_PER_ITEM) {
        alert('El límite es de 4 unidades por producto.');
        return false;
      }
      item.qty += delta;
      if (item.qty <= 0) return removeItem(id, talla);
    }
    saveCart(cart);
    dispatchUpdate();
    return true;
  }

  function clearCart() {
    saveCart([]);
    dispatchUpdate();
  }

  function getTotal() {
    return getCart().reduce((s, i) => s + i.precio * i.qty, 0);
  }

  function getTotalItems() {
    return getCart().reduce((s, i) => s + i.qty, 0);
  }

  function dispatchUpdate() {
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }

  return { getCart, addItem, removeItem, changeQty, clearCart, getTotal, getTotalItems };
})();
