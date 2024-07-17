import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../useAuth';
import { useNavigate } from 'react-router-dom';

function Header() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-deep-red shadow">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link to="/" className="text-3xl font-bold text-white font-cinzel hover:text-gray-200">
          Ars Saga Manager
        </Link>
        <button
          onClick={handleLogout}
          className="bg-white text-deep-red px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-red"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;