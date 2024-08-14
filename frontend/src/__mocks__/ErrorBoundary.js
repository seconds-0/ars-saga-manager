import React from 'react';

const MockErrorBoundary = ({ children, fallback }) => {
  return (
    <div data-testid="mock-error-boundary">
      {children}
    </div>
  );
};

export default MockErrorBoundary;