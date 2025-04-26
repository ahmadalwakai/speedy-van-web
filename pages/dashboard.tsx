import React, { useEffect } from 'react';
import { Box, Heading, Text, Button, Spinner, Center } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/stores/authStore';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box p={8}>
      <Heading>Welcome, {user.username} 👋</Heading>
      <Text mt={4}>Email: {user.email}</Text>
      <Text mt={2}>Role: {user.role}</Text>
      <Button mt={6} colorScheme="blue" onClick={() => router.push('/book-order')}>
        🚚 Start New Booking
      </Button>
    </Box>
  );
};

export default Dashboard;
