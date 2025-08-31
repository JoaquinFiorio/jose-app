import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const EmailTemplatePreview = ({ templateId, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [templateHtml, setTemplateHtml] = useState('');

    useEffect(() => {
        const loadTemplatePreview = async () => {
            try {
                setLoading(true);
                setError(null);

                // Placeholder data for template variables
                const placeholderData = {
                    username: 'Usuario Ejemplo',
                    email: 'usuario@ejemplo.com',
                    request_date: new Date().toLocaleDateString('es-ES'),
                    resetUrl: '#',
                    userName: 'Usuario Ejemplo'
                };

                // Load the template HTML based on templateId
                let html = '';

                switch (templateId) {
                    case 'password-reset':
                        html = await getPasswordResetTemplate(placeholderData);
                        break;
                    case 'vantage-account-created':
                        html = await getVantageAccountCreatedTemplate(placeholderData);
                        break;
                    case 'accountCreatedEmailService':
                        html = await getAccountCreatedTemplate(placeholderData);
                        break;
                    default:
                        setError(`Plantilla no encontrada: ${templateId}`);
                        html = '<div>Plantilla no disponible</div>';
                }

                setTemplateHtml(html);
            } catch (err) {
                console.error('Error al cargar la plantilla:', err);
                setError(`Error al cargar la plantilla: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        loadTemplatePreview();
    }, [templateId]);

    // Función para obtener la plantilla de restablecimiento de contraseña
    const getPasswordResetTemplate = async (data) => {
        // Esta es una versión simplificada de la plantilla con variables reemplazadas
        return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Restablece tu contraseña - The Wealthy Bridge</title>
          <link href='https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap' rel='stylesheet'>
      </head>
      <body style="background-color:#f5f5f7;min-height:100vh;margin:0;padding:0;font-family:'Poppins',Arial,sans-serif;padding-top:40px;padding-bottom:40px;">
          <div style="max-width:600px;margin:40px auto 60px auto;background-color:#fff;border-radius:0;box-shadow:0 10px 30px rgba(0,0,0,0.08);overflow:hidden;">
              <div style="padding:60px 40px;">
                  <div style="text-align:center;margin-bottom:50px;">
                      <img src="https://hubee.app/image/cache/wkseller/8343/1740357355_ulYKF2r71t-cr-726x390.png" alt="The Wealthy Bridge" width="180" />
                  </div>
                  <div style="font-size:18px;color:#86868b;margin-bottom:8px;font-weight:400;font-family:'Poppins',Arial,sans-serif;">Hola <b>${data.username}</b>,</div>
                  <h1 style="font-size:32px;font-weight:700;color:#1d1d1f;margin-bottom:40px;line-height:1.1;font-family:'Poppins',Arial,sans-serif;">Restablece tu contraseña en The Wealthy Bridge</h1>
                  <p style="font-size:18px;line-height:1.6;color:#424245;margin-bottom:30px;font-family:'Poppins',Arial,sans-serif;">Recibimos una solicitud para cambiar la contraseña de tu cuenta en The Wealthy Bridge.</p>
                  <ul style="font-size:18px;line-height:1.6;color:#424245;margin-bottom:30px;font-family:'Poppins',Arial,sans-serif;list-style:none;padding:0;">
                      <li><strong>Usuario:</strong> ${data.username}</li>
                      <li><strong>Correo:</strong> ${data.email}</li>
                      <li><strong>Fecha de solicitud:</strong> ${data.request_date}</li>
                  </ul>
                  <div style="background:#f5f5f7;padding:18px 24px;border-radius:0;margin-bottom:30px;font-size:16px;color:#251870;">
                      <b>¿Por qué recibiste este correo?</b><br>
                      Alguien (posiblemente tú) solicitó restablecer la contraseña de tu cuenta. Si no fuiste tú, puedes ignorar este mensaje y tu contraseña permanecerá igual.<br>
                      Por seguridad, este enlace expirará en 1 hora.
                  </div>
                  <div style="text-align:left;margin:50px 0;">
                      <a href="${data.resetUrl}" style="background:#251870;color:white;padding:18px 40px;font-size:18px;font-weight:600;border:none;border-radius:0;text-decoration:none;display:inline-block;box-shadow:0 4px 20px rgba(37,24,112,0.18);font-family:'Poppins',Arial,sans-serif;">Cambiar mi contraseña</a>
                  </div>
                  <div style="margin-bottom:20px;"></div>
                  <div style="margin-top:80px;padding-top:30px;border-top:1px solid #e5e5e7;">
                      <p style="font-size:14px;color:#555;margin:0 0 10px 0;font-family:'Poppins',Arial,sans-serif;">¿Necesitas ayuda? Escríbenos a <a href="mailto:soporte@thewealthybridge.com" style="color:#251870;text-decoration:underline;font-family:'Poppins',Arial,sans-serif;">soporte@thewealthybridge.com</a></p>
                      <p style="font-size:14px;color:#86868b;line-height:1.6;margin:15px 0 15px 0;font-family:'Poppins',Arial,sans-serif;">Gracias por confiar en The Wealthy Bridge. ¡Te deseamos un excelente día!</p>
                      <div style="font-size:12px;color:#a1a1a6;line-height:1.5;margin-bottom:5px;font-family:'Poppins',Arial,sans-serif;">© 2024 The Wealthy Bridge. Todos los derechos reservados. Recibió este correo electrónico porque se registró en nuestra aplicación.</div>
                  </div>
              </div>
          </div>
      </body>
      </html>
    `;
    };

    // Función para obtener la plantilla de cuenta creada en Vantage
    const getVantageAccountCreatedTemplate = async (data) => {
        return `
      <div
          style="max-width:600px;margin:0 auto;padding:40px 30px;background:#f6f8fa;font-family:'Segoe UI',Arial,sans-serif;color:#222;">
          <table width="100%" cellpadding="0" cellspacing="0"
              style="background:white;border-radius:12px;box-shadow:0 2px 16px rgba(0,0,0,0.07);">
              <tr>
                  <td align="center" style="padding:32px 0 16px 0;">
                      <div style="text-align:center;margin-bottom:16px;">
                          <span style="display:inline-flex;align-items:center;gap:12px;">
                              <span
                                  style="font-size:36px;font-weight:bold;color:#4a5bbb;letter-spacing:-2px;font-family:'Poppins',Arial,sans-serif;">WB</span>
                              <span
                                  style="display:inline-block;width:2px;height:40px;background-color:#4a5bbb;margin:0 8px;"></span>
                              <span
                                  style="font-size:24px;font-weight:600;color:#4a5bbb;letter-spacing:-1px;font-family:'Poppins',Arial,sans-serif;">Wealthy
                                  Bridge</span>
                          </span>
                      </div>
                  </td>
              </tr>
              <tr>
                  <td style="padding:0 36px 10px 36px;">
                      <h2 style="font-size:2rem;font-weight:700;color:#303030;margin:0 0 8px 0;">Bienvenido a The Wealthy
                          Bridge</h2>
                      <p style="font-size:1.2rem;color:#4F5A68;margin:0 0 24px 0;">Hola, ${data.userName}.</p>
                      <p style="margin:0 0 24px 0;font-size:1rem;color:#495174;">
                          Desde The Wealthy Bridge, nos complace informarte que tu cuenta con el broker Vantage está casi
                          lista para ser activada.<br><br>
                          Para garantizar la seguridad de tu cuenta, hemos creado tu perfil, pero necesitarás restablecer tu
                          contraseña. Hazlo fácilmente desde el siguiente botón:
                      </p>
                      <div style="padding:16px 0;text-align:center;">
                          <a href="https://secure.vantagemarkets.com/forgetPassword"
                              style="display:inline-block;background:#251870;color:#fff;text-decoration:none;font-weight:700;font-size:1rem;border-radius:8px;padding:12px 32px;box-shadow:0 3px 9px rgba(0,0,0,0.09);">
                              Restablecer contraseña
                          </a>
                      </div>
                      <p style="margin:24px 0 0 0;font-size:1rem;color:#495174;">
                          Si tienes alguna duda o no reconoces esta acción, por favor contacta a nuestro soporte.
                      </p>
                  </td>
              </tr>
              <tr>
                  <td style="padding:0 36px 10px 36px;">
                      <p style="font-size:0.95rem;color:#4F5A68;margin:24px 0 0 0;">
                          Si no solicitaste la creación de esta cuenta, puedes ignorar este correo electrónico.
                      </p>
                      <p style="font-size:0.85rem;color:rgba(79,90,104,0.6);margin:12px 0 0 0;">
                          © 2024 The Wealthy Bridge. Todos los derechos reservados. Recibió este correo electrónico porque
                          está registrado en nuestra plataforma.
                      </p>
                  </td>
              </tr>
          </table>
      </div>
    `;
    };

    // Función para obtener la plantilla de cuenta creada
    const getAccountCreatedTemplate = async (data) => {
        return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenido a The Wealthy Bridge</title>
          <link href='https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap' rel='stylesheet'>
      </head>
      <body style="background-color:#f5f5f7;min-height:100vh;margin:0;padding:0;font-family:'Poppins',Arial,sans-serif;padding-top:40px;padding-bottom:40px;">
          <div style="max-width:600px;margin:40px auto 60px auto;background-color:#fff;border-radius:0;box-shadow:0 10px 30px rgba(0,0,0,0.08);overflow:hidden;">
              <div style="padding:60px 40px;">
                  <div style="text-align:center;margin-bottom:50px;">
                      <img src="https://hubee.app/image/cache/wkseller/8343/1740357355_ulYKF2r71t-cr-726x390.png" alt="The Wealthy Bridge" width="180" />
                  </div>
                  <div style="font-size:18px;color:#86868b;margin-bottom:8px;font-weight:400;font-family:'Poppins',Arial,sans-serif;">Hola <b>${data.username}</b>,</div>
                  <h1 style="font-size:32px;font-weight:700;color:#1d1d1f;margin-bottom:40px;line-height:1.1;font-family:'Poppins',Arial,sans-serif;">¡Bienvenido a The Wealthy Bridge!</h1>
                  <p style="font-size:18px;line-height:1.6;color:#251870;margin-bottom:18px;font-family:'Poppins',Arial,sans-serif;"><b>¡Felicidades, tu cuenta ha sido creada!</b></p>
                  <p style="font-size:18px;line-height:1.6;color:#424245;margin-bottom:18px;font-family:'Poppins',Arial,sans-serif;">Agradecemos mucho que te hayas sumado a nuestra comunidad. Estamos seguros de que te encantará aprender nuestras estrategias de trading que te harán ganar.</p>
                  <p style="font-size:18px;line-height:1.6;color:#424245;margin-bottom:30px;font-family:'Poppins',Arial,sans-serif;">Nuestro objetivo es enseñarte <span style='color:#4a5bbb;text-decoration:underline;font-weight:600;'>lo que realmente funciona</span>, mientras sigues pasos simples que te mantienen en <span style='font-weight:700;color:#1d1d1f;'>profit</span>, sin depender de tu experiencia o nivel de aprendizaje.</p>
                  <div style="text-align:left;margin:50px 0;">
                      <a href="https://admin.thewealthybridge.com/login" style="background:#251870;color:white;padding:18px 40px;font-size:18px;font-weight:600;border:none;border-radius:0;text-decoration:none;display:inline-block;box-shadow:0 4px 20px rgba(37,24,112,0.18);font-family:'Poppins',Arial,sans-serif;">Accede a tu cuenta</a>
                  </div>
                  <div style="margin-bottom:20px;"></div>
                  <div style="margin-top:80px;padding-top:30px;border-top:1px solid #e5e5e7;">
                      <p style="font-size:14px;color:#555;margin:0 0 10px 0;font-family:'Poppins',Arial,sans-serif;">¿Necesitas ayuda? Escríbenos a <a href="mailto:soporte@thewealthybridge.com" style="color:#251870;text-decoration:underline;font-family:'Poppins',Arial,sans-serif;">soporte@thewealthybridge.com</a></p>
                      <p style="font-size:14px;color:#86868b;line-height:1.6;margin:15px 0 15px 0;font-family:'Poppins',Arial,sans-serif;">Gracias por confiar en The Wealthy Bridge. ¡Te deseamos un excelente día!</p>
                      <div style="font-size:12px;color:#a1a1a6;line-height:1.5;margin-bottom:5px;font-family:'Poppins',Arial,sans-serif;">© 2024 The Wealthy Bridge. Todos los derechos reservados. Recibió este correo electrónico porque se registró en nuestra aplicación.</div>
                  </div>
              </div>
          </div>
      </body>
      </html>
    `;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center border-b p-4 bg-gray-50">
                    <h3 className="text-xl font-semibold text-gray-800">Vista previa de plantilla</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                            {error}
                        </div>
                    ) : (
                        <div
                            className="email-preview-container"
                            dangerouslySetInnerHTML={{ __html: templateHtml }}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="border-t p-4 flex justify-between items-center bg-gray-50">
                    <div className="text-sm text-gray-500">
                        Esta es una vista previa con datos de ejemplo. El email real incluirá los datos del destinatario.
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailTemplatePreview;