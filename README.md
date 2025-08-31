# The Wealthy Bridge Users

Una aplicación web moderna construida con React y Vite que proporciona un panel de control completo para gestionar actividades de trading, perfiles de usuario y operaciones financieras.

## 🚀 Características

- **Autenticación y Autorización de Usuarios**
  - Sistema seguro de inicio de sesión y registro
  - Control de acceso basado en roles
  - Sistema de activación de cuenta

- **Panel de Control y Análisis**
  - Panel interactivo con métricas clave
  - Calculadora de trading
  - Análisis X-Factor
  - Seguimiento de WB Profit

- **Gestión Financiera**
  - Procesamiento de pagos
  - Gestión de Productos
  - Seguimiento de incentivos
  - Historial detallado de pagos

- **Gestión de Usuarios**
  - Perfiles de usuario
  - Detalles y edición de usuarios
  - Gestión de permisos

- **Características Adicionales**
  - Cursos de trading
  - Sistema de soporte
  - Seguimiento de incentivos diarios
  - Capacidades de exportación de datos

## 🛠️ Tecnologías

- **Framework Frontend**: React 19
- **Herramienta de Construcción**: Vite 6
- **Estilos**: TailwindCSS 4
- **Enrutamiento**: React Router DOM 7
- **Gráficos**: Chart.js & React-Chartjs-2
- **Iconos**: FontAwesome, Heroicons, Lucide React
- **Manejo de Fechas**: date-fns
- **Cliente HTTP**: Axios
- **Notificaciones**: React-Toastify
- **Exportación de Datos**: XLSX

## 📦 Instalación

1. Clonar el repositorio:
```bash
git clone [url-del-repositorio]
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

4. Construir para producción:
```bash
npm run build
```

## 🔧 Scripts Disponibles

- `npm run dev` - Iniciar servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Vista previa de la construcción de producción
- `npm run lint` - Ejecutar ESLint

## 🔐 Variables de Entorno

Crear un archivo `.env` en el directorio raíz con las siguientes variables:

```env
VITE_API_URL=tu_url_api
VITE_APP_NAME=The Wealthy Bridge
```

## 📁 Estructura del Proyecto

```
src/
├── assets/         # Archivos estáticos
├── components/     # Componentes reutilizables
├── context/        # Proveedores de contexto React
├── layouts/        # Componentes de diseño
├── pages/          # Componentes de página
├── services/       # Servicios de API
└── App.jsx         # Componente principal de la aplicación
```

## 🤝 Contribución

1. Haz un fork del repositorio
2. Crea tu rama de características (`git checkout -b feature/caracteristica`)
3. Haz commit de tus cambios (`git commit -m 'Añadir alguna característica'`)
4. Haz push a la rama (`git push origin feature/caracteristica`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es software propietario. Todos los derechos reservados.

## 👥 Soporte

Para soporte, por favor utiliza el sistema de soporte dentro de la aplicación o contacta al equipo de desarrollo.
