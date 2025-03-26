/**
 * Utility functions for transforming object keys between camelCase and snake_case
 */

/**
 * Transforms snake_case keys to camelCase
 * @param {Object} obj - Object with snake_case keys
 * @returns {Object} Object with camelCase keys
 */
function camelizeKeys(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(camelizeKeys);
  }

  return Object.keys(obj).reduce((result, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = camelizeKeys(obj[key]);
    return result;
  }, {});
}

/**
 * Transforms camelCase keys to snake_case
 * @param {Object} obj - Object with camelCase keys
 * @returns {Object} Object with snake_case keys
 */
function snakeizeKeys(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(snakeizeKeys);
  }

  return Object.keys(obj).reduce((result, key) => {
    const snakeKey = key.replace(/([A-Z])/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = snakeizeKeys(obj[key]);
    return result;
  }, {});
}

module.exports = {
  camelizeKeys,
  snakeizeKeys
};