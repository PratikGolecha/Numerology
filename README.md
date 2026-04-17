# Golecha Numerology Calculator

A comprehensive, professional-grade numerology application built to provide precise calculations using ancient Chaldean and Pythagorean systems. With an intuitive interface, users can calculate numbers for individuals, brands, and companies, perform bulk operations, check harmony between names, and manage personalized saved libraries.

## 🌟 Key Features

*   **Dual Numerology Systems:** Instantly toggle between Chaldean and Pythagorean calculation methods. The app computes both core reduced numbers and deeper compound numbers.
*   **Single Name Analysis:** Quickly analyze any string to see its numerology breakdown, along with in-depth systemic rules.
*   **Bulk Analysis:** Save time by pasting multiple words or names into the Bulk analyzer. The app will process all of them simultaneously and even allows exporting the results as a formatted PDF.
*   **Match Harmony:** Enter two names to check their numerological compatibility. See whether their life paths align effectively.
*   **Saved Library & Custom Categories:** Save important calculations. Create your own custom categories on-the-fly right when you save, ensuring your data is perfectly organized (e.g., "Personal", "Brand", "Company").
*   **Session History:** Never lose your context—recently calculated names are temporarily held in your session history.
*   **User Profiles:** Supports local profile management. Multiple users can log in, letting them keep their personal calculations distinct (all data stored safely in offline `localStorage`).

## 🛠️ Technology Stack

*   **Frontend Framework:** React 18, Vite
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (with responsive, clean, and interactive hover states)
*   **Animations:** Framer Motion (`motion/react`)
*   **Icons:** Lucide React
*   **Export/Compilation:** `html2canvas` & `jspdf` for generating bulk analysis reports.

## 🚀 Getting Started

To get the project running locally:

### Prerequisites

Ensure you have Node.js and `npm` installed.

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the local server port provided in your terminal (usually `localhost:3000` or similar).

### Build for Production

To create a highly optimized production build:
```bash
npm run build
```

## 📝 Design Notes

- The branding features the rich **Golecha Logo** styled elegantly to match the deep-red and contrasting white aesthetic across the entire application interface.
- Interactions are intentionally snappy and use Framer Motion for exit/entrance animations and hover transitions to keep the workspace feeling lightweight but incredibly robust.

## 📄 License

Proprietary - created specifically for Golecha Numerology. All rights reserved.
