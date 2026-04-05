"use client";

import { useRef, useState, useEffect } from "react";
import { useLocale } from "next-intl";
import Slider from "react-slick";
import ReactPlayer from "react-player";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function VideoSlider() {
  const sliderRef = useRef<Slider | null>(null);
  const playerRefs = useRef<(ReactPlayer | null)[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const locale = useLocale();
  const isRTL = locale === "ar"; // Extend if needed

  const videoUrls = [
    "https://res.cloudinary.com/dnevlp0j4/video/upload/v1774794790/Copy_of_10_gsmhhs.mp4",
    "https://res.cloudinary.com/dnevlp0j4/video/upload/v1774794758/Copy_of_13_hwvnf6.mp4",
    "https://res.cloudinary.com/dnevlp0j4/video/upload/v1774794755/Copy_of_12_avjcsd.mp4",
    "https://res.cloudinary.com/dnevlp0j4/video/upload/v1774794742/Copy_of_11_rvad6t.mp4"
  ];

  useEffect(() => {
    setIsMounted(true);
    setCurrentSlide(0);
    setIsPlaying(true);

    // Force slick to show first slide after rtl change
    setTimeout(() => {
      sliderRef.current?.slickGoTo(0, true);
    }, 0);
  }, [locale]);

  const handleEnded = () => {
    sliderRef.current?.slickNext();
  };

  const handlePause = () => setIsPlaying(false);
  const handlePlay = () => setIsPlaying(true);

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    swipe: true,
    touchMove: true,
    rtl: isRTL,
    beforeChange: (current: number) => {
      const player = playerRefs.current[current];
      if (player) {
        player.getInternalPlayer()?.pause?.();
        player.seekTo(0);
      }
    },
    afterChange: (index: number) => {
      setCurrentSlide(index);
      setIsPlaying(true);
    },
  };

  if (!isMounted) return null;

  return (
    <div className="w-full h-full rounded-[2.5rem] overflow-hidden absolute inset-0">
      <Slider
        key={locale}
        ref={sliderRef}
        {...settings}
        className="w-full h-full"
      >
        {videoUrls.map((url, index) => (
          <div key={index} className="w-full h-full">
            {currentSlide === index ? (
              <ReactPlayer
                ref={(el) => {
                  playerRefs.current[index] = el;
                }}
                url={url}
                width="100%"
                height="100%"
                controls
                playing={isPlaying}
                onEnded={handleEnded}
                onPause={handlePause}
                onPlay={handlePlay}
                muted
                playsinline
                config={{
                  file: {
                    attributes: {
                      preload: "auto",
                      autoplay: true,
                    },
                  },
                }}
              />
            ) : (
              <div className="w-full h-full bg-black" />
            )}
          </div>
        ))}
      </Slider>
    </div>
  );
}
