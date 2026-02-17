import { AlertTriangle } from 'lucide-react';

interface AgeWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AgeWarningModal({ isOpen, onClose }: AgeWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#f5f1ed] rounded-lg shadow-2xl max-w-2xl w-full p-8 relative">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <AlertTriangle className="w-32 h-32 text-[#c9a677] opacity-20" strokeWidth={1.5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                <div className="text-white text-6xl font-bold">!</div>
              </div>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-gray-900">تنبيه هام!</h2>

          <p className="text-2xl text-gray-700 leading-relaxed max-w-xl">
            يرجى الإنتباه. لا يمكن إضافة المستخدم إذا كان عمره أقل من 18 عامًا، ولا يُسمح للمشرف بإكمال عملية الإضافة.
          </p>

          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-2xl px-16 py-4 rounded-lg transition-colors shadow-lg w-full max-w-sm"
          >
            رجوع
          </button>
        </div>
      </div>
    </div>
  );
}
