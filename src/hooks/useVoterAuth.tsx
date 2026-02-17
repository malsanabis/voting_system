import { useEffect, useState ,useRef } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';

const INACTIVITY_LIMIT = 1 * 60 * 1000;

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const voterId = localStorage.getItem('voter_id');
    const token = localStorage.getItem('auth_token');
    const voted = localStorage.getItem('hasVoted') === 'true';

    if (voterId && token && !voted) {
      setIsAuthenticated(true);
    } else if (voted) {
      setHasVoted(true);
      setIsAuthenticated(false);
    }
    
    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('voter_id');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('hasVoted');
    setIsAuthenticated(false);
    navigate('/');
  };

  return { isAuthenticated, isLoading, hasVoted, logout };
};

// Protected Route Component
export const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { isAuthenticated, isLoading, hasVoted, logout } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);


  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      alert("انتهت الجلسة بسبب عدم النشاط");
      logout();
    }, INACTIVITY_LIMIT);
  };


  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen" > جاري التحميل...</div>;
  }

  if (hasVoted) {
    return (
      
   <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
  {/* 1. طبقة الصورة الخلفية */}
  <img 
    className="absolute inset-0 w-full h-full object-cover z-0" 
    alt="Background"
    src="/Gemini_image.png"
  />


  <div className="absolute inset-0 bg-white/20 z-10"></div>


  <div className="relative z-20 flex flex-col items-center justify-center text-center px-4">
    <div className="text-6xl mb-8">✅</div>
    
    <h1 className="text-4xl font-bold text-gray-800 mb-4 [direction:rtl]">
      لقد أكملت التصويت
    </h1>
    
    <p className="text-xl text-gray-600 mb-8 [direction:rtl]">
      شكراً لمشاركتك في العملية الانتخابية
    </p>
    
    <button 
      onClick={() => window.location.href = '/'} 
      className="px-8 py-4 bg-[#d7b08e] text-white rounded-xl text-xl font-bold hover:bg-[#c9a07e] transition-all [direction:rtl]"
    >
      العودة للرئيسية
    </button>
  </div>
</div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};