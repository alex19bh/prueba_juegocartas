import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/auth');
  };
  
  return (
    <header className="bg-green-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold text-yellow-400">VIRUS!</span>
          <span className="ml-2 text-sm bg-yellow-400 text-green-800 px-2 py-1 rounded">
            Online
          </span>
        </Link>
        
        {currentUser ? (
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center">
              <img 
                src={currentUser.avatarUrl}
                alt={currentUser.username}
                className="w-8 h-8 rounded-full mr-2"
              />
              <span>{currentUser.username}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
            >
              Cerrar Sesión
            </Button>
          </div>
        ) : (
          <Link to="/auth">
            <Button variant="outline" size="sm">
              Iniciar Sesión
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;