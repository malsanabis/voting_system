import React, { useEffect, useState } from "react";
import { voterMgmApi} from '../../services/voterMgm.api';

const VoterStatusListing = () => {
  const [data, setData] = useState<any>({ voters_list: [], statistics: null });
  const [loading, setLoading] = useState(true);

const fetchData = async () => {
    try {
      const response = await voterMgmApi.voterList(); 
      
      // هنا نقوم بجلب القائمة
      let voters = response.voters_list || [];

      // إذا كان الباكيند يرسل الأحدث أولاً (Newest First) 
      // سنستخدم .reverse() لجعل الأحدث يصبح في الأسفل
      const sortedVoters = voters.reverse(); 

      setData({
        voters_list: sortedVoters, 
        statistics: response.statistics || null
      });
    } catch (err) {
      console.error("خطأ في جلب البيانات", err);
    } finally {
      setLoading(false);
    }
};
  useEffect(() => {
    fetchData();
    // تحديث تلقائي كل 30 ثانية
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-20 text-center font-bold">جاري تحميل لوحة البيانات الحية...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        
        {/* الجدول (يسار) */}
        <div className="lg:flex-1 order-2 lg:order-1">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-900 p-5 flex justify-between items-center">
              <h2 className="text-white text-xl font-bold">قائمة الانتظار</h2>
              <span className="text-gray-400 text-sm">تحديث تلقائي</span>
            </div>
            <div className="overflow-y-auto max-h-[75vh]">
              <table className="w-full text-right">
                <thead className="bg-gray-50 sticky top-0 shadow-sm">
                  <tr>
                    <th className="p-4 text-gray-600 border-b">اسم الناخب</th>
                    <th className="p-4 text-gray-600 border-b">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {data.voters_list.map((voter: any) => (
                    <tr key={voter._id} className="hover:bg-blue-50 border-b transition-colors">
                      <td className="p-4 font-bold text-gray-800">{voter.VoterName}</td>
                      <td className="p-4">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                          انتظار التصويت
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* الإحصائيات (يمين) */}
        <div className="w-full lg:w-96 order-1 lg:order-2">
          <div className="bg-white rounded-xl shadow-xl border border-blue-200 overflow-hidden sticky top-6">
            <div className="bg-blue-800 p-6 text-center text-white">
              <h3 className="text-lg opacity-80">متابعة التصويت المباشر</h3>
              <p className="text-2xl font-black mt-1">الإحصائيات العامة</p>
            </div>
            
            <div className="p-6 space-y-4">
              <StatCard label="إجمالي المسجلين" value={data.statistics?.total_all} color="gray" />
              <StatCard label="قائمة الإنتظار للتصويت" value={data.statistics?.total_eligible} color="green" />
              <StatCard label="أصوات تم استلامها" value={data.statistics?.total_voted} color="blue" />
            </div>
          </div>
        </div>

      </div>
    </div>  
  );
};

// مكون صغير لبطاقات الإحصائيات
const StatCard = ({ label, value, color }: any) => {
  const colors: any = {
    gray: "bg-gray-50 text-gray-700",
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700"
  };
  return (
    <div className={`${colors[color]} p-5 rounded-lg border-2 border-transparent hover:border-current transition-all`}>
      <p className="text-sm font-medium opacity-70">{label}</p>
      <p className="text-3xl font-black mt-1">{value || 0}</p>
    </div>
  );
};

export default VoterStatusListing;