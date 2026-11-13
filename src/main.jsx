import '@fontsource-variable/outfit';
import './index.css';
import { createRoot } from 'react-dom/client';
import { ready } from './config';
import App, { loadState } from './App';
import Admin from './Admin';
import { useTheme } from './theme';
import { initAnalytics } from './analytics';

const isAdmin = location.pathname.replace(/\/+$/, '') === '/admin';
if (!isAdmin) {
  initAnalytics();
}

function AdminRoot() {
  useTheme(loadState().theme);
  return <Admin />;
}

ready.then(() => {
  createRoot(document.getElementById('root')).render(isAdmin ? <AdminRoot /> : <App />);
});

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
