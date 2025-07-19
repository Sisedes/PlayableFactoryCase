import React, { useState } from "react";

const Discount = () => {
  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsLoading(true);
    setMessage({ type: null, text: '' });

    try {
      if (couponCode.toLowerCase() === 'indirim10') {
        setMessage({ type: 'success', text: 'Kupon kodu başarıyla uygulandı! %10 indirim kazandınız.' });
        setCouponCode("");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else if (couponCode.toLowerCase() === 'indirim50tl') {
        setMessage({ type: 'success', text: 'Kupon kodu başarıyla uygulandı! 50 TL indirim kazandınız.' });
        setCouponCode("");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage({ type: 'error', text: 'Geçersiz kupon kodu. Lütfen tekrar deneyin.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="lg:max-w-[670px] w-full">
      <form onSubmit={handleSubmit}>
        {/* <!-- coupon box --> */}
        <div className="bg-white shadow-1 rounded-[10px]">
          
        </div>
      </form>
    </div>
  );
};

export default Discount;
