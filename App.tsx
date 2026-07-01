import React, { useState } from 'react';
import Sidebar, { PageType } from './components/Sidebar';
import HomePage from './pages/HomePage';
import AIEmployeesPage from './pages/AIEmployeesPage';
import SkillsPage from './pages/SkillsPage';
import LibraryPage from './pages/LibraryPage';
import SettingsPage from './pages/SettingsPage';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<PageType>('home');

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'ai-employees':
        return <AIEmployeesPage />;
      case 'skills':
        return <SkillsPage />;
      case 'library':
        return <LibraryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="h-screen w-screen flex bg-[#050505] text-white overflow-hidden">
      <Sidebar activePage={activePage} onPageChange={setActivePage} />
      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
