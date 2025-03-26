import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaHome, FaUser, FaMagic, FaBook, FaScroll, FaUsers, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { useAuth } from '../useAuth';
import PropTypes from 'prop-types';

// Navigation items configuration
const NAV_ITEMS = [
  { name: 'Dashboard', icon: FaHome, enabled: true, path: '/' },
  { name: 'Characters', icon: FaUser, enabled: true, path: '/characters' },
  { name: 'Spells', icon: FaMagic, enabled: false, path: '/spells' },
  { name: 'Books', icon: FaBook, enabled: false, path: '/books' },
  { name: 'Sagas', icon: FaScroll, enabled: false, path: '/sagas' },
  { name: 'Community', icon: FaUsers, enabled: false, path: '/community' },
];

// For users without avatars, show a profile icon with their initials
const UserAvatar = React.memo(({ user }) => {
  if (user?.avatar) {
    return <img src={user.avatar} alt="User avatar" className="w-10 h-10 rounded-full border-2 border-gray-700" />;
  }
  
  // Generate initials from name
  const getInitials = () => {
    if (!user?.name) return '?';
    return user.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold">
      {getInitials()}
    </div>
  );
});

UserAvatar.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.string
  })
};

function SideBar({ activePage }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Memoize the handler to prevent recreating it on every render
  const handleLogout = useMemo(() => () => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  // Format the username for display
  const displayName = useMemo(() => {
    if (!user?.name) return 'User';
    // Capitalize first letter of each word
    return user.name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }, [user]);

  return (
    <div className="w-64 bg-gray-900 flex flex-col h-screen sticky top-0">
      {/* Logo Area */}
      <div className="p-5 text-white font-bold text-xl text-center border-b border-gray-800">
        <Link to="/" className="flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity">
          <img src="/emblem.png" alt="Ars Saga Manager" className="w-8 h-8" />
          <span>Ars Saga Manager</span>
        </Link>
      </div>
      
      {/* User profile section */}
      <div className="p-4 flex items-center space-x-3 border-b border-gray-800">
        <UserAvatar user={user} />
        <div className="flex flex-col">
          <span className="text-white font-medium">{displayName}</span>
          <span className="text-gray-400 text-sm">{user?.email || 'No email'}</span>
        </div>
      </div>
      
      {/* Main navigation */}
      <nav className="flex-grow flex flex-col justify-between text-gray-300 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 py-4">
        <ul className="space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            // Determine if this item is active
            const isActive = activePage === (item.path === '/' ? 'home' : item.path.substring(1));
            
            return (
              <li key={item.name}>
                <Link
                  to={item.enabled ? item.path : '#'}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 flex items-center group
                    ${isActive && item.enabled
                      ? 'bg-blue-600 text-white shadow-md' 
                      : item.enabled
                      ? 'hover:bg-gray-800'
                      : 'opacity-50 cursor-not-allowed'}`}
                  onClick={(e) => !item.enabled && e.preventDefault()}
                  aria-disabled={!item.enabled}
                >
                  <item.icon className={`mr-3 text-lg ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                  <span>{item.name}</span>
                  {!item.enabled && <span className="ml-2 text-xs bg-gray-800 px-1.5 py-0.5 rounded">Soon</span>}
                </Link>
              </li>
            );
          })}
        </ul>
        
        {/* Bottom navigation section */}
        <div className="px-3 mt-auto">
          <Link
            to="/settings"
            className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center text-gray-400 hover:bg-gray-800 hover:text-white mb-2"
          >
            <FaCog className="mr-3 text-lg" />
            Settings
          </Link>
          
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <FaSignOutAlt className="mr-3 text-lg" />
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
}

SideBar.propTypes = {
  activePage: PropTypes.string.isRequired
};

export default React.memo(SideBar);