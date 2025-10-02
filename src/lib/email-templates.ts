
interface SubscriberData {
  studentName: string;
  className: string;
  phoneNumber: string;
}

interface ConfirmationEmailProps {
  itemTitle: string;
  itemType: 'نشاط' | 'رحلة' | 'Activity' | 'Trip';
  subscriber: SubscriberData;
}

export function getSubscriptionConfirmationHtml({
  itemTitle,
  itemType,
  subscriber,
}: ConfirmationEmailProps): string {
  const platformName = "AGS Activity Platform";
  const logoUrl = "https://firebasestorage.googleapis.com/v0/b/studio-3721710978-c50cb.appspot.com/o/assets%2FAGS%20LOGO.png?alt=media&token=8d2e825a-493b-48e0-a7d5-26a114434199";

  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Helvetica Neue', 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          border: 1px solid #eaeaea;
        }
        .header {
          background-color: #004AAD; /* Primary Blue */
          color: #ffffff;
          padding: 20px;
          text-align: center;
        }
        .header img {
          max-width: 120px;
          margin-bottom: 10px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          padding: 30px;
          text-align: right;
        }
        .content h2 {
          color: #004AAD;
          font-size: 20px;
        }
        .content p {
          margin: 0 0 10px;
        }
        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .details-table th, .details-table td {
          border: 1px solid #dddddd;
          padding: 12px;
          text-align: right;
        }
        .details-table th {
          background-color: #f9f9f9;
          font-weight: bold;
          width: 35%;
        }
        .footer {
          background-color: #f4f4f4;
          color: #777;
          padding: 20px;
          text-align: center;
          font-size: 12px;
        }
        .footer p {
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoUrl}" alt="${platformName} Logo">
          <h1>${platformName}</h1>
        </div>
        <div class="content">
          <h2>تأكيد استلام طلب الاشتراك</h2>
          <p>مرحباً ولي الأمر الكريم،</p>
          <p>لقد استلمنا بنجاح طلب اشتراككم في (${itemType}): <strong>${itemTitle}</strong>. سيتم التواصل معكم قريبًا لتأكيد التفاصيل وإتمام الإجراءات اللازمة.</p>
          
          <h3>تفاصيل المشترك:</h3>
          <table class="details-table">
            <tr>
              <th>اسم الطالب</th>
              <td>${subscriber.studentName}</td>
            </tr>
            <tr>
              <th>الفصل</th>
              <td>${subscriber.className}</td>
            </tr>
            <tr>
              <th>رقم الهاتف</th>
              <td style="direction: ltr; text-align: right;">${subscriber.phoneNumber}</td>
            </tr>
          </table>
          
          <p>شكرًا لاهتمامكم وحرصكم على مشاركة أبنائكم في أنشطتنا.</p>
          <br>
          <p>مع خالص تحياتنا،</p>
          <p><strong>فريق الأنشطة في النادي</strong></p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${platformName}. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
