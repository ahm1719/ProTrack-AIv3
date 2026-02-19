import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Eye, Calendar, Settings, Menu, Search, Wifi, WifiOff } from 'lucide-react';
import { useData } from '../context/DataContext';

const SidebarLink = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        isActive
          ? 'bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
      }`
    }
  >
    <Icon size={20} className="transition-transform group-hover:scale-110" />
    <span className="font-medium">{label}</span>
  </NavLink>
);

const Layout: React.FC = () => {
  const { isOffline, tasks, observations } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  // Simple Global Search Filter (Visual only for the overlay)
  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="flex h-screen bg-background text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-slate-800 flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800/50">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
            ProTrackAI
          </h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Execution System</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink to="/daily" icon={CheckSquare} label="Daily Tasks" />
          <SidebarLink to="/observations" icon={Eye} label="Observations" />
          <SidebarLink to="/history" icon={Calendar} label="History & Calendar" />
          <SidebarLink to="/settings" icon={Settings} label="Settings" />
        </nav>

        <div className="p-4 border-t border-slate-800/50">
           <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium ${isOffline ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
             {isOffline ? <WifiOff size={14} /> : <Wifi size={14} />}
             <span>{isOffline ? 'Offline Mode' : 'System Online'}</span>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-surface/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
           <div className="md:hidden">
             <Menu className="text-slate-400" />
           </div>
           
           <h2 className="text-lg font-semibold text-slate-200 capitalize hidden md:block">
             {location.pathname === '/' ? 'Mission Control' : location.pathname.replace('/', '').replace('-', ' ')}
           </h2>

           <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="flex items-center space-x-2 bg-slate-900 border border-slate-700 hover:border-primary/50 transition-colors px-4 py-2 rounded-full text-sm text-slate-400 w-64">
                  <Search size={16} />
                  <span>Search (Ctrl + F)</span>
                </button>
              </div>
           </div>
        </header>

        {/* Search Overlay */}
        {isSearchOpen && (
          <div className="absolute top-16 right-6 w-96 bg-surface border border-slate-700 shadow-2xl rounded-xl z-50 p-4 animate-in fade-in slide-in-from-top-2">
            <input 
              autoFocus
              type="text" 
              placeholder="Global Search..." 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-slate-500 font-semibold uppercase">Tasks</p>
                {filteredTasks.length === 0 && <p className="text-sm text-slate-500 italic">No results found</p>}
                {filteredTasks.map(task => (
                  <div key={task.id} className="p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 cursor-pointer border border-transparent hover:border-primary/30 transition-all">
                    <p className="text-sm font-medium text-slate-200 truncate">{task.title}</p>
                    <p className="text-xs text-slate-500 flex justify-between mt-1">
                      <span>{task.displayId}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] ${task.status === 'Done' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'}`}>{task.status}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Click outside to close search */}
        {isSearchOpen && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsSearchOpen(false)} />}

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;