// ============================================================
// MS FASHIONS — Central constants file
// Edit this file to update brand info across the entire site
// ============================================================

export const BRAND = {
  name: "MS Fashions",
  tagline: "Timeless Indian Elegance, Curated for You.",
  description:
    "A luxury appointment-based boutique specialising in Indian and Pakistani traditional wear. We bring the finest Chikankari, Kamdani, and bridal collections to you through a private, personalised shopping experience.",
  whatsapp: "923148881856", // international format for WA links
  whatsappDisplay: "0314-888-1856",
  instagram: "https://www.instagram.com/ms.fashioncloset/",
  instagramHandle: "@ms.fashioncloset",
};

export const CITIES: string[] = ["Lahore", "Islamabad", "Rawalpindi", "Peshawar"];

export const CATEGORIES: string[] = [
  "All",
  "Chikankari",
  "Kamdani",
  "Gota & Mukesh",
  "Kashmiri Shawls",
  "Bridal Wear",
  "Traditional Wear",
];

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/collections" },
  { label: "About", href: "/about" },
  { label: "Private Appointment", href: "/appointments" },
  { label: "Contact", href: "/contact" },
];

export const APPOINTMENT_PROCESS = [
  {
    step: "01",
    title: "Explore the Collection",
    description: "Browse our curated collections of luxury Indian and traditional wear at your leisure.",
  },
  {
    step: "02",
    title: "Select Your Favourites",
    description: "Note the pieces that catch your eye — we'll have them ready for your private viewing.",
  },
  {
    step: "03",
    title: "Request an Appointment",
    description: "Submit an appointment request through our simple form or WhatsApp.",
  },
  {
    step: "04",
    title: "We Confirm With You",
    description: "Our team will contact you on WhatsApp to confirm a date and time that suits you.",
  },
  {
    step: "05",
    title: "Your Private Shopping Experience",
    description: "Enjoy a personalised one-on-one session with our full collection at your convenience.",
  },
];

export const WHATSAPP_URL = (message?: string) => {
  const base = `https://wa.me/${BRAND.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};
