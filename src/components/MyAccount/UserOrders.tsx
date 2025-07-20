"use client";
import React from "react";
import Orders from "../Orders";

const UserOrders = () => {
  return (
    <div className="xl:max-w-[770px] w-full bg-white rounded-xl shadow-1">
      <div className="p-4 sm:p-7.5 xl:p-10">
        <div className="flex items-center justify-between mb-7">
          <h2 className="font-medium text-xl sm:text-2xl text-dark">
            Siparişlerim
          </h2>
        </div>
        <Orders />
      </div>
    </div>
  );
};

export default UserOrders; 