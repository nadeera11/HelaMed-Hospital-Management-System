import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Bell, User, Search, LogOut, Sun, Moon, Settings, ShieldAlert 
} from 'lucide-react';

export function Header({
  currentPage,
  setCurrentPage,
  selectedPatientId,
  onLogout,
  theme,
  toggleTheme,
  onOpenCommandPalette
}) {
  const userRole = localStorage.getItem('user_role') || 'Admin';
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Extract user info
  const userInfo = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : { name: 'Admin', email: 'admin@helamed.lk', role: 'admin' };
  const userName = userInfo.name || 'Admin User';
  const userEmail = userInfo.email || 'admin@helamed.lk';
  
  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Dashboard'
      case 'patients':
        return 'Patient List'
      case 'patientRegistration':
        return 'Patient Registration'
      case 'patientProfile':
        return 'Patient Profile'
      case 'patientVisitHistory':
        return 'Visit History'
      case 'admissionDischarge':
        return 'Admission & Discharge'
      case 'clinicalDocuments':
        return 'Clinical Documents'
      case 'staffProfiles':
        return 'Staff Directory'
      case 'staffProfile':
        return 'Staff Profile'
      case 'staffForm':
        return 'Staff Form'
      case 'staffRoles':
        return 'Role Management'
      case 'scheduling':
        return 'Scheduling & Rosters'
      case 'leaveManagement':
        return 'Leave Management'
      case 'certifications':
        return 'Credential Management'
      case 'pendingOrders':
        return 'Pending Lab Orders'
      case 'specimenIntake':
        return 'Specimen Intake'
      case 'inProgress':
        return 'Tests In Progress'
      case 'resultEntry':
        return 'Result Entry'
      case 'verification':
        return 'Pending Verification'
      case 'labInventory':
        return 'Laboratory Inventory'
      case 'machineStatus':
        return 'Equipment Status'
      default:
        return 'Dashboard'
    }
  }

  const getNotificationColor = (type) => {
    switch(type) {
      case 'urgent': return 'text-rose-500 bg-rose-50 dark:bg-rose-950/30';
      case 'warning': return 'text-amber-500 bg-amber-50 dark:bg-amber-950/30';
      default: return 'text-blue-500 bg-blue-50 dark:bg-blue-950/30';
    }
  };

  const notifications = [
    { id: 1, title: 'Low Stock Alert', desc: 'Amoxicillin is below 10% safety threshold.', time: '5 mins ago', type: 'urgent' },
    { id: 2, title: 'Roster Updated', desc: 'Dr. Nadeera allocated to Emergency Ward.', time: '1 hr ago', type: 'info' },
    { id: 3, title: 'Lab Verification', desc: '2 Lab reports pending admin approval.', time: '2 hrs ago', type: 'warning' }
  ];
  
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/80 shadow-sm z-30 transition-colors duration-300">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 transition-colors">
            {getPageTitle()}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
            {selectedPatientId
              ? `Patient ID: ${selectedPatientId}`
              : 'Welcome to HelaMed Hospital Management System'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          
          {/* Interactive Search Bar Trigger */}
          <div 
            onClick={onOpenCommandPalette}
            className="relative cursor-pointer group"
          >
            <div className="flex items-center pl-10 pr-4 py-2 w-64 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm 
                        bg-slate-50 dark:bg-slate-800/60 shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:border-slate-300 dark:group-hover:border-slate-600">
              <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold">Search...</span>
            </div>
            <Search
              size={16}
              className="absolute left-3.5 top-2.5 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors duration-200"
            />

          </div>
          
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200/50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm text-slate-600 dark:text-slate-300"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun size={18} className="text-amber-400 hover:text-amber-500 hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon size={18} className="text-indigo-600 hover:text-indigo-700 hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>
          
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileDropdownOpen(false);
              }}
              className={`relative p-2 rounded-xl border border-slate-200/50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm group ${notificationsOpen ? 'bg-slate-100 dark:bg-slate-700 border-slate-300' : ''}`}
            >
              <Bell size={18} className="text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-600 rounded-full w-5 h-5 text-xxs text-white flex items-center justify-center font-bold shadow-md">
                3
              </span>
            </button>

            {/* Notifications Dropdown Drawer */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 glass-panel-heavy rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-800/80 p-2 z-50 animate-scale-in text-left">
                <div className="flex justify-between items-center px-3 py-2 border-b border-slate-200/50 dark:border-slate-800/50">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Alerts & Notifications</h3>
                  <span className="text-xxs text-blue-600 dark:text-blue-400 cursor-pointer font-semibold hover:underline">Mark all read</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/50 mt-1 max-h-64 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors duration-150 cursor-pointer flex space-x-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 w-8 h-8 flex items-center justify-center ${getNotificationColor(notif.type)}`}>
                        <ShieldAlert size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{notif.title}</p>
                        <p className="text-xxs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{notif.desc}</p>
                        <span className="text-xxs text-slate-400 dark:text-slate-500 block mt-1">{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* User Profile dropdown */}
          <div className="relative">
            <div 
              onClick={() => {
                setProfileDropdownOpen(!profileDropdownOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl p-1.5 pr-3 shadow-sm border border-slate-200/50 dark:border-slate-800 cursor-pointer transition-all duration-200 group hover:shadow-md"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-teal-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200">
                <User size={16} />
              </div>
              <div className="text-sm text-left">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name || 'Admin' : 'Admin'}
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-xxs font-medium capitalize mt-0.5">{userRole}</p>
              </div>
            </div>

            {/* Profile Actions Dropdown Overlay */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 glass-panel-heavy rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-800/80 p-1.5 z-50 animate-scale-in text-left">
                <div className="px-3 py-2 border-b border-slate-200/50 dark:border-slate-800/50 mb-1">
                  <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{userName}</p>
                  <p className="text-xxs text-slate-400 dark:text-slate-500 truncate">{userEmail}</p>
                </div>
                <button 
                  onClick={() => {
                    setCurrentPage?.('profileSettings');
                    setProfileDropdownOpen(false);
                  }}
                  className="flex items-center space-x-2.5 w-full px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors duration-150"
                >
                  <User size={14} className="text-slate-500" />
                  <span>My Profile</span>
                </button>
                <button 
                  onClick={() => {
                    setCurrentPage?.('accountSettings');
                    setProfileDropdownOpen(false);
                  }}
                  className="flex items-center space-x-2.5 w-full px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors duration-150"
                >
                  <Settings size={14} className="text-slate-500" />
                  <span>Account Settings</span>
                </button>
                <div className="h-px bg-slate-200/50 dark:bg-slate-800/50 my-1"></div>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-2.5 w-full px-3 py-2 text-xs font-bold rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors duration-150"
                >
                  <LogOut size={14} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  currentPage: PropTypes.string.isRequired,
  setCurrentPage: PropTypes.func,
  selectedPatientId: PropTypes.number,
  onLogout: PropTypes.func.isRequired,
  theme: PropTypes.string,
  toggleTheme: PropTypes.func,
  onOpenCommandPalette: PropTypes.func
};
