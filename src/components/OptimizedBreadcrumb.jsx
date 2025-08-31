import { Link } from 'react-router-dom';
import { ChevronRight, Home, AlertCircle } from 'lucide-react';
import { useBreadcrumbs } from '../hooks/useBreadcrumbs';

export default function OptimizedBreadcrumb() {
  const { breadcrumbs, loading, error, isHomePage } = useBreadcrumbs();

  // En la página de inicio, mostrar breadcrumb simple para consistencia
  if (isHomePage) {
    return (
      <nav 
        className="flex items-center gap-2 text-sm" 
        aria-label="Breadcrumb"
        role="navigation"
      >
        <div className="flex items-center gap-2">
          <span 
            className="text-indigo-950 font-semibold flex items-center gap-1"
            aria-current="page"
          >
            <Home className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            Inicio
          </span>
        </div>
      </nav>
    );
  }

  // Estado de carga
  if (loading) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="w-4 h-4 bg-gray-200 rounded"></div>
        <div className="w-3 h-3 bg-gray-200 rounded"></div>
        <div className="w-16 h-4 bg-gray-200 rounded"></div>
        <div className="w-3 h-3 bg-gray-200 rounded"></div>
        <div className="w-20 h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <AlertCircle className="w-4 h-4" />
        <span>Error cargando navegación</span>
      </div>
    );
  }

  // No mostrar si no hay breadcrumbs
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav 
      className="flex items-center gap-2 text-sm" 
      aria-label="Breadcrumb"
      role="navigation"
    >
      {breadcrumbs.map((crumb, index) => (
        <div key={`${crumb.path}-${index}`} className="flex items-center gap-2">
          {index > 0 && (
            <ChevronRight 
              className="w-4 h-4 text-gray-400 flex-shrink-0" 
              aria-hidden="true"
            />
          )}
          
          {crumb.isActive ? (
            <span 
              className="text-indigo-950 font-semibold truncate max-w-[200px]"
              title={crumb.name}
              aria-current="page"
            >
              {crumb.name}
            </span>
          ) : (
            <Link
              to={crumb.path}
              className="text-gray-600 hover:text-indigo-950 transition-colors duration-200 
                         flex items-center gap-1 hover:underline focus:outline-none 
                         focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 rounded
                         truncate max-w-[200px] px-1 py-0.5"
              title={crumb.name}
              aria-label={`Ir a ${crumb.name}`}
            >
              {crumb.icon === 'home' && (
                <Home className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              )}
              <span className="truncate">{crumb.name}</span>
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
} 