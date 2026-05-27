import React from 'react';
import { X, Crown, Check, Zap, Star, BookOpen } from 'lucide-react';

const PremiumModal = ({ isOpen, onClose, onUpgrade }) => {
  if (!isOpen) return null;

  const features = [
    { icon: BookOpen, text: "Access to all premium interview questions" },
    { icon: Star, text: "Detailed explanations with best practices" },
    { icon: Zap, text: "Advanced JavaScript concepts and patterns" },
    { icon: Check, text: "Expert-level coding challenges" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-800">Go Premium</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Unlock All Premium Features
            </h3>
            <p className="text-gray-600 text-sm">
              Get access to advanced JavaScript interview questions and detailed explanations
            </p>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 mb-6 border border-purple-100">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">$9.99</div>
              <div className="text-sm text-gray-600">per month</div>
              <div className="mt-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  First 7 days free
                </span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700 text-sm">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 rounded-lg transition-all transform hover:scale-105"
            >
              Start Free Trial
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors"
            >
              Maybe Later
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Cancel anytime. No hidden fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;