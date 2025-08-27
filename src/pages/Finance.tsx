import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import FinancialManager from '@/components/finance/FinancialManager';
import { CreateInvoiceDialog } from '@/components/finance/CreateInvoiceDialog';

const Finance = () => {
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);

  return (
    <DashboardLayout>
      <FinancialManager />
      <CreateInvoiceDialog 
        open={createInvoiceOpen}
        onOpenChange={setCreateInvoiceOpen}
      />
    </DashboardLayout>
  );
};

export default Finance;