const API_BASE = 'http://localhost:8080/api';

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  access_token: string;
  token_type: string;
}


export interface Staff {
  id: string;
  username: string;
  created_at: string;
}

export interface StaffCreateRequest {
  username: string;
  password: string;
}

export interface StaffUpdateRequest {
  username?: string;
  password?: string;
}

export interface Candidate {
  birth_date: any;
  address?: string;
  image: string;
  mobile?: string;
  id: string;
  full_name: string;
  position_name: string;
  qualifications?: string;
  position_status: 'multiple' | 'single';
}

export interface CandidateCreateRequest {
  full_name: string;
  position_name: string;
  qualifications?: string;
  mobile?: string;
  image: string;
  birth_date?: string;
  address?: string;
  position_status: 'multiple' | 'single';
}


export interface CandidateUpdateRequest {
  full_name?: string;
  position_name?: string;
  qualifications?: string;
  mobile?: string;
  image?: string;
  birth_date?: string;
  address?: string;
  position_status?: 'multiple' | 'single';
}


export interface SystemSettings {
  is_locked: boolean;
  is_open: boolean;
  updated_at?: string;
}



const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
  'Content-Type': 'application/json',
});

// ✅ FIXED handleError - Handles Pydantic arrays + objects
const handleError = async (res: Response): Promise<Error> => {
  try {
    const errorData = await res.json();
    
    if (Array.isArray(errorData.detail)) {
      const messages = errorData.detail
        .map((err: any) => err.msg || err.detail || 'خطأ في البيانات')
        .filter(Boolean)
        .join('، ');
      return new Error(messages);
    }
    
    if (errorData.detail) {
      return new Error(errorData.detail);
    }
    
    return new Error(`خطأ ${res.status}: ${errorData.message || 'خطأ غير معروف'}`);
  } catch {
    return new Error(`خطأ الخادم ${res.status}`);
  }
};


export const adminApi = {
  // POST /api/auth/login/admin
  login: async (credentials: AdminLoginRequest): Promise<AdminLoginResponse> => {
    const res = await fetch(`${API_BASE}/auth/login/admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

     if (!res.ok) throw await handleError(res); 
    return res.json();
  },

  // GET /api/admin/results
  getVotingResults: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/results`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) return handleError(res);
    return res.json();
  },

  getVoterListReport: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/voter-list-report"`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) return handleError(res);
    return res.json();
  },
  
  // ✅ NEW: GET /api/admin/candidates - List all candidates
getCandidates: async (): Promise<Candidate[]> => {
  const res = await fetch(`${API_BASE}/admin/candidates/all`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw await handleError(res);
  const data = await res.json();

  return data.map((c: any) => ({
    id: c.id || c._id,
    full_name: c.full_name || c.full_Name,
    position_name: c.position_name || c.positionName,
    qualifications: c.qualifications,
    mobile: c.mobile,
    image: c.image,
    position_status: c.position_status || c.positionStatus,
  }));
},


  // ✅ NEW: GET /api/admin/candidates/:id - Single candidate
getCandidate: async (candidateId: string): Promise<Candidate> => {
  const res = await fetch(`${API_BASE}/admin/candidates/${candidateId}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw await handleError(res);
  const data = await res.json(); // single object

  return {
    id: data.id || data._id,
    full_name: data.full_name || data.full_Name,
    position_name: data.position_name || data.positionName,
    qualifications: data.qualifications,
    mobile: data.mobile,
    image: data.image,
    birth_date: data.birth_date,
    position_status: data.position_status || data.positionStatus,
    address: data.address,
  };
},


  // ✅ NEW: PUT /api/admin/candidates/:id - Update candidate
 updateCandidate: async (
  candidateId: string,
  payload: CandidateUpdateRequest
): Promise<Candidate> => {
  const res = await fetch(`${API_BASE}/admin/candidates/update/${candidateId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload), // ✅ use the argument, not a local var
  });

  if (!res.ok) throw await handleError(res);

  const result = await res.json();

  return {
    id: result.id || result._id,
    full_name: result.full_name || result.full_Name,
    position_name: result.position_name || result.positionName,
    qualifications: result.qualifications,
    mobile: result.mobile,
    image: result.image,
    birth_date: result.birth_date,
    position_status: result.position_status || result.positionStatus,
  };
},


  // POST /api/admin/candidates - Create candidate (UPDATED field names)
