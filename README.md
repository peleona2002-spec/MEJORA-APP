# 🌈 Heladería y Frutería Arcoíris

Sitio web de **Heladería y Frutería Arcoíris**, ubicada en Tocaima, Cundinamarca (Colombia). Incluye catálogo de productos con carrito de compras (pedidos por WhatsApp), sistema interactivo de **Encuestas de Satisfacción con Base de Datos**, y un panel de administración para gestionar productos y consultar las respuestas de los usuarios.

---

## 📁 Estructura del proyecto

```
proyecto-sena-main/
├── index.html                   # Página pública del sitio (incluye la Encuesta interactiva)
├── admin.html                   # Panel de administración (Productos + Base de Datos de Encuestas)
├── database.sql                 # Script SQL relacional (tablas, relaciones, vistas, seed data)
├── api/                         # Endpoints PHP para backend MySQL (opcional/servidor local)
│   ├── db_config.php            # Conexión PDO a MySQL
│   ├── guardar_encuesta.php     # Registro de encuestas en MySQL
│   └── obtener_encuestas.php    # Consulta de encuestas desde MySQL
├── css/
│   ├── styles.css               # Estilos del sitio público y sección de encuestas
│   └── admin.css                # Estilos del panel admin y visualizador de base de datos
├── js/
│   ├── products.js              # Catálogo de productos (fuente única de datos)
│   ├── survey-db.js             # Módulo de Base de Datos (IndexedDB + LocalStorage + API + Exportación CSV/JSON)
│   ├── survey.js                # Lógica interactiva del formulario de encuesta
│   ├── main.js                  # Lógica del sitio: nav, carrito, modal, filtros, slideshow
│   └── admin.js                 # Lógica del panel de administración y panel de encuestas
├── img/                         # Todas las imágenes del sitio (productos, equipo, hero)
└── README.md                    # Documentación del proyecto
```

---

## 📋 Sistema de Encuestas de Satisfacción y Opinión

