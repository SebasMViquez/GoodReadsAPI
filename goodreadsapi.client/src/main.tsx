import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { preferencesStore } from './services/storage/preferencesStore';
import './styles/global.css';
import './styles/components.css';
import './styles/pages.css';

const bootAppSettings = preferencesStore.getAppSettings();
document.documentElement.dataset.density = bootAppSettings.appearance.density;
document.documentElement.dataset.reduceMotion = bootAppSettings.appearance.reduceMotion
  ? 'true'
  : 'false';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
