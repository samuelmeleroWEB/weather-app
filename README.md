# 🌤️ Weather Mood App

¡Bienvenido! Este es un proyecto que transforma la aburrida consulta del clima en una experiencia inmersiva y visual, proporcionando datos hiper-detallados, predicciones e imágenes adaptadas en tiempo real.

## 🚀 Tecnologías utilizadas
- **React 18** + **Vite**
- **TypeScript** (Tipado estricto transversal)
- **Tailwind CSS v4** (Diseño cristalino, responsivo y dinámico)
- **Framer Motion** (Animaciones fluidas de interfaz)
- **Múltiples APIs** (OpenWeatherMap, Open-Meteo, Unsplash, Nominatim)
- **Recharts** (Gráficos interactivos de predicción horaria)
- **Lucide React** (Iconografía)

## 💡 Características principales
- **UI Dinámica Multi-Sensorial:** El fondo, los colores y las recomendaciones cambian automáticamente basándose en la imagen real de la ciudad, el clima actual y la hora del día.
- **Predicción Detallada y Gráficos:** Sistema de predicción extendida de 7 días y gráficos horarios de temperatura.
- **Calidad del Clima:** Visualización de índice UV, calidad del aire, presión y visibilidad.
- **Máquina del Tiempo:** Capacidad para seleccionar un día en el futuro y previsualizar toda la UI con la estimación de ese día.
- **Persistencia Avanzada:** Sistema de 'Recientes' y 'Favoritos' enlazados a coordenadas geográficas persistidos en `localStorage`.
- **Buscador Preciso:** Recomendaciones en tiempo real y auto-completado vinculadas a la cartografía de España.
- **Dual Language:** Soporte integrado de traducción (Inglés/Español) y compatibilidad para buscar por localización GPS nativa.

## 🛠️ Instalación local
1. Clona el repo.
2. Instala dependencias: `npm install`
3. Crea un archivo `.env` en la raíz del proyecto.
4. Ejecuta: `npm run dev`

## ☁️ Despliegue en Vercel

Este proyecto está preparado para ser desplegado fácilmente en Vercel.

1. Inicia sesión en [Vercel](https://vercel.com/) y haz clic en **"Add New Project"**.
2. Importa este repositorio desde tu cuenta de GitHub.
3. En la sección de **"Environment Variables"**, **DEBES** añadir obligatoriamente estas claves antes de darle a *Deploy*:
   - `VITE_WEATHER_API_KEY` (Clave de OpenWeatherMap API)
   - `VITE_UNSPLASH_ACCESS_KEY` (Clave de acceso de Unsplash Developers API)
4. Haz clic en **Deploy** y espera unos segundos. ¡Tu aplicación estará viva en producción!

---
Desarrollado con ❤️ por Samuel Melero