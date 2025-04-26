import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import Loader from '@/components/Loader';
import { Box, Text, Button } from '@chakra-ui/react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  const router = useRouter();
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    setUserFromToken,
    logout 
  } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      await setUserFromToken();
      
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
        } else if (requiredRoles && user && 'role' in user) {
          const hasRole = requiredRoles.includes(user.role as string);
          if (!hasRole) {
            router.push('/unauthorized');
          }
        }
      }
    };

    checkAuth();
  }, [isAuthenticated, isLoading, router, setUserFromToken, user, requiredRoles]);

  if (isLoading || !isAuthenticated) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Loader />
      </Box>
    );
  }

  if (requiredRoles && user && 'role' in user && !requiredRoles.includes(user.role as string)) {
    return (
      <Box textAlign="center" py={10} px={6}>
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Unauthorized Access
        </Text>
        <Text mb={4}>You don&apos;t have permission to view this page.</Text>
        <Button colorScheme="blue" onClick={() => router.push('/')}>
          Go to Home
        </Button>
        <Button ml={4} variant="outline" onClick={logout}>
          Logout
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;