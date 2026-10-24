/**
 * =====================================================================
 * Heladería y Frutería Arcoíris - survey-db.js
 * Módulo de Base de Datos para el Sistema de Encuestas
 *
 * Características:
 *  1. Base de datos nativa IndexedDB ('arcoiris_db') + respaldo en localStorage.
 *  2. Detección y sincronización automática con API MySQL (api/guardar_encuesta.php) si existe backend.
 *  3. Estadísticas automáticas (NPS, promedios, conteos).
 *  4. Exportación nativa a Excel (CSV con UTF-8 BOM) y JSON.
 *  5. Funciona 100% en GitHub Pages (entorno estático) y en servidores locales (XAMPP/PHP).
 * =====================================================================
 */

'use strict';

(function(window) {
  const DB_NAME = 'arcoiris_db';
  const DB_VERSION = 1;
  const STORE_NAME = 'encuestas';
  const STORAGE_KEY = 'arcoiris_encuestas_v1';

  let dbInstance = null;

  // Encuestas de demostración predeterminadas (para evaluar inmediatamente el panel)
  const DEMO_SURVEYS = [
    {
      id: 'ENC-20261020-0001',
      codigoEncuesta: 'ENC-20261020-0001',
      nombreCompleto: 'Valentina Martínez',
      correoElectronico: 'valentina.m@gmail.com',
      telefono: '3104567890',
      ciudad: 'Tocaima',
      rangoEdad: '18-25',
      tipoCliente: 'Frecuente',
      productosProbados: ['Helados artesanales', 'Fresas con crema'],
      productoFavorito: 'Fresas Salvajes con Crema',
      calificacionCalidad: 5,
      calificacionPresentacion: 5,
      percepcionPrecio: 'Justos y adecuados',
      sugerenciaProducto: 'Helado de Maracuyá artesanal con trozos de chocolate.',
      calificacionWeb: 5,
      facilidadNavegacion: 'Muy fácil',
      percepcionDiseno: 'Me encanta el estilo arcoíris',
      utilidadWhatsapp: 'Excelente y muy práctica',
      recomendacionNPS: 10,
      comentarios: '¡Me encanta la página! Los colores combinan perfecto con el local físico en Tocaima.',
      fecha: '2026-10-20T15:30:00.000Z',
      fechaFormateada: '20/10/2026, 10:30 a. m.'
    },
    {
      id: 'ENC-20261021-0002',
      codigoEncuesta: 'ENC-20261021-0002',
      nombreCompleto: 'Carlos Eduardo Gómez',
      correoElectronico: 'carlos.gomez@hotmail.com',
      telefono: '3209876543',
      ciudad: 'Girardot',
      rangoEdad: '26-40',
      tipoCliente: 'Ocasional',
      productosProbados: ['Ensaladas de frutas', 'Jugos naturales'],
      productoFavorito: 'Super Ensalada Arcoíris',
      calificacionCalidad: 5,
      calificacionPresentacion: 4,
      percepcionPrecio: 'Justos y adecuados',
      sugerenciaProducto: 'Añadir opción de kiwi fresco y granola artesanal.',
      calificacionWeb: 4,
      facilidadNavegacion: 'Fácil',
      percepcionDiseno: 'Muy bonito y agradable',
      utilidadWhatsapp: 'Excelente y muy práctica',
      recomendacionNPS: 9,
      comentarios: 'El carrito de compras conectado con WhatsApp es súper rápido para hacer pedidos a domicilio.',
      fecha: '2026-10-21T18:15:00.000Z',
      fechaFormateada: '21/10/2026, 1:15 p. m.'
    },
    {
      id: 'ENC-20261022-0003',
      codigoEncuesta: 'ENC-20261022-0003',
      nombreCompleto: 'María Fernanda Ruiz',
      correoElectronico: 'mafe.ruiz@gmail.com',
      telefono: '3157891234',
      ciudad: 'Agua de Dios',
      rangoEdad: '18-25',
      tipoCliente: 'Primera vez',
      productosProbados: ['Helados artesanales', 'Comidas rápidas'],
      productoFavorito: 'Copa Arcoíris Suprema',
      calificacionCalidad: 4,
      calificacionPresentacion: 5,
      percepcionPrecio: 'Muy económicos',
      sugerenciaProducto: 'Waffles con bola de helado artesanal.',
      calificacionWeb: 5,
      facilidadNavegacion: 'Muy fácil',
      percepcionDiseno: 'Me encanta el estilo arcoíris',
      utilidadWhatsapp: 'Buena opción',
      recomendacionNPS: 10,
      comentarios: 'Excelente la página, muy rápida y fácil de ver el menú completo desde el celular.',
      fecha: '2026-10-22T11:00:00.000Z',
      fechaFormateada: '22/10/2026, 6:00 a. m.'
    }
  ];

  /* -------------------------------------------------------------
   * 1. INICIALIZACIÓN DE INDEXEDDB
   * ------------------------------------------------------------- */
  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (dbInstance) {
        return resolve(dbInstance);
      }
      if (!window.indexedDB) {
        return resolve(null); // Fallback silencioso a localStorage
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = function(e) {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('fecha', 'fecha', { unique: false });
          store.createIndex('calificacionWeb', 'calificacionWeb', { unique: false });
          store.createIndex('calificacionCalidad', 'calificacionCalidad', { unique: false });
        }
      };

      request.onsuccess = function(e) {
        dbInstance = e.target.result;
        resolve(dbInstance);
      };

      request.onerror = function() {
        resolve(null);
      };
    });
  }

  /* -------------------------------------------------------------
   * 2. OPERACIONES CON LOCALSTORAGE (Sincrónicas y de Respaldo)
   * ------------------------------------------------------------- */
  function getLocalSurveys() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // Cargar datos iniciales de demo la primera vez
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_SURVEYS));
        return DEMO_SURVEYS.slice();
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('Error leyendo localStorage:', e);
      return [];
    }
  }

  function setLocalSurveys(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Error guardando en localStorage:', e);
    }
  }

  /* -------------------------------------------------------------
   * 3. GUARDAR ENCUESTA (Base de Datos Unificada)
   * ------------------------------------------------------------- */
  async function saveSurvey(data) {
    const now = new Date();
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const dateCode = now.toISOString().slice(0, 10).replace(/-/g, '');
    const uniqueId = `ENC-${dateCode}-${randomHex}`;

    const record = {
      id: uniqueId,
      codigoEncuesta: uniqueId,
      nombreCompleto: data.nombreCompleto || 'Anónimo',
      correoElectronico: data.correoElectronico || '',
      telefono: data.telefono || '',
      ciudad: data.ciudad || 'Tocaima',
      rangoEdad: data.rangoEdad || '18-25',
      tipoCliente: data.tipoCliente || 'Primera vez',
      productosProbados: Array.isArray(data.productosProbados) ? data.productosProbados : [],
      productoFavorito: data.productoFavorito || 'No especificado',
      calificacionCalidad: Number(data.calificacionCalidad) || 5,
      calificacionPresentacion: Number(data.calificacionPresentacion) || 5,
      percepcionPrecio: data.percepcionPrecio || 'Justos y adecuados',
      sugerenciaProducto: data.sugerenciaProducto || '',
      calificacionWeb: Number(data.calificacionWeb) || 5,
      facilidadNavegacion: data.facilidadNavegacion || 'Muy fácil',
      percepcionDiseno: data.percepcionDiseno || 'Me encanta el estilo arcoíris',
      utilidadWhatsapp: data.utilidadWhatsapp || 'Excelente y muy práctica',
      recomendacionNPS: Number(data.recomendacionNPS) || 10,
      comentarios: data.comentarios || '',
      fecha: now.toISOString(),
      fechaFormateada: now.toLocaleString('es-CO', {
        dateStyle: 'short',
        timeStyle: 'short'
      })
    };

    // 1. Guardar en localStorage
    const localList = getLocalSurveys();
    localList.unshift(record);
    setLocalSurveys(localList);

    // 2. Guardar en IndexedDB
    try {
      const db = await openDatabase();
      if (db) {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(record);
      }
    } catch (e) {
      console.warn('Error en IndexedDB:', e);
    }

    // 3. Intento en segundo plano de guardar en API MySQL (si está en servidor PHP)
    try {
      fetch('api/guardar_encuesta.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      }).catch(() => {
        // En GitHub Pages o local estático es normal que no haya backend PHP; continúa normalmente.
      });
    } catch (_) {}

    return {
      success: true,
      id: uniqueId,
      record: record
    };
  }

  /* -------------------------------------------------------------
   * 4. OBTENER TODAS LAS ENCUESTAS
   * ------------------------------------------------------------- */
  async function getAllSurveys() {
    // Si tenemos IndexedDB disponible, consultamos
    try {
      const db = await openDatabase();
      if (db) {
        const list = await new Promise((resolve) => {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        });

        if (list && list.length > 0) {
          // Ordenar del más reciente al más antiguo
          list.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
          return list;
        }
      }
    } catch (e) {
      console.warn('IndexedDB read error:', e);
    }

    // Respaldo en localStorage
    const local = getLocalSurveys();
    local.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    return local;
  }

  /* -------------------------------------------------------------
   * 5. ELIMINAR UNA ENCUESTA
   * ------------------------------------------------------------- */
  async function deleteSurvey(id) {
    // 1. En localStorage
    const local = getLocalSurveys().filter(item => item.id !== id);
    setLocalSurveys(local);

    // 2. En IndexedDB
    try {
      const db = await openDatabase();
      if (db) {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(id);
      }
    } catch (e) {
      console.warn('IndexedDB delete error:', e);
    }

    return true;
  }

  /* -------------------------------------------------------------
   * 6. BORRAR TODAS LAS ENCUESTAS
   * ------------------------------------------------------------- */
  async function clearAllSurveys() {
    setLocalSurveys([]);
    try {
      const db = await openDatabase();
      if (db) {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).clear();
      }
    } catch (e) {
      console.warn('IndexedDB clear error:', e);
    }
  }

  /* -------------------------------------------------------------
   * 7. CARGAR DATOS DEMO
   * ------------------------------------------------------------- */
  async function seedDemoData() {
    setLocalSurveys(DEMO_SURVEYS.slice());
    try {
      const db = await openDatabase();
      if (db) {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.clear();
        DEMO_SURVEYS.forEach(item => store.put(item));
      }
    } catch (e) {
      console.warn('IndexedDB seed error:', e);
    }
    return DEMO_SURVEYS;
  }

  /* -------------------------------------------------------------
   * 8. CÁLCULO DE ESTADÍSTICAS Y MÉTRICAS
   * ------------------------------------------------------------- */
  async function getStats() {
    const list = await getAllSurveys();
    const total = list.length;

    if (total === 0) {
      return {
        total: 0,
        promedioCalidad: '0.0',
        promedioPresentacion: '0.0',
        promedioWeb: '0.0',
        promedioNPS: '0.0',
        porcentajeRecomienda: 0,
        favoritos: {},
        topFavorito: 'Ninguno aún'
      };
    }

    let sumaCalidad = 0;
    let sumaPres = 0;
    let sumaWeb = 0;
    let sumaNps = 0;
    let promotores = 0; // NPS 9 o 10
    const favoritosMap = {};

    list.forEach(item => {
      sumaCalidad += (Number(item.calificacionCalidad) || 5);
      sumaPres    += (Number(item.calificacionPresentacion) || 5);
      sumaWeb     += (Number(item.calificacionWeb) || 5);
      const nps = Number(item.recomendacionNPS) || 10;
      sumaNps     += nps;
      if (nps >= 9) promotores++;

      const fav = (item.productoFavorito || '').trim();
      if (fav && fav.toLowerCase() !== 'no especificado') {
        favoritosMap[fav] = (favoritosMap[fav] || 0) + 1;
      }
    });

    let topFav = 'Fresas Salvajes con Crema';
    let maxVotos = 0;
    for (const [nombre, count] of Object.entries(favoritosMap)) {
      if (count > maxVotos) {
        maxVotos = count;
        topFav = nombre;
      }
    }

    return {
      total,
      promedioCalidad: (sumaCalidad / total).toFixed(1),
      promedioPresentacion: (sumaPres / total).toFixed(1),
      promedioWeb: (sumaWeb / total).toFixed(1),
      promedioNPS: (sumaNps / total).toFixed(1),
      porcentajeRecomienda: Math.round((promotores / total) * 100),
      topFavorito: topFav
    };
  }

  /* -------------------------------------------------------------
   * 9. EXPORTAR A EXCEL (CSV con UTF-8 BOM)
   * ------------------------------------------------------------- */
  async function exportToCSV() {
    const list = await getAllSurveys();
    if (!list.length) {
      alert('No hay encuestas en la base de datos para exportar.');
      return;
    }

    const headers = [
      'Código Encuesta',
      'Fecha',
      'Nombre Completo',
      'Correo Electrónico',
      'Teléfono / WhatsApp',
      'Ciudad',
      'Rango de Edad',
      'Tipo de Cliente',
      'Productos Probados',
      'Producto Favorito',
      'Calificación Calidad (1-5)',
      'Calificación Presentación (1-5)',
      'Percepción Precio',
      'Sugerencia Nuevo Producto',
      'Calificación Web (1-5)',
      'Facilidad Navegación',
      'Diseño Web',
      'Utilidad Carrito WhatsApp',
      'Recomendación NPS (1-10)',
      'Comentarios y Sugerencias'
    ];

    const rows = list.map(item => [
      `"${item.codigoEncuesta || item.id}"`,
      `"${item.fechaFormateada || item.fecha}"`,
      `"${(item.nombreCompleto || '').replace(/"/g, '""')}"`,
      `"${(item.correoElectronico || '').replace(/"/g, '""')}"`,
      `"${(item.telefono || '').replace(/"/g, '""')}"`,
      `"${(item.ciudad || '').replace(/"/g, '""')}"`,
      `"${item.rangoEdad || ''}"`,
      `"${item.tipoCliente || ''}"`,
      `"${(item.productosProbados || []).join(', ').replace(/"/g, '""')}"`,
      `"${(item.productoFavorito || '').replace(/"/g, '""')}"`,
      item.calificacionCalidad || 5,
      item.calificacionPresentacion || 5,
      `"${item.percepcionPrecio || ''}"`,
      `"${(item.sugerenciaProducto || '').replace(/"/g, '""')}"`,
      item.calificacionWeb || 5,
      `"${item.facilidadNavegacion || ''}"`,
      `"${item.percepcionDiseno || ''}"`,
      `"${item.utilidadWhatsapp || ''}"`,
      item.recomendacionNPS || 10,
      `"${(item.comentarios || '').replace(/"/g, '""')}"`
    ]);

    // Prepend UTF-8 BOM (\uFEFF) para que Excel abra sin problemas de acentos o eñes
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `encuestas_arcoiris_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /* -------------------------------------------------------------
   * 10. EXPORTAR A JSON
   * ------------------------------------------------------------- */
  async function exportToJSON() {
    const list = await getAllSurveys();
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `encuestas_arcoiris_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Sincronizar demo data a IndexedDB al inicio
  openDatabase().then(async (db) => {
    if (db) {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).count();
      req.onsuccess = () => {
        if (req.result === 0) {
          const writeTx = db.transaction(STORE_NAME, 'readwrite');
          const store = writeTx.objectStore(STORE_NAME);
          const initial = getLocalSurveys();
          initial.forEach(i => store.put(i));
        }
      };
    }
  });

  // Exponer API global
  window.SurveyDB = {
    saveSurvey,
    getAllSurveys,
    deleteSurvey,
    clearAllSurveys,
    seedDemoData,
    getStats,
    exportToCSV,
    exportToJSON
  };

})(window);
