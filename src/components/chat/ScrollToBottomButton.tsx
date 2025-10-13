'use client';

import React, { useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScrollToBottomButtonProps {
  targetRef: React.RefObject<HTMLDivElement>;
  bottomOffset?: number;
}

export default function ScrollToBottomButton({
  targetRef,
  bottomOffset = 144
}: ScrollToBottomButtonProps) {
  const scrollToBottom = useCallback(() => {
    const container = targetRef.current;
    if (!container) return;

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom <= 4) {
      return;
    }

    const performScroll = (behavior: ScrollBehavior) => {
      const anchor = container.querySelector<HTMLElement>('[data-bottom-anchor="true"]');

      if (anchor && typeof anchor.scrollIntoView === 'function') {
        try {
          anchor.scrollIntoView({ behavior, block: 'end' });
        } catch (error) {
          anchor.scrollIntoView();
        }
      }

      const target = container.scrollHeight - container.clientHeight;
      if (typeof container.scrollTo === 'function') {
        container.scrollTo({ top: target < 0 ? 0 : target, behavior });
      } else {
        container.scrollTop = target < 0 ? 0 : target;
      }
    };

    requestAnimationFrame(() => {
      performScroll('smooth');
      window.setTimeout(() => performScroll('auto'), 180);
      window.setTimeout(() => performScroll('auto'), 360);
    });
  }, [targetRef]);

  const computedBottom = Math.max(bottomOffset, 96);
  const bottomStyle = `calc(${Math.round(computedBottom)}px + env(safe-area-inset-bottom, 0px))`;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ 
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.5
      }}
      onClick={scrollToBottom}
      className="fixed right-6 z-[9999] bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-xl transition-all duration-300 ease-out flex items-center justify-center"
      style={{ bottom: bottomStyle }}
      aria-label="最新のメッセージまでスクロール"
    >
      <motion.div
        animate={{ y: [0, 3, 0] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <ChevronDown className="w-6 h-6" />
      </motion.div>
    </motion.button>
  );
}
