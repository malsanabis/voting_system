import { promises } from "node:dns";

const API_BASE = 'http://192.168.100.222:8080/api';

export interface VoterMgmLoginRequest {
  username: string;
  password: string;
}

export interface VoterMgmResponse {
  access_token: string;
  token_type: string;
}

export interface Voter {
  voter_id: string;
  full_name: string;
  // birthDate: string;
  mobile?: string;
  address?: string;
  age?: number;
membership_type: 'عضوية ناقصة' | 'عضوية كاملة';
  
}

export interface VoterCreateRequest {
  voter_id: string;
  full_name: string;
  // birthDate?: string;
  mobile?: string;
  address?: string;
  age: number;
  membership_type: 'عضوية ناقصة' | 'عضوية كاملة';
}

export interface VoterUpdateRequest {
  voter_id?: string;
  full_name?: string;
  // birthDate?: string;
  mobile?: string;
  address?: string;
  age?:number;
  membership_type: 'عضوية ناقصة' | 'عضوية كاملة';
}

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('voterMgmt_token')}`,
  'Content-Type': 'application/json',
});

const handleError = async (res: Response): Promise<never> => {
  const error = await res.json().catch(() => ({}));
  throw new Error(error.detail || 'حدث خطأ');
};

export const voterMgmApi = {
  // POST /api/auth/login/staff
  login: async (credentials: VoterMgmLoginRequest): Promise<VoterMgmResponse> => {
    const res = await fetch(`${API_BASE}/auth/login/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) return handleError(res);
    return res.json();
  },


  // list voters
// في ملف voterMgm.api.ts
getVoters: async (): Promise<Voter[]> => {
  const res = await fetch(`${API_BASE}/staff/voters`, {
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) return handleError(res);
  
  const data = await res.json();
  
  // تأكد من تحويل البيانات القادمة من الباكيند لتناسب الـ Interface الخاص بك
  return data.map((v: any) => ({
    voter_id: v.VoterId || v.voter_id || "", 
    full_name: v.VoterName || v.full_name || "غير معروف",
    mobile: v.phone || "0",
    address: v.address || "",
    membership_type: v.MembershipType || v.membership_type || 'عضوية ناقصة',
    age: v.age || v.Age || 0,
    is_eligible: v.isEligible ?? v.is_eligible ?? false, // استخدام ?? للتعامل مع القيم البوليانية
  }));
},

updateVoter: async (
  voter_id: string,                    // ID from URL param
  data: Partial<VoterUpdateRequest>
): Promise<Voter> => {
  const payload: any = {};
  
  if(data.voter_id) payload.voter_id = data.voter_id;
  if (data.full_name) payload.VoterName = data.full_name;
  if (data.mobile !== undefined) payload.phone = data.mobile;
  if (data.address !== undefined) payload.address = data.address;
  if (data.membership_type) payload.MembershipType = data.membership_type;

  const res = await fetch(`${API_BASE}/staff/voter/${voter_id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),  // Only send changed fields
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  const result = await res.json();
  return {
    voter_id: result.VoterId || result.voter_id,
    full_name: result.VoterName || result.full_name,
    mobile: result.phone,
    // birthDate: result.birthDate,
    address: result.address,
    membership_type: result.MembershipType || result.membership_type,
    age:result.age,
  };
},

createVoter: async (data: VoterCreateRequest): Promise<Voter> => {
  const res = await fetch(`${API_BASE}/staff/register-voter`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      VoterId: data.voter_id,
      VoterName: data.full_name,
      // birthDate: data.birthDate,
      phone: data.mobile,
      address: data.address,
      MembershipType: data.membership_type,
      age: data.age,
    }),
  });

  if (!res.ok) return handleError(res);
  const v = await res.json();
  return {
    voter_id: v.VoterId || v.voter_id,
    full_name: v.VoterName || v.full_name,
    // birthDate: v.birthDate,
    mobile: v.phone,
    address: v.address,
    membership_type: v.MembershipType || v.membership_type,
    age:v.age,
  };
},


getVoterById: async (voterId: string): Promise<Voter> => {
  const res = await fetch(`${API_BASE}/staff/voter/${voterId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) return handleError(res);
  const data = await res.json();
  return {
    voter_id: data.VoterId || data.voter_id,
    full_name: data.VoterName || data.full_name,
    mobile: data.phone,
    address: data.address,
    membership_type: data.MembershipType || data.membership_type,
    age: data.age || data.Age,
    // is_Eligible: data.isEligible || data.is_eligible || false,
  };
},



  // GET /api/staff/results
  getVotingResults: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/staff/results`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) return handleError(res);
    return res.json();
  },


checkVoterExists: async (voterId: string): Promise<{ exists: boolean }> => {
  const res = await fetch(`${API_BASE}/staff/voters/check/${voterId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to check ID status');
  return res.json();
},


voterList: async (): Promise<any> => {
  // المسار: /api + /staff + /voters/listing
  const res = await fetch(`${API_BASE}/staff/voters/listing`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
},

  // // ✅ NEW: PUT /api/staff/voter/:id - Update voter
  // updateVoter: async (
  //   voter_id: string, 
  //   data: VoterUpdateRequest
  // ): Promise<Voter> => {
  //   const res = await fetch(`${API_BASE}/staff/voter/${voter_id}`, {
  //     method: 'PUT',
  //     headers: getAuthHeaders(),
  //     body: JSON.stringify(data),
  //   });

  //   if (!res.ok) return handleError(res);
  //   const result = await res.json();
  //   return {
  //     voter_id: result.voter_id || result.voter_id,
  //     full_name: result.full_name || result.full_Name,
  //     address: result.address || result.address,
  //     mobile: result.mobile,
  //     membership_type: result.membership_type || result.membership_type,
  //   };
  // },

  // // POST /api/staff/voter - Create voter
  // createVoter: async (VoterData: VoterCreateRequest): Promise<Voter> => {
  //   const res = await fetch(`${API_BASE}/register-voter`, {
  //     method: 'POST',
  //     headers: getAuthHeaders(),
  //     body: JSON.stringify(VoterData),
  //   });

  //   if (!res.ok) return handleError(res);
  //   const data = await res.json();
  //   return {
  //     voter_id: data.id || data._id || data.voter_id,
  //     full_name: data.full_name || data.full_Name || data.VoterName,
  //     address: data.address || data.address || data.address,
  //     mobile: data.mobile,
  //     membership_type: data.membership_type || data.membership_type || 'عضويه ناقصه',
  //   };
  // },


};
