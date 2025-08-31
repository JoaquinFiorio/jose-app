// src/components/Header.jsx
import { useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import membershipService from '../services/membershipService';
import { useNavigate } from 'react-router-dom';
import ArrowUpCustom from '../assets/arrowup.svg';
import { Menu } from 'lucide-react';
import React from 'react';

export default function Header({ toggleSidebar }) {
    const { user, token } = React.useContext(AuthContext);
    const [membershipType, setMembershipType] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMembership = async () => {
            if (user?.id && token) {
                try {
                    const data = await membershipService.getMembershipXFactors(user.id, token);
                    setMembershipType(data?.membership?.type || null);
                } catch {
                    setMembershipType(null);
                }
            }
        };
        fetchMembership();
    }, [user, token]);

    return (
        <header className="bg-white px-8 py-3 flex justify-between items-center border-b border-[#919191] min-h-16">
            {/* Botón toggle del sidebar */}
            <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-zinc-100 transition-colors block sm:hidden"
                aria-label="Toggle sidebar"
            >
                <Menu className="w-6 h-6 text-zinc-600" />
            </button>
            
            {/* Botón y campana a la derecha */}
            <div className="flex items-center gap-3 ml-auto">
                {membershipType && 
                 membershipType.toUpperCase() !== 'WEALTH' && 
                 user?.role !== 'admin' && (
                    <button
                        className="flex items-center gap-2 px-4 py-2 rounded-md text-white font-semibold text-sm"
                        style={{ backgroundColor: '#E62D87' }}
                        onClick={() => navigate('/marketplace')}
                    >
                        <img src={ArrowUpCustom} alt="Flecha arriba" className="w-5 h-5" />
                        Mejora tu plan actual
                    </button>
                )}
               
            </div>
        </header>
    );
}