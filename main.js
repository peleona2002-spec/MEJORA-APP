/**
 * ============================================
 * Heladería y Frutería Arcoíris - main.js
 * Versión: 3.0
 * Funcionalidades:
 *   - Navbar scroll + menú móvil
 *   - Slideshow dinámico en el hero (fotos reales)
 *   - Render del catálogo (desde js/products.js) + filtro por categoría
 *   - Modal de detalle de producto
 *   - Carrito de compras completo (agregar, quitar, vaciar, pedir por WhatsApp)
 *   - Animaciones scroll-reveal
 *   - Contadores animados
 * ============================================
 */

'use strict';

/** Número de WhatsApp del negocio */
const WA_NUMBER = '573134292831';

/* =============================================
   1. CATÁLOGO ACTUAL (desde products.js + localStorage)
============================================= */
let products = getProducts();

/* =============================================
   2. ESTADO DEL CARRITO
============================================= */
/** @type {Array<{id: string, name: string, price: number, img: string, qty: number}>} */
let cart = [];

/* =============================================
   3. REFERENCIAS AL DOM
============================================= */
const header        = document.getElementById('header');
const navToggle      = document.getElementById('navToggle');
const navMenu        = document.getElementById('navMenu');
const navLinks       = document.querySelectorAll('.nav-link');
const filterBtns     = document.querySelectorAll('.filter-btn');
const scrollTopBtn   = document.getElementById('scrollTopBtn');
const currentYear    = document.getElementById('currentYear');
const productsGrid   = document.getElementById('productsGrid');

// Modal
const modal        = document.getElementById('productModal');
const modalClose    = document.getElementById('modalCloseBtn');
const modalImg      = document.getElementById('modalImg');
const modalTitle     = document.getElementById('modalTitle');
const modalDesc      = document.getElementById('modalDesc');
const modalPrice     = document.getElementById('modalPrice');
const modalWa        = document.getElementById('modalWhatsapp');
const modalAddCart   = document.getElementById('modalAddCart');

// Carrito
const cartBtn        = document.getElementById('cartBtn');
const cartBadge      = document.getElementById('cartBadge');
const cartDrawer     = document.getElementById('cartDrawer');
const cartOverlay    = document.getElementById('cartOverlay');
const cartClose      = document.getElementById('cartClose');
const cartEmpty      = document.getElementById('cartEmpty');
const cartItemsList  = document.getElementById('cartItemsList');
const cartSubtotal   = document.getElementById('cartSubtotal');
const cartTotal       = document.getElementById('cartTotal');
const cartCheckout   = document.getElementById('cartCheckout');
const cartClear      = document.getElementById('cartClear');

// Slideshow
const slides   = document.querySelectorAll('.slide');
const dots     = document.querySelectorAll('.dot');
const slidePrev = document.getElementById('slidePrev');
const slideNext = document.getElementById('slideNext');

/* =============================================
   4. AÑO DINÁMICO EN EL FOOTER
============================================= */
if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

/* =============================================
   5. NAVBAR: SCROLL + ACTIVE LINK + TOGGLE
============================================= */
function handleScroll() {
  const scrollY = window.scrollY;

  header.classList.toggle('scrolled', scrollY > 60);
  scrollTopBtn.classList.toggle('visible', scrollY > 400);
  updateActiveNavLink();
}

