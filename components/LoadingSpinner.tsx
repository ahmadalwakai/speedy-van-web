import React from 'react';
import { Spinner, Center } from '@chakra-ui/react';

/**
 * LoadingSpinner component for displaying loading state
 */
const LoadingSpinner: React.FC = () => {
  return (
    <Center position="fixed" top={0} left={0} right={0} bottom={0} bg="rgba(0,0,0,0.5)" zIndex={9999}>
      <Spinner size="xl" color="brand.500" />
    </Center>
  );
};

export default LoadingSpinner;