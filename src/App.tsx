import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  RefreshCw, 
  Trash2, 
  Settings, 
  FileText, 
  ShieldCheck,
  Upload,
  Download,
  FileSpreadsheet,
  FileCode,
  Loader2,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ExternalLink,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import axios from 'axios';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as pdfjs from 'pdfjs-dist';
import { PRTAlert } from './types';
import { HistoryChart } from './components/HistoryChart';

// PDF.js worker setup for Vite
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const normalizeString = (str: string) => {
  if (!str) return "";
  return str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]/g, ""); // remove spaces and special chars
};

export default function App() {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('prt_api_key') || '');
  const [alerts, setAlerts] = useState<PRTAlert[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState<'all' | 'recovered-top10' | 'recovered-top100' | 'still-down-top10' | 'still-down-top100'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);
  const [collapsedDomains, setCollapsedDomains] = useState<Set<string>>(new Set());
  const [selectedAlertForHistory, setSelectedAlertForHistory] = useState<PRTAlert | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [urlKeywords, setUrlKeywords] = useState<{ keyword: string; rank: number | string; combinacion?: string }[]>([]);
  const [isLoadingUrlKeywords, setIsLoadingUrlKeywords] = useState(false);
  const [showUrlKeywords, setShowUrlKeywords] = useState(false);
  const fileInputReplaceRef = useRef<HTMLInputElement>(null);
  const fileInputAppendRef = useRef<HTMLInputElement>(null);

  // Save API key to local storage
  useEffect(() => {
    localStorage.setItem('prt_api_key', apiKey);
  }, [apiKey]);

  // Polling for bookmarklet data
