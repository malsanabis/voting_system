import { JSX, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/button";
import { Card, CardContent } from "../../components/card";
import { Input } from "../../components/input";
import { authApi } from "../../services/voter.api"

export const EnterTheIdNumber = (): JSX.Element => {
  const [idNumber, setIdNumber] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!idNumber.trim()) {
      setError("يرجى إدخال رقم الهوية");
      return;
    }

    if (!/^\d{9}$/.test(idNumber)) {
      setError("رقم الهوية يجب أن يكون 9 أرقام");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await authApi.loginVoter(idNumber);
      navigate("/voter/positions");
    } catch (err) {
      setError("حدث خطأ. يرجى المحاولة مرة أخرى");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-white overflow-hidden flex items-center justify-center">
      <img
        className="absolute inset-0 w-full h-full object-cover"
        alt="Gemini generated"
        src="/Gemini_image.png"
      />

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-[600px] px-4">
        <div className="flex flex-col items-center w-full">
          <img
            className="w-[406px] h-[310px] object-cover mb-[-120px]"
            alt="Aabccd eb f"
              src="/Gemini_image.png"
          />

          <h1 className="[font-family:'Public_Sans',Helvetica] font-bold text-[#1a1a1a] text-5xl text-center tracking-[-1.20px] leading-[53px] [direction:rtl] mb-8">
            نظام التصويت الالكتروني
          </h1>

          <Card className="w-full bg-[#fef9ee] rounded-2xl border border-solid border-[#e0e0e0] shadow-[0px_4px_6px_-4px_#0000001a,0px_10px_15px_-3px_#0000001a]">
            <CardContent className="flex flex-col items-center px-[41px] pt-14 pb-12">
              <h2 className="[font-family:'Public_Sans',Helvetica] font-bold text-[#1a1a1a] text-5xl tracking-[0] leading-[48px] text-center whitespace-nowrap [direction:rtl] mb-9">
                ادخل رقم الهوية
              </h2>

              <p className="[font-family:'Public_Sans',Helvetica] font-normal text-[#666666] text-3xl tracking-[0] leading-9 text-center whitespace-nowrap [direction:rtl] mb-16">
                للتحقق من أهليتك للتصويت
              </p>

              <Input
                type="text"
                inputMode="numeric"
                maxLength={9}
                value={idNumber}
                onChange={(e) => {
                  setIdNumber(e.target.value);
                  if (error) setError("");
                }}
                onKeyPress={handleKeyPress}
                placeholder="ادخل رقم الهوية المكون من 9 ارقام"
                className="w-full h-[70px] bg-neutral-100 rounded-xl border border-solid border-[#e0e0e0] [font-family:'Public_Sans',Helvetica] font-medium text-[#666666] text-3xl tracking-[1.50px] text-center [direction:rtl] mb-[42px]"
              />

              {error && (
                <p className="text-red-500 text-xl font-medium text-center [direction:rtl] mb-6">
                  {error}
                </p>
              )}

              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full h-20 bg-[#d7b08e] hover:bg-[#c9a07e] disabled:opacity-50 rounded-xl [font-family:'Public_Sans',Helvetica] font-bold text-[#fef9ee] text-3xl tracking-[0.75px] leading-[45px] [direction:rtl]"
              >
                {isLoading ? "جاري التحقق..." : "إرسال"}
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
