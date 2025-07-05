import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Home,
  Users,
  Settings,
  BarChart3,
  User,
  LogOut,
  ChevronDown,
  Bell,
  Search,
  User2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/',
      show: 'employee'
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      path: '/employees',
      show: 'admin',
      submenu: [
        { label: 'All Employees', path: '/employees', show: 'admin' },
        { label: 'Add Employee', path: '/employees/add', show: 'admin' },
        { label: 'Employee Reports', path: '/employees/reports', show: 'admin' }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: '/analytics',
      show: 'admin',
      submenu: [
        { label: 'Performance', path: '/analytics/performance', show: 'admin' },
        { label: 'Attendance', path: '/analytics/attendance', show: 'admin' },
        { label: 'Salary Reports', path: '/analytics/salary', show: 'admin' }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings',
      show: 'admin'
    }
  ];

  const toggleDropdown = (itemId: string) => {
    setActiveDropdown(activeDropdown === itemId ? null : itemId);
  };

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    if (item.show === 'employee') return true; // Show to everyone
    if (item.show === 'admin' && user?.employee?.role === 'ADMIN') return true; // Show to admin only
    return false;
  });

  // Filter submenu items based on user role
  const getFilteredSubmenu = (submenu: any[]) => {
    return submenu?.filter(subItem => {
      if (subItem.show === 'employee') return true;
      if (subItem.show === 'admin' && user?.employee?.role === 'ADMIN') return true;
      return false;
    }) || [];
  };

  return (
    <div className="h bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 z-50 h-full w-70 bg-white shadow-2xl"
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EmployeeHub
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredMenuItems.map((item) => (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => item.submenu ? toggleDropdown(item.id) : navigate(item.path)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={20} className="text-gray-500 group-hover:text-blue-600" />
                    <span className="text-gray-700 group-hover:text-blue-600">{item.label}</span>
                  </div>
                  {item.submenu && (
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform ${activeDropdown === item.id ? 'rotate-180' : ''
                        }`}
                    />
                  )}
                </button>

                {/* Submenu */}
                <AnimatePresence>
                  {item.submenu && activeDropdown === item.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-8 space-y-1"
                    >
                      {getFilteredSubmenu(item.submenu).map((subItem) => (
                        <button
                          key={subItem.path}
                          onClick={() => navigate(subItem.path)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          {subItem.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* User Profile */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{user?.employee?.email}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.employee?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          {/* <div className=""> */}
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Menu size={20} />
                </button>

                {/* Horizontal Navigation Bar (desktop only, with dropdowns for submenus) */}
                <nav className="hidden lg:flex w-full h-16 bg-white shadow-sm border-b border-gray-200 items-center px-8 relative z-20">
                  <div className="flex h-16 items-center justify-between  border-b border-gray-200">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      EmployeeHub
                    </h1>
                  </div>
                  {filteredMenuItems.map((item) => (
                    <div key={item.id} className="relative group h-full flex items-center">
                      <button
                        onClick={() => {
                          if (!item.submenu) navigate(item.path);
                        }}
                        className="flex flex-row items-center h-full px-6 text-sm font-medium text-gray-700 hover:text-blue-600 focus:outline-none group-hover:text-blue-600 transition-colors"
                        type="button"
                      >
                        <item.icon size={20} className="mr-2" />
                        <span>{item.label}</span>
                        {item.submenu && (
                          <svg className="w-3 h-3 ml-1 inline-block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        )}
                      </button>
                      {item.submenu && (
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 mt-2 min-w-[180px] bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-30">
                          <div className="py-2">
                            {getFilteredSubmenu(item.submenu).map((subItem) => (
                              <button
                                key={subItem.path}
                                onClick={() => navigate(subItem.path)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              >
                                {subItem.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </div>

              <div className="flex items-center space-x-4">
                {/* Search */}
                {/* <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div> */}

                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
                <div className="relative">
                  <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors" onClick={toggleUserDropdown}>
                    <User2 size={20} />
                    <span className=" rounded-full"></span>
                  </button>
                  
                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                      >
                        <div className="p-4">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <User size={20} className="text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user?.employee?.email}</p>
                              <p className="text-xs text-gray-500 capitalize">{user?.employee?.role}</p>
                            </div>
                          </div>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <LogOut size={16} />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          {/* </div> */}
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;