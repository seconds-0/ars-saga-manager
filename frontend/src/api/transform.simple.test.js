// Simple test file for the transform utilities
const transform = require('./transform');
const { camelizeKeys, snakeizeKeys } = transform;

// Test camelizeKeys
test('camelizeKeys transforms snake_case to camelCase', () => {
  const input = {
    user_id: 1,
    first_name: 'John'
  };
  
  const result = camelizeKeys(input);
  
  expect(result.userId).toBe(1);
  expect(result.firstName).toBe('John');
});

// Test snakeizeKeys
test('snakeizeKeys transforms camelCase to snake_case', () => {
  const input = {
    userId: 1,
    firstName: 'John'
  };
  
  const result = snakeizeKeys(input);
  
  expect(result.user_id).toBe(1);
  expect(result.first_name).toBe('John');
});