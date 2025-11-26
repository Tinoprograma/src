/**
 * HELPERS TESTS
 * Pruebas unitarias para funciones auxiliares
 */

const {
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
} = require('../helpers');

describe('Helpers Utilities', () => {
  describe('generateSlug', () => {
    test('should convert text to lowercase slug', () => {
      expect(generateSlug('Bad Bunny')).toBe('bad-bunny');
      expect(generateSlug('La Bachata')).toBe('la-bachata');
    });

    test('should remove accents and special characters', () => {
      expect(generateSlug('Niño con ñ')).toBe('nino-con-n');
      expect(generateSlug('Café Tacvba')).toBe('cafe-tacvba');
      expect(generateSlug('Zoé')).toBe('zoe');
    });

    test('should replace spaces with hyphens', () => {
      expect(generateSlug('Multiple   spaces')).toBe('multiple-spaces');
      expect(generateSlug('Tab\tcharacters')).toBe('tab-characters');
    });

    test('should remove special characters', () => {
      expect(generateSlug('Hello@World!')).toBe('helloworld');
      expect(generateSlug('Test & Example')).toBe('test-example');
    });

    test('should handle empty or null input', () => {
      expect(generateSlug('')).toBe('');
      expect(generateSlug(null)).toBe('');
      expect(generateSlug(undefined)).toBe('');
    });

    test('should remove leading and trailing hyphens', () => {
      expect(generateSlug('  -Leading and trailing-  ')).toBe('leading-and-trailing');
    });
  });

  describe('formatDate', () => {
    const testDate = new Date('2025-11-26T10:30:00Z');

    test('should format date in short format (default)', () => {
      const result = formatDate(testDate, 'short');
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    test('should format date in long format', () => {
      const result = formatDate(testDate, 'long');
      expect(result).toContain('noviembre');
      expect(result).toContain('2025');
    });

    test('should format date in ISO format', () => {
      const result = formatDate(testDate, 'iso');
      expect(result).toBe('2025-11-26T10:30:00.000Z');
    });

    test('should format time only', () => {
      const result = formatDate(testDate, 'time');
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    });

    test('should format datetime', () => {
      const result = formatDate(testDate, 'datetime');
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{2}:\d{2}/);
    });

    test('should handle string date input', () => {
      const result = formatDate('2025-11-26', 'short');
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    test('should return empty string for null or invalid dates', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate('')).toBe('');
      expect(formatDate('invalid-date')).toBe('');
    });

    test('should use short format as default', () => {
      const result = formatDate(testDate);
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });
  });

  describe('paginate', () => {
    test('should calculate pagination for first page', () => {
      const result = paginate(1, 20, 150);
      expect(result).toEqual({
        offset: 0,
        limit: 20,
        page: 1,
        pages: 8,
        total: 150,
        hasNext: true,
        hasPrev: false
      });
    });

    test('should calculate pagination for middle page', () => {
      const result = paginate(3, 20, 150);
      expect(result).toEqual({
        offset: 40,
        limit: 20,
        page: 3,
        pages: 8,
        total: 150,
        hasNext: true,
        hasPrev: true
      });
    });

    test('should calculate pagination for last page', () => {
      const result = paginate(8, 20, 150);
      expect(result).toEqual({
        offset: 140,
        limit: 20,
        page: 8,
        pages: 8,
        total: 150,
        hasNext: false,
        hasPrev: true
      });
    });

    test('should use default values', () => {
      const result = paginate();
      expect(result).toEqual({
        offset: 0,
        limit: 20,
        page: 1,
        pages: 0,
        total: 0,
        hasNext: false,
        hasPrev: false
      });
    });

    test('should handle string inputs', () => {
      const result = paginate('2', '10', '50');
      expect(result).toEqual({
        offset: 10,
        limit: 10,
        page: 2,
        pages: 5,
        total: 50,
        hasNext: true,
        hasPrev: true
      });
    });

    test('should handle invalid page numbers', () => {
      const result = paginate(0, 20, 100);
      expect(result.page).toBe(1);
      expect(result.offset).toBe(0);
    });
  });

  describe('sanitizeHtml', () => {
    test('should escape HTML entities', () => {
      expect(sanitizeHtml('<script>alert("XSS")</script>'))
        .toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
    });

    test('should escape ampersands', () => {
      expect(sanitizeHtml('Fish & Chips')).toBe('Fish &amp; Chips');
    });

    test('should escape quotes', () => {
      expect(sanitizeHtml('"Hello" and \'World\'')).toBe('&quot;Hello&quot; and &#x27;World&#x27;');
    });

    test('should escape forward slashes', () => {
      expect(sanitizeHtml('</script>')).toBe('&lt;&#x2F;script&gt;');
    });

    test('should handle empty or null input', () => {
      expect(sanitizeHtml('')).toBe('');
      expect(sanitizeHtml(null)).toBe('');
      expect(sanitizeHtml(undefined)).toBe('');
    });

    test('should handle normal text without changes', () => {
      expect(sanitizeHtml('Normal text')).toBe('Normal text');
    });
  });

  describe('calculateScore', () => {
    test('should calculate positive score', () => {
      expect(calculateScore(10, 2)).toBe(8);
      expect(calculateScore(100, 25)).toBe(75);
    });

    test('should calculate negative score', () => {
      expect(calculateScore(2, 10)).toBe(-8);
      expect(calculateScore(0, 5)).toBe(-5);
    });

    test('should calculate zero score', () => {
      expect(calculateScore(5, 5)).toBe(0);
      expect(calculateScore(0, 0)).toBe(0);
    });

    test('should use default values', () => {
      expect(calculateScore()).toBe(0);
      expect(calculateScore(10)).toBe(10);
    });

    test('should handle string inputs', () => {
      expect(calculateScore('15', '5')).toBe(10);
    });
  });

  describe('truncate', () => {
    test('should truncate long text', () => {
      const longText = 'Esta es una canción muy larga con muchas palabras';
      expect(truncate(longText, 15)).toBe('Esta es una ...');
    });

    test('should not truncate short text', () => {
      const shortText = 'Short';
      expect(truncate(shortText, 10)).toBe('Short');
    });

    test('should use custom suffix', () => {
      const text = 'Long text here';
      expect(truncate(text, 10, '---')).toBe('Long te---');
    });

    test('should use default max length of 100', () => {
      const text = 'a'.repeat(150);
      const result = truncate(text);
      expect(result.length).toBe(100);
      expect(result.endsWith('...')).toBe(true);
    });

    test('should handle empty or null input', () => {
      expect(truncate('')).toBe('');
      expect(truncate(null)).toBe('');
      expect(truncate(undefined)).toBe('');
    });

    test('should handle exact length match', () => {
      const text = 'Exact';
      expect(truncate(text, 5)).toBe('Exact');
    });
  });

  describe('isValidEmail', () => {
    test('should validate correct emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@domain.co')).toBe(true);
      expect(isValidEmail('name+tag@email.com')).toBe(true);
    });

    test('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user @example.com')).toBe(false);
      expect(isValidEmail('user@example')).toBe(false);
    });

    test('should handle empty or null input', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    test('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://domain.com/path')).toBe(true);
      expect(isValidUrl('https://sub.domain.com/path?query=value')).toBe(true);
    });

    test('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
      expect(isValidUrl('//example.com')).toBe(false);
    });

    test('should handle empty or null input', () => {
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl(null)).toBe(false);
      expect(isValidUrl(undefined)).toBe(false);
    });

    test('should validate URLs with ports', () => {
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://example.com:8080/path')).toBe(true);
    });
  });

  describe('delay', () => {
    test('should delay execution', async () => {
      const startTime = Date.now();
      await delay(100);
      const endTime = Date.now();
      const elapsed = endTime - startTime;

      expect(elapsed).toBeGreaterThanOrEqual(100);
      expect(elapsed).toBeLessThan(150); // Allow some margin
    });

    test('should return a promise', () => {
      const result = delay(10);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('randomInt', () => {
    test('should generate number within range', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomInt(1, 10);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(10);
      }
    });

    test('should handle min === max', () => {
      const result = randomInt(5, 5);
      expect(result).toBe(5);
    });

    test('should include both min and max', () => {
      const results = new Set();
      for (let i = 0; i < 1000; i++) {
        results.add(randomInt(1, 3));
      }
      expect(results.has(1)).toBe(true);
      expect(results.has(3)).toBe(true);
    });

    test('should generate integers', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomInt(1, 100);
        expect(Number.isInteger(result)).toBe(true);
      }
    });
  });

  describe('capitalize', () => {
    test('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('world')).toBe('World');
    });

    test('should not change already capitalized text', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });

    test('should only capitalize first letter', () => {
      expect(capitalize('hello world')).toBe('Hello world');
    });

    test('should handle single character', () => {
      expect(capitalize('a')).toBe('A');
    });

    test('should handle empty or null input', () => {
      expect(capitalize('')).toBe('');
      expect(capitalize(null)).toBe('');
      expect(capitalize(undefined)).toBe('');
    });

    test('should handle already uppercase text', () => {
      expect(capitalize('HELLO')).toBe('HELLO');
    });
  });

  describe('isIn', () => {
    test('should return true for values in array', () => {
      expect(isIn('admin', ['user', 'admin', 'moderator'])).toBe(true);
      expect(isIn(1, [1, 2, 3])).toBe(true);
    });

    test('should return false for values not in array', () => {
      expect(isIn('guest', ['user', 'admin', 'moderator'])).toBe(false);
      expect(isIn(4, [1, 2, 3])).toBe(false);
    });

    test('should handle empty array', () => {
      expect(isIn('value', [])).toBe(false);
    });

    test('should use default empty array', () => {
      expect(isIn('value')).toBe(false);
    });

    test('should be type-sensitive', () => {
      expect(isIn('1', [1, 2, 3])).toBe(false);
      expect(isIn(1, ['1', '2', '3'])).toBe(false);
    });
  });

  describe('removeNulls', () => {
    test('should remove null values', () => {
      const input = { a: 1, b: null, c: 3 };
      expect(removeNulls(input)).toEqual({ a: 1, c: 3 });
    });

    test('should remove undefined values', () => {
      const input = { a: 1, b: undefined, c: 3 };
      expect(removeNulls(input)).toEqual({ a: 1, c: 3 });
    });

    test('should keep zero and false values', () => {
      const input = { a: 0, b: false, c: '', d: null };
      expect(removeNulls(input)).toEqual({ a: 0, b: false, c: '' });
    });

    test('should handle empty object', () => {
      expect(removeNulls({})).toEqual({});
    });

    test('should handle null or undefined input', () => {
      expect(removeNulls(null)).toBe(null);
      expect(removeNulls(undefined)).toBe(undefined);
    });

    test('should handle non-object input', () => {
      expect(removeNulls('string')).toBe('string');
      expect(removeNulls(123)).toBe(123);
    });

    test('should create new object without modifying original', () => {
      const original = { a: 1, b: null, c: 3 };
      const result = removeNulls(original);

      expect(result).not.toBe(original);
      expect(original).toEqual({ a: 1, b: null, c: 3 });
    });
  });
});
