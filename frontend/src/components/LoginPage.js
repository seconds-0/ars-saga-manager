import React, { useState } from 'react';
// Not using navigate since login function now handles redirection
// import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../useAuth';
import { Card, TextInput, Button, Alert, Label } from 'flowbite-react';
import useForm from '../hooks/useForm';
import RegisterForm from './RegisterForm';

export default function LoginPage() {
  const { values, handleChange, handleSubmit } = useForm({ email: '', password: '' });
  const [showRegister, setShowRegister] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  // navigate is not being used since login function handles redirection
  // const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (email, password) => {
    try {
      console.log('🔄 Starting login process...');
      const response = await api.post('/auth/login', { email, password });
      console.log('✅ Login API call successful', response.data);
      
      // Token is now stored in a HttpOnly cookie by the server
      
      // Complete login (login function now handles redirection)
      console.log('🔐 Completing login process...');
      login(response.data.userId);
      // No need to navigate - login function now does this
    } catch (error) {
      console.error('❌ Login failed:', error);
      console.error('📝 Error details:', error.response?.data);
      setErrorMessage('Login failed: ' + (error.response?.data?.message || error.message || 'Unknown error'));
    }
  };

  const onSubmit = () => handleLogin(values.email, values.password);

  const handleRegisterSuccess = () => {
    setShowRegister(false);
    setErrorMessage('Registration successful! Please sign in.');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 bg-parchment bg-cover bg-center" data-testid="login-page">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h1 className="text-center text-5xl font-bold text-primary-700 font-cinzel mb-6">
            Ars Saga Manager
          </h1>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 font-palatino">
            {showRegister ? 'Create an account' : 'Sign in to your account'}
          </h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            {showRegister ? (
              <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
            ) : (
              <>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" data-testid="login-form">
                  <div>
                    <Label htmlFor="email">Email address</Label>
                    <TextInput
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@company.com"
                      required={true}
                      value={values.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <TextInput
                      id="password"
                      name="password"
                      type="password"
                      required={true}
                      value={values.password}
                      onChange={handleChange}
                    />
                  </div>
                  <Button type="submit" data-testid="sign-in-button" className="bg-red-800 hover:bg-red-700 text-white">
                    Sign in
                  </Button>
                </form>
                {errorMessage && (
                  <Alert color="failure" onDismiss={() => setErrorMessage('')} className="mt-4">
                    {errorMessage}
                  </Alert>
                )}
              </>
            )}
            <div className="mt-6">
              <Button
                data-testid="register-button"
                color="light"
                onClick={() => setShowRegister(!showRegister)}
                fullSized={true}
              >
                {showRegister ? 'Already have an account? Sign in' : 'Need an account? Register'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}