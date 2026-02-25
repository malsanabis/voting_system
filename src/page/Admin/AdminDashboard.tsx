import { useState, useEffect } from 'react';
import { Users, UserCheck, CheckCircle, BarChart3, Settings, Home, LogOut, Bell } from 'lucide-react';
import { adminApi, Candidate, SystemSettings } from '../../services/admin.api';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useNavigate } from 'react-router-dom';
// import {generateMatamReport}  from '../../services/pdfReport';
 
interface VotingResults {
  total_votes_all: number;
  total_users: number;
  total_candidates: number;
  total_users2: number;
  // rate: number;
  // categories: Record<string, any>;
}

export const AdminDashboard = () => {
  const [results, setResults] = useState<VotingResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
   const {logout } = useAdminAuth();
   const [votingActive, setVotingActive] = useState(false); 
   const onNavigate = useNavigate();
   const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [printData, setPrintData] = useState<{
  results: any;
  candidates: any[];
} | null>(null);

   // دالة موحدة لجلب البيانات
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [resData, statusData] = await Promise.all([
        adminApi.getVotingResults(),
        adminApi.getElectionStatus()
      ]);
      setResults(resData);
      setSettings(statusData);
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
        const data = await adminApi.getVotingResults();
        setResults(data);
        setVotingActive(data.total_votes > 0);  // Infer from votes
      } catch (err: any) {
        setError(err.message);
        setVotingActive(false);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [])
  
  
