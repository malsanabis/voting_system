const API_BASE = 'http://192.168.100.222:8080/api'; // تأكد من المنفذ الصحيح لـ FastAPI


export interface Candidate {
  id: string;
  full_Name: string;
  image: string;
  position_name: string;
  position_status: 'multiple' | 'single';
}

export const authApi = {
  loginVoter: async (voterId: string) => {
   const res = await fetch(`${API_BASE}/auth/login/voter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ VoterId: voterId }),
    });

    localStorage.clear();
  const data = await res.json().catch(() => ({}));

     if (res.status === 403 && data.detail?.includes("hasVoted")) {
      throw new Error("لقد قمت بالتصويت مسبقاً. شكراً لمشاركتك!");
    }
    if (res.status === 403) {
      const errorData = await res.json();
      throw new Error(errorData.detail || "أنت غير مسجل أو غير مؤهل للتصويت");
    }

    if (!res.ok) throw new Error("فشل في عملية التحقق");
    
 
    localStorage.setItem('voter_id', voterId);  // VoterId
    localStorage.setItem('auth_token', data.access_token);
    localStorage.setItem('user_role', data.role);
    return data;
  },
};



// ✅ candidatesAPI - جلب مرشحين position_status="multiple" فقط
export const candidatesAPI = {
  // جلب **كل** المناصب اللي position_status="multiple"
  getActivePositions: async (): Promise<Candidate[]> => {
    const res = await fetch(`${API_BASE}/voter/candidates`);  // بدون position param
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "فشل في جلب المناصب النشطة");
    }
    return res.json();
  },

  // جلب مرشحين منصب معين (position_status="multiple" فقط)
  getByPosition: async (position_name: string): Promise<Candidate[]> => {
    const res = await fetch(`${API_BASE}/voter/candidates?position=${position_name}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "فشل في جلب مرشحي المنصب");
    }
    return res.json();
  }
};


export const votesAPI = {
  submit: async (voteData: { 
    VoterId: string;  // ✅ Match backend VoteCreate
    choices: Array<{
      positionName: string;
      candidateId: string;
    }>
  }) => {

    if (!voteData.VoterId) {
        throw new Error("رقم الناخب مفقود. يرجى تسجيل الدخول مجدداً");
    }

    const res = await fetch(`${API_BASE}/voter/cast-vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voteData)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      
      // ✅ FIXED: Handle Pydantic array errors properly
      let errorMessage = 'فشل في تسجيل الصوت';
      
      if (errorData.detail) {
        if (Array.isArray(errorData.detail)) {
          // Pydantic validation errors: [{"type": "...", "msg": "..."}, ...]
          errorMessage = errorData.detail
            .map((err: any) => err.msg || err.detail || String(err))
            .filter(Boolean)
            .join('، ');
        } else {
          errorMessage = String(errorData.detail);
        }
      }
      
      throw new Error(errorMessage);
    }
    const result = await res.json();
    
    // ✅ Update localStorage AFTER successful vote
    localStorage.setItem('hasVoted', 'true');
    
    return result;
  }
};
