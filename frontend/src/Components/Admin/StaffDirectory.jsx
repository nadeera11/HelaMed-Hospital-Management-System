import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  SearchIcon, FilterIcon, UserPlusIcon, ChevronDownIcon, RefreshCwIcon, 
  FileTextIcon, EyeIcon, PencilIcon, Trash2Icon, XIcon, UserIcon,
  MailIcon, PhoneIcon, CalendarIcon, BriefcaseIcon, MapPinIcon
} from 'lucide-react';
import jsPDF from 'jspdf';

export function StaffDirectory({ onSelectStaff, onAddStaff }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [statusCounts, setStatusCounts] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    onLeave: 0
  });

  useEffect(() => {
    fetchStaffMembers();
    fetchStatusCounts();
  }, []);

  const fetchStaffMembers = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:5000/api/staff', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch staff members');
      }

      const data = await response.json();
      setStaffMembers(data.data?.staff || []);
      setError('');
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError('Failed to load staff members. Please try again later.');
      setStaffMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusCounts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/staff/status-counts', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatusCounts(data.data);
        console.log('Staff status counts:', data.data);
      }
    } catch (err) {
      console.error('Error fetching status counts:', err);
    }
  };

  // Fallback to sample data if API call fails or for development
  const sampleStaffMembers = [
    {
      _id: 'S-0001',
      firstName: 'John',
      lastName: 'Smith',
      role: 'Cardiologist',
      department: 'Cardiology',
      status: 'Active',
      phoneNumber: '202-555-0121',
      email: 'john.smith@hospital.com',
      hireDate: '2018-05-15'
    },
    {
      _id: 'S-0002',
      firstName: 'Emily',
      lastName: 'Johnson',
      role: 'Pediatrician',
      department: 'Pediatrics',
      status: 'Active',
      phoneNumber: '202-555-0122',
      email: 'emily.johnson@hospital.com',
      hireDate: '2019-02-20'
    },
    {
      _id: 'S-0003',
      firstName: 'Sarah',
      lastName: 'Williams',
      role: 'Head Nurse',
      department: 'Emergency',
      status: 'Active',
      phoneNumber: '202-555-0123',
      email: 'sarah.williams@hospital.com',
      hireDate: '2017-11-10'
    },
    {
      _id: 'S-0004',
      firstName: 'Michael',
      lastName: 'Brown',
      role: 'Surgeon',
      department: 'Surgery',
      status: 'On Leave',
      phoneNumber: '202-555-0124',
      email: 'michael.brown@hospital.com',
      hireDate: '2015-08-05'
    },
    {
      _id: 'S-0005',
      firstName: 'Robert',
      lastName: 'Davis',
      role: 'Registered Nurse',
      department: 'Pediatrics',
      status: 'Active',
      phoneNumber: '202-555-0125',
      email: 'robert.davis@hospital.com',
      hireDate: '2020-03-15'
    }
  ];

  // Use sample data if API call returns empty
  const displayStaff = staffMembers.length > 0 ? staffMembers : sampleStaffMembers;
  
  const filteredStaff = displayStaff.filter(staff => {
    const fullName = `${staff.firstName} ${staff.lastName}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesDepartment = 
      departmentFilter === 'all' || staff.department === departmentFilter;
      
    return matchesSearch && matchesDepartment;
  });

  const departments = Array.from(
    new Set(displayStaff.map(staff => staff.department))
  ).sort();

  const handleRefresh = () => {
    fetchStaffMembers();
    fetchStatusCounts();
  };

  const handleDeleteStaff = async (staffId, staffName) => {
    if (window.confirm(`Are you sure you want to delete ${staffName}? This action cannot be undone.`)) {
      try {
        const response = await fetch(`http://localhost:5000/api/staff/${staffId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchStaffMembers();
          console.log('Staff member deleted successfully');
        } else {
          console.error('Failed to delete staff member');
        }
      } catch (error) {
        console.error('Error deleting staff member:', error);
      }
    }
  };

  const handleViewStaff = (staff) => {
    setSelectedStaff(staff);
    setShowViewModal(true);
  };

  const handleCloseModal = () => {
    setShowViewModal(false);
    setSelectedStaff(null);
  };

  const handleDownloadPDF = (staff) => {
    const doc = new jsPDF();
    
    // Set title
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Staff Details', 105, 20, { align: 'center' });
    
    // Add a line
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);
    
    // Staff Information
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    
    let y = 40;
    const lineHeight = 10;
    
    // Left column
    doc.setFont(undefined, 'bold');
    doc.text('Staff ID:', 20, y);
    doc.setFont(undefined, 'normal');
    doc.text(staff._id || 'N/A', 60, y);
    
    y += lineHeight;
    doc.setFont(undefined, 'bold');
    doc.text('Name:', 20, y);
    doc.setFont(undefined, 'normal');
    doc.text(`${staff.firstName} ${staff.lastName}`, 60, y);
    
    y += lineHeight;
    doc.setFont(undefined, 'bold');
    doc.text('Email:', 20, y);
    doc.setFont(undefined, 'normal');
    doc.text(staff.email || 'N/A', 60, y);
    
    y += lineHeight;
    doc.setFont(undefined, 'bold');
    doc.text('Phone:', 20, y);
    doc.setFont(undefined, 'normal');
    doc.text(staff.phone || staff.phoneNumber || 'N/A', 60, y);
    
    y += lineHeight;
    doc.setFont(undefined, 'bold');
    doc.text('Role:', 20, y);
    doc.setFont(undefined, 'normal');
    doc.text(staff.role || 'N/A', 60, y);
    
    y += lineHeight;
    doc.setFont(undefined, 'bold');
    doc.text('Department:', 20, y);
    doc.setFont(undefined, 'normal');
    doc.text(staff.department || 'N/A', 60, y);
    
    y += lineHeight;
    doc.setFont(undefined, 'bold');
    doc.text('Status:', 20, y);
    doc.setFont(undefined, 'normal');
    doc.text(staff.status || 'N/A', 60, y);
    
    if (staff.hireDate) {
      y += lineHeight;
      doc.setFont(undefined, 'bold');
      doc.text('Hire Date:', 20, y);
      doc.setFont(undefined, 'normal');
      doc.text(new Date(staff.hireDate).toLocaleDateString(), 60, y);
    }
    
    if (staff.address) {
      y += lineHeight;
      doc.setFont(undefined, 'bold');
      doc.text('Address:', 20, y);
      doc.setFont(undefined, 'normal');
      doc.text(staff.address, 60, y);
    }
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 280, { align: 'center' });
    
    // Save the PDF
    doc.save(`Staff_${staff.firstName}_${staff.lastName}_${staff._id}.pdf`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Staff Directory</h1>
        <button 
          onClick={onAddStaff}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-medium rounded-xl shadow-[0_4px_14px_0_rgba(225,29,72,0.39)] hover:shadow-[0_6px_20px_rgba(225,29,72,0.23)] hover:from-rose-600 hover:to-rose-700 hover:-translate-y-0.5 transition-all duration-200"
        >
          <UserPlusIcon size={18} className="mr-2" />
          Add New Staff
        </button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center justify-between hover:shadow-md hover:border-slate-200 transition-all group">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Staff</p>
            <p className="text-3xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">{statusCounts.total}</p>
          </div>
          <div className="bg-blue-50 text-blue-600 p-3.5 rounded-2xl group-hover:scale-110 transition-transform">
            <UserIcon size={24} strokeWidth={2.5} />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center justify-between hover:shadow-md hover:border-slate-200 transition-all group">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Active</p>
            <p className="text-3xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors">{statusCounts.active}</p>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl group-hover:scale-110 transition-transform">
            <UserIcon size={24} strokeWidth={2.5} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center justify-between hover:shadow-md hover:border-slate-200 transition-all group">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">On Leave</p>
            <p className="text-3xl font-black text-slate-800 group-hover:text-amber-600 transition-colors">{statusCounts.onLeave}</p>
          </div>
          <div className="bg-amber-50 text-amber-600 p-3.5 rounded-2xl group-hover:scale-110 transition-transform">
            <CalendarIcon size={24} strokeWidth={2.5} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center justify-between hover:shadow-md hover:border-slate-200 transition-all group">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Inactive</p>
            <p className="text-3xl font-black text-slate-800 group-hover:text-rose-600 transition-colors">{statusCounts.inactive}</p>
          </div>
          <div className="bg-rose-50 text-rose-600 p-3.5 rounded-2xl group-hover:scale-110 transition-transform">
            <UserIcon size={24} strokeWidth={2.5} />
          </div>
        </div>
      </div>
      
      {/* Staff List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4 bg-slate-50/50">
          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <SearchIcon size={16} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search staff by name, role, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
            />
          </div>

          <div className="flex items-center space-x-3">
            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="inline-flex items-center px-4 py-2.5 border border-slate-200 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <FilterIcon size={16} className="mr-2 text-slate-500" />
                <span className="mr-1 text-slate-500">Department:</span> 
                <span className="font-semibold text-slate-800">{departmentFilter === 'all' ? 'All' : departmentFilter}</span>
                <ChevronDownIcon size={16} className="ml-2 text-slate-400" />
              </button>
              
              {filterOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-xl bg-white border border-slate-100 ring-1 ring-black ring-opacity-5 z-20 overflow-hidden">
                  <div className="py-1 max-h-60 overflow-y-auto">
                    <button
                      onClick={() => {
                        setDepartmentFilter('all');
                        setFilterOpen(false);
                      }}
                      className={`block px-4 py-2.5 text-sm w-full text-left transition-colors ${
                        departmentFilter === 'all' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      All Departments
                    </button>
                    {departments.map((dept) => (
                      <button
                        key={dept}
                        onClick={() => {
                          setDepartmentFilter(dept);
                          setFilterOpen(false);
                        }}
                        className={`block px-4 py-2.5 text-sm w-full text-left transition-colors ${
                          departmentFilter === dept ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button 
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2.5 border border-slate-200 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              disabled={loading}
              title="Refresh Data"
            >
              <RefreshCwIcon size={16} className={`text-slate-500 ${loading ? 'animate-spin text-blue-500' : ''}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center bg-white">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-sm font-medium text-slate-500">Loading staff directory...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-12 text-center bg-white">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-500 mb-4">
              <XIcon size={24} />
            </div>
            <p className="text-slate-800 font-medium">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-5 py-2.5 bg-slate-800 text-white rounded-xl shadow-sm text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead>
                  <tr className="bg-white">
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">
                      Staff ID
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">
                      Name & Contact
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">
                      Role & Dept
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredStaff.length > 0 ? (
                    filteredStaff.map((staff) => (
                      <tr key={staff._id} className="hover:bg-slate-50/80 transition-colors group cursor-default">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold text-slate-600 bg-slate-100 rounded-md tracking-wider">
                            #{staff._id ? staff._id.slice(-6).toUpperCase() : 'UNKNOWN'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-11 w-11 flex-shrink-0">
                              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200/50 shadow-sm shadow-blue-100/50">
                                {staff.firstName?.charAt(0)}{staff.lastName?.charAt(0)}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-slate-800">
                                {staff.firstName} {staff.lastName}
                              </div>
                              <div className="flex items-center text-xs font-medium text-slate-500 mt-1">
                                <MailIcon size={12} className="mr-1 text-slate-400" />
                                {staff.email}
                              </div>
                              <div className="flex items-center text-xs font-medium text-slate-500 mt-0.5">
                                <PhoneIcon size={12} className="mr-1 text-slate-400" />
                                {staff.phone || staff.phoneNumber || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-slate-700">
                            {staff.role}
                          </div>
                          <div className="text-xs font-medium text-slate-500 mt-1 capitalize flex items-center">
                            <MapPinIcon size={12} className="mr-1 text-slate-400" />
                            {staff.department}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ${
                            staff.status?.toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            staff.status?.toLowerCase() === 'on leave' || staff.status?.toLowerCase() === 'on-leave' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              staff.status?.toLowerCase() === 'active' ? 'bg-emerald-500' :
                              staff.status?.toLowerCase() === 'on leave' || staff.status?.toLowerCase() === 'on-leave' ? 'bg-amber-500' :
                              'bg-slate-400'
                            }`}></span>
                            {staff.status === 'active' ? 'Active' : 
                             staff.status === 'on-leave' ? 'On Leave' : 
                             staff.status === 'inactive' ? 'Inactive' : 
                             staff.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-1 justify-end opacity-60 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleViewStaff(staff)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                              title="View Details"
                            >
                              <EyeIcon size={18} />
                            </button>
                            <button 
                              onClick={() => onSelectStaff(staff)} 
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                              title="Edit Staff"
                            >
                              <PencilIcon size={18} />
                            </button>
                            <button 
                              onClick={() => handleDownloadPDF(staff)}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                              title="Download PDF"
                            >
                              <FileTextIcon size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteStaff(staff._id, `${staff.firstName} ${staff.lastName}`)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                              title="Delete Staff"
                            >
                              <Trash2Icon size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4 border border-slate-100">
                          <SearchIcon size={24} className="text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium">No staff members found matching your search.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* View Staff Modal */}
      {showViewModal && selectedStaff && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                Staff Details
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start">
                  <UserIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-gray-500">Name:</span>
                    <span className="ml-2 text-sm text-gray-900">
                      {selectedStaff.firstName} {selectedStaff.lastName}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MailIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email:</span>
                    <span className="ml-2 text-sm text-gray-900">{selectedStaff.email || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <PhoneIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-gray-500">Mobile:</span>
                    <span className="ml-2 text-sm text-gray-900">{selectedStaff.phone || selectedStaff.phoneNumber || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <BriefcaseIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-gray-500">Role:</span>
                    <span className="ml-2 text-sm text-gray-900">{selectedStaff.role || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <BriefcaseIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-gray-500">Department:</span>
                    <span className="ml-2 text-sm text-gray-900">{selectedStaff.department || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CalendarIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedStaff.status === 'Active' ? 'bg-green-100 text-green-800' :
                      selectedStaff.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedStaff.status}
                    </span>
                  </div>
                </div>
                
                {selectedStaff.hireDate && (
                  <div className="flex items-start">
                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-gray-500">Hire Date:</span>
                      <span className="ml-2 text-sm text-gray-900">{formatDate(selectedStaff.hireDate)}</span>
                    </div>
                  </div>
                )}
                
                {selectedStaff.address && (
                  <div className="flex items-start">
                    <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-gray-500">Address:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedStaff.address}</span>
                    </div>
                  </div>
                )}
                
                {selectedStaff._id && (
                  <div className="flex items-start">
                    <UserIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-gray-500">Staff ID:</span>
                      <span className="ml-2 text-sm text-blue-600 font-medium">{selectedStaff._id}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={handleCloseModal}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

StaffDirectory.propTypes = {
  onSelectStaff: PropTypes.func.isRequired,
  onAddStaff: PropTypes.func.isRequired
};

export default StaffDirectory;
