import { useState, useEffect } from "react";

export interface Candidate {
  _id: string;
  full_Name: string;
  positionName: string;    // ✅ MongoDB/Backend field name
  positionStatus: string;   // ✅ MongoDB field name  
  image: string;
}

export interface Position {
  id: string;
  position_name: string;
}

// ✅ Type Guard للتأكد إن القيمة string
const isString = (value: unknown): value is string => {
  return typeof value === "string";
};

// 1. Hook للمناصب النشطة
export const useActivePositions = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/voter/candidates")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("📥 Raw API Response:", data);
        
        // ✅ Type Guard + تصفية آمنة
        const validCandidates = (data as Candidate[]).filter((c: any) => 
          c && isString(c.positionStatus) && c.positionStatus === "multiple"
        );
        
        const positionNames = validCandidates
          .map((c: Candidate) => c.positionName)
          .filter(isString); // ✅ Type Guard
        
        const uniquePositions = Array.from(new Set(positionNames))
          .map((name, index) => ({
            id: `pos-${index}`,
            position_name: name
          }));
        
        console.log("✅ Active Positions:", uniquePositions);
        setPositions(uniquePositions);
        setError(null);
      })
      .catch(err => {
        console.error("❌ API Error:", err);
        setError("فشل في جلب المناصب");
      })
      .finally(() => setLoading(false));
  }, []);

  return { positions, loading, error };
};

// 2. Hook للمرشحين حسب المنصب
export const useCandidatesByPosition = (positionName: string) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!positionName) return;
    
    fetch("http://localhost:8080/api/voter/candidates")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("📥 Candidates for", positionName, ":", data);
        
        const filtered = (data as Candidate[]).filter((c: any) => {
          return c && 
                 isString(c.positionName) && c.positionName === positionName &&
                 isString(c.positionStatus) && c.positionStatus === "multiple";
        });
        
        console.log("✅ Filtered candidates:", filtered);
        setCandidates(filtered);
        setError(null);
      })
      .catch(err => {
        console.error("❌ Error:", err);
        setError("فشل في جلب المرشحين");
      })
      .finally(() => setLoading(false));
  }, [positionName]);

  return { candidates, loading, error };
};

