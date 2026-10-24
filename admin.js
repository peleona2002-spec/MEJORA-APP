/**
 * Panel de Administración — Heladería y Frutería Arcoíris
 *
 * Permite editar nombre, precio, categoría, descripción e imagen de cada
 * producto, agregar/eliminar productos, y guardar el catálogo en
 * localStorage (clave PRODUCTS_STORAGE_KEY, definida en products.js).
 *
 * IMPORTANTE: la contraseña de abajo es solo una barrera básica para uso
 * interno del negocio. Es visible en el código fuente y NO reemplaza un
 * sistema de autenticación real — no la uses para proteger datos sensibles.
 */
'use strict';

const ADMIN_PASSWORD = 'arcoiris2026';
const AUTH_KEY = 'arcoiris_admin_auth';
const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024; // ~1.5MB: límite razonable para no saturar localStorage

const loginScreen   = document.getElementById('loginScreen');
const adminPanel     = document.getElementById('adminPanel');
const loginForm       = document.getElementById('loginForm');
const loginPassword   = document.getElementById('loginPassword');
const loginError      = document.getElementById('loginError');
const logoutBtn        = document.getElementById('logoutBtn');

const productsTableBody = document.getElementById('productsTableBody');
const addProductBtn      = document.getElementById('addProductBtn');
const saveAllBtn          = document.getElementById('saveAllBtn');
const resetDefaultsBtn    = document.getElementById('resetDefaultsBtn');
const exportJsonBtn       = document.getElementById('exportJsonBtn');
const toast                = document.getElementById('toast');

let adminProducts = [];

/* =============================================
   AUTENTICACIÓN BÁSICA
============================================= */
function isAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
}

function showPanel() {
  loginScreen.style.display = 'none';
  adminPanel.style.display  = 'block';
  adminProducts = getProducts();
  renderTable();
  initSurveyDashboard();
}

function showLogin() {
  loginScreen.style.display = 'flex';
  adminPanel.style.display  = 'none';
}

loginForm.addEventListener('submit', e => {
  e.preventDefault();
  if (loginPassword.value === ADMIN_PASSWORD) {
    sessionStorage.setItem(AUTH_KEY, 'true');
    loginError.textContent = '';
    loginPassword.value = '';
    showPanel();
  } else {
    loginError.textContent = 'Contraseña incorrecta.';
  }
});

logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem(AUTH_KEY);
  showLogin();
});

isAuthenticated() ? showPanel() : showLogin();

/* =============================================
   TOAST DE NOTIFICACIÓN
============================================= */
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 3200);
}

/* =============================================
   RENDER DE LA TABLA DE PRODUCTOS
============================================= */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function rowHTML(product, index) {
  const imgSrc = resolveProductImg(product.img) || 'https://placehold.co/80x80?text=%20';
  const categoryOptions = Object.keys(CATEGORY_META).map(cat =>
    `<option value="${cat}" ${cat === product.category ? 'selected' : ''}>${CATEGORY_META[cat].emoji} ${CATEGORY_META[cat].label}</option>`
  ).join('');

  return `
    <tr data-index="${index}">
      <td class="col-img">
        <img src="${imgSrc}" alt="${escapeHtml(product.name)}" class="admin-thumb" />
        <label class="upload-btn">
          📷 Cambiar
          <input type="file" accept="image/*" class="field-img" />
        </label>
      </td>
      <td><input type="text" class="field-name" value="${escapeHtml(product.name)}" /></td>
      <td><select class="field-category">${categoryOptions}</select></td>
      <td><input type="number" class="field-price" min="0" step="500" value="${product.price}" /></td>
      <td><textarea class="field-desc" rows="2">${escapeHtml(product.desc)}</textarea></td>
      <td><label class="popular-check"><input type="checkbox" class="field-popular" ${product.popular ? 'checked' : ''} /> ⭐</label></td>
      <td><button class="btn-delete-row" title="Eliminar producto" aria-label="Eliminar producto">🗑️</button></td>
    </tr>
  `;
}

