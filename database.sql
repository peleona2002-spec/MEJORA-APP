-- =====================================================================
-- HELADERÍA Y FRUTERÍA ARCOÍRIS - TOCAIMA, CUNDINAMARCA
-- PROYECTO SENA: SISTEMA DE ENCUESTAS DE SATISFACCIÓN Y OPINIÓN
-- Script SQL de creación de Base de Datos y Tablas Relacionales
-- Motor: MySQL 5.7+ / MariaDB 10.3+ / Compatible con phpMyAdmin y XAMPP
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `heladeria_arcoiris_db`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `heladeria_arcoiris_db`;

-- Desactivar temporalmente revisión de claves foráneas
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `evaluaciones_sitio_web`;
DROP TABLE IF EXISTS `evaluaciones_productos`;
DROP TABLE IF EXISTS `productos_interes`;
DROP TABLE IF EXISTS `encuestados`;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- 1. TABLA: encuestados
-- Almacena los datos personales y demográficos del participante.
-- =====================================================================
CREATE TABLE `encuestados` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `codigo_encuesta` VARCHAR(32) NOT NULL UNIQUE COMMENT 'Identificador único público (ej: ENC-20261022-XXXX)',
  `nombre_completo` VARCHAR(120) NOT NULL COMMENT 'Nombre y apellido del cliente',
  `correo_electronico` VARCHAR(150) NOT NULL COMMENT 'Correo electrónico de contacto',
  `telefono` VARCHAR(25) NULL COMMENT 'Teléfono o WhatsApp de contacto',
  `ciudad` VARCHAR(80) NOT NULL DEFAULT 'Tocaima' COMMENT 'Municipio o ciudad de residencia',
  `rango_edad` ENUM('Menor de 18', '18-25', '26-40', '41-60', 'Más de 60') NOT NULL DEFAULT '18-25',
  `tipo_cliente` ENUM('Primera vez', 'Ocasional', 'Frecuente') NOT NULL DEFAULT 'Primera vez',
  `acepta_tratamiento_datos` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = Aceptó términos y política de datos',
  `ip_origen` VARCHAR(45) NULL COMMENT 'Dirección IP del cliente si aplica',
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_encuestado_fecha` (`creado_en`),
  INDEX `idx_encuestado_ciudad` (`ciudad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 2. TABLA: productos_interes
-- Relación 1:N que registra las categorías o productos que el cliente ha probado.
-- =====================================================================
CREATE TABLE `productos_interes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `encuestado_id` INT NOT NULL,
  `categoria_producto` VARCHAR(60) NOT NULL COMMENT 'Ej: Helados artesanales, Ensaladas de frutas, Fresas con crema, Malteadas, Jugos naturales, Comidas rápidas',
  CONSTRAINT `fk_interes_encuestado`
    FOREIGN KEY (`encuestado_id`)
    REFERENCES `encuestados` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  INDEX `idx_interes_encuestado` (`encuestado_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 3. TABLA: evaluaciones_productos
