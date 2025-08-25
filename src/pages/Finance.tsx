import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import FinancialManager from '@/components/finance/FinancialManager';

const Finance = () => {
  return (
    <DashboardLayout>
      <FinancialManager />
    </DashboardLayout>
  );
};

export default Finance;