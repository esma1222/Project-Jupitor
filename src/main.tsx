import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Remove the one-time pass from the address bar, so a reload asks for the password again.
{
  const u = new URL(window.location.href);
  if (u.searchParams.has('k')) {
    u.searchParams.delete('k');
    window.history.replaceState(null, '', u.pathname + u.search + u.hash);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
