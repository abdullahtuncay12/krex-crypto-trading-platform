import React, { useEffect, useState } from 'react';

interface PageTransitionProps {
  show: boolean;
  variant?: 'default' | 'money';
}

export const PageTransition: React.FC<PageTransitionProps> = ({ show, variant = 'default' }) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isAnimating, setIsAnimating] = useState(show);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);

      // Start fade out after 1.5 seconds
      const fadeTimer = setTimeout(() => {
        setIsAnimating(false);
      }, 1500);

      // Remove transition after animation
      const removeTimer = setTimeout(() => {
        setIsVisible(false);
      }, 2000);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [show]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9998] flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 transition-opacity duration-500 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {variant === 'money' && (
          <>
            {/* Floating dollar signs */}
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute text-4xl text-crypto-yellow-500 opacity-30 animate-float"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              >
                💰
              </div>
            ))}
          </>
        )}
        
        {/* Stars */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      {/* Logo with animation */}
      <div className="relative z-10">
        <div
          className="relative transition-all duration-700"
          style={{
            animation: isAnimating ? 'logoZoom 0.8s ease-out, moneyShake 0.5s ease-in-out 0.8s' : 'none',
          }}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-crypto-yellow-500 to-green-500 rounded-full blur-3xl opacity-60 animate-pulse" />
          
          {/* Logo */}
          <div className="relative">
            <img
              src="/yatirma-cekme-logo.png"
              alt="MoonLlama Money"
              className="w-32 h-32 md:w-48 md:h-48 rounded-full shadow-2xl"
            />
          </div>

          {/* Money rain effect */}
          {variant === 'money' && (
            <>
              <div className="absolute -top-8 -left-8 text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>
                💵
              </div>
              <div className="absolute -top-8 -right-8 text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>
                💰
              </div>
              <div className="absolute -bottom-8 -left-8 text-4xl animate-bounce" style={{ animationDelay: '0.6s' }}>
                💸
              </div>
              <div className="absolute -bottom-8 -right-8 text-4xl animate-bounce" style={{ animationDelay: '0.8s' }}>
                💵
              </div>
            </>
          )}
        </div>

        {/* Text */}
        {variant === 'money' && (
          <div className="mt-6 text-center">
            <p
              className="text-2xl md:text-3xl font-bold font-display text-crypto-yellow-500 animate-pulse"
              style={{
                textShadow: '0 0 20px rgba(240, 185, 11, 0.8)',
                animation: 'fadeInUp 0.5s ease-out 0.3s both',
              }}
            >
              💰 Money Time! 💰
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes logoZoom {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          60% {
            transform: scale(1.2) rotate(10deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes moneyShake {
          0%, 100% {
            transform: translateX(0) rotate(0deg);
          }
          25% {
            transform: translateX(-10px) rotate(-5deg);
          }
          75% {
            transform: translateX(10px) rotate(5deg);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