const handleStartVoting = async () => {
    if (!window.confirm('⚠️ هل أنت متأكد؟ سيتم مسح جميع الأصوات الحالية وبدء دورة جديدة!')) return;
    
    try {
      setLoading(true);
      await adminApi.startVoting();
      await loadDashboardData(); // تحديث فوري للبيانات
      alert('✅ تم فتح باب التصويت بنجاح');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEndVoting = async () => {
    if (!window.confirm('🔒 هل تريد إنهاء العملية الانتخابية وإغلاق التصويت؟')) return;

    try {
      setLoading(true);
      await adminApi.endVoting();
      await loadDashboardData();
      alert('✅ تم إغلاق التصويت بنجاح');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleDownloadPDF = async () => {
    try {
      setLoading(true);

      const results = await adminApi.getVotingResults();
      const candidates = await adminApi.getCandidates();

      // Navigate and pass results + candidates to PDF page
      onNavigate("/admin/print/election-report", {
        state: { results, candidates },
      });
    } catch (err: any) {
      console.error("PDF Error:", err);
      alert("خطأ أثناء إنشاء الملف");
    } finally {
      setLoading(false);
    }
  };


 const handleGoToVoterReport = async () => {
  try {
    setLoading(true);

    // ✅ استخدم adminApi بدلاً من fetch لضمان إرسال الـ Token والـ Base URL
    const data = await adminApi.getVoterListReport();

    onNavigate("/admin/print/election-total-report", { 
   state: { results},
    });
  } catch (err: any) {
    console.error("PDF Error:", err);
    // إذا كان الخطأ 401، فالمشكلة في الصلاحيات
    alert("خطأ أثناء جلب قائمة الناخبين، تأكد من تسجيل الدخول");
  } finally {
    setLoading(false);
  }
};

const handleGoToVoterReport2 = async () => {
  try {
    setLoading(true);

    // ✅ استخدم adminApi بدلاً من fetch لضمان إرسال الـ Token والـ Base URL
    const data = await adminApi.getVoterListReport();

    onNavigate("/admin/print/election-report2", { 
   state: { results},
    });
  } catch (err: any) {
    console.error("PDF Error:", err);
    // إذا كان الخطأ 401، فالمشكلة في الصلاحيات
    alert("خطأ أثناء جلب قائمة الناخبين، تأكد من تسجيل الدخول");
  } finally {
    setLoading(false);
  }
};


  // متغيرات مساعدة للواجهة
  const isVotingOpen = settings?.is_open === true;


  return (
    <div className="min-h-screen bg-[#f5f1ed] flex" dir="rtl">
      <aside className="w-64 bg-[#d4b896] p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Home className="w-5 h-5 text-[#d4b896]" />
          </div>
          <span className="text-gray-800 font-semibold">إدارة الانتخابات</span>
        </div>

        <nav className="space-y-2 flex-1">
          <button
            onClick={() => onNavigate('/admin/dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-800 bg-white rounded-lg"
          >
            <Home className="w-5 h-5" />
            <span>الرئيسية</span>
          </button>
          <button
             onClick={() => onNavigate('/admin/candidates')}  
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-white/50 rounded-lg transition-colors"
          >
            <Users className="w-5 h-5" />
            <span>المرشحون</span>
          </button>
          { <button onClick={() => onNavigate('/admin/candidates')} className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-white/50 rounded-lg transition-colors">
            <UserCheck className="w-5 h-5" />
            <span>الناخبون</span>
          </button>
          /*
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-white/50 rounded-lg transition-colors">
            <BarChart3 className="w-5 h-5" />
            <span>الإحصائيات</span>
          </button> */}
          <button onClick={() => onNavigate('/admin/staff')}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-white/50 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
            <span>الإعدادات</span>
          </button>
        </nav>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-white/50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>تسجيل خروج</span>
        </button>
      </aside>

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            {/* <div className="flex items-center gap-4">
              <Bell className="w-6 h-6 text-gray-600" />
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            </div> */}
            <h1 className="text-3xl font-bold text-gray-800">لوحة التحكم</h1>
          </div>

          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-right">
                <p className="text-sm text-gray-600">عدد أخر جمعية عمومية</p>
                  <p className="text-2xl font-bold text-gray-800"> {results?.total_users2?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>


            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-right">
                <p className="text-sm text-gray-600">عدد المرشحين</p>
                  <p className="text-2xl font-bold text-gray-800"> {results?.total_candidates?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>


             <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-amber-600" />
                </div>
                <div className="text-right">
                   <p className="text-sm text-gray-600"> إجمالي الناخبين المسجلين</p>
                  <p className="text-2xl font-bold text-gray-800">{results?.total_users?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">عدد الناخبين المصوتين</p>
                  <p className="text-2xl font-bold text-gray-800"> {results?.total_votes_all?.toLocaleString()}</p>
                </div>
              </div>
            </div>
           </div>

          <div className="bg-white rounded-xl p-8 mb-8 shadow-sm relative">
            <h2 className="text-xl font-bold text-gray-800 mb-8 text-right">إجراءات التحكم بالانتخابات</h2>
            <p className="text-gray-600 text-right mb-6">إدارة وجدولة فتح وإنهاء العملية الانتخابية</p>
             <div className="absolute top-4 left-12 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${votingActive ? 'bg-green-100' : 'bg-red-100'}`}>
                  <CheckCircle className={`w-10 h-10 ${votingActive ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">حالة الانتخابات</p>
                  <p className="text-2xl font-bold text-gray-800">{votingActive ? 'نشطة' : 'متوقفة'}</p>
                </div>
              </div>

            <div className="space-y-4">
              <button
                onClick={handleStartVoting}
                disabled={loading || isVotingOpen}
                className="w-full bg-[#c9a677] hover:bg-[#b89560] text-white font-bold py-4 px-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-right flex items-center justify-center gap-2"
              >
                <span>بدء الانتخابات</span>
              </button>
              <button
                onClick={handleEndVoting}
               disabled={loading || !isVotingOpen}
                className="w-full bg-[#c9a677] hover:bg-[#b89560] text-white font-bold py-4 px-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-right flex items-center justify-center gap-2"
              >
                <span>إنهاء الانتخابات</span>
              </button>
            </div>
            {settings?.is_locked && (
        <p className="text-amber-600 text-sm mt-4 text-right">
          ⚠️ النظام في حالة "قفل التعديل" - لا يمكن إضافة أو حذف مرشحين حالياً.
        </p>
      )}
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-gray-800 mb-1">عرض قائمة المرشحين</h3>
                  <p className="text-sm text-gray-600">تصفح وإدارة قائمة جميع المرشحين المسجلين في النظام</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('candidates')}
                className="text-[#c9a677] hover:text-[#b89560] font-semibold"
              >
                ←
              </button>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-gray-800 mb-1">الانتقال إلى الإحصائيات</h3>
                  <p className="text-sm text-gray-600">عرض تفصيلات مفصلة ونتائج الانتخابات الحالية</p>
                </div>
              </div>
              <button onClick={handleDownloadPDF} className="bg-green-600">
               تحميل النتائج PDF
              </button>
               <button onClick={handleGoToVoterReport} className="bg-green-600 gap-12 mx-4">
               تحميل البيانات للتصفير PDF
              </button>
              <button onClick={handleGoToVoterReport2} className="bg-green-600 gap-12 mx-4">
               تحميل البيانات الفتره الاولة PDF
              </button>
            </div>
          </div>


          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-right flex-1 mr-6">
                <h3 className="font-bold text-gray-800 mb-1">إعدادات سريعة</h3>
                <p className="text-sm text-gray-600">تعديل المتغيرات الأساسية للنظام</p>
              </div>
            </div>
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600 text-right">أقل سن مسموح للتصويت</p>
              <p className="text-sm text-gray-500 text-right mt-1">يحدد الحد الأدنى للعمر المسموح للمشاركين في العملية الانتخابية</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

