import { useLocation, Link } from 'react-router-dom';

const routeNames = {
    '/': 'Inicio',
    '/wbevent': 'Eventos',
    '/withdrawals': 'Mis retiros',
    '/withdrawals-admin': 'Gestión de retiros',
    '/tradingCalculator': '',
    '/broker': 'Broker',
    '/courses': 'Cursos',
    '/commissions': 'Comisiones',
    '/support': 'Soporte',
    '/profile': 'Mi Perfil',
};

const getBreadcrumbName = (pathname) => {
    // Exact match
    if (routeNames[pathname]) {
        return routeNames[pathname];
    }
    if (pathname.startsWith('/course/')) {
        return 'Detalle del curso';
    }
    // Fallback for unmatched routes
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
        const lastSegment = segments[segments.length - 1];
        return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
    }

    return 'Inicio';
};


export default function Breadcrumb() {
    const location = useLocation();
    const breadcrumbName = getBreadcrumbName(location.pathname);

    // Don't show breadcrumb on the root Home page
    if (location.pathname === '/') {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-zinc-800 text-sm font-semibold">
                {breadcrumbName}
            </span>
        </div>
    );
} 