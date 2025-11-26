/**
 * HELPERS
 * Funciones auxiliares reutilizables
 */

/**
 * Generar slug a partir de texto
 * Usado para URLs amigables (ej: "Bad Bunny" -> "bad-bunny")
 *
 * @param {string} text - Texto a convertir
 * @returns {string} slug
 *
 * @example
 */
function generateSlug(text) {
  if (!text) return '';

  return text
    .toLowerCase() // Convertir a minusculas
    .normalize('NFD') // Normalizar caracteres unicode
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^\w\s-]/g, '') // Remover caracteres especiales
    .replace(/[\s_-]+/g, '-') // Reemplazar espacios por guiones
    .replace(/^-+|-+$/g, ''); // Remover guiones al inicio/final
}

/**
 * Formatear fecha en formato legible
 *
 * @param {Date|string} date - Fecha a formatear
 * @param {string} format - Formato deseado ('short', 'long', 'iso')
 * @returns {string} fecha formateada
 *
 * @example
 * formatDate(new Date(), 'short') // => "26/11/2025"
 * formatDate(new Date(), 'long')  // => "26 de noviembre de 2025"
 */
function formatDate(date, format = 'short') {
  if (!date) return '';

  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return '';
  }

  switch (format) {
    case 'short':
      return d.toLocaleDateString('es-ES');

    case 'long':
      return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

    case 'iso':
      return d.toISOString();

    case 'time':
      return d.toLocaleTimeString('es-ES');

    case 'datetime':
      return `${d.toLocaleDateString('es-ES')} ${d.toLocaleTimeString('es-ES')}`;

    default:
      return d.toLocaleDateString('es-ES');
  }
}

/**
 * Calcular paginacion
 *
 * @param {number} page - Pagina actual (1-indexed)
 * @param {number} limit - Elementos por pagina
 * @param {number} total - Total de elementos
 * @returns {Object} { offset, limit, pages, hasNext, hasPrev }
 *
 * @example
 * paginate(2, 20, 150) // => { offset: 20, limit: 20, pages: 8, hasNext: true, hasPrev: true }
 */
function paginate(page = 1, limit = 20, total = 0) {
  const currentPage = parseInt(page) || 1;
  const itemsPerPage = parseInt(limit) || 20;
  const totalItems = parseInt(total) || 0;

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const offset = (currentPage - 1) * itemsPerPage;

  return {
    offset,
    limit: itemsPerPage,
    page: currentPage,
    pages: totalPages,
    total: totalItems,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
}

/**
 * Sanitizar HTML para prevenir XSS
 * Version basica - considera usar libreria como 'sanitize-html' para casos complejos
 *
 * @param {string} html - HTML a sanitizar
 * @returns {string} HTML sanitizado
 */
function sanitizeHtml(html) {
  if (!html) return '';

  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Calcular puntuacion de reputacion
 *
 * @param {number} upvotes - Votos positivos
 * @param {number} downvotes - Votos negativos
 * @returns {number} score
 *
 * @example
 * calculateScore(10, 2) // => 8
 * calculateScore(5, 5)  // => 0
 */
function calculateScore(upvotes = 0, downvotes = 0) {
  return parseInt(upvotes) - parseInt(downvotes);
}

/**
 * Truncar texto a longitud maxima
 *
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud m�xima
 * @param {string} suffix - Sufijo a agregar (default: '...')
 * @returns {string} texto truncado
 *
 * @example
 * truncate("Esta es una cancion muy larga", 15) // => "Esta es una..."
 */
function truncate(text, maxLength = 100, suffix = '...') {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Validar email basico
 *
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validar URL
 *
 * @param {string} url
 * @returns {boolean}
 */
function isValidUrl(url) {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Delay async (util para rate limiting, retries, etc.)
 *
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise}
 *
 * @example
 * await delay(1000); // Esperar 1 segundo
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generar numero aleatorio en rango
 *
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Capitalizar primera letra
 *
 * @param {string} text
 * @returns {string}
 *
 * @example
 * capitalize("hello world") // => "Hello world"
 */
function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Validar que un valor esta en un array de valores permitidos
 *
 * @param {*} value - Valor a validar
 * @param {Array} allowedValues - Valores permitidos
 * @returns {boolean}
 *
 * @example
 * isIn('admin', ['user', 'admin', 'moderator']) // => true
 */
function isIn(value, allowedValues = []) {
  return allowedValues.includes(value);
}

/**
 * Remover campos nulos/undefined de un objeto
 *
 * @param {Object} obj
 * @returns {Object}
 *
 * @example
 * removeNulls({ a: 1, b: null, c: undefined, d: 0 }) // => { a: 1, d: 0 }
 */
function removeNulls(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  const cleaned = {};
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}

// Exportar todas las funciones
module.exports = {
  generateSlug,
  formatDate,
  paginate,
  sanitizeHtml,
  calculateScore,
  truncate,
  isValidEmail,
  isValidUrl,
  delay,
  randomInt,
  capitalize,
  isIn,
  removeNulls
};
