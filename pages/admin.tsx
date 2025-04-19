import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  Badge,
  useColorModeValue,
  IconButton,
  Tooltip,
  useToast,
  Stack,
  HStack,
  VStack,
  Divider,
  Icon
} from '@chakra-ui/react';
import { SearchIcon, DownloadIcon, ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FiPrinter, FiEye, FiEdit, FiTrash2, FiFilter } from 'react-icons/fi';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// أنواع البيانات
interface Order {
  id: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  pickupAddress: string;
  dropoffAddress: string;
  items: Item[];
  serviceType: string;
  workers: number;
  totalPrice: number;
  status: 'pending' | 'paid' | 'onTheWay' | 'delivered' | 'cancelled';
  pickupDateTime: string;
  createdAt: string;
  adminNote?: string;
}

interface Item {
  type: string;
  size: string;
  quantity: number;
}

interface Coupon {
  code: string;
  discount: number;
  expiresAt: string;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  userEmail?: string;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation(['common', 'order', 'admin']);
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // حالات الطلبات
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  
  // حالات أكواد الخصم
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'coupons'>('orders');
  
  // عناصر التحكم في Modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // محاكاة جلب البيانات
  useEffect(() => {
    // بيانات الطلبات المزيفة
    const mockOrders: Order[] = [
      {
        id: '1',
        customer: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+447123456789'
        },
        pickupAddress: '123 Main St, London',
        dropoffAddress: '456 Park Ave, Manchester',
        items: [
          { type: 'chair', size: 'small', quantity: 2 },
          { type: 'box', size: 'medium', quantity: 5 }
        ],
        serviceType: 'twoMenWithVan',
        workers: 2,
        totalPrice: 120,
        status: 'paid',
        pickupDateTime: '2023-06-15T10:00:00Z',
        createdAt: '2023-06-10T14:30:00Z',
        adminNote: 'Customer requested early delivery'
      },
      {
        id: '2',
        customer: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+447987654321'
        },
        pickupAddress: '789 Oak St, Birmingham',
        dropoffAddress: '321 Pine St, Leeds',
        items: [
          { type: 'sofa', size: 'large', quantity: 1 }
        ],
        serviceType: 'manWithVan',
        workers: 1,
        totalPrice: 85,
        status: 'delivered',
        pickupDateTime: '2023-06-12T09:00:00Z',
        createdAt: '2023-06-05T11:20:00Z'
      }
    ];

    // بيانات أكواد الخصم المزيفة
    const mockCoupons: Coupon[] = [
      {
        code: 'SUMMER2023',
        discount: 0.15,
        expiresAt: '2023-08-31T23:59:59Z',
        maxUses: 100,
        usedCount: 42,
        isActive: true,
        createdAt: '2023-05-01T00:00:00Z'
      },
      {
        code: 'WELCOME10',
        discount: 0.10,
        expiresAt: '2023-12-31T23:59:59Z',
        userEmail: 'newuser@example.com',
        usedCount: 1,
        isActive: true,
        createdAt: '2023-06-01T00:00:00Z'
      }
    ];

