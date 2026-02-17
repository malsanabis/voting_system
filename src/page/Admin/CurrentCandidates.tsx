

import { useState, useEffect } from 'react';
import { Home, Filter, Edit3, Trash2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/admin.api';

interface BackendCandidate {
  id: string;
  full_name: string;
  position_name: string;
  qualifications?: string;
  mobile?: string;
  image?: string;
  position_status: 'multiple' | 'single';
}

export const CurrentCandidates = () => {
  const [candidates, setCandidates] = useState<BackendCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError('');
      // ✅ Fixed: Direct adminApi call (no Supabase destructuring)
      const data = await adminApi.getCandidates();
      setCandidates(data);
    } catch (err: any) {
      console.error('Error loading candidates:', err);
      setError(err.message || 'فشل في تحميل المرشحين');
    } finally {
      setLoading(false);
    }
  };

  const deleteCandidate = async (candidateId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المرشح؟')) return;
    
    try {
      await adminApi.deleteCandidate(candidateId);
      setCandidates(candidates.filter(c => c.id !== candidateId));
    } catch (err: any) {
      alert('فشل في حذف المرشح: ' + err.message);
    }
  };

  const editCandidate = (candidate: BackendCandidate) => {
    // Navigate with candidate data or use modal
    navigate(`/admin/candidates/${candidate.id}/edit`, { 
      state: { candidate } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f1ed] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d7b08e]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f1ed] p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/admin/candidates/create')}
              className="bg-[#c9a677] hover:bg-[#b89560] text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg"
            >
              إضافة مرشح جديد
            </button>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-full transition-all shadow-sm flex items-center gap-2 border"
            >
              <Home className="w-5 h-5" />
              لوحة التحكم
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <h1 className="text-3xl font-bold text-gray-800">قائمة المرشحين</h1>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-center">
            <p className="text-red-800 text-lg mb-4">{error}</p>
            <button 
              onClick={loadCandidates}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Candidates Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#d7b08e] to-[#c9a07e]">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold text-white">الاسم الكامل</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-white">المنصب</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-white">المؤهلات</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-white">الجوال</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-white">الصورة</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-white">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                          <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium">لا توجد مرشحين حالياً</p>
                        <p className="text-sm text-gray-500">ابدأ بإضافة أول مرشح</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  candidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50 transition-all">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{candidate.full_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                          {candidate.position_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 max-w-xs truncate">
                        {candidate.qualifications || 'غير محدد'}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {candidate.mobile || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {candidate.image ? (
                          <img 
                            src={candidate.image} 
                            alt={candidate.full_name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                              e.currentTarget.src = '/api/placeholder/48/48';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-semibold text-sm">
                              {candidate.full_name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => editCandidate(candidate)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="تعديل"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteCandidate(candidate.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add New Candidate CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/admin/candidates/create')}
            className="bg-gradient-to-r from-[#d7b08e] to-[#c9a07e] hover:from-[#c9a07e] hover:to-[#b89560] text-white font-bold py-4 px-12 rounded-2xl transition-all shadow-xl text-xl flex items-center gap-2 mx-auto"
          >
            إضافة مرشح جديد
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-12">
          نظام التصويت الإلكتروني - جميع الحقوق محفوظة © 2026
        </p>
      </div>
    </div>
  );
};
