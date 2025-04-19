import React from 'react';
import { Box, Heading, VStack, Button, Input, Textarea, useToast } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';

const ReviewPage: React.FC = () => {
  const { t } = useTranslation(['common', 'order']);
  const router = useRouter();
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/submit-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment, orderId: router.query.orderId }),
      });

      if (response.ok) {
        toast({
          title: t('order:reviewSubmitted', { defaultValue: 'Review submitted successfully!' }),
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        router.push('/');
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error) {
      console.error('Review submission error:', error);
      toast({
        title: t('order:errorMessage'),
        description: 'Failed to submit review.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box minH="100vh" p={4}>
      <VStack spacing={8} maxW="md" mx="auto">
        <Heading size="lg">{t('order:reviewTitle', { defaultValue: 'Rate Your Experience' })}</Heading>
        <Box>
          <Text mb={2}>{t('order:rating', { defaultValue: 'Rating (1-5)' })}</Text>
          <Input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            placeholder={t('order:ratingPlaceholder', { defaultValue: 'Enter rating' })}
          />
        </Box>
        <Box>
          <Text mb={2}>{t('order:comment', { defaultValue: 'Comment (optional)' })}</Text>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('order:commentPlaceholder', { defaultValue: 'Share your feedback' })}
          />
        </Box>
        <Button colorScheme="blue" onClick={handleSubmit}>
          {t('order:submitReview', { defaultValue: 'Submit Review' })}
        </Button>
      </VStack>
    </Box>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'order'])),
    },
  };
};

export default ReviewPage;