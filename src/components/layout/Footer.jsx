import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-green-900 text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">
              © {new Date().getFullYear()} Virus! Online - Una adaptación del juego "Virus!" de Tranjis Games
            </p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-white hover:text-yellow-400 transition-colors text-sm">
              Reglas
            </a>
            <a href="#" className="text-white hover:text-yellow-400 transition-colors text-sm">
              Privacidad
            </a>
            <a href="#" className="text-white hover:text-yellow-400 transition-colors text-sm">
              Contacto
            </a>
          </div>
        </div>
        <div className="mt-4 text-xs text-center text-green-300">
          Este juego es una adaptación con fines educativos. Todos los derechos del juego original pertenecen a Tranjis Games.
        </div>
      </div>
    </footer>
  );
};

export default Footer;