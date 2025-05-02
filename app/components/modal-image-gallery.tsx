import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { prefetchImage } from '~/utils/misc';

export function ModalImageGallery({
  srcList = [],
  trigger,
  galleryTitle,
  startIndex = 0,
}: {
  srcList?: string[];
  galleryTitle: string;
  trigger: ReactNode;
  startIndex?: number;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Title>{galleryTitle}</Dialog.Title>
        <Dialog.Description>Gallery of images</Dialog.Description>
        <Dialog.Overlay />
        <Dialog.Content>
          <ImageGallery
            srcList={srcList}
            galleryTitle={galleryTitle}
            startIndex={startIndex}
          />
          <Dialog.Close asChild>
            <button className="absolute top-10 right-4 z-50 sm:right-4 xl:right-10">
              <XMarkIcon width={24} height={24} />
              <span className="sr-only">Close Gallery</span>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ImageGallery({
  srcList = [],
  galleryTitle,
  startIndex = 0,
}: {
  srcList?: string[];
  galleryTitle: string;
  startIndex?: number;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(startIndex);
  const buttonPrevRef = useRef<HTMLButtonElement>(null);
  const buttonNextRef = useRef<HTMLButtonElement>(null);
  const isMultiple = srcList.length > 1;

  useEffect(() => {
    prefetchNextTwo(currentImageIndex, srcList);
  }, [currentImageIndex, srcList]);

  const setNextImage = useCallback(
    () =>
      setCurrentImageIndex((prevIndex) =>
        prevIndex === srcList.length - 1 ? 0 : prevIndex + 1,
      ),
    [srcList.length],
  );
  const setPreviousImage = useCallback(
    () =>
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? srcList.length - 1 : prevIndex - 1,
      ),
    [srcList.length],
  );

  useEffect(() => {
    if (!isMultiple) {
      return;
    }

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setPreviousImage();
        buttonPrevRef.current?.focus();
      }

      if (e.key === 'ArrowRight') {
        setNextImage();
        buttonNextRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [setNextImage, setPreviousImage, isMultiple]);

  return (
    <div className="fixed inset-0 z-50 flex h-full w-full items-center justify-center bg-neutral-100">
      <div className="m-auto max-w-full grow">
        {srcList.length ? (
          <img
            src={srcList[currentImageIndex]}
            alt={`${galleryTitle} image`}
            className="m-auto block max-h-[calc(100vh-10rem)] max-w-full"
          />
        ) : (
          <p className="text-center">No Images To Show</p>
        )}
      </div>
      {isMultiple && (
        <>
          <p className="absolute top-10 left-4 text-black sm:left-4 xl:left-10">
            {currentImageIndex + 1} of {srcList.length}
          </p>
          <button
            ref={buttonPrevRef}
            onClick={setPreviousImage}
            className="absolute top-1/2 left-2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white px-1 py-3 text-gray-700 sm:left-4 xl:left-10"
          >
            <ChevronLeftIcon width={24} height={24} />
            <span className="sr-only">Show previous image</span>
          </button>
          <button
            ref={buttonNextRef}
            onClick={setNextImage}
            className="absolute top-1/2 right-2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white px-1 py-3 text-gray-700 sm:right-4 xl:right-10"
          >
            <ChevronRightIcon width={24} height={24} />
            <span className="sr-only">Show next image</span>
          </button>
        </>
      )}
    </div>
  );
}

function prefetchNextTwo(currentImageIndex: number, srcList: string[]) {
  const limitIndex = Math.min(currentImageIndex + 3, srcList.length);
  for (let i = currentImageIndex + 1; i < limitIndex; i++) {
    prefetchImage(srcList[i]);
  }
}
