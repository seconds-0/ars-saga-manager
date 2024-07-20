import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SideBar from './SideBar';

function Layout() {
  const location = useLocation();
  const activePage = location.pathname.slice(1) || 'home';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideBar activePage={activePage} />
      <div className="flex-grow flex flex-col">
        <main className="flex-grow p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;