/**
 * Catálogo de productos — Heladería y Frutería Arcoíris.
 * Única fuente de verdad: tanto la página pública (main.js) como el
 * panel de administración (admin.js) leen y escriben sobre esta misma
 * estructura de datos.
 *
 * Categorías válidas: "helados" | "ensaladas" | "jugos" | "comida rapida"
 */
'use strict';

const DEFAULT_PRODUCTS = [
  {
    id: 'copa-helado',
    name: 'Copa de Helado',
    desc: 'Deliciosa copa con 2 bolas de helado de chocolate, crema chantilly, chocolatina, galleta oreo y salsa de chocolate.',
    price: 18000,
    category: 'helados',
    img: 'copa-helado.png.jpg'
  },
  {
    id: 'copa-helado-mini',
    name: 'Copa de helado mini Arcoíris',
    desc: 'porcion de queso, crema de leche, porcion helado, dulce de mora y una galleta. ¡Colorido y delicioso!',
    price: 10000,
    category: 'helados',
    img: 'copa-fresas.png.jpg'
  },
  {
    id: 'fresas-con-crema',
    name: 'fresas con crema',
    desc: 'fresas, crema de leche y leche condensada.',
    price: 12000,
    category: 'helados',
    img: 'fresas1.png.jpg'
  },
  {
    id: 'fresas-con-crema-y-helado',
    name: 'fresas con crema y helado',
    desc: 'fresas, crema de leche, leche condensada y porcion de helado.',
    price: 14000,
    category: 'helados',
    img: 'fresas2.png.jpg'
  },
  {
    id: 'fresas-con-crema-especial',
    name: 'fresas con crema especial',
    desc: 'fresas, crema de leche, leche condensada , queso y porcion de helado.',
    price: 16000,
    category: 'helados',
    img: 'fresas3.png.jpg'
  },
  {
    id: 'banana-split',
    name: 'banana split',
    desc: 'porcion de banano, crema de leche, queso, 2 bolas de helado, crema chantilly, salsa de chocolate y galleta.',
    price: 15000,
    category: 'helados',
    img: 'banana1.png.jpg'
  },
  {
    id: 'banana-split-super',
    name: 'banana split super',
    desc: 'porcion de banano, crema de leche, queso, 4 bolas de helado, durazno, fresa, salsa de chocolate y galleta.',
    price: 20000,
    category: 'helados',
    img: 'banana2.png.jpg'
  },
  {
    id: 'copa-durazno',
    name: 'copa de helado de durazno',
    desc: 'porcion de helado de durazno, crema de leche, porcion de queso, helado y salsa de mora.',
    price: 15000,
    category: 'helados',
    img: 'copa-durazno.png.jpg'
  },
  {
    id: 'brownie-con-helado',
    name: 'brownie con helado',
    desc: 'brownie al gusto, helado x2, crema chantilly, chocolate, galleta de oreo y salsa de chocolate.',
    price: 15000,
    category: 'helados',
    img: 'brownie.png.jpg'
  },
  {
    id: 'ensalada-clasica',
    name: 'Ensalada Clásica',
    desc: 'Frutas de temporada picadas: mango, fresa, kiwi, papaya, uvas y más, con leche condensada, porcion de helado y crema de leche.',
    price: 8000,
    category: 'ensaladas',
    img: 'ensalada1.png.jpg'
  },
  {
    id: 'ensalada-fruta-sencilla',
    name: 'Ensalada de fruta sencilla',
    desc: 'Frutas de temporada picadas: mango, fresa, kiwi, papaya, uvas y más, con leche condensada, porcion de helado, decoracion, dulce de mora y crema de leche.',
    price: 10000,
    category: 'ensaladas',
    img: 'ensalada2.png.jpg'
  },
  {
    id: 'ensalada-especial',
    name: 'Ensalada Arcoíris',
    desc: 'variedad de frutas, queso, crema de leche, decoracion especial, porcion de helado x2, dulce de mora y dos galletas. ¡La más pedida!',
    price: 13000,
    category: 'ensaladas',
    img: 'ensalada3.png.jpg',
    popular: true
  },
  {
    id: 'jugo-natural',
    name: 'Jugo Natural',
    desc: 'Jugos recién preparados en agua o leche: lulo, maracuyá, mango, mora, naranja, mandarina y más.',
    price: 7000,
    category: 'jugos',
    img: 'jugos1.png.jpg'
  },
  {
    id: 'limonada-de-coco',
    name: 'limonada de coco',
    desc: 'Deliciosa limonada cremosa preparada con coco natural.',
    price: 8500,
    category: 'jugos',
    img: 'limonada.png.jpg'
  },
  {
    id: 'malteada',
    name: 'malteada',
    desc: 'vainilla, chocolate, fresa, arequipe, oreo, brownie',
    price: 15000,
    category: 'jugos',
    img: 'malteada.png.jpg'
  },
  {
    id: 'michelada',
    name: 'michelada',
    desc: 'Michelada bien fría, lista para acompañar tu tarde.',
    price: 10000,
    category: 'jugos',
    img: 'michelada.png.jpg'
  },
  {
    id: 'hamburguesa-sencilla',
    name: 'hamburguesa sencilla',
    desc: 'carne artesanal, queso, cebolla caramelizada, lechuga, pan dorado en mantequilla, papa cabello de angel.',
    price: 12000,
    category: 'comida rapida',
    img: 'hamburguesa1.png.jpg'
  },
  {
    id: 'hamburguesa-especial',
    name: 'hamburguesa especial',
    desc: 'carne artesanal, queso, jamon, huevo frito, cebolla caramelizada, lechuga, pan dorado en mantequilla, papa cabello de angel.',
    price: 15000,
    category: 'comida rapida',
    img: 'hamburguesa2.png.jpg'
  },
  {
    id: 'perro-sencillo',
    name: 'perro sencillo',
    desc: 'salchicha, queso, papa cabello de angel.',
    price: 12000,
    category: 'comida rapida',
    img: 'perro.png.jpg'
  }
];

/** Metadatos visuales por categoría (emoji, etiqueta, color de badge). */
const CATEGORY_META = {
  'helados':       { label: 'Helados',        emoji: '🍦', badgeClass: 'badge-red' },
  'ensaladas':      { label: 'Ensaladas',      emoji: '🥗', badgeClass: 'badge-green' },
  'jugos':          { label: 'Jugos',          emoji: '🥤', badgeClass: 'badge-blue' },
  'comida rapida':  { label: 'Comida Rápida',  emoji: '🍔', badgeClass: 'badge-pink' }
};

/** Clave usada en localStorage para guardar los cambios del panel admin. */
const PRODUCTS_STORAGE_KEY = 'arcoiris_products';

/**
 * Devuelve el catálogo vigente: lo guardado por el panel admin en este
 * navegador (si existe) o, en su defecto, el catálogo por defecto.
 * @returns {Array<Object>}
 */
function getProducts() {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('No se pudo leer el catálogo guardado, usando el predeterminado.', err);
  }
  return JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
}

/**
 * Guarda el catálogo completo en localStorage (usado por el panel admin).
 * @param {Array<Object>} products
 */
function saveProducts(products) {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

/** Resuelve la ruta de imagen de un producto: dataURL (subida) o archivo en img/. */
function resolveProductImg(img) {
  if (!img) return '';
  return img.startsWith('data:') ? img : `img/${img}`;
}
