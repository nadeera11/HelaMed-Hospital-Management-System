import React, { useState } from 'react';
import { Settings, Bell, Lock, Globe, Moon, Sun, Monitor, Shield, Eye, Database } from 'lucide-react';

export default function AccountSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Eye },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300">
          Account Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage your account preferences and application settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Sidebar Navigation */}
        <div className="md:col-span-3 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold
                  ${isActive 
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-500/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                  }`}
              >
                <Icon size={18} className={isActive ? 'text-indigo-500' : 'text-slate-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="md:col-span-9">
          <div className="glass-panel rounded-3xl p-8 shadow-lg border border-slate-200/50 dark:border-slate-800/80 min-h-[500px]">
            
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
                    <Globe className="mr-2 text-indigo-500" size={20} />
                    Region & Language
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Language</label>
                      <select className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-slate-200">
                        <option value="en">English (US)</option>
                        <option value="si">Sinhala</option>
                        <option value="ta">Tamil</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Timezone</label>
                      <select className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-slate-200">
                        <option value="asia/colombo">(GMT+5:30) Sri Jayawardenepura Kotte</option>
                        <option value="asia/kolkata">(GMT+5:30) Kolkata</option>
                      </select>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100 dark:border-slate-800" />

                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
                    <Monitor className="mr-2 text-indigo-500" size={20} />
                    Appearance
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    <button 
                      onClick={() => setTheme('light')}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${theme === 'light' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
                    >
                      <Sun size={24} className={theme === 'light' ? 'text-indigo-500' : 'text-slate-400'} />
                      <span className={`mt-2 text-sm font-semibold ${theme === 'light' ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-500'}`}>Light</span>
                    </button>
                    <button 
                      onClick={() => setTheme('dark')}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${theme === 'dark' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
                    >
                      <Moon size={24} className={theme === 'dark' ? 'text-indigo-500' : 'text-slate-400'} />
                      <span className={`mt-2 text-sm font-semibold ${theme === 'dark' ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-500'}`}>Dark</span>
                    </button>
                    <button 
                      onClick={() => setTheme('system')}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${theme === 'system' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
                    >
                      <Monitor size={24} className={theme === 'system' ? 'text-indigo-500' : 'text-slate-400'} />
                      <span className={`mt-2 text-sm font-semibold ${theme === 'system' ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-500'}`}>System</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-3">
                    Note: Complete theme toggle is also available via the command palette or sidebar.
                  </p>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
                    <Shield className="mr-2 text-teal-500" size={20} />
                    Password & Authentication
                  </h2>
                  
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex justify-between items-center mb-4">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Change Password</p>
                      <p className="text-xs text-slate-500 mt-1">Last changed 3 months ago</p>
                    </div>
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm">
                      Update
                    </button>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Two-Factor Authentication (2FA)</p>
                      <p className="text-xs text-slate-500 mt-1">Add an extra layer of security to your account.</p>
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition shadow-md">
                      Enable
                    </button>
                  </div>
                </div>

                <hr className="border-slate-100 dark:border-slate-800" />
                
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Active Sessions</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 border border-slate-100 dark:border-slate-800 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                          <Monitor size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Windows 11 • Chrome</p>
                          <p className="text-xs text-green-600 mt-0.5">Active now • Colombo, LK</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-4 border border-slate-100 dark:border-slate-800 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg">
                          <Monitor size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">MacBook Pro • Safari</p>
                          <p className="text-xs text-slate-500 mt-0.5">Last active 2 days ago • Colombo, LK</p>
                        </div>
                      </div>
                      <button className="text-rose-500 hover:text-rose-600 text-sm font-semibold px-3 py-1 bg-rose-50 dark:bg-rose-500/10 rounded-lg transition-colors">
                        Revoke
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center">
                  <Bell className="mr-2 text-rose-500" size={20} />
                  Notification Preferences
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">System Alerts</p>
                      <p className="text-xs text-slate-500">Critical system updates and security alerts</p>
                    </div>
                    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="toggle" id="toggle1" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-indigo-500 translate-x-6 transition-transform" defaultChecked disabled />
                        <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-6 rounded-full bg-indigo-500 cursor-pointer"></label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Task Assignments</p>
                      <p className="text-xs text-slate-500">When you are assigned to a new shift or task</p>
                    </div>
                    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="toggle" id="toggle2" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-indigo-500 translate-x-6 transition-transform" defaultChecked />
                        <label htmlFor="toggle2" className="toggle-label block overflow-hidden h-6 rounded-full bg-indigo-500 cursor-pointer"></label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Email Digest</p>
                      <p className="text-xs text-slate-500">Receive a daily summary of hospital operations</p>
                    </div>
                    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="toggle" id="toggle3" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 transition-transform" />
                        <label htmlFor="toggle3" className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-300 dark:bg-slate-700 cursor-pointer"></label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center">
                  <Database className="mr-2 text-blue-500" size={20} />
                  Data & Privacy
                </h2>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-sm text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50 mb-6">
                  Your data privacy is important to us. HelaMed complies with national healthcare data protection standards.
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Profile Visibility</p>
                      <p className="text-xs text-slate-500">Who can see your contact details</p>
                    </div>
                    <select className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none text-sm dark:text-slate-200">
                      <option>All Staff</option>
                      <option>Department Only</option>
                      <option>Only Admins</option>
                    </select>
                  </div>
                  
                  <hr className="border-slate-100 dark:border-slate-800" />
                  
                  <div className="pt-4">
                    <button className="text-rose-600 hover:text-rose-700 font-semibold text-sm flex items-center">
                      Request Account Deactivation
                    </button>
                    <p className="text-xs text-slate-500 mt-1">This will send a formal request to system administrators.</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}