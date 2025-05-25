import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import RoomDebugger from '../components/debug/RoomDebugger';

const HomePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-green-50 py-12">
        <div className="container mx-auto px-4">
          {/* Hero section */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-12">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
                ¡Juega a VIRUS! Online
              </h1>
              <p className="text-lg text-gray-700 mb-8">
                Construye tu cuerpo, ataca a tus amigos con virus, defiéndete con medicinas, 
                y sé el primero en completar tu cuerpo con 4 órganos sanos.
              </p>
              <div className="flex space-x-4">
                <Link to="/lobby">
                  <Button size="lg">
                    ¡Jugar Ahora!
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-64 h-64">
                {/* Card images in a fan arrangement */}
                <img 
                  src="/assets/images/cards/organ-blue.png" 
                  alt="Carta de órgano azul" 
                  className="absolute w-48 h-64 object-contain transform -rotate-15 shadow-lg rounded-lg"
                />
                <img 
                  src="/assets/images/cards/virus-red.png" 
                  alt="Carta de virus rojo" 
                  className="absolute w-48 h-64 object-contain transform rotate-15 translate-x-8 shadow-lg rounded-lg"
                />
                <img 
                  src="/assets/images/cards/medicine-green.png" 
                  alt="Carta de medicina verde" 
                  className="absolute w-48 h-64 object-contain transform -rotate-5 translate-y-4 shadow-lg rounded-lg"
                />
              </div>
            </div>
          </div>
          
          {/* Game stats section */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-12">
            <h2 className="text-2xl font-bold text-green-800 mb-4">Tu Progreso</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {currentUser.stats?.gamesPlayed || 0}
                </div>
                <div className="text-gray-600">Partidas jugadas</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {currentUser.stats?.gamesWon || 0}
                </div>
                <div className="text-gray-600">Victorias</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {currentUser.stats?.winRate || 0}%
                </div>
                <div className="text-gray-600">Porcentaje de victorias</div>
              </div>
            </div>
          </div>
          
          {/* How to play section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-green-800 mb-4">¿Cómo jugar?</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-green-100 rounded-full p-2 mr-4">
                  <span className="text-green-800 text-xl font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Construye tu cuerpo</h3>
                  <p className="text-gray-600">Juega cartas de órgano en tu turno para construir tu cuerpo. Necesitas 4 órganos sanos para ganar.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-green-100 rounded-full p-2 mr-4">
                  <span className="text-green-800 text-xl font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Ataca a tus rivales</h3>
                  <p className="text-gray-600">Usa cartas de virus para infectar y destruir los órganos de tus rivales. Solo puedes infectar órganos del mismo color.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-green-100 rounded-full p-2 mr-4">
                  <span className="text-green-800 text-xl font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Defiéndete con medicinas</h3>
                  <p className="text-gray-600">Usa cartas de medicina para curar tus órganos infectados o para proteger tus órganos sanos.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-green-100 rounded-full p-2 mr-4">
                  <span className="text-green-800 text-xl font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Usa tratamientos especiales</h3>
                  <p className="text-gray-600">Juega cartas de tratamiento para realizar acciones especiales como robar órganos, intercambiar cartas, y más.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Debug section - for development only */}
          <div className="mt-12">
            <details>
              <summary className="text-lg font-bold text-gray-600 cursor-pointer mb-2">Debug Information</summary>
              <RoomDebugger />
            </details>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;