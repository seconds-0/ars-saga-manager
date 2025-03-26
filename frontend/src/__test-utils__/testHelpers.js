import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Waits for loading spinner to finish
 * @param {Object} options - Options
 * @param {number} options.timeout - Timeout in ms
 * @returns {Promise} Promise that resolves when loading spinner is gone
 */
export async function waitForLoadingToFinish({ timeout = 4000 } = {}) {
  try {
    // First check if loading spinner exists
    const spinner = screen.queryByTestId('loading-spinner');
    if (!spinner) return Promise.resolve();
    
    // If it exists, wait for it to be removed
    return waitForElementToBeRemoved(() => screen.queryByTestId('loading-spinner'), {
      timeout,
    });
  } catch (error) {
    // If timeout or other error occurs, log and continue
    console.error('Error waiting for loading spinner:', error);
    return Promise.resolve();
  }
}

/**
 * Submits a form with the given test ID
 * @param {string} formTestId - Form's test ID
 * @returns {Promise} Promise that resolves after form submission
 */
export async function submitForm(formTestId) {
  const form = screen.getByTestId(formTestId);
  const submitButton = form.querySelector('button[type="submit"]') || 
                       form.querySelector('input[type="submit"]');
  
  if (submitButton) {
    userEvent.click(submitButton);
  } else {
    // If no submit button, use form submit
    fireEvent.submit(form);
  }
  
  // Return a resolved promise for async usage
  return Promise.resolve();
}

/**
 * Fills an input field with the given value
 * @param {string} labelText - The label text to find the input
 * @param {string} value - The value to input
 */
export function fillInputByLabel(labelText, value) {
  const label = screen.getByText(labelText);
  const input = label.querySelector('input') || 
                label.nextElementSibling?.querySelector('input') ||
                document.getElementById(label.htmlFor);
  
  if (input) {
    userEvent.clear(input);
    userEvent.type(input, value);
  } else {
    throw new Error(`Could not find input for label: ${labelText}`);
  }
}

/**
 * Creates a promise that resolves after the specified time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after the specified time
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validates that all expected axios calls were made
 * @param {Object} mockAxios - Mocked axios instance
 * @param {Array} expectedCalls - Expected axios calls
 * @example
 * validateAxiosCalls(mockAxios, [
 *   { method: 'get', url: '/api/users' },
 *   { method: 'post', url: '/api/users', data: { name: 'Test' } }
 * ]);
 */
export function validateAxiosCalls(mockAxios, expectedCalls) {
  expectedCalls.forEach((expected, index) => {
    expect(mockAxios[expected.method]).toHaveBeenCalledTimes(
      expectedCalls.filter(call => call.method === expected.method).length
    );
    
    const calls = mockAxios[expected.method].mock.calls;
    const callIndex = calls.findIndex(call => call[0] === expected.url);
    
    expect(callIndex).not.toBe(-1);
    
    if (expected.data) {
      expect(calls[callIndex][1]).toMatchObject(expected.data);
    }
  });
}