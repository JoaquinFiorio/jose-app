const API_URL = "https://twb-api.e72qzf.easypanel.host/api/v1" || 'http://localhost:3000/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  return {
    'Authorization': `Bearer ${token}`
  };
};

export const courseService = {
  // Fetch all courses
  fetchCourses: async () => {
    try {
      const response = await fetch(`${API_URL}/courses`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Error al cargar los cursos");
      }

      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  },

  fetchCoursesActive: async () => {
    try {
      const response = await fetch(`${API_URL}/courses/active`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Error al cargar los cursos");
      }

      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  },

  // Create a new course
  createCourse: async (formData, materials, modules) => {
    try {
      const formDataToSend = new FormData();

      // Add basic course data
      Object.keys(formData).forEach((key) => {
        if (key === 'categories') {
          // Enviar categorías como JSON
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add materials
      const materialsData = materials.map((material) => ({
        name: material.name,
        description: material.description,
      }));
      formDataToSend.append("materialsData", JSON.stringify(materialsData));
      materials.forEach((material) => {
        if (material.file) {
          formDataToSend.append("materials", material.file);
        }
      });

      // Add modules
      const modulesData = modules.map((module) => ({
        title: module.title,
        description: module.description,
        order: module.order,
        vimeoUrl: module.parsedVimeoUrl || null, // URL de Vimeo procesada
        isVimeoUrl: !!module.parsedVimeoUrl, // Flag para indicar si es Vimeo
        isContainer: module.isContainer || false,
        subModules: module.isContainer ? module.subModules.map((subModule, subIndex) => ({
          title: subModule.title,
          description: subModule.description,
          order: subModule.order || subIndex + 1,
          vimeoUrl: subModule.parsedVimeoUrl || null,
          isVimeoUrl: !!subModule.parsedVimeoUrl
        })) : []
      }));
      
      console.log('📤 Enviando modulesData al backend:', JSON.stringify(modulesData, null, 2));
      formDataToSend.append("modulesData", JSON.stringify(modulesData));
      
      // Add module files (for individual modules)
      modules.forEach((module) => {
        if (!module.isContainer && module.file) {
          formDataToSend.append("modules", module.file);
        }
      });
      
      // Add submodule files (for container modules)
      let subModuleFilesCount = 0;
      modules.forEach((module) => {
        if (module.isContainer && module.subModules) {
          module.subModules.forEach((subModule) => {
            if (subModule.file) {
              console.log('📎 Agregando archivo de submódulo:', subModule.file.name);
              formDataToSend.append("subModules", subModule.file);
              subModuleFilesCount++;
            }
          });
        }
      });
      console.log(`📂 Total archivos de submódulos: ${subModuleFilesCount}`);

      const response = await fetch(`${API_URL}/courses`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear el curso");
      }

      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  },

  // Fetch course detail by ID
  fetchCourseDetail: async (courseId) => {
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Error al cargar los detalles del curso");
      }

      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  },

  // Update course by ID
  updateCourse: async (courseId, courseData) => {
    try {
      const token = localStorage.getItem("token");
      
      // Determinar si es FormData o JSON
      const isFormData = courseData instanceof FormData;
      
      const requestOptions = {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      if (isFormData) {
        // Para FormData, no establecer Content-Type (el navegador lo hace automáticamente)
        requestOptions.body = courseData;
      } else {
        // Para JSON, establecer Content-Type y stringify
        requestOptions.headers["Content-Type"] = "application/json";
        requestOptions.body = JSON.stringify(courseData);
      }
      
      const response = await fetch(`${API_URL}/courses/${courseId}`, requestOptions);
      
      if (!response.ok) {
        throw new Error("Error al guardar los cambios");
      }
      return await response.json();
    } catch (error) {
      console.error("Error al actualizar el curso:", error);
      throw error;
    }
  },

  // Fetch recent courses with progress
  fetchRecentCoursesWithProgress: async (token) => {
    try {
      const response = await fetch(`${API_URL}/courses/active`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Get all courses (not filtering by progress here)
      const filteredCourses = data;
      
      // Fetch progress for each course
      const progressPromises = filteredCourses.map(async (course) => {
        try {
          const progressResponse = await fetch(
            `${API_URL}/courses/${course._id}/progress`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            return {
              ...course,
              progress: progressData.progressPercentage || 0,
            };
          }
          return { ...course, progress: 0 };
        } catch (error) {
          console.error(
            `Error fetching progress for course ${course._id}:`,
            error
          );
          return { ...course, progress: 0 };
        }
      });
      const coursesWithProgress = await Promise.all(progressPromises);
      
      // Return ALL courses with progress, let the component decide what to show
      return coursesWithProgress;
    } catch (error) {
      console.error("Error fetching recent courses:", error);
      throw error;
    }
  },

  // Fetch all courses with progress map
  fetchCoursesWithProgress: async (token) => {
    try {
      const response = await fetch(`${API_URL}/courses/active`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const filteredCourses = data;
      // Fetch progress for each course
      const progressPromises = filteredCourses.map(async (course) => {
        try {
          const progressResponse = await fetch(
            `${API_URL}/courses/${course._id}/progress`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            return { courseId: course._id, progress: progressData };
          }
          return { courseId: course._id, progress: { progressPercentage: 0 } };
        } catch (error) {
          console.error(
            `Error fetching progress for course ${course._id}:`,
            error
          );
          return { courseId: course._id, progress: { progressPercentage: 0 } };
        }
      });
      const progressResults = await Promise.all(progressPromises);
      const progressMap = progressResults.reduce(
        (acc, { courseId, progress }) => {
          acc[courseId] = progress;
          return acc;
        },
        {}
      );
      return { courses: filteredCourses, progressMap };
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }
  },

  // Fetch course detail and progress by ID
  fetchCourseDetailWithProgress: async (courseId, token) => {
    try {
      // Get course detail
      const courseResponse = await fetch(`${API_URL}/courses/${courseId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!courseResponse.ok) {
        throw new Error(`HTTP error! status: ${courseResponse.status}`);
      }
      const course = await courseResponse.json();
      // Get course progress
      const progressResponse = await fetch(
        `${API_URL}/courses/${courseId}/progress`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      let progress = null;
      if (progressResponse.ok) {
        progress = await progressResponse.json();
      }
      return { course, progress };
    } catch (error) {
      console.error("Error fetching course detail or progress:", error);
      throw error;
    }
  },

  // Mark module as completed
  markModuleAsCompleted: async (courseId, moduleId, userId, token) => {
    try {
      const response = await fetch(
        `${API_URL}/courses/${courseId}/modules/${moduleId}/complete`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }
      // Get updated progress
      const progressResponse = await fetch(
        `${API_URL}/courses/${courseId}/progress`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (progressResponse.ok) {
        return await progressResponse.json();
      }
      throw new Error(
        "No se pudo actualizar el progreso después de completar el módulo"
      );
    } catch (error) {
      console.error("Error marking module as completed:", error);
      throw error;
    }
  },

  // Delete course by ID
  deleteCourse: async (courseId) => {
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al eliminar el curso");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting course:", error);
      throw error;
    }
  },

  // Add module to course
  addModule: async (courseId, formData) => {
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}/module`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al agregar el módulo");
      }

      return await response.json();
    } catch (error) {
      console.error("Error adding module:", error);
      throw error;
    }
  },

  // Update module
  updateModule: async (courseId, moduleId, formData) => {
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}/module/${moduleId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al actualizar el módulo");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating module:", error);
      throw error;
    }
  },

  // Delete module
  deleteModule: async (courseId, moduleId) => {
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}/module/${moduleId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al eliminar el módulo");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting module:", error);
      throw error;
    }
  },

  // Add material to course
  addMaterial: async (courseId, formData) => {
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}/material`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al agregar el material");
      }

      return await response.json();
    } catch (error) {
      console.error("Error adding material:", error);
      throw error;
    }
  },

  // Update material
  updateMaterial: async (courseId, materialId, formData) => {
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}/material/${materialId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al actualizar el material");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating material:", error);
      throw error;
    }
  },

  // Delete material
  deleteMaterial: async (courseId, materialId) => {
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}/material/${materialId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al eliminar el material");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting material:", error);
      throw error;
    }
  },

  // Nuevas funciones para módulos padre y submódulos
  // Update parent module (only title and description)
  updateParentModule: async (courseId, moduleId, data) => {
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}/module/${moduleId}/parent`, {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al actualizar el módulo padre");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating parent module:", error);
      throw error;
    }
  },

  // Update submodule
  updateSubModule: async (courseId, moduleId, subModuleIndex, formData) => {
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}/module/${moduleId}/submodule/${subModuleIndex}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al actualizar el submódulo");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating submodule:", error);
      throw error;
    }
  },

  // Delete submodule
  deleteSubModule: async (courseId, moduleId, subModuleIndex) => {
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}/module/${moduleId}/submodule/${subModuleIndex}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al eliminar el submódulo");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting submodule:", error);
      throw error;
    }
  },

  // Add submodule to existing module
  addSubModule: async (courseId, moduleId, formData) => {
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}/module/${moduleId}/submodule`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al agregar el submódulo");
      }

      return await response.json();
    } catch (error) {
      console.error("Error adding submodule:", error);
      throw error;
    }
  },
}; 