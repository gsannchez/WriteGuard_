# Smart Writer - Instalación

Este documento contiene las instrucciones para instalar y ejecutar la aplicación Smart Writer como una aplicación de escritorio.

## Requerimientos

- Node.js 20 o superior
- NPM 8 o superior
- Una clave de API de OpenAI

## Pasos para la instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/smart-writer.git
cd smart-writer
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```
OPENAI_API_KEY=tu_clave_api_openai
```

### 4. Construir la aplicación

```bash
# Primero, construye la aplicación web
npm run build

# Luego, construye la aplicación de escritorio
npx electron-builder
```

La aplicación construida estará disponible en la carpeta `release` en los siguientes formatos:

- Windows: archivo .exe (instalador NSIS)
- macOS: archivo .dmg
- Linux: archivos .AppImage y .deb

### 5. Ejecutar la aplicación en modo desarrollo

Si deseas ejecutar la aplicación en modo desarrollo:

```bash
# Inicia el servidor de desarrollo para la interfaz web
npm run dev

# En otra terminal, inicia Electron apuntando al servidor de desarrollo
NODE_ENV=development electron electron/main.js
```

## Uso

Una vez instalada, la aplicación Smart Writer:

1. Se ejecutará en segundo plano y estará accesible desde el ícono en la bandeja del sistema.
2. Monitoreará el texto que escribes en cualquier aplicación.
3. Te ofrecerá correcciones ortográficas y gramaticales, así como sugerencias de autocompletado en tiempo real.

## Configuración

Puedes personalizar Smart Writer a través del panel de configuración que se abre al hacer clic en el ícono de la bandeja del sistema:

- Habilitar/deshabilitar diferentes tipos de correcciones
- Configurar el idioma
- Establecer aplicaciones excluidas donde no se desea la asistencia
- Ajustar opciones de privacidad y arranque

## Combinaciones de teclas

- **Ctrl+Shift+Espacio**: Mostrar/ocultar la ventana principal de configuración