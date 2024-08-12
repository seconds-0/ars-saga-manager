import React from 'react';

function HomePage({ 'data-testid': dataTestId }) {
  return (
    <div data-testid={dataTestId}>
      <h1 className="text-3xl font-bold mb-6">Welcome to Ars Saga Manager</h1>
      {/* Add any dashboard content here */}
    </div>
  );
}

export default HomePage;