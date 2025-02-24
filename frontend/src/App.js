import React from 'react';
import { Route, Routes, Navigate, BrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import CreateCharacterPage from './components/CreateCharacterPage';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import ResetConfirmation from './components/ResetConfirmation';
import ResetPasswordForm from './components/ResetPasswordForm';
import CharacterListPage from './components/CharacterListPage';
import CharacterSheet from './components/CharacterSheetComponents/CharacterSheet';
import { useAuth } from './useAuth';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { AuthProvider } from './useAuth';
import { Flowbite } from 'flowbite-react';

const queryClient = new QueryClient();

function AppContent() {
  const { isAuthenticated } = useAuth();
  console.log('Authentication state:', isAuthenticated);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage data-testid="login-page" />} />
      <Route path="/forgot-password" element={<ForgotPasswordForm />} />
      <Route path="/reset-confirmation" element={<ResetConfirmation />} />
      <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
      <Route element={<Layout />}>
        <Route path="/" element={isAuthenticated ? <HomePage data-testid="home-page" /> : <Navigate to="/login" />} />
        <Route path="/home" element={isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />} />
        <Route path="/create-character" element={isAuthenticated ? <CreateCharacterPage /> : <Navigate to="/login" />} />
        <Route path="/character/:id" element={isAuthenticated ? <CharacterSheet /> : <Navigate to="/login" />} />
        <Route path="/characters" element={isAuthenticated ? <CharacterListPage /> : <Navigate to="/login" />} />
      </Route>
    </Routes>
  );
}

function App({ RouterComponent = BrowserRouter }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Flowbite>
        <RouterComponent>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </RouterComponent>
        <ReactQueryDevtools initialIsOpen={false} />
      </Flowbite>
    </QueryClientProvider>
  );
}

export default App;