function renderTable() {
  productsTableBody.innerHTML = adminProducts.map(rowHTML).join('');
}

/* =============================================
   EDICIÓN DE CAMPOS (delegación de eventos)
============================================= */
productsTableBody.addEventListener('input', e => {
  const row = e.target.closest('tr');
  if (!row) return;
  const product = adminProducts[Number(row.dataset.index)];
  if (!product) return;

  if (e.target.classList.contains('field-name'))  product.name  = e.target.value;
  if (e.target.classList.contains('field-price')) product.price = Number(e.target.value) || 0;
  if (e.target.classList.contains('field-desc'))  product.desc  = e.target.value;
});

productsTableBody.addEventListener('change', e => {
  const row = e.target.closest('tr');
  if (!row) return;
  const product = adminProducts[Number(row.dataset.index)];
  if (!product) return;

  if (e.target.classList.contains('field-category')) {
    product.category = e.target.value;
  }

  if (e.target.classList.contains('field-popular')) {
    product.popular = e.target.checked;
  }

  if (e.target.classList.contains('field-img')) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_BYTES) {
      showToast('⚠️ Esa imagen es muy pesada (máx. ~1.5MB). Elige una más liviana.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      product.img = reader.result; // se guarda como dataURL (base64)
      row.querySelector('.admin-thumb').src = reader.result;
    };
    reader.readAsDataURL(file);
  }
});

productsTableBody.addEventListener('click', e => {
  const delBtn = e.target.closest('.btn-delete-row');
  if (!delBtn) return;
  const row = delBtn.closest('tr');
  const index = Number(row.dataset.index);
  const product = adminProducts[index];
  if (!product) return;
  if (!confirm(`¿Eliminar "${product.name}"?`)) return;
  adminProducts.splice(index, 1);
  renderTable();
});

/* =============================================
   ACCIONES DE LA BARRA DE HERRAMIENTAS
============================================= */
addProductBtn.addEventListener('click', () => {
  adminProducts.push({
    id: 'producto-' + Date.now(),
    name: 'Nuevo producto',
    desc: '',
    price: 0,
    category: 'helados',
    img: '',
    popular: false
  });
  renderTable();
  productsTableBody.lastElementChild?.querySelector('.field-name')?.focus();
});

saveAllBtn.addEventListener('click', () => {
  saveProducts(adminProducts);
  showToast('✅ Guardado. Recarga la página principal (index.html) para ver los cambios.');
});

resetDefaultsBtn.addEventListener('click', () => {
  if (!confirm('Esto borrará tus cambios guardados y volverá al catálogo original. ¿Continuar?')) return;
  localStorage.removeItem(PRODUCTS_STORAGE_KEY);
  adminProducts = getProducts();
  renderTable();
  showToast('↺ Catálogo restaurado a los valores originales.');
});

exportJsonBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(adminProducts, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'products.json';
  a.click();
  URL.revokeObjectURL(url);
});

/* =============================================
   PESTAÑAS DEL PANEL ADMIN
============================================= */
const tabBtnProducts = document.getElementById('tabBtnProducts');
const tabBtnSurveys  = document.getElementById('tabBtnSurveys');
const tabProducts    = document.getElementById('tabProducts');
const tabSurveys     = document.getElementById('tabSurveys');

function switchTab(tabId) {
  if (tabId === 'tabProducts') {
    tabBtnProducts?.classList.add('active');
    tabBtnSurveys?.classList.remove('active');
    if (tabProducts) tabProducts.style.display = 'block';
    if (tabSurveys)  tabSurveys.style.display  = 'none';
  } else {
    tabBtnSurveys?.classList.add('active');
    tabBtnProducts?.classList.remove('active');
    if (tabSurveys)  tabSurveys.style.display  = 'block';
    if (tabProducts) tabProducts.style.display = 'none';
    refreshSurveys();
  }
}

