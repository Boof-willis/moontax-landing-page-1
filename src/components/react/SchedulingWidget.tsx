import React, { useState, useEffect } from 'react';

const CALENDAR_URLS = {
  high: "https://link.moontax.com/widget/booking/y2tkzj3S5lWUjZ9jOVF1",
  medium: "https://link.moontax.com/widget/booking/RrlGl6e9DKVBvIEnxSxs",
  low: "https://link.moontax.com/widget/booking/aA9L4145p0DmjUGBnBPq"
};

export default function SchedulingWidget() {
  const [iframeUrl, setIframeUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsProcessing(false);
    }, 2000);

    const params = new URLSearchParams(window.location.search);
    const priority = (params.get('priority') as 'high' | 'medium' | 'low') || 'low';
    const baseUrl = CALENDAR_URLS[priority];
    
    // Minimal params to ensure it works correctly
    const calendarParams = new URLSearchParams();
    const fields = ['full_name', 'email', 'phone', 'first_name', 'last_name'];
    fields.forEach(field => {
      const val = params.get(field);
      if (val) calendarParams.append(field, val);
    });

    setIframeUrl(`${baseUrl}?${calendarParams.toString()}`);

    return () => clearTimeout(timer);
  }, []);

  if (!iframeUrl) return null;

  return (
    <div className="w-full">
      {/* Processing State */}
      {isProcessing && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black">
          <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-8"></div>
          <h2 className="text-2xl font-manrope font-semibold text-white mb-3 text-center">Analyzing your tax situation...</h2>
          <p className="text-zinc-400 text-center px-6">Matching you with the right specialist.</p>
        </div>
      )}

      {/* Main Content - No extra styling or constrained heights */}
      <div 
        className="w-full"
        style={{ 
          opacity: isProcessing ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out'
        }}
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-manrope font-bold text-white mb-4">
            You qualify for a priority consultation.
          </h1>
          <h2 className="text-xl md:text-2xl text-zinc-400 font-sans">
            Select a time below and we'll send you a confirmation.
          </h2>
        </div>

        <iframe 
          src={iframeUrl} 
          width="100%" 
          height="800" 
          frameBorder="0"
          title="Scheduling Calendar"
        />

        <p className="text-center text-sm text-zinc-500 mt-12 font-sans pb-12">
          Can't find a time that works? Email us at <a href="mailto:hello@moontax.com" className="text-orange-500 hover:text-orange-400 transition-colors">hello@moontax.com</a>
        </p>
      </div>
    </div>
  );
}
