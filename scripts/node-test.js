/**
 * Ultra minimal test that doesn't use any frameworks or dependencies
 */

// Basic test function
function test(name, fn) {
  console.log(`Running test: ${name}`);
  const start = Date.now();
  try {
    fn();
    const duration = Date.now() - start;
    console.log(`✅ PASS: ${name} (${duration}ms)`);
    return true;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`❌ FAIL: ${name} (${duration}ms)`);
    console.error(error);
    return false;
  }
}

// Simple assertion functions
function assertEquals(actual, expected) {
  if (actual !== expected) {
    throw new Error(`Expected ${expected} but got ${actual}`);
  }
}

function assertTrue(value) {
  if (!value) {
    throw new Error(`Expected true but got ${value}`);
  }
}

// Run some simple tests
console.log("=== Running pure Node.js tests ===");
const startTime = Date.now();

test("addition", () => {
  assertEquals(1 + 1, 2);
});

test("string concatenation", () => {
  assertEquals("hello " + "world", "hello world");
});

test("boolean logic", () => {
  assertTrue(true && true);
  assertTrue(!(false && true));
});

const duration = (Date.now() - startTime) / 1000;
console.log(`\nAll tests completed in ${duration.toFixed(2)} seconds`);