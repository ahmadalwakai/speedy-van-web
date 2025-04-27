import React from 'react';
import {
  Box,
  Heading,
  Text,
  List,
  ListItem,
  Link,
  Button,
  Image,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import NextLink from 'next/link';
import { GetStaticProps } from 'next'; // Added missing import
import { FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import CTA from '@/components/sections/CTA';

const BlogPost: React.FC = () => {
  const { t } = useTranslation(['blog', 'common']);

  // Article Schema Markup
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: t('blog:top5TipsTitle', { defaultValue: 'Top 5 Tips for Affordable Van Delivery in the UK' }),
    description: t('blog:top5TipsDescription', {
      defaultValue: 'Discover 5 practical tips to save money on van delivery services in the UK.',
    }),
    image: 'https://speedyvan.com/blog/affordable-van-delivery.jpg',
    author: { '@type': 'Organization', name: 'Speedy Van' },
    publisher: { '@type': 'Organization', name: 'Speedy Van', logo: 'https://speedyvan.com/logo.png' },
    datePublished: '2025-04-26',
    url: 'https://speedyvan.com/blog/top-5-tips-affordable-van-delivery-uk',
  };

  return (
    <>
      <Head>
        <title>
          {t('blog:top5TipsTitle', { defaultValue: 'Top 5 Tips for Affordable Van Delivery in the UK | Speedy Van' })}
        </title>
        <meta
          name="description"
          content={t('blog:top5TipsDescription', {
            defaultValue:
              'Discover 5 practical tips to save money on van delivery services in the UK. Learn how to book affordable, reliable transport with Speedy Van.',
          })}
        />
        <meta
          name="keywords"
          content="Affordable Van Delivery UK, Cheap Transport Tips, Van Delivery Services, Speedy Van, Book Van Service"
        />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          property="og:title"
          content={t('blog:top5TipsTitle', {
            defaultValue: 'Top 5 Tips for Affordable Van Delivery in the UK | Speedy Van',
          })}
        />
        <meta
          property="og:description"
          content={t('blog:top5TipsDescription', {
            defaultValue:
              'Discover 5 practical tips to save money on van delivery services in the UK with Speedy Van.',
          })}
        />
        <meta property="og:image" content="https://speedyvan.com/blog/affordable-van-delivery.jpg" />
        <meta
          property="og:url"
          content="https://speedyvan.com/blog/top-5-tips-affordable-van-delivery-uk"
        />
        <meta property="og:type" content="article" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <Box maxW="4xl" mx="auto" px={{ base: 4, md: 8 }} py={8}>
        {/* Main Title */}
        <Heading as="h1" size="2xl" mb={6} textAlign="center">
          {t('blog:top5TipsTitle', { defaultValue: 'Top 5 Tips for Affordable Van Delivery in the UK' })}
        </Heading>

        {/* Introduction */}
        <Text fontSize="lg" mb={6}>
          {t('blog:intro', {
            defaultValue:
              'Looking to save money on van delivery services in the UK? At Speedy Van, we understand the importance of affordable, reliable transport. Here are five practical tips to help you book cheap van delivery services while ensuring quality and efficiency.',
          })}
          <Link as={NextLink} href="/" color="primary.500">
            Speedy Van
          </Link>
          .
        </Text>

        {/* Table of Contents */}
        <Box mb={8} p={4} bg="gray.50" borderRadius="md">
          <Text fontWeight="bold" mb={2}>
            {t('blog:tocTitle', { defaultValue: 'Quick Navigation' })}
          </Text>
          <List styleType="disc" pl={4}>
            <ListItem>
              <Link as={NextLink} href="#tip1" color="primary.500">
                {t('blog:tip1Title', { defaultValue: 'Compare Quotes Early' })}
              </Link>
            </ListItem>
            <ListItem>
              <Link as={NextLink} href="#tip2" color="primary.500">
                {t('blog:tip2Title', { defaultValue: 'Book in Advance' })}
              </Link>
            </ListItem>
            <ListItem>
              <Link as={NextLink} href="#tip3" color="primary.500">
                {t('blog:tip3Title', { defaultValue: 'Optimize Your Load' })}
              </Link>
            </ListItem>
            <ListItem>
              <Link as={NextLink} href="#tip4" color="primary.500">
                {t('blog:tip4Title', { defaultValue: 'Choose Local Services' })}
              </Link>
            </ListItem>
            <ListItem>
              <Link as={NextLink} href="#tip5" color="primary.500">
                {t('blog:tip5Title', { defaultValue: 'Check for Discounts' })}
              </Link>
            </ListItem>
          </List>
        </Box>

        {/* Blog Image */}
        <Box my={8} textAlign="center">
          <Image
            src="/blog/affordable-van-delivery.jpg"
            alt={t('blog:imageAlt', { defaultValue: 'Affordable van delivery tips in the UK' })}
            borderRadius="md"
            maxW="100%"
            loading="lazy"
          />
        </Box>

        {/* Blog Content */}
        <List spacing={8}>
          <ListItem>
            <Heading as="h2" size="md" mb={2} id="tip1">
              {t('blog:tip1Title', { defaultValue: '1. Compare Quotes Early' })}
            </Heading>
            <Text>
              {t('blog:tip1Description', {
                defaultValue:
                  'One of the easiest ways to save on van delivery is to compare quotes from multiple providers. Use Speedy Van’s ',
              })}
              <Link as={NextLink} href="/get-quote" color="primary.500">
                {t('blog:freeQuote', { defaultValue: 'free quote tool' })}
              </Link>
              {t('blog:tip1Description2', {
                defaultValue: ' to find the best deal for your delivery needs.',
              })}
            </Text>
          </ListItem>
          <ListItem>
            <Heading as="h2" size="md" mb={2} id="tip2">
              {t('blog:tip2Title', { defaultValue: '2. Book in Advance' })}
            </Heading>
            <Text>
              {t('blog:tip2Description', {
                defaultValue:
                  'Scheduling your delivery early can secure lower rates, especially during peak seasons. ',
              })}
              <Link as={NextLink} href="/book-order" color="primary.500">
                {t('blog:bookNow', { defaultValue: 'Book now' })}
              </Link>
              {t('blog:tip2Description2', { defaultValue: ' to lock in affordable pricing with Speedy Van.' })}
            </Text>
          </ListItem>
          <ListItem>
            <Heading as="h2" size="md" mb={2} id="tip3">
              {t('blog:tip3Title', { defaultValue: '3. Optimize Your Load' })}
            </Heading>
            <Text>
              {t('blog:tip3Description', {
                defaultValue:
                  'Consolidating items into fewer trips can reduce costs. Check our ',
              })}
              <Link as={NextLink} href="/pricing" color="primary.500">
                {t('blog:pricingPlans', { defaultValue: 'pricing plans' })}
              </Link>
              {t('blog:tip3Description2', { defaultValue: ' for cost-effective options tailored to your needs.' })}
            </Text>
          </ListItem>
          <ListItem>
            <Heading as="h2" size="md" mb={2} id="tip4">
              {t('blog:tip4Title', { defaultValue: '4. Choose Local Services' })}
            </Heading>
            <Text>
              {t('blog:tip4Description', {
                defaultValue:
                  'Selecting a provider with extensive coverage minimizes extra fees. Speedy Van serves all ',
              })}
              <Link as={NextLink} href="/coverage" color="primary.500">
                {t('blog:coverageAreas', { defaultValue: 'UK cities' })}
              </Link>
              {t('blog:tip4Description2', { defaultValue: ', ensuring affordable and reliable delivery.' })}
            </Text>
          </ListItem>
          <ListItem>
            <Heading as="h2" size="md" mb={2} id="tip5">
              {t('blog:tip5Title', { defaultValue: '5. Check for Discounts' })}
            </Heading>
            <Text>
              {t('blog:tip5Description', {
                defaultValue:
                  'Look for seasonal offers or bulk discounts to save more. For more on van insurance, check the ',
              })}
              <Link href="https://www.gov.uk/vehicle-insurance" isExternal color="primary.500">
                {t('blog:govInsurance', { defaultValue: 'official UK guidelines' })}
              </Link>
              {t('blog:tip5Description2', {
                defaultValue: '. Contact our ',
              })}
              <Link as={NextLink} href="/contact" color="primary.500">
                {t('blog:supportTeam', { defaultValue: 'support team' })}
              </Link>
              {t('blog:tip5Description3', { defaultValue: ' for exclusive deals.' })}
            </Text>
          </ListItem>
        </List>

        {/* Conclusion */}
        <Box mt={10}>
          <Heading as="h2" size="lg" mb={4}>
            {t('blog:conclusionTitle', { defaultValue: 'Conclusion: Save More with Smart Van Deliveries' })}
          </Heading>
          <Text mb={6}>
            {t('blog:conclusion', {
              defaultValue:
                'By following these tips, you can ensure cost-effective, reliable transport across the UK. Ready to move smart? ',
            })}
            <Link as={NextLink} href="/book-order" color="primary.500">
              {t('blog:bookWithSpeedyVan', { defaultValue: 'Book with Speedy Van today!' })}
            </Link>
          </Text>
        </Box>

        {/* Social Sharing Buttons */}
        <Box my={8} textAlign="center">
          <Text fontWeight="bold" mb={4}>
            {t('blog:shareArticle', { defaultValue: 'Share this article' })}
          </Text>
          <HStack justify="center" spacing={4}>
            <IconButton
              as="a"
              href="https://www.facebook.com/sharer/sharer.php?u=https://speedyvan.com/blog/top-5-tips-affordable-van-delivery-uk"
              target="_blank"
              aria-label="Share on Facebook"
              icon={<FaFacebook />}
              colorScheme="facebook"
            />
            <IconButton
              as="a"
              href="https://twitter.com/intent/tweet?url=https://speedyvan.com/blog/top-5-tips-affordable-van-delivery-uk&text=Top 5 Tips for Affordable Van Delivery in the UK"
              target="_blank"
              aria-label="Share on Twitter"
              icon={<FaTwitter />}
              colorScheme="twitter"
            />
            <IconButton
              as="a"
              href="https://www.linkedin.com/shareArticle?mini=true&url=https://speedyvan.com/blog/top-5-tips-affordable-van-delivery-uk"
              target="_blank"
              aria-label="Share on LinkedIn"
              icon={<FaLinkedin />}
              colorScheme="linkedin"
            />
          </HStack>
        </Box>

        {/* CTA */}
        <Box textAlign="center" mt={12} mb={8}>
          <Button
            as={NextLink}
            href="/get-quote"
            colorScheme="primary"
            size="lg"
            aria-label="Get a free van delivery quote"
          >
            {t('blog:getQuoteCTA', { defaultValue: 'Get Your Free Van Delivery Quote Now!' })}
          </Button>
        </Box>

        {/* Integrated CTA Component */}
        <CTA />
      </Box>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['blog', 'common', 'home'])),
    },
  };
};

export default BlogPost;