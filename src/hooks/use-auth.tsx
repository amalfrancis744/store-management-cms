// hooks/use-auth.tsx
import { useAuth as useAuthContext } from '@/context/auth-context';

export const useAuth = () => {
  return useAuthContext();
};
