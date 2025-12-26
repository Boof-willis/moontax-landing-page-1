import React, { useState, useEffect } from 'react';
const steps = [
  { id: 1, title: '1099-DA' },
  { id: 2, title: 'Activity' },
  { id: 3, title: 'Challenge' },
  { id: 4, title: 'Timeline' },
  { id: 5, title: 'Contact' },
  { id: 6, title: 'Booking' },
];
export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    concern_1099da: '', // Q1: 1099-DA concern
    activity: [] as string[], // Q2: Crypto activity (multi-select)
    challenge: '', // Q3: Biggest challenge
    timeline: '', // Q4: Timeline
    name: '',
    email: '',
    phone: '',
    consent: false,
    lead_score: 0,
    // Tracking fields
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_term: '',
    utm_content: '',
    gclid: '',
    fbclid: '',
    msclkid: '',
    ttclid: '',
    li_fat_id: '',
    referring_url: '',
    entry_url: '',
    website: '', // Honeypot field
  });
  useEffect(() => {
    // Load GoHighLevel form embed script
    const script = document.createElement('script');
    script.src = "https://link.moontax.com/js/form_embed.js";
    script.type = "text/javascript";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  const [isMobile, setIsMobile] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const calculateLeadScore = (data: typeof formData) => {
    let score = 0;
    
    // Q1: 1099-DA concern scoring
    const concern = data.concern_1099da.toLowerCase();
    if (concern.includes('expect to receive')) score += 2;
    else if (concern.includes('not sure')) score += 1;
    
    // Q2: Crypto activity scoring (take highest value from selected)
    if (Array.isArray(data.activity) && data.activity.length > 0) {
      let activityScore = 0;
      data.activity.forEach(item => {
        if (item.includes('DeFi') || item.includes('High-Volume') || item.includes('Trading Bots')) {
          activityScore = Math.max(activityScore, 3);
        } else if (item.includes('Mining') || item.includes('Staking')) {
          activityScore = Math.max(activityScore, 2);
        } else if (item.includes('NFTs') || item.includes('HODLing')) {
          activityScore = Math.max(activityScore, 1);
        }
      });
      score += activityScore;
    }
    
    // Q3: Challenge scoring
    const challenge = data.challenge.toLowerCase();
    if (challenge.includes('irs audit') || challenge.includes('years of unreconciled')) {
      score += 3;
    } else if (challenge.includes('mess') || challenge.includes('wallets') || challenge.includes('generic software')) {
      score += 2;
    }
    
    // Q4: Timeline scoring
    if (data.timeline.includes('ASAP')) score += 3;
    else if (data.timeline.includes('Before the April')) score += 2;
    else if (data.timeline.includes('next few months')) score += 1;
    // "Just exploring options" = 0 points
    
    return score;
  };
  const getPriorityLevel = (score: number) => {
    if (score >= 9) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  };
  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };
  useEffect(() => {
    // Load tracking data from sessionStorage
    const trackingJson = sessionStorage.getItem('moontax_tracking');
    if (trackingJson) {
      try {
        const trackingData = JSON.parse(trackingJson);
        setFormData(prev => ({
          ...prev,
          ...trackingData
        }));
      } catch (e) {
        console.error('Error parsing tracking data', e);
      }
    }
  }, []);
  useEffect(() => {
    // Grow progress bar on load and step change
    const timer = setTimeout(() => {
      setProgress(Math.min((currentStep / 5) * 100, 100));
    }, 100);
    return () => clearTimeout(timer);
  }, [currentStep]);
  const nextStep = async () => {
    if (currentStep === 5) {
      // Honeypot check
      if (formData.website) {
        console.warn('Bot detected via honeypot');
        setCurrentStep(6); // Special bot rejection step
        return;
      }
      setIsProcessing(true); // Start loading state
      const score = calculateLeadScore(formData);
      const level = getPriorityLevel(score);
      setFormData(prev => ({ ...prev, lead_score: score }));
      // Submit lead data to webhook immediately
      try {
        const rawPhone = formData.phone.replace(/[^\d]/g, '');
        // Webhook still gets the 1 prefix if 10 digits for CRM consistency
        const webhookPhone = rawPhone.length === 10 ? `1${rawPhone}` : rawPhone;
        // URL parameter for GHL widget gets exactly 10 digits (stripping leading 1 if present)
        const cleanPhone = rawPhone.length === 11 && rawPhone.startsWith('1') 
          ? rawPhone.slice(1) 
          : rawPhone; 
        
        // Build shared redirect params for both success and catch blocks
        const nameParts = formData.name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        const redirectParams = new URLSearchParams();
        redirectParams.set('priority', level);
        redirectParams.set('full_name', formData.name);
        redirectParams.set('first_name', firstName);
        redirectParams.set('last_name', lastName);
        redirectParams.set('email', formData.email);
        redirectParams.set('phone', cleanPhone);
        
        // Pass through tracking
        if (formData.utm_source) redirectParams.set('utm_source', formData.utm_source);
        if (formData.utm_medium) redirectParams.set('utm_medium', formData.utm_medium);
        if (formData.utm_campaign) redirectParams.set('utm_campaign', formData.utm_campaign);
        if (formData.gclid) redirectParams.set('gclid', formData.gclid);
        if (formData.fbclid) redirectParams.set('fbclid', formData.fbclid);

        const payload = {
          ...formData,
          phone: webhookPhone,
          lead_score: score,
          priority_level: level,
          full_name: formData.name,
          // Activity as comma separated string for easier CRM mapping
          activity_list: formData.activity.join(', ')
        };

        await fetch('https://services.leadconnectorhq.com/hooks/wdySJSgT6vvj48a9VuHu/webhook-trigger/8e70c8c9-62c2-48bc-ba02-89798bbf3f51', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        console.log('Lead successfully submitted to CRM');
        
        // Redirect to external GHL calendar pages based on priority
        const CALENDAR_REDIRECT_URLS = {
          high: 'https://consultation.moontax.com/hp',
          medium: 'https://consultation.moontax.com/mp',
          low: 'https://consultation.moontax.com/lp'
        };
        
        const redirectUrl = CALENDAR_REDIRECT_URLS[level];
        const externalParams = new URLSearchParams();
        
        // Pass contact info as URL parameters
        externalParams.set('full_name', formData.name);
        externalParams.set('email', formData.email);
        externalParams.set('phone', cleanPhone);
        
        window.location.href = `${redirectUrl}?${externalParams.toString()}`;
        
      } catch (error) {
        console.error('Error submitting lead to webhook:', error);
        
        // Recalculate basic params for catch block to be safe
        const score = calculateLeadScore(formData);
        const level = getPriorityLevel(score);
        const rawPhone = formData.phone.replace(/[^\d]/g, '');
        const cleanPhone = rawPhone.length === 11 && rawPhone.startsWith('1') ? rawPhone.slice(1) : rawPhone;

        const CALENDAR_REDIRECT_URLS = {
          high: 'https://consultation.moontax.com/hp',
          medium: 'https://consultation.moontax.com/mp',
          low: 'https://consultation.moontax.com/lp'
        };
        
        const redirectUrl = CALENDAR_REDIRECT_URLS[level];
        const externalParams = new URLSearchParams();
        
        externalParams.set('full_name', formData.name);
        externalParams.set('email', formData.email);
        externalParams.set('phone', cleanPhone);
        
        window.location.href = `${redirectUrl}?${externalParams.toString()}`;
      }
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'phone') {
      const formattedValue = formatPhoneNumber(value);
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  const toggleActivity = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      activity: prev.activity.includes(item)
        ? prev.activity.filter((a) => a !== item)
        : [...prev.activity, item],
    }));
  };
  const isStepValid = () => {
    if (currentStep === 1) return formData.concern_1099da !== '';
    if (currentStep === 2) return formData.activity.length > 0;
    if (currentStep === 3) return formData.challenge !== '';
    if (currentStep === 4) return formData.timeline !== '';
    if (currentStep === 5) return formData.name && formData.email && formData.phone && formData.consent;
    return true;
  };
  return (
    <>
      {/* Fixed MoonTax Logo at Top */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-11 px-6">
        <a href="https://moontax.com" className="transition-opacity hover:opacity-80">
          <img 
            src="https://cdn.prod.website-files.com/6602e1800d6eea53ab44d610/66030d3bba8bcd44a766d010_MoonTax%20Full.svg" 
            alt="MoonTax" 
            className="h-8 w-auto" 
          />
        </a>
      </div>
      
      {/* Centered Form Container */}
      <div className="min-h-screen w-full flex items-center justify-center px-6 md:px-0 py-24">
        <div className="w-full max-w-2xl mx-auto relative z-[60] transition-all duration-500 overflow-hidden rounded-[2.5rem] bg-zinc-950/75 backdrop-blur-md border border-white/10 shadow-2xl">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-24 md:py-32 animate-in fade-in duration-500 min-h-[400px]">
            <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-8"></div>
            <h2 className="text-2xl font-manrope font-semibold text-white mb-3 px-6 text-center">Analyzing your tax situation...</h2>
            <p className="text-zinc-400 font-sans px-6 text-center">Matching you with the right specialist.</p>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="h-1 w-full bg-white/5 relative">
              <div 
                className="absolute top-0 left-0 h-full bg-orange-500 transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="transition-all duration-500 p-8 md:p-12">
              <div className="mb-8 flex justify-between items-center">
                <span className="text-xs font-mono text-orange-500 uppercase tracking-widest">
                  Step {currentStep} of 5
                </span>
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                  {steps[Math.min(currentStep - 1, steps.length - 1)].title}
                </span>
              </div>
              {/* Step 1: 1099-DA Concern */}
              {currentStep === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-3xl md:text-4xl font-manrope font-semibold text-white mb-4">
                    Are you concerned about 1099-DA mismatch on your tax return?
                  </h2>
                  <p className="text-zinc-400 mb-8 font-sans">
                    This helps us understand your situation.
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      "Yes, I expect to receive one this tax season",
                      "I'm not sure — help me find out"
                    ].map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, concern_1099da: option }));
                          setTimeout(nextStep, 300);
                        }}
                        className={`p-4 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between group cursor-pointer ${
                          formData.concern_1099da === option
                            ? 'bg-orange-500/10 border-orange-500 text-white'
                            : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/20 hover:bg-white/[0.07]'
                        }`}
                      >
                        <span>{option}</span>
                        <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                          formData.concern_1099da === option ? 'border-white bg-white' : 'border-zinc-700'
                        }`}>
                          {formData.concern_1099da === option && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M20 6L9 17l-5-5"/></svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Step 2: Crypto Activity */}
              {currentStep === 2 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-3xl md:text-4xl font-manrope font-semibold text-white mb-4">
                    What best describes your crypto activity?
                  </h2>
                  <p className="text-zinc-400 mb-8 font-sans">
                    Select all that apply to your situation.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      'DeFi / DEX Power User',
                      'Mining',
                      'High-Volume Trading',
                      'NFTs & Minting',
                      'Staking & Rewards',
                      'Trading Bots',
                      'Basic HODLing',
                    ].map((item) => (
                      <button
                        key={item}
                        onClick={() => toggleActivity(item)}
                        className={`px-6 py-3 rounded-full border text-sm font-medium transition-all cursor-pointer ${
                          formData.activity.includes(item)
                            ? 'bg-orange-500/10 border-orange-500 text-white'
                            : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/20 hover:bg-white/[0.07]'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Step 3: Challenge */}
              {currentStep === 3 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-3xl md:text-4xl font-manrope font-semibold text-white mb-4">
                    What's your biggest challenge?
                  </h2>
                  <p className="text-zinc-400 mb-8 font-sans">
                    Help us understand what needs fixing.
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      'My transaction history is a total mess',
                      'Too many wallets and exchanges to sync',
                      'Generic software is failing on my DeFi data',
                      'I am worried about an IRS audit',
                      'I have multiple years of unreconciled data'
                    ].map((challenge) => (
                      <button
                        key={challenge}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, challenge }));
                          setTimeout(nextStep, 300);
                        }}
                        className={`p-4 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between group cursor-pointer ${
                          formData.challenge === challenge
                            ? 'bg-orange-500/10 border-orange-500 text-white'
                            : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/20 hover:bg-white/[0.07]'
                        }`}
                      >
                        <span>{challenge}</span>
                        <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                          formData.challenge === challenge ? 'border-white bg-white' : 'border-zinc-700'
                        }`}>
                          {formData.challenge === challenge && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M20 6L9 17l-5-5"/></svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Step 4: Timeline */}
              {currentStep === 4 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-3xl md:text-4xl font-manrope font-semibold text-white mb-4">
                    When do you need this resolved?
                  </h2>
                  <p className="text-zinc-400 mb-8 font-sans">
                    We'll prioritize your audit based on your timeline.
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      'Immediately (ASAP)',
                      'Before the April deadline',
                      'In the next few months',
                      'Just exploring options'
                    ].map((timeline) => (
                      <button
                        key={timeline}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, timeline }));
                          setTimeout(nextStep, 300);
                        }}
                        className={`p-4 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between group cursor-pointer ${
                          formData.timeline === timeline
                            ? 'bg-orange-500/10 border-orange-500 text-white'
                            : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/20 hover:bg-white/[0.07]'
                        }`}
                      >
                        <span>{timeline}</span>
                        <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                          formData.timeline === timeline ? 'border-white bg-white' : 'border-zinc-700'
                        }`}>
                          {formData.timeline === timeline && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M20 6L9 17l-5-5"/></svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Step 5: Contact */}
              {currentStep === 5 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-3xl md:text-4xl font-manrope font-semibold text-white mb-4">
                    Final step: Your contact details
                  </h2>
                  <p className="text-zinc-400 mb-8 font-sans">
                    Where should we send your audit results?
                  </p>
                  <div className="space-y-6">
                    {/* Honeypot field - hidden from users */}
                    <div className="hidden" aria-hidden="true">
                      <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </div>
                    <div className="group relative">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="peer w-full bg-transparent border-b border-white/10 py-3 text-white placeholder-transparent focus:border-orange-500 focus:outline-none transition-colors font-sans text-lg"
                        placeholder="Full Name"
                      />
                      <label 
                        htmlFor="name"
                        className="absolute left-0 -top-5 text-xs text-zinc-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-zinc-400 peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-[10px] peer-focus:text-orange-500 font-sans uppercase tracking-wider font-medium cursor-text"
                      >
                        Full Name
                      </label>
                    </div>
                    <div className="group relative">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="peer w-full bg-transparent border-b border-white/10 py-3 text-white placeholder-transparent focus:border-orange-500 focus:outline-none transition-colors font-sans text-lg"
                        placeholder="Email Address"
                      />
                      <label 
                        htmlFor="email"
                        className="absolute left-0 -top-5 text-xs text-zinc-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-zinc-400 peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-[10px] peer-focus:text-orange-500 font-sans uppercase tracking-wider font-medium cursor-text"
                      >
                        Email Address
                      </label>
                    </div>
                    <div className="group relative">
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="peer w-full bg-transparent border-b border-white/10 py-3 text-white placeholder-transparent focus:border-orange-500 focus:outline-none transition-colors font-sans text-lg"
                        placeholder="Phone Number"
                      />
                      <label 
                        htmlFor="phone"
                        className="absolute left-0 -top-5 text-xs text-zinc-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-zinc-400 peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-[10px] peer-focus:text-orange-500 font-sans uppercase tracking-wider font-medium cursor-text"
                      >
                        Phone Number
                      </label>
                    </div>
                    <div className="flex items-start gap-3 pt-4">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          id="consent"
                          name="consent"
                          checked={formData.consent}
                          onChange={handleInputChange}
                          className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-white/10 bg-white/5 transition-all checked:bg-orange-500 checked:border-orange-500"
                        />
                        <svg
                          className="pointer-events-none absolute left-1 top-1 h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <label htmlFor="consent" className="text-xs text-zinc-500 leading-relaxed cursor-pointer select-none">
                        By checking this box, you agree to be contacted by MoonTax specialists regarding your crypto tax situation via email, phone, or SMS. You can opt-out at any time.
                      </label>
                    </div>
                  </div>
                </div>
              )}
              {/* Step 6: Bot Success (Hidden Rejection) */}
              {currentStep === 6 && (
                <div className="animate-in fade-in zoom-in-95 duration-700 text-center py-8">
                  <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(249,115,22,0.4)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-manrope font-semibold text-white mb-4">
                    Thank you for your submission!
                  </h2>
                  <p className="text-zinc-400 mb-12 font-sans max-w-md mx-auto">
                    We have received your details. Our team will review your information and reach out if there's a fit.
                  </p>
                  <a
                    href="/"
                    className="inline-flex items-center gap-2 text-orange-400 hover:text-white transition-colors font-medium border-b border-orange-400 pb-1 cursor-pointer"
                  >
                    Return to Homepage
                  </a>
                </div>
              )}
              {/* Navigation Buttons */}
              {(currentStep === 2 || currentStep === 5) && (
                <div className="mt-12 flex items-center justify-end pt-8 border-t border-white/5">
                  <button
                    onClick={nextStep}
                    disabled={!isStepValid()}
                    className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs transition-all duration-300 ${
                      isStepValid()
                        ? 'bg-white text-black hover:bg-orange-500 hover:text-white shadow-xl cursor-pointer'
                        : 'bg-white/10 text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    {currentStep === 5 ? 'Get My Free Audit' : 'Continue'}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      </div>
    </>
  );
}
