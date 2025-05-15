# Scripts para Electron

Para ejecutar la aplicación como una aplicación de escritorio, usa estos comandos desde la terminal:

## Desarrollo con Electron
```
NODE_ENV=development electron electron/main.js
```

## Construir la aplicación con electron-builder
```
npm run build && electron-builder
```

## Iniciar la aplicación Electron (después de construir)
```
electron electron/main.js
```