import React, { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Calendar,
  User,
  Crown,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Tipos de datos
const CommissionTree = ({ commissionData = [] }) => {
  const [groupedData, setGroupedData] = useState([]);
  const [totalCommissions, setTotalCommissions] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [upline, setUpline] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});

  // Función para agrupar datos por comprador
  const groupByPurchaser = (data) => {
    const grouped = data.reduce((acc, item) => {
      const key = item.purchaser?.uId;
      if (!key) return acc;
      
      if (!acc[key]) {
        acc[key] = {
          purchaser: item.purchaser,
          level: item.level,
          upline: item.upline,
          purchases: [],
          totalAmount: 0,
          totalCommission: 0,
        };
      }
      acc[key].purchases.push(item);
      acc[key].totalAmount += item.purchase?.amount || 0;
      acc[key].totalCommission += item.commission || 0;
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => a.level - b.level);
  };

  // Función para obtener color por nivel
  const getLevelColor = (level) => {
    const colors = {
      1: "bg-blue-500",
      2: "bg-orange-500",
      3: "bg-purple-500",
    };
    return colors[level] || "bg-gray-500";
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Función para traducir tipo de compra
  const translatePurchaseType = (type) => {
    const translations = {
      'Membership': 'Membresía',
      'XFactor': 'XFactor'
    };
    return translations[type] || type;
  };

  // Función para alternar expansión de tarjetas
  const toggleCardExpansion = (purchaserId) => {
    setExpandedCards(prev => ({
      ...prev,
      [purchaserId]: !prev[purchaserId]
    }));
  };

  useEffect(() => {
    if (commissionData && commissionData.length > 0) {
      const grouped = groupByPurchaser(commissionData);
      setGroupedData(grouped);
      
      const totalComms = commissionData.reduce((sum, item) => sum + (item.commission || 0), 0);
      const totalSalesAmount = commissionData.reduce((sum, item) => sum + (item.purchase?.amount || 0), 0);
      
      setTotalCommissions(totalComms);
      setTotalSales(totalSalesAmount);
      setUpline(commissionData[0]?.upline);
    }
  }, [commissionData]);

  if (!commissionData || commissionData.length === 0) {
    return (
      <div className="w-full min-h-screen bg-zinc-100 flex justify-center items-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Sin datos de comisiones</h2>
          <p className="text-slate-600">No hay datos de comisiones disponibles para mostrar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-zinc-100 overflow-y-auto">
      <div className="px-6 py-5">
        {/* Header */}
        <div className="border-b border-zinc-200 pb-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            <h1 className="text-indigo-950 text-2xl font-bold flex-shrink-0">Árbol de comisiones</h1>
          </div>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-5 bg-white rounded-[5px] shadow-[0_8px_24px_rgba(0,0,0,0.07)] border border-zinc-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-zinc-800 text-sm font-semibold">Upline principal</div>
              <Crown className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-indigo-950 text-lg font-bold">{upline?.name || 'N/A'}</div>
            <div className="text-sm text-zinc-500 mt-1">{upline?.uId || 'N/A'}</div>
          </div>

          <div className="p-5 bg-white rounded-[5px] shadow-[0_8px_24px_rgba(0,0,0,0.07)] border border-zinc-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-zinc-800 text-sm font-semibold">Total compradores</div>
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-indigo-950 text-3xl font-extrabold">{groupedData.length}</div>
            <div className="text-sm text-zinc-500 mt-1">En la red</div>
          </div>

          <div className="p-5 bg-white rounded-[5px] shadow-[0_8px_24px_rgba(0,0,0,0.07)] border border-zinc-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-zinc-800 text-sm font-semibold">Ventas totales</div>
              <ShoppingCart className="w-6 h-6 text-orange-500" />
            </div>
            <div className="text-indigo-950 text-3xl font-extrabold">${totalSales.toFixed(2)}</div>
            <div className="text-sm text-zinc-500 mt-1">Acumulado</div>
          </div>

          <div className="p-5 bg-white rounded-[5px] shadow-[0_8px_24px_rgba(0,0,0,0.07)] border border-zinc-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-zinc-800 text-sm font-semibold">Comisiones totales</div>
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-indigo-950 text-3xl font-extrabold">${totalCommissions.toFixed(4)}</div>
            <div className="text-sm text-zinc-500 mt-1">Generadas</div>
          </div>
        </div>

        {/* Árbol de la red */}
        <div className="space-y-8">
          {/* Upline Principal */}
          <div className="flex justify-center">
            <div className="w-full max-w-md p-6 bg-white rounded-[5px] shadow-[0_8px_24px_rgba(0,0,0,0.07)] border-2 border-green-200 bg-green-50">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4">
                  👑
                </div>
                <h3 className="text-green-800 text-xl font-bold mb-2">{upline?.name || 'N/A'}</h3>
                <p className="text-green-700 text-sm mb-3">{upline?.uId || 'N/A'}</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  UPLINE PRINCIPAL
                </span>
              </div>
            </div>
          </div>

          {/* Línea conectora */}
          <div className="flex justify-center">
            <div className="w-px h-12 bg-gray-300"></div>
          </div>

          {/* Niveles de la red */}
          {[1, 2, 3].map((level) => {
            const levelData = groupedData.filter((item) => item.level === level);
            if (levelData.length === 0) return null;

            return (
              <div key={level} className="space-y-4">
                {/* Título del nivel */}
                <div className="flex justify-center">
                  <span className={`inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold text-white ${getLevelColor(level)}`}>
                    NIVEL {level} - {level === 1 ? 15 : level === 2 ? 5 : 4}% Comisión
                  </span>
                </div>

                {/* Compradores del nivel */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {levelData.map((buyer) => (
                    <div key={buyer.purchaser.uId} className="bg-white rounded-[5px] shadow-[0_8px_24px_rgba(0,0,0,0.07)] border border-zinc-200 overflow-hidden">
                      {/* Header de la tarjeta */}
                      <div className="p-4 border-b border-zinc-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-8 h-8 ${getLevelColor(level)} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                            {level}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg text-gray-800">{buyer.purchaser.name}</h4>
                            <p className="text-sm text-gray-600">{buyer.purchaser.uId}</p>
                          </div>
                        </div>

                        {/* Resumen del comprador */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <ShoppingCart className="h-4 w-4 text-blue-600" />
                            <span className="text-gray-600">Total:</span>
                            <span className="font-semibold">${buyer.totalAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-gray-600">Comisión:</span>
                            <span className="font-semibold">${buyer.totalCommission.toFixed(4)}</span>
                          </div>
                        </div>

                        {/* Botón para expandir/contraer */}
                        <button
                          onClick={() => toggleCardExpansion(buyer.purchaser.uId)}
                          className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {expandedCards[buyer.purchaser.uId] ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              Ocultar detalles
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              Ver detalles
                            </>
                          )}
                        </button>
                      </div>

                      {/* Detalles de compras (expandible) */}
                      {expandedCards[buyer.purchaser.uId] && (
                        <div className="p-4 bg-gray-50">
                          <h5 className="font-semibold text-sm text-gray-800 mb-3">Compras Realizadas:</h5>
                          <div className="space-y-3">
                            {buyer.purchases.map((purchase, purchaseIndex) => (
                              <div key={purchaseIndex} className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                      purchase.purchase?.type === "Membership" 
                                        ? "bg-blue-100 text-blue-700 border border-blue-200" 
                                        : "bg-purple-100 text-purple-700 border border-purple-200"
                                    }`}>
                                      {translatePurchaseType(purchase.purchase?.type || 'N/A')}
                                    </span>
                                    <p className="font-medium text-sm mt-1">{purchase.purchase?.productName || 'N/A'}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-lg">${purchase.purchase?.amount?.toFixed(2) || '0.00'}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(purchase.purchase?.date)}
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-gray-600">Porcentaje:</span>
                                    <span className="font-semibold ml-1">{((purchase.percentage || 0) * 100).toFixed(0)}%</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Comisión:</span>
                                    <span className="font-semibold ml-1 text-green-600">
                                      ${(purchase.commission || 0).toFixed(4)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Fee:</span>
                                    <span className="font-semibold ml-1 text-red-600">
                                      ${(purchase.feeAmount || 0).toFixed(4)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Original:</span>
                                    <span className="font-semibold ml-1">${(purchase.originalCommission || 0).toFixed(4)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Línea conectora para el siguiente nivel */}
                {level < 3 && levelData.length > 0 && (
                  <div className="flex justify-center">
                    <div className="w-px h-12 bg-gray-300"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CommissionTree; 