tabBtnProducts?.addEventListener('click', () => switchTab('tabProducts'));
tabBtnSurveys?.addEventListener('click', () => switchTab('tabSurveys'));

/* =============================================
   GESTIÓN Y BASE DE DATOS DE ENCUESTAS
============================================= */
const surveysTableBody    = document.getElementById('surveysTableBody');
const surveysCountBadge   = document.getElementById('surveysCountBadge');
const kpiTotalSurveys     = document.getElementById('kpiTotalSurveys');
const kpiAvgProducts      = document.getElementById('kpiAvgProducts');
const kpiAvgWeb           = document.getElementById('kpiAvgWeb');
const kpiNPS              = document.getElementById('kpiNPS');
const surveySearchInput   = document.getElementById('surveySearchInput');
const btnExportCSV        = document.getElementById('btnExportCSV');
const btnExportJSON       = document.getElementById('btnExportJSON');
const btnRefreshSurveys   = document.getElementById('btnRefreshSurveys');
const btnSeedDemo         = document.getElementById('btnSeedDemo');
const btnClearSurveys     = document.getElementById('btnClearSurveys');

// Modal
const surveyDetailModal    = document.getElementById('surveyDetailModal');
const surveyDetailContent  = document.getElementById('surveyDetailContent');
const closeDetailModalBtn  = document.getElementById('closeDetailModalBtn');
const closeDetailModalBtn2 = document.getElementById('closeDetailModalBtn2');

let cachedSurveys = [];

async function refreshSurveys() {
  if (!window.SurveyDB) return;
  cachedSurveys = await window.SurveyDB.getAllSurveys();
  renderSurveysTable(cachedSurveys);
  updateKPIs();
}

function updateKPIs() {
  if (!window.SurveyDB) return;
  window.SurveyDB.getStats().then(stats => {
    if (kpiTotalSurveys)   kpiTotalSurveys.textContent   = stats.total;
    if (kpiAvgProducts)    kpiAvgProducts.textContent    = stats.promedioCalidad;
    if (kpiAvgWeb)         kpiAvgWeb.textContent         = stats.promedioWeb;
    if (kpiNPS)            kpiNPS.textContent            = stats.porcentajeRecomienda + '%';
    if (surveysCountBadge) surveysCountBadge.textContent = stats.total;
  });
}

function renderSurveysTable(list) {
  if (!surveysTableBody) return;

  if (!list || list.length === 0) {
    surveysTableBody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 2.5rem; color: #888;">
          📭 No hay encuestas registradas en la base de datos todavía.<br>
          <small>Puedes pulsar <strong>«➕ Cargar Datos Demo»</strong> para generar encuestas de prueba.</small>
        </td>
      </tr>
    `;
    return;
  }

  surveysTableBody.innerHTML = list.map((item, index) => {
    const nps = Number(item.recomendacionNPS) || 10;
    const npsClass = nps >= 9 ? 'promotor' : (nps >= 7 ? 'pasivo' : 'detractor');
    const npsLabel = nps >= 9 ? 'Promotor' : (nps >= 7 ? 'Pasivo' : 'Detractor');

    return `
      <tr data-id="${escapeHtml(item.id)}">
        <td><strong style="color: #9333ea; font-family: monospace;">${escapeHtml(item.codigoEncuesta || item.id)}</strong></td>
        <td><small style="color: #64748b;">${escapeHtml(item.fechaFormateada || (item.fecha ? item.fecha.slice(0, 10) : ''))}</small></td>
        <td>
          <strong>${escapeHtml(item.nombreCompleto)}</strong>
          <br><small style="color: #64748b;">${escapeHtml(item.correoElectronico)}</small>
        </td>
        <td>${escapeHtml(item.ciudad || 'Tocaima')}</td>
        <td>${escapeHtml(item.productoFavorito || 'No especificado')}</td>
        <td><span class="rating-badge">⭐ ${item.calificacionCalidad || 5}/5</span></td>
        <td><span class="rating-badge">⭐ ${item.calificacionWeb || 5}/5</span></td>
        <td><span class="nps-tag ${npsClass}">${nps}/10 · ${npsLabel}</span></td>
        <td>
          <button type="button" class="btn-action-view" data-id="${escapeHtml(item.id)}" title="Ver detalle completo">👁️ Ver</button>
          <button type="button" class="btn-action-del" data-id="${escapeHtml(item.id)}" title="Eliminar encuesta">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Búsqueda en vivo
surveySearchInput?.addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase().trim();
  if (!term) {
    renderSurveysTable(cachedSurveys);
    return;
  }
  const filtered = cachedSurveys.filter(item => {
    const nombre = (item.nombreCompleto || '').toLowerCase();
    const correo = (item.correoElectronico || '').toLowerCase();
    const ciudad = (item.ciudad || '').toLowerCase();
    const fav    = (item.productoFavorito || '').toLowerCase();
    const code   = (item.codigoEncuesta || item.id || '').toLowerCase();
    return nombre.includes(term) || correo.includes(term) || ciudad.includes(term) || fav.includes(term) || code.includes(term);
  });
  renderSurveysTable(filtered);
});