function updateActiveNavLink() {
  const sections = ['inicio', 'productos', 'nosotros', 'equipo', 'encuesta', 'contacto'];
  const scrollY  = window.scrollY + 100;

  sections.forEach(id => {
    const section = document.getElementById(id);
    const link    = document.querySelector(`.nav-link[href="#${id}"]`);
    if (!section || !link) return;

    const top    = section.offsetTop;
    const bottom = top + section.offsetHeight;

    if (scrollY >= top && scrollY < bottom) {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', handleScroll, { passive: true });

navToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href').slice(1);
    const target   = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* =============================================
   6. HERO SLIDESHOW
============================================= */
let currentSlide  = 0;
let slideInterval = null;
const SLIDE_DELAY = 4500;

function goToSlide(index) {
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');

  currentSlide = (index + slides.length) % slides.length;

  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

function nextSlide() {
  goToSlide(currentSlide + 1);
  resetSlideTimer();
}

function prevSlide() {
  goToSlide(currentSlide - 1);
  resetSlideTimer();
}

function resetSlideTimer() {
  clearInterval(slideInterval);
  slideInterval = setInterval(nextSlide, SLIDE_DELAY);
}

if (slides.length > 0) {
  slideInterval = setInterval(nextSlide, SLIDE_DELAY);

  if (slideNext) slideNext.addEventListener('click', nextSlide);
  if (slidePrev) slidePrev.addEventListener('click', prevSlide);

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goToSlide(i);
      resetSlideTimer();
    });
  });
}

/* =============================================
   7. RENDER DEL CATÁLOGO DE PRODUCTOS
============================================= */

/** Construye el HTML de una tarjeta de producto. */
function productCardHTML(product) {
  const meta = CATEGORY_META[product.category] || { label: product.category, emoji: '🍽️', badgeClass: 'badge-red' };
  const priceStr = `$${product.price.toLocaleString('es-CO')} COP`;
  const imgSrc   = resolveProductImg(product.img);

  return `
    <article class="product-card${product.popular ? ' featured' : ''}" data-category="${product.category}" data-id="${product.id}" aria-label="${product.name}">
      <div class="product-image-wrap" data-action="open-modal" data-id="${product.id}">
        <img src="${imgSrc}" alt="${product.name}" class="product-img" loading="lazy" />
        <span class="product-badge ${meta.badgeClass}">${meta.emoji} ${meta.label}</span>
        ${product.popular ? '<span class="product-popular">🔥 Popular</span>' : ''}
        <div class="product-overlay"></div>
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.desc || ''}</p>
        <div class="product-footer">
          <span class="product-price">${priceStr}</span>
          <button class="btn-add" data-action="add-to-cart" data-id="${product.id}" aria-label="Agregar ${product.name} al carrito">
            <i class="fas fa-cart-plus" aria-hidden="true"></i> Agregar
          </button>
        </div>
      </div>
    </article>
  `;
}

/** Vuelve a dibujar el grid completo de productos a partir de `products`. */
function renderProducts() {
  productsGrid.innerHTML = products.map(productCardHTML).join('');
  observeRevealTargets(productsGrid.querySelectorAll('.product-card'));
  attachCardHoverEffect(productsGrid.querySelectorAll('.product-card'));

  const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
  filterProducts(activeFilter);
}

/* =============================================
   8. FILTRO DE PRODUCTOS
============================================= */
function filterProducts(filter) {
  productsGrid.querySelectorAll('.product-card').forEach(card => {
    const category = card.dataset.category;
    const show     = filter === 'all' || category === filter;

    if (show) {
      card.classList.remove('hidden');
      card.style.animation = 'none';
      void card.offsetWidth;
      card.style.animation = 'fadeUp 0.45s ease both';
    } else {
      card.classList.add('hidden');
    }
  });
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    filterProducts(btn.dataset.filter);
  });
});

/* =============================================
   9. MODAL DE DETALLE DE PRODUCTO
============================================= */
let modalCurrentId = null;

function openModal(productId) {
  const data = products.find(p => p.id === productId);
  if (!data) return;

  modalCurrentId = productId;
  modalImg.src   = resolveProductImg(data.img);
  modalImg.alt   = data.name;
  modalTitle.textContent = data.name;
  modalDesc.textContent  = data.desc || '';
  modalPrice.textContent = `$${data.price.toLocaleString('es-CO')} COP`;
  modalWa.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hola! Quisiera pedir: ' + data.name + ' 🌈')}`;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  modalClose.focus();
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  modalCurrentId = null;
}

modalClose.addEventListener('click', closeModal);

modal.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (modal.classList.contains('open')) closeModal();
    if (cartDrawer.classList.contains('open')) closeCart();
  }
});

if (modalAddCart) {
  modalAddCart.addEventListener('click', () => {
    if (modalCurrentId) {
      addToCart(modalCurrentId);
      closeModal();
      openCart();
    }
  });
}

/* =============================================
   10. CARRITO DE COMPRAS
============================================= */

function openCart() {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  cartOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  cartOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

cartBtn.addEventListener('click', () => {
  if (cartDrawer.classList.contains('open')) {
    closeCart();
  } else {
    openCart();
  }
});

cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

/**
 * Agrega un producto al carrito (o incrementa su cantidad si ya existe).
 * @param {string} productId
 */
function addToCart(productId) {
  const data = products.find(p => p.id === productId);
  if (!data) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: data.id, name: data.name, price: data.price, img: data.img, qty: 1 });
  }

  updateCartUI();
  animateCartBtn();
}

function changeQty(productId, delta) {
  const idx = cart.findIndex(item => item.id === productId);
  if (idx === -1) return;

  cart[idx].qty += delta;

  if (cart[idx].qty <= 0) {
    cart.splice(idx, 1);
  }

  updateCartUI();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartUI();
}

