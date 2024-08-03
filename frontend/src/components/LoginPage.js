import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RegisterForm from './RegisterForm';
import api from '../api/axios';
import { useAuth } from '../useAuth';
import { Card, TextInput, Button, Alert, Label } from 'flowbite-react';
import useForm from '../hooks/useForm';

function LoginPage() {
  const { values, handleChange, handleSubmit } = useForm({ email: '', password: '' });
  const [showRegister, setShowRegister] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('Login successful', response.data);
      localStorage.setItem('token', response.data.token);
      login(response.data.token);
      navigate('/home');
    } catch (error) {
      console.error('Login failed', error);
      setErrorMessage('Login failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const onSubmit = () => handleLogin(values.email, values.password);

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 bg-parchment bg-cover bg-center">
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
              <RegisterForm onRegisterSuccess={() => setShowRegister(false)} />
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                <Button type="submit">
                  Sign in
                </Button>
                <div className="text-center">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary-600 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </form>
            )}
            {errorMessage && (
              <Alert color="failure" onDismiss={() => setErrorMessage('')} className="mt-4">
                {errorMessage}
              </Alert>
            )}
            <div className="mt-6">
              <Button 
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

export default LoginPage;