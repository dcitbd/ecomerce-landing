/* Dream Cart BD - Pre-seeded Categories */
const DEFAULT_CATEGORIES = [
  { id: 1, name: "ফাইল ও ফোল্ডার", english_name: "Files & Folders", icon: "fa-solid fa-folder-open", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80", description: "অফিসের জরুরি ডকুমেন্টস ও ফাইল সংরক্ষণের সামগ্রী" },
  { id: 2, name: "ডেস্ক অর্গানাইজার", english_name: "Desk Organizers", icon: "fa-solid fa-boxes-stacked", image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&auto=format&fit=crop&q=80", description: "টেবিল ও ওয়ার্কস্পেস গুছিয়ে রাখার প্রিমিয়াম ট্রয় ও স্ট্যান্ড" },
  { id: 3, name: "কাগজ ও প্রিন্টিং", english_name: "Paper & Printing", icon: "fa-solid fa-print", image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&auto=format&fit=crop&q=80", description: "উচ্চমানের A4, F4 পেপার ও প্রিন্টিং এক্সেসরিজ" },
  { id: 4, name: "খাতা ও নোটপ্যাড", english_name: "Notebooks & Notepads", icon: "fa-solid fa-book-open", image: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=400&auto=format&fit=crop&q=80", description: "অফিস মিটিং, নোট ও হিসাব সংরক্ষণের খাতা" },
  { id: 5, name: "কলম ও মার্কার", english_name: "Pens & Markers", icon: "fa-solid fa-pen-fancy", image: "https://images.unsplash.com/photo-1583521214690-73421a1829a9?w=400&auto=format&fit=crop&q=80", description: "স্মুথ রাইটিং জেল পেন, বলপেন ও হোয়াইটবোর্ড মার্কার" },
  { id: 6, name: "স্টেশনারি টুলস", english_name: "Stationery Tools", icon: "fa-solid fa-scissors", image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&auto=format&fit=crop&q=80", description: "স্ট্যাপলার, পাঞ্চ মেশিন, কাটার ও অফিস অ্যাক্সেসরিজ" },
  { id: 7, name: "ইলেকট্রনিক্স ও হিসাব", english_name: "Electronics & Calculators", icon: "fa-solid fa-calculator", image: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=400&auto=format&fit=crop&q=80", description: "সঠিক হিসাবের জন্য অরিজিনাল ক্যালকুলেটর ও ব্যাটারি" }
];


/* Dream Cart BD - Pre-seeded Brands */
const DEFAULT_BRANDS = [
  { id: 1, name: "Deli", bangla_name: "ডেলি", logo: "https://images.unsplash.com/photo-1583521214690-73421a1829a9?w=200&auto=format&fit=crop&q=80", description: "আন্তর্জাতিক মানের অফিস ও স্টেশনারি ব্র্যান্ড" },
  { id: 2, name: "Casio", bangla_name: "ক্যাসিও", logo: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=200&auto=format&fit=crop&q=80", description: "অরিজিনাল ক্যালকুলেটর ও টেকনোলজি ব্র্যান্ড" },
  { id: 3, name: "Double A", bangla_name: "ডাবল এ", logo: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=200&auto=format&fit=crop&q=80", description: "প্রিমিয়াম পেপার ও ডকুমেন্ট সমাধান" },
  { id: 4, name: "Kangaro", bangla_name: "ক্যাঙ্গারু", logo: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80", description: "স্ট্যাপলার, পাঞ্চ মেশিন ও হেভি ডিউটি বাইন্ডিং টুলস" },
  { id: 5, name: "Brother", bangla_name: "ব্রাদার", logo: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=200&auto=format&fit=crop&q=80", description: "লেবেল প্রিন্টার ও অফিস টেকনোলজি" },
  { id: 6, name: "Dream Cart BD", bangla_name: "ড্রিম কার্ট সিগনেচার", logo: "https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg", description: "ড্রিম কার্ট নিজস্ব এক্সক্লুসিভ কালেকশন" }
];

/* Dream Cart BD - Pre-seeded Office Equipment Catalog (20 Products) */
const DEFAULT_PRODUCTS = [
  {
    "id": 1,
    "name": "লেভার আর্চ বক্স ফাইল (৩ ইঞ্চি)",
    "english_name": "Lever Arch Box File (3 Inch)",
    "category": "ফাইল ও ফোল্ডার",
    "min_price": 180,
    "max_price": 350,
    "price": 240,
    "original_price": 350,
    "images": [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583521214690-73421a1829a9?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517842645767-c639042777db?w=700&auto=format&fit=crop&q=80"
    ],
    "colors": [
      "কালো (Black)",
      "নীল (Blue)",
      "লাল (Red)",
      "সবুজ (Green)"
    ],
    "sizes": [
      "৩ ইঞ্চি স্ট্যান্ডার্ড",
      "২.৫ ইঞ্চি স্লিম",
      "৪ ইঞ্চি জাম্বো"
    ],
    "stock": 150,
    "rating": 4.9,
    "reviews_count": 86,
    "badge": "বেস্ট সেলার",
    "brand": "Deli",
    "description": "অফিসের জরুরি কাগজপত্র সুশৃঙ্খলভাবে সংরক্ষণের জন্য সর্বোচ্চ মানের হার্ডবোর্ড লেভার আর্চ বক্স ফাইল। প্রিমিয়াম মেটাল ক্লিপ ও মেটাল এজ প্রোটেকশন।",
    "status": "active"
  },
  {
    "id": 2,
    "name": "২-রিং বাইন্ডার ফাইল A4",
    "english_name": "2-Ring Binder File A4",
    "category": "ফাইল ও ফোল্ডার",
    "min_price": 130,
    "max_price": 450,
    "price": 190,
    "original_price": 280,
    "images": [
      "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=700&auto=format&fit=crop&q=80"
    ],
    "colors": [
      "রয়েল ব্লু",
      "ক্লাসিক ব্ল্যাক",
      "গ্রে",
      "নেভি ব্লু"
    ],
    "sizes": [
      "A4 Standard (25mm Ring)",
      "A4 Heavy (40mm Ring)"
    ],
    "stock": 120,
    "rating": 4.8,
    "reviews_count": 64,
    "badge": "জনপ্রিয়",
    "brand": "Deli",
    "description": "দৈনন্দিন অফিসিয়াল রিপোর্ট ও প্রেজেন্টেশন ফাইলিংয়ের জন্য সহজে ওপেনযোগ্য ২-রিং স্টেইনলেস মেকানিজম বাইন্ডার ফাইল।",
    "status": "active"
  },
  {
    "id": 3,
    "name": "১২/১৩ পকেট এক্সপ্যান্ডিং ফাইল",
    "english_name": "12/13 Pocket Expanding File Folder",
    "category": "ফাইল ও ফোল্ডার",
    "min_price": 350,
    "max_price": 1300,
    "price": 480,
    "original_price": 650,
    "images": [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583521214690-73421a1829a9?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517842645767-c639042777db?w=700&auto=format&fit=crop&q=80"
    ],
    "colors": [
      "মাল্টিকালার ইনডেক্স",
      "কালো",
      "নীল"
    ],
    "sizes": [
      "12 Pocket A4",
      "13 Pocket FC Legal"
    ],
    "stock": 75,
    "rating": 4.9,
    "reviews_count": 112,
    "badge": "হট অফার",
    "brand": "Deli",
    "description": "মাসিক হিসাব, রসিদ ও ভাউচার ক্যাটাগরিভিত্তিক গুছিয়ে রাখার জন্য কালারফুল ট্যাগযুক্ত ১৩ পকেট প্রিমিয়াম এক্সপ্যান্ডিং ফাইল ফোল্ডার।",
    "status": "active"
  },
  {
    "id": 4,
    "name": "৩-লেয়ার মেটাল মেশ ডকুমেন্ট ট্রে",
    "english_name": "3-Tier Metal Mesh Document Tray",
    "category": "ডেস্ক অর্গানাইজার",
    "min_price": 380,
    "max_price": 1700,
    "price": 590,
    "original_price": 850,
    "images": [
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=700&auto=format&fit=crop&q=80"
    ],
    "colors": [
      "ম্যাট ব্ল্যাক",
      "মেটালিক সিলভার"
    ],
    "sizes": [
      "৩ লেয়ার স্ট্যান্ডার্ড",
      "৪ লেয়ার হেভি"
    ],
    "stock": 60,
    "rating": 5.0,
    "reviews_count": 92,
    "badge": "প্রিমিয়াম",
    "brand": "Deli",
    "description": "মজবুত স্টিল মেশ মেটাল বডি দিয়ে তৈরি ৩ স্তরের আধুনিক ডকুমেন্ট ট্রে। ফাইল, খাতা ও ড্রাফট পেপার দ্রুত হাতের কাছে রাখার সেরা সমাধান।",
    "status": "active"
  },
  {
    "id": 5,
    "name": "৪-কম্পার্টমেন্ট ম্যাগাজিন ও ফাইল র্যাক",
    "english_name": "4-Compartment Magazine & File Rack",
    "category": "ডেস্ক অর্গানাইজার",
    "min_price": 450,
    "max_price": 1600,
    "price": 620,
    "original_price": 890,
    "images": [
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=700&auto=format&fit=crop&q=80"
    ],
    "colors": [
      "কালো",
      "ধূসর",
      "গাঢ় নীল"
    ],
    "sizes": [
      "৪ স্লট পলিমার",
      "৪ স্লট মেটাল মেশ"
    ],
    "stock": 45,
    "rating": 4.8,
    "reviews_count": 58,
    "badge": "অফিস স্পেশাল",
    "brand": "Deli",
    "description": "বই, ক্যাটালগ ও রেজিস্টার খাতা খাড়াভাবে সাজিয়ে রাখার জন্য ডিউরেবল ৪-কম্পার্টমেন্ট ম্যাগাজিন ফাইল হোল্ডার।",
    "status": "active"
  },
  {
    "id": 6,
    "name": "এক্সিকিউটিভ লেদার ডকুমেন্ট ফোল্ডার",
    "english_name": "Executive Leather Document Folder",
    "category": "ফাইল ও ফোল্ডার",
    "min_price": 450,
    "max_price": 1200,
    "price": 690,
    "original_price": 950,
    "images": [
      "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=700&auto=format&fit=crop&q=80"
    ],
    "colors": [
      "চকলেট ব্রাউন",
      "জেট ব্ল্যাক",
      "ট্যান ব্রাউন"
    ],
    "sizes": [
      "A4 জিপার সহ",
      "A4 ম্যাগনেটিক বাটন"
    ],
    "stock": 80,
    "rating": 4.9,
    "reviews_count": 140,
    "badge": "টপ রেটেড",
    "brand": "Deli",
    "description": "মিটিং, ইন্টারভিউ ও কনফারেন্সের জন্য প্রিমিয়াম পিইউ লেদার ফাইল ফোল্ডার। পেন হোল্ডার, ভিজিটিং কার্ড স্লট এবং রাইটিং প্যাড ইনক্লুডেড।",
    "status": "active"
  },
  {
    "id": 7,
    "name": "মেটাল বুকএন্ড সাপোর্ট স্ট্যান্ড (১ জোড়া)",
    "english_name": "Heavy Metal Bookends Stand (1 Pair)",
    "category": "ডেস্ক অর্গানাইজার",
    "min_price": 200,
    "max_price": 900,
    "price": 340,
    "original_price": 480,
    "images": [
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=700&auto=format&fit=crop&q=80"
    ],
    "colors": [
      "কালো",
      "সাদা",
      "রয়েল ব্লু"
    ],
    "sizes": [
      "মিডিয়াম ৭ ইঞ্চি",
      "লার্জ ৮.৫ ইঞ্চি"
    ],
    "stock": 90,
    "rating": 4.7,
    "reviews_count": 42,
    "badge": "কম্বো অফার",
    "brand": "Deli",
    "description": "ভারী খাতা ও বই ডেস্কে সুশৃঙ্খল রাখতে মজবুত হেভি মেটাল বুকএন্ড। নিচে নন-স্কিড অ্যান্টি-স্লিপ ফোম প্যাড যুক্ত।",
    "status": "active"
  },
  {
    "id": 8,
    "name": "রোটেটিং মাল্টি-গ্রিড ডেস্ক অর্গানাইজার",
    "english_name": "Rotating Multi-Grid Desk Organizer",
    "category": "ডেস্ক অর্গানাইজার",
    "min_price": 180,
    "max_price": 650,
    "price": 290,
    "original_price": 420,
    "images": [
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=700&auto=format&fit=crop&q=80"
    ],
    "colors": [
      "হোয়াইট",
      "স্মোকি ব্ল্যাক",
      "পেস্টাল গ্রিন"
    ],
    "sizes": [
      "৩৬০ ডিগ্রি ৩৬০° রোটেশন ৫-গ্রিড"
    ],
    "stock": 110,
    "rating": 4.9,
    "reviews_count": 135,
    "badge": "ভাইরাল প্রোডাক্ট",
    "brand": "Deli",
    "description": "৩৬০ ডিগ্রি রোটেটিং পেন, পেন্সিল, ক্লিপ ও স্ট্যাপলার গুছিয়ে রাখার মাল্টি-গ্রিড আধুনিক ডেস্ক পেন স্ট্যান্ড।",
    "status": "active"
  },
  {
    "id": 9,
    "name": "A4 পেপার ৮০ GSM (১ রিম / ৫০০ পাতা)",
    "english_name": "A4 Paper 80 GSM (1 Ream / 500 Sheets)",
    "category": "কাগজ ও প্রিন্টিং",
    "min_price": 450,
    "max_price": 750,
    "price": 520,
    "original_price": 600,
    "images": [
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583521214690-73421a1829a9?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=700&auto=format&fit=crop&q=80"
    ],
    "colors": [
      "স্নো হোয়াইট (Ultra White)"
    ],
    "sizes": [
      "A4 (210 x 297 mm) 80 GSM"
    ],
    "stock": 500,
    "rating": 5.0,
    "reviews_count": 310,
    "badge": "অরিজিনাল গ্যারান্টি",
    "brand": "Deli",
    "description": "হাই-স্পিড লেজার ও কালার প্রিন্টারের জন্য জ্যাম-ফ্রি ১০০% প্রিমিয়াম হোয়াইট ৮০ জিএসএম A4 সাইজ পেপার। ৫০০ পাতার পূর্ণ রিম।",
    "status": "active"
  },
  {
    "id": 10,
    "name": "অ্যাকাউন্টস রেজিস্টার খাতা (৫০০ পৃষ্ঠা)",
    "english_name": "Heavy Accounts Register Khata (500 Pages)",
    "category": "খাতা ও নোটপ্যাড",
    "min_price": 180,
    "max_price": 550,
    "price": 280,
    "original_price": 380,
    "images": [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517842645767-c639042777db?w=700&auto=format&fit=crop&q=80"
    ],
    "colors": [
      "মেরুন হার্ডবোর্ড",
      "নেভি ব্লু হার্ডবোর্ড"
    ],
    "sizes": [
      "৫০০ পৃষ্ঠা ফোলিও সাইজ",
      "৩০০ পৃষ্ঠা স্ট্যান্ডার্ড"
    ],
    "stock": 140,
    "rating": 4.8,
    "reviews_count": 78,
    "badge": "অ্যাকাউন্টস চয়েস",
    "brand": "Deli",
    "description": "ব্যবসায়িক দৈনিক জমা-খরচ, ক্যাশ বুক ও হিসাব সংরক্ষণে মজবুত সেলাই ও মোটা ভালো মানের পৃষ্ঠাযুক্ত রেজিস্টার খাতা।",
    "status": "active"
  },
  {
    "id": 11,
    "name": "সেলফ-আঠালো স্টিকি নোটস (৩x৩ ইঞ্চি)",
    "english_name": "Self-Adhesive Sticky Notes (3x3 Inch)",
    "category": "খাতা ও নোটপ্যাড",
    "min_price": 25,
    "max_price": 120,
    "price": 45,
    "original_price": 70,
    "images": [
      "https://images.unsplash.com/photo-1585336261026-418041530e38?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1569683795645-b62e50fbf103?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583521214690-73421a1829a9?w=700&auto=format&fit=crop&q=80"
    ],
    "colors": [
      "নিওন হলুদ",
      "গোলাপি",
      "সবুজ",
      "আকাশি"
    ],
    "sizes": [
      "৩ x ৩ ইঞ্চি (১০০ শিট প্যাড)"
    ],
    "stock": 350,
    "rating": 4.9,
    "reviews_count": 189,
    "badge": "বেস্ট ভ্যালু",
    "brand": "Deli",
    "description": "গুরুত্বপূর্ণ নোট, রিমাইন্ডার ও বুকমার্কের জন্য শক্তিশালী কিন্তু সহজে অপসারণযোগ্য সেলফ-অ্যাধেসিভ স্টিকি নোট প্যাড।",
    "status": "active"
  },
  {
    "id": 12,
    "name": "অফিসিয়াল ব্লু বলপেন বক্স (২০ পিস)",
    "english_name": "Official Blue Ballpoint Pen (Box of 20)",
    "category": "কলম ও মার্কার",
    "min_price": 80,
    "max_price": 240,
    "price": 140,
    "original_price": 190,
    "images": [
      "https://images.unsplash.com/photo-1585336261026-418041530e38?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1569683795645-b62e50fbf103?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=700&auto=format&fit=crop&q=80"
    ],
    "colors": [
      "নীল কালি (Blue)",
      "কালো কালি (Black)"
    ],
    "sizes": [
      "০.৭ মিমি স্মুথ টিপ (২০ পিস বক্স)"
    ],
    "stock": 250,
    "rating": 4.9,
    "reviews_count": 215,
    "badge": "দৈনন্দিন অফিস",
    "brand": "Deli",
    "description": "স্মুথ ও একটানা লেখার নিশ্চয়তা সহ অফিসিয়াল স্ম্যাজ-ফ্রি ০.৭ মিমি বলপয়েন্ট কলমের ২০ পিসের ফুল বক্স।",
    "status": "active"
  },
  {
    "id": 13,
    "name": "হোয়াইটবোর্ড মার্কার পেন (কালো/নীল/লাল)",
    "english_name": "Dry Erase Whiteboard Marker Pen",
    "category": "কলম ও মার্কার",
    "min_price": 25,
    "max_price": 100,
    "price": 45,
    "original_price": 65,
    "images": [
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&auto=format&fit=crop&q=80"
    ],
    "colors": [
      "কালো",
      "নীল",
      "লাল",
      "সবুজ"
    ],
    "sizes": [
      "বুলেট টিপ ২.০ মিমি",
      "চিজেল টিপ ৪.০ মিমি"
    ],
    "stock": 280,
    "rating": 4.8,
    "reviews_count": 105,
    "badge": "জনপ্রিয়",
    "brand": "Deli",
    "description": "সহজে দাগ না রেখে মুছে ফেলা যায় এমন প্রাণবন্ত কালির হাই-কোয়ালিটি নন-টক্সিক অফিস হোয়াইটবোর্ড মার্কার।",
    "status": "active"
  },
  {
    "id": 14,
    "name": "টেবিল রোটারি মেশিন শার্পনার",
    "english_name": "Table Rotary Mechanical Pencil Sharpener",
    "category": "স্টেশনারি টুলস",
    "min_price": 120,
    "max_price": 650,
    "price": 260,
    "original_price": 380,
    "images": [
      "https://images.unsplash.com/photo-1585336261026-418041530e38?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1569683795645-b62e50fbf103?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583521214690-73421a1829a9?w=700&auto=format&fit=crop&q=80"
    ],
    "colors": [
      "মেটালিক ব্লু",
      "রেড",
      "ব্ল্যাক"
    ],
    "sizes": [
      "টেবিল মাউন্ট মেকানিজম"
    ],
    "stock": 65,
    "rating": 4.7,
    "reviews_count": 52,
    "badge": "হেভি ডিউটি",
    "brand": "Deli",
    "description": "টেবিলে ক্লাম্প করে পেন্সিল নিখুঁত ও দ্রুত ধার দেওয়ার জন্য মজবুত রোটারি মেটাল কাটার শার্পনিং মেশিন।",
    "status": "active"
  },
  {
    "id": 15,
    "name": "সেলফ-ইনকিং ডেটার স্ট্যাম্প",
    "english_name": "Self-Inking Date Stamp",
    "category": "স্টেশনারি টুলস",
    "min_price": 350,
    "max_price": 950,
    "price": 490,
    "original_price": 680,
    "images": [
      "https://images.unsplash.com/photo-1585336261026-418041530e38?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1569683795645-b62e50fbf103?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583521214690-73421a1829a9?w=700&auto=format&fit=crop&q=80"
    ],
    "colors": [
      "কালো ফ্রেম / নীল কালি",
      "লাল কালি"
    ],
    "sizes": [
      "এডজাস্টেবল তারিখ রোলার (১০ বছর মেয়াদি)"
    ],
    "stock": 70,
    "rating": 4.9,
    "reviews_count": 94,
    "badge": "অফিস এসেনশিয়াল",
    "brand": "Deli",
    "description": "ভাউচার, চিঠি ও রিসিভিং ডকুমেন্টে স্বয়ংক্রিয়ভাবে তারিখ স্ট্যাম্প করার জন্য টেকসই সেলফ-ইনকিং ডেটার স্ট্যাম্প।",
    "status": "active"
  },
  {
    "id": 16,
    "name": "স্ট্যান্ডার্ড অফিস স্ট্যাপলার (24/6)",
    "english_name": "Standard Office Desktop Stapler (24/6)",
    "category": "স্টেশনারি টুলস",
    "min_price": 95,
    "max_price": 350,
    "price": 165,
    "original_price": 240,
    "images": [
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1585336261026-418041530e38?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583521214690-73421a1829a9?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=700&auto=format&fit=crop&q=80"
    ],
    "colors": [
      "ব্ল্যাক",
      "ক্লাসিক গ্রে",
      "ব্লু"
    ],
    "sizes": [
      "24/6 ও 26/6 পিন সাইজ (৩০ শিট ক্যাপাসিটি)"
    ],
    "stock": 200,
    "rating": 4.9,
    "reviews_count": 160,
    "badge": "টপ কোয়ালিটি",
    "brand": "Deli",
    "description": "অফিসের ৩০ পাতা পর্যন্ত কাগজ সহজে পিন করার জন্য দীর্ঘস্থায়ী স্টিল মেকানিজম ডেস্কটপ স্ট্যাপলার।",
    "status": "active"
  },
  {
    "id": 17,
    "name": "হেভি ডিউটি বোর্ড স্ট্যাপলার (৫০–১০০ শিট)",
    "english_name": "Heavy Duty Plier/Lever Stapler (50-100 Sheets)",
    "category": "স্টেশনারি টুলস",
    "min_price": 550,
    "max_price": 2200,
    "price": 890,
    "original_price": 1250,
    "images": [
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1585336261026-418041530e38?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583521214690-73421a1829a9?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=700&auto=format&fit=crop&q=80"
    ],
    "colors": [
      "সিলভার/ব্ল্যাক অল-মেটাল"
    ],
    "sizes": [
      "23/8 থেকে 23/13 পিন (১০০ পাতা বাইন্ডিং)"
    ],
    "stock": 40,
    "rating": 5.0,
    "reviews_count": 82,
    "badge": "হেভি ওয়ার্ক",
    "brand": "Deli",
    "description": "বই, বড় ফাইল ও ১০০ পৃষ্ঠা পর্যন্ত মোটা বান্ডেল একসাথে স্ট্যাপল করার জন্য পাওয়ারফুল অল-স্টিল হেভি ডিউটি স্ট্যাপলার।",
    "status": "active"
  },
  {
    "id": 18,
    "name": "২-হোল পেপার পাঞ্চ মেশিন (মিডিয়াম)",
    "english_name": "2-Hole Desktop Paper Punch Machine",
    "category": "স্টেশনারি টুলস",
    "min_price": 180,
    "max_price": 500,
    "price": 240,
    "original_price": 340,
    "images": [
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1585336261026-418041530e38?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583521214690-73421a1829a9?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=700&auto=format&fit=crop&q=80"
    ],
    "colors": [
      "কালো",
      "নীল",
      "ধূসর"
    ],
    "sizes": [
      "২৫ শিট পাঞ্চ ক্যাপাসিটি (80mm স্পেসিং)"
    ],
    "stock": 130,
    "rating": 4.8,
    "reviews_count": 75,
    "badge": "বেস্ট সেলার",
    "brand": "Deli",
    "description": "বাইন্ডার ফাইলে কাগজ ঢোকানোর জন্য নিখুঁত ২-ছিদ্র বিশিষ্ট পেপার পাঞ্চ মেশিন। পেপার অ্যালাইনমেন্ট গাইড স্কেল সহ।",
    "status": "active"
  },
  {
    "id": 19,
    "name": "ভারী ডেস্কটপ টেপ ডিসপেনসার",
    "english_name": "Heavy Weighted Desktop Tape Dispenser",
    "category": "স্টেশনারি টুলস",
    "min_price": 160,
    "max_price": 850,
    "price": 280,
    "original_price": 390,
    "images": [
      "https://images.unsplash.com/photo-1585336261026-418041530e38?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1569683795645-b62e50fbf103?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583521214690-73421a1829a9?w=700&auto=format&fit=crop&q=80"
    ],
    "colors": [
      "কালো",
      "রয়েল ব্লু"
    ],
    "sizes": [
      "১/২ ইঞ্চি ও ১ ইঞ্চি টেপ কোর ডুয়াল সাইজ"
    ],
    "stock": 115,
    "rating": 4.8,
    "reviews_count": 88,
    "badge": "টেকসই",
    "brand": "Deli",
    "description": "এক হাতে টান দিয়ে সহজেই স্কচটেপ কাটার সুবিধাযুক্ত ভারী বেস ও নন-স্লিপ রাবার বটম সমৃদ্ধ টেপ ডিসপেনসার।",
    "status": "active"
  },
  {
    "id": 20,
    "name": "১২-ডিজিট ডেস্কটপ ক্যালকুলেটর",
    "english_name": "12-Digit Large Desktop Electronic Calculator",
    "category": "ইলেকট্রনিক্স ও হিসাব",
    "min_price": 350,
    "max_price": 2200,
    "price": 490,
    "original_price": 700,
    "images": [
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=700&auto=format&fit=crop&q=80"
    ],
    "colors": [
      "সিলভার মেটালিক ফেস",
      "ম্যাট ব্ল্যাক"
    ],
    "sizes": [
      "১২ ডিজিট বড় ডিসপ্লে (ডুয়াল পাওয়ার সোয়েলার + ব্যাটারি)"
    ],
    "stock": 160,
    "rating": 4.9,
    "reviews_count": 195,
    "badge": "টপ রেটেড",
    "brand": "Deli",
    "description": "অফিস ও শপের দ্রুত ও নির্ভুল হিসাব-নিকাশের জন্য বড় বোতাম ও বিগ ডিসপ্লে যুক্ত সোলার প্লাস ব্যাটারি পাওয়ার্ড ক্যালকুলেটর।",
    "status": "active"
  }
];
