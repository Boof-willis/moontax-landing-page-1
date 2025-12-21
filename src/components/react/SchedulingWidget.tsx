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
    
    // Build the pre-filled URL for the iframe
    const calendarParams = new URLSearchParams();
    calendarParams.set('embed', 'true');
    calendarParams.set('primaryColor', 'f97316'); // Removed # to prevent blue color override

    // Pass through relevant lead info with common GHL variations
    const name = params.get('full_name');
    const email = params.get('email');
    const phone = params.get('phone');
    const firstName = params.get('first_name');
    const lastName = params.get('last_name');

    if (name) {
      calendarParams.set('name', name);
      calendarParams.set('full_name', name);
    }
    if (email) {
      calendarParams.set('email', email);
    }
    if (phone) {
      // GHL is configured to use "phone" query key
      // Try the exact format - just the raw digits from the URL
      calendarParams.set('phone', phone);
    }
    if (firstName) calendarParams.set('first_name', firstName);
    if (lastName) calendarParams.set('last_name', lastName);

    // Pass through ALL UTM and tracking parameters to GHL iframe
    const trackingKeys = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'gclid', 'fbclid', 'msclkid', 'ttclid', 'li_fat_id'
    ];
    
    trackingKeys.forEach(key => {
      const value = params.get(key);
      if (value) {
        calendarParams.set(key, value);
      }
    });

    setIframeUrl(`${baseUrl}?${calendarParams.toString()}`);

    // Debug: Log what we're sending to GHL
    console.log('📞 Phone Debug:', {
      rawPhoneFromURL: phone,
      sentToGHL: phone,
      queryKey: 'phone',
      allParams: Object.fromEntries(calendarParams.entries()),
      fullIframeURL: `${baseUrl}?${calendarParams.toString()}`
    });

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
          transition: 'opacity 0.5s ease-in-out',
          willChange: 'opacity'
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
          allow="geolocation; microphone; camera; payment; autoplay"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-modals"
        />

        <p className="text-center text-sm text-zinc-500 mt-12 font-sans pb-12">
          Can't find a time that works? Email us at <a href="mailto:hello@moontax.com" className="text-orange-500 hover:text-orange-400 transition-colors">hello@moontax.com</a>
        </p>
      </div>
    </div>
  );
}
