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
  FaVenusMars
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
  name: string;
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
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [childForm, setChildForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    currentGrade: '',
    schoolName: ''
  });
  const [formData, setFormData] = useState({
    name: parentData.name,
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
    // TODO: Implement save logic
    console.log('Saving profile data:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: parentData.name,
      email: parentData.email,
      phone: '+1 (555) 123-4567',
      address: '123 Main Street, City, State 12345'
    });
    setIsEditing(false);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your account information and preferences.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
            Parent Account
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                >
                  <FaEdit className="text-sm" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <FaSave className="text-sm" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <FaTimes className="text-sm" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline mr-2 text-gray-400" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Full name"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{formData.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-2 text-gray-400" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Email address"
                    placeholder="Enter your email address"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{formData.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaPhone className="inline mr-2 text-gray-400" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Phone number"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{formData.phone}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline mr-2 text-gray-400" />
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Address"
                    placeholder="Enter your address"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{formData.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Children Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Children Information</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={addMockChildren}
                  className="flex items-center space-x-2 px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors duration-200"
                >
                  <FaChild className="text-sm" />
                  <span>Add Mock Children</span>
                </button>
                <button 
                  onClick={openAddChildModal}
                  className="flex items-center space-x-2 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  <FaPlus className="text-sm" />
                  <span>Add Child</span>
                </button>
              </div>
            </div>

            {children.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaChild className="text-indigo-600 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Children Added</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Add your children to start enrolling them in courses and track their learning journey.
                </p>
                <button
                  onClick={openAddChildModal}
                  className="inline-flex items-center space-x-2 px-6 py-3 text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors duration-200 font-medium"
                >
                  <FaPlus className="text-sm" />
                  <span>Add Your First Child</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {children.map((child) => (
                  <div key={child.id} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <FaUserGraduate className="text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {child.firstName} {child.lastName}
                          </h3>
                          <p className="text-sm text-indigo-600 font-medium">
                            {child.gender} • Age {calculateAge(child.dateOfBirth)}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openEditChildModal(child)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                          title="Edit child"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button 
                          onClick={() => removeChild(child.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                          title="Remove child"
                        >
                          <FaTimes className="text-sm" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <FaCalendarAlt className="text-gray-400" />
                        <span className="text-gray-600">Born: {new Date(child.dateOfBirth).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaUserGraduate className="text-gray-400" />
                        <span className="text-gray-600">Grade: {child.currentGrade}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaSchool className="text-gray-400" />
                        <span className="text-gray-600">School: {child.schoolName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h2>
            
            <div className="space-y-4">
              {/* Password Change */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FaShieldAlt className="text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">Password</h3>
                    <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                  </div>
                </div>
                <button className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                  Change
                </button>
              </div>


            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUser className="text-indigo-600 text-2xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{parentData.name}</h3>
              <p className="text-gray-600 mb-4">Parent Account</p>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Children:</span>
                  <span className="font-medium">{children.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Member since:</span>
                  <span className="font-medium">Jan 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <button 
                onClick={openAddChildModal}
                className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <FaUserGraduate className="text-indigo-500" />
                <span>Add Child</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <FaCalendarAlt className="text-green-500" />
                <span>View Schedule</span>
              </button>
             
              <button className="w-full flex items-center space-x-3 p-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                <FaSignOutAlt className="text-red-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

       
        </div>
      </div>

      {/* Child Modal */}
      {showChildModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <FaChild className="text-indigo-600" />
                    {editingChild ? 'Edit Child' : 'Add New Child'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {editingChild ? 'Update your child\'s information' : 'Add a new child to your account'}
                  </p>
                </div>
                <button
                  onClick={closeChildModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg"
                  aria-label="Close modal"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaUser className="text-indigo-500" />
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter first name"
                    value={childForm.firstName}
                    onChange={(e) => handleChildFormChange('firstName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaUser className="text-indigo-500" />
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter last name"
                    value={childForm.lastName}
                    onChange={(e) => handleChildFormChange('lastName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaBirthdayCake className="text-indigo-500" />
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={childForm.dateOfBirth}
                    onChange={(e) => handleChildFormChange('dateOfBirth', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaVenusMars className="text-indigo-500" />
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={childForm.gender}
                    onChange={(e) => handleChildFormChange('gender', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    aria-label="Select gender"
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
                    <FaUserGraduate className="text-indigo-500" />
                    Current Grade <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={childForm.currentGrade}
                    onChange={(e) => handleChildFormChange('currentGrade', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    aria-label="Select current grade"
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
                    <FaSchool className="text-indigo-500" />
                    School Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter school name"
                    value={childForm.schoolName}
                    onChange={(e) => handleChildFormChange('schoolName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={closeChildModal}
                  className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={saveChild}
                  className="px-6 py-3 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
                >
                  <FaCheck />
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