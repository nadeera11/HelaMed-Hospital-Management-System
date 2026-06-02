import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users2, Calendar, ClipboardList, BarChart3, Activity, 
  Bed, Clock, UserPlus, Package, Stethoscope, Building2, 
  AlertTriangle, CheckCircle, Search, RotateCw, CheckCircle2, 
  AlertOctagon, X, MessageSquare, ExternalLink, RefreshCw
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalPatients: 7,
    appointmentsToday: 3,
    pendingLabTests: 5,
    todaysSchedule: [],
    inventoryStatus: [],
    staffOverview: [],
    departmentOverview: []
  });
  
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState([]);
  
  // Interactive UI states
  const [activeMetric, setActiveMetric] = useState('all'); // 'all' | 'appointments' | 'patients' | 'labTests'
  const [timeframe, setTimeframe] = useState('7'); // '7' | '14' | '30'
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [scheduleFilter, setScheduleFilter] = useState('all'); // 'all' | 'confirmed' | 'pending' | 'scheduled'
  const [staffSearch, setStaffSearch] = useState('');
  
  // Drawer & Overlay states
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [hoveredStaff, setHoveredStaff] = useState(null);
  
  // Reorder loading state
  const [reorderingItem, setReorderingItem] = useState(null);
  
  // Toast Notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDashboardData = useCallback(async () => {
    const API_BASE_URL = 'http://localhost:5000/api';
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };

    try {
      setLoading(true);
      const newDashboardData = {
        totalPatients: 7,
        appointmentsToday: 3,
        pendingLabTests: 5,
        todaysSchedule: [],
        inventoryStatus: [],
        staffOverview: [],
        departmentOverview: []
      };

      // Fetch total patients
      try {
        const patientsResponse = await fetch(`${API_BASE_URL}/users?role=patient`, { headers });
        if (patientsResponse.ok) {
          const patientsData = await patientsResponse.json();
          const patientCount = patientsData.Users?.length || patientsData.data?.length || patientsData.results || 7;
          newDashboardData.totalPatients = patientCount;
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      }

      // Fetch today's appointments
      try {
        const appointmentsResponse = await fetch(`${API_BASE_URL}/appointments/today`, { headers });
        if (appointmentsResponse.ok) {
          const appointmentsData = await appointmentsResponse.json();
          const appointments = appointmentsData.data || [];
          const appointmentCount = appointments.length || appointmentsData.results || 0;
          newDashboardData.appointmentsToday = appointmentCount;
          newDashboardData.todaysSchedule = appointments;
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }

      // Fetch real doctors from database for schedule fallback
      let realDoctors = [];
      try {
        const doctorsResponse = await fetch(`${API_BASE_URL}/staff?role=doctor&limit=5`, { headers });
        if (doctorsResponse.ok) {
          const doctorsData = await doctorsResponse.json();
          realDoctors = doctorsData.data?.staff || doctorsData.data || [];
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }

      // Fetch pending lab tests
      try {
        const labResponse = await fetch(`${API_BASE_URL}/lab-requests/all?status=pending`, { headers });
        if (labResponse.ok) {
          const labData = await labResponse.json();
          const labCount = labData.count || labData.data?.length || labData.results || 5;
          newDashboardData.pendingLabTests = labCount;
        }
      } catch (error) {
        console.error('Error fetching lab tests:', error);
      }

      // Fetch inventory status
      try {
        const inventoryResponse = await fetch(`${API_BASE_URL}/medication/items`, { headers });
        if (inventoryResponse.ok) {
          const inventoryData = await inventoryResponse.json();
          const items = inventoryData.data || inventoryData.items || [];
          newDashboardData.inventoryStatus = items.slice(0, 4).map(item => ({
            _id: item._id,
            name: item.name || item.itemName,
            stock: item.quantity || item.stock || 0,
            status: (item.quantity || item.stock || 0) > 50 ? 'In Stock' : (item.quantity || item.stock || 0) > 10 ? 'Low Stock' : 'Out of Stock',
            statusColor: (item.quantity || item.stock || 0) > 50 ? 'green' : (item.quantity || item.stock || 0) > 10 ? 'yellow' : 'red'
          }));
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
      }

      // Fetch staff overview (doctors with shift status)
      try {
        const staffResponse = await fetch(`${API_BASE_URL}/staff/overview?limit=5`, { headers });
        if (staffResponse.ok) {
          const staffData = await staffResponse.json();
          const staffList = staffData.data || [];
          // Ensure each staff entry has an email field
          newDashboardData.staffOverview = staffList.map(s => ({
            ...s,
            email: s.email || `${(s.firstName || s.name?.split(' ')[1] || 'staff').toLowerCase()}@helamed.lk`
          }));
        }
      } catch (error) {
        console.error('Error fetching staff overview:', error);
      }

      // Fetch department overview
      try {
        const departmentsResponse = await fetch(`${API_BASE_URL}/departments/overview?limit=5`, { headers });
        if (departmentsResponse.ok) {
          const departmentsData = await departmentsResponse.json();
          newDashboardData.departmentOverview = departmentsData.data || [];
        }
      } catch (error) {
        console.error('Error fetching department overview:', error);
      }

      // Set fallback schedule using real doctors from database if available
      if (newDashboardData.todaysSchedule.length === 0) {
        const appointmentTypes = [
          'Cardiology Consultation', 'General Medical Exam', 'MRI Brain Scan Review',
          'Orthopedic Follow-up', 'Dermatology Check'
        ];
        const patientNames = [
          'Kanishka Silva', 'Anura Kumara', 'Ruwan Perera', 'Samanthi Fernando', 'Dulani Wickrama'
        ];
        const times = ['09:30 AM', '11:00 AM', '02:15 PM', '03:45 PM', '04:30 PM'];
        const statuses = ['confirmed', 'pending', 'scheduled'];
        const notesList = [
          'High blood pressure follow-up. Restrict sodium levels.',
          'Routine check-up for annual health insurance scheme.',
          'Post-op review for patient assessment.',
          'Physical therapy progress evaluation.',
          'Skin allergy reaction follow-up.'
        ];

        if (realDoctors.length > 0) {
          // Use real doctors from the database
          newDashboardData.todaysSchedule = realDoctors.slice(0, 3).map((doc, i) => ({
            _id: `a${i + 1}`,
            patient: { name: patientNames[i % patientNames.length] },
            type: appointmentTypes[i % appointmentTypes.length],
            doctor: { firstName: doc.firstName, lastName: doc.lastName },
            appointmentTime: times[i % times.length],
            status: statuses[i % statuses.length],
            notes: notesList[i % notesList.length]
          }));
          newDashboardData.appointmentsToday = newDashboardData.todaysSchedule.length;
        } else {
          // Final hardcoded fallback only if database is unreachable
          newDashboardData.todaysSchedule = [
            {
              _id: 'a1',
              patient: { name: 'Kanishka Silva' },
              type: 'Cardiology Consultation',
              doctor: { firstName: 'Nadeera', lastName: 'Maddugoda' },
              appointmentTime: '09:30 AM',
              status: 'confirmed',
              notes: 'High blood pressure follow-up. Restrict sodium levels.'
            },
            {
              _id: 'a2',
              patient: { name: 'Anura Kumara' },
              type: 'General Medical Exam',
              doctor: { firstName: 'Sanduni', lastName: 'Senanayake' },
              appointmentTime: '11:00 AM',
              status: 'pending',
              notes: 'Routine check-up for annual health insurance scheme.'
            },
            {
              _id: 'a3',
              patient: { name: 'Ruwan Perera' },
              type: 'MRI Brain Scan Review',
              doctor: { firstName: 'Pradeep', lastName: 'Rathnayake' },
              appointmentTime: '02:15 PM',
              status: 'scheduled',
              notes: 'Post-op review of frontal lobe extraction.'
            }
          ];
        }
      }

      // Set fallback inventory if list is empty
      if (newDashboardData.inventoryStatus.length === 0) {
        newDashboardData.inventoryStatus = [
          { _id: 'i1', name: 'Amoxicillin 500mg', stock: 120, status: 'In Stock', statusColor: 'green' },
          { _id: 'i2', name: 'Paracetamol 500mg', stock: 8, status: 'Out of Stock', statusColor: 'red' },
          { _id: 'i3', name: 'Metformin 850mg', stock: 24, status: 'Low Stock', statusColor: 'yellow' },
          { _id: 'i4', name: 'Atorvastatin 20mg', stock: 65, status: 'In Stock', statusColor: 'green' }
        ];
      }

      // Set fallback staff using real doctors if overview API failed but doctors API succeeded
      if (newDashboardData.staffOverview.length === 0 && realDoctors.length > 0) {
        const statusColors = ['green', 'green', 'yellow', 'green', 'red'];
        newDashboardData.staffOverview = realDoctors.slice(0, 5).map((doc, i) => ({
          name: `Dr. ${doc.firstName} ${doc.lastName}`,
          initials: `${doc.firstName.charAt(0)}${doc.lastName.charAt(0)}`,
          specialization: doc.specialization || 'General Practitioner',
          statusColor: statusColors[i % statusColors.length],
          email: doc.email || `${doc.firstName.toLowerCase()}@helamed.lk`,
          department: doc.department?.name || doc.department || 'General'
        }));
      } else if (newDashboardData.staffOverview.length === 0) {
        // Final hardcoded fallback only if database is unreachable
        newDashboardData.staffOverview = [
          { name: 'Dr. Nadeera Maddugoda', initials: 'NM', specialization: 'Senior Cardiologist', statusColor: 'green', email: 'nadeera@helamed.lk', department: 'Cardiology' },
          { name: 'Dr. Sanduni Senanayake', initials: 'SS', specialization: 'Neurologist Consultant', statusColor: 'green', email: 'sanduni@helamed.lk', department: 'Neurology' },
          { name: 'Dr. Pradeep Rathnayake', initials: 'PR', specialization: 'Radiology Expert', statusColor: 'yellow', email: 'pradeep@helamed.lk', department: 'Radiology' },
          { name: 'Nurse Nimmi Perera', initials: 'NP', specialization: 'ICU Head Nurse', statusColor: 'green', email: 'nimmi@helamed.lk', department: 'Intensive Care' },
          { name: 'Dr. Dilhan Silva', initials: 'DS', specialization: 'Pediatric Specialist', statusColor: 'red', email: 'dilhan@helamed.lk', department: 'Pediatrics' }
        ];
      }

      // Set fallback departments if empty
      if (newDashboardData.departmentOverview.length === 0) {
        newDashboardData.departmentOverview = [
          { name: 'Cardiology Ward', patientCount: 14, color: 'blue' },
          { name: 'Neurology Ward', patientCount: 8, color: 'purple' },
          { name: 'Radiology Unit', patientCount: 17, color: 'blue' },
          { name: 'Pediatrics Wing', patientCount: 5, color: 'purple' }
        ];
      }

      setDashboardData(newDashboardData);
      
      // Generate activity statistics based on chosen timeframe
      setActivityData(generateActivityData(timeframe));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  // Generate mock activity data
  const generateActivityData = (daysCount) => {
    const data = [];
    const count = parseInt(daysCount, 10);
    const today = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const demoSeries = {
      appointments: [22, 24, 21, 26, 28, 25, 23, 24, 27, 29, 26, 24, 22, 25, 27, 30, 28, 26, 24, 25, 27, 29, 31, 30, 28, 26, 25, 27, 29, 28],
      patients: [36, 34, 32, 33, 35, 38, 40, 39, 37, 35, 34, 36, 38, 41, 43, 42, 40, 38, 37, 39, 41, 44, 46, 45, 43, 41, 40, 42, 44, 43],
      labTests: [12, 13, 11, 14, 16, 15, 13, 12, 14, 16, 17, 15, 13, 14, 15, 18, 17, 16, 14, 13, 15, 17, 19, 18, 16, 15, 14, 15, 17, 16]
    };
    
    for (let i = 0; i < count; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (count - 1 - i));
      const dayLabel = count > 14 
        ? `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`
        : days[date.getDay()];
      
      data.push({
        day: dayLabel,
        appointments: demoSeries.appointments[i % demoSeries.appointments.length],
        patients: demoSeries.patients[i % demoSeries.patients.length],
        labTests: demoSeries.labTests[i % demoSeries.labTests.length],
      });
    }
    return data;
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Stat card sparkline historical dataset
  const sparklinePatients = [{ val: 4 }, { val: 6 }, { val: 5 }, { val: 7 }, { val: 6 }, { val: 8 }, { val: 7 }];
  const sparklineAppointments = [{ val: 12 }, { val: 19 }, { val: 15 }, { val: 8 }, { val: 22 }, { val: 14 }, { val: 3 }];
  const sparklineLabTests = [{ val: 10 }, { val: 15 }, { val: 9 }, { val: 12 }, { val: 14 }, { val: 8 }, { val: 5 }];

  const stats = [
    {
      id: 'patients',
      label: 'Total Patients',
      value: loading ? '...' : dashboardData.totalPatients.toString(),
      icon: <Users2 size={20} />,
      gradient: 'from-blue-500 to-indigo-600',
      glow: 'glow-blue',
      textColor: 'text-blue-600 dark:text-blue-400',
      sparkline: sparklinePatients,
      sparkColor: '#3b82f6',
      sparkFill: 'url(#sparkBlue)'
    },
    {
      id: 'appointments',
      label: 'Appointments Today', 
      value: loading ? '...' : dashboardData.appointmentsToday.toString(),
      icon: <Calendar size={20} />,
      gradient: 'from-emerald-500 to-teal-600',
      glow: 'glow-green',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      sparkline: sparklineAppointments,
      sparkColor: '#10b981',
      sparkFill: 'url(#sparkGreen)'
    },
    {
      id: 'labTests',
      label: 'Pending Lab Tests',
      value: loading ? '...' : dashboardData.pendingLabTests.toString(),
      icon: <ClipboardList size={20} />,
      gradient: 'from-amber-500 to-orange-600',
      glow: 'glow-yellow',
      textColor: 'text-amber-600 dark:text-amber-400',
      sparkline: sparklineLabTests,
      sparkColor: '#f59e0b',
      sparkFill: 'url(#sparkYellow)'
    }
  ];

  // Filter Today's Schedule
  const filteredSchedule = useMemo(() => {
    return dashboardData.todaysSchedule.filter(appointment => {
      const patientName = appointment.patient?.name || appointment.patientName || '';
      const doctorName = `${appointment.doctor?.firstName || ''} ${appointment.doctor?.lastName || ''}`;
      
      const matchesSearch = patientName.toLowerCase().includes(scheduleSearch.toLowerCase()) ||
                            doctorName.toLowerCase().includes(scheduleSearch.toLowerCase());
      
      const matchesFilter = scheduleFilter === 'all' || 
                            appointment.status === scheduleFilter;
                            
      return matchesSearch && matchesFilter;
    });
  }, [dashboardData.todaysSchedule, scheduleSearch, scheduleFilter]);

  // Filter Staff Directory
  const filteredStaff = useMemo(() => {
    return dashboardData.staffOverview.filter(staff => {
      return staff.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
             staff.specialization.toLowerCase().includes(staffSearch.toLowerCase()) ||
             staff.department.toLowerCase().includes(staffSearch.toLowerCase());
    });
  }, [dashboardData.staffOverview, staffSearch]);

  // Fast Reorder Simulation
  const handleReorder = async (itemId, itemName) => {
    setReorderingItem(itemId);
    // Mimic API post trigger
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update local inventory values
    setDashboardData(prev => ({
      ...prev,
      inventoryStatus: prev.inventoryStatus.map(item => 
        item._id === itemId 
          ? { ...item, stock: item.stock + 100, status: 'In Stock', statusColor: 'green' }
          : item
      )
    }));
    
    setReorderingItem(null);
    showToast(`Order created for 100 units of ${itemName}!`);
  };

  // Drawer Action Triggers
  const handleAppointmentAction = (action, patientName) => {
    if (action === 'checkin') {
      setSelectedAppointment(prev => ({ ...prev, status: 'confirmed' }));
      setDashboardData(prev => ({
        ...prev,
        todaysSchedule: prev.todaysSchedule.map(app => 
          app._id === selectedAppointment._id ? { ...app, status: 'confirmed' } : app
        )
      }));
      showToast(`${patientName} checked in successfully!`);
    } else if (action === 'cancel') {
      setSelectedAppointment(prev => ({ ...prev, status: 'cancelled' }));
      setDashboardData(prev => ({
        ...prev,
        todaysSchedule: prev.todaysSchedule.map(app => 
          app._id === selectedAppointment._id ? { ...app, status: 'cancelled' } : app
        )
      }));
      showToast(`Appointment for ${patientName} cancelled.`);
    } else if (action === 'reminder') {
      showToast(`Email reminder notification sent to ${patientName}!`);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Toast Alert popup overlay */}
      {toast && (
        <div className="fixed top-20 right-8 z-50 animate-bounce-in">
          <div className="flex items-center space-x-3 px-4 py-3 shadow-2xl rounded-2xl glass-panel-heavy border-l-4 border-l-emerald-500 border-slate-200/40 dark:border-slate-800/80 max-w-sm">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{toast.message}</p>
              <p className="text-xxs text-slate-400 dark:text-slate-500 mt-0.5">Updated successfully in real-time</p>
            </div>
            <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Title Header with interactive refresh */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-850 dark:text-white transition-colors">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm transition-colors">
            Real-time analytics monitoring clinical capacity and drug stock.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => {
              fetchDashboardData();
              showToast("Dashboard details refreshed!");
            }}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:scale-105 active:scale-95 transition-all shadow-sm"
            title="Refresh Operations"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => {
              showToast("Exporting comprehensive hospital report...", "info");
              setTimeout(() => showToast("HMS Report PDF exported successfully!"), 1200);
            }}
            className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Export Report
          </button>
          <button 
            onClick={() => {
              setActiveMetric('all');
              setTimeframe('30');
              showToast("Displaying full 30-day analytics!");
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg text-sm font-bold active:scale-98"
          >
            View Analytics
          </button>
        </div>
      </div>
      
      {/* Dynamic Sparkline Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div 
            key={stat.id} 
            onClick={() => {
              setActiveMetric(stat.id === 'patients' ? 'patients' : stat.id === 'appointments' ? 'appointments' : 'labTests');
              showToast(`Focused chart on ${stat.label}`);
            }}
            className={`bg-white dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 cursor-pointer transition-all duration-300 hover:-translate-y-1 ${stat.glow}`}
          >
            <div className="flex items-center justify-between">
              <div className={`bg-gradient-to-br ${stat.gradient} p-3 rounded-xl text-white shadow-md`}>
                {stat.icon}
              </div>
              
              {/* Sparkline trend widget */}
              <div className="w-32 h-10 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stat.sparkline} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                    <defs>
                      <linearGradient id="sparkBlue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="sparkGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="sparkYellow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="val" 
                      stroke={stat.sparkColor} 
                      fill={stat.sparkFill}
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-4 text-left">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-baseline space-x-2 mt-1">
                <p className="text-3xl font-extrabold text-slate-800 dark:text-white transition-colors">{stat.value}</p>
                <span className="text-xxs font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  +12% wk
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Analytical Chart & Roster list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hospital Activity Interactive Chart */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2 overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3 text-left">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl text-white shadow-md">
                <Activity size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-850 dark:text-white">Hospital Activity</h2>
                <p className="text-slate-400 dark:text-slate-500 text-xs">Real-time throughput metrics</p>
              </div>
            </div>
            
            {/* Filter Controllers */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Metric Selector Tabs */}
              <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex space-x-0.5 text-xxs font-bold">
                <button 
                  onClick={() => { setActiveMetric('all'); showToast("Displaying all operation parameters"); }}
                  className={`px-2.5 py-1.5 rounded-lg transition-all ${activeMetric === 'all' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => { setActiveMetric('appointments'); showToast("Displaying appointments load"); }}
                  className={`px-2.5 py-1.5 rounded-lg transition-all ${activeMetric === 'appointments' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                  Appts
                </button>
                <button 
                  onClick={() => { setActiveMetric('patients'); showToast("Displaying patient admissions"); }}
                  className={`px-2.5 py-1.5 rounded-lg transition-all ${activeMetric === 'patients' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                  Patients
                </button>
                <button 
                  onClick={() => { setActiveMetric('labTests'); showToast("Displaying lab analysis flow"); }}
                  className={`px-2.5 py-1.5 rounded-lg transition-all ${activeMetric === 'labTests' ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                  Labs
                </button>
              </div>

              {/* Timeframe Dropdown */}
              <select 
                value={timeframe} 
                onChange={(e) => setTimeframe(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-355 text-xxs font-bold py-1.5 px-2 rounded-xl focus:outline-none border-r-4 border-transparent cursor-pointer"
              >
                <option value="7">Last 7 Days</option>
                <option value="14">Last 14 Days</option>
                <option value="30">Last 30 Days</option>
              </select>
            </div>
          </div>
          
          <div className="p-5 flex-1 flex items-center">
            {loading ? (
              <div className="h-72 w-full flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
                <p className="text-slate-500 text-xs">Syncing statistics...</p>
              </div>
            ) : activityData.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="chartAppointments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="chartPatients" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="chartLabTests" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800/60" vertical={false} />
                    <XAxis dataKey="day" stroke="#94a3b8" style={{ fontSize: '11px', fontWeight: 500 }} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: '11px', fontWeight: 500 }} />
                    
                    {/* Glassmorphic custom tooltip */}
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                        color: '#f8fafc',
                        textAlign: 'left'
                      }}
                      itemStyle={{ color: '#cbd5e1', fontSize: '12px', fontWeight: 500 }}
                      labelStyle={{ color: '#ffffff', fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '10px' }} iconType="circle" />
                    
                    {(activeMetric === 'all' || activeMetric === 'appointments') && (
                      <Area 
                        type="monotone" 
                        dataKey="appointments" 
                        stroke="#10b981" 
                        fillOpacity={1} 
                        fill="url(#chartAppointments)" 
                        name="Appointments Today"
                        strokeWidth={2}
                      />
                    )}
                    {(activeMetric === 'all' || activeMetric === 'patients') && (
                      <Area 
                        type="monotone" 
                        dataKey="patients" 
                        stroke="#3b82f6" 
                        fillOpacity={1} 
                        fill="url(#chartPatients)" 
                        name="Total Patients"
                        strokeWidth={2}
                      />
                    )}
                    {(activeMetric === 'all' || activeMetric === 'labTests') && (
                      <Area 
                        type="monotone" 
                        dataKey="labTests" 
                        stroke="#f59e0b" 
                        fillOpacity={1} 
                        fill="url(#chartLabTests)" 
                        name="Pending Lab Tests"
                        strokeWidth={2}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-slate-400">
                <BarChart3 size={36} className="mb-2" />
                <p className="font-semibold text-sm">No activity records logged</p>
              </div>
            )}
          </div>
        </div>

        {/* Searchable Today's Schedule Card */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
            <div className="flex items-center space-x-3 text-left">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl text-white shadow-md">
                <Clock size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Today's Schedule</h2>
                <p className="text-slate-400 dark:text-slate-500 text-xs">Manage incoming clinic bookings</p>
              </div>
            </div>
            
            {/* Search Input */}
            <div className="relative mt-4">
              <input 
                type="text" 
                placeholder="Search patient, doc..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={scheduleSearch}
                onChange={(e) => setScheduleSearch(e.target.value)}
              />
              <Search size={14} className="absolute left-3 top-2 text-slate-400 dark:text-slate-500" />
            </div>

            {/* Filter pills */}
            <div className="flex space-x-1.5 mt-3 text-xxs font-bold">
              {['all', 'confirmed', 'pending', 'scheduled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setScheduleFilter(status)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-all ${scheduleFilter === status ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-5 flex-1 max-h-[310px] overflow-y-auto space-y-3">
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : filteredSchedule.length > 0 ? (
              filteredSchedule.map((appointment) => (
                <div 
                  key={appointment._id} 
                  onClick={() => setSelectedAppointment(appointment)}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 rounded-xl border border-slate-200/50 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer text-left transition-all duration-150 hover:shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-850 dark:text-white truncate">
                        {appointment.patient?.name}
                      </p>
                      <p className="text-xxs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{appointment.type}</p>
                      <p className="text-xxs text-blue-600 dark:text-blue-400 mt-1 font-semibold">
                        Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-blue-600 dark:text-blue-400 font-extrabold text-xs">
                        {appointment.appointmentTime}
                      </span>
                      <div className="mt-1.5">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xxs font-bold uppercase tracking-wider ${
                          appointment.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                            : appointment.status === 'pending'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-semibold">No appointments scheduled</p>
              </div>
            )}
          </div>
          
          <div className="p-5 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => showToast("Opening main schedule manager...")}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all duration-200"
            >
              View Full Rosters & Booking
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Status & Staff List & Capacity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Inventory Status with interactive quick reorder */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between text-left">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-2 rounded-xl text-white shadow-md">
                <Package size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-850 dark:text-white">Pharmacy Stock</h2>
                <p className="text-slate-400 dark:text-slate-500 text-xs">Verify critical drugs limits</p>
              </div>
            </div>
            <button className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline">See All</button>
          </div>
          
          <div className="p-5 flex-1 space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
              </div>
            ) : (
              dashboardData.inventoryStatus.map((item) => (
                <div key={item._id} className="group relative flex justify-between items-center p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors duration-150">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xxs font-extrabold uppercase tracking-wider ${
                        item.statusColor === 'green' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' :
                        item.statusColor === 'yellow' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
                        'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 mt-2">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-1000 ${
                            item.statusColor === 'green' ? 'bg-emerald-500' :
                            item.statusColor === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min((item.stock / 150) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xxs font-bold text-slate-400 dark:text-slate-500 w-8 text-right">
                        {item.stock} u
                      </span>
                    </div>
                  </div>
                  
                  {/* Quick Reorder popover action button */}
                  {(item.statusColor === 'yellow' || item.statusColor === 'red') && (
                    <button 
                      onClick={() => handleReorder(item._id, item.name)}
                      disabled={reorderingItem === item._id}
                      className="ml-3 p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                      title="Quick Reorder Stock"
                    >
                      {reorderingItem === item._id ? (
                        <RotateCw size={12} className="animate-spin" />
                      ) : (
                        <UserPlus size={12} />
                      )}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Staff list with live pulsing dot filters */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between text-left">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl text-white shadow-md">
                  <Stethoscope size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-850 dark:text-white">Active Rosters</h2>
                  <p className="text-slate-400 dark:text-slate-500 text-xs">Verify doctor status details</p>
                </div>
              </div>
            </div>
            
            {/* Staff Search */}
            <input 
              type="text" 
              placeholder="Search active doctors..."
              className="w-full mt-3 pl-3 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
              value={staffSearch}
              onChange={(e) => setStaffSearch(e.target.value)}
            />
          </div>
          
          <div className="p-5 flex-1 space-y-4 max-h-[220px] overflow-y-auto relative">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : filteredStaff.length > 0 ? (
              filteredStaff.map((staff, index) => (
                <div 
                  key={index} 
                  className="relative flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer group"
                  onMouseEnter={() => setHoveredStaff(staff)}
                  onMouseLeave={() => setHoveredStaff(null)}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold mr-3 shadow-sm ${
                      staff.statusColor === 'green' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
                      staff.statusColor === 'yellow' ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 
                      'bg-gradient-to-br from-rose-500 to-pink-600'
                    }`}>
                      {staff.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{staff.name}</p>
                      <p className="text-xxs text-slate-400 dark:text-slate-500 truncate">{staff.specialization}</p>
                    </div>
                  </div>
                  
                  {/* Live pulsing dot indicator */}
                  <div className={`w-2.5 h-2.5 rounded-full pulse-indicator ${
                    staff.statusColor === 'green' ? 'text-emerald-500 bg-emerald-500' :
                    staff.statusColor === 'yellow' ? 'text-amber-500 bg-amber-500' : 
                    'text-rose-500 bg-rose-500'
                  }`}></div>

                  {/* Elegant Hover Overlay profiles details popover */}
                  {hoveredStaff && hoveredStaff.name === staff.name && (
                    <div className="absolute bottom-full left-4 mb-2 w-56 p-3 bg-slate-950/95 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl text-slate-100 z-40 pointer-events-none animate-scale-in text-xxs font-medium leading-relaxed">
                      <p className="font-bold text-xs text-white border-b border-white/10 pb-1 mb-1.5">{staff.name}</p>
                      <p><span className="text-slate-400">Dept:</span> {staff.department}</p>
                      <p><span className="text-slate-400">Profile:</span> {staff.specialization}</p>
                      <p className="truncate"><span className="text-slate-400">Email:</span> {staff.email}</p>
                      <p className="flex items-center text-blue-400 mt-1 font-semibold">
                        <MessageSquare size={10} className="mr-1" /> Hover to message staff
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <p className="text-xs">No doctors match query</p>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-center space-x-4 text-[10px] font-bold">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></span>
              <span className="text-slate-500 dark:text-slate-400">On Duty</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-1"></span>
              <span className="text-slate-500 dark:text-slate-400">On Call</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-rose-500 rounded-full mr-1"></span>
              <span className="text-slate-500 dark:text-slate-400">Off Duty</span>
            </div>
          </div>
        </div>

        {/* Department Overview with interactive capacity progress indicators */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between text-left">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-xl text-white shadow-md">
                <Building2 size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-850 dark:text-white">Department Load</h2>
                <p className="text-slate-400 dark:text-slate-500 text-xs">Real-time room occupancy</p>
              </div>
            </div>
            <button className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline">See Wards</button>
          </div>
          
          <div className="p-5 flex-1 space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
              </div>
            ) : (
              dashboardData.departmentOverview.map((dept, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-xs text-slate-850 dark:text-slate-200">{dept.name}</p>
                    <span className="text-xxs font-extrabold text-slate-500 dark:text-slate-400">
                      {dept.patientCount}/20 Patients
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          dept.color === 'purple' 
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
                            : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                        }`}
                        style={{ width: `${(dept.patientCount / 20) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 w-8 text-right">
                      {Math.round((dept.patientCount / 20) * 100)}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Slide-out Schedule details drawer overlay panel */}
      {selectedAppointment && (
        <div 
          className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs drawer-transition"
          onClick={() => setSelectedAppointment(null)}
        >
          <div 
            className="w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between text-left animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Header */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <div>
                  <span className="text-xxs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
                    Appointment Details
                  </span>
                  <h3 className="font-extrabold text-lg text-slate-850 dark:text-white mt-1.5">
                    {selectedAppointment.patient?.name}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedAppointment(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Body details grid */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-semibold">Clinic Time</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-1 block">
                      {selectedAppointment.appointmentTime}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-semibold">Roster status</span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide mt-1.5 ${
                      selectedAppointment.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                        : selectedAppointment.status === 'pending'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400'
                    }`}>
                      {selectedAppointment.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0">
                      <Stethoscope size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Assigned Specialist</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        Dr. {selectedAppointment.doctor?.firstName} {selectedAppointment.doctor?.lastName}
                      </p>
                      <p className="text-xxs text-slate-450 dark:text-slate-500">Department of Cardiology, HelaMed</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0">
                      <Activity size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Consultation category</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {selectedAppointment.type}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0">
                      <ClipboardList size={14} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Diagnostic Notes</p>
                      <div className="mt-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-700 text-xxs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold italic">
                        "{selectedAppointment.notes || 'No doctor pre-assessment notes listed.'}"
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer actions footer */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-6 space-y-2">
              {selectedAppointment.status !== 'confirmed' && (
                <button 
                  onClick={() => handleAppointmentAction('checkin', selectedAppointment.patient?.name)}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all duration-200"
                >
                  Check-in Patient (Confirm)
                </button>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleAppointmentAction('reminder', selectedAppointment.patient?.name)}
                  className="py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xxs font-bold transition-all"
                >
                  Send Reminder
                </button>
                <button 
                  onClick={() => handleAppointmentAction('cancel', selectedAppointment.patient?.name)}
                  className="py-2 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 text-rose-600 dark:text-rose-450 rounded-xl text-xxs font-bold transition-all"
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
