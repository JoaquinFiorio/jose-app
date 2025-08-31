import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useState } from 'react';
import { Menu } from 'lucide-react';

export default function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleSidebarNavigate = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="flex min-h-screen relative bg-zinc-100">
            {/* Sidebar fijo en desktop */}
            <div className={`flex-shrink-0 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0'} sm:w-64`}>
                <Sidebar isOpen={sidebarOpen} />
            </div>
            {/* Sidebar drawer en móvil */}
            <div className={`fixed inset-0 z-30 bg-black bg-opacity-40 transition-opacity duration-300 sm:hidden${sidebarOpen ? ' opacity-100 pointer-events-auto' : ' opacity-0 pointer-events-none'}`} onClick={toggleSidebar}></div>
            <div className={`fixed inset-y-0 left-0 z-40 w-64 min-w-[16rem] h-full bg-white shadow-[0_0_24px_0_rgba(128,0,255,0.10)] flex flex-col transition-transform duration-300 sm:hidden${sidebarOpen ? ' translate-x-0' : ' -translate-x-full'}`}>
                <Sidebar isOpen={sidebarOpen} drawerMode={true} onNavigate={handleSidebarNavigate} />
            </div>
            {/* Contenedor principal: header + contenido */}
            <div className="flex flex-col flex-1">
                {/* Header solo para el área de contenido principal */}
                <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                {/* Contenido principal */}
                <main className="flex-1 overflow-y-auto">
                    <div className="min-h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
