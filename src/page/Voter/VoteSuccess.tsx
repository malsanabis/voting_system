import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "../../components/button";
import { Card, CardContent } from "../../components/card";
import { CheckCircle2 } from "lucide-react";
import { JSX } from "react";

export const VoteSuccess = (): JSX.Element => {
  const navigate = useNavigate();

  const handleReturnHome = () => {
    // manual logout + navigate
    localStorage.removeItem("auth_token");
    localStorage.removeItem("voter_id");
    localStorage.removeItem("user_role");
    localStorage.removeItem("hasVoted");
    navigate("/");
  };

  // ⏱️ auto-logout after 10 seconds (example)
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("voter_id");
      localStorage.removeItem("user_role");
      localStorage.removeItem("hasVoted");
      navigate("/");
    }, 10000); // 10000 ms = 10 seconds

    return () => clearTimeout(timer); // cleanup if user leaves early
  }, [navigate]);
  return (
    <div className="relative w-full min-h-screen bg-white overflow-hidden flex items-center justify-center">
      <img
        className="absolute inset-0 w-full h-full object-cover"
        alt="Background"
        src="/Gemini_image.png"
      />

      <img
            className="absolute top-4 right-4 w-[220px] h-[220px] object-cover mb-3"
            alt="logo"
              src="/logo.png"
          />

          <img
            className="absolute top-4 left-9 w-[190px] h-[190px] object-cover mb-3"
            alt="logo"
              src="/slocan.png"
          />

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-[600px] px-4">
        <div className="flex flex-col items-center w-full">
          <Card className="w-full bg-[#fef9ee] rounded-2xl border border-solid border-[#e0e0e0] shadow-[0px_4px_6px_-4px_#0000001a,0px_10px_15px_-3px_#0000001a]">
            <CardContent className="flex flex-col items-center px-[41px] pt-14 pb-12">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-8 animate-in">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>

              <h2 className="[font-family:'Public_Sans',Helvetica] font-bold text-[#1a1a1a] text-5xl tracking-[0] leading-[48px] text-center [direction:rtl] mb-6">
                تم التصويت بنجاح
              </h2>

              <p className="[font-family:'Public_Sans',Helvetica] font-normal text-[#666666] text-2xl tracking-[0] leading-9 text-center [direction:rtl] mb-12">
                شكراً لمشاركتكم في العملية الانتخابية. لقد تم تسجيل صوتكم بأمان وسرية.
              </p>

              <Button
                onClick={handleReturnHome}
                className="w-full h-20 bg-[#d7b08e] hover:bg-[#c9a07e] rounded-xl [font-family:'Public_Sans',Helvetica] font-bold text-[#fef9ee] text-3xl tracking-[0.75px] leading-[45px] [direction:rtl]"
              >
                العودة إلى صفحة الرئيسية
              </Button>
            </CardContent>
          </Card>

          <footer className="mt-12 [font-family:'Cairo',Helvetica] font-normal text-slate-500 text-sm tracking-[0] leading-5 text-center whitespace-nowrap [direction:rtl]">
            نظام التصويت الإلكتروني. جميع الحقوق محفوظة.
          </footer>
        </div>
      </div>
    </div>
  );
};
