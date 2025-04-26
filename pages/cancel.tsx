import { Box, Heading, Text, Button } from '@chakra-ui/react';
import Link from 'next/link';

export default function CancelPage() {
  return (
    <Box textAlign="center" mt={20}>
      <Heading>Payment Cancelled</Heading>
      <Text mt={4}>You have cancelled the payment process.</Text>
      <Link href="/">
        <Button mt={6} colorScheme="blue">Back to Home</Button>
      </Link>
    </Box>
  );
}
