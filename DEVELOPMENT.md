# Guía de Desarrollo para Smart Writer

Esta guía proporciona información para desarrolladores que deseen contribuir al proyecto Smart Writer o entender su arquitectura.

## Arquitectura del Proyecto

Smart Writer está dividido en varios componentes principales:

### 1. Aplicación Electron (electron/)
- **main.js**: Punto de entrada de la aplicación Electron, maneja la ventana principal, la bandeja del sistema y la comunicación IPC.
- **preload.js**: Script de precarga que proporciona API seguras para que el renderer process se comunique con el main process.
- **textMonitor.js**: Implementa el sistema de monitoreo global de texto a nivel del sistema operativo.

### 2. Interfaz de Usuario (client/src/)
- **components/**: Componentes React para la interfaz de usuario.
  - **layout/**: Componentes de estructura como AppLayout y Sidebar.
  - **correction/**: Componentes específicos para las funcionalidades de corrección y sugerencia.
  - **ui/**: Componentes de UI reutilizables (shadcn/ui).
- **hooks/**: Hooks personalizados de React.
- **lib/**: Funciones de utilidad y configuración.
- **pages/**: Páginas/rutas principales de la aplicación.

### 3. Servidor de Procesamiento (server/)
- **index.ts**: Punto de entrada del servidor.
- **routes.ts**: Define las rutas de la API.
- **services/**: Servicios para análisis de texto, integración con OpenAI, etc.

## Desarrollo de Características

### Monitores de Texto Global

Para implementar la funcionalidad central de captura de texto a nivel del sistema operativo, se necesitan implementaciones específicas para cada plataforma:

#### Windows
Para capturar texto en Windows, es necesario utilizar la API de Windows para hooks de teclado (Windows Hooks API). Esto se puede implementar usando Node.js FFI (Foreign Function Interface) para interactuar con las bibliotecas nativas del sistema.

```javascript
// Ejemplo simplificado de implementación para Windows
const ffi = require('ffi-napi');
const ref = require('ref-napi');

// Definir las estructuras y funciones de la API de Windows
const user32 = ffi.Library('user32', {
  SetWindowsHookExA: ['pointer', ['int', 'pointer', 'pointer', 'uint']],
  UnhookWindowsHookEx: ['bool', ['pointer']],
  // ...más definiciones
});

// Implementar el hook de teclado
// ...
```

#### macOS
En macOS, se puede utilizar la API de Accessibility o la API de Eventos de Bajo Nivel para capturar eventos de teclado.

```javascript
// Ejemplo simplificado de implementación para macOS
const objc = require('objc');
const CoreFoundation = objc.framework('CoreFoundation');
const ApplicationServices = objc.framework('ApplicationServices');

// Configurar el monitoreo de eventos
// ...
```

#### Linux
En Linux, se puede utilizar la biblioteca X11 o herramientas específicas como `libinput` para capturar eventos de teclado.

```javascript
// Ejemplo simplificado de implementación para Linux
const x11 = require('x11');

x11.createClient((err, display) => {
  // Configurar captura de eventos de teclado
  // ...
});
```

### Integración con OpenAI

La integración con OpenAI se realiza a través de la API oficial, y está implementada en `server/services/openai.ts`. Para modificar o mejorar esta integración:

1. Actualiza el modelo utilizado (actualmente gpt-4o).
2. Ajusta los prompts para mejorar la calidad de las correcciones.
3. Implementa caché para reducir el consumo de API y mejorar la velocidad.

### Añadir Aplicaciones Excluidas

El sistema de exclusión de aplicaciones está implementado mediante:

1. Una lista de exclusiones en el almacenamiento de configuración (`electron-store`).
2. Detección de la aplicación activa en cada plataforma:
   - Windows: Usando `GetForegroundWindow` y `GetWindowThreadProcessId`.
   - macOS: Usando `NSWorkspace.sharedWorkspace().activeApplication()`.
   - Linux: Depende de la implementación del gestor de ventanas.

## Configuración del Entorno de Desarrollo

### Prerequisitos

- Node.js 20+
- NPM 8+
- Dependencias de desarrollo para compilación nativa:
  - Windows: Visual Studio Build Tools
  - macOS: Xcode Command Line Tools
  - Linux: build-essential, libx11-dev, etc.

### Configuración

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/smart-writer.git
   cd smart-writer
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Ejecuta en modo desarrollo:
   ```bash
   # Terminal 1: Inicia el servidor de desarrollo web
   npm run dev
   
   # Terminal 2: Inicia la aplicación Electron
   NODE_ENV=development electron electron/main.js
   ```

## Pruebas

### Pruebas Unitarias

Ejecuta las pruebas unitarias con:

```bash
npm test
```

### Pruebas Manuales

Para probar la funcionalidad de monitoreo global, usa el modo de simulación incorporado:

1. Abre la aplicación en modo desarrollo.
2. Utiliza la consola DevTools de Electron para enviar mensajes IPC simulados:
   ```javascript
   // Simular texto escrito
   electron.ipcRenderer.invoke('simulate-typing', {
     text: 'Este es un texto con errores como teh y taht.',
     application: 'Microsoft Word'
   });
   ```

## Empaquetado y Distribución

Para crear paquetes instalables:

```bash
# Construir la aplicación web
npm run build

# Crear paquetes de instalación
npx electron-builder
```

Los archivos de instalación se crearán en la carpeta `release/` en formatos específicos para cada plataforma.

## Directrices de Contribución

1. Crea un fork del repositorio.
2. Crea una rama para tu característica: `git checkout -b feature/mi-nueva-caracteristica`.
3. Realiza cambios siguiendo el estilo de código del proyecto.
4. Asegúrate de que las pruebas pasen.
5. Envía un Pull Request con una descripción detallada de los cambios.