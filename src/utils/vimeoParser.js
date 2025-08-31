// Función para extraer URL de Vimeo desde diferentes formatos de entrada
export const parseVimeoInput = (input) => {
  if (!input) return null;

  // Limpiar espacios y saltos de línea
  const cleanInput = input.trim();

  // Si es código embed HTML completo
  if (cleanInput.includes('<iframe') && cleanInput.includes('player.vimeo.com')) {
    // Extraer URL del iframe usando regex
    const srcMatch = cleanInput.match(/src="([^"]*player\.vimeo\.com[^"]*)"/);
    if (srcMatch) {
      // Decodificar entidades HTML como &amp;
      return srcMatch[1].replace(/&amp;/g, '&');
    }
  }
  
  // Si es solo URL de Vimeo
  if (cleanInput.includes('player.vimeo.com')) {
    return cleanInput;
  }
  
  return null;
};

// Función para generar iframe responsivo de Vimeo con parámetros mejorados
export const generateVimeoIframe = (vimeoUrl, title = "Video del curso") => {
  if (!vimeoUrl || !vimeoUrl.includes('player.vimeo.com')) {
    return null;
  }
  
  // Agregar parámetros para eliminar completamente recomendaciones y pantalla final sin reiniciar
  const separator = vimeoUrl.includes('?') ? '&' : '?';
  const enhancedUrl = `${vimeoUrl}${separator}dnt=1&quality=auto&responsive=1&autopause=0&background=0&byline=0&portrait=0&title=0&badge=0&color=ffffff&muted=0&controls=1&pip=0&sidedock=0&transparent=0&speed=0&texttrack=0&outro=nothing&playsinline=1&end_screen=0&interactive=0&cards=0&cta=0`;
  
  return `
    <div style="padding:56.25% 0 0 0;position:relative;" id="vimeo-player-container">
      <iframe 
        src="${enhancedUrl}" 
        frameborder="0" 
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" 
        style="position:absolute;top:0;left:0;width:100%;height:100%;" 
        title="${title}"
        id="vimeo-player-iframe"
        webkitallowfullscreen
        mozallowfullscreen
        allowfullscreen>
      </iframe>
    </div>
  `;
};

// Función para validar si una URL es de Vimeo
export const isVimeoUrl = (url) => {
  return url && url.includes('player.vimeo.com');
};

// Función para extraer ID del video de Vimeo
export const extractVimeoVideoId = (url) => {
  if (!url) return null;
  
  const match = url.match(/video\/(\d+)/);
  return match ? match[1] : null;
};

// Función para generar URL de Vimeo con configuración de privacidad más abierta
export const generatePublicVimeoUrl = (videoId) => {
  if (!videoId) return null;
  
  // URL con parámetros que intentan ser más permisivos
  return `https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0&app_id=58479&dnt=1&quality=auto`;
};

// Función para diagnosticar problemas de Vimeo
export const diagnoseVimeoError = (vimeoUrl) => {
  const videoId = extractVimeoVideoId(vimeoUrl);
  
  return {
    videoId,
    originalUrl: vimeoUrl,
    publicUrl: generatePublicVimeoUrl(videoId),
    issues: [
      'El video puede estar configurado como privado en Vimeo',
      'Puede haber restricciones de dominio configuradas',
      'El embedding puede estar deshabilitado',
      'Verificar configuración de privacidad en la cuenta de Vimeo'
    ],
    solutions: [
      'En Vimeo: Ir a Settings → Privacy → cambiar a "Anyone" o "Hide from Vimeo"',
      'En Vimeo: En "Where can this be embedded?" seleccionar "Anywhere"',
      'Verificar que la cuenta de Vimeo permita embedding',
      'Contactar al propietario del video para cambiar configuraciones'
    ]
  };
}; 