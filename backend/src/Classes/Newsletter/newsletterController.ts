import { Request, Response } from 'express';
import Newsletter from './newsletterModel';
import { sendNewsletterWelcomeEmail } from '../../utils/emailService';

/**
 * @desc    
 * @route   post /api/newsletter/subscribe
 * @access  
 */
export const subscribeToNewsletter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'E-posta adresi gereklidir'
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Geçerli bir e-posta adresi giriniz'
      });
      return;
    }

    // E-posta adresinin zaten abone olup olmadığını kontrol et
    const existingSubscription = await Newsletter.findOne({ email: email.toLowerCase() });
    
    if (existingSubscription) {
      if (existingSubscription.isActive) {
        res.status(400).json({
          success: false,
          message: 'Bu e-posta adresi zaten bültenimize abonedir'
        });
        return;
      } else {

        existingSubscription.isActive = true;
        delete existingSubscription.unsubscribedAt;
        await existingSubscription.save();
        
       
        try {
          await sendNewsletterWelcomeEmail(email);
        } catch (emailError) {
          console.error('Hoş geldin e-postası gönderme hatası:', emailError);
        }

        res.status(200).json({
          success: true,
          message: 'Bülten aboneliğiniz yeniden aktifleştirildi!'
        });
        return;
      }
    }


    const newsletter = new Newsletter({
      email: email.toLowerCase()
    });

    await newsletter.save();


    try {
      await sendNewsletterWelcomeEmail(email);
    } catch (emailError) {
      console.error('Hoş geldin e-postası gönderme hatası:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Bülten aboneliğiniz başarıyla tamamlandı!'
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Bülten aboneliği sırasında bir hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   post /api/newsletter/unsubscribe
 * @access  
 */
export const unsubscribeFromNewsletter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'E-posta adresi gereklidir'
      });
      return;
    }

    const subscription = await Newsletter.findOne({ email: email.toLowerCase() });
    
    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'Bu e-posta adresi bültenimize abone değil'
      });
      return;
    }

    if (!subscription.isActive) {
      res.status(400).json({
        success: false,
        message: 'Bu e-posta adresi zaten aboneliği iptal edilmiş'
      });
      return;
    }

    subscription.isActive = false;
    subscription.unsubscribedAt = new Date();
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Bülten aboneliğiniz başarıyla iptal edildi'
    });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Abonelik iptali sırasında bir hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   get /api/newsletter/subscribers
 * @access  
 */
export const getNewsletterSubscribers = async (req: Request, res: Response): Promise<void> => {
  try {
    const subscribers = await Newsletter.find({ isActive: true })
      .select('email subscribedAt')
      .sort({ subscribedAt: -1 });

    res.status(200).json({
      success: true,
      data: subscribers,
      count: subscribers.length
    });

  } catch (error) {
    console.error('Get newsletter subscribers error:', error);
    res.status(500).json({
      success: false,
      message: 'Abone listesi alınırken bir hata oluştu'
    });
  }
}; 