import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Camera, Save, X, Edit3, Shield, Key } from 'lucide-react';

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'Admin User',
    email: 'admin@helamed.lk',
    role: 'Admin',
    phone: '+94 77 123 4567',
    location: 'Colombo, Sri Lanka',
    department: 'Management',
    joinedDate: 'Jan 2023',
    bio: 'Dedicated hospital administrator overseeing general operations and staff management.'
  });

  const [editForm, setEditForm] = useState({ ...userInfo });

  useEffect(() => {
    // Attempt to load from localStorage
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const merged = { ...userInfo, ...parsed };
        setUserInfo(merged);
        setEditForm(merged);
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setUserInfo(editForm);
    localStorage.setItem('user', JSON.stringify(editForm));
    setIsEditing(false);
    // In a real app we would call the backend here
  };

  const handleCancel = () => {
    setEditForm({ ...userInfo });
    setIsEditing(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300">
            My Profile
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal information and profile settings
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Edit3 size={16} className="mr-2 text-indigo-500" />
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel rounded-3xl p-6 text-center shadow-lg border border-slate-200/50 dark:border-slate-800/80 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-indigo-500/20 to-teal-500/20 dark:from-indigo-500/10 dark:to-teal-500/10"></div>
            
            <div className="relative inline-block mt-4 mb-4">
              <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-teal-500 p-1 shadow-xl">
                <div className="w-full h-full rounded-full border-4 border-white dark:border-slate-950 flex items-center justify-center bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <User size={48} className="text-slate-400" />
                </div>
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors">
                  <Camera size={16} />
                </button>
              )}
            </div>

            <h2 className="text-xl font-bold dark:text-white capitalize">{userInfo.name}</h2>
            <p className="text-indigo-600 dark:text-indigo-400 font-medium text-sm capitalize">{userInfo.role}</p>

            <div className="mt-6 flex flex-col space-y-3 text-left">
              <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                <Mail size={16} className="mr-3 text-slate-400" />
                <span className="truncate">{userInfo.email}</span>
              </div>
              <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                <Briefcase size={16} className="mr-3 text-slate-400" />
                <span className="capitalize">{userInfo.department}</span>
              </div>
              <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                <MapPin size={16} className="mr-3 text-slate-400" />
                <span>{userInfo.location}</span>
              </div>
            </div>
          </div>
          
          <div className="glass-panel rounded-3xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-800/80">
             <div className="flex items-center space-x-3 text-slate-800 dark:text-slate-200 font-semibold mb-4">
               <Shield size={18} className="text-teal-500" />
               <h3>Security Overview</h3>
             </div>
             <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Password</span>
                  <span className="text-green-500 font-medium">Strong</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">2FA</span>
                  <span className="text-rose-500 font-medium">Disabled</span>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Details & Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl p-8 shadow-lg border border-slate-200/50 dark:border-slate-800/80 h-full">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              Personal Information
            </h2>

            {isEditing ? (
              <div className="space-y-5 animate-scale-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={editForm.name} 
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      value={editForm.email} 
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all dark:text-white opacity-70 cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone Number</label>
                    <input 
                      type="text" 
                      name="phone"
                      value={editForm.phone} 
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</label>
                    <input 
                      type="text" 
                      name="location"
                      value={editForm.location} 
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bio</label>
                  <textarea 
                    name="bio"
                    value={editForm.bio} 
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all dark:text-white resize-none"
                  ></textarea>
                </div>

                <div className="flex space-x-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={handleSave}
                    className="flex-1 lg:flex-none flex justify-center items-center px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl shadow-md font-semibold transition-all hover:-translate-y-0.5"
                  >
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="flex-1 lg:flex-none flex justify-center items-center px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl shadow-sm font-semibold transition-all"
                  >
                    <X size={16} className="mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
                    <p className="text-slate-800 dark:text-slate-200 font-medium">{userInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
                    <p className="text-slate-800 dark:text-slate-200 font-medium">{userInfo.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Phone Number</p>
                    <p className="text-slate-800 dark:text-slate-200 font-medium">{userInfo.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Role / Position</p>
                    <p className="text-slate-800 dark:text-slate-200 font-medium capitalize">{userInfo.role}</p>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bio</p>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    {userInfo.bio}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}