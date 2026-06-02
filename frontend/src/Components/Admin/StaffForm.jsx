import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  ChevronLeftIcon, EyeIcon, EyeOffIcon, UserIcon, MailIcon, PhoneIcon, 
  SaveIcon, AlertCircleIcon, CheckCircle2Icon, LockIcon,
  SearchIcon, ChevronDownIcon, CheckIcon, BuildingIcon, AwardIcon
} from 'lucide-react';

export function StaffForm({ 
  editMode = false, 
  staffData = null, 
  onSubmit, 
  onCancel 
}) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown open states
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isSpecOpen, setIsSpecOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Search states for dropdowns
  const [deptSearch, setDeptSearch] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [specSearch, setSpecSearch] = useState('');

  const [formData, setFormData] = useState({
    firstName: staffData?.firstName || '',
    lastName: staffData?.lastName || '',
    email: staffData?.email || '',
    phone: staffData?.phone || '',
    department: staffData?.department || '',
    role: staffData?.role || '',
    specialization: staffData?.specialization || '',
    status: staffData?.status || 'active',
    password: '',
    confirmPassword: ''
  });

  const totalSteps = editMode ? 2 : 3;

  const departments = [
    'cardiology',
    'neurology', 
    'orthopedics',
    'pediatrics',
    'radiology',
    'emergency',
    'surgery',
    'icu',
    'laboratory',
    'pharmacy',
    'administration'
  ];

  const roles = [
    'physician',
    'nurse',
    'doctor',
    'department-head',
    'technician',
    'administrator',
    'pharmacist',
    'lab-technician',
    'receptionist'
  ];

  const specializations = [
    'cardiology',
    'dermatology',
    'endocrinology',
    'gastroenterology',
    'neurology',
    'oncology',
    'orthopedics',
    'pediatrics',
    'psychiatry',
    'radiology',
    'surgery',
    'urology',
    'emergency-medicine',
    'family-medicine',
    'internal-medicine',
    'obstetrics-gynecology'
  ];

  const deptIcons = {
    cardiology: '❤️',
    neurology: '🧠', 
    orthopedics: '🦴',
    pediatrics: '👶',
    radiology: '🩻',
    emergency: '🚨',
    surgery: '🔪',
    icu: '🏥',
    laboratory: '🔬',
    pharmacy: '💊',
    administration: '💼'
  };

  const roleIcons = {
    physician: '🩺',
    nurse: '👩‍⚕️',
    doctor: '🥼',
    'department-head': '👑',
    technician: '⚙️',
    administrator: '📊',
    pharmacist: '💊',
    'lab-technician': '🧪',
    receptionist: '📞'
  };

  const statusMap = {
    active: { label: 'Active', emoji: '🟢', color: 'text-green-600 bg-green-50 border-green-200' },
    'on-leave': { label: 'On Leave', emoji: '🟡', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    inactive: { label: 'Inactive', emoji: '🔴', color: 'text-rose-600 bg-rose-50 border-rose-200' }
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setIsDeptOpen(false);
      setIsRoleOpen(false);
      setIsSpecOpen(false);
      setIsStatusOpen(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const getPasswordStrength = (pass) => {
    if (!pass) return { text: 'Empty', score: 0, color: 'bg-slate-200 w-0', textColor: 'text-slate-400' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { text: 'Weak ⚠️', score, color: 'bg-rose-500 w-1/3', textColor: 'text-rose-500' };
    if (score <= 4) return { text: 'Medium ⚡', score, color: 'bg-amber-500 w-2/3', textColor: 'text-amber-500' };
    return { text: 'Strong ✨', score, color: 'bg-emerald-500 w-full', textColor: 'text-emerald-500' };
  };

  // Live validator helpers
  const isValidField = (name, val) => {
    if (!val) return false;
    if (name === 'firstName' || name === 'lastName') {
      return /^[a-zA-Z\s]+$/.test(val);
    }
    if (name === 'email') {
      const emailDomain = val.toLowerCase();
      const basicEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val);
      const correctDomain = emailDomain.includes('@gmail.com') || 
                            emailDomain.includes('@email.com') ||
                            emailDomain.includes('@mail.com') ||
                            emailDomain.includes('@hospital.com');
      return basicEmail && correctDomain;
    }
    if (name === 'phone') {
      return val.startsWith('0') && val.length === 10 && /^[0-9]+$/.test(val);
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;
    
    if (name === 'firstName' || name === 'lastName') {
      sanitizedValue = value.replace(/[^a-zA-Z\s]/g, '');
    }
    
    if (name === 'phone') {
      sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    }
    
    setFormData(prev => {
      const newFormData = { ...prev, [name]: sanitizedValue };
      if (name === 'role' && value !== 'doctor') {
        newFormData.specialization = '';
      }
      return newFormData;
    });
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (stepNum) => {
    const newErrors = { ...errors };
    let isValid = true;
    
    if (stepNum === 1) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
        isValid = false;
      } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
        newErrors.firstName = 'First name cannot contain numbers or symbols';
        isValid = false;
      } else {
        delete newErrors.firstName;
      }

      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
        isValid = false;
      } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
        newErrors.lastName = 'Last name cannot contain numbers or symbols';
        isValid = false;
      } else {
        delete newErrors.lastName;
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
        isValid = false;
      } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
        newErrors.email = 'Invalid email address format';
        isValid = false;
      } else if (!formData.email.toLowerCase().includes('@gmail.com') && 
                 !formData.email.toLowerCase().includes('@email.com') &&
                 !formData.email.toLowerCase().includes('@mail.com') &&
                 !formData.email.toLowerCase().includes('@hospital.com')) {
        newErrors.email = 'Please use a valid email domain (e.g., gmail.com, email.com, hospital.com)';
        isValid = false;
      } else {
        delete newErrors.email;
      }

      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
        isValid = false;
      } else if (!/^[0-9]+$/.test(formData.phone)) {
        newErrors.phone = 'Phone number cannot contain letters or symbols';
        isValid = false;
      } else if (!formData.phone.startsWith('0')) {
        newErrors.phone = 'Phone number must start with 0';
        isValid = false;
      } else if (formData.phone.length !== 10) {
        newErrors.phone = 'Phone number must be exactly 10 digits';
        isValid = false;
      } else {
        delete newErrors.phone;
      }
    }

    if (stepNum === 2) {
      if (!formData.department) {
        newErrors.department = 'Department is required';
        isValid = false;
      } else {
        delete newErrors.department;
      }

      if (!formData.role) {
        newErrors.role = 'Role is required';
        isValid = false;
      } else {
        delete newErrors.role;
      }

      if (formData.role === 'doctor' && !formData.specialization) {
        newErrors.specialization = 'Specialization is required for doctors';
        isValid = false;
      } else {
        delete newErrors.specialization;
      }
    }

    if (stepNum === 3 && !editMode) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
        isValid = false;
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
        isValid = false;
      } else {
        delete newErrors.password;
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm password';
        isValid = false;
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
        isValid = false;
      } else {
        delete newErrors.confirmPassword;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Validate current step
    if (!validateStep(step)) {
      return;
    }

    // Double check overall form validity
    let overallValid = true;
    for (let i = 1; i <= totalSteps; i++) {
      if (!validateStep(i)) {
        setStep(i);
        overallValid = false;
        break;
      }
    }

    if (!overallValid) return;

    setIsSubmitting(true);
    
    try {
      const submitData = { ...formData };
      if (editMode) {
        delete submitData.password;
        delete submitData.confirmPassword;
      }
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error saving staff:', error);
      setErrors({ submit: error?.message || 'Failed to save staff member. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered dropdown lists based on searches
  const filteredDepartments = departments.filter(d => 
    d.toLowerCase().includes(deptSearch.toLowerCase())
  );

  const filteredRoles = roles.filter(r => 
    r.toLowerCase().includes(roleSearch.toLowerCase())
  );

  const filteredSpecs = specializations.filter(s => 
    s.toLowerCase().includes(specSearch.toLowerCase())
  );

  const pwdStrength = getPasswordStrength(formData.password);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-100">
        <div className="flex items-center space-x-4">
          <button
            onClick={onCancel}
            type="button"
            className="group flex items-center justify-center h-11 w-11 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 hover:scale-105 transition-all shadow-sm duration-200"
            title="Back to Staff Directory"
          >
            <ChevronLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              {editMode ? 'Edit Staff Member' : 'Add New Staff Member'}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              {editMode ? 'Update existing staff details and permissions' : 'Fill in the information to register a new staff member'}
            </p>
          </div>
        </div>

        {/* Step progress pills */}
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          {[1, 2, 3].map((num) => {
            if (num > totalSteps) return null;
            const isCompleted = step > num;
            const isActive = step === num;
            return (
              <React.Fragment key={num}>
                <div className="flex items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                      : isActive 
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-lg shadow-blue-600/20'
                        : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isCompleted ? <CheckIcon className="h-4 w-4" /> : num}
                  </div>
                  <span className={`ml-2 text-xs font-bold hidden sm:inline ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                    {num === 1 ? 'Personal' : num === 2 ? 'Employment' : 'Security'}
                  </span>
                </div>
                {num < totalSteps && (
                  <div className={`w-8 h-[2px] transition-all duration-300 ${step > num ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {errors.submit && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center shadow-sm">
          <AlertCircleIcon className="h-5 w-5 text-rose-500 mr-3 flex-shrink-0" />
          <span className="text-rose-700 font-bold text-sm">{errors.submit}</span>
        </div>
      )}

      {/* Main Container Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-100 overflow-hidden">
        {/* Dynamic header banner color depending on step */}
        <div className={`h-2 transition-all duration-500 ${
          step === 1 ? 'bg-blue-600' : step === 2 ? 'bg-indigo-600' : 'bg-violet-600'
        }`} />

        <form onSubmit={handleSubmit} className="p-8">
          
          {/* STEP 1: PERSONAL INFORMATION */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                  Personal Information
                </h2>
                <p className="text-xs text-slate-500 font-medium">Provide the staff member's core identity details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <UserIcon className={`h-4 w-4 transition-colors duration-200 ${
                        errors.firstName ? 'text-rose-500' : formData.firstName ? 'text-emerald-500' : 'text-slate-400 group-focus-within:text-blue-500'
                      }`} />
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-10 py-3 text-sm border rounded-2xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 font-medium text-slate-700 ${
                        errors.firstName 
                          ? 'border-rose-300 focus:border-rose-500 ring-rose-500/10' 
                          : isValidField('firstName', formData.firstName)
                            ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/10 bg-emerald-50/5'
                            : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
                      }`}
                      placeholder="e.g. John"
                    />
                    {isValidField('firstName', formData.firstName) && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <CheckCircle2Icon className="h-4 w-4 text-emerald-500" />
                      </div>
                    )}
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-xs font-semibold text-rose-500 flex items-center"><AlertCircleIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />{errors.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <UserIcon className={`h-4 w-4 transition-colors duration-200 ${
                        errors.lastName ? 'text-rose-500' : formData.lastName ? 'text-emerald-500' : 'text-slate-400 group-focus-within:text-blue-500'
                      }`} />
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-10 py-3 text-sm border rounded-2xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 font-medium text-slate-700 ${
                        errors.lastName 
                          ? 'border-rose-300 focus:border-rose-500 ring-rose-500/10' 
                          : isValidField('lastName', formData.lastName)
                            ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/10 bg-emerald-50/5'
                            : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
                      }`}
                      placeholder="e.g. Doe"
                    />
                    {isValidField('lastName', formData.lastName) && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <CheckCircle2Icon className="h-4 w-4 text-emerald-500" />
                      </div>
                    )}
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-xs font-semibold text-rose-500 flex items-center"><AlertCircleIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />{errors.lastName}</p>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <MailIcon className={`h-4 w-4 transition-colors duration-200 ${
                        errors.email ? 'text-rose-500' : formData.email ? 'text-emerald-500' : 'text-slate-400 group-focus-within:text-blue-500'
                      }`} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-10 py-3 text-sm border rounded-2xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 font-medium text-slate-700 ${
                        errors.email 
                          ? 'border-rose-300 focus:border-rose-500 ring-rose-500/10' 
                          : isValidField('email', formData.email)
                            ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/10 bg-emerald-50/5'
                            : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
                      }`}
                      placeholder="john.doe@hospital.com"
                    />
                    {isValidField('email', formData.email) && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <CheckCircle2Icon className="h-4 w-4 text-emerald-500" />
                      </div>
                    )}
                  </div>
                  {errors.email ? (
                    <p className="mt-1 text-xs font-semibold text-rose-500 flex items-center"><AlertCircleIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />{errors.email}</p>
                  ) : (
                    <p className="text-[11px] font-medium text-slate-400 mt-1">Acceptable domains: gmail.com, email.com, mail.com, hospital.com</p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <PhoneIcon className={`h-4 w-4 transition-colors duration-200 ${
                        errors.phone ? 'text-rose-500' : formData.phone ? 'text-emerald-500' : 'text-slate-400 group-focus-within:text-blue-500'
                      }`} />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength="10"
                      className={`w-full pl-10 pr-10 py-3 text-sm border rounded-2xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 font-medium text-slate-700 ${
                        errors.phone 
                          ? 'border-rose-300 focus:border-rose-500 ring-rose-500/10' 
                          : isValidField('phone', formData.phone)
                            ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/10 bg-emerald-50/5'
                            : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
                      }`}
                      placeholder="0712345678"
                    />
                    {isValidField('phone', formData.phone) && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <CheckCircle2Icon className="h-4 w-4 text-emerald-500" />
                      </div>
                    )}
                  </div>
                  {errors.phone ? (
                    <p className="mt-1 text-xs font-semibold text-rose-500 flex items-center"><AlertCircleIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />{errors.phone}</p>
                  ) : (
                    <p className="text-[11px] font-medium text-slate-400 mt-1">Format: 10 digits starting with '0'</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: EMPLOYMENT DETAILS */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  <BuildingIcon className="h-5 w-5 text-indigo-600" />
                  Employment Details
                </h2>
                <p className="text-xs text-slate-500 font-medium">Assign work parameters, roles, and current standing</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Department Selector */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setIsDeptOpen(!isDeptOpen); }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm border rounded-2xl bg-white focus:outline-none focus:ring-4 transition-all font-medium text-left ${
                        errors.department 
                          ? 'border-rose-300 focus:border-rose-500 ring-rose-500/10' 
                          : formData.department
                            ? 'border-indigo-300 focus:border-indigo-500 ring-indigo-500/10'
                            : 'border-slate-200 focus:ring-blue-500/10'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {formData.department ? (
                          <>
                            <span className="text-lg">{deptIcons[formData.department]}</span>
                            <span className="capitalize">{formData.department.replace('-', ' ')}</span>
                          </>
                        ) : (
                          <span className="text-slate-400">Select Department</span>
                        )}
                      </span>
                      <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                    </button>

                    {isDeptOpen && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute z-30 w-full mt-2 bg-white border border-slate-150 rounded-2xl shadow-xl overflow-hidden"
                      >
                        <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                          <SearchIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <input
                            type="text"
                            placeholder="Search departments..."
                            value={deptSearch}
                            onChange={(e) => setDeptSearch(e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-xs font-semibold py-1 text-slate-700 placeholder-slate-400 focus:ring-0"
                          />
                        </div>
                        <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
                          {filteredDepartments.length > 0 ? (
                            filteredDepartments.map((dept) => (
                              <button
                                key={dept}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, department: dept }));
                                  setIsDeptOpen(false);
                                  if (errors.department) setErrors(prev => ({ ...prev, department: '' }));
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-bold transition-all ${
                                  formData.department === dept 
                                    ? 'bg-indigo-50 text-indigo-700' 
                                    : 'hover:bg-slate-50 text-slate-600'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span>{deptIcons[dept]}</span>
                                  <span className="capitalize">{dept.replace('-', ' ')}</span>
                                </span>
                                {formData.department === dept && <CheckIcon className="h-3.5 w-3.5 text-indigo-600" />}
                              </button>
                            ))
                          ) : (
                            <div className="text-center py-4 text-xs font-medium text-slate-400">No departments match search</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.department && (
                    <p className="mt-1 text-xs font-semibold text-rose-500 flex items-center"><AlertCircleIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />{errors.department}</p>
                  )}
                </div>

                {/* Role Selector */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">
                    Role <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setIsRoleOpen(!isRoleOpen); }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm border rounded-2xl bg-white focus:outline-none focus:ring-4 transition-all font-medium text-left ${
                        errors.role 
                          ? 'border-rose-300 focus:border-rose-500 ring-rose-500/10' 
                          : formData.role
                            ? 'border-indigo-300 focus:border-indigo-500 ring-indigo-500/10'
                            : 'border-slate-200 focus:ring-blue-500/10'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {formData.role ? (
                          <>
                            <span className="text-lg">{roleIcons[formData.role]}</span>
                            <span className="capitalize">{formData.role.replace('-', ' ')}</span>
                          </>
                        ) : (
                          <span className="text-slate-400">Select Role</span>
                        )}
                      </span>
                      <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                    </button>

                    {isRoleOpen && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute z-30 w-full mt-2 bg-white border border-slate-150 rounded-2xl shadow-xl overflow-hidden"
                      >
                        <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                          <SearchIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <input
                            type="text"
                            placeholder="Search roles..."
                            value={roleSearch}
                            onChange={(e) => setRoleSearch(e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-xs font-semibold py-1 text-slate-700 placeholder-slate-400 focus:ring-0"
                          />
                        </div>
                        <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
                          {filteredRoles.length > 0 ? (
                            filteredRoles.map((role) => (
                              <button
                                key={role}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => {
                                    const next = { ...prev, role };
                                    if (role !== 'doctor') next.specialization = '';
                                    return next;
                                  });
                                  setIsRoleOpen(false);
                                  if (errors.role) setErrors(prev => ({ ...prev, role: '' }));
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-bold transition-all ${
                                  formData.role === role 
                                    ? 'bg-indigo-50 text-indigo-700' 
                                    : 'hover:bg-slate-50 text-slate-600'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span>{roleIcons[role]}</span>
                                  <span className="capitalize">{role.replace('-', ' ')}</span>
                                </span>
                                {formData.role === role && <CheckIcon className="h-3.5 w-3.5 text-indigo-600" />}
                              </button>
                            ))
                          ) : (
                            <div className="text-center py-4 text-xs font-medium text-slate-400">No roles match search</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.role && (
                    <p className="mt-1 text-xs font-semibold text-rose-500 flex items-center"><AlertCircleIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />{errors.role}</p>
                  )}
                </div>

                {/* Specialization (Doctor only) */}
                {formData.role === 'doctor' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">
                      Specialization <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setIsSpecOpen(!isSpecOpen); }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm border rounded-2xl bg-white focus:outline-none focus:ring-4 transition-all font-medium text-left ${
                          errors.specialization 
                            ? 'border-rose-300 focus:border-rose-500 ring-rose-500/10' 
                            : formData.specialization
                              ? 'border-indigo-300 focus:border-indigo-500 ring-indigo-500/10'
                              : 'border-slate-200 focus:ring-blue-500/10'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {formData.specialization ? (
                            <>
                              <AwardIcon className="h-4 w-4 text-indigo-500" />
                              <span className="capitalize">{formData.specialization.replace('-', ' ')}</span>
                            </>
                          ) : (
                            <span className="text-slate-400">Select Specialization</span>
                          )}
                        </span>
                        <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                      </button>

                      {isSpecOpen && (
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className="absolute z-30 w-full mt-2 bg-white border border-slate-150 rounded-2xl shadow-xl overflow-hidden"
                        >
                          <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                            <SearchIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <input
                              type="text"
                              placeholder="Search specializations..."
                              value={specSearch}
                              onChange={(e) => setSpecSearch(e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-xs font-semibold py-1 text-slate-700 placeholder-slate-400 focus:ring-0"
                            />
                          </div>
                          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
                            {filteredSpecs.length > 0 ? (
                              filteredSpecs.map((spec) => (
                                <button
                                  key={spec}
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, specialization: spec }));
                                    setIsSpecOpen(false);
                                    if (errors.specialization) setErrors(prev => ({ ...prev, specialization: '' }));
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-bold transition-all ${
                                    formData.specialization === spec 
                                      ? 'bg-indigo-50 text-indigo-700' 
                                      : 'hover:bg-slate-50 text-slate-600'
                                  }`}
                                >
                                  <span className="capitalize">{spec.replace('-', ' ')}</span>
                                  {formData.specialization === spec && <CheckIcon className="h-3.5 w-3.5 text-indigo-600" />}
                                </button>
                              ))
                            ) : (
                              <div className="text-center py-4 text-xs font-medium text-slate-400">No specializations match search</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {errors.specialization && (
                      <p className="mt-1 text-xs font-semibold text-rose-500 flex items-center"><AlertCircleIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />{errors.specialization}</p>
                    )}
                  </div>
                )}

                {/* Status Selector */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">
                    Status
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setIsStatusOpen(!isStatusOpen); }}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm border border-slate-200 rounded-2xl bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-left"
                    >
                      <span className="flex items-center gap-2">
                        <span>{statusMap[formData.status]?.emoji}</span>
                        <span>{statusMap[formData.status]?.label}</span>
                      </span>
                      <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                    </button>

                    {isStatusOpen && (
                      <div className="absolute z-30 w-full mt-2 bg-white border border-slate-150 rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-1.5 space-y-0.5">
                          {Object.entries(statusMap).map(([statusKey, { label, emoji }]) => (
                            <button
                              key={statusKey}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, status: statusKey }));
                                setIsStatusOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-xl font-bold transition-all ${
                                formData.status === statusKey 
                                  ? 'bg-slate-50 text-slate-800' 
                                  : 'hover:bg-slate-50/50 text-slate-600'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span>{emoji}</span>
                                <span>{label}</span>
                              </span>
                              {formData.status === statusKey && <CheckIcon className="h-3.5 w-3.5 text-indigo-600" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SECURITY DETAILS (skipped in editMode) */}
          {step === 3 && !editMode && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  <LockIcon className="h-5 w-5 text-violet-600" />
                  Account Security
                </h2>
                <p className="text-xs text-slate-500 font-medium">Create visual credentials for authentication access</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <LockIcon className={`h-4 w-4 transition-colors duration-200 ${
                        errors.password ? 'text-rose-500' : formData.password ? 'text-emerald-500' : 'text-slate-400 group-focus-within:text-violet-500'
                      }`} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-10 py-3 text-sm border rounded-2xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 font-medium text-slate-700 ${
                        errors.password 
                          ? 'border-rose-300 focus:border-rose-500 ring-rose-500/10' 
                          : formData.password && pwdStrength.score >= 4
                            ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/10'
                            : 'border-slate-200 focus:border-violet-500 focus:ring-violet-500/10'
                      }`}
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-violet-500 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-500">Security Strength:</span>
                        <span className={`${pwdStrength.textColor}`}>{pwdStrength.text}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-300 rounded-full ${pwdStrength.color}`} />
                      </div>
                    </div>
                  )}

                  {errors.password && (
                    <p className="mt-1 text-xs font-semibold text-rose-500 flex items-center"><AlertCircleIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <LockIcon className={`h-4 w-4 transition-colors duration-200 ${
                        errors.confirmPassword ? 'text-rose-500' : formData.confirmPassword ? 'text-emerald-500' : 'text-slate-400 group-focus-within:text-violet-500'
                      }`} />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-10 py-3 text-sm border rounded-2xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 font-medium text-slate-700 ${
                        errors.confirmPassword 
                          ? 'border-rose-300 focus:border-rose-500 ring-rose-500/10' 
                          : formData.confirmPassword && formData.password === formData.confirmPassword
                            ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/10'
                            : 'border-slate-200 focus:border-violet-500 focus:ring-violet-500/10'
                      }`}
                      placeholder="Must match password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-violet-500 transition-colors duration-200"
                    >
                      {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs font-semibold text-rose-500 flex items-center"><AlertCircleIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Buttons Navigation Bar */}
          <div className="bg-slate-50/50 -mx-8 -mb-8 p-8 border-t border-slate-100 flex justify-between items-center mt-12">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-5 py-3 border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-100 hover:text-slate-800 hover:scale-[1.02] active:scale-95 transition-all font-extrabold text-sm shadow-sm"
                >
                  Back
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-3 border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-100 hover:text-slate-800 hover:scale-[1.02] active:scale-95 transition-all font-extrabold text-sm shadow-sm"
              >
                Cancel
              </button>

              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all font-extrabold text-sm shadow-[0_4px_14px_0_rgba(37,99,235,0.3)] flex items-center"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 transition-all font-extrabold text-sm shadow-[0_4px_14px_0_rgba(16,185,129,0.3)] flex items-center"
                >
                  <SaveIcon className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : editMode ? 'Update Staff Member' : 'Register Staff'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

StaffForm.propTypes = {
  editMode: PropTypes.bool,
  staffData: PropTypes.shape({
    id: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    department: PropTypes.string,
    role: PropTypes.string,
    status: PropTypes.string
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};
