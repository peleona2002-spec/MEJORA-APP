/**
 * =====================================================================
 * Heladería y Frutería Arcoíris - moderno.js
 * Lógica interactiva con efectos modernos, personalizador de helados,
 * carrito en vivo, modo oscuro/neón y redirección a pqr3.html institucional.
 * Desarrollado para el repositorio del correo peleona2002@gmail.com
 * =====================================================================
 */

'use strict';

const WA_PHONE_NUMBER = '573134292831';
const INSTITUTIONAL_PQR3_URL = 'https://iedhernanvenegascarrillo.edu.co/bases2026/proyecto3/pqr3.html';

document.addEventListener('DOMContentLoaded', () => {

  /* -------------------------------------------------------------
   * 1. AMBIANCE / MODO OSCURO (NEÓN) TOGGLE
   * ------------------------------------------------------------- */
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('arcoiris_theme');

  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeToggleBtn) themeToggleBtn.textContent = '☀️ Modo Día';
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      themeToggleBtn.textContent = isDark ? '☀️ Modo Día' : '🌙 Modo Neón';
      localStorage.setItem('arcoiris_theme', isDark ? 'dark' : 'light');
    });
  }

  /* -------------------------------------------------------------
   * 2. EFECTO DE ESCRITURA DINÁMICA (Rotating Typing Effect)
   * ------------------------------------------------------------- */
  const typingTarget = document.getElementById('typingSlogan');
  if (typingTarget) {
    const slogans = [
      '“Sabor, color y frescura en cada bocado”',
      '🍨 Helados artesanales 100% naturales',
      '🍓 Frutas cosechadas con amor del campo',
      '🌈 La mejor heladería de Tocaima, Cundinamarca',
      '✨ ¡Pide por WhatsApp y te lo llevamos fresco!'
    ];
    let sloganIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {
      const current = slogans[sloganIndex];
      if (isDeleting) {
        typingTarget.textContent = current.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typingTarget.textContent = current.substring(0, charIndex + 1);
        charIndex++;
      }

      let speed = isDeleting ? 35 : 70;

      if (!isDeleting && charIndex === current.length) {
        speed = 2200; // Pausa al completar la frase
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        sloganIndex = (sloganIndex + 1) % slogans.length;
        speed = 500;
      }

      setTimeout(typeEffect, speed);
    }
    typeEffect();
  }

  /* -------------------------------------------------------------
   * 3. SLIDESHOW SUAVE EN EL HERO
   * ------------------------------------------------------------- */
  const heroSlides = document.querySelectorAll('.hero-slide-img');
  let currentSlide = 0;
  if (heroSlides.length > 0) {
    setInterval(() => {
      heroSlides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % heroSlides.length;
      heroSlides[currentSlide].classList.add('active');
    }, 4000);
  }

  /* -------------------------------------------------------------
   * 4. EFECTO 3D TILT EN CARDS PRINCIPALES
   * ------------------------------------------------------------- */
  const tiltCards = document.querySelectorAll('.tilt-3d');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });

  /* -------------------------------------------------------------
   * 5. CATÁLOGO CON BÚSQUEDA Y FILTRO EN VIVO
   * ------------------------------------------------------------- */
  const productsGrid = document.getElementById('productsGridModern');
  const searchInput = document.getElementById('searchProductInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const catTabBtns = document.querySelectorAll('.cat-tab-btn');

  const allProducts = typeof getProducts === 'function' ? getProducts() : [];
  let currentCategory = 'all';
  let searchQuery = '';

  function renderProducts() {
    if (!productsGrid) return;

    const filtered = allProducts.filter(p => {
      const matchCategory = (currentCategory === 'all') || (p.category === currentCategory);
      const queryLower = searchQuery.toLowerCase().trim();
      const matchQuery = !queryLower || 
        p.name.toLowerCase().includes(queryLower) || 
        p.desc.toLowerCase().includes(queryLower) ||
        (p.category && p.category.toLowerCase().includes(queryLower));
      return matchCategory && matchQuery;
    });

    if (filtered.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--r-lg); border: 1px dashed rgba(114,9,183,0.2);">
          <span style="font-size: 3rem;">🔍</span>
          <h3 style="font-family: var(--font-heading); margin-block: 0.8rem 0.4rem;">No encontramos productos</h3>
          <p style="color: var(--text-muted);">Prueba buscando con otra palabra o selecciona otra categoría.</p>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = filtered.map(prod => {
      const imgSrc = typeof resolveProductImg === 'function' ? resolveProductImg(prod.img) : `img/${prod.img}`;
      const formattedPrice = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(prod.price);
      const catLabel = prod.category ? prod.category.toUpperCase() : 'DELICIA';

      return `
        <article class="product-card-modern tilt-3d" data-id="${prod.id}">
          <div class="product-img-wrap">
            <img src="${imgSrc}" alt="${prod.name}" class="product-thumb" loading="lazy" />
            <span class="product-cat-tag">✨ ${catLabel}</span>
          </div>
          <div class="product-info">
            <h4 class="product-title">${prod.name}</h4>
            <p class="product-desc">${prod.desc}</p>
            <div class="product-card-footer">
              <span class="product-price">${formattedPrice}</span>
              <button type="button" class="btn-add-cart-mini" data-id="${prod.id}" title="Agregar al carrito" aria-label="Agregar ${prod.name} al carrito">
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Reasociar eventos de agregar al carrito
    productsGrid.querySelectorAll('.btn-add-cart-mini').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const prodId = btn.getAttribute('data-id');
        const item = allProducts.find(p => p.id === prodId);
        if (item) addToCart(item);
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (searchClearBtn) {
        searchClearBtn.style.display = searchQuery ? 'block' : 'none';
      }
      renderProducts();
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      searchClearBtn.style.display = 'none';
      renderProducts();
      searchInput.focus();
    });
  }

  catTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category');
      renderProducts();
    });
  });

  renderProducts();

  /* -------------------------------------------------------------
   * 6. CARRITO DE COMPRAS MODERNO Y PEDIDO POR WHATSAPP
   * ------------------------------------------------------------- */
  let cart = [];
  try {
    const savedCart = localStorage.getItem('arcoiris_cart_items');
    if (savedCart) cart = JSON.parse(savedCart);
  } catch (err) {
    cart = [];
  }

  const cartDrawer = document.getElementById('cartDrawerModern');
  const cartOverlay = document.getElementById('cartOverlayModern');
  const cartBtn = document.getElementById('cartBtnModern');
  const cartCloseBtn = document.getElementById('cartCloseModern');
  const cartBody = document.getElementById('cartBodyModern');
  const cartTotalAmount = document.getElementById('cartTotalAmount');
  const cartBadge = document.getElementById('cartBadgeCount');
  const cartCheckoutBtn = document.getElementById('cartCheckoutWhatsApp');

  function openCart() {
    if (cartDrawer) cartDrawer.classList.add('open');
    if (cartOverlay) cartOverlay.classList.add('active');
  }

  function closeCart() {
    if (cartDrawer) cartDrawer.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('active');
  }

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  function saveCart() {
    localStorage.setItem('arcoiris_cart_items', JSON.stringify(cart));
    updateCartUI();
  }

  function addToCart(item, customName = null, customPrice = null) {
    const name = customName || item.name;
    const price = customPrice !== null ? customPrice : item.price;
    const existing = cart.find(i => i.name === name);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: item.id || 'custom-' + Date.now(),
        name: name,
        price: price,
        img: item.img || 'copa-helado.png.jpg',
        qty: 1
      });
    }

    saveCart();
    openCart();

    // Efecto visual en el botón del carrito
    if (cartBtn) {
      cartBtn.style.transform = 'scale(1.15)';
      setTimeout(() => cartBtn.style.transform = '', 300);
    }
  }

  function updateCartUI() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    if (cartBadge) cartBadge.textContent = totalQty;

    const formattedTotal = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(totalPrice);
    if (cartTotalAmount) cartTotalAmount.textContent = formattedTotal;

    if (!cartBody) return;

    if (cart.length === 0) {
      cartBody.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <span style="font-size: 3.5rem;">🍨</span>
          <p style="margin-top: 1rem; font-weight: 600;">Tu carrito está vacío</p>
          <p style="font-size: 0.85rem;">¡Agrega helados, ensaladas o crea tu postre soñado!</p>
        </div>
      `;
      if (cartCheckoutBtn) cartCheckoutBtn.style.display = 'none';
      return;
    }

    if (cartCheckoutBtn) cartCheckoutBtn.style.display = 'flex';

    cartBody.innerHTML = cart.map((item, idx) => {
      const imgSrc = typeof resolveProductImg === 'function' ? resolveProductImg(item.img) : `img/${item.img}`;
      const itemSubtotal = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(item.price * item.qty);

      return `
        <div class="cart-item-row">
          <img src="${imgSrc}" alt="${item.name}" class="cart-item-img" />
          <div class="cart-item-details">
            <h5 class="cart-item-name">${item.name}</h5>
            <span class="cart-item-price">${itemSubtotal}</span>
          </div>
          <div class="cart-item-qty">
            <button type="button" class="qty-btn" data-action="dec" data-idx="${idx}">-</button>
            <span style="font-weight: 700; min-width: 20px; text-align: center;">${item.qty}</span>
            <button type="button" class="qty-btn" data-action="inc" data-idx="${idx}">+</button>
          </div>
        </div>
      `;
    }).join('');

    cartBody.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-idx'));
        const action = btn.getAttribute('data-action');
        if (action === 'inc') {
          cart[idx].qty += 1;
        } else if (action === 'dec') {
          cart[idx].qty -= 1;
          if (cart[idx].qty <= 0) cart.splice(idx, 1);
        }
        saveCart();
      });
    });
  }

  if (cartCheckoutBtn) {
    cartCheckoutBtn.addEventListener('click', () => {
      if (cart.length === 0) return;

      const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const formattedTotal = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(totalPrice);

      let msg = '🌈 *¡Hola Heladería Arcoíris! Deseo realizar el siguiente pedido:*\n\n';
      cart.forEach((item, i) => {
        const sub = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(item.price * item.qty);
        msg += `${i + 1}. *${item.name}* x${item.qty} = ${sub}\n`;
      });
      msg += `\n💰 *Total a pagar:* ${formattedTotal}\n`;
      msg += `📍 *Ubicación de entrega:* Tocaima, Cundinamarca.\n`;
      msg += `¡Muchas gracias! 🍦🍓`;

      const encoded = encodeURIComponent(msg);
      window.open(`https://wa.me/${WA_PHONE_NUMBER}?text=${encoded}`, '_blank');
    });
  }

  updateCartUI();

  /* -------------------------------------------------------------
   * 7. PERSONALIZADOR DE HELADOS INTERACTIVO ("CREA TU HELADO SOÑADO")
   * ------------------------------------------------------------- */
  const basePills = document.querySelectorAll('.base-pill');
  const flavorPills = document.querySelectorAll('.flavor-pill');
  const toppingPills = document.querySelectorAll('.topping-pill');
  const previewVessel = document.getElementById('previewVessel');
  const previewTitle = document.getElementById('previewTitle');
  const previewFlavorsText = document.getElementById('previewFlavorsText');
  const previewToppingsText = document.getElementById('previewToppingsText');
  const previewPrice = document.getElementById('previewPrice');
  const btnAddCustomIceCream = document.getElementById('btnAddCustomIceCream');

  let customBase = { name: 'Copa de Cristal Suprema', price: 18000, icon: '🍨' };
  let customFlavors = ['Brownie', 'Vainilla'];
  let customToppings = ['Fresas Silvestres', 'Crema Chantilly'];

  function updateCustomizerUI() {
    if (previewVessel) previewVessel.textContent = customBase.icon;
    if (previewTitle) previewTitle.textContent = customBase.name;
    if (previewFlavorsText) previewFlavorsText.textContent = customFlavors.length > 0 ? customFlavors.join(' + ') : 'Sin sabores seleccionados';
    if (previewToppingsText) previewToppingsText.textContent = customToppings.length > 0 ? customToppings.join(', ') : 'Sin toppings seleccionados';

    // Cálculo: precio base + 1500 por cada topping extra después de 2
    let calculated = customBase.price;
    if (customToppings.length > 2) {
      calculated += (customToppings.length - 2) * 2000;
    }

    if (previewPrice) {
      previewPrice.textContent = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(calculated);
    }
  }

  basePills.forEach(pill => {
    pill.addEventListener('click', () => {
      basePills.forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      customBase = {
        name: pill.getAttribute('data-name'),
        price: Number(pill.getAttribute('data-price')),
        icon: pill.getAttribute('data-icon')
      };
      updateCustomizerUI();
    });
  });

  flavorPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const flavor = pill.getAttribute('data-flavor');
      if (pill.classList.contains('selected')) {
        pill.classList.remove('selected');
        customFlavors = customFlavors.filter(f => f !== flavor);
      } else {
        if (customFlavors.length >= 3) {
          alert('¡Puedes seleccionar hasta 3 sabores para tu combinación perfecta!');
          return;
        }
        pill.classList.add('selected');
        customFlavors.push(flavor);
      }
      updateCustomizerUI();
    });
  });

  toppingPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const topping = pill.getAttribute('data-topping');
      if (pill.classList.contains('selected')) {
        pill.classList.remove('selected');
        customToppings = customToppings.filter(t => t !== topping);
      } else {
        pill.classList.add('selected');
        customToppings.push(topping);
      }
      updateCustomizerUI();
    });
  });

  if (btnAddCustomIceCream) {
    btnAddCustomIceCream.addEventListener('click', () => {
      let calculated = customBase.price;
      if (customToppings.length > 2) {
        calculated += (customToppings.length - 2) * 2000;
      }
      const customItem = {
        id: 'helado-personalizado-' + Date.now(),
        name: `Helado Soñado (${customBase.name})`,
        price: calculated,
        img: 'copa-helado.png.jpg'
      };
      addToCart(customItem, `${customItem.name} con ${customFlavors.join('/')} y toppings: ${customToppings.join(', ')}`, calculated);
    });
  }

  updateCustomizerUI();

  /* -------------------------------------------------------------
   * 8. ENCUESTA DE HELADERÍA CON BASE DE DATOS Y REDIRECCIÓN A PQR3
   * ------------------------------------------------------------- */
  const surveyForm = document.getElementById('modernSurveyForm');
  const redirectModal = document.getElementById('redirectModalModern');
  const countdownNumber = document.getElementById('countdownNumber');
  const btnNowRedirect = document.getElementById('btnNowRedirect');
  const btnStayHere = document.getElementById('btnStayHere');
  const generatedCodeEl = document.getElementById('modalSurveyCode');
  let countdownTimer = null;

  // Estrellas interactivas
  const starContainers = document.querySelectorAll('.stars-interactive');
  starContainers.forEach(container => {
    const targetInputId = container.getAttribute('data-target');
    const input = document.getElementById(targetInputId);
    const caption = container.parentElement.querySelector('.rating-caption');
    const starBtns = container.querySelectorAll('.star-modern-btn');

    const captionsMap = {
      calificacionCalidad: {
        1: '1/5 · Necesita mejorar',
        2: '2/5 · Regular',
        3: '3/5 · Buen sabor',
        4: '4/5 · ¡Delicioso y cremoso!',
        5: '5/5 · ¡Sabor celestial y frescura máxima! 🍦'
      },
      calificacionPresentacion: {
        1: '1/5 · Poca presentación',
        2: '2/5 · Básica',
        3: '3/5 · Agradable',
        4: '4/5 · ¡Muy apetitosa y colorida!',
        5: '5/5 · ¡Obra de arte y frutas impecables! 🍓'
      },
      calificacionWeb: {
        1: '1/5 · Lenta o confusa',
        2: '2/5 · Normal',
        3: '3/5 · Buena interfaz',
        4: '4/5 · ¡Rápida y moderna!',
        5: '5/5 · ¡Increíble diseño, moderna y con efectos! 🌈'
      }
    };

    function setStars(val) {
      starBtns.forEach(btn => {
        const btnVal = Number(btn.getAttribute('data-value'));
        btn.classList.toggle('active', btnVal <= val);
      });
      if (input) input.value = val;
      if (caption && captionsMap[targetInputId]) {
        caption.textContent = captionsMap[targetInputId][val] || `${val}/5`;
      }
    }

    starBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = Number(btn.getAttribute('data-value'));
        setStars(val);
      });
      btn.addEventListener('mouseenter', () => {
        const val = Number(btn.getAttribute('data-value'));
        starBtns.forEach(b => b.classList.toggle('hovered', Number(b.getAttribute('data-value')) <= val));
      });
      btn.addEventListener('mouseleave', () => {
        starBtns.forEach(b => b.classList.remove('hovered'));
      });
    });
  });

  // Chips de sabores favoritos en la encuesta
  const surveyFlavorChips = document.querySelectorAll('.survey-flavor-chip');
  surveyFlavorChips.forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      const chk = chip.querySelector('input[type="checkbox"]');
      if (chk) chk.checked = chip.classList.contains('active');
    });
  });

  // Escala NPS
  const npsButtons = document.querySelectorAll('.nps-btn-modern');
  const npsInput = document.getElementById('modernNPS');
  npsButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      npsButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const score = Number(btn.getAttribute('data-score'));
      if (npsInput) npsInput.value = score;
    });
  });

  // Envío del formulario con guardado en Base de Datos y Redirección
  if (surveyForm) {
    surveyForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('surveyName');
      const emailInput = document.getElementById('surveyEmail');

      if (!nameInput.value.trim() || !emailInput.value.trim()) {
        alert('Por favor diligencia al menos tu Nombre y Correo electrónico.');
        return;
      }

      const submitBtn = document.getElementById('surveySubmitBtnModern');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando en Base de Datos...';

      // Recopilar sabores seleccionados
      const selectedFlavors = [];
      document.querySelectorAll('.survey-flavor-chip.active').forEach(chip => {
        selectedFlavors.push(chip.getAttribute('data-flavor-name'));
      });

      const payload = {
        nombreCompleto: nameInput.value.trim(),
        correoElectronico: emailInput.value.trim(),
        telefono: document.getElementById('surveyPhone')?.value.trim() || '',
        ciudad: document.getElementById('surveyCity')?.value || 'Tocaima',
        rangoEdad: document.getElementById('surveyAge')?.value || '18-25',
        tipoCliente: document.querySelector('input[name="customerPersona"]:checked')?.value || 'Amante del Helado',
        productosProbados: selectedFlavors.length > 0 ? selectedFlavors : ['Helados artesanales', 'Fresas con crema'],
        productoFavorito: document.getElementById('surveyFavorite')?.value.trim() || 'Copa Suprema de Helado',
        percepcionPrecio: document.getElementById('surveyPriceRating')?.value || 'Justos y adecuados',
        calificacionCalidad: Number(document.getElementById('calificacionCalidad')?.value || 5),
        calificacionPresentacion: Number(document.getElementById('calificacionPresentacion')?.value || 5),
        sugerenciaProducto: document.getElementById('surveySuggestions')?.value.trim() || '',
        calificacionWeb: Number(document.getElementById('calificacionWeb')?.value || 5),
        facilidadNavegacion: 'Muy moderna y visual con efectos',
        percepcionDiseno: 'Excelente estética arcoíris con efectos 3D',
        utilidadWhatsapp: 'Excelente y muy práctica',
        recomendacionNPS: Number(npsInput?.value || 10),
        comentarios: document.getElementById('surveyComments')?.value.trim() || '¡Excelente experiencia!'
      };

      try {
        let saveResult = { id: 'ENC-' + Date.now().toString().slice(-6) };
        if (window.SurveyDB && typeof window.SurveyDB.saveSurvey === 'function') {
          saveResult = await window.SurveyDB.saveSurvey(payload);
        } else {
          // Fallback a localStorage
          const localSurveys = JSON.parse(localStorage.getItem('arcoiris_encuestas_v1') || '[]');
          payload.id = saveResult.id;
          payload.fechaFormateada = new Date().toLocaleString('es-CO');
          localSurveys.unshift(payload);
          localStorage.setItem('arcoiris_encuestas_v1', JSON.stringify(localSurveys));
        }

        // Mostrar Modal de Éxito con Redirección
        if (generatedCodeEl) generatedCodeEl.textContent = saveResult.id;
        if (redirectModal) redirectModal.classList.add('active');

        // Iniciar Cuenta Regresiva de Redirección a pqr3.html
        let seconds = 3;
        if (countdownNumber) countdownNumber.textContent = seconds;

        countdownTimer = setInterval(() => {
          seconds--;
          if (countdownNumber) countdownNumber.textContent = seconds;
          if (seconds <= 0) {
            clearInterval(countdownTimer);
            window.location.href = INSTITUTIONAL_PQR3_URL;
          }
        }, 1000);

      } catch (err) {
        console.error('Error al guardar la encuesta:', err);
        alert('Hubo un inconveniente al guardar. Por favor intenta de nuevo.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // Botón Redirigir de Inmediato
  if (btnNowRedirect) {
    btnNowRedirect.addEventListener('click', () => {
      if (countdownTimer) clearInterval(countdownTimer);
      window.location.href = INSTITUTIONAL_PQR3_URL;
    });
  }

  // Botón Cancelar y Quedarme Aquí
  if (btnStayHere) {
    btnStayHere.addEventListener('click', () => {
      if (countdownTimer) clearInterval(countdownTimer);
      if (redirectModal) redirectModal.classList.remove('active');
      if (surveyForm) surveyForm.reset();
      alert('¡Tus datos han quedado registrados con éxito en la base de datos! Puedes seguir explorando la página.');
    });
  }

});
