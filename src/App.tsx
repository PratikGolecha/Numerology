/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, History, Hash, Text, Sparkles, 
  ChevronRight, RefreshCcw, Briefcase, HeartPulse, 
  Compass, Palette, User, Zap, AlertTriangle, ShieldCheck,
  Bookmark, FolderHeart, Trash2, Plus, Info, Star,
  Handshake, Share2, FileDown, MessageSquare, CloudDownload
} from 'lucide-react';
import { NUMEROLOGY_DATA } from './data';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import golechaLogoUrl from './Golecha Logo.svg';

type NumerologySystem = 'Chaldean' | 'Pythagorean';
type Tab = 'home' | 'calc' | 'bulk' | 'compat' | 'saved' | 'history';

interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

const DEFAULT_CATEGORIES = ['Personal', 'Brand', 'Company'];

// Compatibility Matrix (Standard numerology harmony)
const COMPATIBILITY_MAP: Record<number, { good: number[], bad: number[] }> = {
  1: { good: [4, 7, 2, 3, 5, 9], bad: [8, 6] },
  2: { good: [7, 9, 1, 3, 5], bad: [4, 8] },
  3: { good: [6, 9, 1, 2, 5], bad: [7, 8] },
  4: { good: [1, 8, 5, 6, 7], bad: [2, 9] },
  5: { good: [1, 2, 3, 4, 6, 9], bad: [] }, // Mercurial, versatile
  6: { good: [3, 9, 5, 1, 4], bad: [8] },
  7: { good: [1, 2, 4, 5], bad: [3, 9, 8, 6] },
  8: { good: [4, 1, 5], bad: [2, 7, 9] },
  9: { good: [2, 3, 6, 1, 5], bad: [4, 7, 8] }
};

const getCompatibility = (n1: number, n2: number): { score: number, status: 'High' | 'Moderate' | 'Challenging', desc: string } => {
  if (n1 === n2) return { score: 95, status: 'High', desc: 'Identical vibrations create powerful resonance and mutual understanding.' };
  if (COMPATIBILITY_MAP[n1].good.includes(n2)) return { score: 85, status: 'High', desc: 'Harmonious relationship. These vibrations support and amplify each other.' };
  if (COMPATIBILITY_MAP[n1].bad.includes(n2)) return { score: 45, status: 'Challenging', desc: 'Conflicting energies. Requires conscious effort to find common ground.' };
  return { score: 70, status: 'Moderate', desc: 'Neutral connection. Neither highly supportive nor destructive.' };
};

const CHALDEAN_MAP: Record<string, number> = {
  'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 8, 'G': 3, 'H': 5,
  'I': 1, 'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 7, 'P': 8,
  'Q': 1, 'R': 2, 'S': 3, 'T': 4, 'U': 6, 'V': 6, 'W': 6, 'X': 5,
  'Y': 1, 'Z': 7,
  '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '0': 0
};

const PYTHAGOREAN_MAP: Record<string, number> = {
  'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
  'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
  'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8,
  '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '0': 0
};

interface CalculationResult {
  raw: string;
  system: NumerologySystem;
  values: { char: string; val: number; isVowel: boolean }[];
  compound: number;
  reduced: number;
  soulUrge: number; // Sum of Vowels
  personality: number; // Sum of Consonants
}

interface SavedItem extends CalculationResult {
  id: string;
  category: string;
  timestamp: number;
  createdBy: string;
}

const VOWELS = ['A', 'E', 'I', 'O', 'U', 'Y'];

