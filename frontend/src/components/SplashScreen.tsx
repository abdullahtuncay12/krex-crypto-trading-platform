import React, { useEffect, useState } from 'react';

export const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Check if splash has been shown in this session
    const splashShown = sessionStorage.getItem('splashShown');
    
    if (splashShown) {
      setIsVisible(false);
      return;
    }

    // Start fade out animation after 2.5 seconds
    const fadeTimer = setTimeout(() => {
      setIsAnimating(false);
    }, 2500);

    // Remove splash screen after animation completes
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('splashShown', 'true');
    }, 3500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 transition-opacity duration-1000 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
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

      {/* Logo container with animations */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo with scale and fade in animation */}
        <div
          className={`relative transition-all duration-1000 ${
            isAnimating
              ? 'scale-100 opacity-100'
              : 'scale-110 opacity-0'
          }`}
          style={{
            animation: isAnimating ? 'logoEntrance 1s ease-out, float 3s ease-in-out infinite' : 'none',
          }}
        >
          {/* Glow effect behind logo */}
          <div className="absolute inset-0 bg-gradient-to-r from-crypto-yellow-500 to-purple-500 rounded-full blur-3xl opacity-50 animate-pulse" />
          
          {/* Logo image */}
          <img
            src="/logo.png"
            alt="MoonLlama"
            className="relative w-48 h-48 md:w-64 md:h-64 rounded-full shadow-2xl"
            style={{
              animation: isAnimating ? 'wink 2s ease-in-out 0.5s' : 'none',
            }}
          />
          
          {/* Sparkle effects */}
          <div className="absolute -top-4 -right-4 w-8 h-8 text-crypto-yellow-500 animate-ping">
            ✨
          </div>
          <div className="absolute -bottom-4 -left-4 w-8 h-8 text-purple-400 animate-ping" style={{ animationDelay: '0.5s' }}>
            ⭐
          </div>
        </div>

        {/* Brand name with typing effect */}
        <div className="mt-8 text-center">
          <h1
            className={`text-4xl md:text-6xl font-bold text-white mb-2 transition-all duration-1000 ${
              isAnimating
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0'
            }`}
            style={{
              animation: isAnimating ? 'fadeInUp 1s ease-out 0.5s both' : 'none',
            }}
          >
            MoonLlama
          </h1>
          <p
            className={`text-xl md:text-2xl text-crypto-yellow-500 font-semibold transition-all duration-1000 ${
              isAnimating
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0'
            }`}
            style={{
              animation: isAnimating ? 'fadeInUp 1s ease-out 0.8s both' : 'none',
            }}
          >
            No Panic. Just Signals.
          </p>
        </div>

        {/* Loading indicator */}
        <div
          className={`mt-8 flex space-x-2 transition-opacity duration-500 ${
            isAnimating ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-3 h-3 bg-crypto-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-3 h-3 bg-crypto-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-3 h-3 bg-crypto-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>

      <style>{`
        @keyframes logoEntrance {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.1) rotate(10deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes wink {
          0%, 40%, 100% {
            transform: scale(1);
          }
          45% {
            transform: scale(0.95) scaleY(0.1);
          }
          50% {
            transform: scale(1);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
};
