import { useState, useEffect } from 'react';

export function TypewriterText({ text, delay = 100, className = "" }: { text: string; delay?: number, className?: string }) {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return (
    <span className="inline-flex items-center justify-center">
      <span className={className}>{currentText}</span>
      <span className={`inline-block w-[3px] h-[1.1em] bg-amber-500 mr-1.5 rounded-full ${currentIndex >= text.length ? 'animate-pulse' : ''}`} style={{ animationDuration: '0.8s' }} />
    </span>
  );
}
