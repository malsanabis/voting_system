import React from "react";
import "./index.css";

export default function Main() {
  return (
    <div className="main-container">
      <div className="user-adder">
        <div className="background" />
        <div className="logo" />
        <div className="frame">
          <div className="paragraph">
            <span className="add-user">اضف مستخدم جدديد</span>
            <span className="enter-info">
              ادخل معلومات المنتخب ثم اضغط على زر الإضافة أو الإنشاء.
            </span>
          </div>
          <div className="input-fields">
            <div className="text-name">
              <span className="full-name">الأسم الكامل:</span>
            </div>
            <div className="full-name-1" />
            <div className="text-age">
              <span className="age">العمر:</span>
            </div>
            <div className="age-2" />
            <div className="text-id">
              <span className="id-number">رقم الهوية:</span>
            </div>
            <div className="id-number-3" />
          </div>
          <div className="btns">
            <div className="depth-frame">
              <div className="depth-frame-4">
                <span className="add-btn">اضافة</span>
              </div>
            </div>
            <div className="depth-frame-5">
              <div className="depth-frame-6">
                <span className="back-btn">رجوع</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="user-confirm">
        <div className="background-7" />
        <div className="logo-8" />
        <div className="frame-9">
          <div className="paragraph-a">
            <span className="add-candidate">اضف من لديه قابليه في الترشيح</span>
            <span className="enter-info-b">
              ادخل معلومات المنتخب ثم اضغط على زر الإضافة أو الإنشاء.
            </span>
          </div>
          <div className="input-fields-c">
            <div className="text-name-d">
              <span className="full-name-e">الأسم الكامل:</span>
            </div>
            <div className="full-name-f" />
            <div className="text-age-10">
              <span className="age-11">العمر:</span>
            </div>
            <div className="age-12" />
            <div className="text-id-number">
              <span className="id-number-13">رقم الهوية:</span>
            </div>
            <div className="id-number-14" />
          </div>
          <div className="btns-15">
            <div className="depth-frame-16">
              <div className="depth-frame-17">
                <span className="voting-eligibility">قابيلة التصويت</span>
              </div>
            </div>
            <div className="depth-frame-18">
              <div className="depth-frame-19">
                <span className="back">رجوع</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="user-access-management">
        <div className="generated-image" />
        <div className="eb-f-eb" />
        <div className="container">
          <div className="header">
            <div className="button">
              <div className="container-1a">
                <span className="logout">تسجيل الخروج</span>
              </div>
            </div>
            <div className="svg" />
            <span className="heading-voting">نظام التصويت</span>
          </div>
          <div className="footer">
            <span className="voting-rights">
              {" "}
              نظام التصويت الإلكتروني. جميع الحقوق محفوظة.
            </span>
          </div>
          <div className="main">
            <div className="paragraph-1b">
              <span className="add-candidate-1c">
                إضافه من لديه قابليه في الرشيح
              </span>
              <span className="add-candidate-button">
                أضف مرشحًا واحدًا ثم اضغط على زر إضافة منتخب.
              </span>
            </div>
            <div className="flex-row-bd">
              <div className="button-1d">
                <div className="container-1e">
                  <span className="search">بحث</span>
                </div>
              </div>
              <div className="label">
                <div className="background-1f">
                  <div className="icon" />
                </div>
                <div className="input">
                  <div className="container-20">
                    <span className="search-candidate">
                      ابحث عن مرشح بالاسم او بالرقم الهوية
                    </span>
                  </div>
                  <div className="container-21" />
                </div>
              </div>
            </div>
            <div className="background-22">
              <div className="button-23">
                <div className="icon-24" />
                <div className="container-25">
                  <span className="add-team">إضافه منتخب</span>
                </div>
              </div>
            </div>
          </div>
          <div className="table">
            <div className="header-26">
              <div className="row">
                <span className="cell-id">رقم الهوية</span>
                <span className="cell-name">الاسم الكامل </span>
              </div>
            </div>
            <div className="body">
              <div className="row-27">
                <span className="data-abdullah-alahmad">خالد بن سالم</span>
                <span className="data-id-1">1098765432</span>
              </div>
              <div className="data-fatima-alzahrani">
                <span className="data-id-2">علي محمدف</span>
                <span className="data-mohammed-alghamdi">2109876543</span>
              </div>
              <div className="data-id-3">
                <span className="data-sara-alqhatani">عبدالله بن محمد</span>
                <span className="data-id-4">3210987654</span>
              </div>
              <div className="data-khalid-almutairi">
                <span className="data-id-5"> حسين علي</span>
                <span className="data-noura-alshammari">4321098765</span>
              </div>
              <div className="data-id-6">
                <span className="notification"> يوسف بن إبراهيم</span>
                <span className="warning">5432109876</span>
              </div>
              <div className="important-note">
                <span className="btns-28">أحمد محمد</span>
                <span className="depth-frame-29">6543210987</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="box-f">
        <div className="pic-7" />
        <span className="text-25">تنبيه هام!</span>
        <div className="group-e">
          <span className="text-26">
            يرجى الإنتباه. لا يمكن إضافة المستخدم إذا كان عمره أقل من 18 عامًا،
            ولا يُسمح للمشرف بإكمال عملية الإضافة.
          </span>
        </div>
        <div className="wrapper-10">
          <div className="group-f">
            <div className="depth-frame-2a">
              <span className="return">رجوع</span>
            </div>
          </div>
        </div>
        <div className="background-2b" />
      </div>
      <div className="user-login">
        <div className="background-border-shadow">
          <span className="input-text">
            أدخل اسم المستخدم وكلمة المرور لتسجيل الدخوال إلى هذا الموقع
          </span>
          <div className="input-2c">
            <div className="logo-2d" />
            <div className="container-2e">
              <span className="username-text">اسم المستخدم...</span>
            </div>
          </div>
          <div className="input-2f">
            <div className="container-30">
              <div className="flex-row-da">
                <div className="logo-31" />
                <span className="password-text">كلمة السر...</span>
              </div>
              <span className="invalid-password">كلمة المرور غير صالحة</span>
            </div>
          </div>
          <div className="content">
            <div className="state-layer">
              <div className="icon-32" />
              <span className="send-label">إرسال</span>
            </div>
          </div>
        </div>
        <span className="copyright-text">
          {" "}
          نظام التصويت الإلكتروني. جميع الحقوق محفوظة.
        </span>
        <div className="generated-image-33" />
        <div className="eb-f-eb-34" />
        <div className="title">
          <span className="voting-system">نظام التصويت الالكتروني</span>
          <span className="login-registration">تسجيل دخوال</span>
        </div>
      </div>
    </div>
  );
}
