import Contentstack from '@contentstack/delivery-sdk';

// Initialize Contentstack Stack
export const getStack = () => {
    return Contentstack.stack({
    apiKey: process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY || '',
    deliveryToken: process.env.NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN || '',
    environment: process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT || '',
    region: process.env.NEXT_PUBLIC_CONTENTSTACK_REGION || 'us',
  });
};

