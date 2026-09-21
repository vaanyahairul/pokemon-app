# Pokémon Tools - Aplicación Reorganizada

## 📁 Estructura del Proyecto

```
pokemon-app/
├── assets/
│   └── images/           # Imágenes (sprites, iconos, trainer)
├── css/
│   ├── components/       # CSS específico por componente
│   │   ├── team-builder.css
│   │   ├── pokedex.css
│   │   ├── type-calculator.css
│   │   └── damage-calculator.css
│   └── main.css         # Estilos base y globales
├── js/
│   ├── core/            # Funcionalidad central
│   │   ├── constants.js # Constantes y configuración
│   │   └── cache.js     # Sistema de cache
│   ├── components/      # Componentes específicos
│   │   ├── pokedex.js   # Lógica del Pokédex
│   │   ├── type-calculator.js # Calculadora de tipos
│   │   └── damage-calculator.js # Calculadora de daño
│   └── main.js          # JavaScript principal (Team Builder)
├── pages/
│   ├── index.html       # Página principal
│   ├── team-builder.html # Constructor de equipos
│   ├── pokedex.html     # Pokédex completa
│   ├── type-calculator.html # Tabla de tipos
│   └── damage-calculator.html # Calculadora de daño
├── teams/
│   └── teams.txt        # Archivo de equipos (Showdown format)
└── README.md
```

## 🚀 Funcionalidades

### Página Principal (index.html)
- Navegación centralizada
- Acceso directo a todas las herramientas
- Diseño responsive

### Constructor de Equipos (team-builder.html)
- **Múltiples equipos**: Crea y gestiona equipos ilimitados
- **Configuración completa por Pokémon**:
  - Nivel, naturaleza, habilidad
  - EVs/IVs personalizables con sliders
  - 4 movimientos con autocompletado inteligente
  - **Movimientos personalizados**: Modo especial para ataques no legales
  - Objetos equipados con autocompletado
  - Sprites intercambiables (normal/shiny/frontal/trasero)
- **Análisis avanzado del equipo**:
  - Cobertura ofensiva por tipos
  - Debilidades y resistencias detalladas
  - Distribución de ataques
  - Comparación de tamaños con entrenador (1.75m)
- **Funciones avanzadas**:
  - Drag & drop para reordenar Pokémon
  - Slots de comparación adicionales
  - Vista compacta expandible/contraíble
  - Equipo aleatorio generado automáticamente
- **Import/Export completo**:
  - Formato JSON nativo
  - Sincronización con Pokémon Showdown
  - Carga desde archivo teams.txt

### Pokédex Completa (pokedex.html)
- **Vista tradicional**: Lista vertical como una Pokédex clásica
- **Base de datos completa**: 1000+ Pokémon hasta Gen 9
- **Búsqueda avanzada**: Por nombre, número o características
- **Filtros inteligentes**: Generación, tipo, estadísticas
- **Información completa**:
  - Estadísticas base con barras visuales
  - Habilidades con descripciones detalladas
  - Movimientos organizados por método de aprendizaje
  - Sprites normales y shiny intercambiables
  - Cadena evolutiva interactiva
  - Comparación visual de tamaños
- **Integración**: Transferencia directa al constructor de equipos

### Tabla de Tipos (type-calculator.html)
- **Calculadora de efectividades**: Analiza combinaciones de tipos
- **Análisis defensivo completo**:
  - Debilidades (x2, x4)
  - Resistencias (x0.5, x0.25)
  - Inmunidades (x0)
- **Matriz interactiva**: Tabla completa de efectividades tipo vs tipo
- **Ejemplos de Pokémon**: Lista de Pokémon por cada combinación de tipos
- **Interfaz intuitiva**: Selectores de tipo 1 y tipo 2 opcionales
- **Visualización clara**: Códigos de color para identificar efectividades

### Calculadora de Daño (damage-calculator.html)
- **Atacante vs Defensor**: Configura dos Pokémon con búsqueda por autocompletado
- **Configuración por combatiente**:
  - Nivel (1-100)
  - Naturaleza (afecta la estadística correspondiente)
  - EVs (0-252) e IVs (0-31) de la estadística relevante
- **Selección de movimiento**: Desde el movepool real del atacante (PokéAPI)
- **Fórmula transparente**: Muestra cada paso del cálculo con los valores reales
  - Estadística de ataque y de defensa
  - HP del defensor
  - Daño base
  - STAB (bonus por tipo propio, ×1.5)
  - Efectividad de tipo (con desglose por tipo defensor)
  - Variación aleatoria (roll 85%-100%)
- **Resultado claro**: Rango de daño, porcentaje de HP y estimación de KO
- **Reutiliza la fórmula oficial** de estadísticas y la tabla de tipos del constructor

## 🛠️ Tecnologías

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con Flexbox/Grid
- **JavaScript ES6+**: Funcionalidad interactiva
- **PokéAPI**: Datos en tiempo real
- **Cache inteligente**: Optimización de rendimiento

## 📱 Responsive Design

La aplicación está optimizada para:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🎯 Características Técnicas

### Optimizaciones
- Cache de datos para reducir llamadas a la API
- Carga lazy de imágenes
- Búsqueda con debounce
- Manejo de errores robusto

### Accesibilidad
- Navegación por teclado
- Contraste adecuado
- Textos alternativos
- Estructura semántica

## 🔧 Instalación

1. Descargar o clonar el proyecto
2. Abrir `pages/index.html` en un navegador web
3. ¡Listo para usar!

No requiere instalación de dependencias ni servidor web.

## 📊 Datos

- **Pokémon**: 1010+ (hasta Generación 9)
- **Movimientos**: Base de datos completa
- **Habilidades**: Descripciones en inglés
- **Tipos**: 18 tipos con efectividades

## 🎮 Uso

1. **Inicio**: Navega desde la página principal
2. **Equipo**: Busca Pokémon, configúralos y analiza tu equipo
3. **Pokédex**: Explora información detallada de cualquier Pokémon
4. **Tipos**: Calcula efectividades y analiza combinaciones de tipos
5. **Daño**: Calcula el daño entre dos Pokémon y entiende la fórmula paso a paso
6. **Comparación**: Usa los slots adicionales para comparar Pokémon

## 🔄 Mejoras de la Reorganización

### Antes
- Archivos mezclados en una carpeta
- CSS y JS monolíticos
- Difícil mantenimiento
- Sin separación de responsabilidades

### Después
- Estructura modular organizada
- Componentes separados
- Fácil escalabilidad
- Código mantenible
- Mejor rendimiento

## 🚀 Funcionalidad Mantenida

✅ Toda la funcionalidad original se mantiene intacta
✅ Misma experiencia de usuario
✅ Compatibilidad completa
✅ Rendimiento mejorado

---

**Desarrollado con ❤️ para entrenadores Pokémon**