// Eventos en tabla de encuestas (delegación)
surveysTableBody?.addEventListener('click', async (e) => {
  const viewBtn = e.target.closest('.btn-action-view');
  if (viewBtn) {
    const id = viewBtn.dataset.id;
    const survey = cachedSurveys.find(s => s.id === id);
    if (survey) showSurveyDetailModal(survey);
    return;
  }

  const delBtn = e.target.closest('.btn-action-del');
  if (delBtn) {
    const id = delBtn.dataset.id;
    if (confirm(`¿Eliminar la encuesta ${id}? Esta acción no se puede deshacer.`)) {
      await window.SurveyDB.deleteSurvey(id);
      showToast('🗑️ Encuesta eliminada de la base de datos.');
      refreshSurveys();
    }
  }
});

function showSurveyDetailModal(item) {
  if (!surveyDetailModal || !surveyDetailContent) return;

  const probados = Array.isArray(item.productosProbados) && item.productosProbados.length
    ? item.productosProbados.join(', ')
    : 'No especificó';

  surveyDetailContent.innerHTML = `
    <!-- Datos del participante -->
    <div class="detail-section">
      <h4 class="detail-section-title">👤 Datos del Encuestado</h4>
      <div class="detail-grid">
        <div class="detail-item"><strong>Código</strong><span>${escapeHtml(item.codigoEncuesta || item.id)}</span></div>
        <div class="detail-item"><strong>Nombre Completo</strong><span>${escapeHtml(item.nombreCompleto)}</span></div>
        <div class="detail-item"><strong>Correo Electrónico</strong><span>${escapeHtml(item.correoElectronico)}</span></div>
        <div class="detail-item"><strong>Teléfono / WhatsApp</strong><span>${escapeHtml(item.telefono || 'No proporcionado')}</span></div>
        <div class="detail-item"><strong>Ciudad / Municipio</strong><span>${escapeHtml(item.ciudad || 'Tocaima')}</span></div>
        <div class="detail-item"><strong>Rango de Edad</strong><span>${escapeHtml(item.rangoEdad || '18-25')}</span></div>
        <div class="detail-item"><strong>Tipo de Cliente</strong><span>${escapeHtml(item.tipoCliente || 'Primera vez')}</span></div>
        <div class="detail-item"><strong>Fecha de Registro</strong><span>${escapeHtml(item.fechaFormateada || item.fecha)}</span></div>
      </div>
    </div>

    <!-- Evaluación de productos -->
    <div class="detail-section">
      <h4 class="detail-section-title">🍨 Opinión sobre los Productos</h4>
      <div class="detail-grid">
        <div class="detail-item"><strong>Productos Probados</strong><span>${escapeHtml(probados)}</span></div>
        <div class="detail-item"><strong>Producto Favorito</strong><span>${escapeHtml(item.productoFavorito || 'No especificado')}</span></div>
        <div class="detail-item"><strong>Calidad y Sabor</strong><span>⭐ ${item.calificacionCalidad || 5} de 5</span></div>
        <div class="detail-item"><strong>Presentación y Frescura</strong><span>⭐ ${item.calificacionPresentacion || 5} de 5</span></div>
        <div class="detail-item"><strong>Percepción de Precios</strong><span>${escapeHtml(item.percepcionPrecio || 'Justos')}</span></div>
      </div>
      <div style="margin-top: 0.75rem;">
        <strong style="font-size: 0.78rem; color: #64748b; text-transform: uppercase;">Nuevo producto o sabor sugerido:</strong>
        <div class="detail-comment-box">${escapeHtml(item.sugerenciaProducto || 'Ninguna sugerencia específica.')}</div>
      </div>
    </div>

    <!-- Evaluación de la página web -->
    <div class="detail-section">
      <h4 class="detail-section-title">🌐 Opinión sobre la Página Web</h4>
      <div class="detail-grid">
        <div class="detail-item"><strong>Calificación General Web</strong><span>⭐ ${item.calificacionWeb || 5} de 5</span></div>
        <div class="detail-item"><strong>Facilidad de Navegación</strong><span>${escapeHtml(item.facilidadNavegacion || 'Muy fácil')}</span></div>
        <div class="detail-item"><strong>Diseño y Colores</strong><span>${escapeHtml(item.percepcionDiseno || 'Arcoíris')}</span></div>
        <div class="detail-item"><strong>Función Carrito WhatsApp</strong><span>${escapeHtml(item.utilidadWhatsapp || 'Excelente')}</span></div>
        <div class="detail-item"><strong>Recomendación NPS</strong><span>⭐ ${item.recomendacionNPS || 10} / 10</span></div>
      </div>
      <div style="margin-top: 0.75rem;">
        <strong style="font-size: 0.78rem; color: #64748b; text-transform: uppercase;">Comentarios o mensaje adicional:</strong>
        <div class="detail-comment-box">${escapeHtml(item.comentarios || 'Sin comentarios adicionales.')}</div>
      </div>
    </div>
  `;

  surveyDetailModal.style.display = 'flex';
}

