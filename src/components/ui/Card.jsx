import React from 'react';

const Card = ({ 
  id,
  type,
  color,
  name,
  imageUrl,
  onClick,
  disabled = false,
  selected = false,
  className = ''
}) => {
  // Card appearance styles
  const baseClasses = 'relative transition-transform duration-200 rounded-lg overflow-hidden';
  const interactiveClasses = !disabled ? 'cursor-pointer hover:scale-105' : 'opacity-70';
  const selectedClasses = selected ? 'ring-4 ring-yellow-400 scale-105' : '';
  
  // Handle click events
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick({ id, type, color, name, imageUrl });
    }
  };

  return (
    <div 
      className={`${baseClasses} ${interactiveClasses} ${selectedClasses} ${className}`}
      onClick={handleClick}
      data-card-id={id}
      data-card-type={type}
      data-card-color={color || 'none'}
    >
      {/* Card image */}
      <div className="aspect-[2/3] w-full bg-white rounded-lg shadow-md overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">Sin imagen</span>
          </div>
        )}
      </div>

      {/* Card name (optional, only visible in certain views) */}
      {name && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs py-1 px-2 truncate">
          {name}
        </div>
      )}
    </div>
  );
};

export default Card;