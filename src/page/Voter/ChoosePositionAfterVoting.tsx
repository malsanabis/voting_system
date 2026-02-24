import { JSX, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/button";
import { Card, CardContent } from "../../components/card";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useCandidatesByPosition } from "../../hooks/useCandidates";
import { useVoting } from "../../hooks/useVoting";
import { VotingContext } from "../../App"; 
import React from "react";

export const ChoosePositionAfterVoting = (): JSX.Element => {
  const { position } = useParams<{ position: string }>();
  const navigate = useNavigate();
  const voterId = localStorage.getItem('voter_id') || '';
  const decodedPosition = decodeURIComponent(position || '');

  // ✅ جلب مرشحي المنصب من Backend
  const { candidates, loading, error } = useCandidatesByPosition(decodeURIComponent(position || ''));
  
  // ✅ Voting hook
  const { selectedCandidate, isSubmitting, selectCandidate } = useVoting(voterId, decodeURIComponent(position || ''));
  const { setVotes, setCompletedPositions } = React.useContext(VotingContext);

  //for not choicing any candidate
  const NONE_SELECTION_ID = "none_of_the_above";
  const [isNoneModalOpen, setIsNoneModalOpen] = useState(false);

    //The Execution Function (Standalone)
  const finalizeVote = () => {
    let chosen;
    
    if (selectedCandidate === NONE_SELECTION_ID) {
      chosen = { 
        _id: NONE_SELECTION_ID, 
        full_Name: "ممتنع (لا أحد)", 
        image: "/none-icon.png" 
      };
    } else {
      chosen = candidates.find(c => c._id === selectedCandidate);
    }

    if (chosen) {
      // Save to Context
      setVotes(prev => ({ ...prev, [decodedPosition]: chosen }));
      
      // Mark Position as Green/Complete
      setCompletedPositions(prev => {
        const next = new Set(prev);
        next.add(decodedPosition);
        return next;
      });
    }
    
    // Navigate back to the list
    navigate("/voter/positions");
  };

  const handleConfirmVote = async () => {
  if (selectedCandidate === NONE_SELECTION_ID) {
    setIsNoneModalOpen(true); // Trigger Warning
  } else if (selectedCandidate) {
    finalizeVote(); // Proceed Normally
  }
};

  //   const handleConfirmVote = async () => {
      
  //  let chosen;
  //   const isAbstaining = selectedCandidate === NONE_SELECTION_ID;

  //   // ✅ ADD WARNING: Only triggers if "None" is selected
  //   if (isAbstaining) {
  //       const confirmed = window.confirm(
  //           "تنبيه: لقد اخترت 'لا أحد'. هل أنت متأكد من أنك لا تريد التصويت لأي مرشح لهذا المنصب؟"
  //       );
  //       if (!confirmed) return; // Stop if they click 'Cancel'
  //   }
  //   //for not chossing any candidate
  //   if (isAbstaining) {
  //       chosen = { 
  //           _id: NONE_SELECTION_ID, 
  //           full_Name: "ممتنع (لا أحد)", 
  //           image: "/none-icon.png" 
  //       };
  //   } else {
  //       chosen = candidates.find(c => c._id === selectedCandidate);
  //   }

  //     // ✅ UPDATE CONTEXT (6 lines)
  //     if (chosen) {
  //       setVotes(prev => ({ ...prev, [decodedPosition]: chosen }));
  //       setCompletedPositions(prev => {
  //         const next = new Set(prev);
  //         next.add(decodedPosition);
  //         return next;
  //       });
  //     }
  //     navigate("/voter/positions");
  // };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>;
  }

  // Inside the error check:
