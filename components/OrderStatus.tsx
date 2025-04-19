import React from 'react';
import { Badge } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';

// تعريف حالات الطلب مع التسميات والألوان
const orderStatus = {
  pending: { label: 'order:status.pending', color: 'yellow' },
  paid: { label: 'order:status.paid', color: 'green' },
  delivered: { label: 'order:status.delivered', color: 'blue' },
  canceled: { label: 'order:status.canceled', color: 'red' },
};

export const OrderStatusBadge: React.FC<{ status: keyof typeof orderStatus }> = ({ status }) => {
  const { t } = useTranslation('order');
  const { label, color } = orderStatus[status];

  return (
    <Badge colorScheme={color} p={2} borderRadius="md">
      {t(label, { defaultValue: label })}
    </Badge>
  );
};