import { useEffect, useState } from 'react';
import { Home, Upload, User, Calendar, Phone, MapPin } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { adminApi } from '../../services/admin.api';

interface CandidateFormData {
  full_name: string;
  position_name: string;
  qualifications: string;
  mobile: string;
  image: string;
  birth_date: string;
  address: string;
  position_status: 'multiple' | 'single';
}

const positionOptions = [
  { value: "رئيس مجلس الإدارة", label: "رئيس مجلس الإدارة" },
  { value: "نائب رئيس مجلس الإدارة", label: "نائب رئيس مجلس الإدارة" },
  { value: "أمين السر", label: "أمين السر" },
  { value: "الأمين المالي", label: "الأمين المالي" },
  { value:  "مدير المأتم", label: "مدير المأتم" },
  { value: "منسق اللجان الفاعلة", label: "منسق اللجان الفاعلة" },
  { value: "منسق اللجان الداعمة", label: "منسق اللجان الداعمة" },
];

export const CreateCandidate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  const isEditMode = !!id;
// 1. حالة واحدة للبيانات لضمان المزامنة
  const [formData, setFormData] = useState<CandidateFormData>({
    full_name: '',
    position_name: '',
    qualifications: '',
    mobile: '',
    image: '',
    birth_date: '',
    address: '',
    position_status: 'single'
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [error, setError] = useState('');

  // 2. جلب البيانات وتحديث الـ Form مباشرة
  useEffect(() => {
    if (isEditMode && id) {
      const fetchCandidate = async () => {
        try {
          setLoadingData(true);
          const candidate = await adminApi.getCandidate(id);
          
          // تحويل التاريخ من ISO (2024-01-01T00:00:00Z) إلى format (YYYY-MM-DD)
         let formattedDate = '';
          if (candidate.birth_date) {
            formattedDate = candidate.birth_date.includes('T') 
              ? candidate.birth_date.split('T')[0] 
              : candidate.birth_date;
          }
          setFormData({
            full_name: candidate.full_name || '',
            position_name: candidate.position_name || '',
            qualifications: candidate.qualifications || '',
            mobile: candidate.mobile || '',
            image: candidate.image || '',
            birth_date: formattedDate,
            address: candidate.address || '',
            position_status: candidate.position_status || 'single'
          });
        } catch (err) {
          console.error('Failed to load candidate:', err);
          setError('فشل في تحميل بيانات المرشح');
        } finally {
          setLoadingData(false);
        }
      };
      fetchCandidate();
    }
  }, [id, isEditMode]);

  // 3. الدوال الأخرى تبقى كما هي
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        birth_date: formData.birth_date ? `${formData.birth_date}T00:00:00Z` : undefined
      };

      if (isEditMode && id) {
        await adminApi.updateCandidate(id, submitData);
      } else {
        await adminApi.createCandidate(submitData);
      }
      navigate('/admin/candidates');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  // 4. عرض حالة التحميل لمنع ظهور حقول فارغة فجأة
  if (loadingData) {
    return (
      <div className="min-h-screen bg-[#f5f1ed] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a677]"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#f5f1ed] p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="absolute top-8 left-8 bg-[#c9a677] hover:bg-[#b89560] text-white p-3 rounded-xl transition-all shadow-lg flex items-center gap-2"
        >
          <Home className="w-6 h-6" />
          لوحة التحكم
        </button>

        <div className="flex gap-12 items-start">
          {/* Form */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2 text-right">
                {isEditMode ? 'تعديل المرشح' : 'إضافة مرشح جديد'}
              </h1>
              <p className="text-gray-600 text-right mb-8">
                {isEditMode ? 'قم بتحديث بيانات المرشح' : 'املأ البيانات التالية لإضافة مرشح جديد'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-right text-gray-700 font-semibold mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#c9a677]" />
                    الاسم الكامل
                  </label>
                  <input
                    name="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-[#c9a677] focus:border-transparent"
                    required
                    placeholder="أدخل الاسم الكامل"
                  />
                </div>

                {/* Position */}
                <div>
                  <label className="block text-right text-gray-700 font-semibold mb-3 flex items-center gap-2">
                    المُنصب
                  </label>
                  <select
                    name="position_name"
                    value={formData.position_name}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-white border border-gray-200 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-[#c9a677] focus:border-transparent"
                    required
                  >
                    <option value="">اختر المنصب</option>
                    {positionOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Qualifications */}
                <div>
                  <label className="block text-right text-gray-700 font-semibold mb-3 flex items-center gap-2">
                    المؤهلات
                  </label>
                  <textarea
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-[#c9a677] focus:border-transparent resize-vertical"
                    placeholder="أدخل المؤهلات والخبرات..."
                  />
                </div>

                {/* Mobile */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-right text-gray-700 font-semibold mb-3 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-[#c9a677]" />
                      رقم الجوال
                    </label>
                    <input
                      name="mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-[#c9a677]"
                      placeholder="05xxxxxxxx"
                    />
                  </div>

                  <div>
                    <label className="block text-right text-gray-700 font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#c9a677]" />
                      تاريخ الميلاد
                    </label>
                    <input
                      name="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-[#c9a677]"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-right text-gray-700 font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#c9a677]" />
                    العنوان
                  </label>
                  <input
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-[#c9a677]"
                    placeholder="العنوان الكامل"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-right text-gray-700 font-semibold mb-3 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-[#c9a677]" />
                    صورة المرشح
                  </label>
                  <input
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-[#c9a677] file:mr-6 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#c9a677] file:text-white hover:file:bg-[#b89560] cursor-pointer"
                  />
                  {formData.image && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-green-800 text-sm">✅ تم اختيار الصورة</span>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-right">{error}</p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-6 pt-6">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/candidates')}
                    className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 px-8 rounded-2xl border-2 border-[#c9a677] transition-all shadow-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.full_name || !formData.position_name}
                    className="flex-1 bg-gradient-to-r from-[#d7b08e] to-[#c9a677] hover:from-[#c9a677] hover:to-[#b89560] text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'جاري الحفظ...' : (isEditMode ? 'تحديث المرشح' : 'إنشاء المرشح')}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Preview */}
          <div className="w-80 flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-xl border">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">معاينة المرشح</h3>
              <div className="text-center mb-6">
                {formData.image ? (
                  <img 
                    src={formData.image} 
                    alt={formData.full_name}
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-[#d7b08e] shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto flex items-center justify-center border-4 border-dashed border-gray-300">
                    <span className="text-3xl">👤</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <p className="font-bold text-lg text-gray-900">{formData.full_name || 'الاسم الكامل'}</p>
                <p className="text-blue-600 font-semibold">{formData.position_name}</p>
                <p className="text-sm text-gray-600">{formData.qualifications?.slice(0, 50) || 'المؤهلات...'}</p>
                <p className="text-sm text-gray-500">{formData.mobile || 'رقم الجوال'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
