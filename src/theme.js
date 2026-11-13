import { useEffect } from 'react';

/** 'auto' | 'light' | 'dark' → <html class="dark"> + meta theme-color sync */
export function useTheme(theme) {
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const isDark = theme === 'dark' || (theme === 'auto' && mq.matches);
      document.documentElement.classList.toggle('dark', isDark);

      const color = isDark ? '#09090b' : '#f4f4f5';
      let meta = document.querySelector('meta[name="theme-color"]:not([media])');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'theme-color';
        document.head.appendChild(meta);
      }
      meta.content = color;
      document.querySelectorAll('meta[name="theme-color"][media]').forEach(m => m.remove());
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);
}
