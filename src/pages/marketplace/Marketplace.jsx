import React, { useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext.tsx";
import membershipService from "../../services/membershipService.js";
import preloadService from "../../services/preloadService.js";
import SuccessModal from '../../components/ui/SuccessModal.jsx';
import { X, DollarSign, Users, Crown, Star, ShoppingCart, Zap, CheckCircle, ArrowUpRight } from 'lucide-react';

const XFACTOR_OPTIONS = [
  { name: '2X', key: '2X', maxCapital: 20000, serviceCost: 499, validityMonths: 12 },
  { name: '3X', key: '3X', maxCapital: 50000, serviceCost: 999, validityMonths: 12 },
  { name: '5X', key: '5X', maxCapital: 100000, serviceCost: 1297, validityMonths: 12 },
];

// Formatear monto como 'USD $245.07' (código antes del símbolo, dos decimales)
const formatCurrencyUSD = (amount) => {
  const formatted = Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `USD $${formatted}`;
};

const Marketplace = () => {
  const { user, token } = React.useContext(AuthContext);
  const [membershipData, setMembershipData] = useState(null);
  const [error, setError] = useState("");
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeInvoiceUrl, setUpgradeInvoiceUrl] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [upgradeTarget, setUpgradeTarget] = useState(null);
  const [buyError, setBuyError] = useState('');
  const [upgradeError, setUpgradeError] = useState('');

  // Función para determinar la jerarquía de membresías
  const getMembershipHierarchy = (membership) => {
    const hierarchy = { 'CLASSIC': 1, 'PREMIUM': 2, 'WEALTH': 3 };
    return hierarchy[membership] || 0;
  };

  // Función para verificar si se puede cambiar a una membresía específica
  const canChangeToMembership = (targetMembership) => {
    const currentLevel = getMembershipHierarchy(membershipType);
    const targetLevel = getMembershipHierarchy(targetMembership);
    return targetLevel > currentLevel; // Solo permite subir de nivel, no bajar
  };

  // Función para obtener datos usando el PreloadService
  const fetchData = async () => {
    if (!user?.id || !token) {
      return;
    }
    setError("");
    
    try {
      // Primero intenta obtener datos del cache
      const cacheKey = `membership_${user.id}`;
      const cachedData = preloadService.getCachedData(cacheKey);
      
      if (cachedData) {
        console.log('✅ Marketplace - Using cached membership data');
        setMembershipData(cachedData);
        return;
      }

      // Si no hay datos en cache, los obtiene y los cachea
      console.log('🔄 Marketplace - Fetching fresh membership data');
      const data = await membershipService.getMembershipXFactors(user.id, token);
      setMembershipData(data);
      
      // Guarda en cache para futuras visitas
      preloadService.cache.set(cacheKey, data);
      
    } catch (error) {
      console.error('❌ Marketplace - Error fetching data:', error);
      setError('Error al obtener datos');
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id, token]);

  useEffect(() => {
    if (isUpgradeModalOpen && upgradeTarget) {
      handleUpgradeMembership();
    }
    // eslint-disable-next-line
  }, [isUpgradeModalOpen, upgradeTarget]);

  const handleActivationModalClose = () => {
    setIsActivationModalOpen(false);
    setInvoiceUrl('');
    setBuyError('');
    fetchData();
  };

  const handleUpgradeModalOpen = (targetType) => {
    setUpgradeTarget(targetType);
    setUpgradeInvoiceUrl('');
    setIsUpgradeModalOpen(true);
  };

  const handleUpgradeModalClose = () => {
    setIsUpgradeModalOpen(false);
    setUpgradeInvoiceUrl('');
    setUpgradeError('');
    fetchData();
  };

  const handleUpgradeMembership = async () => {
    if (!upgradeTarget) return;
    setUpgradeInvoiceUrl('');
    setUpgradeError('');
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenData.id;
      const result = await membershipService.upgradeMembershipWithPayment(userId, upgradeTarget);
      if (result.invoiceUrl) {
        setUpgradeInvoiceUrl(result.invoiceUrl);
      } else {
        setUpgradeError('No se pudo generar el enlace de pago.');
      }
    } catch (err) {
      setUpgradeError(err.message || 'No se pudo generar el enlace de pago.');
    }
  };

  // Lógica de botones XFactor
  const getXFactorButtonState = (option, xFactors, membershipType) => {
    const totalBought = xFactors.length;
    const userXf = xFactors.find((xf) => xf.name === option.key);
    if (!membershipType || membershipType === "CLASSIC") {
      return { label: "Mejorar plan", action: "upgrade", disabled: false };
    }
    if (membershipType === "PREMIUM") {
      if (totalBought >= 1 && !userXf) {
        return { label: "Mejorar plan", action: "upgrade", disabled: false };
      }
      if (!userXf) {
        return { label: "Comprar", action: "buy", disabled: false };
      }
      if (userXf && !userXf.active) {
        return { label: "Activar", action: "activate", disabled: false };
      }
      if (userXf && userXf.active) {
        return { label: "Activado", action: "activated", disabled: true };
      }
    }
    if (membershipType === "WEALTH") {
      if (totalBought >= 2 && !userXf) {
        return { label: "Xfactor límite alcanzado", action: "limit", disabled: true };
      }
      if (!userXf) {
        return { label: "Comprar", action: "buy", disabled: false };
      }
      if (userXf && !userXf.active) {
        return { label: "Activar", action: "activate", disabled: false };
      }
      if (userXf && userXf.active) {
        return { label: "Activado", action: "activated", disabled: true };
      }
    }
    return { label: "Mejorar plan", action: "upgrade", disabled: false };
  };

  // Nueva función para generar el invoice de XFactor
  const handleBuyXFactor = async (xfactorName) => {
    setIsActivationModalOpen(true);
    setInvoiceUrl('');
    setBuyError('');
    try {
      const result = await membershipService.buyXFactorWithPayment(user.id, xfactorName);
      if (result.invoiceUrl) {
        setInvoiceUrl(result.invoiceUrl);
      } else {
        setBuyError('No se pudo generar el enlace de pago.');
      }
    } catch (err) {
      setBuyError(err.message || 'No se pudo generar el enlace de pago.');
    }
  };

  if (error) {
    return <div className="w-full h-screen flex items-center justify-center bg-zinc-100 text-red-600">{error}</div>;
  }

  // Default data structure when membershipData is null
  const defaultData = {
    membership: { type: null, status: 'inactive' },
    xFactors: []
  };

  // Nueva lógica para membresía activa/inactiva
  const membership = (membershipData || defaultData)?.membership || {};
  const membershipType = membership?.type ? membership.type.toUpperCase() : null;
  const membershipStatus = membership?.status || "inactive";
  const hasActiveMembership = !!membershipType && membershipStatus === "active";
  const xFactors = (membershipData || defaultData)?.xFactors || [];

  return (
    <div className="w-full min-h-screen bg-zinc-100">
      <div className="px-6 py-5">
        {/* Título */}
        <div className="border-b border-zinc-200 pb-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            <h1 className="text-indigo-950 text-3xl font-bold flex-shrink-0">Marketplace</h1>
          </div>
        </div>

        {/* Aviso si no hay membresía activa */}
        {!hasActiveMembership && (
          <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-center font-semibold">
            No tienes una membresía activa. Elige una para comenzar a disfrutar de los beneficios de WealthyBridge.
          </div>
        )}


        {/* Sección de Membresías */}
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Membresías</h2>
            <p className="text-base text-gray-800 mb-6">Elige tu nivel y accede a la comunidad WealthyBridge y sus herramientas exclusivas.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Classic */}
            <div className={`p-6 bg-white rounded-[5px] shadow-[0_8px_24px_rgba(0,0,0,0.07)] border ${hasActiveMembership && membershipType === 'CLASSIC' ? 'border-blue-500 border-2' : 'border-zinc-200'} relative`}>
              {hasActiveMembership && membershipType === 'CLASSIC' && (
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">Plan actual</span>
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Bridge Classic</h3>
              </div>
              <p className="text-base text-gray-800 mb-4">Acceso a información y herramientas para crecer tus habilidades y comprender cómo crear ingresos con mercados financieros.</p>
                              <ul className="text-base text-gray-800 mb-6 space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    WB PROFIT FORMULA
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    WEALTHY TRADE
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Acceso por 3 meses
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Comunidad WealthyBridge
                  </li>
                </ul>
              <div className="mb-4">
                <div className="text-2xl font-bold text-gray-900">{formatCurrencyUSD(249)}</div>
                <div className="text-base text-gray-800">Pago único - 3 meses</div>
              </div>
              {membershipType !== 'CLASSIC' && canChangeToMembership('CLASSIC') && (
                <button 
                  className="w-full px-4 py-2 text-white rounded-[5px] text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#5348F5' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#4A3FD4'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#5348F5'}
                  onClick={() => handleUpgradeModalOpen('CLASSIC')}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Mejorar plan
                </button>
              )}
              {membershipType !== 'CLASSIC' && !canChangeToMembership('CLASSIC') && (
                <div className="px-3 py-2 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                  No puedes bajar de nivel
                </div>
              )}
            </div>

            {/* Premium */}
            <div className={`p-6 bg-white rounded-[5px] shadow-[0_8px_24px_rgba(0,0,0,0.07)] border ${hasActiveMembership && membershipType === 'PREMIUM' ? 'border-blue-500 border-2' : 'border-zinc-200'} relative`}>
              {hasActiveMembership && membershipType === 'PREMIUM' && (
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">Plan actual</span>
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <Star className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Bridge Premium</h3>
              </div>
              <p className="text-base text-gray-800 mb-4">Beneficios avanzados, análisis detallados y para maximizar tus resultados.</p>
                              <ul className="text-base text-gray-800 mb-6 space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    WB PROFIT FORMULA
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    WEALTHY TRADE
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Acceso por 6 meses
                  </li>
                  {/* <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Derecho a comprar 1 X-Factor
                  </li> */}
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Trader Independiente
                  </li>
                </ul>
              <div className="mb-4">
                <div className="text-2xl font-bold text-gray-900">{formatCurrencyUSD(699)}</div>
                <div className="text-base text-gray-800">Pago único - 6 meses</div>
              </div>
              {membershipType !== 'PREMIUM' && canChangeToMembership('PREMIUM') && (
                <button 
                  className="w-full px-4 py-2 text-white rounded-[5px] text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#5348F5' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#4A3FD4'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#5348F5'}
                  onClick={() => handleUpgradeModalOpen('PREMIUM')}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Mejorar plan
                </button>
              )}
              {membershipType !== 'PREMIUM' && !canChangeToMembership('PREMIUM') && (
                <div className="px-3 py-2 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                  No puedes bajar de nivel
                </div>
              )}
            </div>

            {/* Wealth */}
            <div className={`p-6 bg-white rounded-[5px] shadow-[0_8px_24px_rgba(0,0,0,0.07)] border ${hasActiveMembership && membershipType === 'WEALTH' ? 'border-blue-500 border-2' : 'border-zinc-200'} relative`}>
              {hasActiveMembership && membershipType === 'WEALTH' && (
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">Plan actual</span>
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <Crown className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Bridge Wealth</h3>
              </div>
              <p className="text-base text-gray-800 mb-4">Todos los beneficios premium más acceso VIP y consultoría personalizada.</p>
                              <ul className="text-base text-gray-800 mb-6 space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    WB PROFIT FORMULA
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    WEALTHY TRADE
                  </li>
                  {/* <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    X-Factor incluido
                  </li> */}
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Acceso por 12 meses
                  </li>
                  {/* <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Derecho a comprar 2 X-Factor
                  </li> */}
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Trader Advanced
                  </li>
                </ul>
              <div className="mb-4">
                <div className="text-2xl font-bold text-gray-900">{formatCurrencyUSD(1297)}</div>
                <div className="text-base text-gray-800">Pago único - 12 meses</div>
              </div>
              {membershipType !== 'WEALTH' && canChangeToMembership('WEALTH') && (
                <button 
                  className="w-full px-4 py-2 text-white rounded-[5px] text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#5348F5' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#4A3FD4'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#5348F5'}
                  onClick={() => handleUpgradeModalOpen('WEALTH')}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Mejorar plan
                </button>
              )}
              {membershipType !== 'WEALTH' && !canChangeToMembership('WEALTH') && (
                <div className="px-3 py-2 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                  No puedes bajar de nivel
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sección de XFactors */}
        {xFactors.length > 0 && (
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">XFactors</h2>
            <p className="text-base text-gray-800 mb-6">Multiplica tu capital con nuestras estrategias de copy trading automáticas. Solo para usuarios Premium y Wealth.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {XFACTOR_OPTIONS.map((option) => {
              const buttonState = getXFactorButtonState(option, xFactors, membershipType);
              const userHasXFactor = xFactors.some(xf => xf.name.replace(/"/g, '') === option.key);
              const isCurrentXFactor = userHasXFactor;

              // Lógica para máximo de XFactors según membresía
              const xFactorLimit = membershipType === 'PREMIUM' ? 1 : (membershipType === 'WEALTH' ? 2 : 0);
              const totalBought = xFactors.length;
              const maxReached = totalBought >= xFactorLimit;

              // Lógica para validar si el XFactor es válido para la membresía
              const validForMembership =
                (membershipType === 'PREMIUM' && (option.key === '2X' || option.key === '3X')) ||
                (membershipType === 'WEALTH' && (option.key === '2X' || option.key === '3X' || option.key === '5X'));

              return (
                <div className={`p-6 bg-white rounded-[5px] shadow-[0_8px_24px_rgba(0,0,0,0.07)] border ${userHasXFactor ? 'border-blue-500 border-2' : 'border-zinc-200'} relative`} key={option.key}>
                  {isCurrentXFactor && (
                    <div className="absolute top-4 right-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">Tu XFactor actual</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <Star className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">XFactor {option.name}</h3>
                  </div>
                  <p className="text-base text-gray-800 mb-4">
                      {option.key === "2X" && "Multiplica x2 tu capital con nuestra estrategia automatizada. Capital máximo operable hasta $20,000."}
                      {option.key === "3X" && "Multiplica x3 tu capital con estrategias avanzadas. Capital máximo operable hasta $50,000."}
                      {option.key === "5X" && "Multiplica x5 tu capital con la estrategia más avanzada. Capital máximo operable hasta $100,000."}
                  </p>
                  <ul className="text-base text-gray-800 mb-6 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      Trading 100% automático
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      Capital máximo: {formatCurrencyUSD(option.maxCapital)}
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      Estrategia probada 83% efectividad
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      {option.key === "2X" ? "Sin necesidad de estar pendiente" : option.key === "3X" ? "Gestión avanzada de riesgos" : "Gestión premium de riesgos"}
                    </li>
                    {option.key === "5X" && (
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        Soporte VIP incluido
                      </li>
                    )}
                    </ul>
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-gray-900">{formatCurrencyUSD(option.serviceCost)}</div>
                    <div className="text-base text-gray-800">Servicio único</div>
                  </div>
                  
                  {membershipType === 'CLASSIC' ? (
                    <div className="px-3 py-2 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                      Mejora tu membresía para adquirir este producto
                    </div>
                  ) : (
                    <>
                      {!isCurrentXFactor && validForMembership && !maxReached && (
                        <>
                          {buttonState.action === "buy" && (
                            <button 
                              className="w-full px-4 py-2 text-white rounded-[5px] text-sm font-semibold flex items-center justify-center gap-2"
                              style={{ backgroundColor: '#5348F5' }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#4A3FD4'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#5348F5'}
                              onClick={() => handleBuyXFactor(option.name)}
                            >
                              <ShoppingCart className="w-4 h-4" />
                              Comprar Ahora
                            </button>
                          )}
                          {buttonState.action === "activate" && (
                            <button 
                              className="w-full px-4 py-2 text-white rounded-[5px] text-sm font-semibold flex items-center justify-center gap-2"
                              style={{ backgroundColor: '#5348F5' }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#4A3FD4'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#5348F5'}
                              onClick={() => handleBuyXFactor(option.name)}
                            >
                              <Zap className="w-4 h-4" />
                              Activar
                            </button>
                          )}
                          {buttonState.action === "activated" && (
                            <button className="w-full px-4 py-2 bg-gray-200 text-gray-500 rounded-[5px] text-sm font-semibold flex items-center justify-center gap-2" disabled>
                              <CheckCircle className="w-4 h-4" />
                              Activado
                            </button>
                          )}
                          {buttonState.action === "upgrade" && (
                            <button 
                              className="w-full px-4 py-2 text-white rounded-[5px] text-sm font-semibold flex items-center justify-center gap-2"
                              style={{ backgroundColor: '#5348F5' }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#4A3FD4'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#5348F5'}
                              onClick={() => handleUpgradeModalOpen(option.key)}
                            >
                              <ArrowUpRight className="w-4 h-4" />
                              Mejorar plan
                            </button>
                          )}
                          {buttonState.action === "limit" && (
                            <div className="px-3 py-2 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                              Xfactor límite alcanzado
                            </div>
                          )}
                        </>
                      )}
                      {!validForMembership && (
                        <div className="px-3 py-2 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                          No disponible para tu membresía
                        </div>
                      )}
                      {validForMembership && maxReached && !isCurrentXFactor && (
                        <div className="px-3 py-2 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                          Xfactor límite alcanzado
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="mt-3 px-3 py-2 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200">
                    {option.key === '5X' ? 'Solo membresía Wealth' : 'Solo membresía Premium/Wealth'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}
      </div>

      {/* Modal de Activación */}
      {isActivationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div className="fixed inset-0 bg-black/40" onClick={handleActivationModalClose} aria-hidden="true" />
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col overflow-hidden border-l-0">
            <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-zinc-100">
              <div>
                <div className="text-2xl font-bold text-indigo-900 mb-1">Comprar XFactor</div>
                <div className="text-sm text-zinc-500">Completa tu pago para activar el servicio</div>
              </div>
              <button onClick={handleActivationModalClose} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 flex flex-col px-8 py-8 overflow-y-auto">
              {buyError ? (
                <div className="w-full flex flex-col items-center justify-center py-10">
                  <div className="text-lg font-bold mb-4 text-center text-red-600">{buyError}</div>
                  <button className="mt-6 px-4 py-2 bg-gray-200" onClick={handleActivationModalClose}>Cerrar</button>
                </div>
              ) : invoiceUrl ? (
                <div className="w-full flex flex-col items-center">
                  <h2 className="text-lg font-bold mb-4 text-center">Completa tu pago para activar el XFactor</h2>
                  <div className="bg-red-100 border-red-500 text-red-800 p-4 rounded mb-4 max-w-lg w-full">
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Asegúrate de enviar el importe exacto.</li>
                        <li>Tienes <span className="font-bold">20 minutos</span> para completar el pago.</li>
                        <li>No cierres ni actualices la ventana, ya que el pago se invalidará.</li>
                    </ul>
                  </div>
                  <iframe
                    src={`https://nowpayments.io/embeds/payment-widget?iid=${invoiceUrl.split('iid=')[1]}`}
                    width={410}
                    height={696}
                    frameBorder={0}
                    scrolling="yes"
                    title="Pago con NOWPayments"
                  />
                  <div className="mt-4 px-4 py-3 bg-green-50 border border-green-200 text-green-800 rounded text-center text-base font-semibold">
                    Cuando completes el pago, puedes cerrar esta ventana.<br />
                    Si el pago fue exitoso, tu servicio se activará automáticamente y recibirás un correo de confirmación.
                  </div>
                  <button
                    className="mt-6 px-4 py-2 bg-gray-200"
                    onClick={handleActivationModalClose}
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center justify-center py-10">
                  <div className="text-lg font-bold mb-4 text-center">Generando enlace de pago...</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Upgrade de Plan */}
      {isUpgradeModalOpen && (
        <div>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={handleUpgradeModalClose} aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-end z-50">
            <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col overflow-hidden border-l-0">
              <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-zinc-100">
                <div>
                  <div className="text-2xl font-bold text-indigo-900 mb-1">Mejorar membresía</div>
                  <div className="text-sm text-zinc-500">Completa tu pago para mejorar tu membresía</div>
                </div>
                <button onClick={handleUpgradeModalClose} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 flex flex-col px-8 py-8 overflow-y-auto">
                {upgradeError ? (
                  <div className="w-full flex flex-col items-center justify-center py-10">
                    <div className="text-lg font-bold mb-4 text-center text-red-600">{upgradeError}</div>
                    <button className="mt-6 px-4 py-2 bg-gray-200" onClick={handleUpgradeModalClose}>Cerrar</button>
                  </div>
                ) : upgradeInvoiceUrl ? (
                  <div className="w-full flex flex-col items-center">
                    <h2 className="text-lg font-bold mb-4 text-center">Completa tu pago para mejorar tu membresía</h2>
                    <div className="bg-red-100 border-red-500 text-red-800 p-4 rounded mb-4 max-w-lg w-full">
                      <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Asegúrate de enviar el importe exacto.</li>
                          <li>Tienes <span className="font-bold">20 minutos</span> para completar el pago.</li>
                          <li>No cierres ni actualices la ventana, ya que el pago se invalidará.</li>
                      </ul>
                    </div>
                    <iframe
                      src={`https://nowpayments.io/embeds/payment-widget?iid=${upgradeInvoiceUrl.split('iid=')[1]}`}
                      width={410}
                      height={696}
                      frameBorder={0}
                      scrolling="yes"
                      title="Pago con NOWPayments"
                    />
                    <div className="mt-4 text-sm text-gray-500 text-center">
                      Cuando tu pago sea confirmado, tu membresía se actualizará automáticamente.<br />Puedes cerrar esta ventana y volver más tarde.
                    </div>
                    <button
                      className="mt-6 px-4 py-2 bg-gray-200"
                      onClick={handleUpgradeModalClose}
                    >
                      Cerrar
                    </button>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center justify-center py-10">
                    <div className="text-lg font-bold mb-4 text-center">Generando enlace de pago...</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <SuccessModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="¡XFactor activado!"
        message="Tu servicio XFactor ha sido activado exitosamente."
        actions={[
          { label: "Aceptar", onClick: () => setShowSuccessModal(false), primary: true }
        ]}
        autoClose={3000}
      />
    </div>
  );
};

export default Marketplace;
