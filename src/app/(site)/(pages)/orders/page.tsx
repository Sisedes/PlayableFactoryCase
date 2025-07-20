'use client';

import React from 'react';
import Orders from '@/components/Orders';

export default function OrdersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Siparişlerim</h1>
      <Orders />
    </div>
  );
} 