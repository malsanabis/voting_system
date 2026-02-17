import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Edit, Vote, Plus, LogOut,BarChart3,UserCheck } from 'lucide-react';
import { voterMgmApi,Voter } from '../../services/voterMgm.api';
import { useVoterMgmAuth } from '../../hooks/useVoterMgmAuth';


interface VotingResults {
  total_users_isEligible: number;
  total_users: number;
}

export default function VoterList() {
  const navigate = useNavigate();
   const [voters, setVoters] = useState<Voter[]>([]);
  const [filteredVoters, setFilteredVoters] = useState<Voter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const {logout } = useVoterMgmAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const VOTERS_PER_PAGE = 25; 
  const [results, setResults] = useState<VotingResults | null>(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [resData] = await Promise.all([
        voterMgmApi.getVotingResults(),
      ]);
      setResults(resData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);


    useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await voterMgmApi.getVotingResults();
        setResults(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [])
  

  useEffect(() => {
    loadVoters();
  }, []);

  // Filter voters as user types
  useEffect(() => {
    const filtered = voters.filter(
      (voter) =>
        voter.voter_id.includes(searchTerm) ||
        voter.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVoters(filtered);
  }, [searchTerm, voters]);

  const paginatedVoters = filteredVoters.slice(
  (currentPage - 1) * VOTERS_PER_PAGE,
  currentPage * VOTERS_PER_PAGE
);

  const totalPages = Math.ceil(filteredVoters.length / VOTERS_PER_PAGE);

  const loadVoters = async () => {
    try {
      setLoading(true);
      setError('');
      // ✅ Use your voterMgmApi (not Supabase)
      const loadedVoters = await voterMgmApi.getVoters();
      setVoters(loadedVoters);
      setFilteredVoters(loadedVoters);
    } catch (err: any) {
      console.error('Error loading voters:', err);
      setError('خطأ في تحميل الناخبين');
    } finally {
      setLoading(false);
    }
  };

// const handleEdit = (voterId: string) => {
//   // ✅ Hash CPR or use btoa (base64)
//   const encodedId = btoa(voterId); // 687689887 → ZjY4NzY4OTg4Nw==
//   navigate(`/voterMgmt/voter/${encodedId}/edit`);
// };

  const handleEdit = (voterId: string) => {
    navigate(`/voterMgmt/voter/${voterId}/edit`);
  };


  const handleRefresh = () => {
    loadVoters();
  };

  return (

    <div className="relative z-10 min-h-screen bg-[#f5f1ed] opacity-100 py-8 px-4" dir="rtl">
    

      <div className="max-w-6xl mx-auto">

          {/* ✅ LOGO TOP-LEFT CORNER */}
  <div className="absolute top-8 left-8 w-24 h-20 lg:w-32 lg:h-24 z-20">
    <img 
      className="w-full h-full object-contain drop-shadow-lg"
      src="/Gemini_image.png" 
      alt="Logo"
    />
  </div>

        <div className="flex  gap-4  mb-8">
          <div className="flex gap-2">
      
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Vote className="w-10 h-10 text-[#c9a677]" />
            قائمة الناخبين
             </h1>
          </div>
        <button
          onClick={logout}
           className="bg-[#c9a677] hover:bg-[#b8956a] text-white font-bold px-6 py-3 rounded-lg transition-colors text-lg flex items-center gap-2">
          <LogOut className="w-5 h-5" />
          <span>تسجيل خروج</span>
        </button>
        </div>
        

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          {/* title form */}
          {/* <div className="text-center mb-8">
            {/* <h2 className="text-2xl font-bold text-gray-900 mb-4">
              إدارة الناخبين
            </h2>
            <p className="text-gray-600">
              استعرض قائمة الناخبين وابحث حسب الاسم أو رقم الهوية
            </p> */}
          {/* </div> */}

            <div className="bg-white rounded-xl p-6 shadow-sm float-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">عدد الناخبين من يمكنهم المصوتين</p>
                  <p className="text-2xl font-bold text-gray-800"> {results?.total_users_isEligible?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm float-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600"> إجمالي الناخبين المسجلين</p>
                  <p className="text-2xl font-bold text-gray-800">{results?.total_users?.toLocaleString()|| 0 }</p>
                </div>
              </div>
            </div>
        
         {/* Search Section - Button + Search + Results */}
        <div className="mb-8 max-w-2xl mx-4">
          {/* Button + Search Row */}
          <div className="flex gap-3 items-end">
            {/* Refresh Button */}
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="flex-shrink-0 bg-[#c9a677] hover:bg-[#b8956a] text-white font-bold px-6 py-4 rounded-lg transition-colors text-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>تحديث</span>
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            </button>
            
            {/* Search Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="ابحث بالاسم أو رقم الهوية (CPR)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[#c9a677] bg-opacity-30 rounded-lg text-right text-lg placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#c9a677] focus:bg-opacity-40"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
            </div>
          </div>
          
          {/* Results Count - Directly Below */}
          <p className="text-sm text-gray-500 text-right mt-2 pt-1">
            نتائج البحث: {filteredVoters.length} من {voters.length}
          </p>
        </div>

         
           

        {/* Voters Table - REORDERED ONLY */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-300">
                {/* 1️⃣ رقم الهوية - FIRST */}
                <th className="text-right py-4 px-6 font-bold text-lg text-gray-900">
                  رقم الهوية
                </th>
                {/* 2️⃣ الاسم الكامل - SECOND */}
                <th className="text-right py-4 px-6 font-bold text-lg text-gray-900">
                  الاسم الكامل
                </th>
                {/* 3️⃣ نوع العضوية */}
                <th className="text-right py-4 px-6 font-bold text-lg text-gray-900">
                  نوع العضوية
                </th>
                {/* 4️⃣ العمر */}
                <th className="text-right py-4 px-6 font-bold text-lg text-gray-900">
                  العمر
                </th>
                {/* 5️⃣ حالة التصويت */}
                <th className="text-right py-4 px-6 font-bold text-lg text-gray-900">
                  حالة التصويت
                </th>
                {/* 6️⃣ الإجراءات - LAST */}
                <th className="text-right py-4 px-6 font-bold text-lg text-gray-900 w-16">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-600 text-xl">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-[#c9a677] border-t-transparent rounded-full animate-spin mx-auto" />
                      <span>جاري تحميل الناخبين...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-red-600 text-xl">
                    <div className="flex flex-col items-center gap-4">
                      <span>❌ {error}</span>
                      <button 
                        onClick={handleRefresh}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
                      >
                        إعادة المحاولة
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredVoters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-600 text-xl">
                    <div className="flex flex-col items-center gap-4">
                      <Search className="w-16 h-16 text-gray-400" />
                      <span>لا توجد نتائج لعرضها</span>
                      {searchTerm && (
                        <p className="text-sm text-gray-500">جرب كلمة بحث مختلفة</p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                 paginatedVoters.map((voter: any) => (  // ✅ CHANGED: paginatedVoters
                <tr key={voter.voter_id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">

                    {/* 1️⃣ رقم الهوية */}
                    <td className="py-4 px-6 text-gray-700 text-lg font-mono">
                      {voter.voter_id}
                    </td>
                    {/* 2️⃣ الاسم الكامل */}
                    <td className="py-4 px-6 text-gray-900 text-lg font-semibold">
                      {voter.full_name}
                    </td>
                    {/* 3️⃣ نوع العضوية */}
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {voter.membership_type === 'عضوية كاملة' ? 'عضوية كاملة' : 'عضوية ناقصة'}
                      </span>
                    </td>
                    {/* 4️⃣ العمر */}
                    <td className="py-4 px-6 text-gray-700 text-lg font-medium">
                      {voter.age || 'غير محدد'}
                    </td>
                    {/* 5️⃣ حالة التصويت */}
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        voter.is_eligible 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {voter.is_eligible ? 'يحق له التصويت' : 'لا يحق له التصويت'}
                      </span>
                    </td>
                    {/* 6️⃣ الإجراءات - LAST */}
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleEdit(voter.voter_id)}
                        className="text-[#c9a677] hover:text-[#b8956a] hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
                        title="تعديل الناخب"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
{/* ✅ COMPACT TABLE-INTEGRATED PAGINATION */}
{!loading && filteredVoters.length > 0 && (
  <div className="border-t border-gray-200 pt-4">
    <div className="flex items-center justify-between">
      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        عرض {((currentPage - 1) * VOTERS_PER_PAGE + 1)} إلى{' '}
        {Math.min(currentPage * VOTERS_PER_PAGE, filteredVoters.length)} من {filteredVoters.length} نتيجة
      </div>
      
      {/* Navigation Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-[#c9a677] hover:text-white hover:border-[#c9a677] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
            → السابق   
        </button>
        
        <span className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md min-w-[80px] text-center">
          {currentPage} من {totalPages}
        </span>
        
        <button
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-[#c9a677] hover:text-white hover:border-[#c9a677] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          التالي ←
        </button>
      </div>
    </div>
  </div>
)}
              


          {/* Add New Voter Button */}
          {loading ? null : (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => navigate('/voterMgmt/voter/create')}
                className="bg-[#c9a677] hover:bg-[#b8956a] text-white font-bold px-16 py-4 rounded-lg transition-all duration-200 text-xl shadow-lg flex items-center gap-3 hover:shadow-xl hover:-translate-y-0.5"
              >
                <Plus className="w-6 h-6" />
                <span>إضافة ناخب جديد</span>
              </button>
            </div>
          )}
        </div>

        <footer className="text-center text-gray-600 mt-8">
          نظام التصويت الإلكتروني، جميع الحقوق محفوظة © 2026
        </footer>
      </div>
    </div>
  );
}
