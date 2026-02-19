import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DailyTasks from './pages/DailyTasks';
import Observations from './pages/Observations';
import History from './pages/History';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="daily" element={<DailyTasks />} />
            <Route path="observations" element={<Observations />} />
            <Route path="history" element={<History />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </HashRouter>
    </DataProvider>
  );
};

export default App;