import React, { useEffect, useState } from "react";
import { voterMgmApi} from '../../services/voterMgm.api';

const VoterStatusListing = () => {
  const [data, setData] = useState<any>({ voters_list: [], statistics: null });
  const [loading, setLoading] = useState(true);


  // دالة حساب النسبة المئوية
  const calculatePercent = (value: number, total: number) => {
    if (!total || total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

const fetchData = async () => {
    try {
      const response = await voterMgmApi.voterList(); 
      
      // هنا نقوم بجلب القائمة
      let voters = response.voters_list || [];

      // const sortedVoters = voters.reverse(); 

      setData({
    voters_list: [...(response.voters_list || [])].reverse(),
      statistics: { ...response.statistics }
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

// متغيرات مساعدة للنسب
  const stats = data.statistics;
  const currentTotal = stats?.total_eligible_voted || 0;
  const grandTotal = stats?.total_all || 0;

  if (loading) return <div className="p-20 text-center font-bold">جاري تحميل لوحة البيانات الحية...</div>;
  return (
    <div className="min-h-screen bg-gray-100 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        
        {/* الجدول (يسار) */}
        <div className="lg:flex-1 order-2 lg:order-1 ">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-900 p-5 flex justify-between items-center">
              <h2 className="text-white text-xl font-bold">قائمة الانتظار</h2>
              <span className="text-gray-400 text-sm">تحديث تلقائي</span>
            </div>
            <div className="overflow-y-auto max-h-[75vh]">
              <table className="w-full text-right">
                <thead className="bg-gray-200 sticky top-0 shadow-sm">
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
              {/* 1. الجمعية السابقة (بدون نسبة) */}
              <StatCard 
                label="عدد الجمعية العمومية السابقة" 
                value={stats?.total_all} 
                color="gray" 
              />

              {/* 2. الجمعية حالياً (نسبة من السابقة) */}
              <StatCard 
                label="عدد الجمعية العمومية حاليا" 
                value={stats?.total_eligible_voted} 
                percent={calculatePercent(stats?.total_eligible_voted, grandTotal)}
                color="gray" 
              />

              {/* 3. انتظار التصويت (نسبة من الحاليين) */}
              <StatCard 
                label="عدد الناخبين إنتظار التصويت" 
                value={stats?.total_eligible} 
                percent={calculatePercent(stats?.total_eligible, currentTotal)}
                color="green" 
              />

              {/* 4. الذين أتموا التصويت (نسبة من الحاليين) */}
              <StatCard 
                label="عدد الناخبين الذين اتموا التصويت" 
                value={stats?.total_voted} 
                percent={calculatePercent(stats?.total_voted, currentTotal)}
                color="blue" 
              />
            </div>
          </div>
        </div>

      </div>
    </div>  
  );
};

// مكون صغير لبطاقات الإحصائيات
// مكون صغير لبطاقات الإحصائيات
const StatCard = ({ label, value, percent, color }: any) => {
  const colors: any = {
    gray: "bg-gray-50 text-gray-700",
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700"
  };

  return (
    <div className={`${colors[color]} p-5 rounded-lg border-2 border-transparent hover:border-current transition-all`}>
      {/* العنوان في الأعلى */}
      <p className="text-xl font-medium opacity-70 mb-1">{label}</p>
      
      {/* حاوية مرنة تضع الرقم في اليمين والنسبة في اليسار */}
      <div className="flex items-baseline justify-between">
        {/* الرقم الأساسي */}
        <p className="text-4xl font-black">{value || 0}</p>
        
        {/* النسبة المئوية في الجهة المقابلة */}
        {percent !== undefined && (
          <div className="flex flex-col items-end">
            <span className="text-3xl font-bold opacity-80">
              {percent}%
            </span>
          
          </div>
        )}
      </div>
    </div>
  );
};

export default VoterStatusListing;