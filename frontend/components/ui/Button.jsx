export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  type = 'button',
  onClick,
  ...props 
}) {
  // 1. BASE STYLES: 
  // - rounded-xl (más moderno)
  // - transition-all duration-200 ease-in-out (transición más rica)
  // - shadow-md hover:shadow-lg (profundidad sutil)
  // - focus:ring-4 (anillo de enfoque más prominente)
  const baseStyles = 'font-semibold rounded-xl transition-all duration-200 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // 2. VARIANTS: Colores y efectos modernizados
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500/50',
    secondary: 'bg-gray-700 hover:bg-gray-800 text-white focus:ring-gray-600/50',
    // Outline: Se eliminó el shadow del hover para que se vea "hundido"
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 hover:shadow-none focus:ring-primary-500/50',
    // Ghost: Un hover más sutil
    ghost: 'text-gray-700 hover:bg-gray-100/70 focus:ring-gray-300/50 shadow-none hover:shadow-none',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500/50',
  };
  
  // 3. SIZES: Se mantiene el tamaño, pero se usa 'font-semibold' en baseStyles
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base', // Un poco más de padding vertical y horizontal
    lg: 'px-7 py-3.5 text-lg',
  };
  
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}