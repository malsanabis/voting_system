import { useState, useEffect } from 'react';
import { adminApi, Staff, StaffCreateRequest } from '../../services/admin.api';
import { ShieldCheck, Plus, Trash2, Edit, User, Lock, X, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreateVoterMgmt() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<StaffCreateRequest>({ username: '', password: '' });
  const onNavigate = useNavigate();

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getStaff();
      setStaffList(data);
    } catch (err: any) {
      alert('خطأ في تحميل قائمة الموظفين: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await adminApi.updateStaff(editingStaff.id, formData);
        alert('✅ تم تحديث بيانات الحساب');
      } else {
        await adminApi.createStaff(formData);
        alert('✅ تم إنشاء حساب الموظف بنجاح');
      }
      setIsModalOpen(false);
      setFormData({ username: '', password: '' });
      setEditingStaff(null);
      loadStaff();
    } catch (err: any) {
      alert('❌ خطأ: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الحساب نهائياً؟')) return;
    try {
      await adminApi.deleteStaff(id);
      loadStaff();
    } catch (err: any) {
      alert('❌ فشل الحذف: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f1ed] py-8 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-[#c9a677] p-3 rounded-lg">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">إدارة حسابات المنظمين</h1>
              <p className="text-sm text-gray-500">إدارة الصلاحيات والوصول للنظام</p>
            </div>
          </div>
          
          <button 
            onClick={() => { setEditingStaff(null); setFormData({username:'', password:''}); setIsModalOpen(true); }}
            className="bg-[#c9a677] hover:bg-[#b8956a] text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة منظم جديد</span>
          </button>

          <button
           onClick={() => onNavigate('/admin/dashboard')}
            className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-full transition-all shadow-sm flex items-center gap- border"
            >
            <Home className="w-5 h-5" /> لوحة التحكم </button>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="py-4 px-6 text-right font-bold text-gray-700">اسم المستخدم</th>
                <th className="py-4 px-6 text-right font-bold text-gray-700">تاريخ الإنشاء</th>
                <th className="py-4 px-6 text-center font-bold text-gray-700 w-32">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-20 text-center text-gray-500">جاري التحميل...</td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-20 text-center text-gray-500">لا يوجد موظفين مسجلين حالياً</td>
                </tr>
              ) : (
                staffList.map((staff) => (
                  <tr key={staff.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">{staff.username}</td>
                   <td className="py-4 px-6 text-gray-600">
                      {staff.created_at ? (
                        new Date(staff.created_at).getTime() ? (
                          new Date(staff.created_at).toLocaleDateString('ar-BH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        ) : (
                          "تاريخ غير صالح"
                        )
                      ) : (
                        "غير متوفر"
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center gap-3">
                        <button 
                          onClick={() => { setEditingStaff(staff); setFormData({username: staff.username, password:''}); setIsModalOpen(true); }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(staff.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Popup */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
              <div className="p-6 border-b flex justify-between items-center bg-[#c9a677] text-white rounded-t-2xl">
                <h3 className="text-xl font-bold">{editingStaff ? 'تعديل بيانات الحساب' : 'إنشاء حساب جديد'}</h3>
                <button onClick={() => setIsModalOpen(false)}><X /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">اسم المستخدم</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      required
                      className="w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#c9a677] outline-none"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {editingStaff ? 'كلمة المرور الجديدة (اختياري)' : 'كلمة المرور'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      required={!editingStaff}
                      placeholder={editingStaff ? 'اتركها فارغة لعدم التغيير' : ''}
                      className="w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#c9a677] outline-none"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#c9a677] text-white font-bold py-4 rounded-lg hover:bg-[#b8956a] transition-all">
                  {editingStaff ? 'حفظ التعديلات' : 'إنشاء الحساب'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}