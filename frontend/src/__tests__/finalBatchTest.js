/**
 * Minimal test for batch requests functionality
 */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import useBatchRequests from '../hooks/useBatchRequests';

// Mock the api module
jest.mock('../api/axios', () => ({
  post: jest.fn(() => Promise.resolve({
    data: {
      status: 'success',
      results: [{ success: true }]
    }
  })),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
}));

// Simple test component
function TestComponent() {
  const batch = useBatchRequests();
  
  const addToQueue = () => {
    batch.addOperation({
      endpoint: 'test-endpoint',
      resourceId: '123',
      action: 'increment',
      data: null
    });
  };
  
  return (
    <div>
      <div data-testid="queue-length">{batch.queueLength}</div>
      <div data-testid="pending-count">{batch.pendingOperationsCount}</div>
      <button data-testid="add-op-btn" onClick={addToQueue}>Add Operation</button>
    </div>
  );
}

describe('Batch Requests Component Test', () => {
  test('renders with empty queue', () => {
    render(<TestComponent />);
    expect(screen.getByTestId('queue-length').textContent).toBe('0');
    expect(screen.getByTestId('pending-count').textContent).toBe('0');
  });
  
  test('adds operation to queue when button clicked', () => {
    render(<TestComponent />);
    
    act(() => {
      screen.getByTestId('add-op-btn').click();
    });
    
    expect(screen.getByTestId('queue-length').textContent).toBe('1');
    expect(screen.getByTestId('pending-count').textContent).toBe('1');
  });
});