import React, { useState, useEffect } from 'react';
import CoachDetailsModal from '../../components/CoachDetailsModal';
import { FaCheck, FaTimes, FaEye, FaEnvelope, FaPhone, FaGraduationCap, FaClock, FaSpinner, FaPauseCircle, FaPlayCircle, FaRedo } from 'react-icons/fa';
import Avatar from '../../components/Avatar';
import { showSuccessToast, showErrorToast } from '../../components/Toast';
import { getCoaches, approveCoach, rejectCoach, activateRejectedCoach, suspendCoach, reactivateCoach, requestCoachReapplication } from '../../api/admin';

export interface CoachData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  experience: string;
  duration: string;
  address: string;
  languages: string[];
  status: string;
  isFrozen?: boolean;
  registrationDate: string;
  adminNotes: string;
  driverLicense?: string;
  courses?: string[];
  photo?: string;
}

const CoachApproval: React.FC = () => {
  const [coaches, setCoaches] = useState<CoachData[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<CoachData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState(() => localStorage.getItem('adminFilter') || 'all');
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem('adminSearchTerm') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [coachToReject, setCoachToReject] = useState<string | null>(null);
  const [coachToApprove, setCoachToApprove] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [currentPage, setCurrentPage] = useState(() => parseInt(localStorage.getItem('adminCurrentPage') || '1'));
  const itemsPerPage = 10;
  // Freeze is no longer used in coach approval
  const [isSuspending, setIsSuspending] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  
  // Reapplication workflow states
  const [showReapplicationModal, setShowReapplicationModal] = useState(false);
  const [coachToReapply, setCoachToReapply] = useState<string | null>(null);
  const [reapplicationReason, setReapplicationReason] = useState('');
  const [reapplicationNotes, setReapplicationNotes] = useState('');
  const [isRequestingReapplication, setIsRequestingReapplication] = useState(false);

  // Optimistically update a coach in local state (list + selected modal)
  const patchCoach = (coachId: string, patch: Partial<CoachData>) => {
    setCoaches(prev => prev.map(c => c.id === coachId ? { ...c, ...patch } : c));
    setSelectedCoach(prev => (prev && prev.id === coachId) ? { ...prev, ...patch } as CoachData : prev);
  };

  const filteredCoaches = coaches.filter(coach => {
    const matchesSearch = coach.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.duration.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filter === 'all' || coach.status === filter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filter]);
  useEffect(() => { localStorage.setItem('adminFilter', filter); }, [filter]);
  useEffect(() => { localStorage.setItem('adminSearchTerm', searchTerm); }, [searchTerm]);
  useEffect(() => { localStorage.setItem('adminCurrentPage', currentPage.toString()); }, [currentPage]);

  const paginatedCoaches = filteredCoaches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredCoaches.length / itemsPerPage);

  const loadCoaches = () => {
    setIsLoading(true);
    getCoaches()
      .then(res => {
        const normalized = ((res.data.data && res.data.data.coaches) || []).map((coach: any) => ({
          id: coach.id,
          firstName: coach.firstName,
          lastName: coach.lastName,
          email: coach.email,
          phone: coach.phone,
          experience: coach.experienceDescription || '',
          duration: coach.domain || '',
          address: coach.address || '',
          languages: coach.languages || [],
          status: coach.status ? coach.status.toLowerCase() : 'pending',
          isFrozen: Boolean(coach.isFrozen),
          registrationDate: coach.registrationDate || '',
          adminNotes: coach.adminNotes || '',
        }));
        setCoaches(normalized);
      })
      .catch(() => showErrorToast('Failed to load coaches'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadCoaches();
    const refreshInterval = setInterval(() => { loadCoaches(); }, 30000);
    return () => clearInterval(refreshInterval);
  }, []);

  const handleApprove = async (coachId: string) => {
    setIsApproving(true);
    try {
      await approveCoach(coachId);
      showSuccessToast('Coach approved successfully!');
      setShowApproveConfirm(false);
      setCoachToApprove(null);
      patchCoach(coachId, { status: 'approved', isFrozen: false });
    } catch {
      showErrorToast('Failed to approve coach');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async (coachId: string) => {
    setIsRejecting(true);
    try {
      await rejectCoach(coachId, rejectReason || 'Rejected by admin');
      showSuccessToast('Coach rejected successfully');
      setShowRejectConfirm(false);
      setCoachToReject(null);
      setRejectReason('');
      patchCoach(coachId, { status: 'rejected', isFrozen: false });
    } catch {
      showErrorToast('Failed to reject coach');
    } finally {
      setIsRejecting(false);
    }
  };

  const handleRequestReapplication = async (coachId: string) => {
    setIsRequestingReapplication(true);
    try {
      await requestCoachReapplication(
        coachId,
        reapplicationReason || 'Please update your application',
        reapplicationNotes
      );
      showSuccessToast('Reapplication email sent to coach with unique link!');
      setShowReapplicationModal(false);
      setCoachToReapply(null);
      setReapplicationReason('');
      setReapplicationNotes('');
      patchCoach(coachId, { status: 'rejected' });
      loadCoaches(); // Reload to get updated data
    } catch {
      showErrorToast('Failed to send reapplication request');
    } finally {
      setIsRequestingReapplication(false);
    }
  };

  const confirmReject = (coachId: string) => {
    setCoachToReject(coachId);
    setShowRejectConfirm(true);
  };

  const confirmReapplication = (coachId: string) => {
    setCoachToReapply(coachId);
    setShowReapplicationModal(true);
  };

  const confirmApprove = (coachId: string) => {
    setCoachToApprove(coachId);
    setShowApproveConfirm(true);
  };

  const handleViewDetails = (coach: CoachData) => {
    setSelectedCoach(coach);
    setShowDetails(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <FaCheck className="text-green-500 mr-1" />;
      case 'rejected': return <FaTimes className="text-red-500 mr-1" />;
      case 'pending': return <FaClock className="text-yellow-500 mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Coach Approval</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Review and manage coach applications</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <div className="bg-blue-50 text-blue-700 px-3 sm:px-4 py-2 rounded-lg">
            <span className="text-xs sm:text-sm font-medium">{filteredCoaches.length} coaches</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-2 sm:p-3 border border-gray-200 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {/* Search box left, filters right on desktop */}
          <div className="w-full sm:w-1/2 lg:w-2/5 xl:w-1/3">
            <input
              type="text"
              placeholder="Search coaches..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:gap-2 sm:w-auto sm:justify-end overflow-x-visible">
            <button onClick={() => setFilter('all')} className={`px-2 sm:px-3 py-1.5 rounded-md font-medium transition-colors duration-200 text-xs sm:text-sm whitespace-nowrap ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>All</button>
            <button onClick={() => setFilter('pending')} className={`px-2 sm:px-3 py-1.5 rounded-md font-medium transition-colors duration-200 text-xs sm:text-sm whitespace-nowrap ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Pending</button>
            <button onClick={() => setFilter('approved')} className={`px-2 sm:px-3 py-1.5 rounded-md font-medium transition-colors duration-200 text-xs sm:text-sm whitespace-nowrap ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Approved</button>
            <button onClick={() => setFilter('rejected')} className={`px-2 sm:px-3 py-1.5 rounded-md font-medium transition-colors duration-200 text-xs sm:text-sm whitespace-nowrap ${filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Rejected</button>
            <button onClick={() => setFilter('suspended')} className={`px-2 sm:px-3 py-1.5 rounded-md font-medium transition-colors duration-200 text-xs sm:text-sm whitespace-nowrap ${filter === 'suspended' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Suspended</button>
          </div>
        </div>
      </div>

      {/* Coaches List - Mobile Responsive */}
      <div className="block sm:hidden">
        <div className="divide-y divide-gray-200">
          {paginatedCoaches.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No coach applications found.</div>
          ) : (
            <>
              {paginatedCoaches.map((coach, idx) => (
                <div key={coach.id} className={`p-4 hover:bg-gray-50${idx !== 0 ? ' mt-4' : ''} rounded-xl shadow-sm bg-white`}>
                  {/* Removed thumbnail area for cleaner look */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10">
                        {coach.photo ? (
                          <Avatar name={`${coach.firstName} ${coach.lastName}`} imageUrl={coach.photo} size={40} className="h-10 w-10" />
                        ) : (
                          <div
                            className="h-10 w-10 rounded-full flex items-center justify-center text-white text-base font-bold select-none bg-gradient-to-r from-indigo-500 to-orange-500"
                          >
                            {coach.firstName.charAt(0)}{coach.lastName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">{coach.firstName} {coach.lastName}</div>
                        <div className="text-xs text-gray-500">{coach.registrationDate}</div>
                      </div>
                    </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${coach.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${coach.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                        ${coach.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                        ${!['pending','approved','rejected'].includes(coach.status) ? 'bg-gray-100 text-gray-800' : ''}
                      `}>
                        {getStatusIcon(coach.status)}
                        <span className="ml-1 capitalize">{coach.status}</span>
                      </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2"><FaEnvelope className="text-gray-400 text-xs flex-shrink-0" /><span className="text-gray-600 truncate">{coach.email}</span></div>
                    <div className="flex items-center space-x-2"><FaPhone className="text-gray-400 text-xs flex-shrink-0" /><span className="text-gray-600">{coach.phone}</span></div>
                    <div className="flex items-center space-x-2"><FaGraduationCap className="text-gray-400 text-xs flex-shrink-0" /><span className="text-gray-600 truncate">{coach.duration}</span></div>
                    <div className="flex items-center space-x-2"><FaClock className="text-gray-400 text-xs flex-shrink-0" /><span className="text-gray-600">{coach.experience} years experience</span></div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-100">
                    <button onClick={() => handleViewDetails(coach)} className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200" title="View Details"><FaEye className="text-sm" /></button>
                        {coach.status === 'pending' && (
                      <>
                        <button onClick={() => confirmApprove(coach.id)} disabled={isApproving || isRejecting} className="p-2 rounded-lg transition-colors duration-200 disabled:opacity-50 text-green-600 hover:text-green-900 hover:bg-green-50" title="Approve">{isApproving ? <FaSpinner className="animate-spin text-sm" /> : <FaCheck className="text-sm" />}</button>
                        <button onClick={() => confirmReject(coach.id)} disabled={isApproving || isRejecting} className="p-2 rounded-lg transition-colors duration-200 disabled:opacity-50 text-red-600 hover:text-red-900 hover:bg-red-50" title="Reject">{isRejecting ? <FaSpinner className="animate-spin text-sm" /> : <FaTimes className="text-sm" />}</button>
                        <button onClick={() => confirmReapplication(coach.id)} disabled={isRequestingReapplication} className="p-2 rounded-lg transition-colors duration-200 disabled:opacity-50 text-blue-600 hover:text-blue-900 hover:bg-blue-50" title="Request Reapplication"><FaRedo className="text-sm" /></button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Coaches List - Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coach</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedCoaches.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">No coach applications found.</td>
              </tr>
            ) : (
              <>
                {paginatedCoaches.map((coach) => (
                  <tr key={coach.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Removed thumbnail area for cleaner look */}
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {coach.photo ? (
                            <Avatar name={`${coach.firstName} ${coach.lastName}`} imageUrl={coach.photo} size={40} className="h-10 w-10" />
                          ) : (
                            <div
                              className="h-10 w-10 rounded-full flex items-center justify-center text-white text-base font-bold select-none bg-gradient-to-r from-indigo-500 to-orange-500"
                            >
                              {coach.firstName.charAt(0)}{coach.lastName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{coach.firstName} {coach.lastName}</div>
                          <div className="text-sm text-gray-500">{coach.registrationDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{coach.email}</div>
                      <div className="text-sm text-gray-500">{coach.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{coach.duration}</div>
                      <div className="text-sm text-gray-500">{coach.languages.join(', ')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{coach.experience} years</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${coach.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${coach.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                          ${coach.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                          ${!['pending','approved','rejected'].includes(coach.status) ? 'bg-gray-100 text-gray-800' : ''}
                        `}>
                          {getStatusIcon(coach.status)}
                          <span className="ml-1 capitalize">{coach.status}</span>
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button onClick={() => handleViewDetails(coach)} className="text-blue-600 hover:text-blue-900 p-1" title="View Details"><FaEye /></button>
                        {coach.status === 'pending' && (
                          <>
                            <button onClick={() => confirmApprove(coach.id)} disabled={isApproving || isRejecting} className="text-green-600 hover:text-green-900 p-1 disabled:opacity-50" title="Approve">{isApproving ? <FaSpinner className="animate-spin" /> : <FaCheck />}</button>
                            <button onClick={() => confirmReject(coach.id)} disabled={isApproving || isRejecting} className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50" title="Reject">{isRejecting ? <FaSpinner className="animate-spin" /> : <FaTimes />}</button>
                            <button onClick={() => confirmReapplication(coach.id)} disabled={isRequestingReapplication} className="text-blue-600 hover:text-blue-900 p-1 disabled:opacity-50" title="Request Reapplication (Send Link)"><FaRedo /></button>
                          </>
                        )}
      {coach.status === 'approved' && (
                          <>
                            <button onClick={async () => {
                              if (!window.confirm('Suspend this coach? They will be logged out and cannot log in until reactivated.')) return;
                              try {
                                setIsSuspending(true);
                                await suspendCoach(coach.id, 'Suspended by admin');
                                showSuccessToast('Coach suspended');
        patchCoach(coach.id, { status: 'suspended' });
                              } catch (e) {
                                showErrorToast('Failed to suspend coach');
                              } finally { setIsSuspending(false); }
                            }} className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50" disabled={isSuspending} title="Suspend (disable login)"><FaPauseCircle /></button>
                          </>
                        )}
      {coach.status === 'rejected' && (
                          <>
                            <button onClick={async () => {
                              try {
                                await activateRejectedCoach(coach.id);
                                showSuccessToast('Coach set to Pending');
        patchCoach(coach.id, { status: 'pending' });
                              } catch (e) {
                                showErrorToast('Failed to activate coach');
                              }
                            }} className="text-yellow-600 hover:text-yellow-900 p-1" title="Activate (move to Pending)"><FaPlayCircle /></button>
                          </>
                        )}
      {coach.status === 'suspended' && (
                          <>
                            <button onClick={async () => {
                              if (!window.confirm('Reactivate this coach to Approved?')) return;
                              try {
                                setIsReactivating(true);
                                await reactivateCoach(coach.id, '');
                                showSuccessToast('Coach reactivated');
        patchCoach(coach.id, { status: 'approved' });
                              } catch (e) {
                                showErrorToast('Failed to reactivate coach');
                              } finally { setIsReactivating(false); }
                            }} className="text-green-600 hover:text-green-900 p-1 disabled:opacity-50" disabled={isReactivating} title="Reactivate (to Approved)"><FaPlayCircle /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50" aria-label="Previous">&lt;</button>
            {[...Array(totalPages)].map((_, idx) => (
              <button key={idx} onClick={() => setCurrentPage(idx + 1)} className={`px-3 py-2 border-t border-b border-gray-300 bg-white text-gray-700 hover:bg-blue-50 ${currentPage === idx + 1 ? 'font-bold bg-blue-100' : ''}`} aria-current={currentPage === idx + 1 ? 'page' : undefined}>{idx + 1}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50" aria-label="Next">&gt;</button>
          </nav>
        </div>
      )}

      {/* Coach Details Modal (reusable) */}
      {(() => {
        return showDetails && selectedCoach ? (
          <CoachDetailsModal
            coach={selectedCoach}
            show={showDetails}
            onClose={() => {
              setShowDetails(false);
            }}
            onApprove={() => { confirmApprove(selectedCoach.id); }}
            onReject={() => { confirmReject(selectedCoach.id); }}
            isLoading={isApproving || isRejecting}
            showActions={true}
            confirmReject={confirmReject}
            onSuspendApproved={async (id) => {
              if (!window.confirm('Suspend this coach? They will be logged out and cannot log in until reactivated.')) return;
              try {
                setIsSuspending(true);
                await suspendCoach(id, 'Suspended by admin');
                showSuccessToast('Coach suspended');
                patchCoach(id, { status: 'suspended' });
              } catch { showErrorToast('Failed to suspend coach'); }
              finally { setIsSuspending(false); }
            }}
            onReactivateSuspended={async (id) => {
              if (!window.confirm('Reactivate this coach to Approved?')) return;
              try {
                setIsReactivating(true);
                await reactivateCoach(id, '');
                showSuccessToast('Coach reactivated');
                patchCoach(id, { status: 'approved' });
              } catch { showErrorToast('Failed to reactivate coach'); }
              finally { setIsReactivating(false); }
            }}
            onActivateRejected={async (id) => {
              try {
                await activateRejectedCoach(id);
                showSuccessToast('Coach set to Pending');
                patchCoach(id, { status: 'pending' });
              } catch { showErrorToast('Failed to activate coach'); }
            }}
            isSuspending={isSuspending}
            isReactivating={isReactivating}
          />
        ) : null;
      })()}

      {/* Reject Confirmation Modal */}
      {showRejectConfirm && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => { setShowRejectConfirm(false); setCoachToReject(null); setRejectReason(''); }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><FaTimes className="text-red-600 text-xl sm:text-2xl" /></div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Reject Coach</h3>
              <p className="text-sm text-gray-600 mb-4">Please provide a reason for rejecting this coach application.</p>
              <div className="mb-4">
                <label htmlFor="rejectReason" className="block text-sm font-medium text-gray-700 mb-2 text-left">Rejection Reason</label>
                <textarea id="rejectReason" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Enter the reason for rejection..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm" rows={3} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => { setShowRejectConfirm(false); setCoachToReject(null); setRejectReason(''); }} className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium text-sm">Cancel</button>
              <button onClick={() => coachToReject && handleReject(coachToReject)} disabled={isRejecting || !rejectReason.trim()} className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed">{isRejecting ? <FaSpinner className="animate-spin" /> : 'Confirm Reject'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {showApproveConfirm && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => { setShowApproveConfirm(false); setCoachToApprove(null); }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><FaCheck className="text-green-600 text-xl sm:text-2xl" /></div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Approve Coach</h3>
              <p className="text-sm text-gray-600 mb-4">Are you sure you want to approve this coach application?</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => { setShowApproveConfirm(false); setCoachToApprove(null); }} className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium text-sm">Cancel</button>
              <button onClick={() => coachToApprove && handleApprove(coachToApprove)} disabled={isApproving} className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed">{isApproving ? <FaSpinner className="animate-spin" /> : 'Confirm Approve'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Request Reapplication Modal */}
      {showReapplicationModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => { 
            setShowReapplicationModal(false); 
            setCoachToReapply(null); 
            setReapplicationReason('');
            setReapplicationNotes('');
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaRedo className="text-blue-600 text-xl sm:text-2xl" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Request Reapplication</h3>
              <p className="text-sm text-gray-600 mb-4">
                Send this coach a unique link to update and resubmit their application
              </p>
              
              <div className="mb-4 space-y-4">
                <div className="text-left">
                  <label htmlFor="reapplicationReason" className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback for Coach <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="reapplicationReason"
                    value={reapplicationReason}
                    onChange={(e) => setReapplicationReason(e.target.value)}
                    placeholder="Explain what needs to be updated (e.g., 'Please provide more details about your teaching experience')"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be shown to the coach in the email and on the reapplication page
                  </p>
                </div>
                
                <div className="text-left">
                  <label htmlFor="reapplicationNotes" className="block text-sm font-medium text-gray-700 mb-2">
                    Internal Admin Notes (Optional)
                  </label>
                  <textarea
                    id="reapplicationNotes"
                    value={reapplicationNotes}
                    onChange={(e) => setReapplicationNotes(e.target.value)}
                    placeholder="Internal notes for your reference..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    rows={2}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This is for internal use only and won't be sent to the coach
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => { 
                  setShowReapplicationModal(false); 
                  setCoachToReapply(null); 
                  setReapplicationReason('');
                  setReapplicationNotes('');
                }} 
                className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => coachToReapply && handleRequestReapplication(coachToReapply)}
                disabled={isRequestingReapplication || !reapplicationReason.trim()}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isRequestingReapplication ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <FaRedo />
                    Send Reapplication Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachApproval;