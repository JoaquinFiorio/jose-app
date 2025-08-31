export const rejectApiError = (data_api_error: any) => {
    const { statusCode, message } = data_api_error;
    // console.log('statusCode', statusCode);

    if (statusCode === 401) {
        localStorage.removeItem('token');
        window.location.reload();
        return 'No tienes autorización o la sesión ha expirado';
    }

    if (message) return message;

    if (statusCode === 204) {
        return 'No se pudo continuar (Sin contenido)';

    } else if (statusCode === 400) {
        return 'No se pudo continuar (Solicitud Incorrecta)';

    } else if (statusCode === 403) {
        return 'No tienes los permisos necesarios';

    } else if (statusCode === 404) {
        return 'No se encontró lo que haz solicitado';

    } else if (statusCode === 405) {
        return 'El método es inválido';

    } else if (statusCode === 408) {
        return 'No se pudo continuar ya que se agotó el tiempo estimado. Intenta nuevamente';

    } else if (statusCode === 415) {
        return 'No se pudo continuar (Tipo de media no soportado)';

    } else if (statusCode === 429) {
        return 'No se pudo continuar (Muchas peticiones)';

    } else if (statusCode === 500) {
        return 'Ocurrió un error interno en el servidor. Intenta nuevamente';

    } else if (statusCode === 502) {
        return 'La ruta es incorrecta';

    } else if (statusCode === 508) {
        return 'Se detecto un ciclo';

    } else {
        return 'No se pudo procesar la petición';
    }
}