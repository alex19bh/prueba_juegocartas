import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import Footer from '../components/layout/Footer';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to homepage if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);
  
  const handleSuccess = () => {
    navigate('/');
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-green-50">
      {/* Logo section */}
      <div className="bg-green-800 py-6 text-center">
        <div className="inline-flex items-center">
          <span className="text-3xl font-bold text-yellow-400">VIRUS!</span>
          <span className="ml-2 text-sm bg-yellow-400 text-green-800 px-2 py-1 rounded">
            Online
          </span>
        </div>
      </div>
      
      <main className="flex-grow flex items-center justify-center py-12">
        <div className="max-w-md w-full px-4">
          {/* Auth card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Tabs */}
            <div className="flex">
              <button
                className={`w-1/2 py-4 font-medium text-lg transition-colors ${
                  activeTab === 'login'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('login')}
              >
                Iniciar Sesión
              </button>
              <button
                className={`w-1/2 py-4 font-medium text-lg transition-colors ${
                  activeTab === 'register'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('register')}
              >
                Registrarse
              </button>
            </div>
            
            {/* Forms */}
            <div className="p-6">
              {activeTab === 'login' ? (
                <LoginForm onSuccess={handleSuccess} />
              ) : (
                <RegisterForm onSuccess={handleSuccess} />
              )}
            </div>
          </div>
          
          {/* Info text */}
          <div className="mt-6 text-center text-gray-600 text-sm">
            <p>
              Para probar el juego, puedes registrarte con cualquier correo electrónico y contraseña.
              <br />
              Este es un proyecto de demostración, sin conexión a un servidor real.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AuthPage;