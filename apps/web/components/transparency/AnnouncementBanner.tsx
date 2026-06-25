"use client";

import { useState, useEffect } from "react";
import { Copy, Check, MessageCircle } from "lucide-react";

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

interface AnnouncementBannerProps {
  banners: Array<{ id: string; text: string; color: string }>;
}

export function AnnouncementBanner({ banners }: AnnouncementBannerProps) {
  const [selectedBanner, setSelectedBanner] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [portalUrl, setPortalUrl] = useState("");

  useEffect(() => {
    setPortalUrl(window.location.href);
  }, []);

  if (!banners || banners.length === 0) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeBanner = banners.find(b => b.id === selectedBanner);

  // If a banner is selected, generate its share links
  const shareText = activeBanner
    ? `${activeBanner.text} Acompanhe a transparência financeira do Tubarão: ${portalUrl}`
    : "";
  const encodedText = encodeURIComponent(shareText);

  return (
    <>
      <div className="w-full flex flex-col">
        {banners.map((banner) => (
          <button
            key={banner.id}
            onClick={() => setSelectedBanner(banner.id)}
            className="w-full py-2 px-4 text-center font-medium text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: banner.color === "brand-primary" ? "var(--color-brand-primary, #0055A4)" : banner.color }}
          >
            {banner.text}
          </button>
        ))}
      </div>

      {selectedBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedBanner(null)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Compartilhar Conquista</h2>
            <p className="text-gray-600 mb-6">{activeBanner?.text}</p>
            
            <div className="space-y-3">
              <a
                href={`https://wa.me/?text=${encodedText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full py-2 px-4 rounded bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium transition-colors"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp
              </a>
              
              <a
                href={`https://twitter.com/intent/tweet?text=${encodedText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full py-2 px-4 rounded bg-black hover:bg-gray-800 text-white font-medium transition-colors"
              >
                <XIcon className="w-5 h-5 mr-2" />
                X (Twitter)
              </a>

              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center w-full py-2 px-4 rounded border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
              >
                {copied ? <Check className="w-5 h-5 mr-2 text-green-500" /> : <Copy className="w-5 h-5 mr-2" />}
                {copied ? "Link copiado!" : "Copiar link"}
              </button>
            </div>
            
            <button
              onClick={() => setSelectedBanner(null)}
              className="mt-6 w-full text-center text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
