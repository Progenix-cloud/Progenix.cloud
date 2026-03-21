export interface Skill {
  name: string;
  level: number;
  color: string;
  icon?: string;
  currentLevel?: number;
}

export const skills: Skill[] = [
  { name: "React/Next.js", level: 95, color: "from-blue-500 to-cyan-500" },
  { name: "TypeScript", level: 90, color: "from-blue-600 to-blue-800" },
  { name: "Node.js", level: 85, color: "from-green-500 to-green-700" },
  { name: "Python", level: 80, color: "from-yellow-500 to-orange-500" },
  { name: "AWS/Azure", level: 75, color: "from-purple-500 to-pink-500" },
  { name: "DevOps", level: 70, color: "from-red-500 to-red-700" },
  { name: "UI/UX Design", level: 85, color: "from-indigo-500 to-purple-500" },
  { name: "Database Design", level: 80, color: "from-teal-500 to-blue-500" },
];

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  description: string;
}

export const stats: StatItem[] = [
  {
    value: 258,
    suffix: "",
    label: "React Native Commits",
    description: "Core contributions",
  },
  {
    value: 29,
    suffix: "M+",
    label: "Downloads",
    description: "Open source impact",
  },
  {
    value: 500,
    suffix: "+",
    label: "Projects Delivered",
    description: "Successful deployments",
  },
  {
    value: 50,
    suffix: "+",
    label: "Happy Clients",
    description: "Satisfied partners",
  },
];

// Landing page constants
export const companyName = "progenix.cloud";

export const taglineSuffix = "technology that propels your business forward";

export const taglinePrefixes = ["web products", "app products", "erp systems"];

export const description =
  "We will help you ship better apps, faster. Our team of expert engineers has created the best user experiences in some of the most popular apps worldwide.";

// Landing page images
export const landingImages = {
  margeloLogo: "/margelo-logo.svg",
  arrowDown: "/arrow-down.webp",
};

// Skills text
export const skillsText = [
  "We know our tools inside out.",
  "Our team has contributed 258 commits to React Native core, powering thousands of apps worldwide.",
  "We're maintaining some of the most popular open-source projects, with over 29 million downloads.",
];

// Reviews type and data
type ReviewsType = {
  by: string;
  text: string;
};

export const reviews: ReviewsType[] = [
  {
    by: "Axel (Showtime)",
    text: "Margelo and Showtime both share the love for high-quality software, the passion for building something people want and the ambition of always doing our best. 10/10 would recommend working with Marc and his team.",
  },
  {
    by: "Clinton (CEO of Slingshot)",
    text: "Working with the Margelo team feels like a cheat code. When it comes to building performant and scalable React Native mobile apps, they're the best hands down.",
  },
  {
    by: "Louise (CEO of Stori)",
    text: "When we first found Margelo they seemed too good to be true. Professional, fast and ridiculously talented; the 3D AR Filter component they have developed for our React Native app is super smooth and responsive.",
  },
  {
    by: "Roland (ExtraCard)",
    text: "We were hitting the inevitable pains of rapid growth and needed to level up our app quickly. What would have taken us months took the Margelo team mere days. There is nothing they can't figure out or make happen. Simply the best.",
  },
  {
    by: "Adam Carlton (CEO of PinkPanda)",
    text: "Margelo is a collection of world class talent, from React Native to website, full stack to design - I've been nothing but pleased with their communication, imagination, insight and delivery.",
  },
  {
    by: "Alex (CTO of Steakwallet)",
    text: "The output of Margelo is unlike any other team we've worked with. Their speed, professionalism and familiarity with all things mobile helped turn Steakwallet into the slick application it is known as today.",
  },
];

// Roadmap type and data
type RoadmapItem = {
  title: string;
  description: string;
  image: string;
};

export const roadmap: RoadmapItem[] = [
  {
    title: "User Requirements",
    description: "BRD Documents",
    image: "user-requirements.jpg",
  },
  {
    title: "Technical Mapping",
    description: "System Design",
    image: "technical-mapping.jpg",
  },
  {
    title: "HLD LLD",
    description: "High Level Design, Low Level Design",
    image: "hld-lld.jpg",
  },
  {
    title: "Project Mapping",
    description: "Cost, Team, Time, Infra Requirements",
    image: "project-mapping.jpg",
  },
  {
    title: "SDLC Lifecycle",
    description: "With Revisions",
    image: "sdlc-lifecycle.jpg",
  },
  {
    title: "Lifetime Infra Management",
    description: "Ongoing Infrastructure Support",
    image: "lifetime-infra.jpg",
  },
];

// Clients type and data
type ClientType = {
  name: string;
  logo: string;
  link: string;
};

export const clients: ClientType[] = [
  {
    name: "Audubon",
    logo: "audubon-company.webp",
    link: "https://audubon.org",
  },
  {
    name: "CoinBase",
    logo: "coinbase-company.webp",
    link: "https://coinbase.com",
  },
  { name: "Exodus", logo: "exodus-company.webp", link: "https://exodus.com" },
  {
    name: "Expensify",
    logo: "expensify-company.webp",
    link: "https://expensify.com",
  },
  { name: "Extra", logo: "extra-company.webp", link: "https://extra.com" },
  {
    name: "Litentry",
    logo: "litentry-company.webp",
    link: "https://litentry.com",
  },
  { name: "Picnic", logo: "picnic-company.webp", link: "https://picnic.com" },
  {
    name: "PinkPanda",
    logo: "pinkpanda-company.webp",
    link: "https://pinkpanda.com",
  },
  { name: "Rainbow", logo: "rainbow-company.webp", link: "https://rainbow.me" },
  {
    name: "Scribeware",
    logo: "scribeware-company.webp",
    link: "https://scribeware.com",
  },
  {
    name: "Shopify",
    logo: "shopify-company.webp",
    link: "https://shopify.com",
  },
  {
    name: "ShowTime",
    logo: "showtime-company.webp",
    link: "https://showtime.com",
  },
  {
    name: "SlingShot",
    logo: "slingshot-company.webp",
    link: "https://slingshot.com",
  },
  {
    name: "SnapCalorie",
    logo: "snapcalorie-company.webp",
    link: "https://snapcalorie.com",
  },
  { name: "Status", logo: "status-company.webp", link: "https://status.im" },
  {
    name: "SteakWallet",
    logo: "steakwallet-company.webp",
    link: "https://steakwallet.com",
  },
  { name: "Stori", logo: "stori-company.webp", link: "https://stori.com" },
  { name: "Tocsen", logo: "tocsen-company.webp", link: "https://tocsen.com" },
  {
    name: "WalletConnect",
    logo: "walletconnect-company.webp",
    link: "https://walletconnect.com",
  },
];
