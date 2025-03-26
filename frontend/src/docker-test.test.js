/**
 * Simple test file to validate Docker test environment
 */

test('basic test', () => {
  expect(1 + 1).toBe(2);
});

test('string operations', () => {
  expect('hello' + ' world').toBe('hello world');
});

// Add a timer to measure actual test execution time (vs environment setup time)
test('performance test', () => {
  const start = Date.now();
  
  // Do something trivial but measurable
  let sum = 0;
  for (let i = 0; i < 1000000; i++) {
    sum += i;
  }
  
  const end = Date.now();
  console.log(`Performance test took ${end - start}ms`);
  
  expect(sum).toBeGreaterThan(0);
});