useEffect(() => {
  const interval = setInterval(async () => {
    try {
      const res = await axios.get('/api/prt/pending-bookmarklet');
      const csv = res.data?.data?.csv;
      if (csv) {
        const file = new File([csv], 'bookmarklet-import.csv', { type: 'text/csv' });
        handleFile(file, false);
      }
    } catch (e) {
      // silently ignore — server may not be ready
    }
  }, 3000);
  return () => clearInterval(interval);
}, []);

  const handleFile = async (file: File, append: boolean) => {
    if (!file) return;

    setIsParsing(true);
    const fileName = file.name.toLowerCase();

    try {
      const processGridData = (data: any[][], prefix: string) => {
        if (data.length === 0) return [];
        
        let domainIdx = 0;
        let keywordIdx = 1;
        let combinacionIdx = 2;
        let urlIdx = 3;
        let rankIdx = 4;
        let dayIdx = 5;
        let weekIdx = 6;
        let monthIdx = 7;
        let threeMonthsIdx = -1;
        let sixMonthsIdx = -1;
        let volumenIdx = 8;
        
        const headerRow = data[0].map(h => String(h || '').toLowerCase().trim());
        
        const isHeader = headerRow.some(h => 
          h.includes('dominio') || h.includes('término') || h.includes('termino') || 
          h.includes('rank') || h.includes('posici') || h.includes('url') || h.includes('combinaci')
        );
        
        if (isHeader) {
          const dIdx = headerRow.findIndex(h => h.includes('dominio') || h.includes('domain'));
          if (dIdx !== -1) domainIdx = dIdx; else domainIdx = -1;
          
          const kIdx = headerRow.findIndex(h => h === 'término' || h === 'termino' || h === 'term' || h === 'keyword');
          if (kIdx !== -1) keywordIdx = kIdx; else keywordIdx = -1;
          
          const cIdx = headerRow.findIndex(h => h.includes('combinaci') || h.includes('combinacion'));
          if (cIdx !== -1) combinacionIdx = cIdx; else combinacionIdx = -1;
          
          const uIdx = headerRow.findIndex(h => h.includes('url') || h.includes('enlace') || h.includes('link'));
          if (uIdx !== -1) urlIdx = uIdx; else urlIdx = -1;
          
          const rIdx = headerRow.findIndex((h, i) => i !== urlIdx && (h === 'ranking' || h === 'rank' || (h.includes('posici') && !h.includes('url')) || h === 'rango'));
          if (rIdx !== -1) rankIdx = rIdx; else rankIdx = -1;

          const dayI = headerRow.findIndex(h => h === 'día' || h === 'dia' || h === 'day');
          if (dayI !== -1) dayIdx = dayI; else dayIdx = -1;
          
          const weekI = headerRow.findIndex(h => h === 'semana' || h === 'week');
          if (weekI !== -1) weekIdx = weekI; else weekIdx = -1;
          
          const monthI = headerRow.findIndex(h => h === 'mes' || h === 'month');
          if (monthI !== -1) monthIdx = monthI; else monthIdx = -1;

          const threeMI = headerRow.findIndex(h => h.includes('3 mes') || h.includes('3 month') || h.includes('trimestre'));
          if (threeMI !== -1) threeMonthsIdx = threeMI;

          const sixMI = headerRow.findIndex(h => h.includes('6 mes') || h.includes('6 month') || h.includes('semestre'));
          if (sixMI !== -1) sixMonthsIdx = sixMI;
          
          const vIdx = headerRow.findIndex(h => h.includes('volumen') || h.includes('volume'));
          if (vIdx !== -1) volumenIdx = vIdx; else volumenIdx = -1;

          // Fallbacks for missing headers based on known order
          if (urlIdx === -1 && combinacionIdx !== -1 && rankIdx !== -1 && rankIdx > combinacionIdx + 1) {
            urlIdx = combinacionIdx + 1;
          }
          if (combinacionIdx === -1 && keywordIdx !== -1 && urlIdx !== -1 && urlIdx > keywordIdx + 1) {
            combinacionIdx = keywordIdx + 1;
          }
          if (volumenIdx === -1 && monthIdx !== -1 && headerRow.length > monthIdx + 1) {
            volumenIdx = monthIdx + 1;
          }
        }

        const parsedAlerts: PRTAlert[] = data
          .map((row, index) => {
            if (index === 0 && isHeader) return null;
            if (row.length < 2) return null;
            
            const domain = String(row[domainIdx] || '').trim();
            const keyword = String(row[keywordIdx] || '').trim();
            
            if (!domain || !keyword) return null;
            
            const rankStr = String(row[rankIdx] || '').trim();
            let rank = 101;
            if (rankStr === '101+' || rankStr === '101 +' || rankStr === '>100' || rankStr === '-' || rankStr.toUpperCase() === 'N/A') {
              rank = 101;
            } else {
              rank = parseInt(rankStr, 10);
              if (isNaN(rank)) rank = 0;
            }

            const parsePos = (val: string) => {
              const s = String(val || '').trim();
              if (!s || s === '-' || s.toUpperCase() === 'N/A') return '-';
              if (s === '101+' || s === '101 +' || s === '>100') return 101;
              const n = parseInt(s, 10);
              return isNaN(n) ? s : n;
            };

            return {
              id: `${prefix}-${Date.now()}-${index}`,
              domain,
              keyword,
              combinacion: combinacionIdx !== -1 ? String(row[combinacionIdx] || '').trim() : undefined,
              url: urlIdx !== -1 ? String(row[urlIdx] || '').trim() : undefined,
              alertPosition: rank,
              day: dayIdx !== -1 ? parsePos(row[dayIdx]) : undefined,
              week: weekIdx !== -1 ? parsePos(row[weekIdx]) : undefined,
              month: monthIdx !== -1 ? parsePos(row[monthIdx]) : undefined,
              threeMonths: threeMonthsIdx !== -1 ? parsePos(row[threeMonthsIdx]) : undefined,
              sixMonths: sixMonthsIdx !== -1 ? parsePos(row[sixMonthsIdx]) : undefined,
              volumen: volumenIdx !== -1 ? String(row[volumenIdx] || '').trim() : undefined,
              status: 'pending' as const,
              extraColumns: row.filter((_, i) => i !== domainIdx && i !== keywordIdx && i !== combinacionIdx && i !== rankIdx && i !== urlIdx && i !== dayIdx && i !== weekIdx && i !== monthIdx && i !== volumenIdx).map(String)
            };
          })
          .filter(Boolean) as PRTAlert[];
          
        return parsedAlerts;
      };

      if (fileName.endsWith('.csv')) {
        Papa.parse(file, {
          skipEmptyLines: true,
          complete: (results) => {
            const newAlerts = processGridData(results.data as any[][], 'csv');
            setAlerts(prev => append ? [...prev, ...newAlerts] : newAlerts);
            setIsParsing(false);
          }
        });
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          const newAlerts = processGridData(jsonData, 'xls');
          setAlerts(prev => append ? [...prev, ...newAlerts] : newAlerts);
          setIsParsing(false);
        };
        reader.readAsArrayBuffer(file);
      } else if (fileName.endsWith('.pdf')) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
          const pdf = await pdfjs.getDocument(typedArray).promise;
          let pagesText: string[] = [];
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            // Group items by their vertical position (y-coordinate) to reconstruct lines
            const items = textContent.items as any[];
            const lines: { [key: number]: any[] } = {};
            items.forEach(item => {
              // Group items within 4px vertically to handle slight misalignments
              const y = Math.round(item.transform[5] / 4) * 4;
              if (!lines[y]) lines[y] = [];
              lines[y].push(item);
            });
            
            // Sort lines by y descending (top to bottom)
            const sortedY = Object.keys(lines).map(Number).sort((a, b) => b - a);
            const pageLines = sortedY.map(y => {
              // Sort items by x coordinate (left to right)
              const sortedItems = lines[y].sort((a, b) => a.transform[4] - b.transform[4]);
              
              let lineStr = '';
              let lastX = -1;
              let lastWidth = 0;
              
              sortedItems.forEach(item => {
                const x = item.transform[4];
                let str = item.str;
                
                // Fix common PDF ligatures (fi, fl, ff, etc.) that often extract as special characters
                if (str) {
                  // Normalize standard unicode ligatures
                  str = str.normalize('NFKC');
                  // Explicit fallbacks for common ligatures
                  str = str.replace(/\uFB00/g, 'ff')
                           .replace(/\uFB01/g, 'fi')
                           .replace(/\uFB02/g, 'fl')
                           .replace(/\uFB03/g, 'ffi')
                           .replace(/\uFB04/g, 'ffl');
                }
                
                if (lastX !== -1) {
                  const gap = x - (lastX + lastWidth);
                  // If there's a visual gap > 10px, it's likely a new column
                  if (gap > 10) {
                    lineStr += '\t';
                  } else if (gap > 4 && !lineStr.endsWith(' ') && !str.startsWith(' ')) {
                    lineStr += ' ';
                  }
                }
                lineStr += str;
                lastX = x;
                lastWidth = item.width || 0;
              });
              
              return lineStr.trim();
            });
            pagesText.push(...pageLines);
          }

          let currentDomain = '';
          let pendingKeyword = '';
          const newAlerts: PRTAlert[] = [];
          
          let hasVolumen = false;
          pagesText.forEach(line => {
            if (line && (line.toLowerCase().includes('volumen') || line.toLowerCase().includes('volume'))) {
              hasVolumen = true;
            }
          });
          
          pagesText.forEach((line, index) => {
            if (!line) return;

            // Match the 5 or 6-column format: Term | [URL] | Rank | Day | Week | Month
            // The URL might be missing if the term is not ranking.
            const rankPattern = /([0-9]+|101\s*\+|>100|-|N\/A)/i;
            const volumePattern = /([0-9,.]+[KkMm]?|-|N\/A)/i;
            
            let rowMatch = null;
            let volumeStr = undefined;
            
            if (hasVolumen) {
              const matchWithVol = line.match(new RegExp(`^(.*?)\\s+${rankPattern.source}\\s+${rankPattern.source}\\s+${rankPattern.source}\\s+${rankPattern.source}\\s+${volumePattern.source}$`, 'i'));
              if (matchWithVol) {
                rowMatch = matchWithVol;
                volumeStr = matchWithVol[6].trim();
              }
            }
            
            if (!rowMatch) {
              rowMatch = line.match(new RegExp(`^(.*?)\\s+${rankPattern.source}\\s+${rankPattern.source}\\s+${rankPattern.source}\\s+${rankPattern.source}$`, 'i'));
            }

            if (rowMatch) {
              let keywordRaw = rowMatch[1].trim();
              
              if (pendingKeyword) {
                keywordRaw = pendingKeyword + ' ' + keywordRaw;
                pendingKeyword = '';
              }

              const rankingStr = rowMatch[2].trim();
              const dayStr = rowMatch[3].trim();
              const weekStr = rowMatch[4].trim();
              const monthStr = rowMatch[5].trim();
              
              // Check if the last word of the keywordRaw is actually a URL
              let keyword = keywordRaw;
              let url = '';
              
              if (keywordRaw.includes('\t')) {
                const parts = keywordRaw.split('\t').map(p => p.trim()).filter(Boolean);
                if (parts.length > 1) {
                  const lastPart = parts[parts.length - 1];
                  if (
                    lastPart.startsWith('/') ||
                    lastPart.startsWith('http://') ||
                    lastPart.startsWith('https://') ||
                    lastPart.startsWith('www.') ||
                    /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(lastPart) ||
                    (lastPart.match(/\//g) || []).length > 1 ||
                    lastPart === '-' ||
                    lastPart.toUpperCase() === 'N/A' ||
                    (lastPart.includes('/') && lastPart.length > 5 && (lastPart.endsWith('-') || (lastPart.match(/-/g) || []).length > 1))
                  ) {
                    url = parts.pop() || '';
                  }
                  keyword = parts[0] || keyword;
                } else {
                  keyword = parts[0] || keyword;
                }
              } else {
                const words = keywordRaw.split(/\s+/);
                if (words.length > 1) {
                  const lastWord = words[words.length - 1];
                  if (
                    lastWord.startsWith('/') ||
                    lastWord.startsWith('http://') ||
                    lastWord.startsWith('https://') ||
                    lastWord.startsWith('www.') ||
                    /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(lastWord) ||
                    (lastWord.match(/\//g) || []).length > 1 ||
                    lastWord === '-' ||
                    lastWord.toUpperCase() === 'N/A' ||
                    // Catch truncated URLs that contain a slash and hyphens
                    (lastWord.includes('/') && lastWord.length > 5 && (lastWord.endsWith('-') || (lastWord.match(/-/g) || []).length > 1))
                  ) {
                    url = words.pop() || '';
                    keyword = words.join(' ');
                  }
                }
              }
              
              // Skip header rows
              const isHeader = keyword.toLowerCase() === 'termino' || keyword.toLowerCase() === 'término' || keyword.toLowerCase() === 'tipo';
              if (isHeader) return;

              const parsePos = (val: string) => {
                if (!val || val === '-' || val.toUpperCase() === 'N/A') return '-';
                if (val === '101+' || val === '101 +' || val === '>100') return 101;
                const n = parseInt(val, 10);
                return isNaN(n) ? val : n;
              };

              let ranking = 101;
              if (rankingStr === '101+' || rankingStr === '101 +' || rankingStr === '>100' || rankingStr === '-' || rankingStr.toUpperCase() === 'N/A') {
                ranking = 101;
              } else {
                ranking = parseInt(rankingStr, 10) || 101;
              }

              const fixLigatures = (text: string) => {
                let fixed = text;
                const gap = '[\\s\\uFFFD\\uE000-\\uF8FF]';
                
                const replacements = [
                  { p: new RegExp(`\\bcon${gap}anza\\b`, 'gi'), r: 'confianza' },
                  { p: new RegExp(`\\bra${gap}a\\b`, 'gi'), r: 'rafia' },
                  { p: new RegExp(`\\bper${gap}l\\b`, 'gi'), r: 'perfil' },
                  { p: new RegExp(`\\bo${gap}cina\\b`, 'gi'), r: 'oficina' },
                  { p: new RegExp(`\\bbene${gap}cio\\b`, 'gi'), r: 'beneficio' },
                  { p: new RegExp(`\\ba${gap}liado\\b`, 'gi'), r: 'afiliado' },
                  { p: new RegExp(`\\bedi${gap}cio\\b`, 'gi'), r: 'edificio' },
                  { p: new RegExp(`\\bcerti${gap}cado\\b`, 'gi'), r: 'certificado' },
                  { p: new RegExp(`\\bcali${gap}caci[oó]n\\b`, 'gi'), r: 'calificación' },
                  { p: new RegExp(`\\bsigni${gap}cado\\b`, 'gi'), r: 'significado' },
                  { p: new RegExp(`\\barti${gap}cial\\b`, 'gi'), r: 'artificial' },
                  { p: new RegExp(`\\bsuper${gap}cie\\b`, 'gi'), r: 'superficie' },
                  { p: new RegExp(`\\bsu${gap}ciente\\b`, 'gi'), r: 'suficiente' },
                  { p: new RegExp(`\\be${gap}caz\\b`, 'gi'), r: 'eficaz' },
                  { p: new RegExp(`\\be${gap}ciencia\\b`, 'gi'), r: 'eficiencia' },
                  { p: new RegExp(`\\bgra${gap}co\\b`, 'gi'), r: 'grafico' },
                  { p: new RegExp(`\\bespeci${gap}co\\b`, 'gi'), r: 'especifico' },
                  { p: new RegExp(`\\bpac[ií]${gap}co\\b`, 'gi'), r: 'pacifico' },
                  { p: new RegExp(`\\bcient[ií]${gap}co\\b`, 'gi'), r: 'cientifico' },
                  { p: new RegExp(`\\bo${gap}cer\\b`, 'gi'), r: 'officer' },
                  { p: new RegExp(`\\bo${gap}ce\\b`, 'gi'), r: 'office' },
                  { p: new RegExp(`\\ba${gap}liate\\b`, 'gi'), r: 'affiliate' },
                  { p: new RegExp(`\\btra${gap}c\\b`, 'gi'), r: 'traffic' },
                  { p: new RegExp(`\\bin${gap}uencia\\b`, 'gi'), r: 'influencia' },
                  { p: new RegExp(`\\bcon${gap}icto\\b`, 'gi'), r: 'conflicto' },
                  { p: new RegExp(`\\bre${gap}ejo\\b`, 'gi'), r: 'reflejo' },
                  { p: /\bocer\b/gi, r: 'officer' },
                  { p: /\boce\b/gi, r: 'office' },
                  { p: new RegExp(`(?:^|\\s|\\uFFFD)\\s*nanciaci[oó]n\\b`, 'gi'), r: ' financiación' },
                  { p: new RegExp(`(?:^|\\s|\\uFFFD)\\s*nanciero\\b`, 'gi'), r: ' financiero' },
                  { p: new RegExp(`(?:^|\\s|\\uFFFD)\\s*tness\\b`, 'gi'), r: ' fitness' },
                  { p: new RegExp(`(?:^|\\s|\\uFFFD)\\s*gura\\b`, 'gi'), r: ' figura' },
                  { p: new RegExp(`(?:^|\\s|\\uFFFD)\\s*ltro\\b`, 'gi'), r: ' filtro' },
                  { p: new RegExp(`(?:^|\\s|\\uFFFD)\\s*rma\\b`, 'gi'), r: ' firma' },
                  { p: new RegExp(`(?:^|\\s|\\uFFFD)\\s*sico\\b`, 'gi'), r: ' fisico' },
                  { p: new RegExp(`(?:^|\\s|\\uFFFD)\\s*ores\\b`, 'gi'), r: ' flores' },
                  { p: new RegExp(`(?:^|\\s|\\uFFFD)\\s*ota\\b`, 'gi'), r: ' flota' },
                  { p: new RegExp(`(?:^|\\s|\\uFFFD)\\s*ujo\\b`, 'gi'), r: ' flujo' },
                  { p: new RegExp(`(?:^|\\s|\\uFFFD)\\s*exible\\b`, 'gi'), r: ' flexible' }
                ];

                replacements.forEach(({p, r}) => {
                  fixed = fixed.replace(p, r);
                });

                // Global fallback: replace any remaining square/PUA with 'fi'
                fixed = fixed.replace(/[\uFFFD\uE000-\uF8FF]/g, 'fi');
                
                return fixed.replace(/\s+/g, ' ').trim();
              };

              if (currentDomain && keyword) {
                newAlerts.push({
                  id: `pdf-${Date.now()}-${index}`,
                  domain: currentDomain,
                  keyword: fixLigatures(keyword),
                  url: url,
                  alertPosition: ranking,
                  day: parsePos(dayStr),
                  week: parsePos(weekStr),
                  month: parsePos(monthStr),
                  volumen: volumeStr,
                  status: 'pending',
                  extraColumns: []
                });
              }
              return;
            }

            // If it's not a row, check if it's a domain header
            const domainMatch = line.match(/^(?:Domain:\s*|Sitio:\s*|URL:\s*)?([a-z0-9.-]+\.[a-z]{2,})/i);
            if (domainMatch) {
              currentDomain = domainMatch[1].toLowerCase();
              pendingKeyword = '';
            } else {
              // Check if it might be a pending keyword (wrapped to next line)
              const trimmedLine = line.trim();
              const lowerLine = trimmedLine.toLowerCase();
              const isHeaderOrFooter = 
                lowerLine.includes('pro rank tracker') || 
                lowerLine.includes('page ') || 
                lowerLine.includes('página ') ||
                lowerLine.includes('search engine') ||
                lowerLine.includes('motor de búsqueda') ||
                lowerLine.includes('término') ||
                lowerLine.includes('termino') ||
                lowerLine.includes('ranking') ||
                lowerLine.includes('url indexada') ||
                lowerLine.includes('google.') ||
                lowerLine.includes('bing.') ||
                lowerLine.includes('yahoo.') ||
                lowerLine === 'desktop' ||
                lowerLine === 'mobile' ||
                lowerLine === 'local';
                
              const isDateOrTime = /^[0-9/: -]+$/.test(trimmedLine);
              
              // If it has no spaces, starts with http/www, or has domain extensions, it's a URL
              const isUrlOrFragment = 
                trimmedLine.startsWith('http') || 
                trimmedLine.startsWith('www.') ||
                (!trimmedLine.includes(' ') && (trimmedLine.includes('.com') || trimmedLine.includes('.es') || trimmedLine.includes('.net') || trimmedLine.includes('.org'))) ||
                (!trimmedLine.includes(' ') && trimmedLine.includes('/') && trimmedLine.length > 10);

              if (!isHeaderOrFooter && !isUrlOrFragment && !isDateOrTime && trimmedLine.length > 0 && trimmedLine.length < 100) {
                pendingKeyword = pendingKeyword ? pendingKeyword + ' ' + trimmedLine : trimmedLine;
              } else {
                // If we hit a header, a URL, a date, or a blank line, CLEAR the pending keyword.
                // It means the sequence of keyword parts was broken.
                pendingKeyword = '';
              }
            }
          });

          setAlerts(prev => append ? [...prev, ...newAlerts] : newAlerts);
          setIsParsing(false);
        };
        reader.readAsArrayBuffer(file);
      }
    } catch (error) {
      console.error("File parsing failed", error);
      setIsParsing(false);
    }
  };

  const handleFileUploadReplace = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file, false);
    event.target.value = '';
  };

  const handleFileUploadAppend = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file, true);
    event.target.value = '';
  };

  const handleDropReplace = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file, false);
  };

  const handleDropAppend = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file, true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(5, 150, 105); 
    doc.text('PRT Alert Cleaner - Reporte de Verificación', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 30);
    
    // Use filtered alerts for export
    const dataToExport = filteredAlerts;
    const total = dataToExport.length;
    const recoveredTop10 = dataToExport.filter(a => a.status === 'recovered-top10').length;
    const recoveredTop100 = dataToExport.filter(a => a.status === 'recovered-top100').length;
    const downTop10 = dataToExport.filter(a => a.status === 'still-down-top10').length;
    const downTop100 = dataToExport.filter(a => a.status === 'still-down-top100').length;
    
    doc.text(`Reporte: ${filter.toUpperCase()} | Total: ${total} | Rec. Top10: ${recoveredTop10} | Rec. Top100: ${recoveredTop100} | Fuera Top10: ${downTop10} | Fuera Top100: ${downTop100}`, 14, 38);

    const tableData = dataToExport.map(a => [
      a.domain,
      a.keyword,
      a.combinacion || '',
      a.url || '',
      a.alertPosition,
      a.day || '',
      a.week || '',
      a.month || '',
      a.currentPosition === 101 ? '>100' : (a.currentPosition || '—'),
      a.volumen || ''
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['Dominio', 'Keyword', 'Combinación', 'URL', 'Ranking', 'Día', 'Semana', 'Mes', 'Actual', 'Volumen']],
      body: tableData,
      headStyles: { fillColor: [5, 150, 105] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { fontSize: 8 },
      columnStyles: {
        3: { cellWidth: 40 } // Limit width of URL
      }
    });

    doc.save(`PRT-Alert-Report-${filter}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const checkRankings = async () => {
    if (!apiKey || apiKey.trim().length < 5) {
      setShowSettings(true);
      alert("Por favor, introduce una API Key válida en la configuración.");
      return;
    }

    setIsChecking(true);
    setAlerts(prev => prev.map(a => ({ ...a, status: 'checking' as const })));

    try {
      console.log("Iniciando verificación con PRT...");
      const response = await axios.post('/api/prt/rankings', { 
        apiKey,
        alerts
      });
      
      const prtData = response.data?.data || [];
      console.log(`Recibidos ${prtData.length} resultados de PRT`);

      if (prtData.length === 0) {
        alert("No se han encontrado datos en tu cuenta de PRT. Asegúrate de tener keywords activas y que tu API Key sea correcta.");
      }

      let matchCount = 0;
      setAlerts(prev => prev.map(alert => {
        // Find match by domain and keyword
        const matches = prtData.filter((p: any) => {
          const termName = (p.keyword || p.name || p.term || "");
          const keywordMatch = normalizeString(termName) === normalizeString(alert.keyword);
          
          if (!keywordMatch) return false;

          const pUrl = (p.domain || p.url || "").toLowerCase();
          const cleanPUrl = pUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').split('/')[0];
          const cleanAlertDomain = alert.domain.toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').split('/')[0];
          
          return cleanPUrl === cleanAlertDomain || cleanPUrl.includes(cleanAlertDomain) || cleanAlertDomain.includes(cleanPUrl);
        });

        const match = matches[0];

        if (match) {
          matchCount++;
          let currentPos = null;
          const rawRank = match.rank ?? match.position;
          
          if (rawRank !== undefined && rawRank !== null) {
            if (rawRank === 'NTH' || rawRank === 'N/A' || rawRank === '—' || rawRank === '-') {
              currentPos = 101; 
            } else {
              currentPos = parseInt(rawRank.toString(), 10);
            }
          }

          if (currentPos !== null && !isNaN(currentPos)) {
            let newStatus: PRTAlert['status'] = alert.status; 
            
            if (alert.alertPosition === 101) {
              newStatus = currentPos <= 100 ? 'recovered-top100' : 'still-down-top100';
            } else if (alert.alertPosition > 10 && alert.alertPosition <= 100) {
              newStatus = currentPos <= 10 ? 'recovered-top10' : 'still-down-top10';
            } else {
              newStatus = currentPos <= 10 ? 'recovered-top10' : 'still-down-top10';
            }

            return {
              ...alert,
              currentPosition: currentPos,
              status: newStatus,
              lastChecked: new Date(),
              url: match.matched_url || match.url || alert.url,
              combinacion: match.combinacion || match.string || match.location || match.engine || '',
              urlTermId: match.url_term_id || match.id || match.term_id,
              urlId: match.url_id
            };
          }
        }

        return { ...alert, status: alert.status === 'checking' ? 'idle' : alert.status };
      }));

      console.log(`Verificación finalizada. Coincidencias encontradas: ${matchCount}`);
      if (matchCount === 0 && prtData.length > 0) {
        alert(`Se han recibido ${prtData.length} resultados de PRT pero ninguno coincide con tus alertas actuales. Revisa que los dominios y keywords coincidan exactamente.`);
      }

    } catch (error: any) {
      console.error("Check failed", error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
      alert(`Error de verificación: ${errorMsg}`);
      setAlerts(prev => prev.map(a => a.status === 'checking' ? { ...a, status: 'error' as const } : a));
    } finally {
      setIsChecking(false);
    }
  };

  const exportToCSV = () => {
    if (filteredAlerts.length === 0) return;
    
    const csvData = filteredAlerts.map(a => ({
      Dominio: a.domain,
      Keyword: a.keyword,
      Combinación: a.combinacion || '',
      URL: a.url || '',
      Ranking: a.alertPosition,
      Día: a.day || '',
      Semana: a.week || '',
      Mes: a.month || '',
      Actual: a.currentPosition === 101 ? '>100' : (a.currentPosition || '—'),
      Volumen: a.volumen || ''
    }));
    
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `PRT-Alerts-${filter}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    if (filteredAlerts.length === 0) return;
    
    const excelData = filteredAlerts.map(a => ({
      Dominio: a.domain,
      Keyword: a.keyword,
      Combinación: a.combinacion || '',
      URL: a.url || '',
      Ranking: a.alertPosition,
      Día: a.day || '',
      Semana: a.week || '',
      Mes: a.month || '',
      Actual: a.currentPosition === 101 ? '>100' : (a.currentPosition || '—'),
      Volumen: a.volumen || ''
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Alertas");
    
    XLSX.writeFile(workbook, `PRT-Alerts-${filter}-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const removeDomain = (domain: string) => {
    setAlerts(prev => prev.filter(a => a.domain !== domain));
  };

  const toggleDomain = (domain: string) => {
    setCollapsedDomains(prev => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    // Auto-reset checkmark after 2 seconds to allow re-copying without double click
    setTimeout(() => {
      setCopiedId(prev => prev === id ? null : prev);
    }, 2000);
  };

  const handleCopyDomainKWs = (domain: string, domainAlerts: PRTAlert[]) => {
    const kws = domainAlerts.map(a => a.keyword).join('\n');
    navigator.clipboard.writeText(kws);
    setCopiedDomain(domain);
    setTimeout(() => setCopiedDomain(null), 2000);
  };

  const clearAll = () => {
    setAlerts([]);
  };

  const fetchUrlKeywords = async (urlId: string | number, currentUrl?: string) => {
    if (!apiKey || !urlId) return;
    
    setIsLoadingUrlKeywords(true);
    setUrlKeywords([]);
    try {
      const response = await axios.post('/api/prt/url-keywords', { 
        apiKey, 
        urlId,
        targetUrl: currentUrl
      });
      setUrlKeywords(response.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch URL keywords", error);
    } finally {
      setIsLoadingUrlKeywords(false);
    }
  };

  const fetchHistory = async (prtAlert: PRTAlert, range: number = 30) => {
    const { urlTermId, urlId, status, url } = prtAlert;
    
    // Reset keywords state
    setUrlKeywords([]);
    setShowUrlKeywords(false);
    
    // Fetch URL Keywords if urlId exists
    if (urlId) {
      fetchUrlKeywords(urlId, url);
    }
    
    // Performance optimization as requested: only fetch for KWs still out of Top 10/100
    const isOut = status === 'still-down-top10' || status === 'still-down-top100';
    if (!isOut) {
      console.log(`[PRT History] Skipping history fetch for ${prtAlert.keyword} as it is in Top 10/100.`);
      // We still select it to show the detail view, but without history chart
      setSelectedAlertForHistory(prtAlert);
      return;
    }

    if (!urlTermId || !urlId) {
      alert("No se ha podido encontrar el ID de la keyword en PRT. Asegúrate de haber realizado la verificación de posiciones primero.");
      return;
    }
    if (!apiKey || apiKey.trim().length < 5) {
      setShowSettings(true);
      alert("Por favor, introduce una API Key válida en la configuración.");
      return;
    }

    setIsLoadingHistory(true);
    try {
      const response = await axios.post('/api/prt/history', { 
        apiKey, 
        termId: urlTermId, 
        urlId,
        range 
      });
      const historyData = response.data?.data || [];
      
      if (historyData.length === 0) {
        console.warn("No real history data returned from PRT for termId:", urlTermId);
      }

      // Map PRT history data to our format
      const mappedHistory = historyData.map((h: any) => ({
        date: h.date,
        rank: h.rank === 'NTH' ? 101 : parseInt(h.rank, 10),
        url: h.url
      }));

      setAlerts(prev => prev.map(a => a.id === prtAlert.id ? { ...a, history: mappedHistory } : a));
      setSelectedAlertForHistory({ ...prtAlert, history: mappedHistory });
    } catch (error) {
      console.error("Failed to fetch history", error);
      alert("Error al obtener el historial real de PRT. Verifica tu API Key o la conexión.");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'recovered-top10') return a.status === 'recovered-top10';
    if (filter === 'recovered-top100') return a.status === 'recovered-top100';
    if (filter === 'still-down-top10') return a.status === 'still-down-top10';
    if (filter === 'still-down-top100') return a.status === 'still-down-top100';
    return true;
  });

  const groupedAlerts = filteredAlerts.reduce((acc, alert) => {
    if (!acc[alert.domain]) {
      acc[alert.domain] = [];
    }
    acc[alert.domain].push(alert);
    return acc;
  }, {} as { [key: string]: PRTAlert[] });

  const shouldStrikethrough = (alert: PRTAlert) => {
    if (alert.status !== 'still-down-top10' || alert.currentPosition === undefined) return false;
    
    const current = alert.currentPosition;
    const week = typeof alert.week === 'number' ? alert.week : (alert.week === '-' ? 101 : parseInt(String(alert.week), 10));
    const month = typeof alert.month === 'number' ? alert.month : (alert.month === '-' ? 101 : parseInt(String(alert.month), 10));
    const ranking = alert.alertPosition;

    const cond1 = !isNaN(week) && !isNaN(month) && current <= week && current <= month;
    const cond2 = !isNaN(month) && current <= ranking && current <= month;

    return cond1 || cond2;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-emerald-100">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">PRT Alert Cleaner</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">SEO Verification Tool</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                showSettings ? "bg-zinc-100 text-emerald-600" : "hover:bg-zinc-100 text-zinc-600"
              )}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          
          <div className="space-y-6">
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Importar Alertas</h2>
                <div className="flex gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-zinc-300" />
                  <FileCode className="w-4 h-4 text-zinc-300" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                  onClick={() => fileInputReplaceRef.current?.click()}
                  onDrop={handleDropReplace}
                  onDragOver={handleDragOver}
                  className="group relative border-2 border-dashed border-zinc-200 hover:border-emerald-500 rounded-2xl p-8 transition-all cursor-pointer bg-zinc-50 hover:bg-emerald-50/50 flex flex-col items-center justify-center gap-3 h-full min-h-[160px]"
                >
                  <input 
                    type="file" 
                    ref={fileInputReplaceRef} 
                    onChange={handleFileUploadReplace}
                    className="hidden" 
                    accept=".csv,.xlsx,.xls,.pdf"
                  />
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-zinc-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {isParsing ? <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" /> : <Upload className="w-6 h-6 text-zinc-400 group-hover:text-emerald-600" />}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-zinc-900">Nuevo Archivo</p>
                    <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-semibold">Reemplaza las alertas actuales</p>
                  </div>
                </div>

                <div 
                  onClick={() => fileInputAppendRef.current?.click()}
                  onDrop={handleDropAppend}
                  onDragOver={handleDragOver}
                  className="group relative border-2 border-dashed border-zinc-200 hover:border-emerald-500 rounded-2xl p-8 transition-all cursor-pointer bg-zinc-50 hover:bg-emerald-50/50 flex flex-col items-center justify-center gap-3 h-full min-h-[160px]"
                >
                  <input 
                    type="file" 
                    ref={fileInputAppendRef} 
                    onChange={handleFileUploadAppend}
                    className="hidden" 
                    accept=".csv,.xlsx,.xls,.pdf"
                  />
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-zinc-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {isParsing ? <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" /> : <FileSpreadsheet className="w-6 h-6 text-zinc-400 group-hover:text-emerald-600" />}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-zinc-900">Añadir Archivo</p>
                    <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-semibold">Se suma a las alertas actuales</p>
                  </div>
                </div>
              </div>
            </section>

            <AnimatePresence>
              {showSettings && (
                <motion.section 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100"
                >
                  <h2 className="text-sm font-bold text-emerald-900 mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Configuración API
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-700 mb-1 uppercase tracking-wider">PRT API Key</label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Introduce tu API Key"
                        className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
              <div className="p-4 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-4 bg-zinc-50/50">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setFilter('all')}
                    className={cn("px-3 py-1.5 text-sm font-semibold rounded-lg transition-all", filter === 'all' ? "bg-white shadow-sm text-emerald-600 border border-zinc-200" : "text-zinc-500 hover:text-zinc-700")}
                  >
                    Todas ({alerts.length})
                  </button>
                  <button 
                    onClick={() => setFilter('recovered-top10')}
                    className={cn("px-3 py-1.5 text-sm font-semibold rounded-lg transition-all", filter === 'recovered-top10' ? "bg-white shadow-sm text-emerald-600 border border-zinc-200" : "text-zinc-500 hover:text-zinc-700")}
                  >
                    Recuperadas Top 10 ({alerts.filter(a => a.status === 'recovered-top10').length})
                  </button>
                  <button 
                    onClick={() => setFilter('recovered-top100')}
                    className={cn("px-3 py-1.5 text-sm font-semibold rounded-lg transition-all", filter === 'recovered-top100' ? "bg-white shadow-sm text-emerald-600 border border-zinc-200" : "text-zinc-500 hover:text-zinc-700")}
                  >
                    Recuperadas Top 100 ({alerts.filter(a => a.status === 'recovered-top100').length})
                  </button>
                  <button 
                    onClick={() => setFilter('still-down-top10')}
                    className={cn("px-3 py-1.5 text-sm font-semibold rounded-lg transition-all", filter === 'still-down-top10' ? "bg-white shadow-sm text-emerald-600 border border-zinc-200" : "text-zinc-500 hover:text-zinc-700")}
                  >
                    Fuera Top 10 ({alerts.filter(a => a.status === 'still-down-top10').length})
                  </button>
                  <button 
                    onClick={() => setFilter('still-down-top100')}
                    className={cn("px-3 py-1.5 text-sm font-semibold rounded-lg transition-all", filter === 'still-down-top100' ? "bg-white shadow-sm text-emerald-600 border border-zinc-200" : "text-zinc-500 hover:text-zinc-700")}
                  >
                    Fuera Top 100 ({alerts.filter(a => a.status === 'still-down-top100').length})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={exportToPDF}
                    disabled={filteredAlerts.length === 0}
                    className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-bold hover:bg-zinc-50 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exportar {filter === 'all' ? 'Todo' : 'Filtrado'}
                  </button>
                  <button
                    onClick={exportToCSV}
                    disabled={filteredAlerts.length === 0}
                    className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-bold hover:bg-zinc-50 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Exportar CSV
                  </button>
                  <button
                    onClick={exportToExcel}
                    disabled={filteredAlerts.length === 0}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm shadow-emerald-200"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Exportar Excel
                  </button>
                  <button
                    onClick={checkRankings}
                    disabled={alerts.length === 0 || isChecking}
                    className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-bold hover:bg-zinc-800 disabled:bg-zinc-200 transition-all flex items-center gap-2"
                  >
                    <RefreshCw className={cn("w-4 h-4", isChecking && "animate-spin")} />
                    {isChecking ? 'Verificando...' : 'Verificar Ahora'}
                  </button>
                  <button
                    onClick={clearAll}
                    className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50/50 text-xs uppercase tracking-widest text-zinc-400 font-bold border-b border-zinc-100">
                      <th className="px-6 py-4">Keyword / URL</th>
                      <th className="px-6 py-4 text-center">Ranking</th>
                      <th className="px-6 py-4 text-center">Día</th>
                      <th className="px-6 py-4 text-center">Semana</th>
                      <th className="px-6 py-4 text-center">Mes</th>
                      <th className="px-6 py-4 text-center">Actual</th>
                      <th className="px-6 py-4 text-center">Volumen</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {filteredAlerts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-2 text-zinc-400">
                            <Search className="w-8 h-8 opacity-20" />
                            <p className="text-base">No hay alertas que coincidan</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      (Object.entries(groupedAlerts) as [string, PRTAlert[]][])
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([domain, domainAlerts]) => {
                        const isDomainHighlighted = domainAlerts.some(alert => alert.id === copiedId) || copiedDomain === domain;
                        
                        return (
                          <React.Fragment key={domain}>
                            <tr className={cn(
                              "bg-zinc-50/30 group/domain transition-colors",
                              isDomainHighlighted ? "bg-yellow-100/80" : ""
                            )}>
                              <td colSpan={8} className="px-6 py-2 border-y border-zinc-100">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div 
                                      className="flex items-center gap-2 cursor-pointer select-none"
                                      onClick={() => toggleDomain(domain)}
                                    >
                                      {collapsedDomains.has(domain) ? (
                                        <ChevronRight className="w-4 h-4 text-zinc-400" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4 text-zinc-400" />
                                      )}
                                      <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">
                                        {domain}
                                      </span>
                                      <span className="text-xs text-zinc-400 font-medium">({domainAlerts.length} keywords)</span>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyDomainKWs(domain, domainAlerts);
                                      }}
                                      className="p-1 text-zinc-400 hover:text-emerald-600 transition-colors flex items-center gap-1"
                                      title="Copiar todas las keywords del dominio"
                                    >
                                      {copiedDomain === domain ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => removeDomain(domain)}
                                    className="p-1 text-zinc-300 hover:text-red-500 opacity-0 group-hover/domain:opacity-100 transition-all"
                                    title={`Eliminar dominio ${domain}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          {!collapsedDomains.has(domain) && domainAlerts.map((alert) => (
                            <motion.tr 
                              layout
                              key={alert.id} 
                              className={cn(
                                "group transition-colors",
                                copiedId === alert.id ? "bg-yellow-50/80" : "hover:bg-zinc-50/50"
                              )}
                            >
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleCopy(alert.keyword, alert.id)}
                                      className={cn(
                                        "text-[16px] font-medium transition-colors flex items-center gap-1.5 text-left group/copy",
                                        shouldStrikethrough(alert) ? "text-zinc-400 line-through decoration-zinc-400" : "text-zinc-700 hover:text-emerald-600",
                                        copiedId === alert.id && "text-emerald-600"
                                      )}
                                      title="Copiar keyword"
                                    >
                                      {alert.keyword}
                                      {copiedId === alert.id ? (
                                        <Check className="w-4 h-4 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-4 h-4 text-zinc-400 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                                      )}
                                    </button>
                                  </div>
                                  {alert.url && (
                                    <a 
                                      href={alert.url.startsWith('http') ? alert.url : `https://${alert.url}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="text-[13px] text-zinc-400 hover:text-emerald-600 hover:underline break-all" 
                                      title={alert.url}
                                    >
                                      {alert.url}
                                    </a>
                                  )}
                                  {alert.combinacion && (
                                    <span className="text-[11px] text-zinc-500 font-medium mt-0.5">
                                      {alert.combinacion}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={cn(
                                  "inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold border",
                                  (alert.status === 'still-down-top10' || alert.status === 'still-down-top100') ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-zinc-50 text-zinc-600 border-zinc-100"
                                )}>
                                  {alert.alertPosition}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="text-sm font-medium text-zinc-900">{alert.day || '—'}</span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="text-sm font-medium text-zinc-900">{alert.week || '—'}</span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="text-sm font-medium text-zinc-900">{alert.month || '—'}</span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  {alert.currentPosition !== undefined ? (
                                    <>
                                      <span className={cn(
                                        "inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold border",
                                        alert.currentPosition <= 100 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100",
                                        shouldStrikethrough(alert) && "line-through decoration-current opacity-50"
                                      )}>
                                        {alert.currentPosition === 101 ? '>100' : alert.currentPosition}
                                      </span>
                                      {(alert.status === 'still-down-top10' || alert.status === 'still-down-top100') && (
                                        <button 
                                          onClick={() => {
                                            setSelectedAlertForHistory(alert);
                                            if (alert.urlTermId) fetchHistory(alert);
                                          }}
                                          className="p-1.5 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all"
                                          title="Ver evolución diaria"
                                        >
                                          <TrendingUp className="w-4 h-4" />
                                        </button>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-zinc-300 text-sm">—</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                {alert.volumen ? (
                                  <span className="inline-flex items-center justify-center px-2 py-1 rounded-md text-xs font-bold bg-zinc-900 text-white shadow-sm">
                                    {alert.volumen}
                                  </span>
                                ) : (
                                  <span className="text-zinc-300 text-sm">—</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={() => removeAlert(alert.id)}
                                  className="p-1.5 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {alerts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                  <p className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-1">Total</p>
                  <p className="text-3xl font-bold text-zinc-900">{alerts.length}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm">
                  <p className="text-xs uppercase tracking-widest font-bold text-emerald-600 mb-1">Rec. Top 10</p>
                  <p className="text-3xl font-bold text-emerald-700">{alerts.filter(a => a.status === 'recovered-top10').length}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm">
                  <p className="text-xs uppercase tracking-widest font-bold text-emerald-600 mb-1">Rec. Top 100</p>
                  <p className="text-3xl font-bold text-emerald-700">{alerts.filter(a => a.status === 'recovered-top100').length}</p>
                </div>
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 shadow-sm">
                  <p className="text-xs uppercase tracking-widest font-bold text-rose-600 mb-1">Fuera Top 10</p>
                  <p className="text-3xl font-bold text-rose-700">{alerts.filter(a => a.status === 'still-down-top10').length}</p>
                </div>
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 shadow-sm">
                  <p className="text-xs uppercase tracking-widest font-bold text-rose-600 mb-1">Fuera Top 100</p>
                  <p className="text-3xl font-bold text-rose-700">{alerts.filter(a => a.status === 'still-down-top100').length}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {selectedAlertForHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAlertForHistory(null)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-[32px] shadow-2xl border border-zinc-200 flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                    <BarChart3 className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-zinc-900 tracking-tight">{selectedAlertForHistory.keyword}</h3>
                    <div className="flex flex-col gap-1 mt-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">Dominio</span>
                        <p className="text-[11px] text-zinc-500 font-bold truncate max-w-[300px] sm:max-w-[400px]">{selectedAlertForHistory.domain}</p>
                      </div>
                      {selectedAlertForHistory.combinacion && (
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">Localización</span>
                          <p className="text-[11px] text-emerald-600 font-bold truncate max-w-[300px] sm:max-w-[400px]">{selectedAlertForHistory.combinacion}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedAlertForHistory(null)}
                  className="p-1.5 hover:bg-white rounded-2xl transition-colors text-zinc-400 hover:text-rose-500 border border-transparent hover:border-zinc-200"
                >
                  <XCircle className="w-7 h-7" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-4">
                    <div className="bg-zinc-50 px-4 py-2 rounded-[20px] border border-zinc-100 shadow-sm">
                      <p className="text-[9px] uppercase tracking-widest font-black text-zinc-400 mb-1">Ranking Alerta</p>
                      <div className="flex items-baseline gap-1">
                        <p className="text-2xl font-black text-zinc-900">{selectedAlertForHistory.alertPosition}</p>
                        <span className="text-[9px] text-zinc-400 font-bold">POS</span>
                      </div>
                    </div>
                    <div className="bg-emerald-50 px-4 py-2 rounded-[20px] border border-emerald-100 shadow-sm">
                      <p className="text-[9px] uppercase tracking-widest font-black text-emerald-600 mb-1">Ranking Actual</p>
                      <div className="flex items-baseline gap-1">
                        <p className="text-2xl font-black text-emerald-700">
                          {selectedAlertForHistory.currentPosition === 101 ? '>100' : (selectedAlertForHistory.currentPosition || '—')}
                        </p>
                        <span className="text-[9px] text-emerald-600 font-bold">POS</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200">
                      {[
                        { label: '7D', value: 7 },
                        { label: '30D', value: 30 },
                        { label: '90D', value: 90 }
                      ].map((r) => (
                        <button
                          key={r.label}
                          onClick={() => fetchHistory(selectedAlertForHistory, r.value)}
                          className="px-4 py-1.5 text-[10px] font-black rounded-lg transition-all hover:bg-white hover:shadow-sm text-zinc-500 hover:text-emerald-600"
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                    
                    {isLoadingHistory ? (
                      <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                        <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sincronizando Historial...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-full border border-zinc-100">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Datos Reales de PRT</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-zinc-50/50 rounded-[24px] p-4 border border-zinc-100">
                  <HistoryChart alert={selectedAlertForHistory} />
                </div>
                
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="group p-3 bg-white rounded-[20px] border border-zinc-100 shadow-sm hover:border-emerald-200 transition-all">
                    <p className="text-[9px] uppercase tracking-widest font-black text-zinc-400 mb-0.5 group-hover:text-emerald-600 transition-colors">Día</p>
                    <p className="text-base font-black text-zinc-900">{selectedAlertForHistory.day || '—'}</p>
                  </div>
                  <div className="group p-3 bg-white rounded-[20px] border border-zinc-100 shadow-sm hover:border-emerald-200 transition-all">
                    <p className="text-[9px] uppercase tracking-widest font-black text-zinc-400 mb-0.5 group-hover:text-emerald-600 transition-colors">Semana</p>
                    <p className="text-base font-black text-zinc-900">{selectedAlertForHistory.week || '—'}</p>
                  </div>
                  <div className="group p-3 bg-white rounded-[20px] border border-zinc-100 shadow-sm hover:border-emerald-200 transition-all">
                    <p className="text-[9px] uppercase tracking-widest font-black text-zinc-400 mb-0.5 group-hover:text-emerald-600 transition-colors">Mes</p>
                    <p className="text-base font-black text-zinc-900">{selectedAlertForHistory.month || '—'}</p>
                  </div>
                </div>

                {selectedAlertForHistory.url && (
                  <div className="mt-4 p-4 bg-zinc-900 rounded-[20px] border border-zinc-800 shadow-xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[9px] uppercase tracking-widest font-black text-zinc-500">URL Actual Indexada</p>
                      <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
                    </div>
                    <a 
                      href={selectedAlertForHistory.url.startsWith('http') ? selectedAlertForHistory.url : `https://${selectedAlertForHistory.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] text-emerald-400 hover:text-emerald-300 break-all font-bold transition-colors"
                    >
                      {selectedAlertForHistory.url}
                    </a>

                    <div className="mt-3 pt-3 border-t border-zinc-800">
                      <button 
                        onClick={() => setShowUrlKeywords(!showUrlKeywords)}
                        className="flex items-center justify-between w-full group"
                      >
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] uppercase tracking-widest font-black text-zinc-500 group-hover:text-emerald-400 transition-colors">Otras KWs</p>
                          {isLoadingUrlKeywords && <Loader2 className="w-3 h-3 text-emerald-500 animate-spin" />}
                          {!isLoadingUrlKeywords && urlKeywords.filter(kw => normalizeString(kw.keyword) !== normalizeString(selectedAlertForHistory.keyword)).length > 0 && (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-full font-bold">
                              {urlKeywords.filter(kw => normalizeString(kw.keyword) !== normalizeString(selectedAlertForHistory.keyword)).length}
                            </span>
                          )}
                        </div>
                        {!isLoadingUrlKeywords && (
                          showUrlKeywords ? <ChevronDown className="w-3 h-3 text-zinc-500" /> : <ChevronRight className="w-3 h-3 text-zinc-500" />
                        )}
                      </button>

                      <AnimatePresence>
                        {showUrlKeywords && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            {urlKeywords.length > 0 ? (
                              <div className="mt-4 grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {urlKeywords
                                  .filter(kw => normalizeString(kw.keyword) !== normalizeString(selectedAlertForHistory.keyword))
                                  .map((kw, idx) => (
                                    <div 
                                      key={idx} 
                                      className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-colors"
                                    >
                                      <div className="flex flex-col min-w-0 pr-4">
                                        <span className="text-[11px] text-zinc-300 font-medium truncate">{kw.keyword}</span>
                                        {kw.combinacion && (
                                          <span className="text-[9px] text-zinc-500 truncate font-bold">{kw.combinacion}</span>
                                        )}
                                      </div>
                                      <span className={cn(
                                        "text-[10px] font-black shrink-0 px-2 py-0.5 rounded-md",
                                        typeof kw.rank === 'number' && kw.rank <= 10 
                                          ? "bg-emerald-500/20 text-emerald-400" 
                                          : "bg-zinc-700 text-zinc-400"
                                      )}>
                                        {kw.rank === 101 ? '>100' : kw.rank}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            ) : !isLoadingUrlKeywords ? (
                              <p className="mt-4 text-[10px] text-zinc-600 italic">No se han encontrado otras keywords posicionando en esta URL.</p>
                            ) : null}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