El sistema está direccionado y conectado tanto con el formulario institucional oficial como con el módulo interactivo de la página:
* **Enlace Institucional PQR y Encuestas:** [`https://iedhernanvenegascarrillo.edu.co/bases2026/proyecto3/pqr3.html`](https://iedhernanvenegascarrillo.edu.co/bases2026/proyecto3/pqr3.html)
* **Acceso desde el sitio:** Disponible en la barra de navegación superior, en los botones principales del hero, en el banner de la sección de encuestas y en el pie de página.

La encuesta permite a los visitantes registrar información y dar su opinión en 3 pasos:

1. **👤 Información Personal:**
   - Nombre completo y correo electrónico.
   - Teléfono / WhatsApp (opcional).
   - Ciudad o municipio (Tocaima, Girardot, Agua de Dios, Viotá, Bogotá, Otra).
   - Rango de edad y frecuencia de visita (Primera vez, Ocasional, Frecuente).

2. **🍨 Opinión sobre los Productos:**
   - Selección de categorías y productos probados (helados, ensaladas, fresas con crema, malteadas, etc.).
   - Producto favorito del menú.
   - Calificación de calidad y sabor (estrellas interactivas 1 a 5 ⭐).
   - Calificación de presentación y frescura (estrellas interactivas 1 a 5 ⭐).
   - Percepción de precios.
   - Sugerencias de nuevos sabores o postres.

3. **🌐 Opinión sobre la Página Web y Servicio:**
   - Calificación general de la experiencia web (estrellas 1 a 5 ⭐).
   - Facilidad de navegación.
   - Percepción del diseño visual arcoíris.
   - Utilidad de la función del carrito con pedidos directos a WhatsApp.
   - Escala NPS de recomendación del 1 al 10 (Promotores, Pasivos, Detractores).
   - Comentarios, sugerencias y felicitaciones libres.

---

## 🗄️ Arquitectura de la Base de Datos

El sistema implementa una arquitectura híbrida pensada tanto para despliegue en **GitHub Pages** como para entrega académica **SENA**:

### 1. Base de Datos en el Navegador (IndexedDB + LocalStorage)
- Se ejecuta automáticamente en cualquier navegador sin necesidad de servidores externos.
- Almacena cada encuesta con un identificador único generado (`ENC-YYYYMMDD-XXXX`), fecha y hora precisa.
- Persiste a través de recargas y reinicios.
- Totalmente funcional en GitHub Pages.

### 2. Base de Datos Relacional SQL (`database.sql`)
- Script SQL compatible con MySQL / MariaDB (phpMyAdmin, XAMPP, Workbench).
- **Tablas relacionales:**
  - `encuestados`: Datos personales y demográficos.
  - `productos_interes`: Categorías probadas (relación 1:N con clave foránea `ON DELETE CASCADE`).
  - `evaluaciones_productos`: Calidad, presentación, producto favorito y sugerencias.
  - `evaluaciones_sitio_web`: Calificación web, navegación, pedidos por WhatsApp y métrica NPS.
- **Vistas y Reportes:**
  - `vista_resumen_encuestas`: Consulta consolidada de todas las respuestas.
- Incluye registros de prueba (`INSERT INTO`) con respuestas realistas de la región (Tocaima, Girardot, Agua de Dios).

### 3. API PHP (`api/`)
- Conexión PDO con sentencias preparadas para prevenir inyección SQL.
- Si el proyecto se ejecuta en un servidor con soporte PHP/MySQL (como XAMPP en `htdocs`), las encuestas se sincronizan directamente a MySQL en tiempo real.

---

## 🔐 Panel de Administración (`admin.html`)

El panel incluye dos pestañas:

1. **🍨 Catálogo de Productos:** Permite editar precios, imágenes, nombres y categorías del catálogo.
2. **📋 Encuestas y Base de Datos:**
   - **Tarjetas KPI en vivo:** Total de encuestas, promedio de satisfacción de productos, promedio de la web y porcentaje de recomendación NPS.
   - **Tabla interactiva:** Listado completo con buscador en tiempo real por nombre, correo o producto favorito.
   - **👁️ Ver Detalle:** Modal con el desglose completo de todas las respuestas del cliente.
   - **📥 Exportar a Excel (CSV):** Descarga inmediata en formato CSV con codificación UTF-8 BOM (compatible con Microsoft Excel).
   - **⬇️ Exportar JSON:** Respaldo completo de la base de datos en formato JSON.
   - **➕ Cargar Datos Demo:** Inserta encuestas de prueba para demostración y evaluación rápida.
   - **🗑️ Vaciar / Eliminar:** Gestión de registros.

**Acceso al panel:** contraseña `arcoiris2026` (definida en `js/admin.js`).

---

## 🚀 Cómo ejecutar el sitio

### Opción 1: En línea vía GitHub Pages
1. Abre el repositorio en GitHub y activa GitHub Pages (`Settings → Pages → Branch: main / root`).
2. Ingresa a la URL asignada. ¡El sitio y la encuesta funcionan de inmediato!

### Opción 2: Servidor local simple
```bash
npx serve .
# o
python -m http.server 8080
```
Visita `http://localhost:8080`.

### Opción 3: Con base de datos MySQL local (XAMPP / WampServer)
1. Coloca la carpeta en `C:\xampp\htdocs\heladeria-arcoiris`.
2. En phpMyAdmin, crea la base de datos o importa el archivo `database.sql`.
3. Abre `http://localhost/heladeria-arcoiris/` en tu navegador.

---

## 📞 Contacto del negocio

- **WhatsApp:** +57 313 429 28 31
- **Dirección:** Calle 4 #8-76, Tocaima, Cundinamarca, Colombia
- **Horario:** Lunes a Domingo, 11:00 am – 11:00 pm
