import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ClinicalWorkflowEngine from '@/components/clinical/ClinicalWorkflowEngine';

const ClinicalWorkflow = () => {
  return (
    <DashboardLayout>
      <ClinicalWorkflowEngine />
    </DashboardLayout>
  );
};

export default ClinicalWorkflow;