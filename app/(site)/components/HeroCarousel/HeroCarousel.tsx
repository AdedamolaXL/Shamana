"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import { Slide } from "./types";
import { HeroCarouselSkeleton } from "./HeroCarouselSkeleton";

interface HeroCarouselProps {
  slides: Slide[];
  isLoading?: boolean;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ 
  slides, 
  isLoading = false 
}) => {
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
  }, [slides.length]);

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [startAutoPlay]);

  const showSlide = (index: number) => {
    setCurrentSlide(index);
    startAutoPlay();
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    startAutoPlay();
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    startAutoPlay();
  };

  if (isLoading) {
    return <HeroCarouselSkeleton />;
  }

  return (
    <section className="relative my-10 rounded-xl overflow-hidden h-[400px]">
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute top-0 left-0 w-full h-full opacity-0 transition-opacity duration-800 ease-in-out
              flex items-center px-16
              ${slide.background} ${index === currentSlide ? "opacity-100 z-10" : ""}`}
          >
            <div className="max-w-[600px] mx-auto text-center">
              <h1 className="text-4xl mb-4">{slide.title}</h1>
              <p className="text-lg mb-6 opacity-90">{slide.description}</p>
              <button 
                className="bg-white text-[#6a11cb] px-8 py-3 rounded-full text-base font-semibold cursor-pointer 
                  transform transition-all duration-300 
                  hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25
                  focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:scale-105
                  active:scale-95 pulse-glow"
                style={slide.buttonStyle}
                onClick={slide.onClickHandler} // This will be undefined for some slides
              >
                {slide.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-5 z-10">
        <button 
          aria-label="Previous slide" 
          className="bg-black/50 hover:bg-black/80 w-10 h-10 rounded-full text-white text-xl flex items-center justify-center cursor-pointer 
            transition-all duration-300 hover:scale-110 hover:shadow-lg
            focus:outline-none focus:ring-2 focus:ring-white focus:scale-110
            active:scale-95"
          onClick={prevSlide}
        >
          <i className="fas fa-chevron-left" aria-hidden="true"></i>
        </button>
        <button 
          aria-label="Next slide" 
          className="bg-black/50 hover:bg-black/80 w-10 h-10 rounded-full text-white text-xl flex items-center justify-center cursor-pointer
            transition-all duration-300 hover:scale-110 hover:shadow-lg
            focus:outline-none focus:ring-2 focus:ring-white focus:scale-110
            active:scale-95"
          onClick={nextSlide}
        >
          <i className="fas fa-chevron-right" aria-hidden="true"></i>
        </button>
      </div>

      <div className="absolute bottom-5 left-0 w-full flex justify-center z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full mx-1 cursor-pointer transition-all duration-300
              hover:scale-125 hover:bg-white/80
              focus:outline-none focus:ring-2 focus:ring-white focus:scale-125
              ${index === currentSlide ? "bg-white scale-125 pulse-glow" : "bg-white/50"}`}
            onClick={() => showSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </section>
  );
};