import nodemailer from 'nodemailer';
import { createTransport } from 'nodemailer';

const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
};

const transporter = createTransport(emailConfig);

transporter.verify((error, success) => {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('Email server is ready to take messages');
  }
});


export const sendVerificationEmail = async (
  email: string, 
  token: string, 
  firstName: string
): Promise<void> => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  
  const mailOptions = {
    from: {
      name: 'Pazarcık | Alışverişin Model Hali',
      address: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@example.com'
    },
    to: email,
    subject: 'E-posta Adresinizi Doğrulayın',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>E-posta Doğrulama</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="padding: 40px 30px; text-align: center; background-color: #2563eb;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">E-posta Doğrulama</h1>
          </div>
          <div style="padding: 40px 30px;">
            <p style="font-size: 16px; color: #333333; margin: 0 0 20px 0;">
              Merhaba ${firstName},
            </p>
            <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 30px 0;">
              E-Ticaret Mağazamıza hoş geldiniz! Hesabınızı aktifleştirmek için aşağıdaki butona tıklayarak 
              e-posta adresinizi doğrulayın.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="display: inline-block; padding: 15px 30px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                E-posta Adresimi Doğrula
              </a>
            </div>
            <p style="font-size: 14px; color: #666666; line-height: 1.6; margin: 30px 0 0 0;">
              Eğer yukarıdaki buton çalışmıyorsa, aşağıdaki linki kopyalayıp tarayıcınıza yapıştırın:<br>
              <a href="${verificationUrl}" style="color: #2563eb; word-break: break-all;">${verificationUrl}</a>
            </p>
            <p style="font-size: 14px; color: #666666; margin: 30px 0 0 0;">
              Bu link 24 saat içinde geçerliliğini yitirecektir.
            </p>
          </div>
          <div style="padding: 20px 30px; background-color: #f8f9fa; border-top: 1px solid #dee2e6;">
            <p style="font-size: 12px; color: #6c757d; margin: 0; text-align: center;">
              Bu e-postayı size gönderme sebebimiz hesap oluşturma talebinde bulunmanızdır.
              Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};


