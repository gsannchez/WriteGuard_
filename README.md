# Smart Writer - Asistente de Escritura Inteligente

![Smart Writer](public/assets/icon.svg)

Smart Writer es un asistente de escritura inteligente que funciona en segundo plano a nivel del sistema operativo, proporcionando corrección ortográfica, gramatical y sugerencias de texto en tiempo real en cualquier aplicación donde escribas.

## Características

### 🧠 Asistente en Segundo Plano
- **Corrección automática**: Detecta errores ortográficos y gramaticales mientras escribes en cualquier aplicación
- **Sugerencias contextuales**: Muestra menús desplegables con correcciones cuando se detecta un error
- **Autocompletado inteligente**: Sugiere completar frases basándose en el contexto de lo que estás escribiendo

### ⚙️ Personalización Completa
- **Panel de control**: Configura el comportamiento del asistente según tus preferencias
- **Exclusión de aplicaciones**: Define aplicaciones donde no deseas que el asistente actúe
- **Soporte multilingüe**: Compatible con varios idiomas

### 📊 Estadísticas y Análisis
- **Seguimiento de correcciones**: Visualiza cuántas correcciones has aplicado
- **Tiempo ahorrado**: Estimación del tiempo que has ahorrado gracias al asistente
- **Aplicaciones más usadas**: Análisis de dónde utilizas más el asistente

### 🔒 Privacidad y Control
- **Procesamiento local**: Opción para procesar texto localmente sin enviar datos a servicios externos
- **Control de datos**: Decide si deseas o no almacenar el historial de correcciones

## Tecnologías Utilizadas

- **Electron**: Framework para crear aplicaciones de escritorio multiplataforma
- **React + TypeScript**: Para la interfaz de usuario
- **Tailwind CSS + shadcn/ui**: Para el diseño y componentes
- **OpenAI API**: Potencia el análisis de texto y sugerencias inteligentes

## Compatibilidad

Smart Writer es compatible con:
- Windows 10/11
- macOS 11+
- Linux (Ubuntu, Debian, Fedora)

## Instalación

Consulta las instrucciones detalladas en [INSTALL.md](INSTALL.md)

## Uso

Una vez instalado, Smart Writer se ejecuta automáticamente en segundo plano. Un ícono en la bandeja del sistema te permite acceder al panel de configuración y estadísticas. 

Cuando escribas en cualquier aplicación, Smart Writer detectará errores y mostrará sugerencias de corrección en pequeños menús emergentes no intrusivos.

## Configuración

Abre el panel de configuración desde el ícono de la bandeja del sistema para personalizar:

- Tipos de correcciones (ortográficas, gramaticales, autocomplete)
- Idioma de las correcciones
- Aplicaciones excluidas
- Opciones de privacidad y arranque

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.