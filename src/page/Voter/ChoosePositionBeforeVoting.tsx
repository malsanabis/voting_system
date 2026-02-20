import { JSX, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/button";
import { Card, CardContent } from "../../components/card";
import { Check, Trophy, FileText, Users, Building2, Users2 } from "lucide-react";
import { useActivePositions } from "../../hooks/useCandidates";
import { votesAPI } from "../../services/voter.api";  
import { VotingContext } from "../../App";
import React from "react";


interface PositionCardData {
  id: string;
  nameAr: string;           // Position display name
  position_name: string;    // Backend lookup key
  icon: React.ReactNode;
}

// Default icons mapping
const positionIcons: Record<string, React.ReactNode> = {
  "رئيس مجلس الإدارة": <Trophy className="w-12 h-12 text-[#d7b08e]" />,
  "نائب رئيس مجلس الإدارة": <Trophy className="w-12 h-12 text-[#d7b08e]" />,
  "أمين السر": <FileText className="w-12 h-12 text-[#d7b08e]" />,
  "الأمين المالي": <Building2 className="w-12 h-12 text-[#d7b08e]" />,
  "نائب الرئيس": <Users className="w-12 h-12 text-[#d7b08e]" />,
  "منسق اللجان الفاعلة": <Users2 className="w-12 h-12 text-[#d7b08e]" />,
  "منسق اللجان الداعمة": <Users2 className="w-12 h-12 text-[#d7b08e]" />,
};

const PositionCard = ({ 
  position, 
  isCompleted, 
  selectedCandidate, 
  onClick 
}: { 
  position: PositionCardData; 
  isCompleted: boolean; 
  selectedCandidate?: any;
  // {
  //   // image: string;
  //   // full_Name: string;
  // };
  onClick: () => void;
}) => {

  // Define the ID used for "None of the above"
  const NONE_SELECTION_ID = "none_of_the_above"; 
  const isNoneSelected = selectedCandidate?._id === NONE_SELECTION_ID;

  return (
    <button onClick={onClick} className="relative text-left transition-all hover:shadow-lg w-full h-full">
      <Card className={`w-full h-full rounded-2xl border-2 transition-all ${
        isCompleted
          ? isNoneSelected ? "border-red-200 bg-red-50" : "border-green-400 bg-green-50"
          : "border-[#e0e0e0] bg-[#fef9ee] hover:border-[#d7b08e]"
      }`}>
        <CardContent className="flex flex-col items-center py-8 px-6">
          <div className="relative flex items-center justify-center w-36 h-36 mb-6">
            {isCompleted && selectedCandidate ? (
             <div className="relative w-full h-full flex items-center justify-center">
                {isNoneSelected ? (
                  /* ✅ Show Red X if "None" was selected */
                  <div className="w-30 h-30 rounded-full bg-red-500 flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-white text-9xl font-bold leading-none">×</span>
                  </div>
                ) : (
                <img 
                  src={selectedCandidate.image} 
                  alt={selectedCandidate.full_Name}
                  className="h-30 rounded-full object-cover border-4 border-green-500 shadow-sm"
                />
                )}
              {/* Status Checkmark Badge */}
                <div className={`absolute -bottom-2 right-2 rounded-full p-2 border-2 border-white shadow-sm ${
                  isNoneSelected ? "bg-red-600" : "bg-green-500"
                }`}>
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
            ) : (
              /* Default Icon */
              <div className="opacity-80 scale-125">
                {position.icon}
              </div>
            )}
          </div>

          <h3 className="[font-family:'Public_Sans',Helvetica] font-bold text-[#1a1a1a] text-2xl text-center [direction:rtl] mb-2">
            {position.nameAr}
          </h3>

        <p className="[font-family:'Public_Sans',Helvetica] font-normal text-[#666666] text-base text-center [direction:rtl]">
            {isCompleted && selectedCandidate 
              ? isNoneSelected 
                ? "تم اختيار: ممتنع / لا أحد" 
                : `تم اختيار: ${selectedCandidate.full_Name}` 
              : "انقر لعرض المرشحين"}
          </p>

          {/* {isCompleted && (
            <span className="text-xs font-semibold text-green-600 mt-3 bg-green-100 px-3 py-1 rounded-full">
              تم اختيار ✓
            </span>
          )} */}
        </CardContent>
      </Card>
    </button>
  );
};

export const ChoosePositionBeforeVoting = (): JSX.Element => {
  const navigate = useNavigate();
  // const [isSubmitting, setIsSubmitting] = useState(false);
 const { votes, completedPositions, setVotes, setCompletedPositions } = React.useContext(VotingContext);

  // ✅ جلب المناصب النشطة (position_status="multiple") من Backend
  const { positions, loading, error } = useActivePositions();
  const voterId = localStorage.getItem('voter_id') || '';
  const isAllCompleted = positions.every(p => completedPositions.has(p.position_name));

  const handlePositionClick = (positionName: string) => {
    navigate(`/voter/vote/${encodeURIComponent(positionName)}`);
  };

  const handleSubmitAllVotes = async () => {
  if (isAllCompleted && voterId) {

    const voteData = {
      VoterId: voterId,
      choices: Object.entries(votes).map(([positionName, candidate]: [string, any]) => ({
        positionName,
        candidateId: candidate._id  // Backend expects candidate._id
      }))
    };

    try {
      await votesAPI.submit(voteData);  // SINGLE backend call with ALL votes
      setVotes({});  // Reset context
      setCompletedPositions(new Set());
      navigate("/voter/success");
    }catch (error: any) {
    // ✅ FIXED: Proper error display
    const errorMsg = error instanceof Error 
      ? error.message 
      : JSON.stringify(error, null, 2);
    
    console.error('❌ Submit failed:', error);
    alert('خطأ في إرسال الأصوات: ' + errorMsg);
  }
  }
};


  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>إعادة المحاولة</Button>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-white overflow-hidden">
      <img className="absolute inset-0 w-full h-full object-cover" alt="Background" src="/Gemini_image.png" />
      
      <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen py-12 px-4">
        <div className="w-full max-w-6xl">
          <img className="w-16 h-16 mx-auto mb-8" alt="Logo" src="/aabc6cd6-eb56-450f-81eb-416495f3aea8-1.png" />
          
          <h1 className="[font-family:'Public_Sans',Helvetica] font-bold text-[#1a1a1a] text-5xl text-center [direction:rtl] mb-3">
            اختر المنصب
          </h1>
          
          <p className="[font-family:'Public_Sans',Helvetica] font-normal text-[#666666] text-2xl text-center [direction:rtl] mb-12">
            اختر منصب من الوزارة التنظيمية آدابا لتعرض المرشحين والتصويت.
          </p>

          {/* ✅ عرض المناصب النشطة فقط */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
            {positions.map((position) => (
              <PositionCard
                key={position.id}
                position={{
                  id: position.id,
                  nameAr: position.position_name,           // ✅ Display name
                  position_name: position.position_name, 
                  icon: positionIcons[position.position_name] || <Users2 className="w-12 h-12 text-[#d7b08e]" />
                }}
                isCompleted={completedPositions.has(position.position_name)}
                selectedCandidate={votes[position.position_name]}
                onClick={() => handlePositionClick(position.position_name)}
              />
            ))}
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleSubmitAllVotes}
              disabled={!isAllCompleted}
              className={`h-16 px-12 rounded-xl [font-family:'Public_Sans',Helvetica] font-bold text-2xl [direction:rtl] transition-all ${
                isAllCompleted
                  ? "bg-[#d7b08e] hover:bg-[#c9a07e] text-[#fef9ee]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              تأكيد التصويت
            </Button>
          </div>

          <footer className="mt-12 [font-family:'Cairo',Helvetica] font-normal text-slate-500 text-sm text-center [direction:rtl]">
            نظام التصويت الإلكتروني. جميع الحقوق محفوظة.
          </footer>
        </div>
      </div>
    </div>
  );
};
