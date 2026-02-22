import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SubscriptionModal from './SubscriptionModal';
import PremiumFeatureGuard from './PremiumFeatureGuard';
import { fetchCurrentUser } from '../store/slices/authSlice';
import type { RootState } from '../store';

/**
 * Example component demonstrating how to use SubscriptionModal
 * in different scenarios
 */
const SubscriptionModalExample: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [showModal, setShowModal] = useState(false);

  const handleUpgrade = () => {
    // Refresh user data to get updated role
    dispatch(fetchCurrentUser());
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Subscription Modal Examples</h1>

      {/* Example 1: Manual trigger with button */}
      <section className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Example 1: Manual Trigger</h2>
        <p className="text-gray-600 mb-4">
          Click the button to open the subscription modal manually.
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Upgrade to Premium
        </button>
        <SubscriptionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onUpgrade={handleUpgrade}
        />
      </section>

      {/* Example 2: Using PremiumFeatureGuard */}
      <section className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Example 2: Premium Feature Guard</h2>
        <p className="text-gray-600 mb-4">
          Wrap premium features with PremiumFeatureGuard to automatically show upgrade prompt.
        </p>
        <PremiumFeatureGuard
          userRole={user?.role || 'normal'}
          onUpgrade={handleUpgrade}
        >
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Premium Feature</h3>
            <p className="text-green-700">
              This content is only visible to premium users. Normal users will see an upgrade prompt.
            </p>
          </div>
        </PremiumFeatureGuard>
      </section>

      {/* Example 3: Conditional rendering based on role */}
      <section className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Example 3: Conditional Rendering</h2>
        <p className="text-gray-600 mb-4">
          Show different content based on user role.
        </p>
        {user?.role === 'premium' ? (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">Welcome, Premium User!</h3>
            <p className="text-purple-700">
              You have access to all premium features including advanced signals and real-time alerts.
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Upgrade to Premium</h3>
            <p className="text-gray-700 mb-3">
              Get access to advanced trading signals, real-time alerts, and more.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
            >
              View Premium Plans
            </button>
          </div>
        )}
      </section>

      {/* Example 4: Inline upgrade prompt */}
      <section className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Example 4: Inline Upgrade Prompt</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold">Advanced Trading Signals</h3>
              <p className="text-sm text-gray-600">AI-powered analysis with stop-loss recommendations</p>
            </div>
            {user?.role === 'premium' ? (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Active
              </span>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
              >
                Upgrade
              </button>
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold">Real-time Alerts</h3>
              <p className="text-sm text-gray-600">Get notified of price movements and pump signals</p>
            </div>
            {user?.role === 'premium' ? (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Active
              </span>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SubscriptionModalExample;
