import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Vote } from 'lucide-react';
import AgeWarningModal from './AgeWarrning';
import { voterMgmApi } from '../../services/voterMgm.api';

export default function VoterForm() {
  const navigate = useNavigate();
  const { voterId } = useParams(); 
  const isEditMode = !!voterId;

  const [formData, setFormData] = useState({
    voter_id: '',
    full_name: '',
    mobile: '',
    address: '',
    membership_type:'عضوية ناقصة' as 'عضوية ناقصة' | 'عضوية كاملة',
  });
  const [loading, setLoading] = useState(false);
  const [showAgeWarning, setShowAgeWarning] = useState(false);
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [cprError, setCprError] = useState('');  // ✅ CPR validation error
  const [voterData, setVoterData] = useState<any>(null);
  const [originalData, setOriginalData] = useState<any>(null);
  const [isIdTaken, setIsIdTaken] = useState(false);
  const [checkingId, setCheckingId] = useState(false);

  // Load voter for edit mode
  useEffect(() => {
    if (isEditMode && voterId) {
      loadVoter(voterId);
    } else {
      // ✅ Reset form for create mode
      setFormData({
        voter_id: '',
        full_name: '',
        mobile: '',
        address: '',
        membership_type:'عضوية ناقصة' as 'عضوية ناقصة' | 'عضوية كاملة',
      });
      setCalculatedAge(null);
      setCprError('');
    }
  }, [voterId, isEditMode]);

  // Calculate age + validate CPR
  useEffect(() => {
    if (formData.voter_id && formData.voter_id.length === 9) {
      const result = validateAndCalculateCPR(formData.voter_id);
      setCalculatedAge(result.age);
      setCprError(result.error || '');

      //this will only show for validly calculated ages under 17.5
      if (result.age !== null && result.age < 17.5) {
        setShowAgeWarning(true);
    } else {
      setShowAgeWarning(false);
    }
  } else {
    setCalculatedAge(null);
    setCprError('');
  }
}, [formData.voter_id]);

  //CPR VALIDATION + Age Calculation
const validateAndCalculateCPR = (cpr: string) => {
  try {
    // 1. Basic format check (must be 9 digits)
    if (!/^\d{9}$/.test(cpr)) {
      return { age: null, error: 'رقم الهوية يجب أن يكون 9 أرقام' };
    }

    let yy = parseInt(cpr.slice(0, 2));
    let mm = parseInt(cpr.slice(2, 4));
    let dd = parseInt(cpr.slice(4, 6));

    // --- SYNC WITH BACKEND LOGIC: Handle '00' values ---
    // If month is 00, treat as January (01)
    if (mm === 0) mm = 1;
    // If day is 00, treat as the 1st (01)
    if (dd === 0) dd = 1;

    // 2. Validate range (After '00' fix, months must be 1-12)
    if (mm < 1 || mm > 12) {
      return { age: null, error: 'تنسيق الشهر في رقم الهوية غير صحيح' };
    }

    // 3. Determine Century (Using current year 2026 as reference)
    const currentYearShort = new Date().getFullYear() % 100; // 26
    const year = yy > currentYearShort ? 1900 + yy : 2000 + yy;

    // 4. Create Date Object
    let birthDate = new Date(year, mm - 1, dd);

    // 5. Fallback for invalid dates (like Feb 31st)
    // If JS moves the date to the next month, reset to the 1st of the intended month
    if (birthDate.getMonth() !== mm - 1) {
      birthDate = new Date(year, mm - 1, 1);
    }

    // 6. Calculate Age
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const hasHadBirthday = 
      today.getMonth() > birthDate.getMonth() || 
      (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
    
    if (!hasHadBirthday) {
      age--;
    }

    const diffMs = today.getTime() - birthDate.getTime();
const ageInYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
return { age: parseFloat(ageInYears.toFixed(2)), error: '' };
  } catch (error) {
    return { age: null, error: 'خطأ في معالجة رقم الهوية' };
  }
};

  const loadVoter = async (voterId: string) => {
    try {
      setLoading(true);
      const voter = await voterMgmApi.getVoterById(voterId);
        setVoterData(voter);
        setOriginalData(voter);
        setFormData({
          voter_id: voter.voter_id,
          full_name: voter.full_name || '',
          mobile: voter.mobile || '',
          address: voter.address || '',
          membership_type: voter.membership_type || 'عضوية ناقصة' as 'عضوية ناقصة' | 'عضوية كاملة',
        });
        setCalculatedAge(voter.age || null);
        setCprError('');
    } catch (error) {
      console.error('Error loading voter:', error);
      alert('خطأ في تحميل بيانات الناخب');
      navigate('/voterMgmt/voters');
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ CPR validation before submit
    if (cprError) {
      alert('يرجى تصحيح رقم الهوية أولاً');
      return;
    }

    if (!formData.voter_id || !formData.full_name) {
      alert('الرجاء ملء الحقول المطلوبة');
      return;
    }

    if (calculatedAge !== null && calculatedAge < 17.5) {
      alert('العمر أقل من 17.5 سنة - غير مؤهل للتصويت');
      return;
    }

    setLoading(true);

try {
    if (isEditMode && voterId) {
      // ✅ Construct payload only with changed fields
      const updatePayload: any = {};
      
      if (formData.voter_id !== originalData?.voter_id) updatePayload.voter_id = formData.voter_id;
      if (formData.full_name !== originalData?.full_name) updatePayload.full_name = formData.full_name;
      if (formData.mobile !== originalData?.mobile) updatePayload.mobile = formData.mobile || '';
      if (formData.address !== originalData?.address) updatePayload.address = formData.address || '';
      if (formData.membership_type !== originalData?.membership_type) updatePayload.membership_type = formData.membership_type;

      // ✅ LOGIC: Even if updatePayload is empty {}, we still call the API.
      // The backend will receive an empty object but will still execute:
      // update_data = {"isEligible": True}
      await voterMgmApi.updateVoter(voterId, updatePayload); 
      alert('✅ تم تحديث بيانات الناخب وتفعيل حق التصويت');
    } else {
      // ✅ CREATE MODE
      // Final "Double Check" for existence before creating
      const res = await voterMgmApi.checkVoterExists(formData.voter_id);
      if (res.exists) {
        setIsIdTaken(true);
        alert('❌ هذا الرقم مسجل مسبقاً، لا يمكن إضافة نفس الناخب مرتين');
        setLoading(false);
        return; 
      }

      await voterMgmApi.createVoter({
        voter_id: formData.voter_id,
        full_name: formData.full_name,
        mobile: formData.mobile || '',
        address: formData.address || '',
        age: calculatedAge || 0,
        membership_type: formData.membership_type,
      });
      alert('✅ تم إضافة الناخب الجديد بنجاح');
    }
    navigate('/voterMgmt/voters');
  } catch (error: any) {
    console.error('Submit error:', error);
    alert('❌ خطأ: ' + (error.message || 'حدث خطأ أثناء الحفظ'));
  } finally {
    setLoading(false);
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear CPR error when user types
    if (name === 'voter_id') {
      setCprError('');
    }
  };

  useEffect(() => {
  const timer = setTimeout(async () => {
    // 1. Only check if we have exactly 9 digits
    if (formData.voter_id && formData.voter_id.length === 9) {
      const result = validateAndCalculateCPR(formData.voter_id);
      setCalculatedAge(result.age);
      setCprError(result.error || '');

      // 2. If CPR format is valid and we are in Create Mode, check database
      if (!isEditMode && !result.error) {
        setCheckingId(true);
        try {
          const res = await voterMgmApi.checkVoterExists(formData.voter_id);
          setIsIdTaken(res.exists);
        } catch (err) {
          console.error("Error checking ID existence:", err);
        } finally {
          setCheckingId(false);
        }
      }
      
      if (result.age !== null && result.age < 17.5) {
        setShowAgeWarning(true);
      }
    } else {
      // Reset states if ID is deleted or incomplete
      setCalculatedAge(null);
      setCprError('');
      setIsIdTaken(false);
    }
  }, 500); // 500ms debounce prevents hitting the API on every single keystroke

  return () => clearTimeout(timer);
}, [formData.voter_id, isEditMode]);


  return (
    <div className="min-h-screen bg-[#f5f1ed] py-8 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Vote className="w-10 h-10 text-[#c9a677]" />
            {isEditMode ? 'تعديل الناخب' : 'إضافة ناخب جديد'}
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            {isEditMode ? 'تعديل بيانات الناخب' : 'إضافة ناخب جديد'}
          </h2>
          {/* <p className="text-gray-600 text-center mb-8">
            {isEditMode 
              ? `تعديل بيانات الناخب: ${voterId?.slice(0, 4)}****${voterId?.slice(-2)}`
              : 'أدخل بيانات الناخب الجديد (سيتم تفعيله تلقائياً)'
            }
          </p> */}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CPR - VoterId with REAL-TIME VALIDATION */}
<div>
  <label className="block text-right text-xl font-semibold text-gray-900 mb-3">
    رقم الهوية (CPR) <span className="text-red-500">*</span>
  </label>
  <input
    type="text"
    name="voter_id"
    value={formData.voter_id}
    onChange={handleChange}
    maxLength={9}
    placeholder="YYMMNNNNC (مثال: 950312345)"
    className={`w-full px-6 py-4 rounded-lg text-right text-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
      formData.voter_id.length === 9 
        ? calculatedAge !== null && calculatedAge >= 17.5
          ? 'bg-green-50 border-2 border-green-400 ring-green-400 ring-offset-2' 
          : 'bg-red-50 border-2 border-red-400 ring-red-400 ring-offset-2'
        : 'bg-[#c9a677] bg-opacity-40 focus:ring-[#c9a677]'
    }`}
  />
  
{/* ✅ REAL-TIME VALIDATION RESULTS - FIXED */}
{formData.voter_id.length === 9 && (
  <div className="mt-3 space-y-2">
    {/* Existence Warning */}
    {!isEditMode && isIdTaken && (
      <div className="bg-orange-50 border-2 border-orange-200 p-3 rounded-xl flex items-center gap-2">
        <span className="text-xl">🚫</span>
        <span className="text-orange-700 text-sm font-bold">
          رقم الهوية هذا مسجل مسبقاً في النظام
        </span>
      </div>
    )}

    {/* Age Badge */}
    <div className="text-right">
      <span className={`px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-2 shadow-sm ${
        calculatedAge !== null && calculatedAge >= 17.5 && !isIdTaken
          ? 'bg-green-100 text-green-800 border-2 border-green-200' 
          : 'bg-red-100 text-red-800 border-2 border-red-200'
      }`}>
        {checkingId ? 'جاري فحص قاعدة البيانات...' : `العمر: ${calculatedAge?.toFixed(1)} سنة`}
        {calculatedAge !== null && calculatedAge < 17.5 && (
          <span className="text-xs bg-red-200 px-2 py-1 rounded-full font-bold">غير مؤهل</span>
        )}
      </span>
    </div>
      
      {/* Error Message */}
      {cprError && (
        <div className="bg-red-50 border-2 border-red-200 p-3 rounded-xl">
          <p className="text-red-600 text-sm text-right font-medium flex items-center gap-2">
            <span className="w-5 h-5">⚠️</span>
            {cprError}
          </p>
        </div>
      )}
      
      {/* Success Message
      {!cprError && calculatedAge !== null && calculatedAge >= 17.5 && (
        <div className="bg-green-50 border-2 border-green-200 p-3 rounded-xl flex items-center gap-2">
          <span className="w-5 h-5 text-green-500">✅</span>
          <span className="text-green-700 text-sm font-medium">الناخب مؤهل للتصويت</span>
        </div>
      )} */}
    </div>
  )}
  
  {/* Typing Progress */}
  {formData.voter_id.length > 0 && formData.voter_id.length < 9 && (
    <div className="mt-2 bg-blue-50 border-2 border-blue-200 p-3 rounded-lg">
      <p className="text-blue-700 text-sm font-medium flex items-center gap-2">
        <span className="w-4 h-4">📝</span>
        اكتب {9 - formData.voter_id.length} أرقام متبقية للتحقق التلقائي
      </p>
    </div>
  )}
</div>

            {/* Full Name */}
            <div>
              <label className="block text-right text-xl font-semibold text-gray-900 mb-3">
                الاسم الكامل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 bg-[#c9a677] bg-opacity-40 rounded-lg text-right text-lg focus:outline-none focus:ring-2 focus:ring-[#c9a677] placeholder-gray-600"
              />
            </div>

            {/* Mobile, Address, Membership - unchanged */}
            <div>
              <label className="block text-right text-xl font-semibold text-gray-900 mb-3">
                رقم الجوال
              </label>
              <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} className="w-full px-6 py-4 bg-[#c9a677] bg-opacity-40 rounded-lg text-right text-lg focus:outline-none focus:ring-2 focus:ring-[#c9a677]" placeholder="36xxxxxxxx" />
            </div>

            <div>
              <label className="block text-right text-xl font-semibold text-gray-900 mb-3">
                العنوان
              </label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-6 py-4 bg-[#c9a677] bg-opacity-40 rounded-lg text-right text-lg focus:outline-none focus:ring-2 focus:ring-[#c9a677]" placeholder="المنطقة، الشارع..." />
            </div>

            <div>
              <label className="block text-right text-xl font-semibold text-gray-900 mb-3">
                نوع العضوية
              </label>
              <select name="membership_type" value={formData.membership_type} onChange={handleChange} className="w-full px-6 py-4 bg-[#c9a677] bg-opacity-40 rounded-lg text-right text-lg focus:outline-none focus:ring-2 focus:ring-[#c9a677]">
                <option value="عضوية ناقصة">عضوية ناقصة</option>
                <option value="عضوية كاملة">عضوية كاملة</option>
              </select>
            </div>

            <div className="flex gap-4 pt-6">
              <button type="button" onClick={() => navigate('/voterMgmt/voters')} className="flex-1 bg-white hover:bg-gray-50 text-[#c9a677] border-2 border-[#c9a677] font-bold px-8 py-4 rounded-lg transition-colors text-xl">
                رجوع
              </button>
              <button type="submit" disabled={loading || !!cprError} className="flex-1 bg-[#c9a677] hover:bg-[#b8956a] text-white font-bold px-8 py-4 rounded-lg transition-colors text-xl disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'جاري الحفظ...' : isEditMode ? 'تفعيل حق التصويت / تحديث البيانات' : 'إضافة و تفعيل حق التصويت'}
              </button>
            </div>
          </form>
        </div>

        <footer className="text-center text-gray-600 mt-8">نظام التصويت الإلكتروني، جميع الحقوق محفوظة.</footer>
      </div>

      <AgeWarningModal isOpen={showAgeWarning} onClose={() => setShowAgeWarning(false)} />
    </div>
  );
}
