import membershipService from './membershipService.js';
import { courseService } from './courseService.js';

class PreloadService {
  constructor() {
    this.cache = new Map();
    this.loadingPromises = new Map();
    this.cacheTimestamps = new Map(); // Nuevo: timestamps para invalidación
    this.sessionCacheKeys = new Set(); // Nuevo: rastrear keys de la sesión actual
    this.defaultTTL = 30 * 60 * 1000; // Nuevo: 30 minutos por defecto
    this.persistentTTL = 2 * 60 * 60 * 1000; // Nuevo: 2 horas para datos críticos
  }

  // Nuevo: Configurar TTL específico por tipo de dato
  getTTL(dataType) {
    const ttlConfig = {
      'commission_tree': this.persistentTTL, // 2 horas para árbol de comisiones
      'membership': this.persistentTTL,      // 2 horas para membresía
      'network': this.persistentTTL,         // 2 horas para red
      'trading': this.defaultTTL,            // 30 min para trading (más volátil)
      'address': this.persistentTTL,         // 2 horas para dirección
      'courses': this.defaultTTL             // 30 min para cursos
    };
    return ttlConfig[dataType] || this.defaultTTL;
  }

  // Nuevo: Verificar si los datos están válidos (no expirados)
  isCacheValid(cacheKey) {
    if (!this.cache.has(cacheKey)) return false;
    
    const timestamp = this.cacheTimestamps.get(cacheKey);
    if (!timestamp) return false;

    // Extraer tipo de dato del cacheKey
    const dataType = cacheKey.split('_')[0];
    const ttl = this.getTTL(dataType);
    
    return (Date.now() - timestamp) < ttl;
  }

  // Nuevo: Establecer datos en cache con timestamp
  setCacheData(cacheKey, data, dataType = null) {
    this.cache.set(cacheKey, data);
    this.cacheTimestamps.set(cacheKey, Date.now());
    this.sessionCacheKeys.add(cacheKey);
    
    // Log detallado para debug
    const type = dataType || cacheKey.split('_')[0];
    const ttl = this.getTTL(type);
    console.log(`💾 PreloadService - Cached '${cacheKey}' with TTL: ${ttl/1000/60}min`);
  }

  // Precarga datos de membresía y XFactors (MEJORADO)
  async preloadMembershipData(userId, token) {
    const cacheKey = `membership_${userId}`;
    
    // Verificar cache válido primero
    if (this.isCacheValid(cacheKey)) {
      console.log('🎯 PreloadService - Using valid cached membership data');
      return this.cache.get(cacheKey);
    }

    // Si ya está cargando, retorna la promesa existente
    if (this.loadingPromises.has(cacheKey)) {
      console.log('⏳ PreloadService - Membership data already loading, waiting...');
      return this.loadingPromises.get(cacheKey);
    }

    // Inicia la carga
    console.log('📡 PreloadService - Fetching fresh membership data');
    const loadPromise = membershipService.getMembershipXFactors(userId, token)
      .then(data => {
        this.setCacheData(cacheKey, data, 'membership');
        this.loadingPromises.delete(cacheKey);
        console.log('✅ PreloadService - Membership data loaded and cached');
        return data;
      })
      .catch(error => {
        this.loadingPromises.delete(cacheKey);
        console.error('❌ PreloadService - Error loading membership data:', error);
        throw error;
      });

    this.loadingPromises.set(cacheKey, loadPromise);
    return loadPromise;
  }

  // Precarga datos del árbol de comisiones (MEJORADO)
  async preloadCommissionTreeData(userId) {
    const cacheKey = `commission_tree_${userId}`;
    
    // Verificar cache válido primero
    if (this.isCacheValid(cacheKey)) {
      console.log('🎯 PreloadService - Using valid cached commission tree data');
      return this.cache.get(cacheKey);
    }

    if (this.loadingPromises.has(cacheKey)) {
      console.log('⏳ PreloadService - Commission tree already loading, waiting...');
      return this.loadingPromises.get(cacheKey);
    }

    return console.log('📡 PreloadService - Fetching fresh commission tree data');
    
  }

  // Precarga datos de red del usuario (MEJORADO)
  async preloadNetworkData(userId) {
    const cacheKey = `network_${userId}`;
    
    if (this.isCacheValid(cacheKey)) {
      console.log('🎯 PreloadService - Using valid cached network data');
      return this.cache.get(cacheKey);
    }

    if (this.loadingPromises.has(cacheKey)) {
      console.log('⏳ PreloadService - Network data already loading, waiting...');
      return this.loadingPromises.get(cacheKey);
    }

    return '📡 PreloadService - Fetching fresh network data';
  }

