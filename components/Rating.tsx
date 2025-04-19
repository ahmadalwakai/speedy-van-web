import React, { useState } from 'react';
import { Box, Button, VStack, Text, HStack, Icon, useToast, Textarea } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { FiStar } from 'react-icons/fi';

const Rating: React.FC<{ orderId: string }> = ({ orderId }) => {
  const { t } = useTranslation(['common']);
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    try {
      await fetch('/api/submit-rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, rating, comment }),
      });
      toast({
        title: t('rating:success', { defaultValue: 'Thank you for your feedback!' }),
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: t('rating:error', { defaultValue: 'Failed to submit rating.' }),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box padding={4} borderWidth={1} borderRadius="lg" boxShadow="md">
      <VStack spacing={4}>
        <Text fontSize="xl" fontWeight="bold">
          {t('rating:title', { defaultValue: 'Rate Your Experience' })}
        </Text>
        <HStack>
          {[1, 2, 3, 4, 5].map((star) => (
            <Icon
              key={star}
              as={FiStar}
              boxSize={8}
              color={star <= rating ? 'gold' : 'gray.300'}
              onClick={() => setRating(star)}
              cursor="pointer"
            />
          ))}
        </HStack>
        <Textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder={t('rating:commentPlaceholder', { defaultValue: 'Share your feedback...' })}
        />
        <Button
          colorScheme="blue"
          onClick={handleSubmit}
          isDisabled={rating === 0}
        >
          {t('rating:submit', { defaultValue: 'Submit Rating' })}
        </Button>
      </VStack>
    </Box>
  );
};

export default Rating;