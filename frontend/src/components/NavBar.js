import React from 'react';
import { FaHome, FaUser, FaMagic, FaBook, FaScroll, FaUsers } from 'react-icons/fa';

const navItems = [
  { name: 'Home', icon: FaHome },
  { name: 'Characters', icon: FaUser },
  { name: 'Spells', icon: FaMagic },
  { name: 'Books', icon: FaBook },
  { name: 'Sagas', icon: FaScroll },
  { name: 'Community', icon: FaUsers },
];

function NavBar({ activePage, setActivePage }) {
  return (
    <nav className="w-64 bg-gray-100 text-gray-800 p-4 shadow-lg">
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.name}>
            <button
              onClick={() => setActivePage(item.name.toLowerCase())}
              className={`w-full text-left px-4 py-3 rounded-lg text-lg font-medium transition-all duration-200 ease-in-out flex items-center
                ${activePage === item.name.toLowerCase() 
                  ? 'bg-white text-deep-red shadow-md' 
                  : 'hover:bg-gray-200'}`}
            >
              <item.icon className="mr-3 text-xl" />
              {item.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default NavBar;