  // Precarga dirección del usuario (MEJORADO)
  async preloadUserAddress(userId) {
    const cacheKey = `address_${userId}`;
    
    if (this.isCacheValid(cacheKey)) {
      console.log('🎯 PreloadService - Using valid cached address data');
      return this.cache.get(cacheKey);
    }

    if (this.loadingPromises.has(cacheKey)) {
      console.log('⏳ PreloadService - Address data already loading, waiting...');
      return this.loadingPromises.get(cacheKey);
    }

    return '📡 PreloadService - Fetching fresh address data';
  }

  // Precarga datos de trading del usuario (MEJORADO)
  async preloadTradingData(userId) {
    const cacheKey = `trading_${userId}`;
    
    if (this.isCacheValid(cacheKey)) {
      console.log('🎯 PreloadService - Using valid cached trading data');
      return this.cache.get(cacheKey);
    }

    if (this.loadingPromises.has(cacheKey)) {
      console.log('⏳ PreloadService - Trading data already loading, waiting...');
      return this.loadingPromises.get(cacheKey);
    }

    return  console.log('📡 PreloadService - Fetching fresh trading data');
  }

  // Precarga datos de cursos del usuario (MEJORADO)
  async preloadCoursesData(token) {
    const cacheKey = `courses_${token ? 'authenticated' : 'anonymous'}`;
    
    if (this.isCacheValid(cacheKey)) {
      console.log('🎯 PreloadService - Using valid cached courses data');
      return this.cache.get(cacheKey);
    }

    if (this.loadingPromises.has(cacheKey)) {
      console.log('⏳ PreloadService - Courses data already loading, waiting...');
      return this.loadingPromises.get(cacheKey);
    }

    console.log('📡 PreloadService - Fetching fresh courses data');
    const loadPromise = courseService.fetchCoursesWithProgress(token)
      .then(data => {
        this.setCacheData(cacheKey, data, 'courses');
        this.loadingPromises.delete(cacheKey);
        console.log('✅ PreloadService - Courses data loaded and cached');
        return data;
      })
      .catch(error => {
        this.loadingPromises.delete(cacheKey);
        console.error('❌ PreloadService - Error loading courses data:', error);
        throw error;
      });

    this.loadingPromises.set(cacheKey, loadPromise);
    return loadPromise;
  }

  // Obtiene datos del cache (MEJORADO con validación)
  getCachedData(key) {
    if (this.isCacheValid(key)) {
      return this.cache.get(key);
    }
    // Si no es válido, eliminarlo del cache
    this.invalidateCache(key);
    return null;
  }

  // Obtiene específicamente los datos del árbol del cache (MEJORADO)
  getCachedCommissionTreeData(userId) {
    const cacheKey = `commission_tree_${userId}`;
    return this.getCachedData(cacheKey);
  }

  // Verifica si los datos están en cache Y son válidos (MEJORADO)
  hasCachedData(key) {
    return this.isCacheValid(key);
  }

  // Verifica si los datos del árbol están en cache Y son válidos (MEJORADO)
  hasCachedCommissionTreeData(userId) {
    const cacheKey = `commission_tree_${userId}`;
    return this.isCacheValid(cacheKey);
  }

