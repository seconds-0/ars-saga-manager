import React from 'react';
import { Link } from 'react-router-dom';

function ResetConfirmation() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Password Reset Requested
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          If an account exists for the email you entered, you will receive password reset instructions shortly.
        </p>
        <div className="mt-6 text-center">
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetConfirmation;