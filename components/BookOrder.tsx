import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Select,
  Checkbox,
  useToast,
  useColorModeValue,
  Heading,
  FormErrorMessage,
  SimpleGrid,
  Textarea,
  Flex,
  Image,
  InputGroup,
  InputRightElement,
  List,
  ListItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Spinner,
  IconButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
} from '@chakra-ui/react';
import {
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepTitle,
  StepDescription,
  StepSeparator,
} from '@chakra-ui/stepper';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiArrowLeft, FiPhone, FiPackage, FiMap, FiX } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import logger from '@/services/logger';
import { v4 as uuidv4 } from 'uuid';
import { loadStripe } from '@stripe/stripe-js';
import { OrderStatusBadge } from './OrderStatus';
import debounce from 'lodash/debounce';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import mapboxgl from 'mapbox-gl';
import MapboxClient from '@mapbox/mapbox-sdk';
import MapboxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';
import MapboxDirections from '@mapbox/mapbox-sdk/services/directions';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { format, Locale } from 'date-fns';
import { ar as arLocale, enGB as enGBLocale } from 'date-fns/locale';

// Mapbox access token
if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
  throw new Error('NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not defined');
}
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

// Mapbox services
const mapboxClient = MapboxClient({ accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN! });
const geocodingService = MapboxGeocoding(mapboxClient);
const directionsService = MapboxDirections(mapboxClient);

// Dynamic import for MapboxMap
const MapboxMap = dynamic(() => import('@/components/MapboxMap'), { ssr: false });

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

// Item interface
export  interface Item {
  type: string;
  size: string;
  quantity: number;
  isCustom: boolean;
  customName?: string | null;
}

// Yup schema
export const schema = yup.object({
  firstName: yup.string().matches(/^[A-Za-z\s]+$/, 'Invalid first name').min(2).max(50).required('First name is required'),
  lastName: yup.string().matches(/^[A-Za-z\s]+$/, 'Invalid last name').min(2).max(50).required('Last name is required'),
  phoneNumber: yup.string().matches(/^\+447\d{9}$/, 'Invalid phone number').required('Phone number is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  pickupAddress: yup.string().required('Pickup address is required'),
  pickupFloor: yup.string().required('Pickup floor is required'),
  pickupLift: yup.boolean().default(false),
  pickupBuildingType: yup.string().optional(),
  pickupDriverNotes: yup.string().optional(),
  dropoffAddress: yup.string().required('Dropoff address is required'),
  dropoffFloor: yup.string().required('Dropoff floor is required'),
  dropoffLift: yup.boolean().default(false),
  dropoffBuildingType: yup.string().optional(),
  dropoffDriverNotes: yup.string().optional(),
  serviceType: yup.string().required('Service type is required'),
  description: yup.string().optional(),
  pickupDateTime: yup.string().required('Pickup date and time are required'),
  flexibleTime: yup.boolean().default(false),
  items: yup.array().of(
    yup.object().shape({
      type: yup.string().required('Item type is required'),
      size: yup.string().required('Item size is required'),
      quantity: yup.number().min(1).required('Quantity is required'),
      isCustom: yup.boolean().default(false),
      customName: yup
        .string()
        .nullable()
        .when('isCustom', {
          is: true,
          then: (schema) => schema.required('Custom item name is required').max(50, 'Custom item name must not exceed 50 characters'),
        }),
    })
  ).min(1, 'At least one item is required'),
  images: yup.array().of(yup.mixed()).optional(),
  status: yup.string().default('pending'),
  coupon: yup.string().optional(),
  termsAccepted: yup
    .boolean()
    .oneOf([true], 'You must accept the terms and conditions')
    .required(),
});

// Form data type
type FormData = yup.InferType<typeof schema>;
type FormFieldNames = keyof FormData;

// Error handling utility
const handleError = (
  toast: any,
  logger: any,
  title: string,
  description: string,
  status: 'error' | 'info' | 'success' = 'error'
) => {
  logger.error(`${title}: ${description}`);
  toast({ title, description, status, duration: 5000, isClosable: true });
};

// Generate order number
const generateOrderNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(10000 + Math.random() * 90000);
  return `SV-${date}-${random}`;
};

// Stepper steps
const STEPS = (t: any) => [
  { title: t('order:personalInfo'), description: t('order:personalInfoDesc') },
  { title: t('order:pickupDropoff'), description: t('order:pickupDropoffDesc') },
  { title: t('order:itemsService'), description: t('order:itemsServiceDesc') },
  { title: t('order:review'), description: t('order:reviewDesc') },
  { title: t('order:payment'), description: t('order:paymentDesc') },
];

// ItemsList component
const ItemsList: React.FC<{
  items: Item[];
  errors: any;
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  control: any;
  t: any;
  onRemove: (index: number) => void;
}> = ({ items, errors, setItems, control, t, onRemove }) => {
  const handleAddItem = useCallback(() => {
    const newItems = [...items, { type: '', size: '', quantity: 1, isCustom: false }];
    setItems(newItems);
  }, [items, setItems]);

  return (
    <Box w="full">
      <Text fontSize="lg" fontWeight="bold" mb={4} lineHeight="1.6">{t('order:items')}</Text>
      {items.map((item: Item, index: number) => (
        <SimpleGrid
          key={index}
          columns={{ base: 1, md: item.isCustom ? 5 : 4 }}
          spacing={6}
          minChildWidth="150px"
          mb={4}
        >
          <FormControl isInvalid={!!errors.items?.[index]?.type}>
            <FormLabel>{t('order:itemType')}</FormLabel>
            <Controller
              name={`items[${index}].type`}
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder={t('order:itemTypePlaceholder')}
                  onChange={(e) => {
                    field.onChange(e);
                    setItems((prev: Item[]) => {
                      const newItems = [...prev];
                      newItems[index] = { ...newItems[index], type: e.target.value, isCustom: e.target.value === 'custom' };
                      return newItems;
                    });
                  }}
                >
                  <option value="chair">{t('order:chair')}</option>
                  <option value="bed">{t('order:bed')}</option>
                  <option value="box">{t('order:box')}</option>
                  <option value="fridge">{t('order:fridge')}</option>
                  <option value="washingMachine">{t('order:washingMachine')}</option>
                  <option value="tv">{t('order:tv')}</option>
                  <option value="fan">{t('order:fan')}</option>
                  <option value="sofa">{t('order:sofa')}</option>
                  <option value="custom">{t('order:custom')}</option>
                </Select>
              )}
            />
            <FormErrorMessage>{errors.items?.[index]?.type?.message}</FormErrorMessage>
          </FormControl>
          {item.isCustom && (
            <FormControl isInvalid={!!errors.items?.[index]?.customName}>
              <FormLabel>{t('order:customName')}</FormLabel>
              <Controller
                name={`items[${index}].customName`}
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      field.onChange(e);
                      setItems((prev: Item[]) => {
                        const newItems = [...prev];
                        newItems[index] = { ...newItems[index], customName: e.target.value };
                        return newItems;
                      });
                    }}
                    placeholder={t('order:customNamePlaceholder')}
                    css={{ overflowWrap: 'break-word' }}
                  />
                )}
              />
              <FormErrorMessage>{errors.items?.[index]?.customName?.message}</FormErrorMessage>
            </FormControl>
          )}
          <FormControl isInvalid={!!errors.items?.[index]?.size}>
            <FormLabel>{t('order:itemSize')}</FormLabel>
            <Controller
              name={`items[${index}].size`}
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder={t('order:itemSizePlaceholder')}
                  onChange={(e) => {
                    field.onChange(e);
                    setItems((prev: Item[]) => {
                      const newItems = [...prev];
                      newItems[index] = { ...newItems[index], size: e.target.value };
                      return newItems;
                    });
                  }}
                >
                  <option value="small">{t('order:small')}</option>
                  <option value="medium">{t('order:medium')}</option>
                  <option value="large">{t('order:large')}</option>
                  <option value="x-large">{t('order:xLarge')}</option>
                </Select>
              )}
            />
            <FormErrorMessage>{errors.items?.[index]?.size?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.items?.[index]?.quantity}>
            <FormLabel>{t('order:quantity')}</FormLabel>
            <Controller
              name={`items[${index}].quantity`}
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  value={field.value || 1}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                    setItems((prev: Item[]) => {
                      const newItems = [...prev];
                      newItems[index] = { ...newItems[index], quantity: Number(e.target.value) };
                      return newItems;
                    });
                  }}
                  min={1}
                />
              )}
            />
            <FormErrorMessage>{errors.items?.[index]?.quantity?.message}</FormErrorMessage>
          </FormControl>
          <Button colorScheme="red" variant="outline" onClick={() => onRemove(index)} mt={8}>
            {t('order:remove')}
          </Button>
        </SimpleGrid>
      ))}
      <Button colorScheme="blue" leftIcon={<FiPackage />} onClick={handleAddItem}>
        {t('order:addItem')}
      </Button>
    </Box>
  );
};

// ReviewStep component
const ReviewStep: React.FC<{ data: FormData; totalPrice: number; t: any; locale: string }> = ({
  data,
  totalPrice,
  t,
  locale = 'en',
}) => {
  const getDateLocale = (locale: string): Locale => (locale === 'ar' ? arLocale : enGBLocale);
  return (
    <VStack spacing={4} w="full">
      <Heading size="md">{t('order:reviewOrder')}</Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} minChildWidth="150px" w="full">
        <Text lineHeight="1.6" maxWidth="100%" overflowWrap="break-word">
          <strong>{t('order:firstName')}:</strong> {data.firstName}
        </Text>
        <Text lineHeight="1.6" maxWidth="100%" overflowWrap="break-word">
          <strong>{t('order:lastName')}:</strong> {data.lastName}
        </Text>
        <Text lineHeight="1.6" maxWidth="100%" overflowWrap="break-word">
          <strong>{t('order:phoneNumber')}:</strong> {data.phoneNumber}
        </Text>
        <Text lineHeight="1.6" maxWidth="100%" overflowWrap="break-word">
          <strong>{t('order:email')}:</strong> {data.email}
        </Text>
        <Text lineHeight="1.6" maxWidth="100%" overflowWrap="break-word">
          <strong>{t('order:pickupAddress')}:</strong> {data.pickupAddress}
        </Text>
        <Text lineHeight="1.6" maxWidth="100%" overflowWrap="break-word">
          <strong>{t('order:dropoffAddress')}:</strong> {data.dropoffAddress}
        </Text>
        <Text lineHeight="1.6" maxWidth="100%" overflowWrap="break-word">
          <strong>{t('order:pickupBuildingType')}:</strong> {data.pickupBuildingType || t('order:notSpecified')}
        </Text>
        <Text lineHeight="1.6" maxWidth="100%" overflowWrap="break-word">
          <strong>{t('order:dropoffBuildingType')}:</strong> {data.dropoffBuildingType || t('order:notSpecified')}
        </Text>
        <Text lineHeight="1.6" maxWidth="100%" overflowWrap="break-word">
          <strong>{t('order:serviceType')}:</strong> {data.serviceType}
        </Text>
        <Text lineHeight="1.6" maxWidth="100%" overflowWrap="break-word">
          <strong>{t('order:pickupDateTime')}:</strong>{' '}
          {format(new Date(data.pickupDateTime), 'dd/MM/yyyy HH:mm', { locale: getDateLocale(locale) })}
        </Text>
        <Text lineHeight="1.6" maxWidth="100%" overflowWrap="break-word">
          <strong>{t('order:flexibleTime')}:</strong> {data.flexibleTime ? t('order:yes') : t('order:no')}
        </Text>
        <Text lineHeight="1.6" maxWidth="100%" overflowWrap="break-word">
          <strong>{t('order:totalPrice')}:</strong> £{totalPrice.toFixed(2)}
        </Text>
      </SimpleGrid>
      <Text fontWeight="bold" lineHeight="1.6">{t('order:items')}:</Text>
      {data.items?.map((item: Item, index: number) => (
        <Text key={index} lineHeight="1.6" maxWidth="100%" overflowWrap="break-word">
          {item.quantity} x {item.isCustom ? item.customName : item.type} ({item.size})
        </Text>
      ))}
      {data.pickupDriverNotes && (
        <Text lineHeight="1.6" maxWidth="100%" overflowWrap="break-word">
          <strong>{t('order:pickupDriverNotes')}:</strong> {data.pickupDriverNotes}
        </Text>
      )}
      {data.dropoffDriverNotes && (
        <Text lineHeight="1.6" maxWidth="100%" overflowWrap="break-word">
          <strong>{t('order:dropoffDriverNotes')}:</strong> {data.dropoffDriverNotes}
        </Text>
      )}
    </VStack>
  );
};

// Stripe initialization
if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined');
}
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

// Service type suggestion
const suggestServiceType = (items: Item[]): string => {
  const totalItems = items.reduce((sum: number, item: Item) => sum + item.quantity, 0);
  const hasLargeItems = items.some((item: Item) => item.size === 'large' || item.size === 'x-large');
  return totalItems > 5 || hasLargeItems ? 'twoMenWithVan' : 'manWithVan';
};

