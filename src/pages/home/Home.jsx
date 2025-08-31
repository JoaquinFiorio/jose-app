import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { X, X as CloseIcon, Calendar, Video, DollarSign } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import logoClassic from "../../assets/Classic_badge.svg";
import logoPremium from "../../assets/Premium_badge.svg";
import logoWealth from "../../assets/Wealth_badge.svg";
import { Link } from 'react-router-dom';

const Home = () => {
  const { token, user, loading: authLoading } = React.useContext(AuthContext);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [membershipData, setMembershipData] = useState(null);
  const [membershipError, setMembershipError] = useState('');
  const [currentXFactorIndex, setCurrentXFactorIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState('today');

  // Esperar a que AuthContext termine de cargar antes de hacer llamadas a servicios
  useEffect(() => {

  }, []);



  // Helper function to format membership dates
  const formatMembershipDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Helper function to get membership status color
  const getMembershipStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'expired':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  // Helper function to calculate membership progress
  const calculateMembershipProgress = (startDate, endDate) => {
    if (!startDate || !endDate) return { progress: 0, daysLeft: 0, isExpired: false };

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    const totalDuration = end - start;
    const timeElapsed = now - start;
    const timeLeft = end - now;

    const progress = Math.min(Math.max((timeElapsed / totalDuration) * 100, 0), 100);
    const daysLeft = Math.max(Math.ceil(timeLeft / (1000 * 60 * 60 * 24)), 0);
    const isExpired = now > end;

    return {
      progress: Math.round(progress),
      daysLeft,
      isExpired,
      totalDays: Math.ceil(totalDuration / (1000 * 60 * 60 * 24))
    };
  };

  // Helper function to get membership status text
  const getMembershipStatusText = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'Activa';
      case 'EXPIRED':
        return 'Expirada';
      case 'PENDING':
        return 'Pendiente';
      default:
        return 'Inactiva';
    }
  };

  // Helper function to get membership logo
  const getMembershipLogo = (membershipType) => {
    switch (membershipType?.toLowerCase()) {
      case 'premium':
        return logoPremium;
      case 'wealth':
        return logoWealth;
      case 'classic':
        return logoClassic;
      default:
        return "/logo_wb.svg";
    }
  };


  // Mostrar loading mientras AuthContext está inicializando
  if (authLoading) {
    return (
      <div className="w-full min-h-screen bg-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-indigo-950 text-xl font-bold font-['Open_Sans'] mb-2">
            Cargando...
          </div>
          <div className="text-gray-600 text-sm">
            Inicializando aplicación
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-zinc-100">
      <div className="h-full flex flex-col">
        {/* Header fijo */}
        <div className="flex-shrink-0 px-4 py-5">


          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-hidden">
            <div className="px-4 pb-6 h-full">
              {/* Layout responsivo: Columna única en móvil, grid en desktop */}
              <div className="flex flex-col xl:grid xl:grid-cols-[1fr_1fr_1fr_280px] gap-6 h-full">

                {/* FILA 1: Banner */}
                <div className="xl:col-span-3">
                  <div
                    className="w-full h-64 px-4 sm:px-8 py-5 rounded-[5px] shadow-[0px_1px_3px_0px_rgba(166,175,195,0.40)] relative overflow-hidden"
                    style={{
                      background: 'radial-gradient(circle at 70% 20%, #e5aebf 0%, #bbb9f0 20%, #aa7dcc 35%, #7f72eb 55%, #7454dc 70%, #4f3aec 80%, #6050ea 90%, #422ae3 100%)'
                    }}
                  >
                    <div className="absolute right-0 top-0 w-1/3 h-full">
                      <img
                        src="/welcome.png"
                        alt="Welcome Background"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="w-2/3 relative z-10">
                      <div className="mb-4">
                        <div className="text-white text-2xl sm:text-3xl font-bold font-['Baloo_Tamma_2'] leading-relaxed">
                          Bienvenido, {user?.name || 'a Wealthy Bridge'}
                        </div>
                      </div>
                      <div className="w-full h-px bg-white/20 mb-4"></div>
                      <div>
                        <div className="text-white text-sm sm:text-base font-normal font-['Open_Sans'] leading-relaxed">
                          Tu puente hacia la libertad financiera. Aquí encontrarás las herramientas, estrategias y apoyo para dominar los mercados y crear riqueza duradera.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FILA 2: Tu Membresía y XFactor */}
                <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Tu Membresía */}
                  <div className="h-auto p-3 sm:p-4 md:p-5 bg-white rounded-[5px] shadow-[0px_1px_3px_0px_rgba(166,175,195,0.40)] flex flex-col justify-start items-center gap-4 w-full min-w-0">
                    <div className="self-stretch flex flex-col justify-start items-center gap-4 w-full min-w-0">
                      <div className="self-stretch inline-flex justify-start items-center gap-2.5">
                        <div className="justify-start text-zinc-800 text-base font-bold font-['Open_Sans'] leading-loose">Tu membresía</div>
                      </div>
                      {authLoading ? (
                        <div className="flex items-center justify-center h-36">
                          <div className="text-gray-500">Cargando...</div>
                        </div>
                      ) : membershipError ? (
                        <div className="flex items-center justify-center h-36">
                          <div className="text-red-500 text-center">
                            <div className="text-sm">Error al cargar datos</div>
                            <button
                              className="text-xs text-blue-600 hover:underline mt-1"
                            >
                              Reintentar
                            </button>
                          </div>
                        </div>
                      ) : (user.membership_start_date && user.membership_end_date) ? (
                        <div className="self-stretch flex flex-col md:flex-row justify-start items-center md:items-stretch gap-4 bg-[#F5F5F5] rounded-[5px] w-full p-4">
                          <img
                            className="w-20 h-20 md:w-32 md:h-32 object-contain flex-shrink-0"
                            src={getMembershipLogo('classic')}
                            alt="Membresía"
                          />
                          <div className="flex-1 flex flex-col justify-center items-center md:items-start gap-2 min-w-0 w-full">

                            {/* Fecha de expiración */}
                            <div className="w-full mb-2">
                              <div className="text-indigo-950 text-xs font-medium font-['Open_Sans']">
                                Activo hasta el {formatMembershipDate(user.membership_end_date)}
                              </div>
                            </div>

                            {/* Barra de vigencia con padding consistente */}
                            <div className="relative w-full h-3 flex items-center mb-3">
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-2 rounded-full bg-neutral-300"></div>
                              <div
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-2 rounded-full bg-indigo-600 transition-all duration-500"
                                style={{ width: `${calculateMembershipProgress(user.membership_start_date, user.membership_end_date).progress}%` }}
                              ></div>
                            </div>

                            {/* Texto de vigencia y estado con mejor espaciado */}
                            <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 min-w-0">
                              <span className="text-zinc-800 text-xs font-bold font-['Poppins']">
                                Vigencia ({calculateMembershipProgress(user.membership_start_date, user.membership_end_date).totalDays / 30 >= 1 ? Math.round(calculateMembershipProgress(user.membership_start_date, user.membership_end_date).totalDays / 30) : 1} meses)
                              </span>
                              <span className={`text-xs font-bold font-['Open_Sans'] ${getMembershipStatusColor(user.status)}`}>
                                {getMembershipStatusText(user.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="self-stretch flex flex-col md:flex-row justify-start items-center gap-4 w-full">
                          <img
                            className="max-w-[80px] md:max-w-[144px] w-full h-auto object-contain mx-auto flex-shrink-0 mb-2 md:mb-0"
                            src={getMembershipLogo(null)}
                            alt="Membresía"
                          />
                          <div className="flex-1 flex flex-col justify-center items-center gap-3 min-w-0 w-full">
                            <div className="w-full flex flex-col items-center gap-2.5">
                              <div className="w-full max-w-xs px-2.5 py-[5px] rounded-[50px] outline outline-1 outline-offset-[-1px] outline-gray-400 flex justify-center items-center break-words text-center">
                                <div className="text-gray-400 text-lg font-extrabold font-['Open_Sans'] leading-normal w-full break-words text-center">
                                  No tienes una membresía activa
                                </div>
                              </div>
                              <button
                                onClick={() => window.location.href = '/marketplace'}
                                className="w-full max-w-xs px-2.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[5px] font-bold text-sm mt-2 transition-colors text-center"
                              >
                                Adquiere una membresía
                              </button>
                              <div className="w-full max-w-xs flex flex-col gap-2 mt-2 break-words text-center">
                                <div className="text-xs text-gray-400 w-full break-words text-center">
                                  Adquiere una membresía para comenzar tu viaje financiero
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="h-auto p-3 sm:p-4 md:p-5 bg-white rounded-[5px] shadow-[0px_1px_3px_0px_rgba(166,175,195,0.40)] flex flex-col justify-start items-center gap-4 w-full min-w-0">
                    <div className="self-stretch flex flex-col justify-start items-center gap-4 w-full min-w-0">
                      <div className="self-stretch inline-flex justify-start items-center gap-2.5">
                        <div className="justify-start text-zinc-800 text-base font-bold font-['Open_Sans'] leading-loose">Tu balance</div>
                      </div>
                      {authLoading ? (
                        <div className="flex items-center justify-center h-36">
                          <div className="text-gray-500">Cargando...</div>
                        </div>
                      ) : membershipError ? (
                        <div className="flex items-center justify-center h-36">
                          <div className="text-red-500 text-center">
                            <div className="text-sm">Error al cargar balance</div>
                            <button
                              className="text-xs text-blue-600 hover:underline mt-1"
                            >
                              Reintentar
                            </button>
                          </div>
                        </div>
                      ) : (user.balance) ? (
                        <div className="self-stretch flex flex-col md:flex-row justify-start items-center md:items-stretch gap-4 bg-[#F5F5F5] rounded-[5px] w-full p-4">
                          <DollarSign/>
                          <div className="flex-1 flex flex-col justify-center items-center md:items-start gap-2 min-w-0 w-full">
                            <span>{parseFloat(user.balance.$numberDecimal)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="self-stretch flex flex-col md:flex-row justify-start items-center gap-4 w-full">
                          <img
                            className="max-w-[80px] md:max-w-[144px] w-full h-auto object-contain mx-auto flex-shrink-0 mb-2 md:mb-0"
                            src={getMembershipLogo(null)}
                            alt="Membresía"
                          />
                          <div className="flex-1 flex flex-col justify-center items-center gap-3 min-w-0 w-full">
                            <div className="w-full flex flex-col items-center gap-2.5">
                              <div className="w-full max-w-xs px-2.5 py-[5px] rounded-[50px] outline outline-1 outline-offset-[-1px] outline-gray-400 flex justify-center items-center break-words text-center">
                                <div className="text-gray-400 text-lg font-extrabold font-['Open_Sans'] leading-normal w-full break-words text-center">
                                  No tienes una membresía activa
                                </div>
                              </div>
                              <button
                                onClick={() => window.location.href = '/marketplace'}
                                className="w-full max-w-xs px-2.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[5px] font-bold text-sm mt-2 transition-colors text-center"
                              >
                                Adquiere una membresía
                              </button>
                              <div className="w-full max-w-xs flex flex-col gap-2 mt-2 break-words text-center">
                                <div className="text-xs text-gray-400 w-full break-words text-center">
                                  Adquiere una membresía para comenzar tu viaje financiero
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* FILA 3: Cursos disponibles (3 columnas completas) */}
                <div className="xl:col-span-3">
                  <div className="text-indigo-950 text-xl font-bold font-['Open_Sans'] mb-6">
                    No hay contenido disponible
                  </div>
                  {/* Grilla de lecciones */}
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="col-span-full text-center text-gray-500">
                      No hay cursos disponibles en este momento. ¡Pronto tendremos nuevo contenido!
                    </div>
                  </div>
                </div>

                {/* Transaction History Section */}
                {membershipData?.transactions && membershipData.transactions.length > 0 && (
                  <div className="xl:col-span-3 mt-6">
                    <div className="text-indigo-950 text-lg font-bold font-['Open_Sans'] mb-4">
                      Historial de transacciones
                    </div>
                    <div className="bg-white rounded-[5px] shadow-[0px_1px_3px_0px_rgba(166,175,195,0.40)] p-4">
                      <div className="space-y-3">
                        {membershipData.transactions.slice(0, 3).map((transaction, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-[5px]">
                            <div className="flex flex-col">
                              <div className="text-zinc-800 text-sm font-semibold">
                                {transaction.membershipName}
                              </div>
                              <div className="text-zinc-600 text-xs">
                                {transaction.xfactorPurchased && transaction.xfactorPurchased.length > 0 && (
                                  <span>XFactors: {transaction.xfactorPurchased.join(', ')}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-zinc-800 text-sm font-medium">
                                {formatMembershipDate(transaction.paidAt)}
                              </div>
                              <div className="text-green-600 text-xs font-semibold">
                                Pagado
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Columna derecha fija: Eventos y Mentorías */}
                <div className="
                w-full xl:w-72 
                xl:col-start-4 xl:row-start-1 xl:row-span-6 
                min-h-[400px] xl:h-[838px] 
                p-5 
                bg-white 
                border border-stone-300 
                rounded-[5px] 
                flex flex-col 
                justify-start items-start 
                gap-5 
                overflow-hidden 
                xl:sticky xl:top-0
              ">
                  <div className="self-stretch flex flex-col justify-start items-start gap-3">
                    <div className="self-stretch inline-flex justify-start items-center gap-10">
                      <div className="justify-start text-violet-950 text-xl font-bold font-['Open_Sans'] leading-loose">Eventos y mentorías</div>
                    </div>
                    <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-200"></div>
                  </div>

                  <div className="flex-1 flex flex-col justify-start items-start gap-4 w-full overflow-hidden">
                    <div className="flex justify-start items-start gap-2.5">
                      <button
                        onClick={() => setActiveFilter('today')}
                        className={`px-4 py-1 rounded flex justify-start items-center gap-2.5 transition-colors ${activeFilter === 'today'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-zinc-800 outline outline-1 outline-offset-[-1px] outline-zinc-200 hover:bg-gray-50'
                          }`}
                      >
                        <div className={`text-center justify-start text-xs font-bold font-['Open_Sans'] leading-normal ${activeFilter === 'today' ? 'text-white' : 'text-zinc-800'
                          }`}>
                          Hoy
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveFilter('week')}
                        className={`px-4 py-1 rounded flex justify-start items-center gap-2.5 transition-colors ${activeFilter === 'week'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-zinc-800 outline outline-1 outline-offset-[-1px] outline-zinc-200 hover:bg-gray-50'
                          }`}
                      >
                        <div className={`text-center justify-start text-xs font-bold font-['Open_Sans'] leading-normal ${activeFilter === 'week' ? 'text-white' : 'text-zinc-800'
                          }`}>
                          Esta semana
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveFilter('upcoming')}
                        className={`px-4 py-1 rounded flex justify-start items-center gap-2.5 transition-colors ${activeFilter === 'upcoming'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-zinc-800 outline outline-1 outline-offset-[-1px] outline-zinc-200 hover:bg-gray-50'
                          }`}
                      >
                        <div className={`text-center justify-start text-xs font-bold font-['Open_Sans'] leading-normal ${activeFilter === 'upcoming' ? 'text-white' : 'text-zinc-800'
                          }`}>
                          Próximos
                        </div>
                      </button>
                    </div>

                    <div className="flex-1 w-full overflow-y-auto pr-2">
                      <div className="w-full text-center text-gray-500 py-4">
                        No hay eventos disponibles
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>



        {/* Event Detail Drawer */}
        {selectedEvent && (
          <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedEvent(null)} aria-hidden="true" />

            {/* Modal Panel */}
            <div className="fixed top-0 right-0 h-full w-[452px] bg-white shadow-2xl z-50 flex flex-col rounded-[5px]">
              <div className="px-10 py-5 flex flex-col gap-2.5">
                {/* Header */}
                <div className="w-96 p-2.5 border-b flex justify-between items-start rounded-[5px]">
                  <div className="flex flex-col gap-[5px]">
                    <div className="w-72 text-zinc-800 text-xl font-bold font-['Open_Sans']">
                      Detalle del evento
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="w-4 h-4 flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* Event Content */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="px-2.5 py-1 border-b border-slate-300">
                    <h2 className="text-zinc-800 text-xl font-bold font-['Open_Sans'] mb-2">
                      {selectedEvent.title}
                    </h2>
                    {selectedEvent.subtitle && (
                      <div className="w-72 text-zinc-700 text-base font-normal font-['Open_Sans'] mt-2">
                        {selectedEvent.subtitle}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                        {selectedEvent.type}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedEvent.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : selectedEvent.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                        {selectedEvent.status === 'active'
                          ? 'Activo'
                          : selectedEvent.status === 'completed'
                            ? 'Completado'
                            : 'Inactivo'}
                      </span>
                    </div>
                    <div className="text-zinc-600 text-base font-medium font-['Open_Sans'] mb-4">
                      {selectedEvent.date}
                    </div>
                    <div className="text-zinc-800 text-base font-normal font-['Open_Sans'] leading-relaxed mb-4">
                      {selectedEvent.description}
                    </div>
                    <div className="text-zinc-800 text-base font-bold font-['Open_Sans'] mb-4">
                      Expositor: {selectedEvent.expositor}
                    </div>
                    {selectedEvent.link && (
                      <div className="mb-4">
                        <a
                          href={selectedEvent.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 text-base font-medium flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faVideo} className="w-4 h-4" />
                          Unirse al evento
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4">
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="w-full px-4 py-2.5 rounded-md flex justify-center items-center gap-2.5 transition-colors"
                      style={{ backgroundColor: '#5348F5' }}
                    >
                      <CloseIcon className="w-5 h-5 text-white" />
                      <span className="text-white text-base font-bold font-['Open_Sans'] leading-normal">
                        Cerrar
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default Home;