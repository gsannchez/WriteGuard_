/**
 * Configuración para electron-builder
 * Este archivo define cómo se empaqueta la aplicación para distribución
 */

const path = require('path');
const fs = require('fs');
const packageJson = require('../../package.json');

// Configuración de electron-builder
module.exports = {
  appId: 'com.escritura.inteligente',
  productName: 'Asistente de Escritura Inteligente',
  copyright: `Copyright © ${new Date().getFullYear()} [Empresa]`,
  
  // Directorios
  directories: {
    output: 'dist-electron',
    buildResources: 'assets'
  },
  
  // Archivos a incluir en el empaquetado
  files: [
    'dist/**/*',
    'assets/**/*',
    'electron/**/*',
    'node_modules/**/*',
    '!node_modules/**/*.{ts,map}',
    '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj,c,h,cc,cpp}',
    'package.json'
  ],
  
  // Configuración específica por plataforma
  mac: {
    category: 'public.app-category.productivity',
    target: ['dmg', 'zip'],
    icon: 'assets/icons/icon.icns',
    hardenedRuntime: true,
    gatekeeperAssess: false,
    darkModeSupport: true
  },
  dmg: {
    background: 'assets/dmg-background.png',
    icon: 'assets/icons/icon.icns',
    iconSize: 128,
    contents: [
      {
        x: 130,
        y: 220
      },
      {
        x: 410,
        y: 220,
        type: 'link',
        path: '/Applications'
      }
    ],
    window: {
      width: 540,
      height: 380
    }
  },
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64', 'ia32']
      },
      {
        target: 'portable',
        arch: ['x64']
      }
    ],
    icon: 'assets/icons/icon.ico'
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Asistente de Escritura',
    uninstallDisplayName: 'Desinstalar Asistente de Escritura'
  },
  linux: {
    target: ['AppImage', 'deb', 'rpm'],
    category: 'Utility',
    icon: 'assets/icons/icon.png',
    description: 'Asistente de escritura inteligente con corrección en tiempo real'
  },
  
  // Actualizaciones automáticas
  publish: {
    provider: 'github',
    owner: 'tuorganizacion',
    repo: 'asistente-escritura',
    releaseType: 'release'
  },
  
  // Post-empaquetado
  afterPack: async (context) => {
    console.log('Empaquetado completado');
  },
  
  // Post-construcción
  afterAllArtifactBuild: async (buildResult) => {
    console.log('Todos los artefactos construidos:', buildResult.artifactPaths);
    return buildResult;
  },
  
  // Configuración de firma (es necesario configurar las variables de entorno)
  // Para macOS: CSC_LINK, CSC_KEY_PASSWORD
  // Para Windows: CSC_LINK, CSC_KEY_PASSWORD o WIN_CSC_LINK, WIN_CSC_KEY_PASSWORD
  
  // Verificar actualizaciones automáticamente
  // Esto le indica a Electron que verifique actualizaciones al iniciar
  extraMetadata: {
    main: "electron/main.js",
    build: {
      appId: 'com.escritura.inteligente',
      productName: 'Asistente de Escritura Inteligente'
    }
  }
};