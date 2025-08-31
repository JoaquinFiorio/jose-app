import React from 'react';
import { Users, AlertCircle, Info, CheckCircle } from 'lucide-react';

export default function CommissionTreeSimple({ graphData, loading, error }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px] bg-gray-50 rounded-lg">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Cargando datos de red...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[400px] bg-gray-50 rounded-lg">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-600 mb-2">Error al cargar</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <p className="text-sm text-slate-500">
            Esto puede deberse a problemas de conexión o que el servidor no esté disponible.
          </p>
        </div>
      </div>
    );
  }

  if (!graphData) {
    return (
      <div className="flex justify-center items-center h-[400px] bg-gray-50 rounded-lg">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <Info className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-blue-600 mb-2">Sin datos disponibles</h2>
          <p className="text-slate-600 mb-4">
            No hay datos de red disponibles para mostrar el árbol de comisiones.
          </p>
          <p className="text-sm text-slate-500">
            Esto puede indicar que aún no tienes referidos en tu red o que los datos no se han sincronizado.
          </p>
        </div>
      </div>
    );
  }

  // Calcular estadísticas
  let totalUsers = 0;
  let maxLevel = 0;
  let totalConnections = 0;
  let hasValidData = false;

  if (graphData.rootUser) {
    // Nueva estructura API
    totalUsers = (graphData.users ? graphData.users.length : 0) + 1; // +1 for rootUser
    maxLevel = Math.max(
      graphData.rootUser.level,
      ...(graphData.users ? graphData.users.map((u) => u.level) : [])
    );
    totalConnections = graphData.links ? graphData.links.length : 0;
    hasValidData = graphData.users && graphData.users.length > 0;
  } else if (graphData.users) {
    // Estructura antigua
    totalUsers = graphData.users.length;
    maxLevel = Math.max(...graphData.users.map((u) => u.level));
    totalConnections = graphData.links ? graphData.links.length : 0;
    hasValidData = graphData.users.length > 0;
  }

  // Si no hay datos válidos, mostrar mensaje informativo
  if (!hasValidData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Red de Comisiones Vacía</h2>
          <p className="text-gray-600">
            Aún no tienes referidos en tu red de comisiones.
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">¿Cómo funciona?</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Cuando alguien se registre usando tu código de referido, aparecerá aquí</li>
                <li>• Ganarás comisiones por las compras de tus referidos</li>
                <li>• Tu red se expandirá automáticamente a medida que crezca</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 border border-gray-200 text-center p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-400">0</div>
            <div className="text-sm text-gray-600">Total Usuarios</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 text-center p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-400">0</div>
            <div className="text-sm text-gray-600">Niveles</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 text-center p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-400">0</div>
            <div className="text-sm text-gray-600">Conexiones</div>
          </div>
        </div>
      </div>
    );
  }

  // Handle new API structure
  if (graphData.rootUser) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Datos de Red Disponibles
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 text-center p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalUsers}</div>
            <div className="text-sm text-blue-700">Total Usuarios</div>
          </div>
          <div className="bg-green-50 border border-green-200 text-center p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{maxLevel}</div>
            <div className="text-sm text-green-700">Niveles</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 text-center p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{totalConnections}</div>
            <div className="text-sm text-purple-700">Conexiones</div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold mb-3 text-gray-800">Usuario Raíz:</h4>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">{graphData.rootUser.userInfo.name}</p>
                <p className="text-sm text-gray-600">{graphData.rootUser.userInfo.email}</p>
                <p className="text-xs text-gray-500">ID: {graphData.rootUser.userInfo.uId}</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  Nivel {graphData.rootUser.level}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold mb-3 text-gray-800">
            Usuarios en Red ({graphData.users ? graphData.users.length : 0}):
          </h4>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {graphData.users && graphData.users.length > 0 ? (
              graphData.users.map((user, index) => (
                <div key={`${user.user_id}-${index}`} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{user.userInfo.name}</p>
                      <p className="text-sm text-gray-600">{user.userInfo.email}</p>
                      <p className="text-xs text-gray-500">ID: {user.userInfo.uId}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        Nivel {user.level}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {user.percentage}% comisión
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No hay usuarios adicionales en la red</p>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <p><strong>Total usuarios:</strong> {totalUsers}</p>
          <p><strong>Total enlaces:</strong> {totalConnections}</p>
          <p><strong>Nivel máximo:</strong> {maxLevel}</p>
        </div>
      </div>
    );
  }

  // Handle old API structure
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Datos de Red (Estructura Antigua)
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 text-center p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{totalUsers}</div>
          <div className="text-sm text-blue-700">Total Usuarios</div>
        </div>
        <div className="bg-green-50 border border-green-200 text-center p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{maxLevel}</div>
          <div className="text-sm text-green-700">Niveles</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 text-center p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{totalConnections}</div>
          <div className="text-sm text-purple-700">Conexiones</div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold mb-3 text-gray-800">
          Usuarios ({graphData.users ? graphData.users.length : 0}):
        </h4>
        <div className="max-h-60 overflow-y-auto space-y-2">
          {graphData.users && graphData.users.length > 0 ? (
            graphData.users.map((user, index) => (
              <div key={`${user.user_id}-${index}`} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{user.userInfo.name}</p>
                    <p className="text-sm text-gray-600">{user.userInfo.email}</p>
                    <p className="text-xs text-gray-500">ID: {user.userInfo.uId}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      Nivel {user.level}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {user.percentage}% comisión
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No hay usuarios en la red</p>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <p><strong>Total usuarios:</strong> {totalUsers}</p>
        <p><strong>Total enlaces:</strong> {totalConnections}</p>
        <p><strong>Nivel máximo:</strong> {maxLevel}</p>
      </div>
    </div>
  );
} 