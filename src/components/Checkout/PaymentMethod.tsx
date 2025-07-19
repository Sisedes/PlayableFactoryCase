import React from "react";
import Image from "next/image";

type PaymentMethodType = 'credit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';

interface PaymentMethodProps {
  selectedMethod: PaymentMethodType;
  onChange: (method: PaymentMethodType) => void;
}

const PaymentMethod = ({ selectedMethod, onChange }: PaymentMethodProps) => {
  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Ödeme Yöntemi</h3>
      </div>

      <div className="p-4 sm:p-8.5">
        <div className="flex flex-col gap-3">
          <label
            htmlFor="credit_card"
            className="flex cursor-pointer select-none items-center gap-4"
          >
            <div className="relative">
              <input
                type="radio"
                name="paymentMethod"
                id="credit_card"
                className="sr-only"
                checked={selectedMethod === "credit_card"}
                onChange={() => onChange("credit_card")}
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  selectedMethod === "credit_card"
                    ? "border-4 border-blue"
                    : "border border-gray-4"
                }`}
              ></div>
            </div>

            <div
              className={`rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none ${
                selectedMethod === "credit_card"
                  ? "border-transparent bg-gray-2"
                  : " border-gray-4 shadow-1"
              }`}
            >
              <div className="flex items-center">
                <div className="pr-2.5">
                  <svg width="29" height="12" viewBox="0 0 29 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="29" height="12" rx="2" fill="#1F2937"/>
                    <path d="M6 4H8V8H6V4Z" fill="white"/>
                    <path d="M10 4H12V8H10V4Z" fill="white"/>
                    <path d="M14 4H16V8H14V4Z" fill="white"/>
                    <path d="M18 4H20V8H18V4Z" fill="white"/>
                    <path d="M22 4H24V8H22V4Z" fill="white"/>
                  </svg>
                </div>

                <div className="border-l border-gray-4 pl-2.5">
                  <p>Kredi Kartı</p>
                </div>
              </div>
            </div>
          </label>

          <label
            htmlFor="bank_transfer"
            className="flex cursor-pointer select-none items-center gap-4"
          >
            <div className="relative">
              <input
                type="radio"
                name="paymentMethod"
                id="bank_transfer"
                className="sr-only"
                checked={selectedMethod === "bank_transfer"}
                onChange={() => onChange("bank_transfer")}
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  selectedMethod === "bank_transfer"
                    ? "border-4 border-blue"
                    : "border border-gray-4"
                }`}
              ></div>
            </div>

            <div
              className={`rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none ${
                selectedMethod === "bank_transfer"
                  ? "border-transparent bg-gray-2"
                  : " border-gray-4 shadow-1"
              }`}
            >
              <div className="flex items-center">
                <div className="pr-2.5">
                  <Image src="/images/checkout/bank.svg" alt="bank" width={29} height={12}/>
                </div>

                <div className="border-l border-gray-4 pl-2.5">
                  <p>Banka Havalesi</p>
                </div>
              </div>
            </div>
          </label>

          <label
            htmlFor="paypal"
            className="flex cursor-pointer select-none items-center gap-4"
          >
            <div className="relative">
              <input
                type="radio"
                name="paymentMethod"
                id="paypal"
                className="sr-only"
                checked={selectedMethod === "paypal"}
                onChange={() => onChange("paypal")}
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  selectedMethod === "paypal"
                    ? "border-4 border-blue"
                    : "border border-gray-4"
                }`}
              ></div>
            </div>
            <div
              className={`rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none min-w-[240px] ${
                selectedMethod === "paypal"
                  ? "border-transparent bg-gray-2"
                  : " border-gray-4 shadow-1"
              }`}
            >
              <div className="flex items-center">
                <div className="pr-2.5">
                  <Image src="/images/checkout/paypal.svg" alt="paypal" width={75} height={20}/>
                </div>

                <div className="border-l border-gray-4 pl-2.5">
                  <p>PayPal</p>
                </div>
              </div>
            </div>
          </label>

          <label
            htmlFor="cash_on_delivery"
            className="flex cursor-pointer select-none items-center gap-4"
          >
            <div className="relative">
              <input
                type="radio"
                name="paymentMethod"
                id="cash_on_delivery"
                className="sr-only"
                checked={selectedMethod === "cash_on_delivery"}
                onChange={() => onChange("cash_on_delivery")}
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  selectedMethod === "cash_on_delivery"
                    ? "border-4 border-blue"
                    : "border border-gray-4"
                }`}
              ></div>
            </div>

            <div
              className={`rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none min-w-[240px] ${
                selectedMethod === "cash_on_delivery"
                  ? "border-transparent bg-gray-2"
                  : " border-gray-4 shadow-1"
              }`}
            >
              <div className="flex items-center">
                <div className="pr-2.5">
                  <Image src="/images/checkout/cash.svg" alt="cash" width={21} height={21} />
                </div>

                <div className="border-l border-gray-4 pl-2.5">
                  <p>Kapıda Ödeme</p>
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