-- Registra las opiniones específicas sobre el catálogo y los productos físicos.
-- =====================================================================
CREATE TABLE `evaluaciones_productos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `encuestado_id` INT NOT NULL UNIQUE,
  `producto_favorito` VARCHAR(150) NULL COMMENT 'Nombre del producto que más le gusta',
  `calificacion_calidad` TINYINT NOT NULL COMMENT 'Puntuación 1 a 5 estrellas para calidad y sabor',
  `calificacion_presentacion` TINYINT NOT NULL COMMENT 'Puntuación 1 a 5 estrellas para frescura y presentación',
  `percepcion_precio` ENUM('Muy económicos', 'Justos y adecuados', 'Podrían ser más accesibles') NOT NULL DEFAULT 'Justos y adecuados',
  `sugerencia_nuevo_producto` TEXT NULL COMMENT 'Nuevos sabores o productos solicitados por el cliente',
  CONSTRAINT `fk_evalprod_encuestado`
    FOREIGN KEY (`encuestado_id`)
    REFERENCES `encuestados` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `chk_calidad_rango` CHECK (`calificacion_calidad` BETWEEN 1 AND 5),
  CONSTRAINT `chk_presentacion_rango` CHECK (`calificacion_presentacion` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 4. TABLA: evaluaciones_sitio_web
-- Registra la usabilidad, experiencia visual y función de pedidos web.
-- =====================================================================
CREATE TABLE `evaluaciones_sitio_web` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `encuestado_id` INT NOT NULL UNIQUE,
  `calificacion_web` TINYINT NOT NULL COMMENT 'Puntuación 1 a 5 estrellas para la experiencia web',
  `facilidad_navegacion` ENUM('Muy fácil', 'Fácil', 'Regular', 'Difícil') NOT NULL DEFAULT 'Muy fácil',
  `percepcion_diseno` ENUM('Me encanta el estilo arcoíris', 'Muy bonito y agradable', 'Normal', 'Podría mejorar') NOT NULL DEFAULT 'Me encanta el estilo arcoíris',
  `utilidad_whatsapp` ENUM('Excelente y muy práctica', 'Buena opción', 'Prefiero ir al local') NOT NULL DEFAULT 'Excelente y muy práctica',
  `nps_recomendacion` TINYINT NOT NULL COMMENT 'Escala del 1 al 10: ¿Recomendaría Heladería Arcoíris?',
  `comentarios_adicionales` TEXT NULL COMMENT 'Sugerencias o comentarios libres',
  CONSTRAINT `fk_evalweb_encuestado`
    FOREIGN KEY (`encuestado_id`)
    REFERENCES `encuestados` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `chk_web_rango` CHECK (`calificacion_web` BETWEEN 1 AND 5),
  CONSTRAINT `chk_nps_rango` CHECK (`nps_recomendacion` BETWEEN 1 AND 10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 5. VISTA CONSOLIDADA: vista_resumen_encuestas
-- Facilita consultas, reportes en phpMyAdmin y visualización unificada.
-- =====================================================================
CREATE OR REPLACE VIEW `vista_resumen_encuestas` AS
SELECT
  e.id,
  e.codigo_encuesta,
  e.nombre_completo,
  e.correo_electronico,
  e.telefono,
  e.ciudad,
  e.rango_edad,
  e.tipo_cliente,
  ep.producto_favorito,
  ep.calificacion_calidad,
  ep.calificacion_presentacion,
  ep.percepcion_precio,
  ep.sugerencia_nuevo_producto,
  ew.calificacion_web,
  ew.facilidad_navegacion,
  ew.percepcion_diseno,
  ew.utilidad_whatsapp,
  ew.nps_recomendacion,
  ew.comentarios_adicionales,
  e.creado_en
FROM `encuestados` e
LEFT JOIN `evaluaciones_productos` ep ON ep.encuestado_id = e.id
LEFT JOIN `evaluaciones_sitio_web` ew ON ew.encuestado_id = e.id
ORDER BY e.creado_en DESC;

-- =====================================================================
-- 6. DATOS DE PRUEBA (SEED DATA)
-- Permite visualizar estadísticas inmediatas al importar el script.
-- =====================================================================
INSERT INTO `encuestados` (`id`, `codigo_encuesta`, `nombre_completo`, `correo_electronico`, `telefono`, `ciudad`, `rango_edad`, `tipo_cliente`, `creado_en`) VALUES
(1, 'ENC-20261022-A1B2', 'Valentina Martínez', 'valentina.m@gmail.com', '3104567890', 'Tocaima', '18-25', 'Frecuente', NOW() - INTERVAL 3 DAY),
(2, 'ENC-20261022-C3D4', 'Carlos Eduardo Gómez', 'carlos.gomez@hotmail.com', '3209876543', 'Girardot', '26-40', 'Ocasional', NOW() - INTERVAL 2 DAY),
(3, 'ENC-20261022-E5F6', 'María Fernanda Ruiz', 'mafe.ruiz@gmail.com', '3157891234', 'Agua de Dios', '18-25', 'Primera vez', NOW() - INTERVAL 1 DAY),
(4, 'ENC-20261022-G7H8', 'Andrés Felipe Morales', 'andres.felipe@yahoo.com', '3182345678', 'Tocaima', '26-40', 'Frecuente', NOW());

INSERT INTO `productos_interes` (`encuestado_id`, `categoria_producto`) VALUES
(1, 'Helados artesanales'), (1, 'Fresas con crema'),
(2, 'Ensaladas de frutas'), (2, 'Jugos naturales'),
(3, 'Helados artesanales'), (3, 'Comidas rápidas'),
(4, 'Fresas con crema'), (4, 'Malteadas'), (4, 'Helados artesanales');

INSERT INTO `evaluaciones_productos` (`encuestado_id`, `producto_favorito`, `calificacion_calidad`, `calificacion_presentacion`, `percepcion_precio`, `sugerencia_nuevo_producto`) VALUES
(1, 'Fresas Salvajes con Crema', 5, 5, 'Justos y adecuados', 'Helado de Maracuyá con trozos de chocolate'),
(2, 'Super Ensalada Arcoíris', 5, 4, 'Justos y adecuados', 'Añadir opción de kiwi fresco y granola artesanal'),
(3, 'Copa Arcoíris Suprema', 4, 5, 'Muy económicos', 'Waffles con helado artesanal'),
(4, 'Malteada Arcoíris Especial', 5, 5, 'Justos y adecuados', 'Malteada de brownie con arequipe');

INSERT INTO `evaluaciones_sitio_web` (`encuestado_id`, `calificacion_web`, `facilidad_navegacion`, `percepcion_diseno`, `utilidad_whatsapp`, `nps_recomendacion`, `comentarios_adicionales`) VALUES
(1, 5, 'Muy fácil', 'Me encanta el estilo arcoíris', 'Excelente y muy práctica', 10, '¡Me encanta la página! Los colores combinan perfecto con el local físico en Tocaima.'),
(2, 4, 'Fácil', 'Muy bonito y agradable', 'Excelente y muy práctica', 9, 'El carrito de compras con WhatsApp es súper rápido para hacer pedidos a domicilio.'),
(3, 5, 'Muy fácil', 'Me encanta el estilo arcoíris', 'Buena opción', 10, 'Excelente iniciativa la encuesta, la página carga rapidísimo en el celular.'),
(4, 5, 'Muy fácil', 'Me encanta el estilo arcoíris', 'Excelente y muy práctica', 10, '¡Felicitaciones a las desarrolladoras y al equipo de Arcoíris!');

-- =====================================================================
-- 7. CONSULTAS TÍPICAS PARA REPORTES ACADÉMICOS (SENA)
-- =====================================================================
-- Promedio general de satisfacción
-- SELECT
--   COUNT(*) AS total_encuestas,
--   ROUND(AVG(ep.calificacion_calidad), 2) AS promedio_calidad,
--   ROUND(AVG(ep.calificacion_presentacion), 2) AS promedio_presentacion,
--   ROUND(AVG(ew.calificacion_web), 2) AS promedio_web,
--   ROUND(AVG(ew.nps_recomendacion), 2) AS promedio_nps
-- FROM `encuestados` e
-- JOIN `evaluaciones_productos` ep ON ep.encuestado_id = e.id
-- JOIN `evaluaciones_sitio_web` ew ON ew.encuestado_id = e.id;