if (error || !candidates.length) {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-red-500 font-bold text-xl">
        لا يوجد مرشحين لهذا المنصب أو حدث خطأ
      </p>
      Change this path to match your working "Back" button
      <Button   onClick={() => navigate("/voter/positions")}>
        عودة للقائمة
      </Button>
    </div>
  );
}


  return (
    <div className="relative w-full min-h-screen bg-white overflow-hidden">
      <img className="absolute inset-0 w-full h-full object-cover" alt="Background" src="/Gemini_image.png" />
          {/* <img className="w-16 h-16 mx-auto mb-8" alt="Logo" src="/logo.png" /> */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen py-12 px-4">
        <div className="w-full max-w-5xl">
          <button
            onClick={() => navigate("/voter/positions")}
            className="flex items-center gap-2 text-[#d7b08e] mb-8 hover:text-[#c9a07e] transition-colors [direction:rtl]"
          >
            <ArrowRight className="w-6 h-6" />
            <span className="[font-family:'Public_Sans',Helvetica] font-semibold text-lg">
              عودة للقائمة
            </span>
          </button>

          <h1 className="[font-family:'Public_Sans',Helvetica] font-bold text-[#1a1a1a] text-5xl text-center [direction:rtl] mb-3">
            التصويت لمنصب
          </h1>

          <p className="[font-family:'Public_Sans',Helvetica] font-bold text-[#d7b08e] text-3xl text-center [direction:rtl] mb-12">
            {position}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-7 mb-10 items-stretch">
          {candidates.map((candidate) => {
  const isSelected = selectedCandidate === candidate._id;
      return (
        <button
          key={candidate._id}
          onClick={() => selectCandidate(candidate._id)}
          className="relative group transition-all duration-300 focus:outline-none"
        >
          <Card className={`w-full rounded-[2rem] border-2 transition-all duration-300 overflow-hidden ${
            isSelected
              ? "border-[#d7b08e] bg-[#fffcf7] ring-8 ring-[#d7b08e]/10 scale-[1.03]"
              : "border-[#e0e0e0] bg-white hover:border-[#d7b08e] hover:shadow-2xl"
          }`}>
            {/* Increased vertical padding (py-16) */}
            <CardContent className="flex flex-col items-center py-16 px-13">
              
              {/* Increased Image Size from w-24 to w-56 */}
              <div className={`relative w-56 h-56 mb-8 rounded-full p-1.5 transition-all shadow-md ${
                isSelected ? "bg-[#d7b08e]" : "bg-gray-100 group-hover:bg-[#f0e6da]"
              }`}>
                <img 
                  src={candidate.image} 
                  alt={candidate.full_Name}
                  className="w-full h-full rounded-full object-cover border-4 border-white" 
                />
                {isSelected && (
                  <div className="absolute bottom-2 right-2 bg-[#d7b08e] text-white rounded-full p-2 border-4 border-white shadow-lg">
                    <CheckCircle2 size={32} /> {/* Bigger Check Icon */}
                  </div>
                )}
              </div>

              {/* Bigger Font Size (text-4xl) */}
              <h3 className="[font-family:'Public_Sans',Helvetica] font-bold text-[#1a1a1a] text-4xl text-center [direction:rtl] mb-2">
                {candidate.full_Name}
              </h3>
            </CardContent>
          </Card>
        </button>
              );
            })}
                  {/* ✅ The "None of the Above" Card */}
          <button
              onClick={() => selectCandidate(NONE_SELECTION_ID)}
              className="relative group transition-all duration-300 focus:outline-none"
          >
              <Card className={`w-full rounded-[2rem] border-2 transition-all duration-300 overflow-hidden ${
    selectedCandidate === NONE_SELECTION_ID
        ? "border-red-400 bg-red-50 ring-8 ring-red-400/10 scale-[1.03]"
        : "border-dashed border-gray-300 bg-gray-50 hover:border-red-300 hover:bg-white"
}`}>
    <CardContent className="flex flex-col items-center py-9 px-10">
        {/* Increased Size to w-56 */}
        <div className={`relative w-56 h-56 mb-8 rounded-full flex items-center justify-center border-4 transition-all ${
            selectedCandidate === NONE_SELECTION_ID 
                ? "bg-red-500 border-white text-white shadow-lg" 
                : "bg-gray-200 border-gray-300 text-gray-400"
        }`}>
            <span className="text-7xl font-bold">X</span>
        </div>

        <h3 className="font-bold text-[#1a1a1a] text-4xl text-center [direction:rtl] mb-2">
            ممتنع / لا أحد
        </h3>
        <p className="text-gray-500 text-xl">عدم اختيار أي من المرشحين</p>
    </CardContent>
</Card>
          </button>
          </div>

            {/* ✅ Dynamic Warning Message */}
            {selectedCandidate === NONE_SELECTION_ID && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-bounce">
                    <p className="text-red-600 font-bold text-center [direction:rtl]">
                        ⚠️ انتبه: اختيار "لا أحد" يعني أنك لن تعطي صوتك لأي مرشح في هذا المنصب.
                    </p>
                </div>
            )}
          <div className="flex justify-center gap-6">
            <Button
              onClick={() => navigate("/voter/positions")}
              className="h-16 px-12 rounded-xl font-bold text-xl [direction:rtl] bg-white border-2 border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 shadow-sm"
            >
              إلغاء
            </Button>

            <Button
              onClick={handleConfirmVote}
              disabled={!selectedCandidate || isSubmitting}
              className={`h-16 px-16 rounded-xl font-bold text-xl [direction:rtl] transition-all shadow-lg ${
                selectedCandidate && !isSubmitting
                  ? "bg-[#d7b08e] hover:bg-[#c9a07e] text-white transform hover:-translate-y-1"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? 'جاري الحفظ...' : 'تأكيد واختيار'}
            </Button>
          </div>

          <footer className="mt-16 [font-family:'Cairo',Helvetica] font-normal text-slate-400 text-sm text-center [direction:rtl]">
            نظام التصويت الإلكتروني. جميع الحقوق محفوظة.
          </footer>
          
          {isNoneModalOpen && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    {/* Backdrop */}
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsNoneModalOpen(false)} />
    
    {/* Modal Content */}
    <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
      <div className="text-center">
        <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">⚠️</span>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4 [direction:rtl]">
          تنبيه: لقد اخترت 'لا أحد'.
        </h2>
        
        <p className="text-lg text-gray-600 mb-8 [direction:rtl]">
          هل أنت متأكد من أنك لا تريد التصويت لأي مرشح لهذا المنصب؟".
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              setIsNoneModalOpen(false);
              finalizeVote(); // ✅ Now this works!
            }}
            className="w-full py-4 bg-[#d7b08e] hover:bg-[#c9a07e] text-white rounded-xl font-bold text-lg transition-colors"
          >
            نعم، لا أريد اختيار مرشح
          </button>
          
          <button
            onClick={() => setIsNoneModalOpen(false)}
            className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-lg transition-colors"
          >
            إلغاء والرجوع للمرشحين
          </button>
        </div>
      </div>
    </div>
  </div>
)}
          
        </div>
      </div>
    </div>
  );
};
