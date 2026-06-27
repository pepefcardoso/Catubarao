"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

interface Banner {
  id: string;
  text: string;
  link?: string | null;
  color: string;
}

interface AnnouncementBannerProps {
  banners: Banner[];
}

export function AnnouncementBanner({ banners }: AnnouncementBannerProps) {
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

  if (!banners || banners.length === 0) return null;

  const activeBanners = banners.filter(b => !dismissed[b.id]);

  if (activeBanners.length === 0) return null;

  return (
    <div className="flex flex-col w-full z-50">
      {activeBanners.map((banner) => {
        // Handle safe color mapping
        const isHex = banner.color.startsWith("#");
        const bgColorClass = !isHex && banner.color.startsWith("brand-") 
          ? `bg-${banner.color}` 
          : !isHex && !banner.color.includes("-") 
            ? `bg-${banner.color}-600` 
            : "";
        
        const style = isHex ? { backgroundColor: banner.color } : {};
        
        const content = (
          <div className="flex items-center justify-between w-full max-w-7xl mx-auto px-4 py-2">
            <div className="flex-1 text-center text-sm font-medium text-white px-8">
              {banner.text}
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                setDismissed(prev => ({ ...prev, [banner.id]: true }));
              }}
              className="text-white/80 hover:text-white transition-colors shrink-0 p-1"
              aria-label="Fechar anúncio"
            >
              <X className="size-4" />
            </button>
          </div>
        );

        return (
          <div
            key={banner.id}
            className={cn("w-full transition-all", bgColorClass)}
            style={style}
          >
            {banner.link ? (
              <a href={banner.link} className="block w-full hover:opacity-90 transition-opacity">
                {content}
              </a>
            ) : (
              content
            )}
          </div>
        );
      })}
    </div>
  );
}
