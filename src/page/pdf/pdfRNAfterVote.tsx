import React from "react";

export interface CandidateWithVotes {
  id: string;
  name: string;
  position_name: string;
  position_status: string;
  votes: number;
}

export interface Results {
  total_users: number;
  total_votes_all: number;
}

interface ElectionReportProps {
  results: Results;
}

const ElectionReport2: React.FC<ElectionReportProps> = ({ results }) => {
  const dateStr = new Date().toLocaleDateString("ar-BH");

  const validVotes = results?.total_votes_all ?? 0;
  const totalUsers = results?.total_users ?? 0;

  // Trigger browser print dialog
  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="report-wrapper">
      {/* ✅ Floating Action Button (Hidden on Print) */}
      <button className="download-button" onClick={handleDownloadPDF}>
        📥 تحميل التقرير (PDF)
      </button>

        <div className="page-container">
        <img src="/A4.png" className="background-img" alt="Background" />

        <div className="content">
          <h1 className="title">
            تقرير حول نهاية الفترة الانتخابية الأولى
            <br></br>من ٣:١٥م إلى ٥:١٥م
          </h1>

          <h2 className="subtitle">مأتم السنابس للدورة 1447-1450هـ</h2>

          <div className="topRight">{dateStr}</div>

          <div className="greeting">السلام عليكم ورحمة الله وبركاته</div>

          <p className="paragraph">تفيد لجنة الانتخابات، أنه في نهاية الفترة الأولى، تم غلق عملية التصويت، حيث بلغ عدد المقترعين.</p>

          <div className="voteSummary">
            {totalUsers} ناخب، منها {validVotes} صوت مكتمل
          </div>


           <div className="footer-signature">
            <br></br>
            <p>اسم و توقيع اللجنة المشرفة</p>
            <br></br>
             <p>-----------------------------</p>
          </div>
        </div>
        
      </div>

      <style>{`
        /* ✅ PRINT SETTINGS */
        @media print {
          .download-button { display: none !important; } /* Hide button on PDF */
          @page { size: A4; margin: 0; }
          body { -webkit-print-color-adjust: exact !important; margin: 0; }
          .page-container { box-shadow: none !important; margin: 0 !important; }
        }

        /* ✅ BUTTON STYLING */
        .download-button {
          position: fixed;
          bottom: 30px;
          right: 30px;
          padding: 12px 24px;
          background-color: #2c3e50;
          color: white;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          font-family: sans-serif;
          font-weight: bold;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          z-index: 9999;
          transition: transform 0.2s;
        }
        .download-button:hover { transform: scale(1.05); background-color: #34495e; }

        /* ✅ PAGE ADJUSTMENTS */
        .report-wrapper {
          background-color: #f0f0f0;
          padding: 40px 0;
          min-height: 100vh;
        }

        .page-container {
          position: relative;
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          font-family: "Amiri", serif;
          direction: rtl;
          background-color: white;
          overflow: hidden;
          box-shadow: 0 0 20px rgba(0,0,0,0.2);
        }

        .background-img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: fill; /* fill ensures it covers A4 edges exactly */
          z-index: 0;
        }

        .content {
          position: relative;
          z-index: 10;
          /* ✅ MOVED TEXT DOWN: Increased from 45mm to 65mm */
          padding: 65mm 20mm 20mm 20mm; 
        }

        .title { text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 5px; }
        .subtitle { text-align: center; font-size: 18px; margin-bottom: 30px; }

        .topRight {
          position: absolute;
          /* ✅ MOVED DATE DOWN: From 35mm to 55mm */
          top: 55mm; 
          right: 25mm;
          font-size: 14px;
          font-weight: bold;
        }

        .greeting { margin-top: 20px; font-weight: bold; font-size: 16px; }
        .paragraph { margin-top: 10px; line-height: 2; font-size: 15px; text-align: justify; }

        .voteSummary {
          margin-top: 20px;
          font-weight: bold;
          text-align: center;
          background: rgba(255,255,255,0.8);
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
        }

        .resultsTable {
          width: 100%;
          border-collapse: collapse;
          margin-top: 25px;
          font-size: 15px;
        }

        .resultsTable th, .resultsTable td {
          border: 1px solid #000;
          padding: 8px;
          text-align: center;
        }
        .resultsTable th { background-color: #f2f2f2; }
      `}</style>
    </div>
  );
};

export default ElectionReport2;