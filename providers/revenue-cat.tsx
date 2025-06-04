// Importing Notifications module from Expo for scheduling notifications
import * as Notifications from 'expo-notifications';
// Importing specific types used for scheduling notifications
import { SchedulableTriggerInputTypes } from 'expo-notifications';
// React hooks and context APIs
import React, { createContext, useContext, useEffect, useState } from 'react';
// Platform API to check whether we're on Android or iOS
import { Platform } from 'react-native';
// RevenueCat SDK imports
import Purchases, {
    CustomerInfo,
    LOG_LEVEL,
    PurchasesOffering,
    PurchasesPackage,
} from 'react-native-purchases';
// Fallback/fake offerings data (useful for dev or mock UI)
const fakeOfferings = require('@/assets/fakesubs.json');

// API keys stored in environment variables (EXPO_PUBLIC_... is readable in frontend code)
const APIKeys = {
  apple: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY,
  google: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY,
};

// Define the shape of the context value we’ll provide to the rest of the app
interface RevenueCatProps {
  isPro: boolean; // Whether the user has a "pro" entitlement
  getOnboardingOffering: () => Promise<PurchasesOffering>; // Get offerings shown during onboarding
  purchasePackage: (pack: PurchasesPackage) => Promise<boolean>; // Purchase a subscription/package
  restorePurchases: () => Promise<void>; // Restore purchases (used in settings, login etc.)
}

// Create a context with a default value of `null`
const RevenueCatContext = createContext<RevenueCatProps | null>(null);

// This component wraps your app and provides access to RevenueCat functionality
export const RevenueCatProvider = ({ children }: any) => {
  const [isReady, setIsReady] = useState(false); // Wait until SDK is initialized
  const [isPro, setIsPro] = useState(false); // Track whether the user is "Pro"

  // Run this on component mount
  useEffect(() => {
    const init = async () => {
      // Initialize RevenueCat depending on the platform
      if (Platform.OS === 'android') {
        await Purchases.configure({ apiKey: APIKeys.google as string });
      } else {
        await Purchases.configure({ apiKey: APIKeys.apple as string });
      }

      // RevenueCat SDK is now ready to use
      setIsReady(true);

      // Optional: Set log level (use DEBUG or VERBOSE for troubleshooting)
      Purchases.setLogLevel(LOG_LEVEL.ERROR);

      // Listen to customer updates (e.g. if they purchase elsewhere or subscription updates)
      Purchases.addCustomerInfoUpdateListener(async (info) => {
        updateCustomerInformation(info);
      });
    };
    init();
  }, []); // Empty dependency array = only run once on mount

  // Helper function to check if the user is Pro and update state
  const updateCustomerInformation = async (customerInfo: CustomerInfo) => {
    if (customerInfo?.entitlements.active['pro'] !== undefined) {
      setIsPro(true);
    }
  };

  // Get the subscription offerings for onboarding screen
  const getOnboardingOffering = async () => {
    // Normally you'd fetch from RevenueCat's live offerings:
    // const offerings = await Purchases.getOfferings();
    // return offerings.all['default'];
    return fakeOfferings; // Using mock data instead
  };

  // Purchase a selected package and handle post-purchase logic
  const purchasePackage = async (pack: PurchasesPackage): Promise<boolean> => {
    const purchase = await Purchases.purchasePackage(pack);

    // Check if "pro" entitlement became active after the purchase
    if (purchase.customerInfo?.entitlements.active['pro'] !== undefined) {
      setIsPro(true);

      // Schedule a reminder notification 2 days before trial ends
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'PRO Subscription Reminder',
          body: 'Your trial is ending soon. Make sure to review your subscription.',
        },
        trigger: {
          seconds: 60 * 60 * 24 * 2, // 2 days in seconds
          type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        },
      });
      return true;
    } else {
      return false;
    }
  };

  // Restore previous purchases (e.g. user logs into a new device)
  const restorePurchases = async () => {
    const customerInfo = await Purchases.restorePurchases();
    updateCustomerInformation(customerInfo);
  };

  // Context value to be shared with the app
  const value = {
    isPro,
    getOnboardingOffering,
    purchasePackage,
    restorePurchases,
  };

  // Don't render anything until RevenueCat is initialized
  if (!isReady) return <></>;

  // Provide the RevenueCat context to the app
  return <RevenueCatContext.Provider value={value}>{children}</RevenueCatContext.Provider>;
};

// Custom hook to easily access RevenueCat from any component
export const useRevenueCat = () => {
  return useContext(RevenueCatContext) as RevenueCatProps;
};
