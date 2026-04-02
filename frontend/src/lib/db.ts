import fs from 'fs';
import path from 'path';

export interface Verse {
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration: string;
  translation: string;
  meaning: string;
}

export function getGeetaData(): Verse[] {
  // Access data relative to Next.js root
  const filePath = path.join(process.cwd(), '../data/processed/geeta_database.json');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContent) as Verse[];
}

let mahabharataCache: any = null;
export function getMahabharataData() {
  if (mahabharataCache) return mahabharataCache;
  const filePath = path.join(process.cwd(), '../data/processed/mahabharata_database.json');
  if (!fs.existsSync(filePath)) return null;
  const fileContent = fs.readFileSync(filePath, 'utf8');
  mahabharataCache = JSON.parse(fileContent);
  return mahabharataCache;
}

export const CHAPTER_NAMES = [
  "Arjuna Visada Yoga - The Despondency of Arjuna",
  "Sankhya Yoga - The Yoga of Knowledge",
  "Karma Yoga - The Yoga of Action",
  "Jnana Karma Sanyasa Yoga - The Yoga of Knowledge and Action",
  "Karma Sanyasa Yoga - The Yoga of Renunciation of Action",
  "Dhyana Yoga - The Yoga of Meditation",
  "Jnana Vijnana Yoga - The Yoga of Knowledge and Wisdom",
  "Aksara Brahma Yoga - The Yoga of the Imperishable Brahman",
  "Raja Vidya Raja Guhya Yoga - The Yoga of Royal Knowledge",
  "Vibhuti Yoga - The Yoga of Divine Glories",
  "Visvarupa Darsana Yoga - The Yoga of the Vision of the Universal Form",
  "Bhakti Yoga - The Yoga of Devotion",
  "Ksetra Ksetrajna Vibhaga Yoga - The Yoga of Distinction Between the Field and Knower",
  "Gunatraya Vibhaga Yoga - The Yoga of the Differentiation of the Three Modes",
  "Purusottama Yoga - The Yoga of the Supreme Person",
  "Daivasura Sampad Vibhaga Yoga - The Yoga of Division Between Divine and Demoniac",
  "Sraddhatraya Vibhaga Yoga - The Yoga of the Division of Threefold Faith",
  "Moksa Sanyasa Yoga - The Yoga of Liberation Through Renunciation"
];

let ramayanaCache: any = null;
export function getRamayanaData() {
  if (ramayanaCache) return ramayanaCache;
  const filePath = path.join(process.cwd(), '../data/processed/ramayana_database.json');
  if (!fs.existsSync(filePath)) return null;
  const fileContent = fs.readFileSync(filePath, 'utf8');
  ramayanaCache = JSON.parse(fileContent);
  return ramayanaCache;
}

export const KANDA_NAMES = [
  "Bala Kanda - Book of Childhood",
  "Ayodhya Kanda - Book of Ayodhya",
  "Aranya Kanda - Book of the Forest",
  "Kishkindha Kanda - Book of Kishkindha",
  "Sundara Kanda - Book of Beauty (Hanuman)",
  "Yuddha Kanda - Book of War",
  "Uttara Kanda - Book of the Aftermath"
];

let ramcharitmanas_cache: any = null;
export function getRamcharitmanas() {
  if (ramcharitmanas_cache) return ramcharitmanas_cache;
  const filePath = path.join(process.cwd(), '../data/processed/ramcharitmanas_database.json');
  if (!fs.existsSync(filePath)) return null;
  const fileContent = fs.readFileSync(filePath, 'utf8');
  ramcharitmanas_cache = JSON.parse(fileContent);
  return ramcharitmanas_cache;
}

export const RCM_KANDA_NAMES = [
  "Balakanda",
  "Ayodhyakanda",
  "Aranyakanda",
  "Kishkindhakanda",
  "Sundarakanda",
  "Lankakanda",
  "Uttarakanda"
];
