"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const TRIGGER_X_THRESHOLD = 0.85; // right 15% of viewport width
const TRIGGER_Y_THRESHOLD = 0.15; // top 15% of viewport height
const COOLDOWN_MS = 2000;

export default function EasterEggModal() {
  const [isOpen, setIsOpen] = useState(false);
  const cooldownRef = useRef(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    cooldownRef.current = true;
    setTimeout(() => {
      cooldownRef.current = false;
    }, COOLDOWN_MS);
  }, []);

  useEffect(() => {
    const handleMouseEvent = (e: MouseEvent) => {
      if (cooldownRef.current || isOpen) return;
      if (!e.ctrlKey) return;

      const inTriggerZone =
        e.clientX > window.innerWidth * TRIGGER_X_THRESHOLD &&
        e.clientY < window.innerHeight * TRIGGER_Y_THRESHOLD;

      if (inTriggerZone) {
        cooldownRef.current = true;
        setIsOpen(true);
      }
    };

    window.addEventListener("mousemove", handleMouseEvent);
    window.addEventListener("click", handleMouseEvent);

    return () => {
      window.removeEventListener("mousemove", handleMouseEvent);
      window.removeEventListener("click", handleMouseEvent);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="easter-egg-title"
        className="relative overflow-hidden rounded-2xl bg-white px-6 pb-6 pt-5 text-center shadow-xl sm:w-full sm:max-w-sm animate-in zoom-in-95 duration-200"
      >
        <div className="absolute right-0 top-0 pr-4 pt-4">
          <button
            type="button"
            aria-label="Fermer"
            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            onClick={handleClose}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 mt-2">
          <div className="relative w-48 h-48">
            <Image
              src="/easter-egg.png"
              alt="Père Noël surpris"
              fill
              className="object-contain drop-shadow-md"
              priority
            />
          </div>

          <div>
            <h2 id="easter-egg-title" className="text-xl font-bold text-gray-900">
              🎅 Tu as trouvé le secret !
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Félicitations, curieux(se) ! Le Père Noël t&apos;avait à l&apos;œil depuis le début...
              <br />
              <span className="font-medium text-red-600">Ho Ho Ho !</span>
            </p>
          </div>

          <button
            type="button"
            className="inline-flex justify-center rounded-md bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-colors"
            onClick={handleClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
