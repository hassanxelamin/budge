import { create } from 'zustand';

type OnboardingState = {
  phoneVerified: boolean;
  profileComplete: boolean;
  subscriptionActive: boolean;
  setPhoneVerified: (val: boolean) => void;
  setProfileComplete: (val: boolean) => void;
  setSubscriptionActive: (val: boolean) => void;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  phoneVerified: false,
  profileComplete: false,
  subscriptionActive: false,
  setPhoneVerified: (val) => set({ phoneVerified: val }),
  setProfileComplete: (val) => set({ profileComplete: val }),
  setSubscriptionActive: (val) => set({ subscriptionActive: val }),
}));
