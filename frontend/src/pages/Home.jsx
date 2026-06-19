import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Scissors, 
  Users, 
  Calendar, 
  Award, 
  MessageSquare, 
  ArrowRight, 
  Sparkles, 
  Sliders, 
  Smartphone, 
  Bell, 
  Check, 
  FileText, 
  IndianRupee, 
  BarChart3, 
  Lock, 
  Globe, 
  ChevronDown, 
  X,
  Ruler,
  BookOpen,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Compass,
  ShoppingBag
} from 'lucide-react';
import RollingGlobe from '../components/RollingGlobe';

export default function Home({ onNavigate }) {
  const { t, language, changeLanguage } = useLanguage();
  
  // Split the translated strings for cleaner stats display
  const stichesSavedParts = t('stichesSaved').split(' ');
  const stichesSavedNum = stichesSavedParts[0];
  const stichesSavedText = stichesSavedParts.slice(1).join(' ');

  const activeShopsParts = t('activeShops').split(' ');
  const activeShopsNum = activeShopsParts[0];
  const activeShopsText = activeShopsParts.slice(1).join(' ');

  const deliveryRateParts = t('deliveryRate').split(' ');
  const deliveryRateNum = deliveryRateParts[0];
  const deliveryRateText = deliveryRateParts.slice(1).join(' ');

  // Interactive Showcase States
  const [whatsappSent, setWhatsappSent] = useState(false);
  const [showPushBanner, setShowPushBanner] = useState(false);

  // Language Dropdown and Pop-up Modal Details
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);

  // Language options
  const langOptions = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'hi', label: 'हिंदी (Hindi)', short: 'हिन्दी' },
    { code: 'te', label: 'తెలుగు (Telugu)', short: 'తెలుగు' }
  ];

  // Trigger WhatsApp Simulated Alert
  const triggerWhatsappSimulation = () => {
    setWhatsappSent(true);
    setShowPushBanner(true);
  };

  // Auto-dismiss push banner after 5 seconds
  useEffect(() => {
    if (showPushBanner) {
      const timer = setTimeout(() => {
        setShowPushBanner(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showPushBanner]);

  // Premium color-coded theme mapping for each feature card
  const themeMap = {
    purple: {
      text: "text-purple-600",
      bg: "bg-purple-500/10",
      border: "border-purple-500/15",
      hoverBorder: "group-hover:border-purple-600/30",
      hoverBg: "group-hover:bg-purple-600",
      hoverIcon: "group-hover:text-white",
      shadow: "hover:shadow-[0_20px_45px_rgba(124,58,237,0.08)]",
      badge: "bg-purple-500/10 text-purple-700",
    },
    blue: {
      text: "text-blue-600",
      bg: "bg-blue-500/10",
      border: "border-blue-500/15",
      hoverBorder: "group-hover:border-blue-600/30",
      hoverBg: "group-hover:bg-blue-600",
      hoverIcon: "group-hover:text-white",
      shadow: "hover:shadow-[0_20px_45px_rgba(37,99,235,0.08)]",
      badge: "bg-blue-500/10 text-blue-700",
    },
    pink: {
      text: "text-pink-600",
      bg: "bg-pink-500/10",
      border: "border-pink-500/15",
      hoverBorder: "group-hover:border-pink-600/30",
      hoverBg: "group-hover:bg-pink-600",
      hoverIcon: "group-hover:text-white",
      shadow: "hover:shadow-[0_20px_45px_rgba(219,39,119,0.08)]",
      badge: "bg-pink-500/10 text-pink-700",
    },
    emerald: {
      text: "text-emerald-600",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/15",
      hoverBorder: "group-hover:border-emerald-600/30",
      hoverBg: "group-hover:bg-emerald-600",
      hoverIcon: "group-hover:text-white",
      shadow: "hover:shadow-[0_20px_45px_rgba(5,150,105,0.08)]",
      badge: "bg-emerald-500/10 text-emerald-700",
    },
    amber: {
      text: "text-amber-600",
      bg: "bg-amber-500/10",
      border: "border-amber-500/15",
      hoverBorder: "group-hover:border-amber-600/30",
      hoverBg: "group-hover:bg-amber-600",
      hoverIcon: "group-hover:text-white",
      shadow: "hover:shadow-[0_20px_45px_rgba(217,119,6,0.08)]",
      badge: "bg-amber-500/10 text-amber-700",
    }
  };

  // Feature data structured matching the icons and details
  const features = [
    {
      id: 1,
      title: t('feature1Title'),
      desc: t('feature1Desc'),
      icon: <Ruler className="w-5 h-5" />,
      color: "purple",
      details: {
        en: "Digitally record body dimensions (chest, waist, hip, shoulder, sleeves, neck) and associate them directly with customer profiles. Store visual sketches or references, and retrieve historical measurements instantly during re-orders.",
        hi: "शारीरिक मापों (छाती, कमर, कूल्हा, कंधा, आस्तीन, गला) को डिजिटल रूप से रिकॉर्ड करें और सीधे ग्राहक प्रोफाइल से जोड़ें। डिज़ाइन रेखाचित्रों को सुरक्षित रखें और दोबारा ऑर्डर के समय माप तुरंत प्राप्त करें।",
        te: "కస్టమర్ ప్రొఫైల్‌లతో నేరుగా బాడీ కొలతలను (ఛాతీ, నడుము, భుజం, చేతులు మొదలైనవి) డిజిటల్‌గా రికార్డ్ చేయండి. స్కెచ్‌లను భద్రపరచండి, మళ్లీ ఆర్డర్ చేసేటప్పుడు కొలతలను వెంటనే పొందండి."
      },
      actionText: {
        en: "Explore Measurement Portal",
        hi: "माप पोर्टल देखें",
        te: "కొలతల పోర్టల్ చూడండి"
      }
    },
    {
      id: 2,
      title: t('feature2Title'),
      desc: t('feature2Desc'),
      icon: <BookOpen className="w-5 h-5" />,
      color: "blue",
      details: {
        en: "A comprehensive booking register for shirts, suits, pants, blouses, and kurtas. Track booking dates, custom style instructions, delivery deadlines, and current stitching status in one simplified interface.",
        hi: "शर्ट, सूट, पैंट, ब्लाउज और कुर्ते के लिए एक व्यापक बुकिंग रजिस्टर। एक सरल इंटरफ़ेस में बुकिंग की तारीख, कस्टम स्टाइल निर्देश, डिलीवरी समय सीमा और वर्तमान सिलाई स्थिति को ट्रैक करें।",
        te: "షర్టులు, సూట్లు, ప్యాంట్లు, బ్లౌజ్లు మరియు కుర్తాల కోసం ఒక సమగ్ర బుకింగ్ రిజిస్టర్. బుకింగ్ తేదీలు, డిజైన్ సూచనలు, డెలివరీ గడువు మరియు ప్రస్తుత కుట్టుపని స్థితిని సులభంగా ట్రాక్ చేయండి."
      },
      actionText: {
        en: "Open Digital Register",
        hi: "डिजिटल रजिस्टर खोलें",
        te: "డిజిటల్ రిజిస్టర్ తెరవండి"
      }
    },
    {
      id: 3,
      title: t('feature3Title'),
      desc: t('feature3Desc'),
      icon: <MessageSquare className="w-5 h-5" />,
      color: "pink",
      details: {
        en: "Automated communication engine that generates daily morning tasks and sends prompt WhatsApp notifications to clients when their garments are ready for pickup, including detailed payment due status.",
        hi: "स्वचालित संचार प्रणाली जो दैनिक सुबह के काम उत्पन्न करती है और कपड़े तैयार होने पर ग्राहकों को व्हाट्सएप नोटिफिकेशन भेजती है, जिसमें लंबित भुगतान की जानकारी भी शामिल होती है।",
        te: "కస్టమర్ల దుస్తులు సిద్ధంగా ఉన్నప్పుడు వాట్సాప్ నోటిఫికేషన్‌లను పంపే ఆటోమేటిక్ అలర్ట్ సిస్టమ్. ఇందులో పెండింగ్ పేమెంట్ వివరాలు కూడా ఉంటాయి."
      },
      actionText: {
        en: "Trigger Test Alert",
        hi: "परीक्षण अलर्ट भेजें",
        te: "టెస్ట్ అలర్ట్ పంపండి"
      }
    },
    {
      id: 4,
      title: t('feature4Title'),
      desc: t('feature4Desc'),
      icon: <Smartphone className="w-5 h-5" />,
      color: "emerald",
      details: {
        en: "Self-serve mobile portal tailored for customers. Without downloading any app, clients login with their phone numbers to check real-time order status, balance payments due, and see saved measurement charts.",
        hi: "ग्राहकों के लिए विशेष रूप से डिज़ाइन किया गया स्वयं-सेवा मोबाइल पोर्टल। किसी ऐप को डाउनलोड किए बिना, ग्राहक रीयल-टाइम ऑर्डर स्थिति, शेष भुगतान और अपने मापों को देखने के लिए फोन नंबर से लॉग इन कर सकते हैं।",
        te: "కస్టమర్ల కోసం ప్రత్యేకంగా రూపొందించిన మొబైల్ పోర్టల్. యాప్‌ డౌన్‌లోడ్ చేయకుండానే, కస్టమర్లు తమ ఫోన్ నంబర్‌తో లాగిన్ అయి ఆర్డర్ల స్థితిని, బ్యాలెన్స్ పేమెంట్‌ను చెక్ చేయవచ్చు."
      },
      actionText: {
        en: "Launch Customer Demo",
        hi: "ग्राहक डेमो शुरू करें",
        te: "కస్టమర్ డెమో చూడండి"
      }
    },
    {
      id: 5,
      title: t('feature5Title'),
      desc: t('feature5Desc'),
      icon: <Calendar className="w-5 h-5" />,
      color: "blue",
      details: {
        en: "Visualize delivery targets using daily, weekly, and monthly calendar heatmaps. Auto-prioritize overdue items, highlighting urgent bookings to ensure tailors meet customer commitments without delays.",
        hi: "दैनिक, साप्ताहिक और मासिक कैलेंडर हीटमैप का उपयोग करके डिलीवरी लक्ष्यों को देखें। अतिदेय वस्तुओं को स्वचालित रूप से प्राथमिकता दें, ताकि दर्जी बिना किसी देरी के समय पर कपड़े दे सकें।",
        te: "రోజువారీ, వారపు మరియు నెలవారీ క్యాలెండర్ల ద్వారా డెలివరీ లక్ష్యాలను వీక్షించండి. గడువు ముగిసిన వాటిని ప్రాధాన్యత ప్రకారం పూర్తి చేయడానికి సహాయపడుతుంది."
      },
      actionText: {
        en: "View Delivery Calendar",
        hi: "डिलीवरी कैलेंडर देखें",
        te: "డెలివరీ క్యాలెండర్ చూడండి"
      }
    },
    {
      id: 6,
      title: t('feature6Title'),
      desc: t('feature6Desc'),
      icon: <DollarSign className="w-5 h-5" />,
      color: "amber",
      details: {
        en: "Keep track of payments including initial deposits, advance installments, cash payments, and digital UPI transfers. Generates automated receipts and tracks outstanding payments per customer.",
        hi: "प्रारंभिक जमा, अग्रिम किस्तों, नकद भुगतान और डिजिटल UPI हस्तांतरण सहित भुगतानों पर नज़र रखें। स्वचालित रसीदें उत्पन्न करता है और प्रत्येक ग्राहक के बकाया भुगतान को ट्रैक करता है।",
        te: "డిపాజిట్లు, అడ్వాన్స్ పేమెంెంట్లు, నగదు మరియు డిజిటల్ UPI లావాదేవీలను ట్రాక్ చేయండి. ఆటోమేటిక్ రసీదులను సృష్టించి బ్యాలెన్స్ బకాయిలను లెక్కిస్తుంది."
      },
      actionText: {
        en: "Record Payments System",
        hi: "भुगतान प्रणाली देखें",
        te: "పేమెంట్స్ వ్యవస్థ చూడండి"
      }
    },
    {
      id: 7,
      title: t('feature7Title'),
      desc: t('feature7Desc'),
      icon: <TrendingUp className="w-5 h-5" />,
      color: "purple",
      details: {
        en: "Unlock complete insight into shop performance with analytics showing monthly collections, pending collection pipelines, fabric popularity, and detailed daily earnings charts.",
        hi: "मासिक संग्रह, लंबित भुगतान पाइपलाइन, कपड़ों की लोकप्रियता और विस्तृत दैनिक आय चार्ट दिखाने वाले विश्लेषणों के साथ दुकान के प्रदर्शन की पूरी जानकारी प्राप्त करें।",
        te: "నెలవారీ వసూళ్లు, పెండింగ్ బకాయిలు, బట్టల రకాల డిమాండ్ మరియు రోజువారీ సంపాదన చార్ట్‌లతో దుకాణ పనితీరును పూర్తిగా విశ్లేషించండి."
      },
      actionText: {
        en: "Open Revenue Analytics",
        hi: "राजस्व विश्लेषण खोलें",
        te: "రాబడి విశ్లేషణ తెరవండి"
      }
    },
    {
      id: 8,
      title: t('feature8Title'),
      desc: t('feature8Desc'),
      icon: <ShieldCheck className="w-5 h-5" />,
      color: "pink",
      details: {
        en: "Secure cloud access protects sensitive customer and financial records. Fully localized in English, Hindi, and Telugu, enabling local shop assistants to work comfortably in their local language.",
        hi: "सुरक्षित क्लाउड एक्सेस संवेदनशील ग्राहक और वित्तीय रिकॉर्ड की सुरक्षा करता है। अंग्रेजी, हिंदी और तेलुगु में पूरी तरह से स्थानीयकृत, जिससे स्थानीय दुकान सहायक अपनी भाषा में आसानी से काम कर सकें।",
        te: "కస్టమర్ మరియు ఫైనాన్షియల్ రికార్డులకు పూర్తి భద్రత. ఇంగ్లీష్, హిందీ మరియు తెలుగు భాషలలో లభించడం ద్వారా సిబ్బంది సులభంగా పని చేసుకోవచ్చు."
      },
      actionText: {
        en: "Security Overview",
        hi: "सुरक्षा अवलोकन",
        te: "భద్రతా అవలోకనం"
      }
    }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans animate-fade-in light-landing-bg text-slate-800 relative overflow-hidden">
      
      {/* Floating WhatsApp push notification banner */}
      {showPushBanner && (
        <div className="fixed top-24 right-6 md:right-16 max-w-sm w-[90%] bg-white/95 backdrop-blur-md border border-slate-100 shadow-[0_20px_50px_rgba(124,58,237,0.15)] rounded-3xl p-4.5 flex items-center space-x-3.5 z-[110] animate-notification">
          <div className="p-2.5 bg-emerald-100 border border-emerald-200 rounded-xl text-emerald-600 shrink-0">
            <MessageSquare className="w-5.5 h-5.5" />
          </div>
          <div className="flex-grow text-left">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate-900 tracking-wide uppercase">WhatsApp Alert</span>
              <span className="text-[10px] text-slate-400 font-semibold">now</span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">
              {language === 'en' ? 'Hi Aarav, your order status is: Ready for collection! Please pay remaining balance.' :
               language === 'hi' ? 'नमस्ते आरव, आपका आर्डर स्टेटस है: तैयार है! कृपया शेष राशि का भुगतान करें।' :
               'నమస్తే ఆరవ్, మీ ఆర్డర్ స్థితి: తీసుకోవడానికి సిద్ధంగా ఉంది! బ్యాలెన్స్ పేమెంట్ చేయండి.'}
            </p>
          </div>
        </div>
      )}

      {/* Curved Dotted/Stitched Design Lines in Background */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M 600,-50 Q 800,200 780,400 T 950,750" 
          fill="none" 
          stroke="#7C3AED" 
          strokeWidth="2" 
          strokeDasharray="6,6" 
          className="animate-slow-dash"
          style={{ strokeDashoffset: 0 }}
        />
        <path 
          d="M -100,300 Q 200,100 400,600 T 900,900" 
          fill="none" 
          stroke="#EC4899" 
          strokeWidth="1.5" 
          strokeDasharray="4,6" 
          className="animate-slow-dash opacity-30"
        />
      </svg>

      {/* Floating Sparkles in the background */}
      <div className="absolute top-[20%] right-[15%] text-purple-300 pointer-events-none animate-floating z-0 select-none">
        <Sparkles className="w-16 h-16 opacity-45" />
      </div>
      <div className="absolute top-[50%] right-[8%] text-pink-300 pointer-events-none animate-floating z-0 select-none" style={{ animationDelay: '2s' }}>
        <Sparkles className="w-10 h-10 opacity-35" />
      </div>
      <div className="absolute top-[12%] right-[2%] text-purple-300 pointer-events-none animate-floating z-0 select-none" style={{ animationDelay: '4s' }}>
        <Sparkles className="w-8 h-8 opacity-25" />
      </div>
      <div className="absolute bottom-[35%] left-[5%] text-indigo-300 pointer-events-none animate-floating z-0 select-none" style={{ animationDelay: '3s' }}>
        <Sparkles className="w-12 h-12 opacity-30" />
      </div>

      {/* Realistic 3D floating buttons */}
      <div className="absolute top-[38%] right-[22.5%] z-20 animate-floating pointer-events-auto" style={{ animationDelay: '1s' }}>
        <div className="floating-3d-button">
          <div className="button-hole-grid">
            <div className="button-hole"></div>
            <div className="button-hole"></div>
            <div className="button-hole"></div>
            <div className="button-hole"></div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 py-5 px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-40 flex justify-between items-center bg-white/30 backdrop-blur-md border-b border-white/40">
        
        {/* Brand Header */}
        <div className="flex items-center space-x-3.5 cursor-pointer group" onClick={() => onNavigate('home')}>
          <div className="p-3 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-purple-600/20 group-hover:scale-105 transition-transform duration-300">
            <Scissors className="w-5.5 h-5.5 group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div className="text-left">
            <span className="font-heading text-xl md:text-2xl font-black tracking-tight text-slate-900 flex items-center">
              VastraSilai
              <span className="text-purple-600 ml-0.5 text-xs font-bold font-sans">⁺</span>
            </span>
            <span className="block text-[10px] md:text-[11px] font-extrabold tracking-widest text-purple-600 uppercase leading-none mt-1">
              TAILOR PORTAL
            </span>
          </div>
        </div>
 
        {/* Header Options */}
        <div className="flex items-center space-x-3 md:space-x-5">
          
          {/* Features Navigation Link */}
          <a
            href="#features"
            className="hidden md:flex items-center space-x-2.5 bg-white/60 hover:bg-white/80 border border-slate-200/80 rounded-2xl px-4 py-3 md:px-5.5 md:py-4 text-sm md:text-base font-extrabold text-slate-700 hover:text-purple-600 transition duration-200 cursor-pointer select-none"
          >
            <Compass className="w-5 h-5 text-purple-600 animate-spin" style={{ animationDuration: '8s' }} />
            <span>{t('navFeatures')}</span>
          </a>
 
          {/* About Us Navigation Link */}
          <a
            href="#about"
            className="hidden md:flex items-center space-x-2.5 bg-white/60 hover:bg-white/80 border border-slate-200/80 rounded-2xl px-4 py-3 md:px-5.5 md:py-4 text-sm md:text-base font-extrabold text-slate-700 hover:text-pink-600 transition duration-200 cursor-pointer select-none"
          >
            <Award className="w-5 h-5 text-pink-500" />
            <span>{t('navAbout')}</span>
          </a>

          {/* Custom Styled Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center space-x-2.5 bg-white/60 border border-slate-200/80 hover:bg-white/80 rounded-2xl px-4 py-3 md:px-5.5 md:py-4 text-sm md:text-base font-extrabold text-slate-700 transition cursor-pointer select-none"
            >
              <Globe className="w-5 h-5 text-purple-600" />
              <span className="hidden sm:inline">
                {language === 'en' ? 'English' : language === 'hi' ? 'हिंदी' : 'తెలుగు'}
              </span>
              <span className="sm:hidden">
                {language === 'en' ? 'EN' : language === 'hi' ? 'हिन्दी' : 'తెలుగు'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isLangOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-100 shadow-2xl p-1.5 z-50 overflow-hidden">
                  {langOptions.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => {
                        changeLanguage(opt.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-xs md:text-sm font-bold transition cursor-pointer flex justify-between items-center ${
                        language === opt.code 
                          ? 'bg-purple-50 text-purple-700 font-extrabold border border-purple-100/50' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {language === opt.code && <Check className="w-4 h-4 text-purple-600" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => onNavigate('customer_login')}
            className="flex items-center space-x-2.5 bg-white/60 hover:bg-white/80 border border-slate-200/80 rounded-2xl px-4 py-3 md:px-5.5 md:py-4 text-sm md:text-base font-extrabold text-slate-700 hover:text-pink-600 transition cursor-pointer select-none"
          >
            <Smartphone className="w-5 h-5 text-pink-500" />
            <span className="hidden sm:inline">{t('customerPortal')}</span>
          </button>

          <button
            onClick={() => onNavigate('login')}
            className="flex items-center space-x-2.5 bg-white/60 hover:bg-white/80 border border-slate-200/80 rounded-2xl px-4 py-3 md:px-5.5 md:py-4 text-sm md:text-base font-extrabold text-slate-700 hover:text-purple-600 transition cursor-pointer select-none"
          >
            <Scissors className="w-5 h-5 text-purple-600" />
            <span className="hidden sm:inline">{t('tailorPortal')}</span>
          </button>
        </div>
      </header>

      {/* Main content wrapper */}
      <main className="flex-grow flex flex-col justify-center px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-40 py-10 w-full relative z-10 space-y-24 md:space-y-32">
        
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center w-full pt-4 md:pt-10">
          
          {/* Left Column: Headings & Private Portals */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-8 flex flex-col items-start z-10 text-left">
            <div className="space-y-5">
              {/* Premium Top Badge */}
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-full px-4.5 py-1.5 text-[10px] font-black text-purple-700 tracking-wider shadow-sm animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-spin" style={{ animationDuration: '4s' }} />
                <span>TAILORING REIMAGINED</span>
              </div>

              <h1 className="font-heading text-5xl md:text-7xl font-black tracking-tight text-slate-955 leading-[1.03] select-none">
                {t('heroTitle')}<br />
                <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(124,58,237,0.05)]">
                  {t('heroTitleAccent')}
                </span>
              </h1>
              
              <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-xl font-sans">
                {t('heroSubtitle')}
              </p>
            </div>

            {/* Private Portal Access Channels - First to left, second to right */}
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1: Enter Tailor Workspace */}
              <div 
                onClick={() => onNavigate('login')}
                className="light-glass-card p-6 rounded-[2rem] cursor-pointer flex items-center space-x-4.5 group text-left transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(124,58,237,0.12)] hover:border-purple-600/30"
              >
                <div className="w-13 h-13 bg-purple-600/10 border border-purple-600/15 rounded-2xl flex items-center justify-center text-purple-600 shrink-0 group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-sm shadow-purple-600/5">
                  <Scissors className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div className="flex-grow text-left">
                  <span className="inline-block text-[9px] font-extrabold text-purple-600 uppercase tracking-widest bg-purple-500/10 rounded-md px-1.5 py-0.5 mb-1.5 leading-none">
                    FOR TAILORS
                  </span>
                  <h4 className="text-slate-900 font-black text-lg leading-tight group-hover:text-purple-600 transition-colors">
                    {t('enterTailor')}
                  </h4>
                  <p className="text-slate-500 text-xs mt-1 leading-snug">
                    {t('enterTailorDesc')}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-100/80 flex items-center justify-center text-slate-500 group-hover:bg-purple-600 group-hover:text-white group-hover:translate-x-1.5 transition-all duration-300 shrink-0 shadow-inner">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>

              {/* Card 2: Enter Customer Portal */}
              <div 
                onClick={() => onNavigate('customer_login')}
                className="light-glass-card p-6 rounded-[2rem] cursor-pointer flex items-center space-x-4.5 group text-left transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(236,72,153,0.12)] hover:border-pink-500/30"
              >
                <div className="w-13 h-13 bg-pink-500/10 border border-pink-500/15 rounded-2xl flex items-center justify-center text-pink-500 shrink-0 group-hover:scale-105 group-hover:bg-pink-500 group-hover:text-white transition-all duration-300 shadow-sm shadow-pink-500/5">
                  <Smartphone className="w-6 h-6 group-hover:-rotate-12 transition-transform duration-300" />
                </div>
                <div className="flex-grow text-left">
                  <span className="inline-block text-[9px] font-extrabold text-pink-600 uppercase tracking-widest bg-pink-500/10 rounded-md px-1.5 py-0.5 mb-1.5 leading-none">
                    FOR CUSTOMERS
                  </span>
                  <h4 className="text-slate-900 font-black text-lg leading-tight group-hover:text-pink-600 transition-colors">
                    {t('enterCustomer')}
                  </h4>
                  <p className="text-slate-500 text-xs mt-1 leading-snug">
                    {t('enterCustomerDesc')}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-100/80 flex items-center justify-center text-slate-500 group-hover:bg-pink-500 group-hover:text-white group-hover:translate-x-1.5 transition-all duration-300 shrink-0 shadow-inner">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Hero 3D Rolling Globe */}
          <div className="lg:col-span-6 xl:col-span-5 flex items-center justify-center relative w-full select-none z-10 lg:pl-10">
            {/* Soft Shadow behind the globe */}
            <div className="absolute top-[25%] left-[25%] right-[25%] bottom-[5%] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>
            
            <RollingGlobe />
          </div>

        </section>


        {/* Features Section */}
        <section id="features" className="scroll-mt-24 space-y-16">
          <div className="text-center space-y-4 max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/20 text-purple-600 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              <span>{t('navFeatures')}</span>
            </div>
            <h2 className="font-heading text-5xl md:text-6xl font-black tracking-tight text-slate-955 leading-tight">
              {t('appName')} <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent">{t('tagline')}</span>
            </h2>
            <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto font-sans leading-relaxed">
              Explore how we bring intelligent cloud features to local tailoring shops.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const style = themeMap[feature.color] || themeMap.purple;
              return (
                <div 
                  key={feature.id}
                  onClick={() => setActiveFeature(feature)}
                  className={`light-glass-card p-8 rounded-[2.5rem] group hover:scale-[1.03] hover:-translate-y-1 ${style.shadow} hover:border-transparent transition-all duration-300 flex flex-col justify-between cursor-pointer`}
                >
                  <div>
                    <div className={`w-14 h-14 ${style.bg} border ${style.border} ${style.text} rounded-[1.25rem] flex items-center justify-center shrink-0 mb-6 ${style.hoverBg} ${style.hoverIcon} transition-all duration-300 shadow-sm shadow-purple-600/5`}>
                      {React.cloneElement(feature.icon, { className: "w-6.5 h-6.5 group-hover:scale-110 transition-all duration-300" })}
                    </div>
                    <span className={`inline-block text-[9px] font-extrabold uppercase tracking-widest ${style.badge} rounded-md px-1.5 py-0.5 mb-2 leading-none`}>
                      {feature.id === 1 ? "MEASURE" :
                       feature.id === 2 ? "LEDGER" :
                       feature.id === 3 ? "ALERTS" :
                       feature.id === 4 ? "PORTAL" :
                       feature.id === 5 ? "SCHEDULE" :
                       feature.id === 6 ? "FINANCE" :
                       feature.id === 7 ? "GROWTH" : "SECURITY"}
                    </span>
                    <h4 className="text-slate-900 font-black text-xl mb-2.5 group-hover:text-purple-600 transition-colors">
                      {feature.title}
                    </h4>
                    <p className="text-slate-500 text-xs md:text-[13px] leading-relaxed font-sans min-h-[48px]">
                      {feature.desc}
                    </p>
                  </div>


                </div>
              );
            })}
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="scroll-mt-24 space-y-16 pb-8">
          <div className="text-center space-y-4 max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-pink-500/10 border border-pink-500/20 text-pink-600 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>{t('navAbout')}</span>
            </div>
            <h2 className="font-heading text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
              {t('aboutTitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            
            {/* Description Text block */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <p className="text-slate-600 text-base md:text-lg leading-relaxed font-sans">
                {t('aboutDesc1')}
              </p>
              <p className="text-slate-600 text-base md:text-lg leading-relaxed font-sans">
                {t('aboutDesc2')}
              </p>
            </div>

            {/* Mission / Vision Cards */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              
              {/* Mission Card */}
              <div className="light-glass-card p-7 md:p-8 rounded-[2rem] border border-purple-500/10 hover:border-purple-500/20 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/15 rounded-[1.25rem] flex items-center justify-center text-purple-600 mb-5 shrink-0">
                    <Compass className="w-6.5 h-6.5" />
                  </div>
                  <h4 className="text-slate-900 font-extrabold text-lg md:text-xl mb-2">
                    {t('aboutMission')}
                  </h4>
                  <p className="text-slate-500 text-xs md:text-[13px] leading-relaxed">
                    {t('aboutMissionDesc')}
                  </p>
                </div>
              </div>

              {/* Vision Card */}
              <div className="light-glass-card p-7 md:p-8 rounded-[2rem] border border-pink-500/10 hover:border-pink-500/20 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 bg-pink-500/10 border border-pink-500/15 rounded-[1.25rem] flex items-center justify-center text-pink-500 mb-5 shrink-0">
                    <Award className="w-6.5 h-6.5" />
                  </div>
                  <h4 className="text-slate-900 font-extrabold text-lg md:text-xl mb-2">
                    {t('aboutVision')}
                  </h4>
                  <p className="text-slate-500 text-xs md:text-[13px] leading-relaxed">
                    {t('aboutVisionDesc')}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Detailed Popup Modal in Light Theme Style */}
      {activeFeature && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 modal-backdrop"
            onClick={() => setActiveFeature(null)}
          ></div>
          
          {/* Modal Content */}
          <div className="w-full max-w-lg rounded-3xl p-8 relative z-10 bg-white border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),_0_0_50px_rgba(124,58,237,0.06)] flex flex-col space-y-6 overflow-hidden">
            {/* Decorative corner glow */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-10 bg-${activeFeature.color}-500 pointer-events-none`}></div>
            
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3.5">
                <div className={`p-3.5 rounded-2xl flex items-center justify-center bg-${activeFeature.color}-500/10 text-${activeFeature.color}-600 border border-${activeFeature.color}-500/20`}>
                  {activeFeature.icon}
                </div>
                <h3 className="text-slate-900 text-2xl font-black font-heading tracking-tight leading-tight">
                  {activeFeature.title}
                </h3>
              </div>
              <button 
                onClick={() => setActiveFeature(null)}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Detailed text */}
            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed font-sans text-left">
                {activeFeature.details[language] || activeFeature.details['en']}
              </p>
              
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1 text-left">
                <span className="text-[10px] text-purple-600 font-extrabold uppercase tracking-widest">
                  {language === 'en' ? 'Core Advantage' : language === 'hi' ? 'मुख्य लाभ' : 'ముఖ్య ప్రయోజనం'}
                </span>
                <p className="text-xs text-slate-800 font-bold">
                  {activeFeature.benefit ? (activeFeature.benefit[language] || activeFeature.benefit['en']) : (
                    language === 'en' ? 'Increases shop booking throughput and client satisfaction.' : 
                    language === 'hi' ? 'दुकान की बुकिंग दक्षता और ग्राहक संतुष्टि बढ़ाता है।' : 
                    'షాప్ బుకింగ్ సామర్థ్యాన్ని మరియు కస్టమర్ సంతృప్తిని పెంచుతుంది.'
                  )}
                </p>
              </div>
            </div>
            
            {/* Footer / CTA inside modal */}
            <div className="pt-2 flex space-x-3">
              <button
                onClick={() => {
                  setActiveFeature(null);
                  if (activeFeature.id === 3) {
                    triggerWhatsappSimulation();
                  } else if (activeFeature.id === 4) {
                    onNavigate('customer_login');
                  } else {
                    onNavigate('login');
                  }
                }}
                className={`flex-grow py-3.5 px-5 rounded-2xl font-bold text-xs text-white transition-all duration-300 shadow-md flex items-center justify-center space-x-1.5 cursor-pointer ${
                  activeFeature.color === 'purple' ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20' :
                  activeFeature.color === 'blue' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20' :
                  activeFeature.color === 'pink' ? 'bg-pink-600 hover:bg-pink-500 shadow-pink-600/20' :
                  activeFeature.color === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' :
                  'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                }`}
              >
                <span>{activeFeature.actionText[language] || activeFeature.actionText['en']}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              
              <button 
                onClick={() => setActiveFeature(null)}
                className="py-3.5 px-5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition cursor-pointer"
              >
                {language === 'en' ? 'Close' : language === 'hi' ? 'बंद करें' : 'మూసివేయి'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Features Bar */}
      <footer className="border-t border-slate-200/50 bg-white/20 backdrop-blur-md py-8 px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-40 relative z-10">
        <div className="flex flex-col md:flex-row items-stretch justify-between gap-6 md:gap-0 w-full">
          
          {/* Feature 1 */}
          <div className="flex-grow flex items-center justify-center md:justify-start space-x-5 py-3 md:pr-10 text-left md:border-r border-slate-200/50">
            <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
              <Ruler className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h5 className="text-slate-900 font-extrabold text-base md:text-lg">{t('smartMeasurements')}</h5>
              <p className="text-slate-500 text-xs md:text-sm mt-0.5">{t('smartMeasurementsSub')}</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex-grow flex items-center justify-center md:justify-start space-x-5 py-3 md:px-10 text-left md:border-r border-slate-200/50">
            <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h5 className="text-slate-900 font-extrabold text-base md:text-lg">{t('orderManagement')}</h5>
              <p className="text-slate-500 text-xs md:text-sm mt-0.5">{t('orderManagementSub')}</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex-grow flex items-center justify-center md:justify-start space-x-5 py-3 md:pl-10 text-left">
            <div className="w-12 h-12 bg-pink-500/10 border border-pink-500/20 text-pink-600 rounded-xl flex items-center justify-center shrink-0">
              <Bell className="w-6 h-6 animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
            <div className="text-left">
              <h5 className="text-slate-900 font-extrabold text-base md:text-lg">{t('smartNotifications')}</h5>
              <p className="text-slate-500 text-xs md:text-sm mt-0.5">{t('smartNotificationsSub')}</p>
            </div>
          </div>

        </div>

        {/* Localized Copyright */}
        <div className="border-t border-slate-200/40 mt-6 pt-4 text-center text-slate-400 text-[11px] font-semibold tracking-wide">
          © 2026 VastraSilai. Designed for Premium Tailoring.
        </div>
      </footer>

    </div>
  );
}