    setOrders(mockOrders);
    setFilteredOrders(mockOrders);
    setCoupons(mockCoupons);
  }, []);

  // تصفية الطلبات
  useEffect(() => {
    let result = [...orders];
    
    // تصفية حسب حالة البحث
    if (searchTerm) {
      result = result.filter(order => 
        order.id.includes(searchTerm) ||
        order.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.phone.includes(searchTerm) ||
        order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // تصفية حسب الحالة
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // تصفية حسب التاريخ
    if (startDate && endDate) {
      result = result.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }
    
    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter, startDate, endDate]);

  // تغيير حالة الطلب
  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    
    toast({
      title: t('admin:statusUpdated'),
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // عرض تفاصيل الطلب
  const showOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    onOpen();
  };

  // إلغاء الطلب
  const cancelOrder = (orderId: string) => {
    if (window.confirm(t('admin:confirmCancel'))) {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: 'cancelled' } : order
        )
      );
      
      toast({
        title: t('admin:orderCancelled'),
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // تبديل حالة كود الخصم
  const toggleCoupon = (code: string) => {
    setCoupons(prevCoupons =>
      prevCoupons.map(coupon =>
        coupon.code === code ? { ...coupon, isActive: !coupon.isActive } : coupon
      )
    );
    
    toast({
      title: t('admin:couponUpdated'),
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // تصدير البيانات
  const exportData = (format: 'csv' | 'excel' | 'pdf') => {
    toast({
      title: t('admin:exportingData', { format }),
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
    // هنا يمكنك إضافة منطق التصدير الفعلي
  };

  return (
    <Box p={6} bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="xl">{t('admin:dashboard')}</Heading>
        <HStack spacing={4}>
          <Button 
            colorScheme={activeTab === 'orders' ? 'blue' : 'gray'} 
            onClick={() => setActiveTab('orders')}
          >
            {t('admin:orders')}
          </Button>
          <Button 
            colorScheme={activeTab === 'coupons' ? 'blue' : 'gray'} 
            onClick={() => setActiveTab('coupons')}
          >
            {t('admin:coupons')}
          </Button>
        </HStack>
      </Flex>

      {activeTab === 'orders' ? (
        <>
          {/* أدوات التحكم في الطلبات */}
          <Flex mb={6} gap={4} wrap="wrap">
            <InputGroup maxW="300px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder={t('admin:searchOrders')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <Select
              placeholder={t('admin:filterStatus')}
              w="200px"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">{t('admin:allStatuses')}</option>
              <option value="pending">{t('order:pending')}</option>
              <option value="paid">{t('order:paid')}</option>
              <option value="onTheWay">{t('order:onTheWay')}</option>
              <option value="delivered">{t('order:delivered')}</option>
              <option value="cancelled">{t('order:cancelled')}</option>
            </Select>

            <Box>
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                placeholderText={t('admin:selectDateRange')}
                isClearable={true}
                dateFormat="dd/MM/yyyy"
                className="date-picker"
              />
            </Box>

            <Button
              leftIcon={<DownloadIcon />}
              onClick={() => exportData('excel')}
              variant="outline"
            >
              {t('admin:export')}
            </Button>
          </Flex>

          {/* جدول الطلبات */}
          <Box bg={bgColor} borderRadius="lg" boxShadow="sm" overflow="hidden">
            <Table variant="simple">
              <Thead bg={useColorModeValue('blue.50', 'blue.900')}>
                <Tr>
                  <Th>{t('order:id')}</Th>
                  <Th>{t('order:customer')}</Th>
                  <Th>{t('order:serviceType')}</Th>
                  <Th>{t('order:totalPrice')}</Th>
                  <Th>{t('order:status')}</Th>
                  <Th>{t('order:createdAt')}</Th>
                  <Th>{t('admin:actions')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredOrders.map((order) => (
                  <Tr key={order.id}>
                    <Td>{order.id}</Td>
                    <Td>
                      {order.customer.firstName} {order.customer.lastName}
                      <Text fontSize="sm" color="gray.500">
                        {order.customer.phone}
                      </Text>
                    </Td>
                    <Td>{t(`order:${order.serviceType}`)}</Td>
                    <Td>£{order.totalPrice.toFixed(2)}</Td>
                    <Td>
                      <Select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                        size="sm"
                        variant="filled"
                      >
                        <option value="pending">{t('order:pending')}</option>
                        <option value="paid">{t('order:paid')}</option>
                        <option value="onTheWay">{t('order:onTheWay')}</option>
                        <option value="delivered">{t('order:delivered')}</option>
                        <option value="cancelled">{t('order:cancelled')}</option>
                      </Select>
                    </Td>
                    <Td>{new Date(order.createdAt).toLocaleDateString()}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Tooltip label={t('admin:viewDetails')}>
                          <IconButton
                            aria-label={t('admin:viewDetails')}
                            icon={<FiEye />}
                            size="sm"
                            onClick={() => showOrderDetails(order)}
                          />
                        </Tooltip>
                        <Tooltip label={t('admin:cancelOrder')}>
                          <IconButton
                            aria-label={t('admin:cancelOrder')}
                            icon={<FiTrash2 />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => cancelOrder(order.id)}
                            isDisabled={order.status === 'cancelled'}
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {/* تفاصيل الطلب في Modal */}
          <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                {t('admin:orderDetails')} #{selectedOrder?.id}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {selectedOrder && (
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Text fontWeight="bold">{t('order:customer')}</Text>
                      <Text>
                        {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                      </Text>
                      <Text>{selectedOrder.customer.email}</Text>
                      <Text>{selectedOrder.customer.phone}</Text>
                    </Box>

                    <Divider />

                    <Box>
                      <Text fontWeight="bold">{t('order:pickupAddress')}</Text>
                      <Text>{selectedOrder.pickupAddress}</Text>
                    </Box>

                    <Box>
                      <Text fontWeight="bold">{t('order:dropoffAddress')}</Text>
                      <Text>{selectedOrder.dropoffAddress}</Text>
                    </Box>

                    <Divider />

                    <Box>
                      <Text fontWeight="bold">{t('order:items')}</Text>
                      <VStack align="stretch" mt={2}>
                        {selectedOrder.items.map((item, index) => (
                          <HStack key={index} justify="space-between">
                            <Text>
                              {item.quantity}x {t(`order:${item.type}`)} ({t(`order:${item.size}`)})
                            </Text>
                            <Text>
                              £{(item.quantity * 10).toFixed(2)} {/* سعر تقديري */}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>

                    <Divider />

                    <Box>
                      <Text fontWeight="bold">{t('admin:adminNotes')}</Text>
                      <Text>
                        {selectedOrder.adminNote || t('admin:noNotes')}
                      </Text>
                    </Box>
                  </VStack>
                )}
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={onClose}>
                  {t('common:close')}
                </Button>
                <Button leftIcon={<FiPrinter />} variant="outline">
                  {t('admin:printInvoice')}
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      ) : (
        <>
          {/* إدارة أكواد الخصم */}
          <Flex mb={6} justify="space-between" align="center">
            <Heading size="md">{t('admin:couponManagement')}</Heading>
            <Button colorScheme="blue">
              {t('admin:addCoupon')}
            </Button>
          </Flex>

          <Box bg={bgColor} borderRadius="lg" boxShadow="sm" overflow="hidden">
            <Table variant="simple">
              <Thead bg={useColorModeValue('blue.50', 'blue.900')}>
                <Tr>
                  <Th>{t('admin:couponCode')}</Th>
                  <Th>{t('admin:discount')}</Th>
                  <Th>{t('admin:status')}</Th>
                  <Th>{t('admin:expiryDate')}</Th>
                  <Th>{t('admin:uses')}</Th>
                  <Th>{t('admin:actions')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {coupons.map((coupon) => (
                  <Tr key={coupon.code}>
                    <Td>
                      <Badge colorScheme="green" fontSize="sm">
                        {coupon.code}
                      </Badge>
                    </Td>
                    <Td>{(coupon.discount * 100)}%</Td>
                    <Td>
                      <Badge
                        colorScheme={coupon.isActive ? 'green' : 'red'}
                        fontSize="sm"
                      >
                        {coupon.isActive ? t('admin:active') : t('admin:inactive')}
                      </Badge>
                    </Td>
                    <Td>{new Date(coupon.expiresAt).toLocaleDateString()}</Td>
                    <Td>
                      {coupon.usedCount}
                      {coupon.maxUses && ` / ${coupon.maxUses}`}
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          onClick={() => toggleCoupon(coupon.code)}
                          colorScheme={coupon.isActive ? 'orange' : 'green'}
                        >
                          {coupon.isActive ? t('admin:deactivate') : t('admin:activate')}
                        </Button>
                        <IconButton
                          aria-label={t('admin:editCoupon')}
                          icon={<FiEdit />}
                          size="sm"
                          variant="ghost"
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </>
      )}
    </Box>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common', 'order', 'admin'])),
    },
  };
};

export default AdminDashboard;