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
  total_votes: number;
  total_votes_all: number;
  candidates_with_votes: CandidateWithVotes[];
}

interface ElectionReportProps {
  results: Results;
}

const ElectionReport: React.FC<ElectionReportProps> = ({ results }) => {
  const dateStr = new Date().toLocaleDateString("ar-BH");
  const totalUsers = results?.total_users ?? 0;
  const total_votes_all = results?.total_votes_all ?? 0;
  // const candidates = results?.candidates_with_votes ?? [];

  // 1. Define the custom order
  const positionOrder = [
    "رئيس مجلس الإدارة",
    "نائب رئيس مجلس الإدارة",
    "الأمين المالي",
    "أمين السر",
    "مدير المأتم",
    "منسق اللجان الفاعلة",
    "منسق اللجان الداعمة",
  ];

  // 2. Filter and Sort the list
  const candidates = [...(results?.candidates_with_votes ?? [])].sort((a, b) => {
    const indexA = positionOrder.indexOf(a.position_name);
    const indexB = positionOrder.indexOf(b.position_name);

    // First: Sort by position hierarchy
    if (indexA !== indexB) {
      return indexA - indexB;
    }

    // Second: Sort by votes (Highest to Lowest) within the same position
    return b.votes - a.votes;
  });

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
          {/* Header Section */}
          <div className="header-section">
            <h1 className="title">
              النتائج النهائية بحسب التسلسل الهرمي لانتخابات مجلس الإدارة
            </h1>
            <h2 className="subtitle">مأتم السنابس لعام 1447-1450هـ</h2>
            <div className="topRight">{dateStr}</div>
          </div>

          {/* Main Content Section - Fills available space */}
          <div className="main-body">
            <div className="greeting">السلام عليكم ورحمة الله وبركاته</div>

            <p className="paragraph">
              يطيب لنا أن نتقدم لكم بالشكر الجزيل على ثقتكم الكبيرة بتخويلنا
              للإعداد والإشراف على انتخاب مجلس إدارة جديد للمأتم للفترة الإدارية،
              حيث بلغ عدد الناخبين المسجلين لهذه العملية الإنتخابية:
            </p>

            <div className="voteSummary">
              {totalUsers} ناخب، منها {total_votes_all} صوت مكتمل
            </div>

            <table className="resultsTable">
              <thead>
                <tr>
                  <th>م</th>
                  <th>اسم المرشح</th>
                  <th>المنصب</th>
                  <th>طريقة الترشح</th>
                  <th>عدد الأصوات</th>
                </tr>
              </thead>
              <tbody>
                {candidates.length > 0 ? (
                  candidates.map((cand, index) => (
                    <tr key={cand.id || index}>
                      <td>{index + 1}</td>
                      <td>{cand.name || "الاسم غير متوفر"}</td>
                      <td>{cand.position_name}</td>
                      <td>{cand.position_status === "single" ? "تزكية" : "انتخاب"}</td>
                      <td style={{ fontWeight: "bold" }}>{cand.votes}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>لا توجد نتائج لعرضها</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Section - Strictly placed at the bottom */}
          <div className="closing-section">
            <p className="paragraph paragraph-small">
              وبعد الشكر لله تعالى، أن وفقنا للقيام بالمهمة التي كلفتمونا بأدائها، والدور المرتقب منا، فإننا نتمنى أن نكون
              عند حسن ظنكم، فقد بذلنا قصاري جهدنا لإدارة العملية الانتخابية بشكل نزيه وشفاف.
             ونحن اليوم نرفع لكم التقرير النهائي الشامل للعملية الانتخابية، راجين منكم العذر من أي تقصير بدر منا،
              ونسألكم الدعاء.
            </p>

           <div className="signature-block">
            <p>وتفضلوا بقبول خالص الشكر والتقدير</p>
            
            {/* حاوية التوقيعات الموزعة */}
            <div className="signatures-wrapper">
              <div className="sig-right">
                <p>رئيس مجلس الانتخابات</p>
                 <br></br>
                <p>-----------------------------</p>
              </div>
              
              <div className="sig-left">
                <p>عن مجلس الأمناء</p>
                <br></br>
                <p>-----------------------------</p>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      <style>{`
        /* ✅ PRINT SETTINGS */
        @media print {
          @page { size: A4; margin: 0; }
          body { -webkit-print-color-adjust: exact !important; margin: 0; padding: 0; }
          .download-button { display: none !important; }
          .page-container { box-shadow: none !important; margin: 0 !important; }
        }

        /* ✅ BUTTON STYLING */
        .download-button {
          position: fixed; bottom: 30px; right: 30px; padding: 12px 24px;
          background-color: #2c3e50; color: white; border: none; border-radius: 50px;
          cursor: pointer; z-index: 9999;
        }

        /* ✅ PAGE CONSTRAINTS */
        .page-container {
          position: relative; width: 210mm; height: 297mm;
          margin: 20px auto; font-family: "Amiri", serif;
          direction: rtl; background-color: white;
          overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.2);
          box-sizing: border-box;
        }

        .background-img {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          object-fit: fill; z-index: 0;
        }

        /* ✅ FLEXBOX LAYOUT TO PREVENT OVERLAY */
        .content {
          position: relative; z-index: 10;
          height: 297mm; /* 🔥 Strict height */
          box-sizing: border-box;
          /* 🔥 Increased bottom padding to 35mm to protect footer */
          padding: 54mm 20mm 35mm 20mm; 
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

          .signatures-wrapper {
            display: flex;
            justify-content: space-between; /* دفع العناصر للأطراف */
            align-items: flex-start;
            margin-top: 1px;
            width: 100%;
          }
        .sig-right {
          text-align: right; /* محاذاة النص لليمين */
        }
        .sig-left {
        text-align: left; /* محاذاة النص لليسار */
        }

        /* Styling for compact fit */
        .title { text-align: center; font-size: 19px; margin-bottom: 5px; }
        .subtitle { text-align: center; font-size: 16px; margin-bottom: 15px; }
        .topRight { position: absolute; top: 45mm; right: 35mm; font-size: 13px; }
        
        .main-body { flex-grow: 1; } /* Allows table to expand */
        
        .greeting { font-weight: bold; font-size: 14px; margin-bottom: 5px; margin-top: -9px; }
        .paragraph { margin-top: 0; margin-bottom: 5px; line-height: 1.5; font-size: 14px; text-align: justify; }
        .paragraph-small { font-size: 13px; line-height: 1.3; }

        .voteSummary {
          margin-top: 10px; margin-bottom: 10px; font-weight: bold;
          text-align: center; background: rgba(255,255,255,0.8);
          padding: 5px; border: 1px solid #ccc; font-size: 14px;
        }

        .resultsTable {
          width: 100%; border-collapse: collapse; margin-top: 10px;
          font-size: 13px; table-layout: fixed;
        }
        .resultsTable th, .resultsTable td {
          border: 1px solid #000; padding: 4px; text-align: center;
          word-wrap: break-word;
        }
        .resultsTable th { background-color: #f2f2f2; }

        .closing-section {
          flex-shrink: 0; /* 🔥 Prevents text compression */
          margin-top: 10px;
        }
        .signature-block { margin-top: 1px; text-align: center; font-size: 13px; line-height: 1.3; }
      `}</style>
    </div>
  );
};

export default ElectionReport;