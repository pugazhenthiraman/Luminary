// Coach Storage Utility - File-like handling for coach registrations
export interface CoachData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string; // In real app, this should be hashed
  driverLicense?: string;
  experience: string;
  duration: string;
  address: string;
  languages: string[];
  courses: string[];
  status: 'pending' | 'approved' | 'rejected';
  registrationDate: string;
  adminNotes?: string;
}

class CoachStorage {
  private readonly STORAGE_KEY = 'luminary_coaches';
  private readonly PENDING_STATUS = 'pending';

  // Get all coaches from storage
  getAllCoaches(): CoachData[] {
    try {
      const coaches = localStorage.getItem(this.STORAGE_KEY);
      const parsedCoaches = coaches ? JSON.parse(coaches) : [];
      return parsedCoaches;
    } catch (error) {
      console.error('Error reading coaches from storage:', error);
      return [];
    }
  }

  // Get coaches by status
  getCoachesByStatus(status: CoachData['status']): CoachData[] {
    const allCoaches = this.getAllCoaches();
    return allCoaches.filter(coach => coach.status === status);
  }

  // Get pending coaches (for admin approval)
  getPendingCoaches(): CoachData[] {
    return this.getCoachesByStatus('pending');
  }

  // Get approved coaches
  getApprovedCoaches(): CoachData[] {
    return this.getCoachesByStatus('approved');
  }

  // Get rejected coaches
  getRejectedCoaches(): CoachData[] {
    return this.getCoachesByStatus('rejected');
  }

  // Add new coach registration
  addCoach(coachData: Omit<CoachData, 'id' | 'status' | 'registrationDate'>): boolean {
    try {
      const coaches = this.getAllCoaches();
      
      // Check if email already exists
      const existingCoach = coaches.find(coach => coach.email === coachData.email);
      if (existingCoach) {
        console.error('Coach with this email already exists');
        return false;
      }

      const newCoach: CoachData = {
        ...coachData,
        id: this.generateId(),
        status: this.PENDING_STATUS,
        registrationDate: new Date().toISOString()
      };

      coaches.push(newCoach);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(coaches));
      
      return true;
    } catch (error) {
      console.error('Error adding coach to storage:', error);
      return false;
    }
  }

  // Add coach with specific ID (for testing purposes)
  addCoachWithId(coachData: Omit<CoachData, 'id' | 'status' | 'registrationDate'>, coachId: string): boolean {
    try {
      const coaches = this.getAllCoaches();
      
      // Check if email already exists
      const existingCoach = coaches.find(coach => coach.email === coachData.email);
      if (existingCoach) {
        console.error('Coach with this email already exists');
        return false;
      }

      const newCoach: CoachData = {
        ...coachData,
        id: coachId,
        status: 'approved', // Set as approved for testing
        registrationDate: new Date().toISOString()
      };

      coaches.push(newCoach);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(coaches));
      
      return true;
    } catch (error) {
      console.error('Error adding coach to storage:', error);
      return false;
    }
  }

  // Update coach status (approve/reject)
  updateCoachStatus(coachId: string, status: 'approved' | 'rejected', adminNotes?: string): boolean {
    try {
      const coaches = this.getAllCoaches();
      const coachIndex = coaches.findIndex(coach => coach.id === coachId);
      
      if (coachIndex === -1) {
        console.error('Coach not found:', coachId);
        return false;
      }

      coaches[coachIndex].status = status;
      if (adminNotes) {
        coaches[coachIndex].adminNotes = adminNotes;
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(coaches));
      console.log(`Coach ${coachId} status updated to: ${status}`);
      return true;
    } catch (error) {
      console.error('Error updating coach status:', error);
      return false;
    }
  }

  // Get coach by ID
  getCoachById(coachId: string): CoachData | null {
    const coaches = this.getAllCoaches();
    return coaches.find(coach => coach.id === coachId) || null;
  }

  // Delete coach (for admin)
  deleteCoach(coachId: string): boolean {
    try {
      const coaches = this.getAllCoaches();
      const filteredCoaches = coaches.filter(coach => coach.id !== coachId);
      
      if (filteredCoaches.length === coaches.length) {
        console.error('Coach not found for deletion:', coachId);
        return false;
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredCoaches));
      console.log('Coach deleted successfully:', coachId);
      return true;
    } catch (error) {
      console.error('Error deleting coach:', error);
      return false;
    }
  }

  // Search coaches by name or email
  searchCoaches(query: string): CoachData[] {
    const coaches = this.getAllCoaches();
    const lowerQuery = query.toLowerCase();
    
    return coaches.filter(coach => 
      coach.firstName.toLowerCase().includes(lowerQuery) ||
      coach.lastName.toLowerCase().includes(lowerQuery) ||
      coach.email.toLowerCase().includes(lowerQuery)
    );
  }

  // Get statistics
  getStats() {
    const coaches = this.getAllCoaches();
    return {
      total: coaches.length,
      pending: coaches.filter(c => c.status === 'pending').length,
      approved: coaches.filter(c => c.status === 'approved').length,
      rejected: coaches.filter(c => c.status === 'rejected').length
    };
  }

  // Clear all data (for testing/reset)
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('All coach data cleared');
  }

  // Generate unique ID
  private generateId(): string {
    return `coach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const coachStorage = new CoachStorage(); 