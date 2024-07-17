import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from './RegisterForm';
import api from '../api/axios';
import { useAuth } from '../useAuth'; 
import Toast from './Toast';
import parchmentBg from '../parchment-bg.jpg';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      console.log('Login successful', response.data);
      
      localStorage.setItem('token', response.data.token);
      
      const { token } = response.data;
      login(token);
      
      navigate('/home');
    } catch (error) {
      console.error('Login failed', error);
      setToastMessage('Login failed: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8" style={{backgroundImage: `url(${parchmentBg})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-5xl font-bold text-deep-red font-cinzel mb-6">
          Ars Saga Manager
        </h1>
        <h2 className="mt-6 text-center text-3xl font-bold text-dark-brown font-palatino">
          {showRegister ? 'Create an account' : 'Sign in to your account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white bg-opacity-90 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {showRegister ? (
            <RegisterForm onRegisterSuccess={() => setShowRegister(false)} />
          ) : (
            <div>
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-dark-brown font-palatino">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-deep-red focus:border-deep-red sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-dark-brown font-palatino">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-deep-red focus:border-deep-red sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-deep-red hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-red"
                  >
                    Sign in
                  </button>
                </div>
              </form>
              <div className="mt-2 text-center">
                <a
                  href="/forgot-password"
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Forgot your password?
                </a>
              </div>
              {toastMessage && (
                <Toast
                  message={toastMessage}
                  onClose={() => setToastMessage('')}
                />
              )}
            </div>
          )}
          <div className="mt-6">
            <button
              onClick={() => setShowRegister(!showRegister)}
              className="w-full text-center text-sm text-indigo-600 hover:text-indigo-500"
            >
              {showRegister ? 'Already have an account? Sign in' : 'Need an account? Register'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;