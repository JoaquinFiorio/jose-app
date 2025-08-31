// components/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import {
    Users,
    CreditCard,
    Calculator,
    Headphones,
    TrendingUp,
    Home,
    GraduationCap,
    ArrowLeftRight,
    Calendar,
    FileText,
    Store,
    LogOut,
    Mail,
    Settings,
    Book,
    HelpCircle,
    DollarSign,
    ChevronDown,
    ChevronRight,
    User,
    CreditCardIcon
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import React from 'react';
import LogoWB from '../assets/logo_wb.svg';

export default function Sidebar({ isOpen = true, drawerMode = false, onNavigate }) {
    const location = useLocation();
    const { user, logOut, loading } = React.useContext(AuthContext);
    const [expandedMenus, setExpandedMenus] = React.useState({});

    // No renderizar el sidebar hasta que el usuario esté completamente cargado
    if (loading || !user) {
        return (
            <div className={`w-64 min-w-[16rem] h-full bg-white grid grid-rows-[auto_1fr] z-20 ${drawerMode ? '' : `${!isOpen ? 'hidden' : ''} hidden sm:grid`}`}>
                <div className="flex items-center justify-center px-8 min-h-16 border-b border-[#919191] bg-white">
                    <img src={LogoWB} alt="Wealthy Bridge Logo" className="w-36 h-9" />
                </div>
                <div className="flex items-center justify-center">
                    <div className="text-gray-500">Cargando...</div>
                </div>
            </div>
        );
    }

    // Función para manejar la expansión/contracción de menús
    const toggleMenu = (menuKey) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuKey]: !prev[menuKey]
        }));
    };

    // Función para verificar si una ruta está activa, incluyendo subpáginas
    const isRouteActive = (menuPath, currentPath) => {
        // Si la ruta coincide exactamente, está activa
        if (currentPath === menuPath) {
            return true;
        }

        // Definir las relaciones padre-hijo para detectar subpáginas
        const parentChildRelations = {
            '/courses': [
                '/course/'
            ],
            '/ambassador': [
                '/ambassador-tree'
            ],
        };

        // Verificar si la ruta actual es una subpágina del menú
        const childRoutes = parentChildRelations[menuPath];
        if (childRoutes) {
            return childRoutes.some(childRoute => {
                if (childRoute.endsWith('/')) {
                    return currentPath.startsWith(childRoute);
                }
                // Para rutas específicas
                return currentPath === childRoute;
            });
        }

        return false;
    };

    // Define menu items with their required permissions
    const menuItems = [
      {
        name: "Inicio",
        path: "/home",
        icon: Home,
      },
      {
        name: "Depósitos",
        path: "/deposits",
        icon: DollarSign,
      },
      {
        name: "Mis Pagos",
        path: "/payments",
        icon: CreditCardIcon,
      },
      {
        name: "Perfil",
        path: "/profile",
        icon: User,
      },
      {
        name: "Soporte",
        path: "/support",
        icon: HelpCircle,
      },
    ];

    return (
        <div
            className={
                `w-64 min-w-[16rem] h-full bg-white grid grid-rows-[auto_1fr] z-20 ` +
                (drawerMode ? '' : `${!isOpen ? 'hidden' : ''} hidden sm:grid`)
            }
        >
            {/* FILA 1: SIDEBAR HEADER - Logo con altura exacta del header */}
            <div className="flex items-center justify-center px-8 min-h-16 border-b border-[#919191] bg-white">
                <img src={LogoWB} alt="Wealthy Bridge Logo" className="w-36 h-9" />
            </div>

            {/* FILA 2: SIDEBAR CONTENT - Menú de navegación (expandible) */}
            <div className="flex flex-col border-r border-[#919191] shadow-[0_0_24px_0_rgba(128,0,255,0.10)] bg-white overflow-y-auto">
                <nav className="flex flex-col gap-2 py-4 px-2 pr-1">
                    {menuItems.map((item) => {
                        const isActive = item.hasSubmenu 
                            ? isRouteActive(item.key, location.pathname)
                            : isRouteActive(item.path, location.pathname);
                        
                        const isExpanded = expandedMenus[item.key] || false;
                        
                        return (
                            <React.Fragment key={item.path || item.key}>
                                {item.hasSubmenu ? (
                                    // Elemento padre con submenú
                                    <>
                                        <button
                                            onClick={() => toggleMenu(item.key)}
                                            className={`group flex items-center gap-3 px-5 py-3 rounded-lg transition-all duration-200 font-medium text-zinc-700 hover:bg-purple-50 hover:text-purple-700 w-full text-left ${isActive ? 'bg-purple-50 text-purple-700' : ''}`}
                                        >
                                            <item.icon 
                                                className={`w-6 h-6 ${isActive ? 'text-purple-600' : 'text-zinc-400 group-hover:text-purple-600'}`} 
                                            />
                                            <span className="text-base font-medium font-['Baloo_Tamma_2'] flex-1">{item.name}</span>
                                            {isExpanded ? (
                                                <ChevronDown className="w-4 h-4 text-purple-600" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4 text-zinc-600" />
                                            )}
                                        </button>
                                        
                                        {/* Submenús */}
                                        {isExpanded && item.subItems && (
                                            <div className="ml-4 flex flex-col gap-1">
                                                {item.subItems.map((subItem) => {
                                                    // Verificar permisos para subitem
                                                    if (!user?.permissions?.includes(subItem.requiredPermission)) {
                                                        return null;
                                                    }
                                                    
                                                    const isSubActive = isRouteActive(subItem.path, location.pathname);
                                                    
                                                    return (
                                                        <Link
                                                            key={subItem.path}
                                                            to={subItem.path}
                                                            className={`group flex items-center gap-3 px-5 py-2 rounded-lg transition-all duration-200 font-medium text-sm text-zinc-600 hover:bg-purple-50 hover:text-purple-700 ${isSubActive ? 'bg-purple-50 text-purple-700' : ''}`}
                                                            onClick={() => { if (drawerMode && onNavigate) onNavigate(); }}
                                                        >
                                                            <subItem.icon 
                                                                className={`w-5 h-5 ${isSubActive ? 'text-purple-600' : 'text-zinc-400 group-hover:text-purple-600'}`} 
                                                            />
                                                            <span className="font-medium font-['Baloo_Tamma_2']">{subItem.name}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    // Elemento de menú normal
                                    <Link
                                        to={item.path}
                                        className={`group flex items-center gap-3 px-5 py-3 rounded-lg transition-all duration-200 font-medium text-zinc-700 hover:bg-purple-50 hover:text-purple-700 ${isActive ? 'bg-purple-50 text-purple-700' : ''}`}
                                        onClick={() => { if (drawerMode && onNavigate) onNavigate(); }}
                                    >
                                        <item.icon 
                                            className={`w-6 h-6 ${isActive ? 'text-purple-600' : 'text-zinc-400 group-hover:text-purple-600'}`} 
                                        />
                                        <span className="text-base font-medium font-['Baloo_Tamma_2']">{item.name}</span>
                                    </Link>
                                )}
                            </React.Fragment>
                        );
                    })}
                    
                    {/* Divisor antes de cerrar sesión */}
                    <div className="w-11/12 h-px bg-[#A259FF] my-2 mx-auto rounded-full" />
                    {/* Botón de cerrar sesión después del divisor */}
                    <button
                        onClick={logOut}
                        className="w-full flex items-center gap-3 px-5 py-3 rounded-lg transition-all duration-200 font-medium text-zinc-700 hover:bg-purple-50 hover:text-purple-700 group mt-2"
                    >
                        <LogOut className="w-6 h-6 text-zinc-400 group-hover:text-purple-600" />
                        <span className="text-base font-medium font-['Baloo_Tamma_2']">Cerrar sesión</span>
                    </button>
                </nav>
            </div>
        </div>
    );
}