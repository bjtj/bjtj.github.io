import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { GA_ID } from '@/constants';

export default function GaTracker() {
  const location = useLocation();
  useEffect(() => {
    let page_path = location.pathname + location.search;
    (window as any).gtag?.("config", GA_ID, {
      page_path,
    });
  }, [location]);

  return null;
}
