import React from 'react';
import { Box, Container, Grid, GridItem, Heading, Text, Icon, useColorModeValue, Flex, useBreakpointValue, Badge, chakra } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { FaShippingFast, FaShieldAlt, FaMoneyBillWave, FaMapMarkedAlt, FaHeadset, FaClock } from 'react-icons/fa';
import NextLink from 'next/link';

const MotionBox = motion(Box);
const MotionGrid = motion(Grid);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.4,
      duration: 0.8
    }
  }
};

interface Feature {
  icon: React.ElementType;
  title: string;
  description?: string;
  descriptionKey?: string;
  highlight?: boolean;
  stats?: string;
  badge?: string;
  new?: boolean;
  link?: string;
}

const Features = () => {
  const { t } = useTranslation('home');
  const headingColor = useColorModeValue('blue.600', 'blue.300');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardShadow = useColorModeValue('md', 'dark-lg');
  const iconColor = useColorModeValue('blue.500', 'blue.300');
  const highlightBg = useColorModeValue('blue.50', 'blue.900');
  const iconBg = useColorModeValue('blue.50', 'blue.900');
  const headingTextColor = useColorModeValue('gray.800', 'white');

  const gridColumns = useBreakpointValue({ base: 1, md: 2, lg: 3 });
  const sectionSpacing = useBreakpointValue({ base: 8, md: 16 });

  const features: Feature[] = [
    {
      icon: FaShippingFast,
      title: t('features.fastDelivery.title'),
      description: t('features.fastDelivery.description'),
      highlight: true,
      stats: t('features.fastDelivery.stats', { defaultValue: '10,000+ deliveries' })
    },
    {
      icon: FaShieldAlt,
      title: t('features.securePayment.title'),
      description: t('features.securePayment.description'),
      badge: 'Popular'
    },
    {
      icon: FaMoneyBillWave,
      title: t('features.competitivePricing.title'),
      description: t('features.competitivePricing.description')
    },
    {
      icon: FaMapMarkedAlt,
      title: t('features.realTimeTracking.title'),
      description: t('features.realTimeTracking.description'),
      link: '/tracking'
    },
    {
      icon: FaHeadset,
      title: t('features.support.title'),
      description: t('features.support.description'),
      badge: '24/7'
    },
    {
      icon: FaClock,
      title: t('features.availability.title'),
      descriptionKey: 'features.availability.description',
      link: '/coverage'
    }
  ];

  return (
    <Box as="section" py={sectionSpacing} id="features" position="relative">
      <Box 
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        bgImage={useColorModeValue(
          "radial-gradient(circle at 10% 20%, rgba(200, 200, 255, 0.05) 0%, rgba(255, 255, 255, 0) 50%)",
          "radial-gradient(circle at 10% 20%, rgba(0, 0, 50, 0.1) 0%, rgba(0, 0, 0, 0) 50%)"
        )}
        zIndex={0}
      />
      
      <Container maxW="7xl" position="relative" zIndex={1}>
        <Box textAlign="center" mb={sectionSpacing}>
          <chakra.span
            color={headingColor}
            fontWeight="semibold"
            textTransform="uppercase"
            letterSpacing="wide"
            fontSize="sm"
          >
            {t('features.subtitle')}
          </chakra.span>
          <Heading
            as="h2"
            size="xl"
            mt={2}
            mb={4}
            color={useColorModeValue('gray.900', 'white')}
            lineHeight="shorter"
          >
            {t('features.title')}
          </Heading>
          <Text
            maxW="2xl"
            mx="auto"
            color={textColor}
            fontSize={{ base: 'lg', md: 'xl' }}
          >
            {t('features.description')}
          </Text>
        </Box>

        <MotionGrid
          templateColumns={`repeat(${gridColumns}, 1fr)`}
          gap={8}
          px={{ base: 4, md: 0 }}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <GridItem key={index} colSpan={1}>
              <MotionBox variants={cardVariants}>
                {feature.link ? (
                  <NextLink href={feature.link} passHref>
                    <Box
                      as="a"
                      _hover={{ textDecoration: 'none' }}
                      display="block"
                    >
                      <Box
                        bg={feature.highlight ? highlightBg : cardBg}
                        p={8}
                        rounded="lg"
                        shadow={cardShadow}
                        h="100%"
                        transition="all 0.3s ease"
                        borderWidth={feature.highlight ? '2px' : '1px'}
                        borderColor={feature.highlight ? 'blue.200' : 'transparent'}
                        _hover={{
                          transform: 'translateY(-5px)',
                          shadow: 'xl'
                        }}
                        position="relative"
                      >
                        {feature.badge && (
                          <Badge 
                            colorScheme="blue" 
                            position="absolute" 
                            top={-2} 
                            right={-2}
                            px={2}
                            py={1}
                            borderRadius="full"
                            fontSize="xs"
                          >
                            {feature.badge}
                          </Badge>
                        )}
                        {feature.new && (
                          <Badge 
                            colorScheme="green" 
                            position="absolute" 
                            top={-2} 
                            right={-2}
                            px={2}
                            py={1}
                            borderRadius="full"
                            fontSize="xs"
                          >
                            New
                          </Badge>
                        )}
                        <Flex
                          align="center"
                          justify="center"
                          w={12}
                          h={12}
                          mb={6}
                          rounded="full"
                          bg={iconBg}
                          color={iconColor}
                          _hover={{
                            transform: 'rotate(10deg) scale(1.1)',
                            transition: '0.3s'
                          }}
                        >
                          <Icon as={feature.icon} w={6} h={6} />
                        </Flex>
                        <Heading
                          as="h3"
                          size="md"
                          mb={3}
                          color={headingTextColor}
                        >
                          {feature.title}
                        </Heading>
                        <Text color={textColor} fontSize="md" mb={2}>
                          {feature.descriptionKey ? (
                            <chakra.span
                              dangerouslySetInnerHTML={{
                                __html: t(feature.descriptionKey, { defaultValue: '' }),
                              }}
                            />
                          ) : (
                            feature.description
                          )}
                        </Text>
                        {feature.stats && (
                          <Text fontSize="sm" color="blue.400" fontWeight="medium">
                            {feature.stats}
                          </Text>
                        )}
                      </Box>
                    </Box>
                  </NextLink>
                ) : (
                  <Box
                    bg={feature.highlight ? highlightBg : cardBg}
                    p={8}
                    rounded="lg"
                    shadow={cardShadow}
                    h="100%"
                    transition="all 0.3s ease"
                    borderWidth={feature.highlight ? '2px' : '1px'}
                    borderColor={feature.highlight ? 'blue.200' : 'transparent'}
                    _hover={{
                      transform: 'translateY(-5px)',
                      shadow: 'xl'
                    }}
                    position="relative"
                  >
                    {feature.badge && (
                      <Badge 
                        colorScheme="blue" 
                        position="absolute" 
                        top={-2} 
                        right={-2}
                        px={2}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                      >
                        {feature.badge}
                      </Badge>
                    )}
                    {feature.new && (
                      <Badge 
                        colorScheme="green" 
                        position="absolute" 
                        top={-2} 
                        right={-2}
                        px={2}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                      >
                        New
                      </Badge>
                    )}
                    <Flex
                      align="center"
                      justify="center"
                      w={12}
                      h={12}
                      mb={6}
                      rounded="full"
                      bg={iconBg}
                      color={iconColor}
                      _hover={{
                        transform: 'rotate(10deg) scale(1.1)',
                        transition: '0.3s'
                      }}
                    >
                      <Icon as={feature.icon} w={6} h={6} />
                    </Flex>
                    <Heading
                      as="h3"
                      size="md"
                      mb={3}
                      color={headingTextColor}
                    >
                      {feature.title}
                    </Heading>
                    <Text color={textColor} fontSize="md" mb={2}>
                      {feature.descriptionKey ? (
                        <chakra.span
                          dangerouslySetInnerHTML={{
                            __html: t(feature.descriptionKey, { defaultValue: '' }),
                          }}
                        />
                      ) : (
                        feature.description
                      )}
                    </Text>
                    {feature.stats && (
                      <Text fontSize="sm" color="blue.400" fontWeight="medium">
                        {feature.stats}
                      </Text>
                    )}
                  </Box>
                )}
              </MotionBox>
            </GridItem>
          ))}
        </MotionGrid>
      </Container>
    </Box>
  );
};

export default Features;