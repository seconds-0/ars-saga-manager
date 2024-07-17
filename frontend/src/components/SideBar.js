import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaUser, FaMagic, FaBook, FaScroll, FaUsers, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../useAuth';

const navItems = [
  { name: 'Home', icon: FaHome },
  { name: 'Characters', icon: FaUser },
  { name: 'Spells', icon: FaMagic },
  { name: 'Books', icon: FaBook },
  { name: 'Sagas', icon: FaScroll },
  { name: 'Community', icon: FaUsers },
];

function SideBar({ activePage, setActivePage }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="w-64 bg-deep-red text-white h-screen flex flex-col">
      <ul className="flex-grow space-y-2 p-4">
        {navItems.map((item) => (
          <li key={item.name}>
            <button
              onClick={() => setActivePage(item.name.toLowerCase())}
              className={`w-full text-left px-4 py-3 rounded-lg text-lg font-medium transition-all duration-200 ease-in-out flex items-center
                ${activePage === item.name.toLowerCase() 
                  ? 'bg-red-700 text-white' 
                  : 'hover:bg-red-800'}`}
            >
              <item.icon className="mr-3 text-xl" />
              {item.name}
            </button>
          </li>
        ))}
      </ul>
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-3 rounded-lg text-lg font-medium transition-all duration-200 ease-in-out flex items-center hover:bg-red-800"
        >
          <FaSignOutAlt className="mr-3 text-xl" />
          Logout
        </button>
      </div>
    </nav>
  );
}

export default SideBar;