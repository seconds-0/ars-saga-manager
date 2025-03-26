/**
 * Test file for the simple test runner
 */

// Basic tests
test('addition works', () => {
  expect(1 + 1).toBe(2);
});

test('string concatenation works', () => {
  expect('hello' + ' world').toBe('hello world');
});

// Organized test groups
describe('Array methods', () => {
  test('map works', () => {
    const arr = [1, 2, 3];
    const result = arr.map(x => x * 2);
    expect(result).toEqual([2, 4, 6]);
  });
  
  test('filter works', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = arr.filter(x => x % 2 === 0);
    expect(result).toEqual([2, 4]);
  });
});

// Performance test
test('performance test', () => {
  const start = Date.now();
  
  // Do something CPU-intensive
  let sum = 0;
  for (let i = 0; i < 1000000; i++) {
    sum += i;
  }
  
  const end = Date.now();
  console.log(`Performance test took ${end - start}ms`);
  
  expect(sum).toBeGreaterThan(0);
});