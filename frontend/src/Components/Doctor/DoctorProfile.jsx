import React, { useEffect, useState } from 'react';
import { UserIcon, MailIcon, PhoneIcon, MapPinIcon, SaveIcon, Edit3Icon, XIcon } from 'lucide-react';
import { userService } from '../../utils/api';

const emptyForm = {
  name: '',
  email: '',
  mobileNumber: '',
  dob: '',
  gender: 'other',
  address: '',
  department: '',
  specialization: ''
};

export default function DoctorProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userId, setUserId] = useState('');
  const [isStaffDoctor, setIsStaffDoctor] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [originalData, setOriginalData] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const parsed = stored ? JSON.parse(stored) : null;
    const id = parsed?._id || parsed?.id || localStorage.getItem('user_id') || '';

    if (!id) {
      setError('Unable to load profile. Please log in again.');
      setLoading(false);
      return;
    }

    const isDoctorRole = parsed?.role === 'doctor';
    setIsStaffDoctor(isDoctorRole);
    setUserId(id);

    const hydrateFromUser = {
      name: parsed?.name || `${parsed?.firstName || ''} ${parsed?.lastName || ''}`.trim(),
      email: parsed?.email || '',
      mobileNumber: parsed?.mobileNumber || parsed?.phone || '',
      dob: parsed?.dob ? parsed.dob.split('T')[0] : '',
      gender: parsed?.gender || 'other',
      address: parsed?.address || '',
      department: parsed?.department || '',
      specialization: parsed?.specialization || ''
    };

    setFormData(hydrateFromUser);
    setOriginalData(hydrateFromUser);

    const loadStaffProfile = async () => {
      if (!isDoctorRole) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/staff/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load staff profile');
        }

        const data = await response.json();
        const staff = data?.data?.staff || data?.staff || data;

        const addressString = staff?.address && typeof staff.address === 'object'
          ? [staff.address.street, staff.address.city, staff.address.state, staff.address.zipCode, staff.address.country]
              .filter(Boolean)
              .join(', ')
          : staff?.address || '';

        const hydrated = {
          name: `${staff?.firstName || ''} ${staff?.lastName || ''}`.trim(),
          email: staff?.email || hydrateFromUser.email,
          mobileNumber: staff?.phone || '',
          dob: '',
          gender: 'other',
          address: addressString,
          department: staff?.department || '',
          specialization: staff?.specialization || ''
        };

        setFormData(hydrated);
        setOriginalData(hydrated);
      } catch (err) {
        console.error('Failed to load staff profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStaffProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    setError('');
  };

  const handleSave = async () => {
    if (!userId) {
      setError('Unable to update profile. Please log in again.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const trimmedName = formData.name.trim();
      const [firstName = '', ...rest] = trimmedName.split(' ');
      const lastName = rest.join(' ').trim();

      const payload = isStaffDoctor ? {
        firstName,
        lastName,
        phone: formData.mobileNumber.trim(),
        address: formData.address.trim() ? { street: formData.address.trim() } : undefined
      } : {
        name: trimmedName,
        email: formData.email.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        dob: formData.dob || null,
        gender: formData.gender,
        address: formData.address.trim()
      };

      const updated = isStaffDoctor
        ? await fetch(`http://localhost:5000/api/staff/${userId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(payload)
          }).then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to update profile.')))
        : await userService.update(userId, payload);

      const stored = localStorage.getItem('user');
      const parsed = stored ? JSON.parse(stored) : {};
      const updatedUser = isStaffDoctor ? (updated?.data?.staff || updated?.staff || updated) : updated;
      const merged = { ...parsed, ...updatedUser };

      localStorage.setItem('user', JSON.stringify(merged));
      if (merged.name) {
        localStorage.setItem('user_name', merged.name);
      }

      const addressValue = isStaffDoctor
        ? (merged.address && typeof merged.address === 'object'
            ? [merged.address.street, merged.address.city, merged.address.state, merged.address.zipCode, merged.address.country]
                .filter(Boolean)
                .join(', ')
            : merged.address) || payload.address?.street || ''
        : merged.address || payload.address;

      setOriginalData({
        name: merged.name || `${merged.firstName || ''} ${merged.lastName || ''}`.trim() || payload.name,
        email: merged.email || payload.email,
        mobileNumber: merged.mobileNumber || merged.phone || payload.mobileNumber || '',
        dob: merged.dob ? merged.dob.split('T')[0] : payload.dob || '',
        gender: merged.gender || payload.gender || 'other',
        address: addressValue || '',
        department: merged.department || formData.department || '',
        specialization: merged.specialization || formData.specialization || ''
      });
      setFormData(prev => ({ ...prev, ...payload }));
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-4 text-gray-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
          <p className="text-sm text-gray-500">Manage your doctor profile details</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Edit3Icon className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div className="px-6 pt-4">
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-md px-4 py-3 text-sm">
            {error}
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Full Name</label>
            <div className="relative mt-1">
              <UserIcon className="h-4 w-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
            <div className="relative mt-1">
              <MailIcon className="h-4 w-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Mobile Number</label>
            <div className="relative mt-1">
              <PhoneIcon className="h-4 w-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="text"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
              />
            </div>
          </div>

          {!isStaffDoctor && (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </>
          )}

          {isStaffDoctor && (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  disabled
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  disabled
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Address</label>
            <div className="relative mt-1">
              <MapPinIcon className="h-4 w-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
              />
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70"
            >
              <SaveIcon className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <XIcon className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