// Price calculation
const calculatePrice = async ({
  distance,
  items,
  serviceType,
  flexibleTime,
}: {
  distance: number;
  items: Item[];
  serviceType: string;
  flexibleTime: boolean;
}) => {
  if (distance <= 0 || isNaN(distance)) {
    throw new Error('Invalid distance');
  }

  const basePrice = 20;
  const distanceCost = distance * 0.5;

  const itemCost = items.reduce((total: number, item: Item) => {
    if (!item.type || !item.size) return total;
    const itemPrices: Record<string, Record<string, number>> = {
      chair: { small: 5, medium: 10, large: 15, 'x-large': 20 },
      bed: { small: 20, medium: 30, large: 40, 'x-large': 50 },
      box: { small: 5, medium: 10, large: 15, 'x-large': 20 },
      fridge: { small: 30, medium: 40, large: 50, 'x-large': 60 },
      washingMachine: { small: 25, medium: 35, large: 45, 'x-large': 55 },
      tv: { small: 15, medium: 25, large: 35, 'x-large': 45 },
      fan: { small: 5, medium: 10, large: 15, 'x-large': 20 },
      sofa: { small: 30, medium: 45, large: 60, 'x-large': 75 },
      custom: { small: 10, medium: 20, large: 30, 'x-large': 40 },
    };

    const price = itemPrices[item.type]?.[item.size] || 0;
    return total + price * item.quantity;
  }, 0);

  const workerCost = serviceType === 'twoMenWithVan' ? 20 : 0;
  let total = basePrice + distanceCost + itemCost + workerCost;

  if (flexibleTime) {
    total *= 0.95; // 5% discount
  }

  return {
    total,
    details: {
      basePrice,
      distanceCost,
      itemCost,
      workerCost,
    },
  };
};

// Logo component
const Logo: React.FC = () => (
  <Box mb={4}>
    <Image src="/logo.png" alt="Speedy Van Logo" height="50px" cursor="pointer" onClick={() => (window.location.href = '/')} />
  </Box>
);

