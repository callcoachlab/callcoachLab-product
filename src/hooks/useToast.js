import { useToastStore } from '../store/toastStore';

export function useToast() {
  const addToast = useToastStore((state) => state.addToast);

  return {
    success: (message) => addToast({ type: 'success', message }),
    error: (message) => addToast({ type: 'error', message }),
    info: (message) => addToast({ type: 'info', message }),
    warning: (message) => addToast({ type: 'warning', message }),
  };
}
