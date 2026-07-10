import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Dashboard } from './Dashboard';
import { StaffDirectory } from './StaffDirectory';
import { StaffForm } from './StaffForm';
import RolesAndDepartments from './RolesAndDepartments';
import ShiftScheduling from './ShiftScheduling';
import LeaveManagement from './LeaveManagement';
import Certifications from './Certifications';
import PatientList from './PatientList';
import PatientRegistrationForm from './PatientRegistrationForm';
import { PharmacistDashboard, PharmacyItemForm } from '../Pharmacy';
import SupplierDashboard from '../Pharmacy/SupplierDashboard';
import PharmacyReports from '../Pharmacy/PharmacyReports';
import PharmacistPrescriptions from '../Pharmacy/PharmacistPrescriptions';
import UserProfile from './UserProfile';
import AccountSettings from './AccountSettings';


function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userRole, setUserRole] = useState('admin');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedPharmacyItem, setSelectedPharmacyItem] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    // Sync theme class to documentElement
    const root = document.documentElement;
    root.classList.add('theme-transition');
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
    
    // Clean up transition class after a short delay to keep general performance crisp
    const timer = setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 300);
    return () => clearTimeout(timer);
  }, [theme]);

  // Listener for Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commandItems = [
    { category: 'Navigation', label: 'Go to Dashboard Overview', action: () => setCurrentPage('dashboard'), icon: '📊' },
    { category: 'Navigation', label: 'View Patient Directory', action: () => setCurrentPage('patients'), icon: '👥' },
    { category: 'Navigation', label: 'Register New Patient', action: () => setCurrentPage('patientRegistration'), icon: '➕' },
    { category: 'Navigation', label: 'View Staff & Doctors Directory', action: () => setCurrentPage('staffProfiles'), icon: '🩺' },
    { category: 'Navigation', label: 'Manage Shift Rosters', action: () => setCurrentPage('scheduling'), icon: '📅' },
    { category: 'Navigation', label: 'Pharmacy & Drug Inventory', action: () => setCurrentPage('inventory'), icon: '📦' },
    { category: 'Navigation', label: 'Leave Requests & Approvals', action: () => setCurrentPage('leaveManagement'), icon: '✉️' },
    { category: 'Navigation', label: 'Credentials & Certifications', action: () => setCurrentPage('certifications'), icon: '📜' },
    { category: 'Quick Action', label: 'Add New Staff Profile', action: () => handleAddStaff(), icon: '👤' },
    { category: 'Quick Action', label: 'Add New Pharmacy Item', action: () => handleAddPharmacyItem(), icon: '💊' },
    { category: 'Quick Action', label: 'Export Operations Report', action: () => alert('Exporting operations report... Done!'), icon: '📥' },
    { category: 'System', label: 'Toggle Application Theme', action: () => setTheme(prev => prev === 'light' ? 'dark' : 'light'), icon: '🌓' },
    { category: 'System', label: 'Sign Out & Lock Terminal', action: () => handleLogout(), icon: '🔒' }
  ];

  const filteredItems = commandItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Command palette keyboard navigation listener
  useEffect(() => {
    if (!commandPaletteOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          setCommandPaletteOpen(false);
          setSearchQuery('');
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setCommandPaletteOpen(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, filteredItems, selectedIndex]);

  useEffect(() => {
    // Get user info from localStorage
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setUserRole(user.role || 'admin');
    }

    // Add admin layout class to body to prevent double scrollbars
    document.body.classList.add('admin-layout');

    // Cleanup function to remove the class when component unmounts
    return () => {
      document.body.classList.remove('admin-layout');
    };
  }, []);

  const handleAddStaff = () => {
    setCurrentPage('addStaff');
    setSelectedStaff(null);
  };

  const handleEditStaff = (staff) => {
    setSelectedStaff(staff);
    setCurrentPage('addStaff');
  };

  const handleStaffAdded = () => {
    setCurrentPage('staffProfiles');
    setSelectedStaff(null);
  };

  const handleStaffSubmit = async (staffData) => {
    try {
      const url = selectedStaff 
        ? `http://localhost:5000/api/staff/${selectedStaff._id}`
        : 'http://localhost:5000/api/staff';
      
      const method = selectedStaff ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(staffData)
      });

      const contentType = response.headers.get('content-type') || '';
      const payload = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        const message = payload?.message || payload?.error?.message || response.statusText || 'Failed to save staff member';
        throw new Error(message);
      }

      const result = payload;
      console.log('Staff saved successfully:', result);
      
      // Navigate back to staff directory
      handleStaffAdded();
    } catch (error) {
      console.error('Error saving staff:', error);
      throw error; // Re-throw to let StaffForm handle the error display
    }
  };

  // Patient handling functions
  const handlePatientAdded = () => {
    setCurrentPage('patients');
  };

  // Pharmacy handling functions
  const handleAddPharmacyItem = () => {
    setCurrentPage('addPharmacyItem');
    setSelectedPharmacyItem(null);
  };

  const handleEditPharmacyItem = (item) => {
    setSelectedPharmacyItem(item);
    setCurrentPage('editPharmacyItem');
  };

  const handlePharmacyItemAdded = () => {
    setCurrentPage('inventory');
    setSelectedPharmacyItem(null);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;

      case 'patients':
        return <PatientList />;
      case 'patientRegistration':
        return <PatientRegistrationForm onPatientAdded={handlePatientAdded} onBackToList={handlePatientAdded} />;
      
      // Staff Management
      case 'staffProfiles':
        return <StaffDirectory onSelectStaff={handleEditStaff} onAddStaff={handleAddStaff} />;
      case 'addStaff':
        return (
          <StaffForm 
            onSubmit={handleStaffSubmit} 
            onCancel={handleStaffAdded} 
            staffData={selectedStaff}
            editMode={!!selectedStaff}
          />
        );
      case 'staffRoles':
        return <RolesAndDepartments />;
      case 'scheduling':
        return <ShiftScheduling />;
      case 'leaveManagement':
        return <LeaveManagement />;
      case 'certifications':
        return <Certifications />;
      
      // Inventory & Pharmacy - Same as PharmacistLayout
      case 'inventory':
        return <PharmacistDashboard 
          activeTab="all-items" 
          onNavigateToAdd={handleAddPharmacyItem}
          onNavigateToEdit={handleEditPharmacyItem}
        />;
      case 'all-items':
        return <PharmacistDashboard 
          activeTab="all-items" 
          onNavigateToAdd={handleAddPharmacyItem}
          onNavigateToEdit={handleEditPharmacyItem}
        />;
      case 'low-stock':
        return <PharmacistDashboard 
          activeTab="low-stock" 
          onNavigateToAdd={handleAddPharmacyItem}
          onNavigateToEdit={handleEditPharmacyItem}
        />;
      case 'add-item':
        return <PharmacyItemForm onBack={handlePharmacyItemAdded} />;
      case 'edit-item':
        return <PharmacyItemForm item={selectedPharmacyItem} onBack={handlePharmacyItemAdded} />;
      case 'addPharmacyItem':
        return <PharmacyItemForm onBack={handlePharmacyItemAdded} />;
      case 'editPharmacyItem':
        return <PharmacyItemForm item={selectedPharmacyItem} onBack={handlePharmacyItemAdded} />;
      case 'add-medication':
        return <PharmacyItemForm onBack={handlePharmacyItemAdded} />;
      
      // Prescription Management
      case 'prescription':
        return <PharmacistPrescriptions />;
      case 'pending-prescriptions':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Pending Prescriptions</h2>
            <p className="text-gray-600">Pending prescription management coming soon...</p>
          </div>
        );
      case 'completed-prescriptions':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Completed Prescriptions</h2>
            <p className="text-gray-600">Completed prescription management coming soon...</p>
          </div>
        );
      case 'prescription-history':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Prescription History</h2>
            <p className="text-gray-600">Prescription history coming soon...</p>
          </div>
        );
      
      // Supplier Management
      case 'suppliers':
        return <SupplierDashboard activeTab="list" />;
      case 'supplier-list':
        return <SupplierDashboard activeTab="list" />;
      case 'supplier-items':
        return <SupplierDashboard activeTab="items" />;
      case 'add-supplier':
        return <SupplierDashboard activeTab="add" />;
      case 'purchase-orders':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Purchase Orders</h2>
            <p className="text-gray-600">Purchase order management coming soon...</p>
          </div>
        );
      case 'supplier-performance':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Supplier Performance</h2>
            <p className="text-gray-600">Supplier performance tracking coming soon...</p>
          </div>
        );
      
      // Reports
      case 'reports':
        return <PharmacyReports />;
      case 'inventory-reports':
        return <PharmacyReports reportType="inventory" />;
      case 'sales-reports':
        return <PharmacyReports reportType="sales" />;
      case 'expiry-reports':
        return <PharmacyReports reportType="expiry" />;
      
      // Appointments
      case 'appointmentScheduling':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Schedule Appointment</h2>
            <p className="text-gray-600">Appointment scheduling functionality will be implemented here.</p>
          </div>
        );
      case 'doctorAllocation':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Doctor Allocation</h2>
            <p className="text-gray-600">Doctor allocation functionality will be implemented here.</p>
          </div>
        );
      case 'upcomingAppointments':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Upcoming Appointments</h2>
            <p className="text-gray-600">Upcoming appointments functionality will be implemented here.</p>
          </div>
        );
      
      // Laboratory
      case 'labRequests':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Test Requests</h2>
            <p className="text-gray-600">Lab test requests functionality will be implemented here.</p>
          </div>
        );
      case 'testResults':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Test Results</h2>
            <p className="text-gray-600">Test results functionality will be implemented here.</p>
          </div>
        );
      case 'labReports':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Lab Reports</h2>
            <p className="text-gray-600">Lab reports functionality will be implemented here.</p>
          </div>
        );
        
      // Settings and Profile
      case 'profileSettings':
        return <UserProfile />;
      case 'accountSettings':
        return <AccountSettings />;
      
      default:
        return <Dashboard />;
    }
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Dispatch custom logout event for other components
    window.dispatchEvent(new Event('logout'));
    
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} userRole={userRole} />
      <div className="flex-1 flex flex-col bg-transparent overflow-hidden">
        <Header 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          selectedPatientId={selectedStaff?._id}
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
          onOpenCommandPalette={() => {
            setSearchQuery('');
            setSelectedIndex(0);
            setCommandPaletteOpen(true);
          }}
        />
        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/40">
          <div className="py-6 px-8 max-w-7xl mx-auto w-full">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Command Palette Modal */}
      {commandPaletteOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setCommandPaletteOpen(false)}
        >
          <div 
            className="w-full max-w-xl overflow-hidden glass-panel-heavy rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/80 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center px-4 border-b border-slate-200/50 dark:border-slate-800/50">
              <span className="text-xl text-slate-400">🔍</span>
              <input 
                type="text" 
                placeholder="Search actions, sections... (Use ↑↓ and Enter)"
                className="w-full py-4 pl-3 bg-transparent text-slate-800 dark:text-slate-100 font-medium focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 text-sm"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                autoFocus
              />
            </div>
            
            {/* Results List */}
            <div className="max-h-72 overflow-y-auto p-2">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      item.action();
                      setCommandPaletteOpen(false);
                      setSearchQuery('');
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-150 ${
                      idx === selectedIndex 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{item.icon}</span>
                      <div className="text-left">
                        <p className="font-semibold text-sm">{item.label}</p>
                        <p className={`text-xs ${idx === selectedIndex ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                          {item.category}
                        </p>
                      </div>
                    </div>
                    {idx === selectedIndex && (
                      <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded text-white animate-pulse">
                        Enter
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                  <p className="text-sm font-medium">No results found for "{searchQuery}"</p>
                  <p className="text-xs mt-1">Try searching for 'dashboard', 'patient', 'theme', or 'staff'</p>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="flex justify-between items-center px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200/50 dark:border-slate-800/50 text-xs text-slate-400 dark:text-slate-500 font-medium">
              <div className="flex space-x-3">
                <span><kbd className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">↑↓</kbd> Navigate</span>
                <span><kbd className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">↵</kbd> Select</span>
                <span><kbd className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">esc</kbd> Dismiss</span>
              </div>
              <span>Command Palette v1.2</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
