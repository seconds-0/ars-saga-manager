import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SideBar from './SideBar';
import Toast from './Toast';

function Layout() {
  const location = useLocation();
  const activePage = location.pathname.split('/')[1] || 'home';
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideBar activePage={activePage} />
      <div className="flex-grow flex flex-col">
        <main className="flex-grow p-8">
          <Outlet context={{ showToast }} />
        </main>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        )}
      </div>
    </div>
  );
}

export default Layout;