createCandidate: async (candidateData: CandidateCreateRequest): Promise<Candidate> => {
  const res = await fetch(`${API_BASE}/admin/candidates/create`, {
    method: 'POST',
    headers: getAuthHeaders(),
    // أرسل candidateData مباشرة بدون تغليفها في كائن آخر ✅
    body: JSON.stringify(candidateData), 
  });

  if (!res.ok) throw await handleError(res);
  const data = await res.json();

  return {
    id: data.id || data._id,
    full_name: data.full_name || data.full_Name,
    position_name: data.position_name || data.positionName,
    qualifications: data.qualifications,
    mobile: data.mobile,
    image: data.image,
    address: data.address,
    birth_date: data.birth_date,
    position_status: data.position_status || data.positionStatus,
  };
},



  // DELETE /api/admin/candidates/{candidate_id}
  deleteCandidate: async (candidateId: string): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/admin/candidates/delete/${candidateId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!res.ok) return handleError(res);
    return res.json();
  },


getElectionStatus: async (): Promise<SystemSettings> => {
    const res = await fetch(`${API_BASE}/admin/election-status`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw await handleError(res);
    return res.json();
  },


  updateElectionStatus: async (payload: SystemSettings): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/admin/update-status`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw await handleError(res);
    return res.json();
  },

  // ✅ NEW: POST /api/admin/start-voting
  startVoting: async (): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/admin/start-voting`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

     if (!res.ok) throw await handleError(res);
    return res.json();
  },

  // ✅ NEW: POST /api/admin/end-voting
  endVoting: async (): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/admin/end-voting`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

      if (!res.ok) throw await handleError(res);
    return res.json();
  },



// ✅ GET /api/admin/staff - قائمة جميع الموظفين
  getStaff: async (): Promise<Staff[]> => {
    const res = await fetch(`${API_BASE}/admin/staff`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) throw await handleError(res);
    const data = await res.json();
    return data.map((s: any) => ({
      id: s.id || s._id,
      username: s.username,
      created_at: s.created_at,
    }));
  },

  // ✅ GET /api/admin/staff/:id - جلب بيانات موظف واحد
  getStaffMember: async (staffId: string): Promise<Staff> => {
    const res = await fetch(`${API_BASE}/admin/staff/${staffId}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) throw await handleError(res);
    const s = await res.json();
    return {
      id: s.id || s._id,
      username: s.username,
      created_at: s.created_at,
    };
  },

  // ✅ POST /api/admin/staff/create - إنشاء حساب موظف جديد
  createStaff: async (payload: StaffCreateRequest): Promise<Staff> => {
    const res = await fetch(`${API_BASE}/admin/staff/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw await handleError(res);
    const s = await res.json();
    return {
      id: s.id || s._id,
      username: s.username,
      created_at: s.created_at,
    };
  },

  // ✅ PUT /api/admin/staff/:id - تحديث بيانات الموظف
  updateStaff: async (staffId: string, payload: StaffUpdateRequest): Promise<Staff> => {
    const res = await fetch(`${API_BASE}/admin/staff/${staffId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw await handleError(res);
    const s = await res.json();
    return {
      id: s.id || s._id,
      username: s.username,
      created_at: s.created_at,
    };
  },

  // ✅ DELETE /api/admin/staff/:id - حذف حساب موظف
  deleteStaff: async (staffId: string): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/admin/staff/${staffId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!res.ok) throw await handleError(res);
    return res.json();
  },


};