export const sendPasswordResetEmail = async (
  email: string, 
  token: string, 
  firstName: string
): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  
  const mailOptions = {
    from: {
      name: 'Pazarcık | Alışverişin Model Hali',
      address: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@example.com'
    },
    to: email,
    subject: 'Parola Sıfırlama Talebi',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Parola Sıfırlama</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="padding: 40px 30px; text-align: center; background-color: #2563eb;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Parola Sıfırlama</h1>
          </div>
          <div style="padding: 40px 30px;">
            <p style="font-size: 16px; color: #333333; margin: 0 0 20px 0;">
              Merhaba ${firstName},
            </p>
            <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 30px 0;">
              Hesabınız için parola sıfırlama talebinde bulundunuz. Yeni parola oluşturmak için 
              aşağıdaki butona tıklayın.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; padding: 15px 30px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                Parolayı Sıfırla
              </a>
            </div>
            <p style="font-size: 14px; color: #666666; line-height: 1.6; margin: 30px 0 0 0;">
              Eğer yukarıdaki buton çalışmıyorsa, aşağıdaki linki kopyalayıp tarayıcınıza yapıştırın:<br>
              <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
            </p>
            <p style="font-size: 14px; color: #666666; margin: 30px 0 0 0;">
              Bu link 10 dakika içinde geçerliliğini yitirecektir.
            </p>
            <div style="padding: 20px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; margin: 30px 0 0 0;">
              <p style="font-size: 14px; color: #333333; margin: 0; font-weight: bold;">
                Güvenlik Uyarısı
              </p>
              <p style="font-size: 13px; color: #666666; margin: 10px 0 0 0;">
                Eğer bu parola sıfırlama talebini siz yapmadıysanız, hesabınızın güvenliği için 
                derhal bizimle iletişime geçin.
              </p>
            </div>
          </div>
          <div style="padding: 20px 30px; background-color: #f8f9fa; border-top: 1px solid #dee2e6;">
            <p style="font-size: 12px; color: #6c757d; margin: 0; text-align: center;">
              Bu e-postayı size gönderme sebebimiz parola sıfırlama talebinde bulunmanızdır.
              Eğer bu işlemi siz yapmadıysanız, lütfen hesabınızın güvenliği için bizimle iletişime geçin.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

export const sendNotificationEmail = async (
  email: string,
  subject: string,
  content: string
): Promise<void> => {
  const mailOptions = {
    from: {
      name: 'Pazarcık | Alışverişin Model Hali',
      address: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@example.com'
    },
    to: email,
    subject,
    html: content
  };

  await transporter.sendMail(mailOptions);
};

export const sendOrderConfirmationEmail = async (
  email: string,
  orderDetails: any,
  customerName: string
): Promise<void> => {
  const itemsHtml = orderDetails.items.map((item: any) => `
    <tr style="border-bottom: 1px solid #dee2e6;">
      <td style="padding: 15px 10px; vertical-align: top;">
        <div style="display: flex; align-items: center; gap: 15px;">
          <img src="${item.image || '/images/placeholder.jpg'}" 
               alt="${item.name}" 
               style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
          <div>
            <p style="margin: 0; font-weight: bold; color: #333; font-size: 14px;">${item.name}</p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">SKU: ${item.sku}</p>
          </div>
        </div>
      </td>
      <td style="padding: 15px 10px; text-align: center; vertical-align: top;">
        <p style="margin: 0; color: #333; font-size: 14px;">${item.quantity}</p>
      </td>
      <td style="padding: 15px 10px; text-align: right; vertical-align: top;">
        <p style="margin: 0; color: #333; font-size: 14px; font-weight: bold;">${item.price.toLocaleString('tr-TR')} ₺</p>
      </td>
      <td style="padding: 15px 10px; text-align: right; vertical-align: top;">
        <p style="margin: 0; color: #333; font-size: 14px; font-weight: bold;">${item.total.toLocaleString('tr-TR')} ₺</p>
      </td>
    </tr>
  `).join('');

  const formatAddress = (address: any) => `
    <p style="margin: 0; color: #333; font-size: 14px;">${address.firstName} ${address.lastName}</p>
    <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">${address.address1}</p>
    ${address.address2 ? `<p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">${address.address2}</p>` : ''}
    <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">${address.city}/${address.state} ${address.postalCode}</p>
    <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">${address.country}</p>
    ${address.phone ? `<p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Tel: ${address.phone}</p>` : ''}
  `;

  const mailOptions = {
    from: {
      name: 'Pazarcık | Alışverişin Model Hali',
      address: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@example.com'
    },
    to: email,
    subject: `Siparişiniz Alındı! - #${orderDetails.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sipariş Onayı</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 700px; margin: 0 auto; background-color: #ffffff;">
          <div style="padding: 40px 30px; text-align: center; background-color: #2563eb;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Siparişiniz Alındı!</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">En kısa zamanda kargolanacaktır</p>
          </div>

          <div style="padding: 40px 30px;">
            <p style="font-size: 16px; color: #333333; margin: 0 0 20px 0;">
              Sayın ${customerName},
            </p>
            <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 30px 0;">
              Siparişiniz başarıyla alınmıştır. Siparişiniz en kısa zamanda hazırlanıp kargolanacaktır. 
              Sipariş detaylarınız aşağıdaki gibidir:
            </p>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #333; font-size: 18px;">Sipariş Bilgileri</h3>
                <span style="background-color: #2563eb; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold;">
                  #${orderDetails.orderNumber}
                </span>
              </div>
              <p style="margin: 0; color: #666; font-size: 14px;">
                Sipariş Tarihi: ${new Date(orderDetails.createdAt).toLocaleDateString('tr-TR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div style="margin: 30px 0;">
              <h3 style="margin: 0 0 20px 0; color: #333; font-size: 18px;">Sipariş Edilen Ürünler</h3>
              <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <thead style="background-color: #2563eb; color: white;">
                  <tr>
                    <th style="padding: 15px 10px; text-align: left; font-size: 14px; font-weight: bold;">Ürün</th>
                    <th style="padding: 15px 10px; text-align: center; font-size: 14px; font-weight: bold;">Adet</th>
                    <th style="padding: 15px 10px; text-align: right; font-size: 14px; font-weight: bold;">Birim Fiyat</th>
                    <th style="padding: 15px 10px; text-align: right; font-size: 14px; font-weight: bold;">Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">Fiyat Özeti</h3>
              <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                <span style="color: #666; font-size: 14px;">Ara Toplam:</span>
                <span style="color: #333; font-size: 14px; font-weight: bold;">${orderDetails.pricing.subtotal.toLocaleString('tr-TR')} ₺</span>
              </div>
              ${orderDetails.pricing.discount > 0 ? `
                <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                  <span style="color: #666; font-size: 14px;">İndirim:</span>
                  <span style="color: #dc3545; font-size: 14px; font-weight: bold;">-${orderDetails.pricing.discount.toLocaleString('tr-TR')} ₺</span>
                </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                <span style="color: #666; font-size: 14px;">Kargo:</span>
                <span style="color: #333; font-size: 14px; font-weight: bold;">${orderDetails.pricing.shipping.toLocaleString('tr-TR')} ₺</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                <span style="color: #666; font-size: 14px;">KDV:</span>
                <span style="color: #333; font-size: 14px; font-weight: bold;">${orderDetails.pricing.tax.toLocaleString('tr-TR')} ₺</span>
              </div>
              <hr style="border: none; border-top: 1px solid #dee2e6; margin: 15px 0;">
              <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                <span style="color: #333; font-size: 16px; font-weight: bold;">Genel Toplam:</span>
                <span style="color: #2563eb; font-size: 18px; font-weight: bold;">${orderDetails.pricing.total.toLocaleString('tr-TR')} ₺</span>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0;">
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                <h4 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Teslimat Adresi</h4>
                ${formatAddress(orderDetails.addresses.shipping)}
              </div>
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                <h4 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Fatura Adresi</h4>
                ${formatAddress(orderDetails.addresses.billing)}
              </div>
            </div>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <h4 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">Ödeme Bilgileri</h4>
              <p style="margin: 0; color: #666; font-size: 14px;">
                Ödeme Yöntemi: ${orderDetails.payment.method === 'credit_card' ? 'Kredi Kartı' : 
                               orderDetails.payment.method === 'paypal' ? 'PayPal' : 
                               orderDetails.payment.method === 'bank_transfer' ? 'Banka Havalesi' : 
                               'Kapıda Ödeme'}
              </p>
              <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                Durum: ${orderDetails.payment.status === 'pending' ? 'Beklemede' : 
                       orderDetails.payment.status === 'paid' ? 'Ödendi' : 
                       orderDetails.payment.status === 'failed' ? 'Başarısız' : 'İade Edildi'}
              </p>
            </div>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <h4 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">Sonraki Adımlar</h4>
              <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px;">
                <li>Siparişiniz hazırlandığında size bilgilendirme e-postası gönderilecektir</li>
                <li>Kargo takip numarası e-posta adresinize iletilecektir</li>
                <li>Sorularınız için müşteri hizmetlerimizle iletişime geçebilirsiniz</li>
              </ul>
            </div>

            <p style="font-size: 14px; color: #666666; line-height: 1.6; margin: 30px 0 0 0;">
              Siparişiniz için teşekkür ederiz! En kısa zamanda kargolanacaktır.
            </p>
          </div>

          <div style="padding: 20px 30px; background-color: #f8f9fa; border-top: 1px solid #dee2e6;">
            <p style="font-size: 12px; color: #6c757d; margin: 0; text-align: center;">
              Bu e-posta siparişiniz alındığında otomatik olarak gönderilmiştir. 
              Siparişiniz için teşekkür ederiz!
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
}; 

export const sendNewsletterWelcomeEmail = async (
  email: string
): Promise<void> => {
  const mailOptions = {
    from: {
      name: 'Pazarcık | Alışverişin Model Hali',
      address: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@example.com'
    },
    to: email,
    subject: 'Bülten Aboneliğiniz Başarıyla Tamamlandı!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bülten Aboneliği</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="padding: 40px 30px; text-align: center; background-color: #2563eb;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Bülten Aboneliği</h1>
          </div>
          <div style="padding: 40px 30px;">
            <p style="font-size: 16px; color: #333333; margin: 0 0 20px 0;">
              Merhaba,
            </p>
            <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 30px 0;">
              Pazarcık | Alışverişin Model Hali bültenine başarıyla abone oldunuz! Artık en son ürünler, 
              özel indirimler, kampanyalar ve sektördeki yenilikler hakkında ilk siz haberdar olacaksınız.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Bültenimizde Neler Var?</h3>
              <ul style="color: #666; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Yeni ürün duyuruları ve öncelikli erişim</li>
                <li>Özel indirim kodları ve kampanyalar</li>
                <li>Sezonsal fırsatlar ve flash satışlar</li>
                <li>Müşteri deneyimleri ve ürün incelemeleri</li>
                <li>Teknoloji ve e-ticaret trendleri</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}" 
                 style="display: inline-block; padding: 15px 30px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                Alışverişe Başla
              </a>
            </div>

            <p style="font-size: 14px; color: #666666; line-height: 1.6; margin: 30px 0 0 0;">
              İlk bültenimiz yakında e-posta adresinize ulaşacak. Sabırsızlıkla bekliyoruz!
            </p>
          </div>
          <div style="padding: 20px 30px; background-color: #f8f9fa; border-top: 1px solid #dee2e6;">
            <p style="font-size: 12px; color: #6c757d; margin: 0; text-align: center;">
              Bu e-postayı almak istemiyorsanız, <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #2563eb;">aboneliğinizi iptal edebilirsiniz</a>.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
}; 

export const sendOrderStatusUpdateEmail = async (
  email: string,
  customerName: string,
  orderNumber: string,
  status: string,
  trackingNumber?: string,
  carrier?: string,
  notes?: string
): Promise<void> => {
  const statusConfig = {
    confirmed: {
      title: 'Siparişiniz Onaylandı',
      subtitle: 'Siparişiniz onaylandı ve hazırlanıyor'
    },
    processing: {
      title: 'Siparişiniz Hazırlanıyor',
      subtitle: 'Siparişiniz hazırlanıyor ve kargoya verilmek üzere bekliyor'
    },
    shipped: {
      title: 'Siparişiniz Kargoya Verildi',
      subtitle: 'Siparişiniz kargoya verildi ve yolda'
    },
    delivered: {
      title: 'Siparişiniz Teslim Edildi',
      subtitle: 'Siparişiniz başarıyla teslim edildi'
    },
    cancelled: {
      title: 'Siparişiniz İptal Edildi',
      subtitle: 'Siparişiniz iptal edildi'
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig];
  
  if (!config || status === 'pending') {
    return;
  }

  const trackingInfo = trackingNumber && carrier ? `
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">Kargo Bilgileri</h3>
      <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Kargo Firması:</strong> ${carrier}</p>
      <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Takip Numarası:</strong> ${trackingNumber}</p>
    </div>
  ` : '';

  const notesInfo = notes ? `
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
      <h4 style="color: #333; margin: 0 0 10px 0; font-size: 14px;">Notlar</h4>
      <p style="margin: 0; color: #666; font-size: 14px;">${notes}</p>
    </div>
  ` : '';

  const mailOptions = {
    from: {
      name: 'Pazarcık | Alışverişin Model Hali',
      address: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@example.com'
    },
    to: email,
    subject: `${config.title} - Sipariş #${orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${config.title}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="padding: 40px 30px; text-align: center; background-color: #2563eb;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${config.title}</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">${config.subtitle}</p>
          </div>

          <div style="padding: 40px 30px;">
            <p style="font-size: 16px; color: #333333; margin: 0 0 20px 0;">
              Sayın ${customerName},
            </p>
            <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 30px 0;">
              Siparişinizin durumu güncellendi. Aşağıda sipariş detaylarını bulabilirsiniz.
            </p>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Sipariş Bilgileri</h3>
              <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Sipariş Numarası:</strong> #${orderNumber}</p>
              <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Durum:</strong> ${config.title}</p>
              <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Güncelleme Tarihi:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
            </div>

            ${trackingInfo}
            ${notesInfo}

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/my-account" 
                 style="display: inline-block; padding: 15px 30px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                Siparişlerimi Görüntüle
              </a>
            </div>

            <p style="font-size: 14px; color: #666666; line-height: 1.6; margin: 30px 0 0 0;">
              Herhangi bir sorunuz varsa, müşteri hizmetlerimizle iletişime geçebilirsiniz.
            </p>
          </div>

          <div style="padding: 20px 30px; background-color: #f8f9fa; border-top: 1px solid #dee2e6;">
            <p style="font-size: 12px; color: #6c757d; margin: 0; text-align: center;">
              Bu e-postayı size gönderme sebebimiz siparişinizin durumunun güncellenmiş olmasıdır.
              Siparişinizle ilgili herhangi bir sorunuz varsa bizimle iletişime geçebilirsiniz.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
}; 