import React, { useState } from 'react';
import SubscriptionModal from './SubscriptionModal';

interface PremiumFeatureGuardProps {
  userRole: 'normal' | 'premium';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUpgrade?: () => void;
}

/**
 * PremiumFeatureGuard - Wrapper component that shows upgrade prompt when normal users
 * try to access premium features.
 * 
 * Usage:
 * <PremiumFeatureGuard userRole={user.role} onUpgrade={handleUpgrade}>
 *   <PremiumFeature />
 * </PremiumFeatureGuard>
 */
const PremiumFeatureGuard: React.FC<PremiumFeatureGuardProps> = ({
  userRole,
  children,
  fallback,
  onUpgrade,
}) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleUpgrade = () => {
    setShowUpgradeModal(false);
    if (onUpgrade) {
      onUpgrade();
    }
  };

  // If user is premium, show the feature
  if (userRole === 'premium') {
    return <>{children}</>;
  }

  // If user is normal, show fallback or upgrade prompt
  const defaultFallback = (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-4">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Feature</h3>
      <p className="text-gray-600 mb-4">
        Upgrade to Premium to unlock advanced trading signals, real-time alerts, and more.
      </p>
      <button
        onClick={() => setShowUpgradeModal(true)}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
      >
        Upgrade to Premium
      </button>
    </div>
  );

  return (
    <>
      {fallback || defaultFallback}
      <SubscriptionModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
      />
    </>
  );
};

export default PremiumFeatureGuard;
