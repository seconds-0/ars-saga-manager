import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaHome, FaUser, FaMagic, FaBook, FaScroll, FaUsers, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../useAuth';

const navItems = [
  { name: 'Dashboard', icon: FaHome, enabled: true, path: '/' },
  { name: 'Characters', icon: FaUser, enabled: true, path: '/characters' },
  { name: 'Spells', icon: FaMagic, enabled: false, path: '/spells' },
  { name: 'Books', icon: FaBook, enabled: false, path: '/books' },
  { name: 'Sagas', icon: FaScroll, enabled: false, path: '/sagas' },
  { name: 'Community', icon: FaUsers, enabled: false, path: '/community' },
];

function SideBar({ activePage }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-gray-900 flex flex-col h-screen">
      <div className="p-4 text-white font-bold text-xl text-center">
        Ars Saga Manager
      </div>
      {user && (
        <div className="p-4 flex items-center space-x-3">
          {user.avatar && (
            <img src={user.avatar} alt="User avatar" className="w-8 h-8 rounded-full" />
          )}
          <span className="text-white font-medium">{user.name || 'User'}</span>
        </div>
      )}
      <nav className="flex-grow flex flex-col justify-between text-gray-300 mt-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.enabled ? item.path : '#'}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out flex items-center
                  ${activePage === item.name.toLowerCase() && item.enabled
                    ? 'bg-blue-500 text-white' 
                    : item.enabled
                    ? 'hover:bg-gray-800'
                    : 'opacity-50 cursor-not-allowed'}`}
                onClick={(e) => !item.enabled && e.preventDefault()}
              >
                <item.icon className="mr-3 text-lg" />
                {item.name}
                {!item.enabled && <span className="ml-2 text-xs">(Soon)</span>}
              </Link>
            </li>
          ))}
        </ul>
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out flex items-center hover:bg-gray-800"
          >
            <FaSignOutAlt className="mr-3 text-lg" />
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
}

export default SideBar;