// Main BookOrder component
const BookOrder: React.FC = () => {
  const { t } = useTranslation(['common', 'order']);
  const router = useRouter();
  const { locale } = router;
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState<{ total: number; details: any }>({ total: 0, details: null });
  const [items, setItems] = useState<Item[]>([{ type: '', size: '', quantity: 1, isCustom: false }]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [orderId] = useState(uuidv4());
  const [orderNumber] = useState(generateOrderNumber());
  const [orderStatus, setOrderStatus] = useState<'pending' | 'paid' | 'delivered' | 'canceled'>('pending');
  const [coupon, setCoupon] = useState('');
  const [isCouponValidating, setIsCouponValidating] = useState(false);
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<any[]>([]);
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<[number, number] | null>(null);
  const [isFetchingPickup, setIsFetchingPickup] = useState(false);
  const [isFetchingDropoff, setIsFetchingDropoff] = useState(false);
  const [isRemoveItemModalOpen, setIsRemoveItemModalOpen] = useState(false);
  const [isRemoveImageModalOpen, setIsRemoveImageModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<number | null>(null);
  const [imageToRemove, setImageToRemove] = useState<number | null>(null);
  const [isPaymentConfirmOpen, setIsPaymentConfirmOpen] = useState(false);
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const dropoffInputRef = useRef<HTMLInputElement>(null);
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  const steps = useMemo(() => STEPS(t), [t]);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    getValues,
    reset,
    trigger,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      pickupAddress: '',
      pickupFloor: '',
      pickupLift: false,
      pickupBuildingType: '',
      pickupDriverNotes: '',
      dropoffAddress: '',
      dropoffFloor: '',
      dropoffLift: false,
      dropoffBuildingType: '',
      dropoffDriverNotes: '',
      serviceType: 'manWithVan',
      description: '',
      pickupDateTime: '',
      flexibleTime: false,
      items: [{ type: '', size: '', quantity: 1, isCustom: false }],
      images: [],
      status: 'pending',
      coupon: '',
      termsAccepted: false,
    },
  });

  const pickupAddress = watch('pickupAddress');
  const dropoffAddress = watch('dropoffAddress');
  const serviceType = watch('serviceType');
  const itemsField = watch('items');
  const flexibleTime = watch('flexibleTime');
  const couponField = watch('coupon');

  // Sync items state with form
  useEffect(() => {
    setValue('items', items);
  }, [items, setValue]);

  const fetchAddressSuggestions = useCallback(
    async (query: string, type: 'pickup' | 'dropoff') => {
      if (!query || query.length < 3) {
        type === 'pickup' ? setPickupSuggestions([]) : setDropoffSuggestions([]);
        type === 'pickup' ? setIsFetchingPickup(false) : setIsFetchingDropoff(false);
        return;
      }

      try {
        type === 'pickup' ? setIsFetchingPickup(true) : setIsFetchingDropoff(true);
        const response = await geocodingService
          .forwardGeocode({
            query,
            countries: ['gb'],
            limit: 5,
          })
          .send();

        const suggestions = response.body.features;
        type === 'pickup' ? setPickupSuggestions(suggestions) : setDropoffSuggestions(suggestions);
      } catch (error: any) {
        handleError(toast, logger, t('order:addressSuggestionError'), error.message);
      } finally {
        type === 'pickup' ? setIsFetchingPickup(false) : setIsFetchingDropoff(false);
      }
    },
    [toast, t]
  );

  const debouncedFetchSuggestions = useMemo(
    () => debounce((query: string, type: 'pickup' | 'dropoff') => fetchAddressSuggestions(query, type), 500),
    [fetchAddressSuggestions]
  );

  useEffect(() => {
    debouncedFetchSuggestions(pickupAddress, 'pickup');
    return () => debouncedFetchSuggestions.cancel();
  }, [pickupAddress, debouncedFetchSuggestions]);

  useEffect(() => {
    debouncedFetchSuggestions(dropoffAddress, 'dropoff');
    return () => debouncedFetchSuggestions.cancel();
  }, [dropoffAddress, debouncedFetchSuggestions]);

  const handleAddressSelect = useCallback(
    async (feature: any, type: 'pickup' | 'dropoff') => {
      const address = feature.place_name;
      const coords = feature.center as [number, number];
      const placeName = feature.place_name.toLowerCase();

      if (type === 'pickup') {
        setValue('pickupAddress', address);
        setPickupCoords(coords);
        setPickupSuggestions([]);
        if (placeName.includes('flat') || placeName.includes('apartment')) {
          const match = placeName.match(/flat\s*(\d+)/i);
          if (match) setValue('pickupFloor', match[1]);
          setValue('pickupBuildingType', 'flat');
        } else if (placeName.includes('house')) {
          setValue('pickupBuildingType', 'house');
        } else if (placeName.includes('office')) {
          setValue('pickupBuildingType', 'office');
        }
        trigger(['pickupAddress', 'pickupFloor']);
      } else {
        setValue('dropoffAddress', address);
        setDropoffCoords(coords);
        setDropoffSuggestions([]);
        if (placeName.includes('flat') || placeName.includes('apartment')) {
          const match = placeName.match(/flat\s*(\d+)/i);
          if (match) setValue('dropoffFloor', match[1]);
          setValue('dropoffBuildingType', 'flat');
        } else if (placeName.includes('house')) {
          setValue('dropoffBuildingType', 'house');
        } else if (placeName.includes('office')) {
          setValue('dropoffBuildingType', 'office');
        }
        trigger(['dropoffAddress', 'dropoffFloor']);
      }
    },
    [setValue, trigger]
  );

  const clearPickupAddress = useCallback(() => {
    setValue('pickupAddress', '');
    setPickupCoords(null);
    setPickupSuggestions([]);
    setValue('pickupFloor', '');
    setValue('pickupBuildingType', '');
  }, [setValue]);

  const clearDropoffAddress = useCallback(() => {
    setValue('dropoffAddress', '');
    setDropoffCoords(null);
    setDropoffSuggestions([]);
    setValue('dropoffFloor', '');
    setValue('dropoffBuildingType', '');
  }, [setValue]);

  const calculateDistance = useCallback(async () => {
    if (!pickupCoords || !dropoffCoords) {
      console.log('Missing coordinates for distance calculation');
      throw new Error('Coordinates not available');
    }

    try {
      console.log('Fetching directions from Mapbox API');
      const response = await directionsService
        .getDirections({
          profile: 'driving',
          waypoints: [{ coordinates: pickupCoords }, { coordinates: dropoffCoords }],
          geometries: 'geojson',
        })
        .send();

      const route = response.body.routes[0];
      if (!route || !route.distance) {
        console.log('No valid route found');
        throw new Error('No valid route found');
      }

      const distanceMiles = (route.distance / 1000) * 0.621371; // Convert meters to miles
      console.log('Calculated Distance (miles):', distanceMiles);
      return distanceMiles;
    } catch (error: any) {
      console.log('Directions API error:', error.message);
      handleError(toast, logger, t('order:routeError'), t('order:noRouteFound'));
      throw error;
    }
  }, [pickupCoords, dropoffCoords, toast, t]);

  const debouncedSaveDraft = useMemo(
    () =>
      debounce(async (data: FormData) => {
        try {
          await setDoc(doc(db, 'drafts', orderId), { ...data, orderId, orderNumber });
          toast({
            title: t('order:draftSaved'),
            status: 'success',
            duration: 2000,
            isClosable: true,
          });
        } catch (error: any) {
          handleError(toast, logger, t('order:draftSaveError'), error.message);
        }
      }, 1000),
    [toast, t, orderId, orderNumber]
  );

  useEffect(() => {
    const formData = watch();
    debouncedSaveDraft(formData);
    return () => debouncedSaveDraft.cancel();
  }, [watch, debouncedSaveDraft]);

  const debouncedValidateCoupon = useMemo(
    () =>
      debounce(async (code: string) => {
        if (!code || isCouponApplied) return;
        setIsCouponValidating(true);
        try {
          const response = await fetch('/api/validate-coupon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coupon: code }),
          });
          const result = await response.json();
          if (result.valid) {
            setTotalPrice((prev) => ({
              total: prev.total * (1 - result.discount),
              details: prev.details,
            }));
            setValue('coupon', code);
            setIsCouponApplied(true);
            handleError(
              toast,
              logger,
              t('order:couponApplied'),
              t('order:couponAppliedMessage', { amount: (totalPrice.total * result.discount).toFixed(2) }),
              'success'
            );
          } else {
            setValue('coupon', '');
            setCoupon('');
            handleError(toast, logger, t('order:invalidCoupon'), t('order:invalidCouponMessage'));
          }
        } catch (error: any) {
          handleError(toast, logger, t('order:couponError'), error.message);
        } finally {
          setIsCouponValidating(false);
        }
      }, 500),
    [toast, t, totalPrice, setValue, isCouponApplied]
  );

  useEffect(() => {
    if (couponField) {
      debouncedValidateCoupon(couponField);
    }
    return () => debouncedValidateCoupon.cancel();
  }, [couponField, debouncedValidateCoupon]);

  useEffect(() => {
    if (itemsField && itemsField.length > 0) {
      const suggestedService = suggestServiceType(itemsField);
      setValue('serviceType', suggestedService);
      handleError(toast, logger, t('order:serviceSuggestion'), t(`order:${suggestedService}`), 'info');
    }
  }, [itemsField, setValue, toast, t]);

  const calculateDistanceAndPrice = useCallback(
    async () => {
      try {
        console.log('Distance Calculation Triggered');
        console.log('Pickup Coords:', pickupCoords);
        console.log('Dropoff Coords:', dropoffCoords);
        console.log('Service Type:', serviceType);
        console.log('Items:', itemsField);
        console.log('Flexible Time:', flexibleTime);

        if (!pickupCoords || !dropoffCoords || !serviceType) {
          console.log('Missing required inputs for price calculation');
          setTotalPrice({ total: 0, details: null });
          return;
        }

        const distance = await calculateDistance();
        if (!distance) {
          console.log('Distance calculation returned null');
          setTotalPrice({ total: 0, details: null });
          return;
        }

        const price = await calculatePrice({ distance, items: itemsField || [], serviceType, flexibleTime });
        console.log('Calculated Price:', price);

        if (!price.total || price.total <= 0) {
          console.log('Invalid price calculated');
          throw new Error('Invalid price calculated');
        }

        setTotalPrice(price);
      } catch (error: any) {
        console.log('Price calculation error:', error.message);
        handleError(toast, logger, t('order:errorMessage'), t('order:priceCalculationError', { error: error.message }));
        setTotalPrice({ total: 0, details: null });
      }
    },
    [itemsField, serviceType, pickupCoords, dropoffCoords, flexibleTime, toast, t, calculateDistance]
  );

  const debouncedCalculateDistanceAndPrice = useMemo(
    () => debounce(calculateDistanceAndPrice, 500),
    [calculateDistanceAndPrice]
  );

  useEffect(() => {
    if (pickupCoords && dropoffCoords && serviceType) {
      console.log('Triggering price calculation');
      debouncedCalculateDistanceAndPrice();
    }
  }, [pickupCoords, dropoffCoords, serviceType, itemsField, flexibleTime, debouncedCalculateDistanceAndPrice]);

  const handleRemoveItem = useCallback((index: number) => {
    setItemToRemove(index);
    setIsRemoveItemModalOpen(true);
  }, []);

  const confirmRemoveItem = useCallback(() => {
    if (itemToRemove !== null) {
      const newItems = items.filter((_: Item, i: number) => i !== itemToRemove);
      setItems(newItems);
      setValue('items', newItems);
      setIsRemoveItemModalOpen(false);
      setItemToRemove(null);
    }
  }, [itemToRemove, items, setValue]);

  const handleRemoveImage = useCallback((index: number) => {
    setImageToRemove(index);
    setIsRemoveImageModalOpen(true);
  }, []);

  const confirmRemoveImage = useCallback(() => {
    if (imageToRemove !== null) {
      const urlToRevoke = imageUrls[imageToRemove];
      if (urlToRevoke) {
        URL.revokeObjectURL(urlToRevoke);
      }
      const newImages = images.filter((_: File, i: number) => i !== imageToRemove);
      const newImageUrls = imageUrls.filter((_: string, i: number) => i !== imageToRemove);
      setImages(newImages);
      setImageUrls(newImageUrls);
      setValue('images', newImages);   
      setIsRemoveImageModalOpen(false);
      setImageToRemove(null);
    }
  }, [imageToRemove, images, imageUrls, setValue]);  

  useEffect(() => {
    return () => {
      imageUrls.forEach((url: string) => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  const onSubmit = useCallback(async (data: FormData) => {
    setIsPaymentConfirmOpen(true);
  }, []);

  const confirmPayment = useCallback(async () => {
    setIsLoading(true);
    setIsPaymentConfirmOpen(false);
    try {
      const data = getValues();
      const orderData = {
        ...data,
        totalPrice: totalPrice.total,
        locale: router.locale,
        items,
        images: images.map((file: File) => file.name),
        status: 'pending',
        orderId,
        orderNumber,
        pickupCoords,
        dropoffCoords,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'orders', orderId), orderData);

      if (!totalPrice.total || totalPrice.total <= 0) {
        throw new Error('Invalid total price.');
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe not initialized.');
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(totalPrice.total * 100),
          currency: 'gbp',
          orderData,
        }),
      });

      const session = await response.json();
      if (!response.ok) {
        throw new Error(session.message || 'Failed to create checkout session');
      }

      const result = await stripe.redirectToCheckout({ sessionId: session.id });
      if (result.error) {
        throw new Error(result.error.message);
      }

      setOrderStatus('paid');

      await Promise.all([
        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        }),
        fetch('/api/send-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        }),
        fetch('/api/send-admin-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'ahmadalwaki76@gmail.com',
            subject: `New Order: ${orderNumber}`,
            orderData,
          }),
        }),
      ]);

      router.push('/rating');
    } catch (error: any) {
      if (error.message.includes('rate-limited')) {
        handleError(toast, logger, t('order:errorMessage'), t('order:tooManyRequests'));
      } else {
        handleError(toast, logger, t('order:errorMessage'), t('order:submissionError', { error: error.message }));
      }
    } finally {
      setIsLoading(false);
    }
  }, [getValues, totalPrice, router, items, images, orderId, orderNumber, pickupCoords, dropoffCoords, toast, t]);

  const handleApplyCoupon = useCallback(async () => {
    if (isCouponApplied) {
      handleError(toast, logger, t('order:couponError'), t('order:couponAlreadyApplied'));
      return;
    }
    debouncedValidateCoupon(coupon);
  }, [coupon, debouncedValidateCoupon, isCouponApplied, toast, t]);

  const validateStep = useCallback(
    async (step: number) => {
      const fieldsToValidate: FormFieldNames[] = ({
        0: ['firstName', 'lastName', 'phoneNumber', 'email'],
        1: ['pickupAddress', 'pickupFloor', 'dropoffAddress', 'dropoffFloor'],
        2: ['serviceType', 'pickupDateTime', 'items'],
        3: [],
        4: ['termsAccepted'],
      } as Record<number, FormFieldNames[]>)[step] || [];

      const isValid = await trigger(fieldsToValidate);
      if (!isValid) {
        handleError(toast, logger, t('order:validationError'), t('order:completeFields'));
      } else {
        debouncedSaveDraft(getValues());
      }
      return isValid;
    },
    [toast, t, trigger, debouncedSaveDraft, getValues]
  );

  const handleNextStep = useCallback(async () => {
    if (await validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  }, [validateStep, currentStep, steps.length]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxFiles: 5,
    onDrop: (acceptedFiles: File[]) => {
      const newImages = [...images, ...acceptedFiles].slice(0, 5);
      const newUrls = acceptedFiles.map((file: File) => URL.createObjectURL(file));
      setImages(newImages);
      setImageUrls((prev: string[]) => [...prev, ...newUrls].slice(0, 5));
      setValue('images', newImages);
    },
  });

  return (
    <Box minH="100vh" p={4} bg={bgColor} dir={router.locale === 'ar' ? 'rtl' : 'ltr'}>
      <Logo />
      <motion.a
        href="tel:+447901846297"
        whileTap={{ scale: 0.95 }}
        style={{ display: 'inline-block' }}
      >
        <Button
          colorScheme="blue"
          leftIcon={<FiPhone />}
          mb={4}
          display={{ base: 'block', md: 'none' }}
        >
          {t('common:contactUs')}
        </Button>
      </motion.a>
      <motion.div whileTap={{ scale: 0.95 }}>
        <Button
          onClick={() => router.push('/')}
          variant="outline"
          colorScheme="blue"
          mb={4}
          leftIcon={<FiArrowLeft />}
          alignSelf={router.locale === 'ar' ? 'flex-end' : 'flex-start'}
        >
          {t('common:back')}
        </Button>
      </motion.div>
      <VStack spacing={8} maxW="3xl" mx="auto">
        <Heading size="lg" color={textColor}>
          {t('order:bookOrderTitle')} ({orderNumber})
        </Heading>
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={2} lineHeight="1.6">
            {t('order:orderStatus')}
          </Text>
          <OrderStatusBadge status={orderStatus} />
        </Box>
        <Text fontSize="md" color="gray.500" lineHeight="1.6">
          {t('order:totalPrice')}: £{(totalPrice.total || 0).toFixed(2)}
        </Text>
        {totalPrice.details && (
          <Accordion allowToggle w="full">
            <AccordionItem>
              <AccordionButton>{t('order:viewPriceDetails')}</AccordionButton>
              <AccordionPanel>
                <VStack>
                  <Text lineHeight="1.6">{t('order:basePrice')}: £{(totalPrice.details.basePrice || 0).toFixed(2)}</Text>
                  <Text lineHeight="1.6">{t('order:distanceCost')}: £{(totalPrice.details.distanceCost || 0).toFixed(2)}</Text>
                  <Text lineHeight="1.6">{t('order:itemCost')}: £{(totalPrice.details.itemCost || 0).toFixed(2)}</Text>
                  <Text lineHeight="1.6">{t('order:workerCost')}: £{(totalPrice.details.workerCost || 0).toFixed(2)}</Text>
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        )}
        <Stepper
          index={currentStep}
          colorScheme="blue"
          size="lg"
          gap={{ base: '2', md: '4' }}
          mb={6}
          sx={{
            '.chakra-step__title': {
              fontSize: { base: 'md', md: 'lg' },
              fontWeight: 'bold',
              mb: 2,
              textAlign: locale === 'ar' ? 'right' : 'left',
            },
            '.chakra-step__description': {
              fontSize: { base: 'sm', md: 'md' },
              color: 'gray.500',
              lineHeight: '1.6',
              textAlign: locale === 'ar' ? 'right' : 'left',
            },
            '.chakra-step': {
              flexDirection: 'column',
              alignItems: locale === 'ar' ? 'flex-end' : 'flex-start',
              mb: { base: 4, md: 0 },
            },
            '.chakra-step__separator': {
              display: { base: 'none', md: 'block' },
            },
          }}
        >
          {steps.map((step: { title: string; description: string }, index: number) => (
            <Step key={index}>
              <StepIndicator>
                <StepStatus complete={<Text>✓</Text>} incomplete={<Text>{index + 1}</Text>} active={<Text>{index + 1}</Text>} />
              </StepIndicator>
              <Box flexShrink={0} maxWidth="200px">
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </Box>
              <StepSeparator />
            </Step>
          ))}
        </Stepper>
        {currentStep >= 1 && (
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              colorScheme="blue"
              variant="outline"
              leftIcon={<FiMap />}
              onClick={() => setShowMap(!showMap)}
              mb={4}
            >
              {showMap ? t('order:hideMap') : t('order:showMap')}
            </Button>
          </motion.div>
        )}
        {showMap && pickupCoords && dropoffCoords && currentStep >= 1 && (
          <Box w="full" h="400px" mb={6}>
            <MapboxMap pickupCoords={pickupCoords} dropoffCoords={dropoffCoords} />
          </Box>
        )}
        <Box w="full" bg={bgColor} borderRadius="xl" boxShadow="lg" p={8}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                style={{ minHeight: '400px' }}
              >
                <VStack spacing={6}>
                  {currentStep === 0 && (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} minChildWidth="150px" w="full">
                      <FormControl isInvalid={!!errors.firstName}>
                        <FormLabel>{t('order:firstName')}</FormLabel>
                        <Controller name="firstName" control={control} render={({ field }) => <Input {...field} css={{ overflowWrap: 'break-word' }} />} />
                        <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
                      </FormControl>
                      <FormControl isInvalid={!!errors.lastName}>
                        <FormLabel>{t('order:lastName')}</FormLabel>
                        <Controller name="lastName" control={control} render={({ field }) => <Input {...field} css={{ overflowWrap: 'break-word' }} />} />
                        <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
                      </FormControl>
                      <FormControl isInvalid={!!errors.phoneNumber}>
                        <FormLabel>{t('order:phoneNumber')}</FormLabel>
                        <Controller
                          name="phoneNumber"
                          control={control}
                          render={({ field }) => (
                            <PhoneInput
                              country={'gb'}
                              value={field.value}
                              onChange={(phone: string) => field.onChange(`+${phone}`)}
                              inputStyle={{ width: '100%' }}
                            />
                          )}
                        />
                        <FormErrorMessage>{errors.phoneNumber?.message}</FormErrorMessage>
                      </FormControl>
                      <FormControl isInvalid={!!errors.email}>
                        <FormLabel>{t('order:email')}</FormLabel>
                        <Controller name="email" control={control} render={({ field }) => <Input {...field} css={{ overflowWrap: 'break-word' }} />} />
                        <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                      </FormControl>
                    </SimpleGrid>
                  )}
                  {currentStep === 1 && (
                    <>
                      <FormControl isInvalid={!!errors.pickupAddress}>
                        <FormLabel>{t('order:pickupAddress')}</FormLabel>
                        <InputGroup>
                          <Controller
                            name="pickupAddress"
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                ref={pickupInputRef}
                                placeholder={t('order:enterPickupAddressManually')}
                                onChange={(e) => field.onChange(e)}
                                css={{ overflowWrap: 'break-word' }}
                              />
                            )}
                          />
                          <InputRightElement>
                            {isFetchingPickup ? (
                              <Spinner size="sm" />
                            ) : pickupAddress ? (
                              <IconButton
                                aria-label="Clear pickup address"
                                icon={<FiX />}
                                size="sm"
                                onClick={clearPickupAddress}
                              />
                            ) : (
                              <FiMap />
                            )}
                          </InputRightElement>
                        </InputGroup>
                        {pickupSuggestions?.length > 0 && (
                          <List bg={bgColor} borderRadius="md" boxShadow="md" mt={2} maxH="200px" overflowY="auto">
                            {pickupSuggestions.map((feature: any) => (
                              <ListItem
                                key={feature.id}
                                p={2}
                                cursor="pointer"
                                _hover={{ bg: 'gray.100' }}
                                onClick={() => handleAddressSelect(feature, 'pickup')}
                              >
                                {feature.place_name}
                              </ListItem>
                            ))}
                          </List>
                        )}
                        <FormErrorMessage>{errors.pickupAddress?.message}</FormErrorMessage>
                      </FormControl>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} minChildWidth="150px" w="full">
                        <FormControl isInvalid={!!errors.pickupFloor}>
                          <FormLabel>{t('order:pickupFloor')}</FormLabel>
                          <Controller name="pickupFloor" control={control} render={({ field }) => <Input {...field} css={{ overflowWrap: 'break-word' }} />} />
                          <FormErrorMessage>{errors.pickupFloor?.message}</FormErrorMessage>
                        </FormControl>
                        <FormControl>
                          <FormLabel>{t('order:pickupLift')}</FormLabel>
                          <Controller
                            name="pickupLift"
                            control={control}
                            render={({ field: { onChange, value, ...rest } }) => (
                              <Checkbox {...rest} isChecked={value} onChange={onChange} />
                            )}
                          />
                        </FormControl>
                      </SimpleGrid>
                      <FormControl>
                        <FormLabel>{t('order:pickupBuildingType')}</FormLabel>
                        <Controller
                          name="pickupBuildingType"
                          control={control}
                          render={({ field }) => (
                            <Select {...field} placeholder={t('order:buildingTypePlaceholder')}>
                              <option value="flat">{t('order:flat')}</option>
                              <option value="house">{t('order:house')}</option>
                              <option value="office">{t('order:office')}</option>
                            </Select>
                          )}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>{t('order:pickupDriverNotes')}</FormLabel>
                        <Controller
                          name="pickupDriverNotes"
                          control={control}
                          render={({ field }) => <Textarea {...field} placeholder={t('order:driverNotesPlaceholder')} css={{ overflowWrap: 'break-word' }} />}
                        />
                      </FormControl>
                      <FormControl isInvalid={!!errors.dropoffAddress}>
                        <FormLabel>{t('order:dropoffAddress')}</FormLabel>
                        <InputGroup>
                          <Controller
                            name="dropoffAddress"
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                ref={dropoffInputRef}
                                placeholder={t('order:enterDropoffAddressManually')}
                                onChange={(e) => field.onChange(e)}
                                css={{ overflowWrap: 'break-word' }}
                              />
                            )}
                          />
                          <InputRightElement>
                            {isFetchingDropoff ? (
                              <Spinner size="sm" />
                            ) : dropoffAddress ? (
                              <IconButton
                                aria-label="Clear dropoff address"
                                icon={<FiX />}
                                size="sm"
                                onClick={clearDropoffAddress}
                              />
                            ) : (
                              <FiMap />
                            )}
                          </InputRightElement>
                        </InputGroup>
                        {dropoffSuggestions?.length > 0 && (
                          <List bg={bgColor} borderRadius="md" boxShadow="md" mt={2} maxH="200px" overflowY="auto">
                            {dropoffSuggestions.map((feature: any) => (
                              <ListItem
                                key={feature.id}
                                p={2}
                                cursor="pointer"
                                _hover={{ bg: 'gray.100' }}
                                onClick={() => handleAddressSelect(feature, 'dropoff')}
                              >
                                {feature.place_name}
                              </ListItem>
                            ))}
                          </List>
                        )}
                        <FormErrorMessage>{errors.dropoffAddress?.message}</FormErrorMessage>
                      </FormControl>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} minChildWidth="150px" w="full">
                        <FormControl isInvalid={!!errors.dropoffFloor}>
                          <FormLabel>{t('order:dropoffFloor')}</FormLabel>
                          <Controller name="dropoffFloor" control={control} render={({ field }) => <Input {...field} css={{ overflowWrap: 'break-word' }} />} />
                          <FormErrorMessage>{errors.dropoffFloor?.message}</FormErrorMessage>
                        </FormControl>
                        <FormControl>
                          <FormLabel>{t('order:dropoffLift')}</FormLabel>
                          <Controller
                            name="dropoffLift"
                            control={control}
                            render={({ field: { onChange, value, ...rest } }) => (
                              <Checkbox {...rest} isChecked={value} onChange={onChange} />
                            )}
                          />
                        </FormControl>
                      </SimpleGrid>
                      <FormControl>
                        <FormLabel>{t('order:dropoffBuildingType')}</FormLabel>
                        <Controller
                          name="dropoffBuildingType"
                          control={control}
                          render={({ field }) => (
                            <Select {...field} placeholder={t('order:buildingTypePlaceholder')}>
                              <option value="flat">{t('order:flat')}</option>
                              <option value="house">{t('order:house')}</option>
                              <option value="office">{t('order:office')}</option>
                            </Select>
                          )}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>{t('order:dropoffDriverNotes')}</FormLabel>
                        <Controller
                          name="dropoffDriverNotes"
                          control={control}
                          render={({ field }) => <Textarea {...field} placeholder={t('order:driverNotesPlaceholder')} css={{ overflowWrap: 'break-word' }} />}
                        />
                      </FormControl>
                    </>
                  )}
                  {currentStep === 2 && (
                    <>
                      <FormControl isInvalid={!!errors.serviceType}>
                        <FormLabel>{t('order:serviceType')}</FormLabel>
                        <Controller
                          name="serviceType"
                          control={control}
                          render={({ field }) => (
                            <Select {...field} placeholder={t('order:serviceTypePlaceholder')}>
                              <option value="manWithVan">{t('order:manWithVan')}</option>
                              <option value="twoMenWithVan">{t('order:twoMenWithVan')}</option>
                            </Select>
                          )}
                        />
                        <FormErrorMessage>{errors.serviceType?.message}</FormErrorMessage>
                      </FormControl>
                      <FormControl isInvalid={!!errors.pickupDateTime}>
                        <FormLabel>{t('order:pickupDateTime')}</FormLabel>
                        <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={2} minH="40px">
                          <Controller
                            name="pickupDateTime"
                            control={control}
                            render={({ field }) => (
                              <DatePicker
                                selected={field.value ? new Date(field.value) : null}
                                onChange={(date: Date | null) => field.onChange(date?.toISOString())}
                                minDate={new Date()}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={30}
                                dateFormat="dd/MM/yyyy HH:mm"
                                placeholderText={t('order:selectDateTime')}
                                className="chakra-input"
                                wrapperClassName="date-picker-wrapper"
                              />
                            )}
                          />
                        </Box>
                        <FormErrorMessage>{errors.pickupDateTime?.message}</FormErrorMessage>
                      </FormControl>
                      <FormControl>
                        <Controller
                          name="flexibleTime"
                          control={control}
                          render={({ field: { onChange, value, ...rest } }) => (
                            <Checkbox {...rest} isChecked={value} onChange={onChange}>
                              {t('order:flexibleTime')}
                            </Checkbox>
                          )}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>{t('order:description')}</FormLabel>
                        <Controller name="description" control={control} render={({ field }) => <Textarea {...field} css={{ overflowWrap: 'break-word' }} />} />
                      </FormControl>
                      <ItemsList
                        items={items}
                        errors={errors}
                        setItems={setItems}
                        control={control}
                        t={t}
                        onRemove={handleRemoveItem}
                      />
                      <FormControl>
                        <FormLabel>{t('order:images')}</FormLabel>
                        <Box
                          {...getRootProps()}
                          p={4}
                          border="2px dashed"
                          borderColor="gray.300"
                          borderRadius="lg"
                          textAlign="center"
                        >
                          <input {...getInputProps()} />
                          <Text lineHeight="1.6">{t('order:dropImages')}</Text>
                        </Box>
                        {images.length > 0 && (
                          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} minChildWidth="100px" mt={4}>
                            {images.map((file: File, index: number) => (
                              imageUrls[index] && (
                                <Box key={index} position="relative">
                                  <Image
                                    src={imageUrls[index]}
                                    alt={file.name}
                                    boxSize="100px"
                                    objectFit="cover"
                                    borderRadius="md"
                                  />
                                  <Button
                                    size="xs"
                                    colorScheme="red"
                                    position="absolute"
                                    top={1}
                                    right={1}
                                    onClick={() => handleRemoveImage(index)}
                                  >
                                    {t('order:remove')}
                                  </Button>
                                </Box>
                              )
                            ))}
                          </SimpleGrid>
                        )}
                      </FormControl>
                    </>
                  )}
                  {currentStep === 3 && <ReviewStep data={getValues()} totalPrice={totalPrice.total} t={t} locale={locale || 'en'} />}
                  {currentStep === 4 && (
                    <>
                      <FormControl isInvalid={!!errors.coupon}>
                        <FormLabel>{t('order:coupon')}</FormLabel>
                        <InputGroup>
                          <Input
                            value={coupon}
                            onChange={(e) => {
                              setCoupon(e.target.value);
                              setValue('coupon', e.target.value);
                            }}
                            isDisabled={isCouponValidating || isCouponApplied}
                            css={{ overflowWrap: 'break-word' }}
                          />
                          {isCouponValidating && <InputRightElement><Spinner size="sm" /></InputRightElement>}
                        </InputGroup>
                        <FormErrorMessage>{errors.coupon?.message}</FormErrorMessage>
                        <motion.div whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={handleApplyCoupon}
                            colorScheme="blue"
                            mt={2}
                            isDisabled={isCouponValidating || isCouponApplied}
                          >
                            {t('order:applyCoupon')}
                          </Button>
                        </motion.div>
                      </FormControl>
                      <Box w="full" textAlign="center">
                        <Text fontSize="xl" fontWeight="bold" color={textColor} mb={4} lineHeight="1.6">
                          {t('order:totalPrice')}: £{(totalPrice.total || 0).toFixed(2)}
                        </Text>
                        {totalPrice.details && (
                          <Accordion allowToggle w="full" mb={4}>
                            <AccordionItem>
                              <AccordionButton>{t('order:viewPriceDetails')}</AccordionButton>
                              <AccordionPanel>
                                <VStack>
                                  <Text lineHeight="1.6">{t('order:basePrice')}: £{(totalPrice.details.basePrice || 0).toFixed(2)}</Text>
                                  <Text lineHeight="1.6">{t('order:distanceCost')}: £{(totalPrice.details.distanceCost || 0).toFixed(2)}</Text>
                                  <Text lineHeight="1.6">{t('order:itemCost')}: £{(totalPrice.details.itemCost || 0).toFixed(2)}</Text>
                                  <Text lineHeight="1.6">{t('order:workerCost')}: £{(totalPrice.details.workerCost || 0).toFixed(2)}</Text>
                                </VStack>
                              </AccordionPanel>
                            </AccordionItem>
                          </Accordion>
                        )}
                        <Flex alignItems="center" justifyContent="center" direction="column" gap={4}>
                          <FormControl isInvalid={!!errors.termsAccepted} maxW="md">
                            <Flex alignItems="center" wrap="wrap" gap={2}>
                              <Controller
                                name="termsAccepted"
                                control={control}
                                render={({ field: { onChange, value, ...rest } }) => (
                                  <Checkbox {...rest} isChecked={value} onChange={onChange}>
                                    {t('order:termsAccept')}
                                  </Checkbox>
                                )}
                              />
                              <motion.a
                                href="/terms"
                                target="_blank"
                                whileTap={{ scale: 0.95 }}
                                style={{ color: '#3182CE' }}
                              >
                                {t('order:termsLink')}
                              </motion.a>
                            </Flex>
                            <FormErrorMessage>{errors.termsAccepted?.message}</FormErrorMessage>
                          </FormControl>
                          <motion.div whileTap={{ scale: 0.95 }}>
                            <Button
                              type="submit"
                              colorScheme="blue"
                              size="lg"
                              isDisabled={isLoading || totalPrice.total === 0 || !isValid}
                              isLoading={isLoading}
                              loadingText={t('order:processing')}
                              w="full"
                              maxW="md"
                              _hover={{ bg: 'blue.600', transform: 'scale(1.02)' }}
                            >
                              {t('order:proceedToPayment')}
                            </Button>
                          </motion.div>
                        </Flex>
                        <motion.div whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => reset()}
                            colorScheme="gray"
                            variant="outline"
                            size="lg"
                            mt={4}
                            w="full"
                            maxW="md"
                            _hover={{ bg: 'gray.200', transform: 'scale(1.02)' }}
                          >
                            {t('order:resetForm')}
                          </Button>
                        </motion.div>
                      </Box>
                    </>
                  )}
                  <Flex w="full" justify="space-between" position="sticky" bottom="0" bg={bgColor} p={4} zIndex={10}>
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                        isDisabled={currentStep === 0}
                        variant="outline"
                        colorScheme="blue"
                        _hover={{ bg: 'blue.100', transform: 'scale(1.02)' }}
                      >
                        {t('order:previous')}
                      </Button>
                    </motion.div>
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={handleNextStep}
                        isDisabled={currentStep === steps.length - 1}
                        colorScheme="blue"
                        _hover={{ bg: 'blue.600', transform: 'scale(1.02)' }}
                      >
                        {t('order:next')}
                      </Button>
                    </motion.div>
                  </Flex>
                </VStack>
              </motion.div>
            </AnimatePresence>
          </form>
        </Box>
      </VStack>
      <Box position="sticky" bottom="0" bg={bgColor} borderTop="1px solid" borderColor="gray.200" p={4}>
        <Flex justify="space-between" align="center">
          <Text fontWeight="bold" color={textColor} lineHeight="1.6">
            {t('order:totalPrice')}: £{(totalPrice.total || 0).toFixed(2)}
          </Text>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              colorScheme="blue"
              onClick={handleNextStep}
              isDisabled={currentStep === steps.length - 1}
              _hover={{ bg: 'blue.600', transform: 'scale(1.02)' }}
            >
              {t('order:next')}
            </Button>
          </motion.div>
        </Flex>
      </Box>

      <Modal isOpen={isRemoveItemModalOpen} onClose={() => setIsRemoveItemModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('order:confirmRemoveItem')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>{t('order:confirmRemoveItemMessage')}</ModalBody>
          <ModalFooter>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button colorScheme="gray" mr={3} onClick={() => setIsRemoveItemModalOpen(false)}>
                {t('order:cancel')}
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button colorScheme="red" onClick={confirmRemoveItem}>
                {t('order:remove')}
              </Button>
            </motion.div>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isRemoveImageModalOpen} onClose={() => setIsRemoveImageModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('order:confirmRemoveImage')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>{t('order:confirmRemoveImageMessage')}</ModalBody>
          <ModalFooter>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button colorScheme="gray" mr={3} onClick={() => setIsRemoveImageModalOpen(false)}>
                {t('order:cancel')}
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button colorScheme="red" onClick={confirmRemoveImage}>
                {t('order:remove')}
              </Button>
            </motion.div>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isPaymentConfirmOpen} onClose={() => setIsPaymentConfirmOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('order:confirmPayment')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>{t('order:confirmPaymentMessage')}</ModalBody>
          <ModalFooter>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button colorScheme="gray" mr={3} onClick={() => setIsPaymentConfirmOpen(false)}>
                {t('order:cancel')}
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button colorScheme="blue" onClick={confirmPayment}>
                {t('order:confirm')}
              </Button>
            </motion.div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BookOrder;