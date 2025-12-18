import { useEffect, useState } from 'react';

const carouselTexts = [
  'Gaps',
  'Red Flags',
  'Holes',
  'Problems'
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % carouselTexts.length);
        setIsVisible(true);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-200 pb-2"
      style={{
        transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(-10px)',
        display: 'inline-block'
      }}
    >
      {carouselTexts[currentIndex]}
    </span>
  );
}

