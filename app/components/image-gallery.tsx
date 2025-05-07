import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { ModalImageGallery } from './modal-image-gallery';

export function ImageGallery({ images }: { images: string[] }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  return (
    <div className="flex flex-col gap-4 md:flex-row">
      {images.length > 1 && (
        <div className="order-2 flex flex-wrap gap-4 md:order-1 md:flex-col">
          {images.map((imgSrc, i) => {
            const isSelected = i === selectedImageIndex;
            return (
              <button
                key={imgSrc}
                className={`${isSelected ? 'border-gray-600' : 'border-transparent'} flex h-30 w-30 cursor-pointer items-center justify-center rounded-md border-2 bg-neutral-100`}
                onClick={() => setSelectedImageIndex(i)}
              >
                <img src={imgSrc} className="max-h-full max-w-full object-contain" />
              </button>
            );
          })}
        </div>
      )}
      <div className="relative order-1 flex h-[500px] w-full justify-center overflow-hidden rounded-xl bg-neutral-100 md:order-2 md:max-h-[600px]">
        {images.length > 1 && (
          <>
            <button
              onClick={() => {
                setSelectedImageIndex((prevIndex) =>
                  prevIndex === 0 ? images.length - 1 : prevIndex - 1,
                );
              }}
              className="absolute top-1/2 left-4 flex h-14 w-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-neutral-300 bg-white"
            >
              <ChevronLeftIcon width={24} height={24} />
            </button>
            <button
              onClick={() => {
                setSelectedImageIndex((prevIndex) =>
                  prevIndex === images.length - 1 ? 0 : prevIndex + 1,
                );
              }}
              className="absolute top-1/2 right-4 flex h-14 w-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-neutral-300 bg-white"
            >
              <ChevronRightIcon width={24} height={24} />
            </button>
          </>
        )}
        <ModalImageGallery
          galleryTitle={`Listing images`}
          srcList={images}
          startIndex={selectedImageIndex}
          trigger={
            <button className="flex cursor-pointer items-center justify-center">
              <span className="sr-only">View full width image</span>
              <img
                src={images[selectedImageIndex]}
                alt={`image`}
                className="h-full max-h-full max-w-full object-contain text-center"
              />
            </button>
          }
        />
      </div>
    </div>
  );
}