  // Nuevo: Invalidar cache específico
  invalidateCache(key) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
      this.sessionCacheKeys.delete(key);
      console.log(`🗑️ PreloadService - Invalidated cache for: ${key}`);
    }
  }

  // Nuevo: Invalidar cache por tipo
  invalidateCacheByType(dataType) {
    const keysToDelete = [];
    for (const key of this.sessionCacheKeys) {
      if (key.startsWith(`${dataType}_`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.invalidateCache(key));
    console.log(`🗑️ PreloadService - Invalidated ${keysToDelete.length} ${dataType} cache entries`);
  }

  // Nuevo: Refrescar datos específicos (forzar reload)
  async refreshData(dataType, userId, token = null) {
    console.log(`🔄 PreloadService - Force refreshing ${dataType} data`);
    
    // Invalidar cache existente
    this.invalidateCacheByType(dataType);
    
    // Recargar según el tipo
    switch (dataType) {
      case 'commission_tree':
        return this.preloadCommissionTreeData(userId);
      case 'membership':
        return this.preloadMembershipData(userId, token);
      case 'network':
        return this.preloadNetworkData(userId);
      case 'address':
        return this.preloadUserAddress(userId);
      case 'trading':
        return this.preloadTradingData(userId);
      case 'courses':
        return this.preloadCoursesData(token);
      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }
  }

  // Limpia el cache (útil para logout) - MEJORADO
  clearCache() {
    const cacheSize = this.cache.size;
    this.cache.clear();
    this.loadingPromises.clear();
    this.cacheTimestamps.clear();
    this.sessionCacheKeys.clear();
    console.log(`🧹 PreloadService - Cache cleared (${cacheSize} entries removed)`);
  }

  // Nuevo: Limpiar solo cache expirado
  cleanupExpiredCache() {
    let cleanedCount = 0;
    for (const key of this.sessionCacheKeys) {
      if (!this.isCacheValid(key)) {
        this.invalidateCache(key);
        cleanedCount++;
      }
    }
    if (cleanedCount > 0) {
      console.log(`🧹 PreloadService - Cleaned ${cleanedCount} expired cache entries`);
    }
  }

  // Nuevo: Obtener estadísticas del cache
  getCacheStats() {
    const stats = {
      totalEntries: this.cache.size,
      validEntries: 0,
      expiredEntries: 0,
      loadingPromises: this.loadingPromises.size,
      cacheTypes: {}
    };

    for (const key of this.sessionCacheKeys) {
      const dataType = key.split('_')[0];
      if (!stats.cacheTypes[dataType]) {
        stats.cacheTypes[dataType] = { valid: 0, expired: 0 };
      }

      if (this.isCacheValid(key)) {
        stats.validEntries++;
        stats.cacheTypes[dataType].valid++;
      } else {
        stats.expiredEntries++;
        stats.cacheTypes[dataType].expired++;
      }
    }

    return stats;
  }

  // Precarga todos los datos importantes para el usuario (MEJORADO)
  async preloadAllUserData(userId, token) {
    console.log('🚀 PreloadService - Starting comprehensive preload for user:', userId);
    
    // Limpiar cache expirado antes de empezar
    this.cleanupExpiredCache();
    
    try {
      // Verificar qué datos ya están en cache válido
      const cacheStatus = {
        membership: this.hasCachedData(`membership_${userId}`),
        commissionTree: this.hasCachedCommissionTreeData(userId),
        network: this.hasCachedData(`network_${userId}`),
        address: this.hasCachedData(`address_${userId}`),
        trading: this.hasCachedData(`trading_${userId}`),
        courses: this.hasCachedData(`courses_${token ? 'authenticated' : 'anonymous'}`)
      };

      console.log('📊 PreloadService - Cache status:', cacheStatus);

      // Solo precargar datos que no están en cache válido
      const promises = [];
      
      if (!cacheStatus.membership) {
        promises.push(this.preloadMembershipData(userId, token));
      }
      if (!cacheStatus.commissionTree) {
        promises.push(this.preloadCommissionTreeData(userId));
      }
      if (!cacheStatus.network) {
        promises.push(this.preloadNetworkData(userId));
      }
      if (!cacheStatus.address) {
        promises.push(this.preloadUserAddress(userId));
      }
      if (!cacheStatus.trading) {
        promises.push(this.preloadTradingData(userId));
      }
      if (!cacheStatus.courses) {
        promises.push(this.preloadCoursesData(token));
      }

      if (promises.length === 0) {
        console.log('✨ PreloadService - All data already cached and valid');
        return;
      }

      console.log(`📡 PreloadService - Loading ${promises.length} missing data sets...`);

      // Ejecutar precargas en paralelo sin bloquear
      Promise.allSettled(promises).then(results => {
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        console.log(`✅ PreloadService - Completed ${successCount}/${promises.length} preloads`);
        
        // Log específico para el árbol si se cargó
        if (!cacheStatus.commissionTree) {
          const treeResult = results.find((_, idx) => 
            promises[idx] === this.preloadCommissionTreeData(userId)
          );
          if (treeResult?.status === 'fulfilled') {
            console.log('🌳 PreloadService - Commission tree preloaded successfully');
          } else if (treeResult?.status === 'rejected') {
            console.log('❌ PreloadService - Commission tree preload failed:', treeResult.reason);
          }
        }

        // Mostrar estadísticas finales
        const finalStats = this.getCacheStats();
        console.log('📈 PreloadService - Final cache stats:', finalStats);
      });

    } catch (error) {
      console.error('❌ PreloadService - Error in preloadAllUserData:', error);
    }
  }
}

// Exporta una instancia singleton
const preloadService = new PreloadService();

// Nuevo: Cleanup automático cada 10 minutos
setInterval(() => {
  preloadService.cleanupExpiredCache();
}, 10 * 60 * 1000);

export default preloadService;