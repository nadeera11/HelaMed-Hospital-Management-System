import React, { useState, useEffect } from 'react';
import { 
  SearchIcon, FilterIcon, PlusIcon, EditIcon, Trash2Icon,
  ChevronDownIcon, BuildingIcon, ShieldIcon, UserCheckIcon,
  CheckIcon, SaveIcon, XIcon, AwardIcon, DownloadIcon
} from 'lucide-react';

const RolesAndDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [staff, setStaff] = useState([]);
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  useEffect(() => {
    fetchDepartments();
    fetchRoles();
    fetchStaff();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.data?.departments || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([
        { _id: '1', name: 'Cardiology', description: 'Heart and cardiovascular care', head: 'Dr. Sarah Johnson', positions: { 'Department Head': 1, 'Senior Cardiologist': 3, 'Cardiologist': 5, 'Cardiac Nurse': 8, 'Technician': 4 } },
        { _id: '2', name: 'Neurology', description: 'Brain and nervous system care', head: 'Dr. Michael Chen', positions: { 'Department Head': 1, 'Senior Neurologist': 2, 'Neurologist': 4, 'Neurology Nurse': 6, 'Technician': 3 } },
        { _id: '3', name: 'Pediatrics', description: 'Children healthcare', head: 'Dr. Robert Chen', positions: { 'Department Head': 1, 'Senior Pediatrician': 2, 'Pediatrician': 4, 'Pediatric Nurse': 6, 'Technician': 3 } },
        { _id: '4', name: 'Orthopedics', description: 'Bone and joint care', head: 'Dr. Maria Garcia', positions: { 'Department Head': 1, 'Senior Surgeon': 2, 'Orthopedic Surgeon': 4, 'Orthopedic Nurse': 6, 'Technician': 3 } },
        { _id: '5', name: 'Radiology', description: 'Medical imaging', head: 'Dr. David Wilson', positions: { 'Department Head': 1, 'Radiologist': 3, 'Head Nurse': 1, 'Radiology Nurse': 5, 'Technician': 4 } },
        { _id: '6', name: 'Emergency', description: 'Emergency medical services', head: 'Dr. Linda Brown', positions: { 'Department Head': 1, 'Senior Physician': 2, 'Emergency Physician': 4, 'Emergency Nurse': 8, 'Technician': 3 } }
      ]);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(data.data?.roles || []);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRoles([
        { _id: '1', name: 'Department Head', permissions: ['Full department access', 'Approve staff schedules', 'Approve leave requests', 'View department reports', 'Manage department budget'] },
        { _id: '2', name: 'Senior Specialist', permissions: ['Patient diagnosis and treatment', 'Supervise junior staff', 'Access to medical records', 'Limited budget approval'] }
      ]);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/staff');
      if (response.ok) {
        const data = await response.json();
        setStaff(data.data?.staff || []);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaff([
        { _id: '1', firstName: 'John', lastName: 'Smith', email: 'staff1@hospital.com', employeeId: 'EMP-1001', department: 'cardiology', role: 'cardiologist' },
        { _id: '2', firstName: 'Sarah', lastName: 'Johnson', email: 'staff2@hospital.com', employeeId: 'EMP-1002', department: 'neurology', role: 'neurologist' },
        { _id: '3', firstName: 'Robert', lastName: 'Chen', email: 'staff3@hospital.com', employeeId: 'EMP-1003', department: 'pediatrics', role: 'pediatrician' },
        { _id: '4', firstName: 'Maria', lastName: 'Garcia', email: 'staff4@hospital.com', employeeId: 'EMP-1004', department: 'orthopedics', role: 'orthopedic-surgeon' },
        { _id: '5', firstName: 'David', lastName: 'Wilson', email: 'staff5@hospital.com', employeeId: 'EMP-1005', department: 'radiology', role: 'head-nurse' },
        { _id: '6', firstName: 'Linda', lastName: 'Brown', email: 'staff6@hospital.com', employeeId: 'EMP-1006', department: 'emergency', role: 'emergency-physician' }
      ]);
    }
  };

  const handleSaveDepartment = async (departmentData) => {
    try {
      const url = editingDepartment 
        ? `http://localhost:5000/api/departments/${editingDepartment._id}`
        : 'http://localhost:5000/api/departments';
      
      const method = editingDepartment ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(departmentData)
      });

      if (response.ok) {
        fetchDepartments();
        setShowDepartmentForm(false);
        setEditingDepartment(null);
      }
    } catch (error) {
      console.error('Error saving department:', error);
    }
  };

  const handleSaveRole = async (roleData) => {
    try {
      const url = editingRole 
        ? `http://localhost:5000/api/roles/${editingRole._id}`
        : 'http://localhost:5000/api/roles';
      
      const method = editingRole ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleData)
      });

      if (response.ok) {
        fetchRoles();
        setShowRoleForm(false);
        setEditingRole(null);
      }
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const handleDeleteDepartment = async (departmentId, departmentName) => {
    if (window.confirm(`Are you sure you want to delete the ${departmentName} department? This action cannot be undone.`)) {
      try {
        const response = await fetch(`http://localhost:5000/api/departments/${departmentId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchDepartments();
          console.log('Department deleted successfully');
        } else {
          console.error('Failed to delete department');
        }
      } catch (error) {
        console.error('Error deleting department:', error);
      }
    }
  };

  const handleDeleteRole = async (roleId, roleName) => {
    if (window.confirm(`Are you sure you want to delete the ${roleName} role? This action cannot be undone.`)) {
      try {
        const response = await fetch(`http://localhost:5000/api/roles/${roleId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchRoles();
          console.log('Role deleted successfully');
        } else {
          console.error('Failed to delete role');
        }
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  const handleUpdateStaffAssignment = async (staffId, updates) => {
    try {
      const response = await fetch(`http://localhost:5000/api/staff/${staffId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        fetchStaff();
      }
    } catch (error) {
      console.error('Error updating staff assignment:', error);
    }
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !departmentFilter || member.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
  };

  const getAvatarBg = (name) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'bg-blue-500 shadow-blue-500/10',
      'bg-indigo-500 shadow-indigo-500/10',
      'bg-violet-500 shadow-violet-500/10',
      'bg-purple-500 shadow-purple-500/10',
      'bg-emerald-500 shadow-emerald-500/10',
      'bg-teal-500 shadow-teal-500/10',
      'bg-rose-500 shadow-rose-500/10'
    ];
    return colors[hash % colors.length];
  };

  const deptColors = {
    cardiology: 'bg-rose-50 border-rose-200 text-rose-700',
    neurology: 'bg-violet-50 border-violet-200 text-violet-700',
    pediatrics: 'bg-amber-50 border-amber-200 text-amber-700',
    orthopedics: 'bg-teal-50 border-teal-200 text-teal-700',
    radiology: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    emergency: 'bg-red-50 border-red-200 text-red-700',
    laboratory: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    pharmacy: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    administration: 'bg-slate-50 border-slate-200 text-slate-700'
  };

  const roleColors = {
    physician: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    doctor: 'bg-blue-50 border-blue-100 text-blue-700',
    nurse: 'bg-teal-50 border-teal-100 text-teal-700',
    'department-head': 'bg-violet-50 border-violet-100 text-violet-700',
    technician: 'bg-slate-50 border-slate-100 text-slate-700',
    administrator: 'bg-amber-50 border-amber-100 text-amber-700'
  };

  const formatDepartmentName = (dept) => {
    if (!dept) return '';
    return dept.charAt(0).toUpperCase() + dept.slice(1).replace('-', ' ');
  };

  const formatRoleName = (role) => {
    if (!role) return '';
    return role.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <UserCheckIcon className="h-8 w-8 text-blue-600" />
            Role Assignment
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Assign staff members to specific departments and define access permission controls
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button className="flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-5 py-2.5 rounded-2xl hover:bg-slate-50 hover:scale-[1.02] active:scale-95 transition-all font-bold text-sm shadow-sm">
            <DownloadIcon className="h-4 w-4" />
            Export
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all font-bold text-sm shadow-[0_4px_14px_0_rgba(37,99,235,0.3)]">
            <SaveIcon className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Main Staff Role Table Container Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Hospital Staff Listing</h2>
            <p className="text-xs text-slate-500 mt-0.5">Filter and manage structural placements in real time</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search input container */}
            <div className="relative group min-w-[240px]">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <SearchIcon className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-2xl bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-700 placeholder-slate-400"
              />
            </div>

            {/* Department Filter Selector */}
            <div className="relative min-w-[180px]">
              <select 
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-2.5 text-xs border border-slate-200 rounded-2xl bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-600"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept.name.toLowerCase()}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDownIcon className="h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Filter Toggle Button */}
            <button className="flex items-center justify-center gap-1.5 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-2xl hover:bg-slate-50 transition-all font-bold text-xs">
              <FilterIcon className="h-3.5 w-3.5" />
              Filter
            </button>
          </div>
        </div>

        {/* The Role Assignment Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Current Department
                </th>
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Current Role
                </th>
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Assign Department
                </th>
                <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Assign Role
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredStaff.length > 0 ? (
                filteredStaff.map((member) => (
                  <tr key={member._id} className="hover:bg-slate-50/40 transition-colors duration-150 group">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-black text-sm shadow-sm ${getAvatarBg(member.firstName + ' ' + member.lastName)}`}>
                          <span>{getInitials(member.firstName, member.lastName)}</span>
                        </div>
                        <div className="ml-3.5">
                          <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-xs text-slate-400 font-medium">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm font-semibold text-slate-500">
                      {member.employeeId}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-extrabold border ${
                        deptColors[member.department.toLowerCase()] || 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}>
                        {formatDepartmentName(member.department)}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-extrabold border ${
                        roleColors[member.role.toLowerCase()] || 'bg-slate-50 border-slate-150 text-slate-700'
                      }`}>
                        {formatRoleName(member.role)}
                      </span>
                    </td>
                    
                    {/* Assign Department selector */}
                    <td className="py-4 px-6 whitespace-nowrap min-w-[200px]">
                      <div className="relative">
                        <select 
                          defaultValue={member.department}
                          onChange={(e) => handleUpdateStaffAssignment(member._id, { department: e.target.value })}
                          className="w-full appearance-none pl-3.5 pr-9 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-slate-700"
                        >
                          {departments.map((dept) => (
                            <option key={dept._id} value={dept.name.toLowerCase()}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                    </td>

                    {/* Assign Role selector */}
                    <td className="py-4 px-6 whitespace-nowrap min-w-[200px]">
                      <div className="relative">
                        <select 
                          defaultValue={member.role}
                          onChange={(e) => handleUpdateStaffAssignment(member._id, { role: e.target.value })}
                          className="w-full appearance-none pl-3.5 pr-9 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-slate-700"
                        >
                          <option value="physician">Physician</option>
                          <option value="senior-physician">Senior Physician</option>
                          <option value="department-head">Department Head</option>
                          <option value="nurse">Nurse</option>
                          <option value="head-nurse">Head Nurse</option>
                          <option value="technician">Technician</option>
                          <option value="administrator">Administrator</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-sm font-bold text-slate-400 bg-slate-50/10">
                    No matching staff members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs font-bold text-slate-500">
          <span>Showing {filteredStaff.length} staff members</span>
        </div>
      </div>

      {/* Grid structure for Departments & Roles cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Department Structure List */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-100 p-6 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BuildingIcon className="h-5 w-5 text-indigo-600" />
                Department Structure
              </h3>
              <p className="text-xs text-slate-400 font-medium">Head of departments and assigned positions breakdown</p>
            </div>
            <button 
              onClick={() => setShowDepartmentForm(true)}
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 px-3 py-1.5 rounded-xl transition-all"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              Add Department
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
            {departments.map((dept) => (
              <div 
                key={dept._id} 
                className="p-4 border border-slate-150 rounded-2xl hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800 capitalize">{dept.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5 line-clamp-2">{dept.description}</p>
                    </div>
                  </div>
                  <div className="mt-3.5 space-y-1.5 pb-3.5 border-b border-dashed border-slate-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">H.O.D:</span>
                      <span className="text-slate-700 font-bold">{dept.head || 'Not Assigned'}</span>
                    </div>
                    {dept.positions && Object.entries(dept.positions).map(([position, count]) => (
                      <div key={position} className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium capitalize">{position}</span>
                        <span className="text-slate-800 font-bold bg-slate-100/80 px-2 py-0.5 rounded-lg text-[10px]">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2.5 pt-3">
                  <button 
                    onClick={() => {
                      setEditingDepartment(dept);
                      setShowDepartmentForm(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center hover:underline"
                  >
                    <EditIcon size={12} className="mr-1" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteDepartment(dept._id, dept.name)}
                    className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center hover:underline"
                  >
                    <Trash2Icon size={12} className="mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Permissions Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-100 p-6 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ShieldIcon className="h-5 w-5 text-violet-600" />
                Role Permissions
              </h3>
              <p className="text-xs text-slate-400 font-medium">Access controls and security boundaries for roles</p>
            </div>
            <button 
              onClick={() => setShowRoleForm(true)}
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 px-3 py-1.5 rounded-xl transition-all"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              Add Role
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
            {roles.map((role) => (
              <div 
                key={role._id} 
                className="p-4 border border-slate-150 rounded-2xl hover:border-violet-200 hover:shadow-md hover:shadow-violet-500/5 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800 capitalize">{role.name}</h4>
                    </div>
                  </div>
                  <div className="mt-3.5 space-y-2 pb-3.5 border-b border-slate-100">
                    {role.permissions && role.permissions.map((permission, index) => (
                      <div key={index} className="flex items-center text-xs">
                        <CheckIcon className="h-3.5 w-3.5 text-emerald-500 mr-2 flex-shrink-0" />
                        <span className="text-slate-600 font-medium">{permission}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2.5 pt-3">
                  <button 
                    onClick={() => {
                      setEditingRole(role);
                      setShowRoleForm(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center hover:underline"
                  >
                    <EditIcon size={12} className="mr-1" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteRole(role._id, role.name)}
                    className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center hover:underline"
                  >
                    <Trash2Icon size={12} className="mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DEPARTMENT MODAL FORM */}
      {showDepartmentForm && (
        <DepartmentForm
          department={editingDepartment}
          onSave={handleSaveDepartment}
          onCancel={() => {
            setShowDepartmentForm(false);
            setEditingDepartment(null);
          }}
        />
      )}

      {/* ROLE MODAL FORM */}
      {showRoleForm && (
        <RoleForm
          role={editingRole}
          onSave={handleSaveRole}
          onCancel={() => {
            setShowRoleForm(false);
            setEditingRole(null);
          }}
        />
      )}
    </div>
  );
};

const DepartmentForm = ({ department, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: department?.name || '',
    description: department?.description || '',
    head: department?.head || '',
    positions: department?.positions || {}
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
          <h3 className="text-xl font-extrabold text-slate-800">
            {department ? 'Edit Department' : 'Add New Department'}
          </h3>
          <button 
            type="button" 
            onClick={onCancel}
            className="p-1.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Department Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-700"
              placeholder="e.g. Pediatrics"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-700"
              rows="3"
              placeholder="Provide a brief description of services..."
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Department Head
            </label>
            <input
              type="text"
              value={formData.head}
              onChange={(e) => setFormData({...formData, head: e.target.value})}
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-700"
              placeholder="e.g. Dr. Robert Chen"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-slate-600 border border-slate-200 rounded-2xl hover:bg-slate-50 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-bold text-xs shadow-lg shadow-blue-600/10"
            >
              {department ? 'Update' : 'Add'} Department
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RoleForm = ({ role, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
    permissions: role?.permissions || []
  });

  const availablePermissions = [
    'Full department access',
    'Approve staff schedules',
    'Approve leave requests',
    'View department reports',
    'Manage department budget',
    'Patient diagnosis and treatment',
    'Supervise junior staff',
    'Access to medical records',
    'Limited budget approval',
    'Equipment management',
    'Inventory management'
  ];

  const handlePermissionChange = (permission) => {
    const updatedPermissions = formData.permissions.includes(permission)
      ? formData.permissions.filter(p => p !== permission)
      : [...formData.permissions, permission];
    setFormData({ ...formData, permissions: updatedPermissions });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
          <h3 className="text-xl font-extrabold text-slate-800">
            {role ? 'Edit Role' : 'Add New Role'}
          </h3>
          <button 
            type="button" 
            onClick={onCancel}
            className="p-1.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Role Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-700"
              placeholder="e.g. Cardiac Specialist"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-700"
              rows="3"
              placeholder="Brief summary of role responsibilities..."
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Permissions Access Control
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto p-3 border border-slate-150 rounded-2xl">
              {availablePermissions.map(permission => (
                <label key={permission} className="flex items-center select-none cursor-pointer py-0.5">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission)}
                    onChange={() => handlePermissionChange(permission)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                  />
                  <span className="ml-2.5 text-xs font-semibold text-slate-600">{permission}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-slate-600 border border-slate-200 rounded-2xl hover:bg-slate-50 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-bold text-xs shadow-lg shadow-blue-600/10"
            >
              {role ? 'Update' : 'Add'} Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RolesAndDepartments;
