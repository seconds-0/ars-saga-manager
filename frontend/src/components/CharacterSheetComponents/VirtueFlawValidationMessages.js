import React from 'react';
import PropTypes from 'prop-types';

function VirtueFlawValidationMessages({ validationResult }) {
  if (!validationResult || !validationResult.warnings || validationResult.warnings.length === 0) {
    return null;
  }

  return (
    <div className="mb-4" role="alert">
      {validationResult.warnings.map((warning, index) => (
        <div
          key={index}
          data-testid="validation-message"
          className={`p-3 mb-2 rounded ${
            warning.type === 'error' 
              ? 'bg-red-100 text-red-700 border border-red-200'
              : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
          }`}
        >
          {warning.message}
        </div>
      ))}
    </div>
  );
}

VirtueFlawValidationMessages.propTypes = {
  validationResult: PropTypes.shape({
    isValid: PropTypes.bool.isRequired,
    warnings: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.oneOf(['error', 'warning']).isRequired,
        message: PropTypes.string.isRequired,
      })
    ).isRequired,
  }),
};

export default VirtueFlawValidationMessages; 