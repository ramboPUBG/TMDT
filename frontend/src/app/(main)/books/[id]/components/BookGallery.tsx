"use client";

import { useState } from "react";
import { BookImage } from "@/types";

interface BookGalleryProps {
  images: Array<string | BookImage>;
  title: string;
}

export function BookGallery({ images, title }: BookGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const imageUrls = images
    ?.map((image) => (typeof image === "string" ? image : image.url))
    .filter(Boolean) || [];

  if (imageUrls.length === 0) {
    return (
      <div className="w-full aspect-[3/4] bg-muted flex items-center justify-center rounded-xl border border-border">
        <span className="text-4xl text-muted-foreground">📚</span>
      </div>
    );
  }

  return (
    <div className="w-full md:w-5/12 flex flex-col gap-4">
      <div className="aspect-[3/4] bg-muted rounded-xl overflow-hidden relative border border-border">
        <img src={imageUrls[currentIndex]} alt={title} className="w-full h-full object-cover" />
      </div>
      {imageUrls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {imageUrls.map((img, idx) => (
            <div 
              key={idx} 
              onClick={() => setCurrentIndex(idx)}
              className={`w-16 h-16 rounded-md overflow-hidden flex-shrink-0 cursor-pointer border-2 ${idx === currentIndex ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}
            >
              <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