function closeSurveyDetailModal() {
  if (surveyDetailModal) surveyDetailModal.style.display = 'none';
}

closeDetailModalBtn?.addEventListener('click', closeSurveyDetailModal);
closeDetailModalBtn2?.addEventListener('click', closeSurveyDetailModal);
surveyDetailModal?.addEventListener('click', (e) => {
  if (e.target === surveyDetailModal) closeSurveyDetailModal();
});

// Botones de la barra de encuestas
btnExportCSV?.addEventListener('click', () => {
  window.SurveyDB?.exportToCSV();
});

btnExportJSON?.addEventListener('click', () => {
  window.SurveyDB?.exportToJSON();
});

btnRefreshSurveys?.addEventListener('click', () => {
  refreshSurveys();
  showToast('🔄 Base de datos de encuestas actualizada.');
});

btnSeedDemo?.addEventListener('click', async () => {
  await window.SurveyDB?.seedDemoData();
  showToast('➕ Encuestas de demostración cargadas con éxito.');
  refreshSurveys();
});

btnClearSurveys?.addEventListener('click', async () => {
  if (confirm('⚠️ ¿Estás seguro de vaciar toda la base de datos de encuestas? Esta acción borrará todas las respuestas guardadas.')) {
    await window.SurveyDB?.clearAllSurveys();
    showToast('🗑️ Base de datos de encuestas vaciada.');
    refreshSurveys();
  }
});

function initSurveyDashboard() {
  refreshSurveys();
}

