import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import CreateCharacterPage from './components/CreateCharacterPage';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import ResetConfirmation from './components/ResetConfirmation';
import ResetPasswordForm from './components/ResetPasswordForm';
import CharacterListPage from './components/CharacterListPage';
import CharacterSheet from './components/CharacterSheet';
import { useAuth } from './useAuth';

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordForm />} />
      <Route path="/reset-confirmation" element={<ResetConfirmation />} />
      <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
      <Route element={<Layout />}>
        <Route path="/" element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/home" element={isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />} />
        <Route path="/create-character" element={isAuthenticated ? <CreateCharacterPage /> : <Navigate to="/login" />} />
        <Route path="/character/:id" element={isAuthenticated ? <CharacterSheet /> : <Navigate to="/login" />} />
        <Route path="/characters" element={isAuthenticated ? <CharacterListPage /> : <Navigate to="/login" />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;