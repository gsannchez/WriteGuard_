// Check if the user prefers dark mode
export function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'light';
  
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
}

// Set the theme on the document
export function setDocumentTheme(theme: 'dark' | 'light'): void {
  if (typeof window === 'undefined') return;
  
  const root = window.document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

// Get the saved theme from localStorage
export function getSavedTheme(): 'dark' | 'light' | null {
  if (typeof window === 'undefined') return null;
  
  const theme = localStorage.getItem('theme');
  if (theme === 'dark' || theme === 'light') {
    return theme;
  }
  
  return null;
}

// Save the theme to localStorage
export function saveTheme(theme: 'dark' | 'light'): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('theme', theme);
}
