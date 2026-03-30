'use client';
import { useState, useEffect, useRef } from 'react';

interface CarouselImage {
  url: string;
  alt: string;
  caption: string;
}

export default function ImageCarousel({ images }: { images: CarouselImage[] }) {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentRotation, setCurrentRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // Auto-rotate
  useEffect(() => {
    if (!isDragging) {
      const interval = setInterval(() => {
        setRotation(prev => prev + 60); // Rotate 60 degrees (next face)
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isDragging]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentRotation(rotation);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    setRotation(currentRotation + diff * 0.5);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentRotation(rotation);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - startX;
    setRotation(currentRotation + diff * 0.5);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      maxWidth: '650px', 
      margin: '0 auto',
      perspective: '2000px',
      height: '500px',
      padding: '60px 30px',
      overflow: 'visible',
    }}>
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '450px',
          height: '340px',
          marginLeft: '-225px',
          marginTop: '-170px',
          transformStyle: 'preserve-3d',
          transform: `rotateY(${rotation}deg) rotateX(-8deg)`,
          transition: isDragging ? 'none' : 'transform 1s ease-out',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {images.map((image, index) => {
          const angle = (360 / images.length) * index;
          // Calculate proper translateZ with extra spacing to prevent overlap
          const faceWidth = 450;
          const translateZ = (faceWidth / (2 * Math.tan(Math.PI / images.length))) + 60;

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                width: '450px',
                height: '340px',
                left: 0,
                top: 0,
                transform: `rotateY(${angle}deg) translateZ(${translateZ}px)`,
                backfaceVisibility: 'hidden',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 35px 90px rgba(0,0,0,0.6), 0 15px 40px rgba(0,0,0,0.4)',
                border: '5px solid rgba(255,255,255,0.2)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.alt}
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  pointerEvents: 'none',
                }}
              />
              
              {/* Caption overlay */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '1rem',
                background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.5), transparent)',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: 600,
                textAlign: 'center',
              }}>
                {image.caption}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
