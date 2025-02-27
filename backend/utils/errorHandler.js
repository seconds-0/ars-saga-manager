// backend/utils/errorHandler.js

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const handleError = (err, res) => {
  // Log all errors for debugging
  console.error('ERROR DETAILS:', {
    message: err.message,
    stack: err.stack,
    name: err.name
  });
  
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    // Handle Sequelize validation errors
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    // Handle foreign key constraint errors
    res.status(400).json({
      status: 'fail',
      message: 'Database reference error. Invalid foreign key.'
    });
  } else {
    console.error('UNEXPECTED ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong on the server'
    });
  }
};

module.exports = { AppError, handleError };