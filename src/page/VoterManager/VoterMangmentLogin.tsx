import { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVoterMgmAuth } from '../../hooks/useVoterMgmAuth';

export const VoterMangmentLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useVoterMgmAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

 
    const result = await login({ username, password });
    
    if (result.success) {
      navigate('/voterMgmt/voters');
    } else {
      setError(result.error || 'خطأ في تسجيل الدخول');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f1ed] flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block mb-6">
            <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
              <path d="M50 10 L70 30 L60 30 L60 50 L70 50 L50 70 L30 50 L40 50 L40 30 L30 30 Z" fill="#2d3748" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">نظام التصويت الإلكتروني</h1>
          <p className="text-xl text-gray-700">تسجيل دخول</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <p className="text-center text-gray-600 mb-6">أدخل اسم المستخدم وكلمة المرور لتسجيل الدخول إلى هذا الموقع</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="اسم المستخدم..."
                className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-[#c9a677]"
                required
              />
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة السر..."
                className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-[#c9a677]"
                required
              />
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              {error && (
                <p className="absolute -bottom-5 right-0 text-xs text-red-500">{error}</p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              type="submit"
              disabled={loading}
              className="w-full bg-[#c9a677] hover:bg-[#b89560] text-white font-bold py-3 px-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              {loading ? 'جاري التحميل...' : 'إرسال'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          نظام التصويت الإلكتروني - جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
