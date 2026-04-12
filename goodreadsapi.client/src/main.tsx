import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { hydrateCatalogFromApi } from './services/api/catalog';
import { preferencesStore } from './services/storage/preferencesStore';
import './styles/global.css';
import './styles/components.css';
import './styles/pages.css';

const bootAppSettings = preferencesStore.getAppSettings();
document.documentElement.dataset.density = bootAppSettings.appearance.density;
document.documentElement.dataset.reduceMotion = bootAppSettings.appearance.reduceMotion
  ? 'true'
  : 'false';

const renderApp = () => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
};

const bootstrap = async () => {
  try {
    const result = await hydrateCatalogFromApi();

    if (result.source === 'remote') {
      console.info(`[catalog] Loaded ${result.count} books from backend API.`);
    } else {
      console.info(`[catalog] Using seeded data (${result.reason}).`);
    }
  } catch (caughtError) {
    console.warn('[catalog] Falling back to seeded data.', caughtError);
  } finally {
    renderApp();
  }
};

void bootstrap();
