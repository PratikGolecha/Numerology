export interface NumerologyInfo {
  title: string;
  rulingPlanet: string;
  good: string[];
  bad: string[];
  personality: string[];
  traits: string;
  marsInfluence?: string;
  favourableCareer: string[];
  unfavourableCareer: string[];
  directions: string;
  colours: string[];
  luckyYears: number[];
  healthRisks: string[];
  remedies: string;
}

export const NUMEROLOGY_DATA: Record<number, NumerologyInfo> = {
  1: {
    title: "The Visionary Leader",
    rulingPlanet: "Sun",
    good: ["Ambitious", "Original", "Courageous"],
    bad: ["Arrogant", "Selfish", "Stubborn"],
    personality: ["Napoleon Bonaparte", "Walt Disney", "Steve Jobs", "Martin Luther King Jr.", "Tom Hanks"],
    traits: "You are a natural-born leader, fiercely independent and highly ambitious. You possess an indomitable will and a creative mind that constantly seeks new horizons. You prefer to lead rather than follow, and your pioneer spirit drives you to initiate projects and take risks where others hesitate.",
    favourableCareer: ["Leadership", "Business Owner", "Military", "Politics", "Innovation"],
    unfavourableCareer: ["Routine clerical work", "Subordinate roles", "Strictly manual labor"],
    directions: "East is highly favourable for growth and success.",
    colours: ["Gold", "Yellow", "Orange", "Light Brown"],
    luckyYears: [10, 19, 28, 37, 46, 55, 64],
    healthRisks: ["Heart issues", "Eyesight", "Blood circulation", "High blood pressure"],
    remedies: "Maintain self-discipline, respect others' opinions, and practice heart-healthy habits. Wearing ruby in gold can be beneficial."
  },
  2: {
    title: "The Gentle Peacemaker",
    rulingPlanet: "Moon",
    good: ["Diplomatic", "Sensitive", "Cooperative"],
    bad: ["Oversensitive", "Indecisive", "Moody"],
    personality: ["Barack Obama", "Elizabeth Taylor", "Princess Diana", "Dalai Lama", "Jennifer Aniston"],
    traits: "You are the diplomat, the hidden power behind the throne. You thrive in harmony and are deeply sensitive to the needs of others. You have a natural ability to see both sides of every situation and act as a bridge between conflicting parties.",
    favourableCareer: ["Diplomacy", "Counseling", "Art", "Teaching", "Music"],
    unfavourableCareer: ["High-stress sales", "Competitive sports", "Hard manual labor"],
    directions: "North-West and North are favourable.",
    colours: ["White", "Silver", "Cream", "Pale Green"],
    luckyYears: [11, 20, 29, 38, 47, 56, 65],
    healthRisks: ["Digestive issues", "Mental stress", "Sleep disorders", "Fluid retention"],
    remedies: "Avoid solitude for long periods, drink plenty of water, and practice meditation. Pearl or moonstone can bring balance."
  },
  3: {
    title: "The Creative Communicator",
    rulingPlanet: "Jupiter",
    good: ["Optimistic", "Expressive", "Social"],
    bad: ["Scattered", "Extravagant", "Superficial"],
    personality: ["William Shakespeare", "Salvador Dali", "Fidel Castro", "Marylin Monroe", "Jackie Chan"],
    traits: "You are the essence of creativity and joy. Blessed with the 'gift of gab', you are an excellent communicator and a social butterfly. You possess an innate optimism that attracts others to you, and you find beauty and expression in everything you do.",
    favourableCareer: ["Writing", "Performing Arts", "Advertising", "Law", "Media"],
    unfavourableCareer: ["Isolated data entry", "Highly repetitive tasks", "Security work"],
    directions: "North-East and North are excellent.",
    colours: ["Yellow", "Purple", "Violet", "Pink"],
    luckyYears: [12, 21, 30, 39, 48, 57, 66],
    healthRisks: ["Skin allergies", "Nervous exhaustion", "Throat issues", "Chest congestion"],
    remedies: "Focus on finishing one project before starting another. Yellow sapphire or topaz helps enhance Jupiter's energy."
  },
  4: {
    title: "The Solid Builder",
    rulingPlanet: "Rahu / Uranus",
    good: ["Organized", "Logical", "Patient"],
    bad: ["Rigid", "Narrow-minded", "Argumentative"],
    personality: ["Arnold Schwarzenegger", "Bill Gates", "Clint Eastwood", "Bono", "Brad Pitt"],
    traits: "You are the foundation of society. Highly practical, methodical, and incredibly hardworking, you excel at bringing order to chaos. You are the architect of your own destiny, preferring solid facts and logical structures over flights of fancy.",
    favourableCareer: ["Engineering", "Architecture", "Consulting", "Finance", "Management"],
    unfavourableCareer: ["Speculative business", "Gambling", "Creative fiction writing"],
    directions: "South-West is your strongest direction.",
    colours: ["Blue", "Grey", "Electric Blue", "Checking Patterns"],
    luckyYears: [13, 22, 31, 40, 49, 58, 67],
    healthRisks: ["Respiratory issues", "Hidden ailments", "Knee/Joint pain", "Anxiety"],
    remedies: "Practice flexibility in thought. Help those in need to mitigate Rahu's intensity. Hessonite (Gomed) can be helpful."
  },
  5: {
    title: "The Dynamic Adventurer",
    rulingPlanet: "Mercury",
    good: ["Adaptable", "Versatile", "Quick-witted"],
    bad: ["Impulsive", "Restless", "Irresponsible"],
    personality: ["Charles Darwin", "Benjamin Franklin", "Mick Jagger", "Angelina Jolie", "JK Rowling"],
    traits: "Change is your only constant. You are highly adaptable, energetic, and possess a sharp, analytical mind. You crave freedom and variety, and you have an incredible ability to bounce back from any setback with newfound wisdom.",
    favourableCareer: ["Sales", "Travel", "Marketing", "Journalism", "Public Relations"],
    unfavourableCareer: ["Accounting", "Long-term banking", "Library science"],
    directions: "North is your major direction for communication.",
    colours: ["Green", "Turquoise", "Light Blue", "Silver"],
    luckyYears: [14, 23, 32, 41, 50, 59, 68],
    healthRisks: ["Nervous system", "Stomach ulcers", "Insomnia", "Respiratory sensitivity"],
    remedies: "Avoid over-exhaustion. Green vegetables and emeralds can help stabilize your energy."
  },
  6: {
    title: "The Harmless Nurturer",
    rulingPlanet: "Venus",
    good: ["Responsible", "Compassionate", "Artistic"],
    bad: ["Judgmental", "Self-righteous", "Clinging"],
    personality: ["Albert Einstein", "Thomas Edison", "John Lennon", "Robert De Niro", "Meryl Streep"],
    traits: "You are the protector and the healer. Deeply artistic and family-oriented, you find your greatest satisfaction in serving others and creating beauty in your environment. You have a magnetism that draws people toward your warmth and wisdom.",
    favourableCareer: ["Healthcare", "Interior Design", "Luxury Goods", "Social Work", "Catering"],
    unfavourableCareer: ["Aggressive politics", "Military frontline", "Debt collection"],
    directions: "South-East and West are favourable.",
    colours: ["White", "Light Blue", "Floral Prints", "Pastels"],
    luckyYears: [15, 24, 33, 42, 51, 60, 69],
    healthRisks: ["Kidney issues", "Throat/Nose/Ear", "Hormonal balance", "Eye strain"],
    remedies: "Cultivate artistic hobbies. Avoid over-indulgence in sweets. Diamonds or white zircon are your stones."
  },
  7: {
    title: "The Intuitive Seeker",
    rulingPlanet: "Ketu / Neptune",
    good: ["Spiritual", "Analytical", "Refined"],
    bad: ["Withdrawn", "Critical", "Pessimistic"],
    personality: ["Isaac Newton", "Stephen Hawking", "Leonardo DiCaprio", "Julia Roberts", "Johnny Depp"],
    traits: "You are the philosopher and the mystic. You possess a deep inner life and a natural inclination toward the mysteries of the universe. You are highly analytical and often prefer solitude to process your deep thoughts and spiritual insights.",
    favourableCareer: ["Metaphysics", "Research", "Psychology", "Innovation", "Oceanography"],
    unfavourableCareer: ["Loud marketing", "Public speaking", "Face-to-face retail"],
    directions: "North-East is spiritually significant for you.",
    colours: ["Sea Green", "Aqua", "Light Grey", "White"],
    luckyYears: [16, 25, 34, 43, 52, 61, 70],
    healthRisks: ["Mental fatigue", "Skin sensitivity", "Digestive sensitivity", "Circulation"],
    remedies: "Spend time near water or in nature. Cat's eye (Lehsuniya) can help ground Ketu's energy."
  },
  8: {
    title: "The Material Master",
    rulingPlanet: "Saturn",
    good: ["Authoritative", "Efficient", "Resilient"],
    bad: ["Materialistic", "Demanding", "Unforgiving"],
    personality: ["Nelson Mandela", "Pablo Picasso", "Aretha Franklin", "Sandra Bullock", "Neil Armstrong"],
    traits: "You are the powerhouse of the numerological cycle. Focused on achievement, status, and material mastery, you possess a quiet strength and an incredible capacity for endurance. Life often tests you early, but these trials forge you into a formidable force.",
    favourableCareer: ["Big Business", "Real Estate", "Law", "Finance", "Mining"],
    unfavourableCareer: ["Low-pay charity work", "Purely imaginative art", "Unstructured startups"],
    directions: "West is your direction for power.",
    colours: ["Dark Blue", "Black", "Dark Grey", "Purple"],
    luckyYears: [17, 26, 35, 44, 53, 62, 71],
    healthRisks: ["Bones/Teeth", "Chronic constipation", "Rheumatism", "Depression"],
    remedies: "Practice humility and charity. Persistence is your key. Blue sapphire or amethyst can be worn."
  },
  9: {
    title: "The Passionate Performer",
    rulingPlanet: "Mars",
    good: ["Generous", "Entertainers", "Humanitarian"],
    bad: ["Unpredictable", "Impatient", "Easily Angered"],
    personality: ["Theodore Roosevelt", "Richard Nixon", "Jimmy Carter", "Rowan Atkinson", "Harrison Ford"],
    traits: "You are the humanitarian warrior. You possess immense physical and mental energy, and you are constantly striving to improve yourself and solve the world's problems. You are self-confident, courageous, and hardworking, though sometimes your impatience can lead to quick temper.",
    marsInfluence: "You are strongly influenced by Mars if born between 21 March and 27 April or between 21 October and 27 November, bringing inborn leadership and strength.",
    favourableCareer: ["Iron and Steel", "Medicines", "Land & Property", "Agriculture", "Humanitarian Work"],
    unfavourableCareer: ["Electrical goods", "High-risk electricity work", "Stagnant desk jobs"],
    directions: "North-East and South-West are favourable directions.",
    colours: ["Pink", "Red", "Yellow", "White"],
    luckyYears: [18, 24, 27, 30, 36, 39, 42, 45, 54, 57, 63],
    healthRisks: ["Urinary problems", "Blood pressure", "Inflammation", "Heart issues"],
    remedies: "Avoid excessive spices. Observe salt-free Tuesday fasts. Wear coral in gold or copper."
  }
};