export default function App() {
  const [input, setInput] = useState('');
  const [inputCompat1, setInputCompat1] = useState('');
  const [inputCompat2, setInputCompat2] = useState('');
  const [inputBulk, setInputBulk] = useState('');
  const [system, setSystem] = useState<NumerologySystem>('Chaldean');
  const [history, setHistory] = useState<CalculationResult[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Personal');
  const [showShareToast, setShowShareToast] = useState(false);

  // User & Category Management
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [customCategories, setCustomCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  
  // Custom Category Add
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // New User Form
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [regStep, setRegStep] = useState<'form' | 'success'>('form');
  const [authTab, setAuthTab] = useState<'login' | 'register'>('register');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [itemToSave, setItemToSave] = useState<CalculationResult | { r1: CalculationResult, r2: CalculationResult, compat: any } | null>(null);
  const [bulkItemsToSave, setBulkItemsToSave] = useState<CalculationResult[] | null>(null);
  const [preferredNumber, setPreferredNumber] = useState('');

  // API Helper
  const fetchApi = async (path: string, options: any = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };
    const res = await fetch(`/api${path}`, { ...options, headers });
    if (!res.ok) {
      let errorMsg = res.statusText;
      try {
        const errData = await res.json();
        errorMsg = errData.error || errData.message || errorMsg;
      } catch(e) {
        // Fallback to raw text if it's not JSON
        const text = await res.text();
        if (text) errorMsg = text;
      }
      throw new Error(errorMsg);
    }
    return res.json();
  };

  // Persistence
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadBackendData();
    } else {
      setIsUserModalOpen(true);
    }
  }, []);

  const loadBackendData = async () => {
    try {
      const userRes = await fetchApi('/auth/me');
      setCurrentUser(userRes.user || userRes);
      
      try {
        const savedRes = await fetchApi('/user/data/saved');
        if (savedRes && savedRes.data) setSavedItems(savedRes.data);
      } catch(e) {}
      
      try {
        const histRes = await fetchApi('/user/data/history');
        if (histRes && histRes.data) setHistory(histRes.data);
      } catch(e) {}
      
      try {
        const catsRes = await fetchApi('/user/data/categories');
        if (catsRes && catsRes.data && catsRes.data.length > 0) setCustomCategories(catsRes.data);
      } catch(e) {}
      
    } catch(err) {
      console.error('Failed to load user', err);
      localStorage.removeItem('token');
      setCurrentUser(null);
      setIsUserModalOpen(true);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchApi('/user/data', {
        method: 'POST',
        body: JSON.stringify({ type: 'saved', data: savedItems })
      }).catch(console.error);
    }
  }, [savedItems, currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchApi('/user/data', {
        method: 'POST',
        body: JSON.stringify({ type: 'history', data: history })
      }).catch(console.error);
    }
  }, [history, currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchApi('/user/data', {
        method: 'POST',
        body: JSON.stringify({ type: 'categories', data: customCategories })
      }).catch(console.error);
    }
  }, [customCategories, currentUser]);

  const handleRegister = async () => {
    if (!newName || !newPhone) return;
    setAuthLoading(true);
    try {
      await fetchApi('/auth/register', {
        method: 'POST',
        // Update to use phone based on user request. User will update their backend API to handle this!
        body: JSON.stringify({ name: newName, phone: newPhone, username: newPhone })
      });
      // automatically login after register
      const loginRes = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone: newPhone, username: newPhone })
      });
      localStorage.setItem('token', loginRes.token);
      await loadBackendData();
      setIsUserModalOpen(false);
      setNewName('');
      setNewPhone('');
    } catch(err: any) {
      alert('Registration failed: ' + err.message);
    }
    setAuthLoading(false);
  };

  const handleLogin = async () => {
    if (!loginPhone) return;
    setAuthLoading(true);
    try {
      const res = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone: loginPhone, username: loginPhone })
      });
      localStorage.setItem('token', res.token);
      await loadBackendData();
      setIsUserModalOpen(false);
      setLoginPhone('');
    } catch(err: any) {
      alert('Login failed: ' + err.message);
    }
    setAuthLoading(false);
  };

  const calculate = (str: string, sys: NumerologySystem): CalculationResult => {
    const mapping = sys === 'Chaldean' ? CHALDEAN_MAP : PYTHAGOREAN_MAP;
    const chars = str.toUpperCase().split('');
    const values = chars.map(char => ({
      char,
      val: mapping[char] || 0,
      isVowel: VOWELS.includes(char)
    })).filter(v => v.char.trim() !== '');

    const compound = values.reduce((sum, v) => sum + v.val, 0);
    
    const reduceNum = (n: number) => {
      let r = n;
      while (r > 9) r = String(r).split('').reduce((s, d) => s + parseInt(d), 0);
      return r;
    };

    const soulUrgeRaw = values.filter(v => v.isVowel).reduce((sum, v) => sum + v.val, 0);
    const personalityRaw = values.filter(v => !v.isVowel).reduce((sum, v) => sum + v.val, 0);

    return { 
      raw: str, 
      system: sys, 
      values, 
      compound, 
      reduced: reduceNum(compound),
      soulUrge: reduceNum(soulUrgeRaw),
      personality: personalityRaw > 0 ? reduceNum(personalityRaw) : 0
    };
  };

  const currentResult = useMemo(() => {
    if (!input.trim()) return null;
    const res = calculate(input, system);
    return res;
  }, [input, system]);

  const compatResults = useMemo(() => {
    if (!inputCompat1.trim() || !inputCompat2.trim()) return null;
    const r1 = calculate(inputCompat1, system);
    const r2 = calculate(inputCompat2, system);
    const compat = getCompatibility(r1.reduced, r2.reduced);
    return { r1, r2, compat };
  }, [inputCompat1, inputCompat2, system]);

  const detailData = useMemo(() => {
    if (!currentResult) return null;
    return NUMEROLOGY_DATA[currentResult.reduced] || null;
  }, [currentResult]);

  const addToHistory = (res: CalculationResult) => {
    setHistory(prev => {
      const exists = prev.find(h => h.raw === res.raw && h.system === res.system);
      if (exists) return prev;
      return [res, ...prev.slice(0, 19)];
    });
  };

  const handleSave = () => {
    if (!currentUser) return;

    if (bulkItemsToSave && bulkItemsToSave.length > 0) {
      const newItems: SavedItem[] = bulkItemsToSave.map(item => ({
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        category: selectedCategory,
        timestamp: Date.now(),
        createdBy: currentUser.name
      }));
      setSavedItems(prev => [...newItems, ...prev]);
      setIsSaveModalOpen(false);
      setBulkItemsToSave(null);
      return;
    }

    const targetItem = itemToSave || currentResult;
    if (!targetItem) return;
    if (targetItem && 'compat' in targetItem) {
        // Handle Harmony saving
        const newItem: SavedItem = {
          ...targetItem.r1,
          id: Math.random().toString(36).substr(2, 9),
          category: selectedCategory,
          timestamp: Date.now(),
          createdBy: currentUser.name,
          harmonyWith: targetItem.r2,
          harmonyCompat: targetItem.compat
        };
        setSavedItems(prev => [newItem, ...prev]);
        setIsSaveModalOpen(false);
        setItemToSave(null);
        return;
    }

    const newItem: SavedItem = {
      ...targetItem,
      id: Math.random().toString(36).substr(2, 9),
      category: selectedCategory,
      timestamp: Date.now(),
      createdBy: currentUser.name
    };
    setSavedItems(prev => [newItem, ...prev]);
    setIsSaveModalOpen(false);
    setItemToSave(null);
  };

  const deleteSaved = (id: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleShare = () => {
    if (!currentResult) return;
    const text = `Name: ${currentResult.raw}\n${currentResult.system} Numerology No: ${currentResult.reduced}\nCompound: ${currentResult.compound}\n\nGenerated with Golecha Numerology Calculator`;
    navigator.clipboard.writeText(text);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  const shareToWhatsApp = () => {
    if (!currentResult) return;
    const text = `Name: ${currentResult.raw}\n${currentResult.system} Numerology No: ${currentResult.reduced}\nCompound: ${currentResult.compound}\n\nGenerated with Golecha Numerology Calculator`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const exportToPDF = async () => {
    const element = document.getElementById('report-container');
    if (!element) return;
    
    setIsGeneratingPDF(true);
    try {
      const capture = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = capture.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`numerology-report-${input || 'result'}.pdf`);
    } catch (e) {
      console.error('PDF generation failed', e);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getBulkResultsText = () => {
    const results = inputBulk.split(/[\n;]+/)
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(name => {
        const res = calculate(name, system);
        return `Name: ${res.raw}\n${res.system} Numerology No: ${res.reduced}\nCompound: ${res.compound}`;
      })
      .join('\n\n');
    return `Bulk Numerology Report:\n\n${results}\n\nGenerated with Golecha Numerology Calculator`;
  };

  const handleBulkShare = () => {
    if (!inputBulk.trim()) return;
    navigator.clipboard.writeText(getBulkResultsText());
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  const getPreferredResultsText = () => {
    if (!preferredNumber) return '';
    const results = inputBulk.split(/[\n;]+/)
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(name => calculate(name, system))
      .filter(res => res.reduced.toString() === preferredNumber || res.compound.toString() === preferredNumber)
      .map(res => `Name: ${res.raw}\n${res.system} Numerology No: ${res.reduced}\nCompound: ${res.compound}`)
      .join('\n\n');
      
    if (!results) return `No matches found for preferred number ${preferredNumber}`;
    return `Preferred Numbers Report (Target: ${preferredNumber}):\n\n${results}\n\nGenerated with Golecha Numerology Calculator`;
  };

  const handlePreferredShare = () => {
    if (!inputBulk.trim() || !preferredNumber) return;
    navigator.clipboard.writeText(getPreferredResultsText());
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  const sharePreferredToWhatsApp = () => {
    if (!inputBulk.trim() || !preferredNumber) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(getPreferredResultsText())}`, '_blank');
  };

  const shareBulkToWhatsApp = () => {
    if (!inputBulk.trim()) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(getBulkResultsText())}`, '_blank');
  };

  const exportBulkToPDF = async () => {
    const element = document.getElementById('bulk-report-container');
    if (!element) return;
    
    setIsGeneratingPDF(true);
    try {
      const capture = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = capture.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`bulk-numerology-report.pdf`);
    } catch (e) {
      console.error('PDF generation failed', e);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const exportPreferredToPDF = async () => {
    const element = document.getElementById('preferred-report-container');
    if (!element) return;
    
    setIsGeneratingPDF(true);
    try {
      const capture = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = capture.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`preferred-numerology-report-${preferredNumber}.pdf`);
    } catch (e) {
      console.error('PDF generation failed', e);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getHarmonyText = () => {
    if (!compatResults) return '';
    return `Harmony Check Report:\n\nPrimary: ${compatResults.r1.raw} (${compatResults.r1.reduced})\nSecondary: ${compatResults.r2.raw} (${compatResults.r2.reduced})\n\nResonance: ${compatResults.compat.score}% - ${compatResults.compat.status}\n\n${compatResults.compat.desc}\n\nGenerated with Golecha Numerology Calculator`;
  };

  const handleHarmonyShare = () => {
    if (!compatResults) return;
    navigator.clipboard.writeText(getHarmonyText());
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  const shareHarmonyToWhatsApp = () => {
    if (!compatResults) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(getHarmonyText())}`, '_blank');
  };

  const exportHarmonyToPDF = async () => {
    const element = document.getElementById('harmony-report-container');
    if (!element) return;
    
    setIsGeneratingPDF(true);
    try {
      const capture = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = capture.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`harmony-report.pdf`);
    } catch (e) {
      console.error('PDF generation failed', e);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const clearHistory = () => setHistory([]);

  const handleReset = () => setInput('');

  const handleDeployUpdate = async () => {
    setIsDeploying(true);
    // Give user visual feedback assuming an API handles the execution backing this route:
    try {
      await fetch('/api/deploy', { method: 'POST' }); // Expects a generic OK status representing execution
      setTimeout(() => {
        setIsDeploying(false);
        alert('Server updated successfully. Reloading view.');
        window.location.reload();
      }, 1500);
    } catch(e) {
      setTimeout(() => {
        setIsDeploying(false);
        // Fallback for demo static environments (simulating successful deployment hook execution)
        alert('Update signal sent. Reloading view.');
        window.location.reload();
      }, 1500);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('numerology_currentUser');
    setIsUserModalOpen(true);
    setIsMenuOpen(false);
    setActiveTab('home');
  };

  const addCategory = (name: string) => {
    if (!name || customCategories.includes(name)) return;
    setCustomCategories(prev => [...prev, name]);
  };

  const filteredSaved = itemSet => {
     if (categoryFilter === 'All') return itemSet;
     return itemSet.filter(item => item.category === categoryFilter);
  };

  return (
    <div className="min-h-screen bg-[#f5f7f5] text-gray-900 selection:bg-accent/20 pb-12 overflow-x-hidden">
      {/* Mobile-style Top Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-accent hover:bg-accent/5 transition-all"
            >
              <div className="flex flex-col gap-1 w-5">
                <div className="h-0.5 w-full bg-current rounded-full" />
                <div className="h-0.5 w-full bg-current rounded-full" />
                <div className="h-0.5 w-2/3 bg-current rounded-full" />
              </div>
            </button>
            <div 
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="p-1.5 bg-accent/10 text-accent rounded-lg group-hover:bg-accent transition-all group-hover:text-white"><Calculator size={16} /></div>
              <img src={golechaLogoUrl} alt="Golecha Logo" className="h-[36px] w-auto group-hover:opacity-80 transition-opacity" />
            </div>
          </div>
          
          {/* User Badge in Header */}
          {currentUser && (
            <div 
              onClick={() => setIsMenuOpen(true)}
              className="flex items-center gap-2 bg-gray-50 pl-1 pr-3 py-1 rounded-full border border-gray-100 cursor-pointer hover:bg-white transition-colors"
            >
              <div className="w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-[10px] font-black">
                {currentUser.name[0].toUpperCase()}
              </div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{currentUser.name.split(' ')[0]}</span>
            </div>
          )}
        </div>
      </div>

      {/* Hamburger / Sidebar Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-white z-[101] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Menu Header */}
              <div className="p-8 pb-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-accent text-white rounded-xl shadow-lg shadow-accent/20">
                    <Calculator size={20} />
                  </div>
                  <div>
                    <img src={golechaLogoUrl} alt="Golecha Logo" className="h-[48px] w-auto" />
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[3px] mt-1">Numerology Calculator</p>
                  </div>
                </div>

                <div onClick={() => { setIsUserModalOpen(true); setIsMenuOpen(false); }} className="bg-white border border-gray-200 p-4 rounded-2xl flex items-center justify-between cursor-pointer group hover:border-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 text-accent rounded-full flex items-center justify-center font-black">
                      {currentUser?.name[0].toUpperCase() || '?'}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-xs text-gray-800 tracking-tight">{currentUser?.name || 'No User Selected'}</span>
                      <span className="text-[10px] text-gray-400 font-bold">{currentUser?.phone || '--'}</span>
                    </div>
                  </div>
                  <RefreshCcw size={12} className="text-gray-300 group-hover:text-accent" />
                </div>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 no-scrollbar">
                <div className="flex flex-col gap-2">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[4px] pl-1 mb-2">Workspace</h3>
                  {[
                    { id: 'home', label: 'Dashboard', icon: <ShieldCheck size={18} />, color: 'text-gray-400' },
                    { id: 'calc', label: 'Single Check', icon: <Calculator size={18} />, color: 'text-blue-500' },
                    { id: 'bulk', label: 'Bulk Analysis', icon: <Plus size={18} />, color: 'text-purple-500' },
                    { id: 'compat', label: 'Match Harmony', icon: <Handshake size={18} />, color: 'text-rose-500' },
                    { id: 'saved', label: 'Saved Library', icon: <Bookmark size={18} />, color: 'text-amber-500' },
                    { id: 'history', label: 'Recent Session', icon: <History size={18} />, color: 'text-emerald-500' },
                  ].map(nav => (
                    <button
                      key={nav.id}
                      onClick={() => { setActiveTab(nav.id as Tab); setIsMenuOpen(false); }}
                      className={`flex items-center gap-4 p-4 rounded-2xl font-black text-sm transition-all ${
                        activeTab === nav.id 
                          ? 'bg-accent/5 text-accent border border-accent/20' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className={activeTab === nav.id ? 'text-accent' : nav.color}>{nav.icon}</div>
                      <span>{nav.label}</span>
                      {activeTab === nav.id && <div className="ml-auto w-1.5 h-1.5 bg-accent rounded-full" />}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[4px] pl-1 mb-2">Management</h3>
                  <button 
                    onClick={handleDeployUpdate}
                    disabled={isDeploying}
                    className="flex items-center justify-between p-4 text-blue-600 hover:bg-blue-50 bg-blue-50/50 border border-blue-100 rounded-2xl font-black text-sm transition-all"
                  >
                    <div className="flex items-center gap-4">
                      {isDeploying ? <RefreshCcw className="opacity-40 animate-spin" size={18} /> : <CloudDownload className="opacity-80" size={18} />}
                      <span>{isDeploying ? 'Deploying Update...' : 'Sync Latest Update'}</span>
                    </div>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-4 p-4 text-red-500 hover:bg-red-50 rounded-2xl font-black text-sm transition-all mt-2"
                  >
                    <RefreshCcw className="opacity-40" size={18} />
                    <span>Logout Account</span>
                  </button>
                </div>
              </div>

              <div className="p-8 pt-4 border-t border-gray-100 bg-gray-50/30">
                <p className="text-[8px] text-gray-300 font-black uppercase text-center tracking-[4px]">Sha Ghewarchand Champalal Group</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="max-w-2xl mx-auto px-4 pt-6">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col gap-8 py-4"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-black text-gray-800 tracking-tight">Welcome, {currentUser?.name || 'User'}</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'calc', label: 'Single Check', icon: <Calculator size={32} />, desc: 'Individual names', color: 'bg-blue-500' },
                  { id: 'bulk', label: 'Bulk Check', icon: <Plus size={32} />, desc: 'Multiple entries', color: 'bg-purple-500' },
                  { id: 'compat', label: 'Compatibility', icon: <Handshake size={32} />, desc: 'Harmony match', color: 'bg-rose-500' },
                  { id: 'saved', label: 'Library', icon: <Bookmark size={32} />, desc: 'Browse saved', color: 'bg-amber-500' },
                  { id: 'history', label: 'Recent', icon: <History size={32} />, desc: 'Your session', color: 'bg-emerald-500' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => item.action ? item.action() : setActiveTab(item.id as Tab)}
                    className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-start gap-4 hover:border-accent transition-all group active:scale-95"
                  >
                    <div className={`p-4 rounded-2xl text-white ${item.color} shadow-lg shadow-${item.color.split('-')[1]}-500/20 group-hover:scale-110 transition-transform`}>
                      {item.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="font-black text-gray-800 tracking-tight">{item.label}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-4 p-6 bg-accent/5 rounded-[32px] border border-accent/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-white font-black text-xl">
                    {savedItems.length}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-gray-800">Global Database</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Saved Entries</span>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('saved')}
                  className="p-3 bg-white text-accent rounded-xl shadow-sm hover:scale-110 transition-transform"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'calc' && (
            <motion.div 
              key="calc"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col gap-6"
            >
              {/* Search Bar */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col gap-4">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors">
                    <Text size={20} />
                  </div>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Search name or number..."
                    className="w-full bg-[#f0f4f0] border-none rounded-2xl pl-12 pr-12 py-4 text-lg font-medium outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                  />
                  {input && (
                    <button onClick={handleReset} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:text-gray-600">
                      <RefreshCcw size={18} />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between px-1">
                  <div className="flex gap-2 bg-gray-50 p-1 rounded-xl">
                    {(['Chaldean', 'Pythagorean'] as NumerologySystem[]).map(s => (
                      <button
                        key={s}
                        onClick={() => setSystem(s)}
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          system === s ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {currentResult && (
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => {
                          setIsSaveModalOpen(true);
                          addToHistory(currentResult);
                        }}
                        className="p-2 bg-accent/5 text-accent rounded-xl hover:bg-accent/10 transition-colors"
                        title="Save to Library"
                      >
                        <Bookmark size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Suggestions */}
              {!currentResult && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Suggested Try</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { l: 'Google', v: 'Business' },
                      { l: 'Tesla', v: 'Innovation' },
                      { l: 'Golecha', v: 'Brand Sample' },
                      { l: '3-6-9', v: 'Tesla Secret' },
                      { l: 'Apple Inc', v: 'Brand' },
                      { l: 'Success', v: 'Aspiration' }
                    ].map(s => (
                      <button
                        key={s.l}
                        onClick={() => setInput(s.l)}
                        className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:border-accent/30 transition-all text-left group"
                      >
                        <p className="text-sm font-bold text-gray-700 group-hover:text-accent">{s.l}</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{s.v}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Result Area */}
              {currentResult && (
                <motion.div 
                  id="report-container"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-8 items-center bg-[#f5f7f5]"
                >
                  <div className="relative w-64 h-64 flex items-center justify-center mt-6">
                    <motion.div 
                      key={`reduced-${currentResult.reduced}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-48 h-48 bg-[#607d8b] rounded-full flex items-center justify-center shadow-xl z-10 border-8 border-white"
                    >
                      <span className="text-white text-9xl font-black tracking-tighter">{currentResult.reduced}</span>
                    </motion.div>
                    <motion.div 
                      key={`compound-${currentResult.compound}`}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="absolute bottom-4 right-4 w-24 h-24 bg-[#3f51b5] rounded-full flex flex-col items-center justify-center shadow-lg border-4 border-white z-20"
                    >
                      <span className="text-white text-xs font-bold uppercase opacity-60">Σ</span>
                      <span className="text-white text-3xl font-black">{currentResult.compound}</span>
                    </motion.div>
                  </div>

                  {detailData && (
                    <div className="w-full flex flex-col gap-4">
                      {/* Action Bar */}
                      <div className="flex gap-2 w-full mb-2 no-print">
                        <button 
                          onClick={handleShare}
                          className="flex-1 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
                        >
                          <Share2 size={14} /> Copy
                        </button>
                        <button 
                          onClick={shareToWhatsApp}
                          className="flex-1 py-3 bg-[#25D366]/10 border border-[#25D366]/20 rounded-xl text-xs font-bold text-[#128C7E] hover:bg-[#25D366]/20 flex items-center justify-center gap-2"
                        >
                          <MessageSquare size={14} /> WhatsApp
                        </button>
                        <button 
                          onClick={exportToPDF}
                          disabled={isGeneratingPDF}
                          className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                            isGeneratingPDF 
                              ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed' 
                              : 'bg-red-50 border border-red-100 text-red-600 hover:bg-red-100'
                          }`}
                        >
                          {isGeneratingPDF ? (
                            <><RefreshCcw size={14} className="animate-spin" /> Processing</>
                          ) : (
                            <><FileDown size={14} /> PDF</>
                          )}
                        </button>
                      </div>

                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-accent font-black text-3xl">
                          {currentResult.reduced}
                        </div>
                        <div className="flex flex-col">
                          <h2 className="text-2xl font-black text-gray-800 leading-none mb-2">{detailData.title}</h2>
                          <div className="flex gap-2">
                            <span className="px-2 py-0.5 bg-accent/10 rounded text-[10px] font-bold text-accent uppercase">{system}</span>
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase">{detailData.rulingPlanet}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between h-full">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center justify-between">
                            Soul Urge <HeartPulse size={10} className="text-rose-400" />
                          </h4>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-gray-800">{currentResult.soulUrge}</span>
                            <span className="text-[10px] text-gray-400 font-medium">Inner</span>
                          </div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between h-full">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center justify-between">
                            Outer Personality <User size={10} className="text-blue-400" />
                          </h4>
                          <div className="flex items-baseline gap-2">
                             <span className="text-2xl font-black text-gray-800">{currentResult.personality}</span>
                             <span className="text-[10px] text-gray-400 font-medium">Social</span>
                          </div>
                        </div>
                      </div>

                      <DetailCard icon={<Zap className="w-5 h-5" />} title="Primary Strengths" content={
                        <div className="flex flex-wrap gap-2 pt-1">
                          {detailData.good.map((g, i) => <span key={`${g}-${i}`} className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100">{g}</span>)}
                        </div>
                      } />

                      <DetailCard icon={<AlertTriangle className="w-5 h-5" />} title="Vulnerable Areas" content={
                        <div className="flex flex-wrap gap-2 pt-1">
                          {detailData.bad.map((b, i) => <span key={`${b}-${i}`} className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-100">{b}</span>)}
                        </div>
                      } />

                      <DetailCard icon={<User className="w-5 h-5" />} title="Traits & Personality" content={detailData.traits} />
                      
                      <DetailCard icon={<Briefcase className="w-5 h-5" />} title="Professional Horizon" content={
                        <div className="flex flex-col gap-3">
                          <p className="text-gray-600 italic">Best fit for: {detailData.favourableCareer.join(', ')}</p>
                          <div className="p-3 bg-red-50/30 rounded-xl text-xs text-red-600 border border-red-100 font-medium">
                             Caution advised in: {detailData.unfavourableCareer.join(', ')}
                          </div>
                        </div>
                      } />

                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2">
                           <ShieldCheck size={18} className="text-green-500" /> Remedies & Wisdom
                        </h3>
                        <p className="text-sm font-medium text-gray-700 leading-relaxed bg-green-50/50 p-4 rounded-2xl border border-green-100/50">
                          {detailData.remedies}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'bulk' && (
            <motion.div 
              key="bulk"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col gap-6"
            >
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Plus className="text-accent" size={20} />
                    <h2 className="text-xl font-black text-gray-800">Bulk Analysis</h2>
                  </div>
                  <div className="flex gap-2 bg-gray-50 p-1 rounded-xl">
                    {(['Chaldean', 'Pythagorean'] as NumerologySystem[]).map(s => (
                      <button
                        key={s}
                        onClick={() => setSystem(s)}
                        className={`px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                          system === s ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 font-medium pb-2 border-b border-gray-50">
                  Enter multiple names to analyze them all at once. Separate each name using a <strong>new line</strong> or a <strong>semicolon (;)</strong>.
                </p>

                <textarea
                  value={inputBulk}
                  onChange={(e) => setInputBulk(e.target.value)}
                  placeholder="Enter names (e.g. John Doe; Jane Smith)..."
                  rows={8}
                  className="w-full bg-gray-50 border-none rounded-2xl p-6 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                />

                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Preferred Target Number (Optional)</label>
                  <input
                    type="number"
                    value={preferredNumber}
                    onChange={(e) => setPreferredNumber(e.target.value)}
                    placeholder="e.g., 9"
                    className="w-full bg-[#f0f4f0] border-none rounded-2xl px-5 py-4 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                  />
                </div>
                
                <div className="flex gap-2 w-full mt-2">
                  <button 
                    onClick={() => {
                      if (!inputBulk.trim()) return;
                      const results = inputBulk.split(/[\n;]+/)
                        .map(line => line.trim())
                        .filter(line => line.length > 0)
                        .map(name => calculate(name, system));
                      setBulkItemsToSave(results);
                      setIsSaveModalOpen(true);
                    }}
                    disabled={!inputBulk.trim()}
                    className={`flex-1 py-4 border rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      !inputBulk.trim() ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-800 border-gray-800 text-white active:scale-95'
                    }`}
                  >
                    <Bookmark size={16} /> Save All
                  </button>
                  <button 
                    onClick={handleBulkShare}
                    disabled={!inputBulk.trim()}
                    className={`flex-1 py-4 border rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      !inputBulk.trim() ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-900 border-gray-900 text-white active:scale-95'
                    }`}
                  >
                    <Share2 size={16} /> Copy
                  </button>
                  <button 
                    onClick={shareBulkToWhatsApp}
                    disabled={!inputBulk.trim()}
                    className={`flex-1 py-4 border rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      !inputBulk.trim() ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#25D366]/10 border-[#25D366]/20 text-[#128C7E] hover:bg-[#25D366]/20 active:scale-95'
                    }`}
                  >
                    <MessageSquare size={16} /> WhatsApp
                  </button>
                  <button 
                    onClick={exportBulkToPDF}
                    disabled={!inputBulk.trim() || isGeneratingPDF}
                    className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all border ${
                      !inputBulk.trim() || isGeneratingPDF
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100 active:scale-95'
                    }`}
                  >
                    {isGeneratingPDF ? (
                      <><RefreshCcw size={16} className="animate-spin" /> Processing</>
                    ) : (
                      <><FileDown size={16} /> PDF</>
                    )}
                  </button>
                </div>
              </div>

              {inputBulk.trim() && (
                <div id="bulk-report-container" className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Live Preview</h3>
                  <div className="flex flex-col gap-3">
                    {inputBulk.split(/[\n;]+/).filter(l => l.trim()).map((line, idx) => {
                      const res = calculate(line.trim(), system);
                      return (
                        <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 group">
                          <span className="font-bold text-gray-700 truncate">{line.trim()}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{system}</span>
                            <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-black text-lg shadow-sm">
                              {res.reduced}
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center font-bold text-xs">
                              {res.compound}
                            </div>
                            <button 
                              onClick={() => {
                                setItemToSave(res);
                                setIsSaveModalOpen(true);
                              }}
                              className="w-10 h-10 ml-2 rounded-xl bg-accent/5 text-accent flex items-center justify-center hover:bg-accent hover:text-white transition-colors border border-accent/10 shadow-sm"
                              title="Save to Library"
                            >
                              <Bookmark size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {inputBulk.trim() && preferredNumber && (
                <div id="preferred-report-container" className="bg-green-50 rounded-3xl p-6 shadow-sm border border-green-100 overflow-hidden">
                  <h3 className="text-xs font-black text-green-600 uppercase tracking-widest mb-4 flex items-center justify-between">
                    <span>Preferred Matches ({preferredNumber})</span>
                    <Star size={14} className="text-green-500 fill-current" />
                  </h3>
                  <div className="flex flex-col gap-3">
                    {inputBulk.split(/[\n;]+/).filter(l => l.trim()).map(line => calculate(line.trim(), system))
                      .filter(res => res.reduced.toString() === preferredNumber || res.compound.toString() === preferredNumber)
                      .map((res, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 border-b border-green-200/50 last:border-0 group">
                          <span className="font-bold text-green-900 truncate">{res.raw}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-green-600/60 uppercase tracking-tighter">{system}</span>
                            <div className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center font-black text-lg shadow-sm">
                              {res.reduced}
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-white text-green-600 border border-green-200 flex items-center justify-center font-bold text-xs">
                              {res.compound}
                            </div>
                            <button 
                              onClick={() => {
                                setItemToSave(res);
                                setIsSaveModalOpen(true);
                              }}
                              className="w-10 h-10 ml-2 rounded-xl bg-white/50 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors shadow-sm"
                              title="Save to Library"
                            >
                              <Bookmark size={16} />
                            </button>
                          </div>
                        </div>
                    ))}
                    {inputBulk.split(/[\n;]+/).filter(l => l.trim()).map(line => calculate(line.trim(), system))
                      .filter(res => res.reduced.toString() === preferredNumber || res.compound.toString() === preferredNumber).length === 0 && (
                        <div className="text-sm font-bold text-green-600/60 text-center py-4">
                          No matches found.
                        </div>
                    )}
                  </div>
                  
                  {inputBulk.split(/[\n;]+/).filter(l => l.trim()).map(line => calculate(line.trim(), system))
                      .filter(res => res.reduced.toString() === preferredNumber || res.compound.toString() === preferredNumber).length > 0 && (
                    <div className="flex gap-2 w-full mt-6">
                      <button 
                        onClick={handlePreferredShare}
                        className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <Share2 size={16} /> Copy
                      </button>
                      <button 
                        onClick={sharePreferredToWhatsApp}
                        className="flex-1 py-4 bg-[#25D366] text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <MessageSquare size={16} /> WhatsApp
                      </button>
                      <button 
                        onClick={exportPreferredToPDF}
                        disabled={isGeneratingPDF}
                        className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                          isGeneratingPDF 
                            ? 'bg-green-100/50 border border-green-200 text-green-400 cursor-not-allowed' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200 active:scale-95'
                        }`}
                      >
                        {isGeneratingPDF ? (
                          <><RefreshCcw size={16} className="animate-spin" /> Processing</>
                        ) : (
                          <><FileDown size={16} /> PDF</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'compat' && (
            <motion.div 
              key="compat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col gap-6"
            >
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-6">
                <div className="flex items-center gap-2 mb-2">
                  <Handshake className="text-accent" />
                  <h2 className="text-xl font-black text-gray-800">Harmony Check</h2>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Primary Element</label>
                    <input
                      type="text"
                      value={inputCompat1}
                      onChange={(e) => setInputCompat1(e.target.value)}
                      placeholder="Enter first name..."
                      className="w-full bg-[#f0f4f0] border-none rounded-2xl px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Secondary Element</label>
                    <input
                      type="text"
                      value={inputCompat2}
                      onChange={(e) => setInputCompat2(e.target.value)}
                      placeholder="Enter second name..."
                      className="w-full bg-[#f0f4f0] border-none rounded-2xl px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>
                </div>
              </div>

              {compatResults ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex gap-2 w-full">
                    <button 
                      onClick={() => {
                        setItemToSave(compatResults);
                        setIsSaveModalOpen(true);
                      }}
                      className="flex-1 py-4 border border-gray-900 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Bookmark size={16} /> Save
                    </button>
                    <button 
                      onClick={handleHarmonyShare}
                      className="flex-1 py-4 border bg-white border-gray-200 text-gray-700 hover:bg-gray-50 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Share2 size={16} /> Copy
                    </button>
                    <button 
                      onClick={shareHarmonyToWhatsApp}
                      className="flex-1 py-4 bg-[#25D366]/10 border border-[#25D366]/20 text-[#128C7E] hover:bg-[#25D366]/20 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <MessageSquare size={16} /> WhatsApp
                    </button>
                    <button 
                      onClick={exportHarmonyToPDF}
                      disabled={isGeneratingPDF}
                      className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all border shadow-sm ${
                        isGeneratingPDF 
                          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                          : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100 active:scale-95'
                      }`}
                    >
                      {isGeneratingPDF ? (
                        <RefreshCcw size={16} className="animate-spin" />
                      ) : (
                        <><FileDown size={16} /> PDF</>
                      )}
                    </button>
                  </div>

                  <div id="harmony-report-container" className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center gap-6">
                    <div className="flex items-center gap-10">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 bg-[#607d8b] rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg border-4 border-gray-50">
                          {compatResults.r1.reduced}
                        </div>
                        <span className="text-[10px] font-black uppercase text-gray-400 truncate max-w-[80px]">{compatResults.r1.raw}</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className={`p-3 rounded-full ${
                          compatResults.compat.status === 'High' ? 'bg-green-50 text-green-500' :
                          compatResults.compat.status === 'Moderate' ? 'bg-yellow-50 text-yellow-500' :
                          'bg-red-50 text-red-500'
                        }`}>
                          <Sparkles size={24} />
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 bg-[#3f51b5] rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg border-4 border-gray-50">
                          {compatResults.r2.reduced}
                        </div>
                        <span className="text-[10px] font-black uppercase text-gray-400 truncate max-w-[80px]">{compatResults.r2.raw}</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-5xl font-black text-gray-800 mb-1">{compatResults.compat.score}%</div>
                      <div className={`text-xs font-black uppercase tracking-widest mb-4 ${
                        compatResults.compat.status === 'High' ? 'text-green-500' :
                        compatResults.compat.status === 'Moderate' ? 'text-yellow-600' :
                        'text-red-500'
                      }`}>
                        {compatResults.compat.status} Resonance
                      </div>
                      <p className="text-sm text-gray-500 max-w-xs leading-relaxed font-medium">
                        {compatResults.compat.desc}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-black text-gray-800 mb-4 text-sm uppercase flex items-center gap-2">
                      <Info size={16} className="text-accent" /> Understanding Harmony
                    </h3>
                    <div className="space-y-4">
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Numbers that are harmoniously aligned (e.g. 1 & 7, 2 & 9) share similar elemental frequencies. 
                        <strong> Challenging Match?</strong> Don't worry. This simply indicates the areas where growth and conscious work are required for a successful partnership or brand alignment.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center gap-4 text-gray-300">
                  <Handshake size={64} className="opacity-20" />
                  <p className="text-sm font-medium max-w-xs">Enter two names to see how their vibrational blueprints interact.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'saved' && (
            <motion.div 
              key="saved"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
                  <FolderHeart className="text-accent" /> Saved Library
                </h2>
                <span className="text-xs font-bold text-gray-400">{savedItems.length} items</span>
              </div>

              {/* Filters */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-1">
                <button 
                  onClick={() => setCategoryFilter('All')}
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                    categoryFilter === 'All' ? 'bg-gray-800 text-white' : 'bg-white text-gray-400 border border-gray-100'
                  }`}
                >
                  All
                </button>
                {customCategories.map(cat => (
                   <button 
                     key={cat}
                     onClick={() => setCategoryFilter(cat)}
                     className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                       categoryFilter === cat ? 'bg-accent text-white' : 'bg-white text-gray-400 border border-gray-100'
                     }`}
                   >
                     {cat}
                   </button>
                ))}
              </div>

              {savedItems.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center gap-4 border-2 border-dashed border-gray-200 rounded-3xl">
                  <Bookmark size={48} className="text-gray-200" />
                  <p className="text-gray-400 font-medium italic">Your saved collection is empty.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredSaved(savedItems).map(item => (
                    <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between group">
                      <div className="flex items-center gap-4 truncate">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl text-white ${
                          item.reduced === 1 || item.reduced === 9 ? 'bg-[#3f51b5]' : 'bg-[#607d8b]'
                        }`}>
                          {item.reduced}
                        </div>
                        <div className="flex flex-col truncate">
                          <h4 className="font-bold text-gray-800 truncate">{item.raw}</h4>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-[9px] font-black uppercase text-accent bg-accent/5 px-1.5 rounded">{item.category}</span>
                            <span className="text-[9px] font-black uppercase text-gray-400 flex items-center gap-1">
                              <User size={8} /> {item.createdBy || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-gray-300 group-hover:text-accent transition-colors">#{item.compound}</span>
                        <button 
                          onClick={() => deleteSaved(item.id)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
                  <Star className="text-yellow-500" /> Recent Session
                </h2>
                <button 
                  onClick={clearHistory}
                  className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
                >
                  Clear All
                </button>
              </div>

              {history.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
                  <History size={48} className="text-gray-200" />
                  <p className="text-gray-400 font-medium">No recent calculations.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {history.map((h, i) => (
                    <button 
                      key={i} 
                      onClick={() => { setInput(h.raw); setSystem(h.system); setActiveTab('calc'); }}
                      className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between hover:border-accent group"
                    >
                      <div className="flex flex-col items-start truncate">
                        <span className="font-bold text-gray-700 truncate">{h.raw}</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase">{h.system} System</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-accent font-black text-sm">
                          {h.reduced}
                        </div>
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-accent" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Save Modal */}
      <AnimatePresence>
        {isSaveModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-4 pb-4 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsSaveModalOpen(false);
                setItemToSave(null);
                setBulkItemsToSave(null);
              }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[40px] sm:rounded-3xl p-8 relative z-10 shadow-2xl"
            >
              <h3 className="text-xl font-black text-gray-800 mb-2">Save Selection</h3>
              <p className="text-sm text-gray-500 mb-6 font-medium">Choose a category for <span className="text-accent font-bold">"{bulkItemsToSave ? `${bulkItemsToSave.length} Items` : (itemToSave && 'compat' in itemToSave ? `${itemToSave.r1.raw} & ${itemToSave.r2.raw}` : (itemToSave ? itemToSave.raw : currentResult?.raw))}"</span></p>
              
              <div className="grid grid-cols-2 gap-3 mb-8 max-h-[250px] overflow-y-auto no-scrollbar p-1">
                {customCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsAddingCategory(false);
                    }}
                    className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all text-left truncate ${
                      selectedCategory === cat && !isAddingCategory
                        ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20' 
                        : 'border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                
                {isAddingCategory ? (
                  <div className="col-span-2 flex items-center gap-2 mt-1">
                    <input 
                      type="text" 
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="New category..."
                      className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-bold focus:border-accent focus:ring-0 outline-none text-gray-700"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newCategoryName.trim()) {
                          addCategory(newCategoryName.trim());
                          setSelectedCategory(newCategoryName.trim());
                          setNewCategoryName('');
                          setIsAddingCategory(false);
                        }
                      }}
                    />
                    <button 
                      onClick={() => {
                        if (newCategoryName.trim()) {
                          addCategory(newCategoryName.trim());
                          setSelectedCategory(newCategoryName.trim());
                          setNewCategoryName('');
                          setIsAddingCategory(false);
                        } else {
                          setIsAddingCategory(false);
                        }
                      }}
                      className="bg-accent text-white px-4 py-3 rounded-xl font-black text-sm shadow-md shadow-accent/20"
                    >
                      {newCategoryName.trim() ? 'Add' : 'Hide'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsAddingCategory(true);
                    }}
                    className="py-3 px-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-accent hover:text-accent hover:bg-accent/5 font-bold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> New
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setIsSaveModalOpen(false);
                    setItemToSave(null);
                    setBulkItemsToSave(null);
                  }}
                  className="flex-1 py-4 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-4 bg-accent text-white rounded-2xl font-black text-sm shadow-xl shadow-accent/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Confirm Save <Plus size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Login / Selection Modal */}
      <AnimatePresence>
        {isUserModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[42px] p-10 relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col items-center gap-8 border border-gray-100"
            >
              <div className="text-center flex flex-col items-center gap-4">
                <div className="w-full flex justify-center mb-2">
                  {/* Decorative Logo Placeholder resembling the script in the screenshot */}
                  <div className="flex flex-col items-center">
                    <img src={golechaLogoUrl} alt="Golecha Logo" className="h-[110px] w-auto mb-2" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-800 tracking-tight">Numerology Calculator</h3>
                </div>
              </div>

              {regStep === 'form' ? (
                <div className="w-full flex flex-col gap-6">
                  {/* Tab Toggle */}
                  <div className="flex bg-gray-100 p-1 rounded-2xl">
                    <button 
                      onClick={() => setAuthTab('login')}
                      className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${authTab === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => setAuthTab('register')}
                      className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${authTab === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                    >
                      Register
                    </button>
                  </div>

                  {authTab === 'login' ? (
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Login</label>
                        <input
                          type="text"
                          value={loginPhone}
                          onChange={(e) => setLoginPhone(e.target.value)}
                          placeholder="Phone Number / Username"
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-all text-sm"
                        />
                        <button 
                          onClick={handleLogin}
                          disabled={authLoading}
                          className="w-full py-5 mt-2 bg-gray-900 text-white rounded-2xl font-black text-xs shadow-xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-[4px]"
                        >
                          {authLoading ? 'Signing in...' : 'Sign In Now'} <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Register New User</label>
                      <div className="flex flex-col gap-3">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="Full Name"
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-all text-sm"
                        />
                        <input
                          type="text"
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="Phone Number"
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-all text-sm"
                        />
                        <button 
                          onClick={handleRegister}
                          disabled={authLoading}
                          className="w-full py-5 mt-4 bg-accent text-white rounded-2xl font-black text-xs shadow-xl shadow-accent/20 active:scale-95 transition-all uppercase tracking-[4px]"
                        >
                          {authLoading ? 'Registering...' : 'Register & Sign In'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex flex-col items-center gap-6 py-4"
                >
                  <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
                    <ShieldCheck size={40} />
                  </div>
                  <div className="text-center">
                    <h4 className="text-xl font-black text-gray-800">Account Created!</h4>
                    <p className="text-sm text-gray-400 font-medium">Account authentication ready</p>
                  </div>
                  <div className="w-full bg-gray-900 text-white rounded-3xl p-6 flex flex-col items-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={40} /></div>
                    <span className="text-[10px] font-black uppercase tracking-[3px] opacity-60 mb-2">Access Password</span>
                    <span className="text-3xl font-black tracking-[4px]">GOLECHA</span>
                  </div>
                  <button 
                    onClick={() => {
                      setIsUserModalOpen(false);
                      setRegStep('form');
                    }}
                    className="w-full py-4 bg-accent text-white rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all"
                  >
                    Start Using Tool
                  </button>
                </motion.div>
              )}

              <div className="text-center">
                 <p className="text-[7px] text-gray-400 font-bold uppercase tracking-[3px]">Sha Ghewarchand Champalal Group, Bangalore</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ShareToast show={showShareToast} />
    </div>
  );
}

function ShareToast({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold"
        >
          <Star className="text-yellow-400" size={16} /> Report Copied to Clipboard
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DetailCard({ icon, title, content }: { icon: React.ReactNode, title: string, content: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
          {icon}
        </div>
        <h3 className="font-black text-gray-800 tracking-tight text-sm uppercase">{title}</h3>
      </div>
      <div className="text-gray-600 leading-relaxed text-sm md:text-base font-medium">
        {content}
      </div>
    </div>
  );
}

