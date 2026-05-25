"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import Image from "next/image";
import { AuthIllustration } from "../auth-illustration";

export default function AccountPicturePage(): React.JSX.Element {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  function handleContinue() {
    // TODO: upload avatar via signed S3 URL, then update student profile
    router.replace("/home");
  }

  function handleSkip() {
    router.replace("/home");
  }

  return (
    <div className="flex flex-col">
      {/* Heading */}
      <p className="text-sm text-gray-500 font-medium">Profile Setup</p>
      <h1 className="text-3xl font-bold text-primary mt-0.5">
        Account Picture
      </h1>

      {/* Illustration */}
      <div className="my-4">
        <AuthIllustration />
      </div>

      {/* Avatar picker */}
      <div className="flex justify-center my-6">
        <div className="relative">
          {/* Avatar circle */}
          <div className="w-28 h-28 rounded-full bg-[#FACCB0]/40 flex items-center justify-center overflow-hidden border-2 border-[#FACCB0]">
            {preview ? (
              <Image
                src={preview}
                alt="Profile picture"
                width={112}
                height={112}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                viewBox="0 0 48 48"
                fill="none"
                className="w-14 h-14 text-[#E8A080]"
              >
                <circle
                  cx="24"
                  cy="18"
                  r="8"
                  fill="currentColor"
                  opacity="0.7"
                />
                <path
                  d="M8 40c0-8.837 7.163-14 16-14s16 5.163 16 14"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.7"
                />
                <circle
                  cx="32"
                  cy="12"
                  r="5"
                  fill="white"
                  stroke="#E8A080"
                  strokeWidth="1.5"
                />
                <path
                  d="M29 12h6M32 9v6"
                  stroke="#E8A080"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>

          {/* Camera button */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-md active:scale-95 transition-transform"
            aria-label="Upload photo"
          >
            <Camera className="h-4 w-4 text-white" />
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4 mt-4">
        <button
          type="button"
          onClick={handleContinue}
          className="h-14 w-full rounded-full bg-primary text-white font-semibold text-base flex items-center justify-center shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform"
        >
          Continue
        </button>

        <button
          type="button"
          onClick={handleSkip}
          className="text-sm text-gray-400 font-medium text-center hover:text-gray-600 transition-colors py-1"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