function clearCart() {
  cart = [];
  updateCartUI();
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  cartBadge.textContent = totalItems;
  cartBadge.classList.add('bump');
  setTimeout(() => cartBadge.classList.remove('bump'), 300);

  const isEmpty = cart.length === 0;
  cartEmpty.style.display     = isEmpty ? 'flex' : 'none';
  cartItemsList.style.display = isEmpty ? 'none' : 'flex';
  cartCheckout.disabled       = isEmpty;
  cartClear.style.display     = isEmpty ? 'none' : 'flex';

  const formatted = totalPrice.toLocaleString('es-CO');
  cartSubtotal.textContent = `$${formatted} COP`;
  cartTotal.textContent    = `$${formatted} COP`;

  cartItemsList.innerHTML = '';
  cart.forEach(item => {
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <img class="cart-item-img" src="${resolveProductImg(item.img)}" alt="${item.name}" loading="lazy" />
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">$${(item.price * item.qty).toLocaleString('es-CO')} COP</p>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn qty-minus" data-id="${item.id}" aria-label="Reducir cantidad">−</button>
        <span class="qty-value">${item.qty}</span>
        <button class="qty-btn qty-plus"  data-id="${item.id}" aria-label="Aumentar cantidad">+</button>
      </div>
      <button class="cart-item-remove" data-id="${item.id}" aria-label="Eliminar ${item.name}">
        <i class="fas fa-trash" aria-hidden="true"></i>
      </button>
    `;
    cartItemsList.appendChild(li);
  });

  cartItemsList.querySelectorAll('.qty-minus').forEach(btn =>
    btn.addEventListener('click', () => changeQty(btn.dataset.id, -1))
  );
  cartItemsList.querySelectorAll('.qty-plus').forEach(btn =>
    btn.addEventListener('click', () => changeQty(btn.dataset.id, +1))
  );
  cartItemsList.querySelectorAll('.cart-item-remove').forEach(btn =>
    btn.addEventListener('click', () => removeFromCart(btn.dataset.id))
  );
}

function animateCartBtn() {
  cartBtn.classList.add('wiggle');
  setTimeout(() => cartBtn.classList.remove('wiggle'), 500);
}

cartClear.addEventListener('click', clearCart);

cartCheckout.addEventListener('click', () => {
  if (cart.length === 0) return;

  const lines = cart.map(item =>
    `• ${item.name} x${item.qty} = $${(item.price * item.qty).toLocaleString('es-CO')} COP`
  ).join('\n');

  const total   = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const message = `🌈 *Pedido - Heladería y Frutería Arcoíris*\n\n${lines}\n\n*Total: $${total.toLocaleString('es-CO')} COP*\n\n¡Hola! Quisiera hacer este pedido. Estoy en Tocaima 📍`;

  window.open(
    `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`,
    '_blank',
    'noopener,noreferrer'
  );
});

/* =============================================
   11. CLICKS EN EL GRID (delegación de eventos)
   Funciona para tarjetas renderizadas dinámicamente, incluyendo
   productos agregados desde el panel admin.
============================================= */
productsGrid.addEventListener('click', e => {
  const addBtn = e.target.closest('[data-action="add-to-cart"]');
  if (addBtn) {
    addToCart(addBtn.dataset.id);

    const originalHTML = addBtn.innerHTML;
    addBtn.classList.add('added');
    addBtn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> ¡Agregado!';
    addBtn.disabled  = true;

    setTimeout(() => {
      addBtn.classList.remove('added');
      addBtn.innerHTML = originalHTML;
      addBtn.disabled  = false;
    }, 1400);
    return;
  }

  const imgWrap = e.target.closest('[data-action="open-modal"]');
  if (imgWrap) {
    openModal(imgWrap.dataset.id);
  }
});

/* =============================================
   12. ANIMACIONES SCROLL-REVEAL
============================================= */
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
);

function observeRevealTargets(elements) {
  elements.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 0.06}s`;
    revealObserver.observe(el);
  });
}

observeRevealTargets(document.querySelectorAll('.about-card, .value-item, .contact-item'));

// Ahora que revealObserver ya existe, se puede renderizar el catálogo
// (renderProducts observa las tarjetas recién creadas con revealObserver).
renderProducts();

/* =============================================
   13. EFECTO HOVER 3D EN TARJETAS
============================================= */
function attachCardHoverEffect(cards) {
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect    = card.getBoundingClientRect();
      const x       = e.clientX - rect.left;
      const y       = e.clientY - rect.top;
      const rotateX = ((y - rect.height / 2) / rect.height) * -5;
      const rotateY = ((x - rect.width  / 2) / rect.width)  *  5;
      card.style.transform = `translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform 0.4s ease';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease';
    });
  });
}

/* =============================================
   14. CONTADORES ANIMADOS
============================================= */
function animateCounter(el, target, duration) {
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    const current  = eased * target;
    const isInt    = Number.isInteger(target);

    const original   = el.dataset.target || el.textContent;
    const hasPlus     = original.startsWith('+');
    const hasPercent  = original.includes('%');
    const prefix      = hasPlus && !hasPercent ? '+' : '';

    el.textContent = prefix + (isInt ? Math.round(current) : current.toFixed(1)) + (hasPercent ? '%' : '');

    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el   = entry.target;
        const text = el.textContent.trim();
        const num  = parseFloat(text.replace(/[^0-9.]/g, ''));
        if (!isNaN(num)) animateCounter(el, num, 1800);
        statsObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll('.stat-number').forEach(el => statsObserver.observe(el));

/* =============================================
   15. INICIALIZACIÓN DEL CARRITO
============================================= */
updateCartUI();

/* =============================================
   16. LOG DE BIENVENIDA EN CONSOLA
============================================= */
console.log('%c🌈 Heladería y Frutería Arcoíris', 'color: #FF6B35; font-size: 1.4rem; font-weight: bold;');
console.log('%c📍 Tocaima, Cundinamarca, Colombia', 'color: #2ED573; font-size: 1rem;');
console.log('%c"Sabor, color y frescura en cada bocado" ✨', 'color: #C850C0; font-style: italic;');
