
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useEquipment } from '@/contexts/EquipmentContext';
import NotificationDropdown from '@/components/notification/NotificationDropdown';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { getUnreadNotificationsForUser } = useEquipment();
  
  const unreadNotifications = user ? getUnreadNotificationsForUser(user.id).length : 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', roles: ['logistics_staff', 'nurse', 'manager'] },
    { name: 'Equipment', path: '/equipment', roles: ['logistics_staff', 'nurse', 'manager'] },
    { name: 'Add Equipment', path: '/equipment/add', roles: ['logistics_staff'] },
    { name: 'Requests', path: '/requests', roles: ['logistics_staff', 'nurse', 'manager'] },
    { name: 'Reports', path: '/reports', roles: ['logistics_staff', 'manager'] },
    { name: 'Categories', path: '/categories', roles: ['manager'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    hasRole(item.roles as any[])
  );

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-20">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition-transform duration-300 ease-in-out
        fixed lg:relative z-10 w-64 h-full bg-white border-r border-gray-200 shadow-sm
      `}>
        <div className="p-4 border-b">
          <h1 className="font-bold text-lg">Hospital Equipment System</h1>
        </div>
        
        <div className="p-4">
          {user && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-600 capitalize">{user.role.replace('_', ' ')}</p>
              <p className="text-xs text-gray-500">{user.department}</p>
            </div>
          )}
          
          <nav className="space-y-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center px-3 py-2 rounded-md text-sm
                  ${isActive(item.path)
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-lg font-medium">
              {/* Dynamic page title based on route */}
              {location.pathname === '/dashboard' && 'Dashboard'}
              {location.pathname === '/equipment' && 'Equipment Management'}
              {location.pathname === '/equipment/add' && 'Add New Equipment'}
              {location.pathname === '/requests' && 'Equipment Requests'}
              {location.pathname === '/reports' && 'Reports'}
              {location.pathname === '/categories' && 'Equipment Categories'}
              {location.pathname.startsWith('/equipment/') && location.pathname !== '/equipment/add' && 'Equipment Details'}
            </h2>
            
            <div className="flex items-center space-x-2">
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </Button>
                
                {notificationsOpen && (
                  <NotificationDropdown 
                    onClose={() => setNotificationsOpen(false)} 
                  />
                )}
              </div>
              
              {/* Settings */}
              <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
                <Settings className="h-5 w-5" />
              </Button>
              
              {/* Logout */}
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
