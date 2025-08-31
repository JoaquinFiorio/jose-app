import React, { useState, useEffect } from 'react';
import despliegueIcon from '/despliegue.svg';
import { X, ChevronDown, Send, MessageCircle, Loader } from 'lucide-react';
import { supportService } from '../../services/supportService';
import { useForm } from 'react-hook-form';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';

const Support = () => {
  const [openFaqs, setOpenFaqs] = useState({});
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [showTicketSuccess, setShowTicketSuccess] = useState(false);
  const [userTickets, setUserTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const { user } = React.useContext(AuthContext);



  const { register: rhfRegister, handleSubmit: rhfHandleSubmit, formState: { errors }, reset, setValue } = useForm({
    mode: 'onChange',
    defaultValues: {
      subject: '',
      message: '',
      priority: 'Media'
    },
  });

  // Cargar tickets del usuario al montar el componente
  useEffect(() => {
    // Verificar si hay un token de acceso (indica que el usuario está autenticado)
    const token = localStorage.getItem('token');
    if (token) {
      loadUserTickets();
    } else {
      // Si no hay token, establecer un array vacío
      setUserTickets([]);
    }
  }, [user]);

  // Log de información del usuario para depuración
  useEffect(() => {
    if (isSupportModalOpen && user) {
      console.log('Usuario disponible para soporte:', {
        name: user.name,
        email: user.email
      });
    }
  }, [user, isSupportModalOpen]);

  const loadUserTickets = async () => {
    try {
      setIsLoadingTickets(true);
      const response = await supportService.getUserTickets();

      // Verificar si la respuesta tiene datos
      if (response && response.data) {
        setUserTickets(response.data);
      } else {
        // Si no hay datos, establecer un array vacío
        setUserTickets([]);
      }
    } catch (error) {
      console.error('Error al cargar tickets:', error);
      // No mostrar toast de error, simplemente establecer un array vacío
      setUserTickets([]);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const toggleFaq = (id) => {
    setOpenFaqs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSupportModalClose = () => {
    setIsSupportModalOpen(false);
    reset();
  };

  const handleSupportModalOpen = () => {
    // Siempre abrir el modal
    setIsSupportModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Verificar que hay un token de autenticación
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Debes iniciar sesión para enviar una solicitud de soporte');
        return;
      }

      const dataToSend = {
        subject: data.subject,
        message: data.message.trim(),
        priority: data.priority || 'Media'
      };

      console.log('Enviando solicitud de soporte:', dataToSend);

      const response = await supportService.createSupportTicket(dataToSend);

      // Verificar si la respuesta contiene el ID del ticket
      if (response && response.ticketId) {
        setTicketId(response.ticketId);
        setShowTicketSuccess(true);
        handleSupportModalClose();
        toast.success(`Solicitud de soporte enviada correctamente. Ticket #${response.ticketId}`);
      } else {
        handleSupportModalClose();
        toast.success('Consulta enviada exitosamente. Te responderemos pronto.');
      }

      // Recargar los tickets después de enviar una nueva solicitud
      loadUserTickets();
    } catch (error) {
      let errorMessage = 'Error al enviar la consulta';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      id: 1,
      question: '¿Cómo puedo recuperar mi contraseña?',
      answer: 'Para recuperar tu contraseña, haz clic en "¿Olvidaste tu contraseña?" en la página de inicio de sesión y sigue las instrucciones enviadas a tu correo.'
    },
    {
      id: 2,
      question: '¿Cómo puedo cambiar mi plan de suscripción?',
      answer: 'Puedes cambiar tu plan desde la sección de configuración de tu cuenta o contactando a soporte para asistencia personalizada.'
    },
    {
      id: 3,
      question: '¿Cuánto tiempo dura el beneficio de XFactor?',
      answer: 'El beneficio de XFactor está disponible durante todo el tiempo que mantengas tu suscripción activa.'
    },
    {
      id: 4,
      question: '¿Cuánto tiempo tarda en responder el soporte de Wealthy Bridge?',
      answer: 'Nuestro equipo de soporte responde generalmente en menos de 24 horas hábiles.'
    },
    {
      id: 5,
      question: '¿Cuánto tiempo tengo para llevar los cursos?',
      answer: 'Tienes acceso a los cursos durante todo el tiempo que mantengas tu suscripción activa.'
    },
    {
      id: 6,
      question: '¿Cómo puedo acceder a las señales de trading?',
      answer: 'Las señales de trading están disponibles en tu panel de control una vez que hayas activado tu suscripción. Puedes acceder a ellas en cualquier momento desde la sección "Señales" en el menú principal.'
    }
  ];

  return (
    <div className="w-full h-screen bg-zinc-100 overflow-hidden">
      {/* Contenido principal */}
      <div className="px-6 py-5 h-full overflow-y-auto">
        {/* Sección de título */}
        <div className="border-b border-zinc-200 pb-4 mb-8 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="text-indigo-950 text-3xl font-bold font-['Open_Sans']">Soporte al usuario</div>
          </div>
          {/* <div
            className="px-4 py-2 rounded-md cursor-pointer"
            style={{ backgroundColor: '#5348F5' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#4A3FD4'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#5348F5'}
            onClick={handleSupportModalOpen}
          >
            <div className="flex items-center gap-2 text-white text-sm font-bold font-['Open_Sans']">
              <MessageCircle className="w-4 h-4" />
              Nueva consulta
            </div>
          </div> */}
        </div>

        {/* Description */}
        <div className="mb-8">
          <p className="text-zinc-600 text-base font-medium font-['Open_Sans'] max-w-4xl">
            En esta sección encontrarás las preguntas frecuentes que hemos recibido de nuestros usuarios y también podrás escribir tus consultas y nuestro equipo te responderá lo más pronto posible.
          </p>
        </div>

        {/* Mis Tickets - Solo mostrar si hay tickets o está cargando */}
        {/* {(isLoadingTickets || userTickets.length > 0) && (
          <div className="mb-8">
            <h2 className="text-indigo-950 text-xl font-bold font-['Open_Sans'] mb-4">Mis Tickets de Soporte</h2>

            {isLoadingTickets ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 text-indigo-600 animate-spin mr-2" />
                <span className="text-indigo-600">Cargando tickets...</span>
              </div>
            ) : (
              <div className="bg-white rounded-[5px] shadow-[0px_20px_95px_0px_rgba(201,203,204,0.30)] overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ticket ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Asunto
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userTickets.map((ticket) => (
                      <tr key={ticket._id} className="hover:bg-gray-50 cursor-pointer">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                          {ticket.ticketId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ticket.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${ticket.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                              ticket.status === 'En proceso' ? 'bg-blue-100 text-blue-800' :
                                ticket.status === 'Resuelto' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'}`}>
                            {ticket.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )} */}

        {/* FAQ Grid */}
        <div className="mb-8">
          <h2 className="text-indigo-950 text-xl font-bold font-['Open_Sans'] mb-4">Preguntas Frecuentes</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className={`bg-white rounded-[5px] shadow-[0px_20px_95px_0px_rgba(201,203,204,0.30)] outline outline-1 outline-offset-[-1px] outline-violet-50 p-8 cursor-pointer transition-all duration-300 ${openFaqs[faq.id] ? 'hover:shadow-lg' : ''}`}
                onClick={() => toggleFaq(faq.id)}
              >
                <div className="flex items-start gap-6">
                  <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded">
                    <img
                      src={despliegueIcon}
                      alt="desplegar"
                      className={`w-4 h-4 text-blue-600 transition-transform duration-300 ${openFaqs[faq.id] ? 'rotate-180' : ''}`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-zinc-800 text-base font-bold font-['Open_Sans'] leading-relaxed mb-4">
                      {faq.question}
                    </h3>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaqs[faq.id] ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                    >
                      <p className="text-zinc-600 text-base font-normal font-['Open_Sans'] leading-normal">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Soporte */}
      {isSupportModalOpen && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/50 z-40" onClick={handleSupportModalClose} aria-hidden="true" />
          <div className="fixed top-0 right-0 h-full w-[452px] bg-white shadow-2xl z-50 flex flex-col overflow-y-auto">
            <div className="px-5 py-5 flex flex-col gap-2.5 h-full">
              {/* Header */}
              <div className="w-full p-2.5 border-b flex justify-between items-start">
                <div className="flex flex-col gap-[5px]">
                  <div className="text-zinc-800 text-xl font-bold">
                    ¿Tienes alguna duda o necesitas ayuda?
                  </div>
                  <div className="text-zinc-800 text-sm font-normal">
                    Completa el formulario y nuestro equipo de soporte te responderá a la brevedad.
                  </div>
                </div>
                <button
                  onClick={handleSupportModalClose}
                  className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mensaje de autenticación requerida */}
              {!localStorage.getItem('token') ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Inicio de sesión requerido</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Debes iniciar sesión para enviar una solicitud de soporte. Por favor, inicia sesión y vuelve a intentarlo.
                  </p>
                  <button
                    onClick={handleSupportModalClose}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Entendido
                  </button>
                </div>
              ) : (
                /* Form */
                <form onSubmit={rhfHandleSubmit(onSubmit)} className="w-full flex flex-col gap-2.5 mt-2" noValidate>
                  {/* Información del usuario (solo lectura) */}
                  {user && (
                    <div className="px-2.5 py-3 bg-gray-50 rounded-md mb-2">
                      <div className="text-sm text-gray-600 mb-1">Enviando como:</div>
                      <div className="text-base font-medium text-gray-800">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </div>
                  )}


                  {/* Asunto */}
                  <div className="px-2.5 py-1 border-b border-slate-300 flex flex-col gap-1.5">
                    <div className="text-zinc-800 text-sm font-normal">Asunto</div>
                    <div className="flex justify-between items-center">
                      <select
                        {...rhfRegister('subject', { required: 'Por favor selecciona un asunto' })}
                        className={`text-zinc-800 text-base font-medium outline-none bg-transparent w-full appearance-none py-1.5 px-2 ${errors.subject ? 'border-b border-rose-500' : ''}`}
                      >
                        <option value="" className="text-zinc-400">Selecciona un asunto</option>
                        <option value="Consulta general">Consulta general</option>
                        <option value="Problema técnico">Problema técnico</option>
                        <option value="Facturación">Facturación</option>
                        <option value="Cuenta">Cuenta</option>
                        <option value="Otro">Otro</option>
                      </select>
                      <ChevronDown className="w-5 h-5 text-zinc-400" />
                    </div>
                    {errors.subject && <ErrorMessage>{errors.subject.message}</ErrorMessage>}
                  </div>

                  {/* Prioridad */}
                  <div className="px-2.5 py-1 border-b border-slate-300 flex flex-col gap-1.5">
                    <div className="text-zinc-800 text-sm font-normal">Prioridad</div>
                    <div className="flex justify-between items-center">
                      <select
                        {...rhfRegister('priority')}
                        className="text-zinc-800 text-base font-medium outline-none bg-transparent w-full appearance-none py-1.5 px-2"
                        defaultValue="Media"
                      >
                        <option value="Baja">Baja</option>
                        <option value="Media">Media</option>
                        <option value="Alta">Alta</option>
                        <option value="Urgente">Urgente</option>
                      </select>
                      <ChevronDown className="w-5 h-5 text-zinc-400" />
                    </div>
                  </div>

                  {/* Mensaje */}
                  <div className="px-2.5 py-1 border-b border-slate-300 flex flex-col gap-1.5">
                    <div className="text-zinc-800 text-sm font-normal">
                      Escribe tu consulta o duda:
                    </div>
                    <textarea
                      {...rhfRegister('message', {
                        required: 'Por favor escribe tu consulta',
                        minLength: { value: 10, message: 'El mensaje debe tener al menos 10 caracteres' },
                      })}
                      placeholder="Mi consulta es..."
                      className={`w-full text-zinc-800 text-lg font-medium outline-none resize-none ${errors.message ? 'border-b border-rose-500' : ''}`}
                      rows={4}
                    />
                    {errors.message && <ErrorMessage>{errors.message.message || errors.message.type === 'minLength' && 'El mensaje debe tener al menos 10 caracteres'}</ErrorMessage>}
                  </div>

                  {/* Botones de acción al final */}
                  <div className="pt-8 flex gap-4 mt-6">
                    <button
                      type="button"
                      onClick={handleSupportModalClose}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 border border-gray-400 flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" /> Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 rounded-md text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ backgroundColor: '#5348F5', color: 'white' }}
                      onMouseEnter={(e) => {
                        if (!isSubmitting) e.target.style.backgroundColor = '#4A3FD4';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSubmitting) e.target.style.backgroundColor = '#5348F5';
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Enviar consulta
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal de éxito para ticket de soporte */}
      {showTicketSuccess && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowTicketSuccess(false)} aria-hidden="true" />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 p-6 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Solicitud de Soporte Enviada</h3>
              <p className="text-sm text-gray-600 mb-4">
                Tu solicitud de soporte ha sido enviada correctamente. Se ha generado el ticket #{ticketId} para seguimiento.
                Nuestro equipo de soporte se pondrá en contacto contigo lo antes posible.
              </p>
              <button
                onClick={() => setShowTicketSuccess(false)}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Aceptar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Support;