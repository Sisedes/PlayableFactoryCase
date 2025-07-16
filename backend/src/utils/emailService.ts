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
      name: 'E-Ticaret Mağazası',
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
      name: 'E-Ticaret Mağazası',
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
          <div style="padding: 40px 30px; text-align: center; background-color: #dc3545;">
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
                 style="display: inline-block; padding: 15px 30px; background-color: #dc3545; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                Parolayı Sıfırla
              </a>
            </div>
            <p style="font-size: 14px; color: #666666; line-height: 1.6; margin: 30px 0 0 0;">
              Eğer yukarıdaki buton çalışmıyorsa, aşağıdaki linki kopyalayıp tarayıcınıza yapıştırın:<br>
              <a href="${resetUrl}" style="color: #dc3545; word-break: break-all;">${resetUrl}</a>
            </p>
            <p style="font-size: 14px; color: #666666; margin: 30px 0 0 0;">
              Bu link 10 dakika içinde geçerliliğini yitirecektir.
            </p>
            <div style="padding: 20px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; margin: 30px 0 0 0;">
              <p style="font-size: 14px; color: #856404; margin: 0; font-weight: bold;">
                Güvenlik Uyarısı
              </p>
              <p style="font-size: 13px; color: #856404; margin: 10px 0 0 0;">
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
      name: 'E-Ticaret Mağazası',
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
  const mailOptions = {
    from: {
      name: 'E-Ticaret Mağazası',
      address: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@example.com'
    },
    to: email,
    subject: `Sipariş Onayı - #${orderDetails.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sipariş Onayı</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="padding: 40px 30px; text-align: center; background-color: #28a745;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Siparişiniz Alındı!</h1>
          </div>
          <div style="padding: 40px 30px;">
            <p style="font-size: 16px; color: #333333; margin: 0 0 20px 0;">
              Sayın ${customerName},
            </p>
            <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 30px 0;">
              Siparişiniz başarıyla alınmıştır. Sipariş detaylarınız aşağıdaki gibidir:
            </p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold; color: #333;">Sipariş Numarası: #${orderDetails.orderNumber}</p>
              <p style="margin: 10px 0 0 0; color: #666;">Sipariş Tarihi: ${new Date().toLocaleDateString('tr-TR')}</p>
            </div>
            <p style="font-size: 14px; color: #666666; line-height: 1.6; margin: 30px 0 0 0;">
              Siparişinizin kargo takip bilgileri e-posta adresinize gönderilecektir.
            </p>
          </div>
          <div style="padding: 20px 30px; background-color: #f8f9fa; border-top: 1px solid #dee2e6;">
            <p style="font-size: 12px; color: #6c757d; margin: 0; text-align: center;">
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