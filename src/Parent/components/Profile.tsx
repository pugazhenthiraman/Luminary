import React, { useState } from 'react';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaEdit, 
  FaSave, 
  FaTimes,
  FaUserGraduate,
  FaCalendarAlt,
  FaShieldAlt,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaPlus,
  FaChild,
  FaCheck,
  FaSchool,
  FaBirthdayCake,
  FaVenusMars,
  FaEye,
  FaEyeSlash,
  FaLock
} from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../../components/Toast';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  currentGrade: string;
  schoolName: string;
}

interface ParentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  children: Child[];
}

interface ProfileProps {
  parentData: ParentUser;
}

const Profile: React.FC<ProfileProps> = ({ parentData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [children, setChildren] = useState<Child[]>(parentData.children);
  const [showChildModal, setShowChildModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [childForm, setChildForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    currentGrade: '',
    schoolName: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    name: `${parentData.firstName} ${parentData.lastName}`,
    email: parentData.email,
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, City, State 12345'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Simulate save with mock data
    showSuccessToast('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: `${parentData.firstName} ${parentData.lastName}`,
      email: parentData.email,
      phone: '+1 (555) 123-4567',
      address: '123 Main Street, City, State 12345'
    });
    setIsEditing(false);
    showErrorToast('Changes cancelled');
  };

  // Password change functions
  const openPasswordModal = () => {
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false
    });
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false
    });
  };

  const handlePasswordFormChange = (field: string, value: string) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePasswordForm = (): boolean => {
    if (!passwordForm.currentPassword.trim()) {
      showErrorToast('Current password is required');
      return false;
    }
    if (!passwordForm.newPassword.trim()) {
      showErrorToast('New password is required');
      return false;
    }
    if (passwordForm.newPassword.length < 8) {
      showErrorToast('New password must be at least 8 characters long');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)) {
      showErrorToast('New password must contain at least one uppercase letter, one lowercase letter, and one number');
      return false;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showErrorToast('New passwords do not match');
      return false;
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      showErrorToast('New password must be different from current password');
      return false;
    }

    return true;
  };

  const changePassword = () => {
    if (!validatePasswordForm()) return;

    // Simulate password change with mock data
    showSuccessToast('Password changed successfully!');
    closePasswordModal();
  };

  // Child management functions
  const openAddChildModal = () => {
    setEditingChild(null);
    setChildForm({ 
      firstName: '', 
      lastName: '', 
      dateOfBirth: '', 
      gender: '', 
      currentGrade: '', 
      schoolName: '' 
    });
    setShowChildModal(true);
  };

  const openEditChildModal = (child: Child) => {
    setEditingChild(child);
    setChildForm({
      firstName: child.firstName,
      lastName: child.lastName,
      dateOfBirth: child.dateOfBirth,
      gender: child.gender,
      currentGrade: child.currentGrade,
      schoolName: child.schoolName
    });
    setShowChildModal(true);
  };

  const closeChildModal = () => {
    setShowChildModal(false);
    setEditingChild(null);
    setChildForm({ 
      firstName: '', 
      lastName: '', 
      dateOfBirth: '', 
      gender: '', 
      currentGrade: '', 
      schoolName: '' 
    });
  };

  const handleChildFormChange = (field: string, value: string) => {
    setChildForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateChildForm = (): boolean => {
    if (!childForm.firstName.trim()) {
      showErrorToast('First name is required');
      return false;
    }
    if (!childForm.lastName.trim()) {
      showErrorToast('Last name is required');
      return false;
    }
    if (!childForm.dateOfBirth) {
      showErrorToast('Date of birth is required');
      return false;
    }
    if (!childForm.gender) {
      showErrorToast('Please select gender');
      return false;
    }
    if (!childForm.currentGrade) {
      showErrorToast('Please select current grade');
      return false;
    }
    if (!childForm.schoolName.trim()) {
      showErrorToast('School name is required');
      return false;
    }

    // Validate age (must be between 3 and 18)
    const today = new Date();
    const birthDate = new Date(childForm.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 3 || age > 18) {
      showErrorToast('Child must be between 3 and 18 years old');
      return false;
    }

    return true;
  };

  const saveChild = () => {
    if (!validateChildForm()) return;

    const childData: Child = {
      id: editingChild ? editingChild.id : Date.now().toString(),
      firstName: childForm.firstName.trim(),
      lastName: childForm.lastName.trim(),
      dateOfBirth: childForm.dateOfBirth,
      gender: childForm.gender,
      currentGrade: childForm.currentGrade,
      schoolName: childForm.schoolName.trim()
    };

    if (editingChild) {
      // Edit existing child
      setChildren(prev => prev.map(child => 
        child.id === editingChild.id ? childData : child
      ));
      showSuccessToast('Child updated successfully!');
    } else {
      // Add new child
      setChildren(prev => [...prev, childData]);
      showSuccessToast('Child added successfully!');
    }

    // Update localStorage
    const updatedParentData = {
      ...parentData,
      children: editingChild 
        ? children.map(child => child.id === editingChild.id ? childData : child)
        : [...children, childData]
    };
    localStorage.setItem('user', JSON.stringify(updatedParentData));

    closeChildModal();
  };

  const removeChild = (childId: string) => {
    const childToRemove = children.find(child => child.id === childId);
    if (childToRemove) {
      setChildren(prev => prev.filter(child => child.id !== childId));
      
      // Update localStorage
      const updatedParentData = {
        ...parentData,
        children: children.filter(child => child.id !== childId)
      };
      localStorage.setItem('user', JSON.stringify(updatedParentData));
      
      showSuccessToast(`${childToRemove.firstName} ${childToRemove.lastName} removed successfully!`);
    }
  };

  const addMockChildren = () => {
    const mockChildren = [
      {
        id: 'ch1',
        firstName: 'Emma',
        lastName: 'Johnson',
        dateOfBirth: '2012-03-15',
        gender: 'Female',
        currentGrade: 'Grade 6',
        schoolName: 'Springfield Elementary School'
      },
      {
        id: 'ch2',
        firstName: 'Alex',
        lastName: 'Johnson',
        dateOfBirth: '2014-07-22',
        gender: 'Male',
        currentGrade: 'Grade 4',
        schoolName: 'Springfield Elementary School'
      },
      {
        id: 'ch3',
        firstName: 'Sophia',
        lastName: 'Johnson',
        dateOfBirth: '2016-11-08',
        gender: 'Female',
        currentGrade: 'Grade 2',
        schoolName: 'Springfield Elementary School'
      },
      {
        id: 'ch4',
        firstName: 'Lucas',
        lastName: 'Johnson',
        dateOfBirth: '2018-05-12',
        gender: 'Male',
        currentGrade: 'Kindergarten',
        schoolName: 'Springfield Elementary School'
      }
    ];

    setChildren(mockChildren);
    
    // Update localStorage
    const updatedParentData = {
      ...parentData,
      children: mockChildren
    };
    localStorage.setItem('user', JSON.stringify(updatedParentData));
    
    showSuccessToast('4 mock children added successfully!');
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Profile Settings
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Manage your account information and preferences.
          </p>
        </div>
          <div className="flex items-center gap-2">
          <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
            Parent Account
          </span>
            <button 
              onClick={addMockChildren}
              className="flex items-center space-x-2 px-3 py-1 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors duration-200 text-xs sm:text-sm"
            >
              <FaChild className="text-xs" />
              <span className="hidden sm:inline">Add Mock Data</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Profile Section */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-0">Personal Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-sm"
                >
                  <FaEdit className="text-sm" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                  >
                    <FaSave className="text-sm" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
                  >
                    <FaTimes className="text-sm" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline mr-2 text-gray-400 text-sm" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    aria-label="Full name"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-gray-900 font-medium text-sm sm:text-base">{formData.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-2 text-gray-400 text-sm" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    aria-label="Email address"
                    placeholder="Enter your email address"
                  />
                ) : (
                  <p className="text-gray-900 font-medium text-sm sm:text-base break-words">{formData.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaPhone className="inline mr-2 text-gray-400 text-sm" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    aria-label="Phone number"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="text-gray-900 font-medium text-sm sm:text-base">{formData.phone}</p>
                )}
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline mr-2 text-gray-400 text-sm" />
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    aria-label="Address"
                    placeholder="Enter your address"
                  />
                ) : (
                  <p className="text-gray-900 font-medium text-sm sm:text-base break-words">{formData.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Children Information */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-0">Children Information</h2>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button 
                  onClick={openAddChildModal}
                  className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm"
                >
                  <FaPlus className="text-sm" />
                  <span>Add Child</span>
                </button>
              </div>
            </div>

            {children.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <FaChild className="text-indigo-600 text-xl sm:text-2xl" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">No Children Added</h3>
                <p className="text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base">
                  Add your children to start enrolling them in courses and track their learning journey.
                </p>
                <button
                  onClick={openAddChildModal}
                  className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors duration-200 font-medium text-sm sm:text-base"
                >
                  <FaPlus className="text-sm" />
                  <span>Add Your First Child</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {children.map((child, index) => (
                  <div 
                    key={child.id} 
                    className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-indigo-200 hover:shadow-md transition-all duration-200 animate-in slide-in-from-left duration-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <FaUserGraduate className="text-indigo-600 text-sm sm:text-base" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                            {child.firstName} {child.lastName}
                          </h3>
                          <p className="text-xs sm:text-sm text-indigo-600 font-medium">
                            {child.gender} • Age {calculateAge(child.dateOfBirth)}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
                        <button 
                          onClick={() => openEditChildModal(child)}
                          className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                          title="Edit child"
                        >
                          <FaEdit className="text-xs sm:text-sm" />
                        </button>
                        <button 
                          onClick={() => removeChild(child.id)}
                          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                          title="Remove child"
                        >
                          <FaTimes className="text-xs sm:text-sm" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                      <div className="flex items-center space-x-2">
                        <FaCalendarAlt className="text-gray-400 text-xs sm:text-sm flex-shrink-0" />
                        <span className="text-gray-600 truncate">Born: {new Date(child.dateOfBirth).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaUserGraduate className="text-gray-400 text-xs sm:text-sm flex-shrink-0" />
                        <span className="text-gray-600 truncate">Grade: {child.currentGrade}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaSchool className="text-gray-400 text-xs sm:text-sm flex-shrink-0" />
                        <span className="text-gray-600 truncate">School: {child.schoolName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Account Settings</h2>
            
            <div className="space-y-3 sm:space-y-4">
              {/* Password Change */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-0">
                  <FaShieldAlt className="text-gray-400 text-sm sm:text-base" />
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">Password</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Last changed 30 days ago</p>
                  </div>
                </div>
                <button 
                  onClick={openPasswordModal}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                >
                  Change
                </button>
              </div>

              {/* Security Settings */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-0">
                  <FaLock className="text-gray-400 text-sm sm:text-base" />
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">Two-Factor Authentication</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Add an extra layer of security</p>
            </div>
          </div>
                <button className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors duration-200">
                  Enable
                </button>
        </div>

              {/* Notification Settings */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-0">
                  <FaBell className="text-gray-400 text-sm sm:text-base" />
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">Email Notifications</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Manage your notification preferences</p>
              </div>
                </div>
                <button className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors duration-200">
                  Configure
                </button>
                </div>
              </div>
            </div>
          </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
         

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Quick Actions</h3>
            
            <div className="space-y-2 sm:space-y-3">
              <button 
                onClick={openAddChildModal}
                className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 text-sm"
              >
                <FaUserGraduate className="text-indigo-500 text-sm" />
                <span>Add Child</span>
              </button>
              <button className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 text-sm">
                <FaCalendarAlt className="text-green-500 text-sm" />
                <span>View Schedule</span>
              </button>
              <button 
                onClick={openPasswordModal}
                className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 text-sm"
              >
                <FaShieldAlt className="text-blue-500 text-sm" />
                <span>Change Password</span>
              </button>
             
              <button className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 text-sm">
                <FaSignOutAlt className="text-red-500 text-sm" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
            </div>
          </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full mx-2 sm:mx-4">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                    <FaLock className="text-blue-600 text-sm sm:text-base" />
                    Change Password
                  </h2>
                  <p className="text-gray-600 mt-1 text-sm">
                    Update your account password for enhanced security
                  </p>
                </div>
                <button
                  onClick={closePasswordModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
                  aria-label="Close modal"
                >
                  <FaTimes className="text-lg sm:text-xl" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaLock className="text-blue-500 text-sm" />
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      placeholder="Enter current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => handlePasswordFormChange('currentPassword', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.current ? (
                        <FaEyeSlash className="text-gray-400 text-sm" />
                      ) : (
                        <FaEye className="text-gray-400 text-sm" />
                      )}
                    </button>
        </div>
      </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaShieldAlt className="text-green-500 text-sm" />
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      placeholder="Enter new password"
                      value={passwordForm.newPassword}
                      onChange={(e) => handlePasswordFormChange('newPassword', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.new ? (
                        <FaEyeSlash className="text-gray-400 text-sm" />
                      ) : (
                        <FaEye className="text-gray-400 text-sm" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 8 characters with uppercase, lowercase, and number
                  </p>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaCheck className="text-purple-500 text-sm" />
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => handlePasswordFormChange('confirmPassword', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.confirm ? (
                        <FaEyeSlash className="text-gray-400 text-sm" />
                      ) : (
                        <FaEye className="text-gray-400 text-sm" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={closePasswordModal}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={changePassword}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl text-sm"
                >
                  <FaCheck className="text-sm" />
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Child Modal */}
      {showChildModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                    <FaChild className="text-indigo-600 text-sm sm:text-base" />
                    {editingChild ? 'Edit Child' : 'Add New Child'}
                  </h2>
                  <p className="text-gray-600 mt-1 text-sm">
                    {editingChild ? 'Update your child\'s information' : 'Add a new child to your account'}
                  </p>
                </div>
                <button
                  onClick={closeChildModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
                  aria-label="Close modal"
                >
                  <FaTimes className="text-lg sm:text-xl" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaUser className="text-indigo-500 text-sm" />
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter first name"
                    value={childForm.firstName}
                    onChange={(e) => handleChildFormChange('firstName', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaUser className="text-indigo-500 text-sm" />
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter last name"
                    value={childForm.lastName}
                    onChange={(e) => handleChildFormChange('lastName', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaBirthdayCake className="text-indigo-500 text-sm" />
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={childForm.dateOfBirth}
                    onChange={(e) => handleChildFormChange('dateOfBirth', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                    title="Select date of birth"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaVenusMars className="text-indigo-500 text-sm" />
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={childForm.gender}
                    onChange={(e) => handleChildFormChange('gender', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                    title="Select gender"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Current Grade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaUserGraduate className="text-indigo-500 text-sm" />
                    Current Grade <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={childForm.currentGrade}
                    onChange={(e) => handleChildFormChange('currentGrade', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                    title="Select current grade"
                  >
                    <option value="">Select Grade</option>
                    <option value="Pre-K">Pre-K</option>
                    <option value="Kindergarten">Kindergarten</option>
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>

                {/* School Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaSchool className="text-indigo-500 text-sm" />
                    School Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter school name"
                    value={childForm.schoolName}
                    onChange={(e) => handleChildFormChange('schoolName', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={closeChildModal}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={saveChild}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl text-sm"
                >
                  <FaCheck className="text-sm" />
                  {editingChild ? 'Update Child' : 'Add Child'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 