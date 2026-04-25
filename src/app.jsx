import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Calendar, AlertTriangle, CheckCircle, BarChart2, Table, 
  Trash2, Plus, X, Search, Edit2, LogOut, Menu, Copy, MessageCircle, Settings, 
  Phone, Lock, UserPlus, ExternalLink, Paperclip, FileText, Image as ImageIcon, 
  History, Eye, Save, XCircle, CheckSquare, List, MapPin, PlayCircle, Clock, Activity,
  Briefcase, ChevronRight, Globe, MapIcon, Filter, TrendingUp, UserCheck, CalendarPlus,
  Zap, Users, Target, Info, HelpCircle, Key, FileCheck, Timer, FolderOpen, AlertOctagon, Cloud,
  ShieldCheck, Loader, RotateCcw, LayoutList, Palmtree, ArrowUpDown, UserX, QrCode, Wifi, WifiOff, RefreshCw, Navigation, Layers, ChevronDown,
  Columns, Wrench, BarChart, Factory, Mail, Home, PenTool, Ruler, ShoppingCart, CheckSquare as CheckboxIcon,
  DollarSign, Wallet, Package, Receipt, Banknote, PlusCircle, MinusCircle, ArrowDownRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, getDoc, setDoc, query, where, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAWQ46JCuYTKZz0IKyp_cwkIla9vii1Fpc",
  authDomain: "planificacion-posventa.firebaseapp.com",
  projectId: "planificacion-posventa",
  storageBucket: "planificacion-posventa.firebasestorage.app",
  messagingSenderId: "14075191030",
  appId: "1:14075191030:web:774d301d0f22fc760dd6d7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

try { enableIndexedDbPersistence(db).catch((err) => {}); } catch (e) {}

const TIPOS_TRABAJO = [
  "Obra Nueva", "Mantenimiento / Refacción", "Rediseño / Modernización", 
  "Inspección Técnica", "Paisajismo / Exteriores", "Demolición y Despeje", 
  "Dirección de Obra", "Vacaciones", "Otro"
];

const COLORS_TRABAJO = {
  "Obra Nueva": "#3b3026", "Mantenimiento / Refacción": "#ea580c", "Rediseño / Modernización": "#8a7c6e", 
  "Inspección Técnica": "#10b981", "Paisajismo / Exteriores": "#84cc16", "Demolición y Despeje": "#ef4444", 
  "Dirección de Obra": "#0ea5e9", "Vacaciones": "#38bdf8", "Otro": "#a3978a"
};

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    }
    return dateStr;
};

const extractCoordinates = (str) => {
    if (!str) return null;
    const atMatch = str.match(/@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/);
    if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
    const commaMatch = str.match(/(-?\d{1,3}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/);
    if (commaMatch) return { lat: parseFloat(commaMatch[1]), lng: parseFloat(commaMatch[2]) };
    return null;
};

const useOnlineStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
    }, []);
    return isOnline;
};

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
    
    body { 
        font-family: 'Outfit', sans-serif; 
        background-color: #F5F1E7; 
        background-image: linear-gradient(rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.35)), url('https://i.imgur.com/u0RhD5S.png');
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
        color: #4a4036; 
        letter-spacing: 0.01em;
        margin: 0;
        padding: 0;
    }

    .rounded-xl, .rounded-2xl, .rounded-3xl, .rounded-full {
        border-radius: 0.375rem !important; 
    }
    
    /* Estilos Beige y Glassmorphism */
    .bg-white {
        background-color: rgba(255, 255, 255, 0.52) !important;
        backdrop-filter: blur(10px);
        border-color: rgba(226, 216, 204, 0.7) !important;
    }
    .bg-stone-50 {
        background-color: rgba(248, 245, 238, 0.85) !important;
    }
    .bg-stone-100 {
        background-color: rgba(240, 235, 225, 0.85) !important;
        backdrop-filter: blur(5px);
    }
    .bg-stone-800 {
        background-color: #6B5B4E !important; 
    }
    .bg-stone-900 {
        background-color: #4A4036 !important; 
    }
    .text-stone-800, .text-stone-700 { color: #3B3026 !important; font-weight: 600; }
    .text-stone-600 { color: #5C5044 !important; }
    .text-stone-500, .text-stone-400 { color: #8A7C6E !important; }
    .border-stone-200 { border-color: rgba(223, 213, 197, 0.8) !important; }
    .border-stone-300 { border-color: #D0C4B2 !important; }

    .shadow-sm, .shadow-md, .shadow-lg, .shadow-2xl {
        box-shadow: 0 4px 15px -3px rgba(92, 80, 68, 0.1), 0 2px 6px -2px rgba(92, 80, 68, 0.05) !important;
    }

    .input-field, 
    input[type="text"], input[type="password"], input[type="email"], 
    input[type="date"], input[type="time"], input[type="number"], 
    select, textarea {
        background-color: rgba(255, 255, 255, 0.9) !important;
        color: #3B3026 !important; 
        border: 1px solid #D0C4B2 !important;
        border-radius: 0.25rem !important; 
        padding: 0.6rem 0.85rem !important;
        font-size: 0.85rem !important;
        font-weight: 500 !important;
        outline: none !important;
        box-shadow: none !important;
        width: 100% !important;
        transition: border-color 0.2s ease;
    }
    .input-field:focus, input:focus, select:focus, textarea:focus {
        border-color: #B39B82 !important; 
    }
    .input-field::placeholder, input::placeholder, textarea::placeholder {
        color: #A3978A !important;
        font-weight: 400 !important;
    }

    .kanban-card { 
        background-color: rgba(255, 255, 255, 0.95) !important;
        border: 1px solid #DFD5C5 !important;
        border-radius: 0.375rem !important;
        color: #3B3026 !important;
        transition: transform 0.2s, box-shadow 0.2s; 
        cursor: grab; 
    }
    .kanban-card:active { 
        transform: scale(1.01); 
        box-shadow: 0 4px 6px -1px rgba(92, 80, 68, 0.1); 
    }
    
    .kanban-column {
        border-radius: 0.375rem !important;
        background-color: rgba(245, 240, 230, 0.6) !important;
        border: 1px solid #DFD5C5 !important;
        backdrop-filter: blur(6px);
    }

    .btn-bubble-container {
        display: flex;
        background-color: rgba(240, 235, 225, 0.7);
        border: 1px solid #DFD5C5;
        border-radius: 0.375rem;
        padding: 0.35rem;
        margin: 0 auto 1.5rem auto;
        width: fit-content;
        backdrop-filter: blur(4px);
    }
    .btn-bubble {
        padding: 0.5rem 1.5rem;
        border-radius: 0.25rem;
        font-size: 0.85rem;
        font-weight: 700;
        transition: all 0.3s ease;
        text-transform: uppercase;
        border: none;
        cursor: pointer;
    }
    .btn-bubble-inactive {
        background-color: transparent !important;
        color: #8A7C6E !important;
    }
    .btn-bubble-active {
        background-color: #6B5B4E !important; 
        color: #ffffff !important;
        box-shadow: 0 1px 3px rgba(92, 80, 68, 0.2) !important;
    }

    .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #D0C4B2; border-radius: 0px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #B39B82; }
    
    .leaflet-container { font-family: 'Outfit', sans-serif; z-index: 0; }
    .animate-in { animation: fadeIn 0.3s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  `}</style>
);

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizeClasses = size === 'lg' ? 'max-w-4xl' : size === 'sm' ? 'max-w-sm' : 'max-w-md';
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm transition-all">
      <div className={`bg-white rounded-md shadow-lg w-full ${sizeClasses} overflow-hidden animate-in flex flex-col max-h-[90vh] border border-stone-200`}>
        <div className="px-6 py-4 border-b border-stone-200 flex justify-between items-center bg-stone-50 shrink-0">
          <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wide">{title}</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-sm text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar bg-white">{children}</div>
      </div>
    </div>
  );
};

const FileUploader = ({ files, setFiles, label, required = false }) => {
  const fileInputRef = useRef(null);
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => setFiles(prev => [...prev, { name: file.name, type: file.type, url: e.target.result }]);
        reader.readAsDataURL(file);
    });
  };
  const removeFile = (index) => setFiles(files.filter((_, i) => i !== index));
  return (
    <div className="mb-4 p-4 border border-dashed border-stone-300 rounded-md bg-stone-50/50 hover:bg-stone-50 transition-colors">
      <div className="flex justify-between items-center mb-3">
        <label className="text-xs font-bold text-stone-700 uppercase">{label} {required && <span className="text-red-500">*</span>}</label>
        <button type="button" onClick={() => fileInputRef.current.click()} className="text-xs flex items-center bg-white border border-stone-200 text-stone-700 hover:text-amber-700 px-3 py-1.5 rounded-sm shadow-sm font-bold"><Paperclip className="w-3.5 h-3.5 mr-1.5"/> Adjuntar</button>
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
      </div>
      {files.length > 0 ? (
        <div className="space-y-2">
          {files.map((f, idx) => (
            <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-sm border border-stone-200 shadow-sm text-xs group">
              <div className="flex items-center truncate">
                {f.type.includes('image') ? <ImageIcon className="w-4 h-4 mr-2 text-amber-600"/> : <FileText className="w-4 h-4 mr-2 text-stone-500"/>}
                <a href={f.url} target="_blank" rel="noopener noreferrer" className="hover:text-amber-700 truncate max-w-[200px] font-medium text-stone-700">{f.name}</a>
              </div>
              <button type="button" onClick={() => removeFile(idx)} className="text-stone-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>
            </div>
          ))}
        </div>
      ) : <div className="text-xs text-stone-400 text-center py-2">Sin archivos adjuntos</div>}
    </div>
  );
};

const TechReportViewer = ({ service, expenses = [] }) => { 
  const [activeTab, setActiveTab] = useState('logs');
  const logs = service.progressLogs || [];
  const hours = service.dailyLogs || [];
  const closure = service.closureData;

  const handleDeleteLog = async (logToRemove) => {
      if(!window.confirm('¿Seguro que deseas eliminar este registro de la bitácora?')) return;
      const newLogs = logs.filter(l => l !== logToRemove);
      try {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'obras', service.id), { progressLogs: newLogs });
      } catch (error) {
          console.error("Error al eliminar log", error);
      }
  };

  const handleDeleteHour = async (hourToRemove) => {
      if(!window.confirm('¿Seguro que deseas eliminar este parte diario?')) return;
      const newHours = hours.filter(h => h !== hourToRemove);
      try {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'obras', service.id), { dailyLogs: newHours });
      } catch (error) {
          console.error("Error al eliminar horas", error);
      }
  };

  return (
    <div className="mt-6 border-t border-stone-200 pt-6">
      <h4 className="text-xs font-bold text-stone-800 mb-4 flex items-center uppercase tracking-wide"><FolderOpen className="w-4 h-4 mr-2 text-amber-700"/> Bitácora y Registros</h4>
      <div className="flex space-x-1 bg-stone-100 p-1 rounded-sm mb-4 border border-stone-200 overflow-x-auto">
        {['logs', 'hours', 'expenses', 'closure'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 min-w-[100px] py-1.5 text-xs font-bold rounded-sm transition-all ${activeTab === tab ? 'bg-white text-amber-700 shadow-sm border border-stone-200' : 'text-stone-500 hover:text-stone-700'}`}>
              {tab === 'logs' ? 'Avances' : tab === 'hours' ? 'Horas Hombre' : tab === 'expenses' ? 'Gastos Obra' : 'Cierre'}
          </button>
        ))}
      </div>
      <div className="bg-stone-50 rounded-sm border border-stone-200 p-4 min-h-[150px]">
        {activeTab === 'logs' && (
          <div className="space-y-3">
            {logs.length === 0 ? <p className="text-xs text-stone-400 italic text-center">Sin avances registrados.</p> : 
              logs.sort((a,b) => new Date(b.date) - new Date(a.date)).map((log, idx) => (
                <div key={idx} className="bg-white p-3 rounded-sm border border-stone-200 shadow-sm relative group">
                  <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-stone-800">{log.date && log.date.includes(',') ? `${formatDate(log.date.split(',')[0])} ${log.date.split(',')[1]}` : log.date}</span>
                      <button onClick={() => handleDeleteLog(log)} className="text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                  <p className="text-xs text-stone-600 mb-2">{log.comment}</p>
                  <div className="flex gap-2 flex-wrap">{log.files && log.files.map((f, i) => (<a key={i} href={f.url} target="_blank" className="flex items-center px-2 py-1 bg-stone-50 text-stone-700 text-[10px] rounded-sm border border-stone-200 hover:bg-stone-100 font-medium"><Paperclip className="w-3 h-3 mr-1"/> {f.name}</a>))}</div>
                </div>
              ))
            }
          </div>
        )}
        {activeTab === 'hours' && (
          <div>
            <table className="w-full text-xs text-left">
                <thead><tr className="text-stone-500 border-b border-stone-300"><th className="pb-2">Fecha</th><th className="pb-2">Cuadrilla</th><th className="pb-2">Tipo</th><th className="pb-2">Horario</th><th className="pb-2 text-right">Hs Total</th><th className="pb-2"></th></tr></thead>
                <tbody>
                    {hours.length===0?<tr><td colSpan="6" className="text-center py-4 text-stone-400 italic">Sin horas cargadas.</td></tr>:hours.map((h,i)=>{const start=new Date(`2000-01-01T${h.start}`);const end=new Date(`2000-01-01T${h.end}`);let duration=(end-start)/(1000*60*60);if(duration<0)duration+=24;const workerList=h.workers||[];const techCount=workerList.length>0?workerList.length:1;const totalManHours=duration*techCount;const workerDisplay=(workerList.length>0)?workerList.join(', '):'Equipo Completo';return(<tr key={i} className="border-b border-stone-200 last:border-0 group"><td className="py-2 font-medium text-stone-800">{formatDate(h.date)}</td><td className="py-2 text-stone-600 max-w-[100px] truncate" title={workerDisplay}>{workerDisplay}</td><td className="py-2"><span className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold border ${h.type==='Viaje'?'bg-stone-100 text-stone-700 border-stone-200':'bg-amber-50 text-amber-800 border-amber-200'}`}>{h.type||'Trabajo'}</span></td><td className="py-2 text-stone-600">{h.start} - {h.end}</td><td className="py-2 font-bold text-stone-800 text-right">{totalManHours.toFixed(1)}{techCount>1&&<span className="text-[10px] text-stone-400 font-normal ml-1 block">({duration.toFixed(1)}h x {techCount})</span>}</td><td className="py-2 text-right opacity-0 group-hover:opacity-100"><button onClick={() => handleDeleteHour(h)} className="text-stone-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5"/></button></td></tr>)})}
                </tbody>
            </table>
          </div>
        )}
        {activeTab === 'expenses' && (
          <div>
              <table className="w-full text-xs text-left">
                  <thead>
                      <tr className="text-stone-500 border-b border-stone-300">
                          <th className="pb-2">Fecha</th>
                          <th className="pb-2">Reportado por</th>
                          <th className="pb-2">Concepto</th>
                          <th className="pb-2 text-right">Monto Gasto</th>
                      </tr>
                  </thead>
                  <tbody>
                      {expenses.length === 0 ? <tr><td colSpan="4" className="text-center py-4 text-stone-400 italic">Sin gastos registrados para esta obra.</td></tr> : expenses.sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)).map((g, i) => (
                          <tr key={i} className="border-b border-stone-200 last:border-0 group">
                              <td className="py-2 font-medium text-stone-800">{formatDate(g.fecha)}</td>
                              <td className="py-2 text-stone-600 font-bold">{g.cuadrilla}</td>
                              <td className="py-2 text-stone-600 truncate max-w-[200px]" title={g.concepto}>{g.concepto}</td>
                              <td className={`py-2 font-bold text-right text-red-600`}>
                                  -{Number(g.monto).toLocaleString()}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
        )}
        {activeTab === 'closure' && (
          <div>
            {!closure ? <p className="text-xs text-stone-400 italic text-center">Obra no finalizada aún.</p> : (
              <div className="space-y-3">
                 <div className={`p-2 rounded-sm text-xs font-bold text-center border ${closure.status === 'Finalizado' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>ESTADO FINAL: {closure.status.toUpperCase()}</div>
                 {closure.reason && <p className="text-xs text-red-700 font-medium">Motivo: {closure.reasonType} - {closure.reason}</p>}
                 <div><span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">Observación Final:</span><p className="text-xs text-stone-800 bg-white p-2 rounded-sm border border-stone-200">{closure.observation}</p></div>
                 <div><span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">Acta y Archivos Finales:</span><div className="flex gap-2 flex-wrap">{closure.files && closure.files.map((f, i) => (<a key={i} href={f.url} target="_blank" className="flex items-center px-2 py-1 bg-white text-stone-700 font-medium text-[10px] rounded-sm border border-stone-200 hover:bg-stone-50"><FileCheck className="w-3 h-3 mr-1"/> {f.name}</a>))}</div></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const MapDashboard = ({ obras }) => {
    const mapContainerRef = useRef(null);

    useEffect(() => {
        let isMounted = true;
        let map = null;
        let mapInitInterval;

        const initMap = async () => {
            if (!mapContainerRef.current) return;
            if (mapContainerRef.current._leaflet_id) mapContainerRef.current._leaflet_id = null;
            mapContainerRef.current.innerHTML = '';

            try {
                map = window.L.map(mapContainerRef.current).setView([-32.4075, -63.2402], 13); 
                window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap &copy; CARTO' }).addTo(map);
                setTimeout(() => { if (map && isMounted) map.invalidateSize(); }, 300);

                const getCustomIcon = (tipo) => {
                    let svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
                    let bgColor = 'bg-stone-800';
                    
                    if (tipo === 'Obra Nueva') {
                        svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
                        bgColor = 'bg-stone-900';
                    } else if (tipo.includes('Mantenimiento') || tipo.includes('Inspección')) {
                        svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;
                        bgColor = 'bg-amber-700';
                    } else if (tipo.includes('Rediseño') || tipo.includes('Paisajismo')) {
                        svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/></svg>`;
                        bgColor = 'bg-emerald-700';
                    } else if (tipo.includes('Demolición')) {
                        svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
                        bgColor = 'bg-red-700';
                    }

                    return window.L.divIcon({
                        html: `<div class="flex items-center justify-center w-8 h-8 rounded-sm shadow-md text-white ${bgColor}" style="border: 2px solid white;">${svgStr}</div>`,
                        className: 'custom-leaflet-icon',
                        iconSize: [32, 32],
                        iconAnchor: [16, 32],
                        popupAnchor: [0, -32]
                    });
                };

                const uniqueMarkers = [];
                const locationKeys = new Set();
                const addressKeys = new Set();

                const addMarkerIfUnique = (lat, lng, popupContent, icon) => {
                    if (!lat || !lng) return;
                    const key = `${parseFloat(lat).toFixed(3)},${parseFloat(lng).toFixed(3)}`;
                    if (!locationKeys.has(key)) { locationKeys.add(key); uniqueMarkers.push({ lat, lng, popupContent, icon }); }
                };

                const finishedServices = obras.filter(s => s.estado === 'Finalizado' && s.ubicacion);
                
                for (const s of finishedServices) {
                    if (!isMounted) break;
                    const addrKey = s.ubicacion.trim().toLowerCase();
                    if (addressKeys.has(addrKey)) continue; 
                    addressKeys.add(addrKey);

                    let coords = extractCoordinates(s.ubicacion);
                    if (!coords && s.ubicacion.trim().length > 3 && !s.ubicacion.includes('goo.gl') && !s.ubicacion.includes('http')) {
                        try {
                            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(s.ubicacion)}&limit=1`);
                            const data = await res.json();
                            if (data && data.length > 0) coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
                        } catch (e) { console.error("Geocoding error", e); }
                    }
                    if (coords && isMounted) {
                        const icon = getCustomIcon(s.tipoTrabajo);
                        addMarkerIfUnique(coords.lat, coords.lng, `<div style="font-family:'Outfit',sans-serif;"><b style="font-size:14px; color:#3b3026;">${s.cliente}</b><br><span style="font-size:11px; font-weight:600; color:#8a7c6e;">${s.tipoTrabajo}<br>ID: ${s.idProyecto}</span></div>`, icon);
                    }
                }

                uniqueMarkers.forEach(loc => {
                    if (isMounted) window.L.marker([loc.lat, loc.lng], { icon: loc.icon }).addTo(map).bindPopup(loc.popupContent);
                });
            } catch (e) { console.error("Error initializing map: ", e); }
        };

        mapInitInterval = setInterval(() => {
            if (window.L && mapContainerRef.current) { clearInterval(mapInitInterval); initMap(); }
        }, 500);

        return () => { isMounted = false; clearInterval(mapInitInterval); if (map) map.remove(); };
    }, [obras]);

    return (
        <div className="w-full bg-white p-2 rounded-md shadow-sm border border-stone-200">
            <div ref={mapContainerRef} style={{ height: '65vh', minHeight: '500px', width: '100%' }} className="rounded-sm z-0 relative overflow-hidden" />
        </div>
    );
};

const KanbanBoard = ({ obras, comprasMateriales, onStatusChange, onCompraStatusChange, handleEditObra, handleEditCompra }) => {
    const [boardType, setBoardType] = useState('obras');

    const obrasColumns = [
        { id: 'Proyectado', label: 'Proyectado / Agendado', color: 'bg-stone-100 border-stone-300 text-stone-800' },
        { id: 'En Ejecución', label: 'En Ejecución', color: 'bg-amber-50 border-amber-200 text-amber-800' },
        { id: 'Pausado', label: 'Pausado / Postergado', color: 'bg-red-50 border-red-200 text-red-800' },
        { id: 'Finalizado', label: 'Finalizado', color: 'bg-green-50 border-green-200 text-green-800' }
    ];

    const comprasColumns = [
        { id: 'Pendiente', label: 'Pendiente', color: 'bg-stone-100 border-stone-300 text-stone-800' },
        { id: 'En Proceso', label: 'Cotizando / En Proceso', color: 'bg-blue-50 border-blue-200 text-blue-800' },
        { id: 'Comprado', label: 'Comprado / Entregado', color: 'bg-green-50 border-green-200 text-green-800' }
    ];

    const columns = boardType === 'obras' ? obrasColumns : comprasColumns;

    const handleDragStart = (e, id, type) => { e.dataTransfer.setData("itemId", id); e.dataTransfer.setData("itemType", type); };
    const handleDragOver = (e) => e.preventDefault();
    const handleDrop = (e, targetStatus) => {
        const itemId = e.dataTransfer.getData("itemId");
        const itemType = e.dataTransfer.getData("itemType");
        if (itemId && itemType === boardType) {
            if (itemType === 'obras') onStatusChange(itemId, targetStatus);
            else if (itemType === 'materiales') onCompraStatusChange(itemId, targetStatus);
        }
    };

    const getItemsByStatus = (status) => {
        if (boardType === 'obras') {
            return obras.filter(s => {
                if (status === 'Pausado') return s.estado === 'Pausado' || s.postergado;
                if (status === 'Proyectado') return (s.estado === 'Proyectado' || s.estado === 'Agendado') && !s.postergado;
                return s.estado === status && !s.postergado;
            }).sort((a,b) => new Date(a.fInicio) - new Date(b.fInicio));
        } else {
            return comprasMateriales.filter(m => m.estado === status).sort((a,b) => new Date(a.fechaLimite) - new Date(b.fechaLimite));
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-200px)]">
            <div className="flex bg-white p-1 rounded-md mb-4 w-fit shadow-sm border border-stone-200">
                <button onClick={() => setBoardType('obras')} className={`px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all flex items-center ${boardType === 'obras' ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'}`}><Home className="w-4 h-4 mr-2"/> Obras y Proyectos</button>
                <button onClick={() => setBoardType('materiales')} className={`px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all flex items-center ${boardType === 'materiales' ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'}`}><ShoppingCart className="w-4 h-4 mr-2"/> Compra de Materiales</button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 flex-1 overflow-x-auto pb-4">
                {columns.map(col => {
                    const items = getItemsByStatus(col.id);
                    return (
                        <div key={col.id} className={`kanban-column flex-1 min-w-[280px] rounded-md border flex flex-col`} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.id)}>
                            <div className={`p-3 rounded-t-md font-bold border-b text-xs uppercase tracking-wide flex justify-between items-center ${col.color}`}><span>{col.label}</span><span className="bg-white/80 px-2 py-0.5 rounded-sm text-[10px]">{items.length}</span></div>
                            <div className="p-2 overflow-y-auto flex-1 custom-scrollbar space-y-2">
                                {items.map(item => (
                                    <div key={item.id} draggable onDragStart={(e) => handleDragStart(e, item.id, boardType)} onClick={() => boardType === 'obras' ? handleEditObra(item) : handleEditCompra(item)} className="kanban-card bg-white p-3 rounded-sm shadow-sm border border-stone-200 group hover:border-stone-400">
                                        {boardType === 'obras' ? (
                                            <>
                                                <div className="flex justify-between items-start mb-1"><span className="text-[10px] font-bold bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-sm font-mono border border-stone-200">{item.idProyecto}</span></div>
                                                <h4 className="font-bold text-stone-800 text-sm leading-tight mb-1">{item.cliente}</h4>
                                                <p className="text-[11px] font-semibold text-stone-500 truncate mb-2">{item.tipoTrabajo === 'Otro' && item.tipoTrabajoOtro ? `Otro: ${item.tipoTrabajoOtro}` : item.tipoTrabajo}</p>
                                                <div className="flex items-center gap-2 text-[10px] text-stone-600 bg-stone-50 p-1.5 rounded-sm border border-stone-100"><Calendar className="w-3 h-3 text-stone-400"/><span>{formatDate(item.fInicio)}</span><span className="text-stone-300">|</span><Users className="w-3 h-3 text-stone-400"/><span>{item.cuadrillas?.length || 0}</span></div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-start mb-1"><span className="text-[10px] font-bold bg-stone-800 text-white px-1.5 py-0.5 rounded-sm uppercase tracking-wider">{item.categoria}</span></div>
                                                <h4 className="font-bold text-stone-800 text-sm leading-tight mb-1">{item.material}</h4>
                                                <p className="text-[11px] text-stone-500 truncate mb-2">{item.observaciones || 'Sin detalles'}</p>
                                                <div className="flex items-center flex-wrap gap-2 text-[10px] font-medium text-stone-600 bg-stone-50 p-1.5 rounded-sm border border-stone-100">
                                                    <div className="flex items-center"><Clock className="w-3 h-3 mr-1 text-stone-400"/><span>Límite: {formatDate(item.fechaLimite)}</span></div>
                                                    <span className="text-stone-300">|</span>
                                                    <div className="flex items-center text-amber-700"><UserCheck className="w-3 h-3 mr-1"/><span className="font-bold truncate max-w-[100px]" title={item.liderAsignado}>{item.liderAsignado}</span></div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const GanttChart = ({ obras, comprasMateriales = [], mode = 'operations', handleEdit, isAdmin }) => {
    const [selectedGanttItem, setSelectedGanttItem] = useState(null);
    
    const visibleItems = useMemo(() => {
        let base = obras || []; 
        if (mode === 'operations') { return base.filter(s => s.estado !== 'Finalizado' && s.tipoTrabajo !== 'Vacaciones'); } 
        else if (mode === 'vacations') { return base.filter(s => s.estado !== 'Finalizado' && s.tipoTrabajo === 'Vacaciones'); }
        else if (mode === 'compras') {
            return (comprasMateriales||[]).filter(m => m.estado !== 'Comprado').map(m => ({
                ...m, fInicio: m.fechaLimite, fFin: m.fechaLimite, cliente: m.material, tipoTrabajo: m.categoria, estado: m.estado,
                idProyecto: 'COMPRA', cuadrillas: [m.liderAsignado], esCompra: true
            }));
        } else if (mode === 'mixed') {
            const activeObras = base.filter(s => s.estado !== 'Finalizado');
            const activeCompras = (comprasMateriales||[]).filter(m => m.estado !== 'Comprado').map(m => ({
                ...m, fInicio: m.fechaLimite, fFin: m.fechaLimite, cliente: m.material, tipoTrabajo: m.categoria, estado: m.estado,
                idProyecto: 'COMPRA', cuadrillas: [m.liderAsignado], esCompra: true
            }));
            return [...activeObras, ...activeCompras];
        }
        return base.filter(s => s.estado !== 'Finalizado');
    }, [obras, comprasMateriales, mode]);

    const today = new Date(); 
    today.setHours(0,0,0,0);

    const minDate = new Date(today); 
    
    const itemDates = visibleItems.flatMap(s => [new Date(s.fFin)]).filter(d => !isNaN(d.getTime()));
    const maxItemDate = itemDates.length > 0 ? new Date(Math.max(...itemDates)) : new Date(today);
    
    const maxDate = new Date(maxItemDate);
    maxDate.setDate(maxDate.getDate() + 15); 

    const DAY_WIDTH = 50; 
    const totalDays = Math.max((maxDate - minDate) / (1000 * 60 * 60 * 24), 30); 
    const chartWidth = totalDays * DAY_WIDTH;

    const sortedVisibleItems = [...visibleItems]
        .filter(s => new Date(s.fFin) >= minDate)
        .sort((a,b) => new Date(a.fInicio) - new Date(b.fInicio));

    if (visibleItems.length === 0) return <div className="p-12 text-center text-stone-500 font-medium bg-white rounded-md border border-dashed border-stone-300">No hay registros pendientes para mostrar en el calendario.</div>;
    
    return (
        <div className="bg-white rounded-md shadow-sm border border-stone-200 p-6 overflow-hidden relative flex flex-col h-[calc(100vh-200px)]">
           {selectedGanttItem && (
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-md shadow-2xl border border-stone-200 z-[100] w-80 animate-in duration-200">
                  <div className="flex justify-between items-start mb-3 pb-2 border-b border-stone-100">
                      <div>
                          <h4 className="font-bold text-stone-800 text-sm uppercase tracking-wide">{selectedGanttItem.tipoTrabajo === 'Otro' && selectedGanttItem.tipoTrabajoOtro ? `Otro: ${selectedGanttItem.tipoTrabajoOtro}` : selectedGanttItem.tipoTrabajo}</h4>
                          <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-sm border border-stone-200">{selectedGanttItem.idProyecto}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setSelectedGanttItem(null); }} className="p-1 hover:bg-stone-100 rounded-sm text-stone-400 hover:text-stone-800 transition-colors"><X className="w-5 h-5"/></button>
                  </div>
                  <div className="text-xs text-stone-700 space-y-2.5 font-medium">
                      {!selectedGanttItem.esCompra && selectedGanttItem.fSolicitud && <div className="flex items-start"><CalendarPlus className="w-4 h-4 mr-2 text-stone-400 shrink-0"/> <span><span className="font-bold">Alta:</span> {formatDate(selectedGanttItem.fSolicitud)}</span></div>}
                      <div className="flex items-start"><Briefcase className="w-4 h-4 mr-2 text-stone-400 shrink-0"/> <span><span className="font-bold">{selectedGanttItem.esCompra ? 'Material:' : 'Obra/Cliente:'}</span> {selectedGanttItem.cliente}</span></div>
                      <div className="flex items-start"><Users className="w-4 h-4 mr-2 text-stone-400 shrink-0"/> <span><span className="font-bold">{selectedGanttItem.esCompra ? 'Responsable:' : 'Cuadrilla:'}</span> {selectedGanttItem.cuadrillas?.join(', ')}</span></div>
                      <div className="flex items-start"><Calendar className="w-4 h-4 mr-2 text-stone-400 shrink-0"/> <span><span className="font-bold">{selectedGanttItem.esCompra ? 'Fecha Límite:' : 'Ejecución:'}</span> {formatDate(selectedGanttItem.fInicio)} {!selectedGanttItem.esCompra && `al ${formatDate(selectedGanttItem.fFin)}`}</span></div>
                      
                      {selectedGanttItem.estado === 'En Ejecución' && <div className="animate-pulse flex items-center text-amber-700 font-bold bg-amber-50 border border-amber-200 p-2 rounded-sm"><Activity className="w-3 h-3 mr-2"/> EN EJECUCIÓN</div>}

                      <div className="flex items-center mt-2">
                          <span className={`px-2 py-1 rounded-sm text-[10px] font-bold border w-full text-center uppercase tracking-wider ${selectedGanttItem.estado==='Finalizado'||selectedGanttItem.estado==='Comprado'?'bg-green-50 border-green-200 text-green-800':selectedGanttItem.estado==='En Ejecución'||selectedGanttItem.estado==='En Proceso'?'bg-amber-50 border-amber-200 text-amber-800':selectedGanttItem.estado==='Pausado'?'bg-red-50 border-red-200 text-red-800':'bg-stone-100 border-stone-300 text-stone-800'}`}>
                              {selectedGanttItem.postergado ? 'PAUSADO' : selectedGanttItem.estado}
                          </span>
                      </div>
                  </div>
              </div>
           )}
           <div className="overflow-auto custom-scrollbar flex-1 relative border rounded-md border-stone-200">
             <div className="relative" style={{ minWidth: `${chartWidth + 200}px`, height: '100%' }}>
               <div className="sticky top-0 left-0 z-20 bg-stone-50 border-b border-stone-200 h-10 flex text-xs font-bold text-stone-600 shadow-sm pl-48 uppercase tracking-wide">
                  {Array.from({ length: Math.ceil(totalDays) }).map((_, i) => {
                    const d = new Date(minDate); d.setDate(d.getDate() + i);
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    const isToday = d.toDateString() === today.toDateString();
                    return (
                        <div key={i} className={`flex-shrink-0 border-l border-stone-200 flex flex-col justify-center items-center ${isWeekend ? 'bg-stone-100' : ''} ${isToday ? 'bg-amber-50 border-amber-200 text-amber-800' : ''}`} style={{ width: `${DAY_WIDTH}px` }}>
                            <span className={`text-[9px] ${isToday ? 'text-amber-600' : 'text-stone-400'}`}>{d.toLocaleString('es-ES', { weekday: 'short' })}</span><span>{d.getDate()}/{d.getMonth()+1}</span>
                        </div>
                    );
                  })}
               </div>
               <div className="pt-2">
                   {sortedVisibleItems.map((srv, idx) => {
                     const start = new Date(srv.fInicio);
                     const end = new Date(srv.fFin);
                     
                     const effectiveStart = start < minDate ? minDate : start;
                     
                     let offsetDays = (effectiveStart - minDate) / (1000 * 60 * 60 * 24);
                     const duration = (end - effectiveStart) / (1000 * 60 * 60 * 24) + 1;
                     
                     const leftPos = offsetDays * DAY_WIDTH;
                     const width = Math.max(duration * DAY_WIDTH, DAY_WIDTH); 
                     
                     let colorClass = 'bg-stone-800 text-white';
                     if (srv.esCompra) {
                         colorClass = srv.estado === 'Comprado' ? 'bg-green-700 text-white' : srv.estado === 'En Proceso' ? 'bg-blue-700 text-white' : 'bg-stone-400 text-white';
                     } else {
                         colorClass = srv.tipoTrabajo === 'Vacaciones' ? 'bg-sky-600 text-white' : srv.estado === 'Finalizado' ? 'bg-green-700 text-white' : srv.estado === 'Pausado' ? 'bg-red-700 text-white' : srv.estado === 'En Ejecución' ? 'bg-amber-600 text-white' : srv.postergado ? 'bg-red-700 text-white' : 'bg-stone-800 text-white';
                     }

                     return (
                       <div key={srv.id} className="flex items-center group hover:bg-stone-50 transition-colors h-12 border-b border-stone-100">
                         <div className="sticky left-0 z-10 w-48 pl-4 pr-4 bg-white border-r border-stone-200 h-full flex items-center justify-end shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                             <span className="text-[11px] font-bold text-stone-700 truncate text-right w-full uppercase tracking-wide" title={srv.cliente}>{srv.tipoTrabajo === 'Vacaciones' ? (srv.cuadrillas?.[0] || 'N/A') : srv.cliente}</span>
                         </div>
                         <div className="relative h-full flex-1">
                             <div onClick={() => setSelectedGanttItem(srv)} className={`absolute h-7 top-2.5 rounded-sm shadow-sm flex items-center px-3 text-[10px] font-bold cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md ${colorClass} overflow-hidden whitespace-nowrap uppercase tracking-wider`} style={{ left: `${leftPos}px`, width: `${width - 2}px` }}>
                                 <span className="truncate">
                                     {srv.tipoTrabajo === 'Vacaciones' ? srv.tipoTrabajo : srv.esCompra ? `📦 ${srv.cliente}` : `[${srv.idProyecto}] ${srv.tipoTrabajo === 'Otro' && srv.tipoTrabajoOtro ? srv.tipoTrabajoOtro : srv.tipoTrabajo}`}
                                 </span>
                             </div>
                         </div>
                         {isAdmin && <div className="sticky right-0 z-10 w-10 bg-white/80 backdrop-blur-sm h-full flex items-center justify-center border-l border-stone-100"><button onClick={() => handleEdit(srv)} className="p-1.5 rounded-sm text-stone-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"><Edit2 className="w-3.5 h-3.5"/></button></div>}
                       </div>
                     );
                   })}
               </div>
               <div className="absolute top-10 left-48 bottom-0 pointer-events-none flex">
                  {Array.from({ length: Math.ceil(totalDays) }).map((_, i) => (
                    <div key={i} className="border-r border-stone-100 h-full" style={{ width: `${DAY_WIDTH}px` }}></div>
                  ))}
               </div>
             </div>
           </div>
        </div>
    );
};

const KPIs = ({ obras, comprasMateriales = [] }) => {
    const [kpiYear, setKpiYear] = useState('all');
    const [kpiMonth, setKpiMonth] = useState('all');

    const filteredObras = obras.filter(s => { 
        if (!s.fInicio) return false;
        const sDate = new Date(s.fInicio); 
        if (isNaN(sDate.getTime())) return false;
        return (kpiYear === 'all' || sDate.getFullYear().toString() === kpiYear) && (kpiMonth === 'all' || sDate.getMonth().toString() === kpiMonth); 
    });
    
    const obrasForCalc = filteredObras.filter(s => s.tipoTrabajo !== 'Vacaciones');

    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const formatMonthKey = (dateObj) => {
        if(isNaN(dateObj)) return null;
        return `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,'0')}`;
    };
    const formatMonthLabel = (mKey) => {
        if(!mKey) return '';
        const [y, m] = mKey.split('-');
        return `${monthNames[parseInt(m, 10)-1]} ${y.slice(2)}`;
    };

    const leadTimeByMonth = {};
    const obrasByMonth = {}; 
    const hoursByMonth = {};

    let totalWorkHours = 0;
    let totalTravelHours = 0;

    obrasForCalc.forEach(s => {
        if (s.fInicio) {
            const dInicio = new Date(s.fInicio);
            const mKey = formatMonthKey(dInicio);
            if (mKey) {
                obrasByMonth[mKey] = (obrasByMonth[mKey] || 0) + 1;
                
                if (s.fSolicitud) {
                    const dSol = new Date(s.fSolicitud);
                    if (!isNaN(dSol)) {
                        const lead = Math.max(0, (dInicio - dSol) / (1000 * 3600 * 24));
                        if (!leadTimeByMonth[mKey]) leadTimeByMonth[mKey] = { total: 0, count: 0 };
                        leadTimeByMonth[mKey].total += lead;
                        leadTimeByMonth[mKey].count += 1;
                    }
                }
            }
        }

        const logs = Array.isArray(s.dailyLogs) ? s.dailyLogs : [];
        logs.forEach(log => {
            if (!log.start || !log.end || !log.date) return;
            const logDate = new Date(log.date);
            const start = new Date(`2000-01-01T${log.start}`);
            const end = new Date(`2000-01-01T${log.end}`);
            if (isNaN(start) || isNaN(end) || isNaN(logDate)) return;

            let hours = (end - start) / (1000 * 60 * 60);
            if (hours < 0) hours += 24;
            const workerList = Array.isArray(log.workers) ? log.workers : [];
            const techCount = workerList.length > 0 ? workerList.length : 1;
            const total = hours * techCount;
            
            if (total > 0 && !isNaN(total)) {
                if (log.type === 'Viaje') totalTravelHours += total;
                else totalWorkHours += total;

                const mKeyLog = formatMonthKey(logDate);
                if(mKeyLog) {
                    hoursByMonth[mKeyLog] = (hoursByMonth[mKeyLog] || 0) + total;
                }
            }
        });
    });

    const dataLeadTimeTrend = Object.keys(leadTimeByMonth).sort().map(k => ({
        name: formatMonthLabel(k),
        avg: parseFloat((leadTimeByMonth[k].total / leadTimeByMonth[k].count).toFixed(1)) || 0
    }));

    const dataMonthlyVolume = Object.keys(obrasByMonth).sort().map(k => ({
        name: formatMonthLabel(k),
        value: obrasByMonth[k]
    }));

    const dataHoursByMonth = Object.keys(hoursByMonth).sort().map(k => ({
        name: formatMonthLabel(k),
        horas: parseFloat(hoursByMonth[k].toFixed(1))
    }));

    const dataHoursType = [{ name: 'Obra', value: parseFloat(totalWorkHours.toFixed(1)) || 0 }, { name: 'Traslados', value: parseFloat(totalTravelHours.toFixed(1)) || 0 }];

    const totalCompras = comprasMateriales.length;
    const comprasPendientes = comprasMateriales.filter(m => m.estado !== 'Comprado').length;
    const comprasRealizadas = totalCompras - comprasPendientes;
    const dataComprasPie = [
        { name: 'Pendiente/Proceso', value: comprasPendientes, fill: '#f59e0b' },
        { name: 'Comprado', value: comprasRealizadas, fill: '#10b981' }
    ];

    if (obrasForCalc.length === 0 && comprasMateriales.length === 0) return (<div className="space-y-6 animate-in fade-in pb-10"><div className="flex items-center gap-4 bg-white p-4 rounded-md border border-stone-200 shadow-sm mb-6"><div className="flex items-center text-stone-700 text-xs font-bold uppercase"><Filter className="w-4 h-4 mr-2"/> Filtrar Periodo:</div><select className="bg-stone-50 border border-stone-200 rounded-sm text-xs font-bold p-2 outline-none" value={kpiYear} onChange={e=>setKpiYear(e.target.value)}><option value="all">Todos los Años</option>{[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}</select><select className="bg-stone-50 border border-stone-200 rounded-sm text-xs font-bold p-2 outline-none" value={kpiMonth} onChange={e=>setKpiMonth(e.target.value)}><option value="all">Todos los Meses</option>{["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"].map((m,i) => <option key={i} value={i.toString()}>{m}</option>)}</select></div><div className="p-10 text-center text-stone-500 font-medium bg-white border border-stone-200 rounded-md shadow-sm">Sin datos operativos en el periodo seleccionado.</div></div>);
    
    const totalServices = obrasForCalc.length;
    const closedServices = obrasForCalc.filter(s => s.estado === 'Finalizado' || s.estado === 'Pausado');
    const successRate = closedServices.length ? ((closedServices.filter(s => s.estado === 'Finalizado').length / closedServices.length) * 100).toFixed(0) : 0;
    const activeServicesCount = obrasForCalc.filter(s => s.estado === 'En Ejecución').length;

    const clientMap = {}; 
    obrasForCalc.forEach(s => { 
        const cli = String(s.cliente || 'Desconocido');
        clientMap[cli] = (clientMap[cli] || 0) + 1; 
    });
    const dataTopClients = Object.entries(clientMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5);

    const techLoadMap = {}; 
    obrasForCalc.forEach(s => { 
        const techs = Array.isArray(s.cuadrillas) ? s.cuadrillas : [];
        techs.forEach(t => { 
            const tName = String(t);
            techLoadMap[tName] = (techLoadMap[tName] || 0) + 1; 
        }); 
    });
    const dataTechLoad = Object.entries(techLoadMap).map(([name, value]) => ({ name, value })).sort((a,b)=>b.value-a.value).slice(0,10);

    const servicesByTypeMap = {};
    obrasForCalc.forEach(s => { 
        const tipo = String(s.tipoTrabajo || 'Desconocido');
        servicesByTypeMap[tipo] = (servicesByTypeMap[tipo] || 0) + 1; 
    });
    const dataServicesByType = Object.entries(servicesByTypeMap).map(([name, value]) => ({ name, value }));

    return (
        <div className="space-y-6 animate-in fade-in pb-10">
            <div className="flex flex-col md:flex-row items-center justify-between bg-white p-4 rounded-md border border-stone-200 shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-3 mb-4 md:mb-0"><div className="bg-stone-800 p-2 rounded-sm text-white"><BarChart2 className="w-5 h-5" /></div><div><h3 className="text-sm font-bold text-stone-800 uppercase tracking-wide">Indicadores de Gestión</h3><p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Métricas principales del Estudio</p></div></div>
                <div className="flex items-center gap-3 bg-stone-50 p-1.5 rounded-sm border border-stone-200">
                    <div className="flex items-center px-3 text-stone-700 text-xs font-bold uppercase tracking-wider"><Filter className="w-3.5 h-3.5 mr-2"/> Periodo</div>
                    <select className="bg-white border border-stone-300 rounded-sm text-xs font-bold py-1.5 px-2 outline-none text-stone-700" value={kpiYear} onChange={e=>setKpiYear(e.target.value)}><option value="all">Año: Todos</option>{[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}</select>
                    <select className="bg-white border border-stone-300 rounded-sm text-xs font-bold py-1.5 px-2 outline-none text-stone-700" value={kpiMonth} onChange={e=>setKpiMonth(e.target.value)}><option value="all">Mes: Todos</option>{["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"].map((m,i) => <option key={i} value={i.toString()}>{m}</option>)}</select>
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {[
                    { title: "Proyectos Totales", val: totalServices, unit: "", icon: Home, color: "text-stone-800", bg: "bg-stone-100", border: "border-stone-200" },
                    { title: "Obras Activas", val: activeServicesCount, unit: "", icon: PenTool, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
                    { title: "Tasa Finalización", val: successRate, unit: "%", icon: CheckCircle, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
                    { title: "Compras Materiales", val: comprasPendientes, unit: "Pend.", icon: ShoppingCart, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" }
                ].map((k, i) => (
                    <div key={i} className={`bg-white p-5 rounded-md shadow-sm border ${k.border} hover:shadow-md transition-all group`}>
                        <div className="flex justify-between items-start mb-3"><div className={`p-2 rounded-sm ${k.bg} ${k.color} group-hover:scale-105 transition-transform`}><k.icon className="w-5 h-5"/></div></div>
                        <div><div className="text-2xl font-black text-stone-800 tracking-tight mb-1">{k.val} <span className="text-xs font-bold text-stone-500 ml-0.5 uppercase">{k.unit}</span></div><span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{k.title}</span></div>
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-md border border-stone-200 shadow-sm relative overflow-hidden h-80">
                    <h4 className="font-bold text-stone-800 text-xs uppercase tracking-wide flex items-center mb-4"><ShoppingCart className="w-4 h-4 mr-2 text-blue-700"/> Estado de Compras de Materiales</h4>
                    <div className="h-full w-full relative">
                        {totalCompras > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height="90%">
                                    <PieChart>
                                        <Pie data={dataComprasPie} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" stroke="none" paddingAngle={2}>
                                            {dataComprasPie.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                                        </Pie>
                                        <Tooltip contentStyle={{backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold'}}/>
                                        <Legend verticalAlign="bottom" wrapperStyle={{fontSize: '11px', fontWeight: 600, color: '#8A7C6E'}}/>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center">
                                    <span className="text-2xl font-black text-stone-800">{totalCompras}</span>
                                    <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider">Total</span>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full pb-10 text-xs font-medium text-stone-500">Sin materiales registrados.</div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-md border border-stone-200 shadow-sm h-80">
                    <h4 className="font-bold text-stone-800 text-xs uppercase tracking-wide flex items-center mb-4"><Timer className="w-4 h-4 mr-2 text-stone-700"/> Horas Hombre por Mes</h4>
                    <ResponsiveContainer width="100%" height="85%">
                        <RechartsBarChart data={dataHoursByMonth}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DFD5C5"/>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#8A7C6E', fontSize:10, fontWeight: 600}} dy={10}/>
                            <YAxis axisLine={false} tickLine={false} tick={{fill:'#8A7C6E', fontSize:10, fontWeight: 600}}/>
                            <Tooltip cursor={{fill: 'rgba(240, 235, 225, 0.5)'}} contentStyle={{backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #DFD5C5', fontSize: '12px', fontWeight: 'bold'}}/>
                            <Bar dataKey="horas" name="Horas Totales" fill="#8A7C6E" radius={[2, 2, 0, 0]} barSize={24} />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                 <div className="bg-white p-6 rounded-md border border-stone-200 shadow-sm relative col-span-2">
                    <div className="flex justify-between items-center mb-6"><div><h4 className="font-bold text-stone-800 text-xs uppercase tracking-wide flex items-center mb-1"><Clock className="w-4 h-4 mr-2 text-stone-700"/> Tiempos de Respuesta (Lead Time)</h4><p className="text-[10px] text-stone-500 font-semibold">Días promedio desde Creación a Inicio de Obra</p></div></div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={dataLeadTimeTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DFD5C5"/>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#8A7C6E', fontSize:10, fontWeight: 600}} dy={10}/>
                                <YAxis axisLine={false} tickLine={false} tick={{fill:'#8A7C6E', fontSize:10, fontWeight: 600}}/>
                                <Tooltip cursor={{fill: 'rgba(240, 235, 225, 0.5)'}} contentStyle={{backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #DFD5C5', fontSize: '12px', fontWeight: 'bold'}}/>
                                <Bar dataKey="avg" name="Días Promedio" fill="#6B5B4E" radius={[2, 2, 0, 0]} barSize={32} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                 <div className="bg-white p-6 rounded-md border border-stone-200 shadow-sm relative group overflow-hidden">
                    <div className="flex justify-between items-center mb-6 relative z-10"><div><h4 className="font-bold text-stone-800 text-xs uppercase tracking-wide flex items-center mb-1"><PieChart className="w-4 h-4 mr-2 text-stone-700"/> Tipo de Horas</h4><p className="text-[10px] text-stone-500 font-semibold">Distribución de HH</p></div></div>
                    <div className="h-64 relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={dataHoursType} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                                    {dataHoursType.map((entry, index) => (<Cell key={`cell-${index}`} fill={['#ea580c', '#a3978a'][index % 2]} />))}
                                </Pie>
                                <Tooltip contentStyle={{backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #DFD5C5', fontSize: '12px', fontWeight: 'bold'}}/>
                                <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '11px', fontWeight: 600, color: '#8A7C6E'}}/>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-[-10px]"><span className="text-2xl font-black text-stone-800 block">{(totalWorkHours + totalTravelHours).toFixed(0)}</span><span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider">Total HH</span></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-md border border-stone-200 shadow-sm h-80">
                    <h4 className="font-bold text-stone-800 text-xs uppercase tracking-wide flex items-center mb-4"><BarChart className="w-4 h-4 mr-2 text-stone-700"/> Evolución Mensual (Proyectos Iniciados)</h4>
                    <ResponsiveContainer width="100%" height="85%">
                        <RechartsBarChart data={dataMonthlyVolume}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DFD5C5"/>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#8A7C6E', fontSize:10, fontWeight: 600}} dy={10}/>
                            <YAxis axisLine={false} tickLine={false} tick={{fill:'#8A7C6E', fontSize:10, fontWeight: 600}}/>
                            <Tooltip cursor={{fill: 'rgba(240, 235, 225, 0.5)'}} contentStyle={{backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #DFD5C5', fontSize: '12px', fontWeight: 'bold'}}/>
                            <Bar dataKey="value" name="Proyectos" fill="#ea580c" radius={[2, 2, 0, 0]} barSize={24} />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-md border border-stone-200 shadow-sm h-80 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-2"><h4 className="font-bold text-stone-800 text-xs uppercase tracking-wide flex items-center"><Ruler className="w-4 h-4 mr-2 text-stone-700"/> Obras por Tipología</h4></div>
                    <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie data={dataServicesByType} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                                {dataServicesByType.map((entry, index) => (<Cell key={`cell-${index}`} fill={Object.values(COLORS_TRABAJO)[index % 10] || '#D0C4B2'} />))}
                            </Pie>
                            <Tooltip contentStyle={{backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #DFD5C5', fontSize: '11px', fontWeight: 'bold'}}/>
                            <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '10px', fontWeight: 600, color: '#8A7C6E'}}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-md border border-stone-200 shadow-sm h-80">
                    <h4 className="font-bold text-stone-800 text-xs uppercase tracking-wide flex items-center mb-4"><UserCheck className="w-4 h-4 mr-2 text-stone-700"/> Top 5 Clientes</h4>
                    <ResponsiveContainer width="100%" height="85%">
                        <RechartsBarChart data={dataTopClients} layout="vertical" margin={{left: 0}}>
                            <XAxis type="number" hide/>
                            <YAxis dataKey="name" type="category" width={100} tick={{fontSize:10, fill:'#8A7C6E', fontWeight:600}} axisLine={false} tickLine={false}/>
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius:'4px', border:'1px solid #DFD5C5', fontSize:'11px', fontWeight:'bold'}}/>
                            <Bar dataKey="value" fill="#8A7C6E" radius={[0,2,2,0]} barSize={10} background={{ fill: 'rgba(240, 235, 225, 0.5)' }}/>
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-md border border-stone-200 shadow-sm h-80">
                    <h4 className="font-bold text-stone-800 text-xs uppercase tracking-wide flex items-center mb-4"><Users className="w-4 h-4 mr-2 text-stone-700"/> Asignación Cuadrillas (Top 10)</h4>
                    <ResponsiveContainer width="100%" height="85%">
                        <RechartsBarChart data={dataTechLoad} layout="vertical" margin={{left: 20}}>
                            <XAxis type="number" hide/>
                            <YAxis dataKey="name" type="category" width={100} tick={{fontSize:10, fill:'#8A7C6E', fontWeight: 600}} axisLine={false} tickLine={false}/>
                            <Tooltip cursor={{fill: 'rgba(240, 235, 225, 0.5)'}} contentStyle={{backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #DFD5C5', fontSize:'11px', fontWeight:'bold'}}/>
                            <Bar dataKey="value" fill="#6B5B4E" radius={[0, 2, 2, 0]} barSize={10} background={{ fill: 'rgba(240, 235, 225, 0.5)' }}/>
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const ObrasSheet = ({ mode = 'operations', sortedServices, handleEdit, handleDelete }) => {
    const [hideCompleted, setHideCompleted] = useState(false);

    const filteredSheetServices = useMemo(() => {
        let list;
        if (mode === 'operations') list = sortedServices.filter(s => s.tipoTrabajo !== 'Vacaciones');
        else list = sortedServices.filter(s => s.tipoTrabajo === 'Vacaciones');
        
        if (hideCompleted) {
            list = list.filter(s => s.estado !== 'Finalizado');
        }
        
        return list.sort((a,b) => new Date(a.fInicio) - new Date(b.fInicio));
    }, [sortedServices, mode, hideCompleted]);

    return (
      <div className="bg-white rounded-md shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
              <h3 className="font-bold text-stone-800 text-xs uppercase tracking-wide">
                  {mode === 'operations' ? 'Listado General de Obras' : 'Ausencias y Licencias'}
              </h3>
              <label className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-1.5 rounded-sm border border-stone-200 shadow-sm hover:bg-stone-50 transition-colors">
                  <input type="checkbox" checked={hideCompleted} onChange={(e) => setHideCompleted(e.target.checked)} className="accent-stone-800 w-4 h-4 rounded-sm border-stone-300" />
                  <span className="text-xs font-bold text-stone-700">Ocultar Finalizados</span>
              </label>
          </div>
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-200 text-sm">
                  <thead className="bg-stone-100">
                      <tr>
                          <th className="px-6 py-3 text-left font-bold text-stone-600 uppercase tracking-wider text-[10px]">ID Proyecto / Tipo</th>
                          <th className="px-6 py-3 text-left font-bold text-stone-600 uppercase tracking-wider text-[10px]">Cliente / Asignado</th>
                          {mode !== 'vacations' && (<th className="px-6 py-3 text-left font-bold text-stone-600 uppercase tracking-wider text-[10px]">Presupuesto Est.</th>)}
                          <th className="px-6 py-3 text-left font-bold text-stone-600 uppercase tracking-wider text-[10px]">Fechas (Inicio - Fin)</th>
                          <th className="px-6 py-3 text-left font-bold text-stone-600 uppercase tracking-wider text-[10px]">Estado</th>
                          <th className="px-6 py-3 text-right font-bold text-stone-600 uppercase tracking-wider text-[10px]">Acciones</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                      {filteredSheetServices.map(s => (
                          <tr key={s.id} className="hover:bg-stone-50 transition-colors group">
                              <td className="px-6 py-4 font-mono font-bold text-stone-800 text-xs">{mode === 'vacations' ? 'LICENCIA' : <div>{s.idProyecto}<div className="text-[10px] text-stone-500 font-sans leading-none mt-1.5">{s.tipoTrabajo === 'Otro' && s.tipoTrabajoOtro ? `Otro: ${s.tipoTrabajoOtro}` : s.tipoTrabajo}</div></div>}</td>
                              <td className="px-6 py-4 font-bold text-stone-800 text-xs">{mode === 'vacations' ? (s.cuadrillas || []).join(', ') : s.cliente}</td>
                              {mode !== 'vacations' && (<td className="px-6 py-4 text-xs font-medium text-stone-600">{s.presupuestoEstimado ? `$${s.presupuestoEstimado}` : '-'}</td>)}
                              <td className="px-6 py-4 whitespace-nowrap text-stone-600 text-xs font-medium">{formatDate(s.fInicio)} <span className="text-stone-300 mx-1">/</span> {formatDate(s.fFin)}</td>
                              <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold border uppercase tracking-wider ${s.estado==='Finalizado'?'bg-green-50 border-green-200 text-green-800':s.estado==='En Ejecución'?'bg-amber-50 border-amber-200 text-amber-800':s.postergado?'bg-red-50 border-red-200 text-red-800':'bg-stone-100 border-stone-300 text-stone-800'}`}>{s.postergado ? 'Pausado' : s.estado}</span></td>
                              <td className="px-6 py-4 text-right whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button type="button" onClick={() => handleEdit(s)} className="text-stone-500 hover:text-amber-700 mx-1 p-1 hover:bg-amber-50 rounded-sm transition-colors"><Edit2 className="w-4 h-4"/></button>
                                  <button type="button" onClick={() => handleDelete(s.id)} className="text-stone-400 hover:text-red-600 mx-1 p-1 hover:bg-red-50 rounded-sm transition-colors"><Trash2 className="w-4 h-4"/></button>
                              </td>
                          </tr>
                      ))}
                      {filteredSheetServices.length === 0 && <tr><td colSpan="6" className="text-center py-8 text-stone-400 text-xs font-medium">No hay registros en esta vista.</td></tr>}
                  </tbody>
              </table>
          </div>
      </div>
    );
};

const HistorialObras = ({ obras, expenses = [] }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const history = useMemo(() => { 
        if (!searchQuery) return []; 
        const lowerQ = searchQuery.toLowerCase();
        return obras.filter(s => 
            (s.idProyecto && s.idProyecto.toLowerCase().includes(lowerQ)) || 
            (s.cliente && s.cliente.toLowerCase().includes(lowerQ)) ||
            (s.ubicacion && s.ubicacion.toLowerCase().includes(lowerQ))
        ); 
    }, [searchQuery, obras]);
    const displayHistory = searchQuery ? history : obras.sort((a,b) => new Date(b.fInicio) - new Date(a.fInicio)).slice(0, 10);

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-md shadow-sm border border-stone-200 flex flex-col md:flex-row gap-4 justify-between items-center">
                <h3 className="text-sm font-bold flex items-center text-stone-800 uppercase tracking-wide"><History className="w-5 h-5 mr-3 text-stone-700"/> Búsqueda y Registro Histórico</h3>
                <div className="flex w-full md:w-auto flex-1 max-w-md relative"><Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400"/><input type="text" placeholder="Buscar por ID Proyecto, Cliente o Ubicación..." className="input-field pl-9 bg-stone-50" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
            </div>
            {displayHistory.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-4">
                    {displayHistory.map(srv => {
                        const projectExpenses = expenses.filter(e => e.obraId === srv.id);
                        const totalGastos = projectExpenses.reduce((acc, curr) => acc + (curr.type === 'egreso' ? Number(curr.monto || 0) : 0), 0);

                        return (
                        <div key={srv.id} className="bg-white p-5 rounded-md shadow-sm border border-stone-200 hover:border-stone-400 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div><h5 className="font-black text-lg text-stone-800 mb-1">{srv.cliente}</h5><p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{srv.tipoTrabajo === 'Otro' && srv.tipoTrabajoOtro ? `Otro: ${srv.tipoTrabajoOtro}` : srv.tipoTrabajo}</p></div>
                                <span className={`px-2.5 py-1 rounded-sm text-[10px] font-bold border uppercase tracking-wider ${srv.estado === 'Finalizado' ? 'bg-green-50 border-green-200 text-green-800' : srv.estado === 'Pausado' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-stone-100 border-stone-300 text-stone-800'}`}>{srv.estado}</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 bg-stone-50 p-4 rounded-sm border border-stone-200">
                                <div><span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">ID Proyecto</span><span className="text-xs font-mono font-bold text-stone-800">{srv.idProyecto || '-'}</span></div>
                                <div><span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">Metros Cuadrados</span><span className="text-xs font-bold text-stone-800">{srv.m2 ? `${srv.m2} m²` : '-'}</span></div>
                                <div><span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">Presupuesto</span><span className="text-xs font-bold text-stone-800">{srv.presupuestoEstimado ? `$${srv.presupuestoEstimado}` : '-'}</span></div>
                                <div><span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">Total Gastos</span><span className="text-xs font-bold text-red-600">${totalGastos.toLocaleString()}</span></div>
                                <div><span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">Cuadrilla</span><span className="text-xs font-bold text-stone-800">{srv.cuadrillas?.join(', ') || '-'}</span></div>
                            </div>
                            <div className="flex items-center text-xs font-medium text-stone-600 mb-3 space-x-4 bg-white p-2 border border-stone-100 rounded-sm w-fit">
                                <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5 text-stone-400"/> {formatDate(srv.fInicio)} / {formatDate(srv.fFin)}</span>
                                <span className="text-stone-300">|</span>
                                <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1.5 text-stone-400"/> {srv.ubicacion || 'Sin ubicación'}</span>
                            </div>
                            <TechReportViewer service={srv} expenses={projectExpenses} />
                        </div>
                    )})}
                </div>
            ) : (
                <div className="text-center p-12 text-stone-500 font-medium bg-white rounded-md border border-dashed border-stone-300">No se encontraron obras con esos parámetros de búsqueda.</div>
            )}
        </div>
    );
};

const FinanzasInventario = ({ obras, expenses, inventory, handleAddExpenseAdmin, handleAddInventoryItem, handleUpdateInventoryStock, handleDeleteExpense }) => {
    const [tab, setTab] = useState('finanzas');
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    
    const [financeYear, setFinanceYear] = useState('all');
    const [financeMonth, setFinanceMonth] = useState('all');

    const [newExpense, setNewExpense] = useState({ obraId: '', amount: '', concept: '', files: [], type: 'egreso', fecha: new Date().toISOString().split('T')[0] });
    const [newItem, setNewItem] = useState({ name: '', category: 'Materiales Generales', stock: 0, unit: 'u' });

    const filteredTransactions = useMemo(() => {
        return expenses.filter(t => {
            if (!t.fecha) return false;
            const [y, m] = t.fecha.split('-'); 
            const matchY = financeYear === 'all' || y === financeYear;
            const matchM = financeMonth === 'all' || (parseInt(m, 10) - 1).toString() === financeMonth;
            return matchY && matchM;
        }).sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
    }, [expenses, financeYear, financeMonth]);

    const { ingresos, egresos, saldo } = useMemo(() => {
        let i = 0; let e = 0;
        filteredTransactions.forEach(t => {
            const amt = Number(t.monto || 0);
            if (t.type === 'ingreso') i += amt;
            else e += amt;
        });
        return { ingresos: i, egresos: e, saldo: i - e };
    }, [filteredTransactions]);

    const activeObras = obras.filter(o => o.estado !== 'Finalizado');

    return (
        <div className="space-y-6 animate-in fade-in pb-10">
            <div className="bg-white p-5 rounded-md border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="bg-stone-800 p-2 rounded-sm text-white"><Wallet className="w-5 h-5" /></div>
                    <div>
                        <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wide">Finanzas e Inventario</h3>
                        <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Control de gastos de obra y stock</p>
                    </div>
                </div>
                <div className="flex bg-stone-100 p-1.5 rounded-sm border border-stone-200">
                    <button onClick={()=>setTab('finanzas')} className={`px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-all ${tab==='finanzas'?'bg-white text-stone-800 shadow-sm':'text-stone-500 hover:text-stone-800'}`}><DollarSign className="w-3.5 h-3.5 inline-block mr-1"/> Libro Mayor (Caja)</button>
                    <button onClick={()=>setTab('inventario')} className={`px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-all ${tab==='inventario'?'bg-white text-stone-800 shadow-sm':'text-stone-500 hover:text-stone-800'}`}><Package className="w-3.5 h-3.5 inline-block mr-1"/> Stock / Depósito</button>
                </div>
            </div>

            {tab === 'finanzas' && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 bg-white p-3 rounded-md border border-stone-200 shadow-sm w-fit">
                        <div className="flex items-center px-3 text-stone-700 text-xs font-bold uppercase tracking-wider"><Filter className="w-3.5 h-3.5 mr-2"/> Periodo Arqueo</div>
                        <select className="bg-stone-50 border border-stone-300 rounded-sm text-xs font-bold py-1.5 px-2 outline-none text-stone-700" value={financeYear} onChange={e=>setFinanceYear(e.target.value)}><option value="all">Año: Todos</option>{[2024, 2025, 2026].map(y => <option key={y} value={y.toString()}>{y}</option>)}</select>
                        <select className="bg-stone-50 border border-stone-300 rounded-sm text-xs font-bold py-1.5 px-2 outline-none text-stone-700" value={financeMonth} onChange={e=>setFinanceMonth(e.target.value)}><option value="all">Mes: Todos</option>{["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"].map((m,i) => <option key={i} value={i.toString()}>{m}</option>)}</select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-md shadow-sm border border-stone-200 flex flex-col justify-center relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-5"><ArrowDownRight className="w-24 h-24 text-green-500"/></div>
                            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Total Ingresos (Debe)</p>
                            <p className="text-3xl font-black text-green-600">${ingresos.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-6 rounded-md shadow-sm border border-stone-200 flex flex-col justify-center relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-5"><ArrowDownRight className="w-24 h-24 text-red-500"/></div>
                            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Total Egresos (Haber)</p>
                            <p className="text-3xl font-black text-red-600">-${egresos.toLocaleString()}</p>
                        </div>
                        <div className={`p-6 rounded-md shadow-sm border flex flex-col justify-center relative overflow-hidden ${saldo >= 0 ? 'bg-stone-800 border-stone-900 text-white' : 'bg-red-50 border-red-200 text-red-900'}`}>
                            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${saldo >= 0 ? 'text-stone-300' : 'text-red-700'}`}>Saldo de Caja</p>
                            <p className="text-3xl font-black">${saldo.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-md shadow-sm border border-stone-200 overflow-hidden">
                        <div className="p-4 border-b border-stone-200 bg-stone-50 flex justify-between items-center">
                            <h3 className="font-bold text-stone-800 text-xs uppercase tracking-wide">Libro Mayor (Transacciones)</h3>
                            <button onClick={()=>setIsExpenseModalOpen(true)} className="bg-stone-800 text-white px-4 py-2 rounded-sm font-bold uppercase tracking-wider text-[10px] hover:bg-stone-700 shadow-sm flex items-center transition-colors"><Plus className="w-3.5 h-3.5 mr-2"/> Registrar Movimiento</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-stone-200 text-sm">
                                <thead className="bg-stone-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-bold text-stone-600 uppercase tracking-wider text-[10px]">Fecha</th>
                                        <th className="px-6 py-3 text-left font-bold text-stone-600 uppercase tracking-wider text-[10px]">Obra / Proyecto</th>
                                        <th className="px-6 py-3 text-left font-bold text-stone-600 uppercase tracking-wider text-[10px]">Concepto</th>
                                        <th className="px-6 py-3 text-right font-bold text-stone-600 uppercase tracking-wider text-[10px]">Ingreso (Debe)</th>
                                        <th className="px-6 py-3 text-right font-bold text-stone-600 uppercase tracking-wider text-[10px]">Egreso (Haber)</th>
                                        <th className="px-6 py-3 text-right font-bold text-stone-600 uppercase tracking-wider text-[10px]">Comprobante / Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 bg-white">
                                    {filteredTransactions.map(g => (
                                        <tr key={g.id} className="hover:bg-stone-50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap text-stone-600 font-medium text-xs">{formatDate(g.fecha)}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-stone-800 text-xs truncate max-w-[200px]">{g.obraName || 'Movimiento General'}</div>
                                                {g.idProyecto && <div className="text-[9px] font-mono text-stone-500 mt-1">{g.idProyecto} | {g.cuadrilla}</div>}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-stone-600 truncate max-w-[200px]" title={g.concepto}>{g.concepto}</td>
                                            <td className="px-6 py-4 text-right font-black text-green-600 text-sm">{g.type === 'ingreso' ? `$${Number(g.monto).toLocaleString()}` : '-'}</td>
                                            <td className="px-6 py-4 text-right font-black text-red-600 text-sm">{g.type === 'egreso' ? `-$${Number(g.monto).toLocaleString()}` : '-'}</td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                {g.comprobantes && g.comprobantes.length > 0 ? (
                                                    <a href={g.comprobantes[0].url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-sm border border-blue-200 hover:bg-blue-600 hover:text-white transition-colors mr-2"><Receipt className="w-3 h-3 mr-1"/> Ver</a>
                                                ) : <span className="text-[10px] text-stone-400 italic mr-3">Sin Adjunto</span>}
                                                <button onClick={() => handleDeleteExpense(g.id)} className="text-stone-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 p-1"><Trash2 className="w-4 h-4"/></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredTransactions.length === 0 && <tr><td colSpan="6" className="text-center py-8 text-stone-400 text-xs font-medium">No hay transacciones registradas en este periodo.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'inventario' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-md shadow-sm border border-stone-200 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h3 className="font-bold text-stone-800 text-sm uppercase tracking-wide flex items-center"><Package className="w-4 h-4 mr-2 text-stone-600"/> Inventario del Estudio / Depósito</h3>
                            <p className="text-xs text-stone-500 font-medium">Stock de materiales, herramientas e insumos propios.</p>
                        </div>
                        <button onClick={()=>setIsItemModalOpen(true)} className="bg-stone-800 text-white px-5 py-2.5 rounded-sm font-bold uppercase tracking-wider flex items-center hover:bg-stone-700 shadow-md active:scale-95 text-[10px] transition-colors"><Plus className="w-3.5 h-3.5 mr-2"/> Nuevo Artículo</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {inventory.sort((a,b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)).map(item => (
                            <div key={item.id} className="bg-white p-5 rounded-md shadow-sm border border-stone-200 flex flex-col justify-between">
                                <div className="mb-4">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500 bg-stone-100 px-2 py-0.5 rounded-sm">{item.category}</span>
                                    <h4 className="font-black text-stone-800 text-lg mt-2 leading-tight">{item.name}</h4>
                                </div>
                                <div className="flex items-center justify-between border-t border-stone-100 pt-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Stock Actual</span>
                                        <span className={`text-2xl font-black ${item.stock <= 0 ? 'text-red-500' : 'text-stone-800'}`}>{item.stock} <span className="text-xs text-stone-500 font-bold uppercase">{item.unit}</span></span>
                                    </div>
                                    <div className="flex bg-stone-50 rounded-sm border border-stone-200 p-1">
                                        <button onClick={()=>handleUpdateInventoryStock(item.id, Number(item.stock) - 1)} className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-white rounded-sm transition-colors"><MinusCircle className="w-5 h-5"/></button>
                                        <button onClick={()=>handleUpdateInventoryStock(item.id, Number(item.stock) + 1)} className="p-1.5 text-stone-500 hover:text-green-600 hover:bg-white rounded-sm transition-colors"><PlusCircle className="w-5 h-5"/></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {inventory.length === 0 && (
                            <div className="col-span-full text-center py-12 text-stone-500 font-medium bg-white rounded-md border border-dashed border-stone-300">El inventario está vacío. Registra artículos para llevar control de stock.</div>
                        )}
                    </div>
                </div>
            )}

            <Modal isOpen={isExpenseModalOpen} onClose={()=>setIsExpenseModalOpen(false)} title="Registrar Movimiento Financiero">
                <form onSubmit={(e) => { e.preventDefault(); handleAddExpenseAdmin(newExpense); setIsExpenseModalOpen(false); setNewExpense({ obraId: '', amount: '', concept: '', files: [], type: 'egreso', fecha: new Date().toISOString().split('T')[0] }); }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">Tipo de Movimiento <span className="text-red-500">*</span></label>
                            <select className="input-field text-xs shadow-sm font-bold" value={newExpense.type} onChange={e=>setNewExpense({...newExpense, type: e.target.value})}>
                                <option value="ingreso">Ingreso (Fondo/Cobro)</option>
                                <option value="egreso">Egreso (Gasto/Pago)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">Fecha <span className="text-red-500">*</span></label>
                            <input type="date" className="input-field text-xs shadow-sm" value={newExpense.fecha} onChange={e=>setNewExpense({...newExpense, fecha: e.target.value})} required/>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">Obra Asociada (Opcional)</label>
                        <select className="input-field text-xs shadow-sm" value={newExpense.obraId} onChange={e=>setNewExpense({...newExpense, obraId: e.target.value})}>
                            <option value="">Movimiento General / Administrativo</option>
                            {activeObras.map(o => <option key={o.id} value={o.id}>[{o.idProyecto}] {o.cliente}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">Concepto / Detalle <span className="text-red-500">*</span></label>
                        <input type="text" className="input-field text-xs shadow-sm" value={newExpense.concept} onChange={e=>setNewExpense({...newExpense, concept: e.target.value})} placeholder="Ej: Anticipo cliente, Compra insumos..." required/>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">Monto Total ($) <span className="text-red-500">*</span></label>
                        <input type="number" className={`input-field text-lg font-black shadow-sm ${newExpense.type === 'ingreso' ? 'text-green-600' : 'text-red-600'}`} value={newExpense.amount} onChange={e=>setNewExpense({...newExpense, amount: e.target.value})} placeholder="0.00" required/>
                    </div>
                    <FileUploader files={newExpense.files} setFiles={(f)=>setNewExpense({...newExpense, files: f})} label="COMPROBANTE / TICKET"/>
                    <button type="submit" className="w-full bg-stone-800 text-white py-3.5 rounded-sm font-black uppercase tracking-wider text-xs shadow-md hover:bg-stone-700">Registrar Movimiento</button>
                </form>
            </Modal>

            <Modal isOpen={isItemModalOpen} onClose={()=>setIsItemModalOpen(false)} title="Nuevo Artículo en Inventario">
                <form onSubmit={(e) => { e.preventDefault(); handleAddInventoryItem(newItem); setIsItemModalOpen(false); setNewItem({ name: '', category: 'Materiales Generales', stock: 0, unit: 'u' }); }} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">Nombre del Artículo <span className="text-red-500">*</span></label>
                        <input type="text" className="input-field text-xs shadow-sm" value={newItem.name} onChange={e=>setNewItem({...newItem, name: e.target.value})} placeholder="Ej: Cemento Loma Negra, Amoladora Makita..." required/>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">Categoría</label>
                            <select className="input-field text-xs shadow-sm" value={newItem.category} onChange={e=>setNewItem({...newItem, category: e.target.value})}>
                                <option value="Materiales Generales">Materiales Generales</option>
                                <option value="Herramientas">Herramientas Eléctricas/Manuales</option>
                                <option value="EPP / Seguridad">EPP / Seguridad</option>
                                <option value="Insumos Oficina">Insumos Oficina</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">Unidad de Medida</label>
                            <select className="input-field text-xs shadow-sm" value={newItem.unit} onChange={e=>setNewItem({...newItem, unit: e.target.value})}>
                                <option value="u">Unidad (u)</option>
                                <option value="kg">Kilogramo (kg)</option>
                                <option value="lt">Litro (lt)</option>
                                <option value="mts">Metros (m)</option>
                                <option value="bolsas">Bolsas</option>
                                <option value="cajas">Cajas</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">Stock Inicial</label>
                        <input type="number" className="input-field text-xs shadow-sm" value={newItem.stock} onChange={e=>setNewItem({...newItem, stock: e.target.value})} />
                    </div>
                    <button type="submit" className="w-full bg-stone-800 text-white py-3.5 rounded-sm font-black uppercase tracking-wider text-xs shadow-md hover:bg-stone-700 mt-2">Guardar Artículo</button>
                </form>
            </Modal>

        </div>
    );
};

const CuadrillaPortal = ({ obras, user, handleStartService, setUploadingEvidenceService, setEvidenceData, setLoggingHoursService, setDailyLogData, setTechsForHours, setClosingService, setClosureData, setReopeningService, setReopenReason, setLoggingExpenseService, setExpenseData }) => {
    const [view, setView] = useState('list'); 
    const [hideCompleted, setHideCompleted] = useState(false);

    const myServices = useMemo(() => {
        let list = obras.filter(s => s.cuadrillas && s.cuadrillas.includes(user.name));
        if (hideCompleted) {
            list = list.filter(s => s.estado !== 'Finalizado');
        }
        return list.sort((a,b) => new Date(a.fInicio) - new Date(b.fInicio));
    }, [obras, user.name, hideCompleted]);

    return (
        <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto pb-10">
            <div className="bg-stone-800 p-8 rounded-md shadow-lg text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-center">
                <div className="relative z-10 mb-4 md:mb-0">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Portal Operativo</p>
                    <h2 className="text-2xl font-black mb-1">Hola, {user.name} 👋</h2>
                    <p className="text-stone-300 text-sm">Gestiona tus obras asignadas, avances y gastos desde aquí.</p>
                </div>
                <div className="relative z-10 bg-stone-900 p-1.5 rounded-sm flex items-center border border-stone-700">
                    <label className="flex items-center space-x-2 cursor-pointer px-3 py-2 rounded-sm hover:bg-stone-800 transition-colors text-white mr-2 border-r border-stone-700">
                        <input type="checkbox" checked={hideCompleted} onChange={(e) => setHideCompleted(e.target.checked)} className="accent-stone-500 w-4 h-4 rounded-sm" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Ocultar Finalizadas</span>
                    </label>
                    <button onClick={()=>setView('list')} className={`px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-all ${view==='list'?'bg-white text-stone-900 shadow-sm':'text-stone-300 hover:text-white hover:bg-stone-800'}`}><List className="w-3.5 h-3.5 inline-block mr-1.5"/> Listado</button>
                    <button onClick={()=>setView('gantt')} className={`px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-all ${view==='gantt'?'bg-white text-stone-900 shadow-sm':'text-stone-300 hover:text-white hover:bg-stone-800'}`}><Calendar className="w-3.5 h-3.5 inline-block mr-1.5"/> Agenda</button>
                </div>
            </div>

            <div className="space-y-6">
                {view === 'list' ? (
                    <>
                        {myServices.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4 flex items-center"><PenTool className="w-4 h-4 mr-2"/> Obras en Curso</h3>
                                <div className="grid grid-cols-1 gap-5">
                                    {myServices.map(srv => (
                                        <div key={srv.id} className="bg-white rounded-md shadow-sm border border-stone-200 p-6 flex flex-col lg:flex-row justify-between gap-6 hover:shadow-md transition-shadow group">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className={`px-2.5 py-1 rounded-sm text-[10px] font-bold border uppercase tracking-wider ${srv.estado==='Finalizado'?'bg-green-50 border-green-200 text-green-800':srv.estado==='En Ejecución'?'bg-amber-50 border-amber-200 text-amber-800':srv.estado==='Pausado'?'bg-red-50 border-red-200 text-red-800':'bg-stone-100 border-stone-300 text-stone-800'}`}>{srv.estado}</span>
                                                    <span className="text-[10px] text-stone-500 font-mono bg-stone-50 px-2 py-1 rounded-sm border border-stone-200">ID: {srv.idProyecto}</span>
                                                </div>
                                                <h3 className="font-black text-xl text-stone-800 mb-1">{srv.cliente}</h3>
                                                <p className="text-xs text-stone-500 font-medium mb-4 uppercase tracking-wide">{srv.tipoTrabajo === 'Otro' && srv.tipoTrabajoOtro ? `Otro: ${srv.tipoTrabajoOtro}` : srv.tipoTrabajo}</p>
                                                
                                                {srv.contactoResponsable && (
                                                    <div className="mb-4 text-[11px] bg-stone-50 text-stone-700 p-2.5 rounded-sm inline-flex items-center border border-stone-200 font-bold uppercase tracking-wider">
                                                        <UserCheck className="w-3.5 h-3.5 mr-2 text-stone-400"/> Contacto en Sitio: {srv.contactoResponsable}
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-stone-600 bg-stone-50 p-4 rounded-sm border border-stone-100 mb-2">
                                                    <div className="flex items-center font-medium"><Calendar className="w-4 h-4 mr-2 text-stone-400"/> {formatDate(srv.fInicio)} ➔ {formatDate(srv.fFin)}</div>
                                                    <div className="flex items-center font-medium"><MapPin className="w-4 h-4 mr-2 text-stone-400"/> {srv.ubicacion || 'Sin Ubicación'}</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-3 justify-center min-w-[220px] border-t lg:border-t-0 lg:border-l border-stone-100 lg:pl-6 pt-4 lg:pt-0">
                                                {srv.estado === 'Proyectado' && <button onClick={() => handleStartService(srv)} className="bg-stone-800 text-white py-3.5 px-4 rounded-sm font-bold uppercase tracking-wider hover:bg-stone-700 shadow-md flex items-center justify-center transition-all active:scale-95 text-[11px]"><PlayCircle className="w-4 h-4 mr-2"/> Iniciar Obra</button>}
                                                {srv.estado === 'En Ejecución' && (
                                                    <>
                                                        <button onClick={() => { setUploadingEvidenceService(srv); setEvidenceData({comment: '', files: []}); }} className="bg-white text-stone-700 border border-stone-300 py-2.5 px-3 rounded-sm font-bold hover:bg-stone-50 flex items-center justify-center text-[10px] uppercase tracking-wider transition-colors shadow-sm"><ImageIcon className="w-3.5 h-3.5 mr-2"/> Cargar Avance</button>
                                                        <button onClick={() => { setLoggingHoursService(srv); setDailyLogData({date: new Date().toISOString().split('T')[0], start:'', end:'', type: 'Trabajo'}); setTechsForHours(srv.cuadrillas); }} className="bg-white text-stone-700 border border-stone-300 py-2.5 px-3 rounded-sm font-bold hover:bg-stone-50 flex items-center justify-center text-[10px] uppercase tracking-wider transition-colors shadow-sm"><Timer className="w-3.5 h-3.5 mr-2"/> Cargar Horas</button>
                                                        <button onClick={() => { setLoggingExpenseService(srv); setExpenseData({amount: '', concept: '', files: [], fecha: new Date().toISOString().split('T')[0]}); }} className="bg-white text-amber-700 border border-amber-200 py-2.5 px-3 rounded-sm font-bold hover:bg-amber-50 flex items-center justify-center text-[10px] uppercase tracking-wider transition-colors shadow-sm"><Receipt className="w-3.5 h-3.5 mr-2"/> Rendir Gasto</button>
                                                        <button onClick={() => { setClosingService(srv); setClosureData({status:'Finalizado', reasonType: '', reason:'', observation: '', files:[]}); }} className="bg-white text-red-700 border border-red-200 py-2.5 px-3 rounded-sm font-bold hover:bg-red-50 flex items-center justify-center text-[10px] uppercase tracking-wider transition-colors mt-2 shadow-sm"><AlertOctagon className="w-3.5 h-3.5 mr-2"/> Cambiar Estado</button>
                                                    </>
                                                )}
                                                {(srv.estado === 'Finalizado' || srv.estado === 'Pausado') && <button onClick={() => { setReopeningService(srv); setReopenReason(""); }} className="w-full py-3 text-[10px] uppercase tracking-wider font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-sm border border-amber-200 transition-colors shadow-sm flex items-center justify-center"><RotateCcw className="w-3.5 h-3.5 mr-2"/> Reanudar Obra</button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {myServices.length === 0 && (
                            <div className="text-center p-12 text-stone-500 font-medium bg-white rounded-md border border-dashed border-stone-300">No tienes obras asignadas actualmente.</div>
                        )}
                    </>
                ) : (
                    <GanttChart obras={myServices} mode="operations" handleEdit={()=>{}} isAdmin={false} />
                )}
            </div>
        </div>
    );
};

const LoginScreen = ({ onLogin, cuadrillasData }) => {
    const [role, setRole] = useState('admin');
    const [selectedTechName, setSelectedTechName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [adminSetupRequired, setAdminSetupRequired] = useState(false);
    const [adminConfig, setAdminConfig] = useState(null);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'admin_settings', 'config');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) { setAdminConfig(docSnap.data()); } else { setAdminSetupRequired(true); }
            } catch (e) {}
        };
        checkAdmin();
    }, []);

    const handleAdminSetup = async () => {
        if (password.length < 6) { setError('Contraseña > 6 caracteres'); return; }
        setLoading(true);
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'admin_settings', 'config'), { password: password });
            setAdminConfig({ password }); setAdminSetupRequired(false); setPassword('');
        } catch (e) { setError("Error de conexión"); }
        setLoading(false);
    };

    const handleLogin = () => {
        if(role === 'admin') {
            if(adminSetupRequired) { handleAdminSetup(); return; }
            const validPass = adminConfig ? adminConfig.password : 'admin123';
            if(password === validPass) { onLogin({ name: 'Dirección (Admin)', role: 'admin' }); } else { setError('Contraseña incorrecta'); }
        } else {
            const tech = cuadrillasData.find(t => t.name === selectedTechName);
            if(tech && tech.password === password) { onLogin({ name: selectedTechName, role: 'tech', phone: tech.phone }); } else { setError('Credenciales inválidas'); }
        }
    };

    const sortedCuadrillas = useMemo(() => [...cuadrillasData].sort((a, b) => a.name.localeCompare(b.name)), [cuadrillasData]);

    return (
        <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
            <GlobalStyles />
            <div className="bg-white p-10 rounded-md shadow-xl w-full max-w-md border border-stone-200/50 relative z-10">
                <div className="text-center mb-10">
                    <div className="mx-auto w-24 h-24 flex items-center justify-center mb-4">
                        <img src="https://imgur.com/y6rOMKf.png" alt="Sofia Piatti Logo" className="w-full h-full object-contain drop-shadow-md"/>
                    </div>
                    <h1 className="text-2xl font-black text-stone-800 tracking-tight uppercase">SOFIA PIATTI<br/><span className="text-stone-600 font-bold text-lg">ARQUITECTURA</span></h1>
                </div>
                {adminSetupRequired && role === 'admin' ? (
                    <div className="space-y-4">
                        <p className="text-xs text-stone-500 font-bold text-center">Configuración inicial requerida</p>
                        <input type="password" placeholder="Nueva Contraseña Maestra" className="input-field" value={password} onChange={e=>setPassword(e.target.value)}/>
                        <button onClick={handleAdminSetup} className="w-full bg-stone-800 text-white py-3 rounded-sm font-bold uppercase tracking-wider hover:bg-stone-700 transition-colors">Guardar y Continuar</button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="btn-bubble-container">
                            <button onClick={() => { setRole('admin'); setError(''); }} className={`btn-bubble ${role === 'admin' ? 'btn-bubble-active' : 'btn-bubble-inactive'}`}>Dirección</button>
                            <button onClick={() => { setRole('tech'); setError(''); }} className={`btn-bubble ${role === 'tech' ? 'btn-bubble-active' : 'btn-bubble-inactive'}`}>Cuadrilla</button>
                        </div>
                        {role === 'tech' && (
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><HardHat className="h-4 w-4 text-stone-400" /></div>
                                <select className="input-field pl-10" value={selectedTechName} onChange={(e) => setSelectedTechName(e.target.value)}>
                                    <option value="">Selecciona Líder de Cuadrilla...</option>
                                    {sortedCuadrillas.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                </select>
                            </div>
                        )}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-stone-400" /></div>
                            <input type="password" placeholder="Contraseña de acceso" className="input-field pl-10" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={e => e.key==='Enter' && handleLogin()} />
                        </div>
                        {error && <p className="text-red-600 text-xs text-center font-bold bg-red-50 border border-red-200 py-2 rounded-sm">{error}</p>}
                        <button onClick={handleLogin} className="w-full bg-stone-800 text-white py-3.5 rounded-sm font-bold shadow-md hover:bg-stone-700 transition-all uppercase tracking-wider mt-2">Acceder al Sistema</button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Lucide doesn't have HardHat by default in some older versions, mapping it to Users or Wrench if missing.
const HardHat = (props) => <Users {...props} />;

export default function App() {
    const [user, setUser] = useState(null); 
    const [activeTab, setActiveTab] = useState('kanban'); 
    const isOnline = useOnlineStatus();
    
    const [obras, setObras] = useState([]);
    const [cuadrillasData, setCuadrillasData] = useState([]);
    const [comprasData, setComprasData] = useState([]);
    const [expensesData, setExpensesData] = useState([]);
    const [inventoryData, setInventoryData] = useState([]);
    
    const [lastSavedObra, setLastSavedObra] = useState(null);
    const [notification, setNotification] = useState(null);
    const [showMsgModal, setShowMsgModal] = useState(false);

    useEffect(() => {
        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css'; link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }
        if (!document.getElementById('leaflet-js')) {
            const script = document.createElement('script');
            script.id = 'leaflet-js'; script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.async = true;
            document.head.appendChild(script);
        }
    }, []);

    useEffect(() => {
        if (!db) return;
        const initAuth = async () => { 
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                try { await signInWithCustomToken(auth, __initial_auth_token); } catch(e) { await signInAnonymously(auth); }
            } else {
                try { await signInAnonymously(auth); } catch (e) {} 
            }
        };
        initAuth();
        
        const unsubscribeObras = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'obras'), (snapshot) => {
            setObras(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubscribeCuadrillas = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'technicians'), (snapshot) => {
            setCuadrillasData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubscribeCompras = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'material_purchases'), (snapshot) => {
            setComprasData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubscribeExpenses = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'expenses'), (snapshot) => {
            setExpensesData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubscribeInventory = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'inventory'), (snapshot) => {
            setInventoryData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => { unsubscribeObras(); unsubscribeCuadrillas(); unsubscribeCompras(); unsubscribeExpenses(); unsubscribeInventory(); };
    }, []);

    const showNotification = (msg, type='success') => { setNotification({msg, type}); setTimeout(()=>setNotification(null), 3000); };

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isManageUsersOpen, setIsManageUsersOpen] = useState(false);
    const [isChangeAdminPasswordOpen, setIsChangeAdminPasswordOpen] = useState(false); 
    
    const [isCompraModalOpen, setIsCompraModalOpen] = useState(false);
    const [editingCompraId, setEditingCompraId] = useState(null);
    const [compraFormData, setCompraFormData] = useState({
        material: '', categoria: 'Estructural y Albañilería',
        fechaLimite: new Date().toISOString().split('T')[0], estado: 'Pendiente', observaciones: '', liderAsignado: ''
    });

    const [newAdminPasswordToChange, setNewAdminPasswordToChange] = useState(""); 
    
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        idProyecto: '', cliente: '', fSolicitud: new Date().toISOString().split('T')[0], fInicio: '', fFin: '', tipoTrabajo: TIPOS_TRABAJO[0], tipoTrabajoOtro: '',
        cuadrillas: [], estado: 'Proyectado', observaciones: '', postergado: false, motivoPostergacion: '', files: [], 
        progressLogs: [], dailyLogs: [], closureData: null, m2: '', presupuestoEstimado: '', ubicacion: '', contactoResponsable: ''
    });

    // Estados para Gestión Técnica
    const [uploadingEvidenceService, setUploadingEvidenceService] = useState(null);
    const [evidenceData, setEvidenceData] = useState({ comment: '', files: [] });
    const [loggingHoursService, setLoggingHoursService] = useState(null);
    const [dailyLogData, setDailyLogData] = useState({ date: new Date().toISOString().split('T')[0], start: '', end: '', type: 'Trabajo' });
    const [techsForHours, setTechsForHours] = useState([]);
    const [closingService, setClosingService] = useState(null);
    const [closureData, setClosureData] = useState({ status: 'Finalizado', reasonType: '', reason: '', observation: '', files: [] });
    const [reopeningService, setReopeningService] = useState(null);
    const [reopenReason, setReopenReason] = useState("");
    
    const [loggingExpenseService, setLoggingExpenseService] = useState(null);
    const [expenseData, setExpenseData] = useState({ amount: '', concept: '', files: [], fecha: new Date().toISOString().split('T')[0] });

    const [deletingId, setDeletingId] = useState(null);
    
    const [newCuadrillaName, setNewCuadrillaName] = useState("");
    const [newCuadrillaPhone, setNewCuadrillaPhone] = useState("");
    const [newCuadrillaEmail, setNewCuadrillaEmail] = useState("");
    const [newCuadrillaPassword, setNewCuadrillaPassword] = useState("");
    
    const resetForm = () => {
        setEditingId(null);
        setFormData({
            idProyecto: '', cliente: '', fSolicitud: new Date().toISOString().split('T')[0], fInicio: '', fFin: '', tipoTrabajo: TIPOS_TRABAJO[0], tipoTrabajoOtro: '',
            cuadrillas: [], estado: 'Proyectado', observaciones: '', postergado: false, motivoPostergacion: '', files: [], 
            progressLogs: [], dailyLogs: [], closureData: null, m2: '', presupuestoEstimado: '', ubicacion: '', contactoResponsable: ''
        });
    };

    const addCuadrilla = async () => {
        if (newCuadrillaName && !cuadrillasData.find(t => t.name === newCuadrillaName.toUpperCase())) {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'technicians'), { name: newCuadrillaName.toUpperCase(), phone: newCuadrillaPhone, email: newCuadrillaEmail, password: newCuadrillaPassword || "1234" });
            setNewCuadrillaName(""); setNewCuadrillaPhone(""); setNewCuadrillaEmail(""); setNewCuadrillaPassword(""); showNotification("Líder agregado");
        }
    };
    const removeCuadrilla = async (id, name) => { if(window.confirm(`¿Eliminar a ${name}?`)) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'technicians', id)); };
    const updateCuadrillaData = async (id, field, value) => { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'technicians', id), { [field]: value }); };

    const handleChangeAdminPassword = async () => {
        if (newAdminPasswordToChange.length < 6) { showNotification("La contraseña debe tener al menos 6 caracteres", "error"); return; }
        try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'admin_settings', 'config'), { password: newAdminPasswordToChange }, { merge: true }); showNotification("Contraseña actualizada"); setIsChangeAdminPasswordOpen(false); setNewAdminPasswordToChange(""); } 
        catch (e) { showNotification("Error al actualizar la contraseña", "error"); }
    };

    const handleEditCompra = (record) => {
        if(record === 'new') {
            setEditingCompraId(null);
            setCompraFormData({ material: '', categoria: 'Estructural y Albañilería', fechaLimite: new Date().toISOString().split('T')[0], estado: 'Pendiente', observaciones: '', liderAsignado: '' });
        } else {
            setEditingCompraId(record.id);
            setCompraFormData(record);
        }
        setIsCompraModalOpen(true);
    };

    const handleSaveCompra = async (e) => {
        e.preventDefault();
        if(!compraFormData.liderAsignado) { showNotification("Es obligatorio asignar un responsable (Líder de Cuadrilla).", "error"); return; }
        if (editingCompraId) { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'material_purchases', editingCompraId), compraFormData); showNotification("Planificación actualizada"); } 
        else { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'material_purchases'), compraFormData); showNotification("Material planificado"); }
        setIsCompraModalOpen(false);
    };

    const handleCompraStatusChange = async (id, newStatus) => {
        try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'material_purchases', id), { estado: newStatus }); showNotification(`Material movido a ${newStatus}`); } catch (e) {}
    };

    const handleDeleteCompra = async (id) => {
        if(window.confirm('¿Seguro que deseas eliminar esta planificación de compra?')) { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'material_purchases', id)); showNotification("Registro eliminado"); }
    };

    const handleEditObra = (service) => {
        if(service.id === 'new') {
            resetForm();
        } else { setEditingId(service.id); setFormData(service); }
        setIsSidebarOpen(true);
    };

    const handleSubmitObra = async (e) => {
        e.preventDefault();
        
        if (formData.tipoTrabajo === "Obra Nueva" && !formData.ubicacion) {
            showNotification("La ubicación es obligatoria para Obras Nuevas.", "error");
            return;
        }

        const serviceData = { 
            ...formData, 
            closureData: editingId ? (obras.find(s=>s.id===editingId)?.closureData || null) : null,
            progressLogs: editingId ? (obras.find(s=>s.id===editingId)?.progressLogs || []) : [],
            dailyLogs: editingId ? (obras.find(s=>s.id===editingId)?.dailyLogs || []) : []
        };
        if (editingId) { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'obras', editingId), serviceData); showNotification("Obra actualizada"); } 
        else { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'obras'), serviceData); showNotification("Obra registrada"); }
        setLastSavedObra(serviceData);
        if (!editingId || (editingId && !formData.postergado)) setShowMsgModal(true);
        setIsSidebarOpen(false);
    };

    const handleWhatsApp = (techName) => {
        if (!lastSavedObra) return;
        const tech = cuadrillasData.find(t => t.name === techName);
        if (!tech || !tech.phone) { showNotification(`Sin teléfono para ${techName}`, "error"); return; }
        const msg = `--- ASIGNACIÓN DE OBRA ---\nLÍDER: ${techName}\nPROYECTO: ${lastSavedObra.cliente} [${lastSavedObra.idProyecto}]\nFECHAS: ${formatDate(lastSavedObra.fInicio)} a ${formatDate(lastSavedObra.fFin)}\nTIPO: ${lastSavedObra.tipoTrabajo === 'Otro' && lastSavedObra.tipoTrabajoOtro ? lastSavedObra.tipoTrabajoOtro : lastSavedObra.tipoTrabajo}\n>> Coordinar ejecución.`;
        window.open(`https://wa.me/${tech.phone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const handleEmail = (techName) => {
        if (!lastSavedObra) return;
        const tech = cuadrillasData.find(t => t.name === techName);
        if (!tech || !tech.email) { showNotification(`Sin correo para ${techName}`, "error"); return; }
        const subject = encodeURIComponent(`Asignación de Proyecto: ${lastSavedObra.cliente}`);
        const body = encodeURIComponent(`Hola ${techName},\n\nSe te ha asignado una nueva obra/proyecto.\n\nCliente: ${lastSavedObra.cliente} [${lastSavedObra.idProyecto}]\nFechas: ${formatDate(lastSavedObra.fInicio)} al ${formatDate(lastSavedObra.fFin)}\nTarea: ${lastSavedObra.tipoTrabajo === 'Otro' && lastSavedObra.tipoTrabajoOtro ? lastSavedObra.tipoTrabajoOtro : lastSavedObra.tipoTrabajo}\n\nRevisa el panel de control.`);
        window.location.href = `mailto:${tech.email}?subject=${subject}&body=${body}`;
    };

    const handleStatusChange = async (serviceId, newStatus) => {
        const updateData = { estado: newStatus };
        if (newStatus === 'Proyectado') updateData.postergado = false;
        if (newStatus === 'En Ejecución' && obras.find(o=>o.id===serviceId)?.estado === 'Proyectado') {
             const srv = obras.find(o=>o.id===serviceId);
             const startLog = { id: Date.now(), date: new Date().toLocaleString(), comment: `🚀 OBRA EN EJECUCIÓN`, files: [] };
             updateData.progressLogs = [...(srv.progressLogs||[]), startLog];
        }
        try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'obras', serviceId), updateData); showNotification(`Movido a ${newStatus}`); } catch (e) { }
    };

    const handleTechEvidenceUpload = async () => { if (evidenceData.files.length === 0 && !evidenceData.comment.trim()) return; const newLog = { id: Date.now(), date: new Date().toLocaleString(), comment: evidenceData.comment, files: evidenceData.files }; const updatedLogs = [...(uploadingEvidenceService.progressLogs || []), newLog]; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'obras', uploadingEvidenceService.id), { progressLogs: updatedLogs }); setUploadingEvidenceService(null); showNotification("Avance subido"); };
    const handleLogHours = async () => { const newLog = { ...dailyLogData, id: Date.now(), workers: techsForHours }; const updatedLogs = [...(loggingHoursService.dailyLogs || []), newLog]; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'obras', loggingHoursService.id), { dailyLogs: updatedLogs }); setLoggingHoursService(null); showNotification("Horas registradas"); };
    
    const handleSaveExpenseCuadrilla = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'expenses'), {
                obraId: loggingExpenseService.id,
                obraName: loggingExpenseService.cliente,
                idProyecto: loggingExpenseService.idProyecto || 'S/N',
                cuadrilla: user.name,
                fecha: expenseData.fecha || new Date().toISOString().split('T')[0],
                concepto: expenseData.concept,
                monto: Number(expenseData.amount),
                comprobantes: expenseData.files,
                type: 'egreso'
            });
            setLoggingExpenseService(null);
            showNotification("Gasto rendido correctamente");
        } catch (error) {
            showNotification("Error al rendir gasto", "error");
        }
    };

    const handleStartService = async (service) => { const startLog = { id: Date.now(), date: new Date().toLocaleString(), comment: `🚀 OBRA INICIADA`, files: [] }; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'obras', service.id), { estado: 'En Ejecución', progressLogs: [...(service.progressLogs||[]), startLog] }); showNotification("Obra iniciada"); };
    const handleTechClosure = async () => { const closureInfo = { ...closureData, date: new Date().toISOString() }; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'obras', closingService.id), { estado: closureData.status === 'Finalizado' ? 'Finalizado' : 'Pausado', closureData: closureInfo }); setClosingService(null); showNotification("Estado de obra actualizado"); };
    const handleReopenService = async () => { const newLog = { id: Date.now(), date: new Date().toLocaleString(), comment: `🔄 REANUDACIÓN: ${reopenReason}`, files: [] }; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'obras', reopeningService.id), { estado: 'En Ejecución', progressLogs: [...(reopeningService.progressLogs||[]), newLog] }); setReopeningService(null); showNotification("Obra reanudada"); };
    
    const handleAddExpenseAdmin = async (newExp) => {
        try {
            let obraDetails = { obraName: 'Movimiento General', idProyecto: 'ADM' };
            if (newExp.obraId) {
                const found = obras.find(o => o.id === newExp.obraId);
                if(found) { obraDetails = { obraName: found.cliente, idProyecto: found.idProyecto }; }
            }
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'expenses'), {
                obraId: newExp.obraId || 'admin',
                obraName: obraDetails.obraName,
                idProyecto: obraDetails.idProyecto,
                cuadrilla: user.name, 
                fecha: newExp.fecha || new Date().toISOString().split('T')[0],
                concepto: newExp.concept,
                monto: Number(newExp.amount),
                comprobantes: newExp.files,
                type: newExp.type || 'egreso'
            });
            showNotification("Movimiento registrado con éxito");
        } catch (error) { showNotification("Error al registrar", "error"); }
    };
    
    const handleDeleteExpense = async (id) => {
        if(window.confirm('¿Seguro que deseas eliminar este registro de gasto?')) {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'expenses', id));
            showNotification("Gasto eliminado");
        }
    };

    const handleAddInventoryItem = async (item) => {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'inventory'), {
            name: item.name,
            category: item.category,
            stock: Number(item.stock),
            unit: item.unit
        });
        showNotification("Artículo agregado al inventario");
    };

    const handleUpdateInventoryStock = async (id, newStock) => {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'inventory', id), { stock: newStock });
    };

    const handleDelete = (id) => setDeletingId(id);
    const confirmDelete = async () => { if (deletingId) { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'obras', deletingId)); setDeletingId(null); showNotification("Registro eliminado permanentemente"); } };

    const todayStr = new Date().toISOString().split('T')[0];
    const overdueServices = obras.filter(s => s.estado !== 'Finalizado' && s.fFin < todayStr && s.tipoTrabajo !== 'Vacaciones');

    if (!user) return <LoginScreen onLogin={setUser} cuadrillasData={cuadrillasData}/>;

    const isAdmin = user.role === 'admin';

    const TABS = [
        {id:'map', label:'Satelital', icon:MapIcon},
        {id:'kanban', label:'Tablero', icon:Columns},
        {id:'gantt', label:'Cronograma', icon:Calendar},
        {id:'compras', label:'Compras', icon:ShoppingCart}, 
        {id:'finances', label:'Finanzas e Inventario', icon:Wallet}, 
        {id:'sheet', label:'Listado', icon:List},
        {id:'history', label:'Historial', icon:History},
        {id:'kpis', label:'Estadísticas', icon:BarChart2} 
    ];

    return (
        <div className="flex h-screen bg-transparent font-sans text-stone-800 overflow-hidden">
            <GlobalStyles />
            
            {isAdmin ? (
                <>
                    <div className="lg:hidden absolute top-0 left-0 w-full bg-white/90 backdrop-blur-md border-b border-stone-200 z-40 px-5 py-4 flex justify-between items-center shadow-sm">
                        <div className="flex items-center">
                            <div className="w-10 h-10 flex items-center justify-center mr-3 bg-white/50 rounded-sm p-1">
                                <img src="https://i.imgur.com/y6rOMKf.png" alt="Logo" className="w-full h-full object-contain"/>
                            </div>
                            <span className="font-black text-stone-800 text-sm tracking-wide uppercase">SOFIA PIATTI</span>
                        </div>
                        <button onClick={() => setIsSidebarOpen(true)} className="text-stone-800 p-2 border border-stone-200 hover:bg-stone-100 rounded-sm flex items-center transition-colors bg-white">
                            <Menu className="w-5 h-5 mr-1" /> <span className="text-xs font-bold uppercase tracking-wider">Menú</span>
                        </button>
                    </div>

                    <div className={`fixed inset-y-0 left-0 z-50 w-full lg:w-80 bg-white/95 backdrop-blur-md border-r border-stone-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shadow-2xl lg:shadow-none`}>
                        <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-stone-50/50">
                            <div className="flex items-center">
                                <div className="w-12 h-12 flex items-center justify-center mr-3 bg-white/50 rounded-sm p-1">
                                    <img src="https://i.imgur.com/y6rOMKf.png" alt="Logo" className="w-full h-full object-contain"/>
                                </div>
                                <div>
                                    <h2 className="text-sm font-black uppercase tracking-wider text-stone-800">SOFIA PIATTI</h2>
                                    <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">ARQUITECTURA</p>
                                </div>
                            </div>
                            <button onClick={()=>setIsSidebarOpen(false)} className="lg:hidden p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors bg-white"><X className="w-6 h-6"/></button>
                        </div>
                        
                        <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
                            <div className="mb-8 space-y-2">
                                <button onClick={() => setIsManageUsersOpen(true)} className="w-full flex items-center justify-between px-4 py-3 bg-white border border-stone-200 rounded-sm hover:border-stone-400 text-xs uppercase tracking-wide font-bold transition-all shadow-sm">
                                    <span className="flex items-center"><Users className="w-4 h-4 mr-2 text-stone-500"/> Líderes de Cuadrilla</span><ChevronRight className="w-4 h-4 text-stone-400"/>
                                </button>
                                <button onClick={() => setIsChangeAdminPasswordOpen(true)} className="w-full flex items-center justify-between px-4 py-3 bg-white border border-stone-200 rounded-sm hover:border-stone-400 text-xs uppercase tracking-wide font-bold transition-all shadow-sm">
                                    <span className="flex items-center"><Key className="w-4 h-4 mr-2 text-stone-500"/> Clave de Dirección</span><ChevronRight className="w-4 h-4 text-stone-400"/>
                                </button>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[11px] font-black text-stone-400 uppercase tracking-widest border-b border-stone-200 pb-1 w-full flex items-center"><Home className="w-3.5 h-3.5 mr-1.5"/> Nueva Obra / Proyecto</p>
                            </div>
                            
                            <form onSubmit={handleSubmitObra} className="space-y-5">
                                {editingId && (<div className="bg-amber-50 p-3 rounded-sm border border-amber-200 text-xs flex justify-between items-center shadow-sm"><span className="font-bold text-amber-800 uppercase tracking-wide">✏️ Modo Edición</span><button type="button" onClick={resetForm} className="text-[10px] font-bold bg-white border border-amber-200 px-2 py-1 rounded-sm text-stone-600 hover:text-stone-800">Cancelar</button></div>)}
                                
                                <div className="form-group">
                                    <label className="text-[10px] font-bold text-stone-500 mb-1.5 block uppercase tracking-wider">Tipología</label>
                                    <select className="input-field shadow-sm" value={formData.tipoTrabajo} onChange={e=>{
                                        const v = e.target.value; 
                                        const isAbsence = v === 'Vacaciones';
                                        setFormData(p=>({...p, tipoTrabajo: v, cliente: isAbsence?'AUSENCIA INTERNA':p.cliente, idProyecto: isAbsence?v.toUpperCase():p.idProyecto}));
                                    }}>{TIPOS_TRABAJO.map(t=><option key={t} value={t}>{t}</option>)}</select>
                                    {formData.tipoTrabajo === 'Otro' && (
                                        <input type="text" className="input-field mt-2 text-xs animate-in fade-in" placeholder="Especifique..." value={formData.tipoTrabajoOtro || ''} onChange={e=>setFormData({...formData, tipoTrabajoOtro: e.target.value})} />
                                    )}
                                </div>
                                
                                {formData.tipoTrabajo !== 'Vacaciones' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="form-group">
                                            <label className="text-[10px] font-bold text-stone-500 mb-1.5 block uppercase tracking-wider">ID Proyecto</label>
                                            <input className="input-field font-mono uppercase shadow-sm" value={formData.idProyecto} onChange={e=>setFormData({...formData, idProyecto:e.target.value.toUpperCase()})} placeholder="EJ: PRJ-01"/>
                                        </div>
                                        <div className="form-group">
                                            <label className="text-[10px] font-bold text-stone-500 mb-1.5 block uppercase tracking-wider">Cliente / Comitente</label>
                                            <input className="input-field uppercase shadow-sm" value={formData.cliente} onChange={e=>setFormData({...formData, cliente:e.target.value.toUpperCase()})} placeholder="Nombre / Empresa"/>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="form-group"><label className="text-[10px] font-bold text-stone-500 mb-1.5 block uppercase tracking-wider">Fecha de Inicio</label><input type="date" className="input-field shadow-sm text-xs" value={formData.fInicio} onChange={e=>setFormData({...formData, fInicio:e.target.value})}/></div>
                                    <div className="form-group"><label className="text-[10px] font-bold text-stone-500 mb-1.5 block uppercase tracking-wider">Fecha Fin Estimada</label><input type="date" className="input-field shadow-sm text-xs" value={formData.fFin} onChange={e=>setFormData({...formData, fFin:e.target.value})}/></div>
                                </div>
                                
                                <div className="form-group">
                                    <label className="text-[10px] font-bold text-stone-500 mb-1.5 block uppercase tracking-wider">Cuadrillas / Personal Asignado</label>
                                    <div className="max-h-32 overflow-y-auto border border-stone-200 rounded-sm p-2 bg-white/50 shadow-inner">
                                        {cuadrillasData.map(t=>(<label key={t.id} className={`flex items-center space-x-2 p-1.5 rounded-sm cursor-pointer transition-colors ${formData.cuadrillas.includes(t.name)?'bg-stone-200 font-bold text-stone-800':'hover:bg-white'}`}><input type="checkbox" checked={formData.cuadrillas.includes(t.name)} onChange={()=>{const newTechs = formData.cuadrillas.includes(t.name) ? formData.cuadrillas.filter(n=>n!==t.name) : [...formData.cuadrillas, t.name]; setFormData({...formData, cuadrillas: newTechs});}} className="accent-stone-800 w-3.5 h-3.5"/><span className="text-[11px] uppercase tracking-wide">{t.name}</span></label>))}
                                    </div>
                                </div>

                                {formData.tipoTrabajo !== 'Vacaciones' && (
                                    <div className="bg-stone-50/80 p-4 rounded-sm border border-stone-200 shadow-sm group transition-colors animate-in fade-in">
                                        <label className="text-[10px] font-bold text-stone-800 uppercase tracking-widest block mb-4 flex items-center border-b border-stone-200 pb-2"><Ruler className="w-3.5 h-3.5 mr-1.5"/> Detalles Técnicos y Ubicación</label>
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <div>
                                                <label className="text-[9px] font-bold text-stone-500 block mb-1 uppercase">Superficie (m²)</label>
                                                <input type="number" placeholder="Ej: 150" className="input-field text-xs bg-white" value={formData.m2} onChange={e=>setFormData({...formData, m2:e.target.value})} />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-bold text-stone-500 block mb-1 uppercase">Presupuesto ($)</label>
                                                <input type="number" placeholder="Estimado" className="input-field text-xs bg-white" value={formData.presupuestoEstimado} onChange={e=>setFormData({...formData, presupuestoEstimado:e.target.value})} />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="text-[9px] font-bold text-stone-500 block mb-1 uppercase">Ubicación de la Obra</label>
                                            <input type="text" placeholder="Ej: Bv. Sarmiento 123, Villa María o -32.40, -63.24" className="input-field text-xs bg-white w-full" value={formData.ubicacion} onChange={e=>setFormData({...formData, ubicacion:e.target.value})} />
                                            <p className="text-[9px] text-stone-400 mt-1 leading-tight font-medium">Ingresa la dirección exacta o coord (-32.40, -63.24) para mayor precisión.</p>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-bold text-stone-500 block mb-1 uppercase">Contacto Responsable en Sitio</label>
                                            <input type="text" placeholder="Ej: Juan Perez - 3512..." className="input-field text-xs bg-white w-full" value={formData.contactoResponsable} onChange={e=>setFormData({...formData, contactoResponsable:e.target.value})} />
                                        </div>
                                    </div>
                                )}
                                
                                <div className="form-group">
                                    <label className="text-[10px] font-bold text-stone-500 mb-1.5 block uppercase tracking-wider">Observaciones Generales</label>
                                    <textarea className="input-field h-24 resize-none text-xs shadow-sm bg-white" placeholder="Detalles del alcance de la obra, requerimientos especiales..." value={formData.observaciones} onChange={e=>setFormData({...formData, observaciones:e.target.value})} />
                                </div>

                                <button className="w-full bg-stone-800 text-white py-3.5 rounded-sm font-black uppercase tracking-wider shadow-md hover:bg-stone-700 active:scale-95 transition-all mt-2 flex items-center justify-center">
                                    <Save className="w-4 h-4 mr-2"/> {editingId ? 'Actualizar Obra' : 'Registrar Obra'}
                                </button>
                            </form>
                        </div>
                        
                        <div className="p-4 border-t border-stone-200 bg-stone-100/80 mt-auto">
                            <div className="flex items-center justify-between mb-3 px-2">
                                <div className="flex items-center text-xs font-bold text-stone-600 uppercase tracking-wide"><div className="w-2 h-2 rounded-full bg-green-500 mr-2 shadow-sm shadow-green-200"></div>{user.name}</div>
                                <span className="text-[9px] font-bold text-stone-400 bg-stone-200 px-2 py-0.5 rounded-sm uppercase">Dir</span>
                            </div>
                            <button onClick={()=>setUser(null)} className="flex items-center justify-center w-full py-2 text-stone-500 hover:text-red-600 hover:bg-red-50 font-bold transition-colors rounded-sm text-xs uppercase tracking-wider border border-transparent hover:border-red-200 bg-white"><LogOut className="w-3.5 h-3.5 mr-2"/> Cerrar Sesión</button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col overflow-hidden relative z-10 pt-[68px] lg:pt-0 bg-transparent">
                        <header className="bg-white/95 backdrop-blur-md border-b border-stone-200 px-6 py-3 flex flex-col md:flex-row justify-between items-center shadow-sm gap-4">
                            <h1 className="text-xl font-black text-stone-800 tracking-tight hidden md:block uppercase">DIRECCIÓN GENERAL - SOFIA PIATTI</h1>
                            
                            <div className="flex bg-stone-50/80 p-1.5 rounded-sm border border-stone-200 overflow-x-auto max-w-full custom-scrollbar">
                                {TABS.map(tab=>(
                                    <button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={`flex items-center px-4 py-2 rounded-sm text-[11px] uppercase tracking-wider font-bold whitespace-nowrap transition-all ${activeTab===tab.id?'bg-white text-stone-800 shadow-sm border border-stone-200':'text-stone-500 hover:text-stone-800 hover:bg-white border border-transparent'}`}>
                                        <tab.icon className="w-3.5 h-3.5 mr-2"/> {tab.label}
                                    </button>
                                ))}
                            </div>
                        </header>

                        <main className="flex-1 overflow-auto p-4 md:p-6 custom-scrollbar relative">
                            {notification && <div className={`fixed top-20 right-8 px-6 py-3 rounded-sm shadow-lg z-50 animate-in fade-in text-white font-bold text-xs uppercase tracking-wide flex items-center border ${notification.type==='error'?'bg-red-600 border-red-800':'bg-stone-800 border-stone-900'}`}>{notification.msg}</div>}
                            
                            {overdueServices.length > 0 && (
                                <div className="mb-6 animate-in fade-in slide-in-from-top-4 max-w-7xl mx-auto">
                                    <div className="bg-amber-50 border-l-4 border-amber-600 text-amber-800 px-5 py-4 rounded-sm flex items-center shadow-sm">
                                        <AlertTriangle className="w-5 h-5 mr-3 text-amber-600 shrink-0"/>
                                        <span className="text-xs font-semibold">Alerta: Hay <b>{overdueServices.length} obra(s)</b> con fecha de finalización superada que siguen sin marcarse como "Finalizado".</span>
                                    </div>
                                </div>
                            )}

                            <div className="max-w-[1400px] mx-auto h-full">
                                {activeTab === 'map' && <MapDashboard obras={obras} />}
                                {activeTab === 'kanban' && <KanbanBoard obras={obras} comprasMateriales={comprasData} onStatusChange={handleStatusChange} onCompraStatusChange={handleCompraStatusChange} handleEditObra={handleEditObra} handleEditCompra={handleEditCompra}/>}
                                {activeTab === 'gantt' && <GanttChart obras={obras} mode="operations" handleEdit={handleEditObra} isAdmin={isAdmin}/>}
                                {activeTab === 'sheet' && <ObrasSheet sortedServices={obras} mode="operations" handleEdit={handleEditObra} handleDelete={handleDelete}/>}
                                {activeTab === 'finances' && <FinanzasInventario obras={obras} expenses={expensesData} inventory={inventoryData} handleAddExpenseAdmin={handleAddExpenseAdmin} handleAddInventoryItem={handleAddInventoryItem} handleUpdateInventoryStock={handleUpdateInventoryStock} handleDeleteExpense={handleDeleteExpense} />}

                                {activeTab === 'compras' && (
                                    <div className="space-y-6">
                                        <div className="bg-white p-5 rounded-md border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                                            <div>
                                                <h3 className="font-black text-stone-800 text-lg flex items-center uppercase tracking-wide"><ShoppingCart className="w-5 h-5 mr-2 text-stone-600"/> Planificación de Insumos</h3>
                                                <p className="text-xs text-stone-500 font-medium">Control y seguimiento de compra de materiales para obras.</p>
                                            </div>
                                            <button onClick={() => handleEditCompra('new')} className="bg-stone-800 text-white px-5 py-2.5 rounded-sm font-bold uppercase tracking-wider flex items-center hover:bg-stone-700 shadow-md active:scale-95 text-xs transition-colors"><Plus className="w-4 h-4 mr-2"/> Requerir Material</button>
                                        </div>
                                        <GanttChart comprasMateriales={comprasData} mode="compras" handleEdit={handleEditCompra} isAdmin={isAdmin}/>
                                        <div className="bg-white rounded-md shadow-sm border border-stone-200 overflow-hidden">
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-stone-200 text-sm">
                                                    <thead className="bg-stone-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left font-bold text-stone-600 uppercase tracking-wider text-[10px]">Categoría / Material</th>
                                                            <th className="px-6 py-3 text-left font-bold text-stone-600 uppercase tracking-wider text-[10px]">Fecha Límite</th>
                                                            <th className="px-6 py-3 text-left font-bold text-stone-600 uppercase tracking-wider text-[10px]">Líder Asignado</th>
                                                            <th className="px-6 py-3 text-left font-bold text-stone-600 uppercase tracking-wider text-[10px]">Estado</th>
                                                            <th className="px-6 py-3 text-right font-bold text-stone-600 uppercase tracking-wider text-[10px]">Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-stone-100 bg-white">
                                                        {comprasData.sort((a,b)=>new Date(a.fechaLimite)-new Date(b.fechaLimite)).map(r => (
                                                            <tr key={r.id} className="hover:bg-stone-50 transition-colors group">
                                                                <td className="px-6 py-4">
                                                                    <div className="text-[10px] font-bold text-stone-500 uppercase mb-1">{r.categoria}</div>
                                                                    <div className="font-bold text-stone-800 text-sm">{r.material}</div>
                                                                </td>
                                                                <td className="px-6 py-4 text-stone-600 font-medium text-xs"><Calendar className="w-3.5 h-3.5 inline mr-1 text-stone-400"/> {formatDate(r.fechaLimite)}</td>
                                                                <td className="px-6 py-4 text-stone-600 font-bold text-xs uppercase"><UserCheck className="w-3.5 h-3.5 inline mr-1 text-amber-700"/> {r.liderAsignado}</td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold border uppercase tracking-wider ${r.estado === 'Comprado' ? 'bg-green-50 border-green-200 text-green-800' : r.estado === 'En Proceso' ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-stone-100 border-stone-300 text-stone-800'}`}>{r.estado}</span>
                                                                </td>
                                                                <td className="px-6 py-4 text-right whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button onClick={() => handleEditCompra(r)} className="text-stone-500 hover:text-amber-700 mx-1 p-1 hover:bg-amber-50 rounded-sm transition-colors"><Edit2 className="w-4 h-4"/></button>
                                                                    <button onClick={() => handleDeleteCompra(r.id)} className="text-stone-400 hover:text-red-600 mx-1 p-1 hover:bg-red-50 rounded-sm transition-colors"><Trash2 className="w-4 h-4"/></button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {comprasData.length === 0 && <tr><td colSpan="5" className="text-center py-10 text-stone-500 font-medium text-xs">No hay materiales en proceso de compra.</td></tr>}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'history' && <HistorialObras obras={obras} expenses={expensesData} />}
                                {activeTab === 'kpis' && <KPIs obras={obras} comprasMateriales={comprasData} />}
                            </div>
                        </main>

                        <button 
                            onClick={() => { resetForm(); setIsSidebarOpen(true); }}
                            className="lg:hidden fixed bottom-6 right-6 z-30 bg-stone-800 text-white p-4 rounded-full shadow-xl shadow-stone-400 hover:bg-stone-700 active:scale-95 transition-all"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col overflow-hidden relative z-10 bg-transparent">
                    <header className="bg-white/95 backdrop-blur-md border-b border-stone-200 px-6 py-4 flex justify-between items-center shadow-sm">
                        <div className="flex items-center">
                            <div className="w-10 h-10 flex items-center justify-center mr-3 bg-white/50 rounded-sm p-1">
                                <img src="https://i.imgur.com/QnaCoeH.png" alt="Logo" className="w-full h-full object-contain"/>
                            </div>
                            <span className="font-black text-stone-800 text-sm tracking-wide uppercase">SOFIA PIATTI - ARQUITECTURA</span>
                        </div>
                        <button onClick={()=>setUser(null)} className="flex items-center text-stone-500 hover:text-red-600 font-bold transition-colors text-[10px] uppercase tracking-wider bg-white px-3 py-2 rounded-sm"><LogOut className="w-4 h-4 mr-2"/> Salir</button>
                    </header>
                    
                    <main className="flex-1 overflow-auto p-4 md:p-6 custom-scrollbar relative">
                        {notification && <div className={`fixed top-20 right-8 px-6 py-3 rounded-sm shadow-lg z-50 animate-in fade-in text-white font-bold text-xs uppercase tracking-wide flex items-center border ${notification.type==='error'?'bg-red-600 border-red-800':'bg-stone-800 border-stone-900'}`}>{notification.msg}</div>}
                        
                        <CuadrillaPortal 
                            obras={obras} 
                            user={user} 
                            handleStartService={handleStartService} 
                            setUploadingEvidenceService={setUploadingEvidenceService} 
                            setEvidenceData={setEvidenceData} 
                            setLoggingHoursService={setLoggingHoursService} 
                            setDailyLogData={setDailyLogData} 
                            setTechsForHours={setTechsForHours} 
                            setClosingService={setClosingService} 
                            setClosureData={setClosureData} 
                            setReopeningService={setReopeningService} 
                            setReopenReason={setReopenReason} 
                            setLoggingExpenseService={setLoggingExpenseService}
                            setExpenseData={setExpenseData}
                        />
                    </main>
                </div>
            )}

            <Modal isOpen={isManageUsersOpen} onClose={()=>setIsManageUsersOpen(false)} title="Gestión de Personal" size="md">
                <div className="space-y-6 animate-in fade-in">
                    <div className="bg-stone-50 p-5 rounded-sm border border-stone-200 flex flex-col gap-3">
                        <label className="text-[10px] font-bold text-stone-800 uppercase tracking-widest flex items-center border-b border-stone-200 pb-2 mb-1"><UserPlus className="w-3.5 h-3.5 mr-1.5"/> Nuevo Líder de Cuadrilla</label>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-[9px] font-bold text-stone-500 uppercase mb-1 block">Nombre</label><input className="input-field bg-white text-xs shadow-sm" placeholder="Apellido, Nombre" value={newCuadrillaName} onChange={e=>setNewCuadrillaName(e.target.value.toUpperCase())} /></div>
                            <div><label className="text-[9px] font-bold text-stone-500 uppercase mb-1 block">Teléfono</label><input className="input-field bg-white text-xs shadow-sm" placeholder="Ej: 351..." value={newCuadrillaPhone} onChange={e=>setNewCuadrillaPhone(e.target.value)} /></div>
                            <div><label className="text-[9px] font-bold text-stone-500 uppercase mb-1 block">Correo Electrónico</label><input type="email" className="input-field bg-white text-xs shadow-sm" placeholder="Email" value={newCuadrillaEmail} onChange={e=>setNewCuadrillaEmail(e.target.value)} /></div>
                            <div><label className="text-[9px] font-bold text-stone-500 uppercase mb-1 block">Clave Acceso</label><input className="input-field bg-white text-xs shadow-sm" placeholder="Clave" value={newCuadrillaPassword} onChange={e=>setNewCuadrillaPassword(e.target.value)} /></div>
                        </div>
                        <button onClick={addCuadrilla} className="bg-stone-800 text-white w-full py-2.5 rounded-sm font-bold uppercase tracking-wider text-[10px] hover:bg-stone-700 active:scale-95 shadow-md flex items-center justify-center mt-1"><Plus className="w-3 h-3 mr-1"/> Agregar Cuadrilla</button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
                        {cuadrillasData.sort((a,b)=>a.name.localeCompare(b.name)).map(t=>(
                            <div key={t.id} className="p-4 border border-stone-200 rounded-sm bg-white shadow-sm hover:border-stone-400 transition-all group">
                                <div className="flex justify-between items-center mb-3 border-b border-stone-100 pb-2"><span className="font-black text-xs text-stone-800 uppercase tracking-wide">{t.name}</span><button onClick={() => removeCuadrilla(t.id, t.name)} className="text-stone-300 hover:text-red-600 transition-colors bg-white"><Trash2 className="w-4 h-4" /></button></div>
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" /><input type="text" value={t.phone || ''} onChange={(e) => updateCuadrillaData(t.id, 'phone', e.target.value)} className="text-xs font-medium w-full bg-stone-50 border border-transparent rounded-sm hover:border-stone-300 focus:border-stone-400 p-1.5 outline-none transition-colors" placeholder="Teléfono" /></div>
                                    <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" /><input type="email" value={t.email || ''} onChange={(e) => updateCuadrillaData(t.id, 'email', e.target.value)} className="text-xs font-medium w-full bg-stone-50 border border-transparent rounded-sm hover:border-stone-300 focus:border-stone-400 p-1.5 outline-none transition-colors" placeholder="Correo" /></div>
                                    <div className="flex items-center gap-2"><Key className="w-3.5 h-3.5 text-stone-400 shrink-0" /><input type="text" value={t.password || ''} onChange={(e) => updateCuadrillaData(t.id, 'password', e.target.value)} className="text-[10px] font-bold w-full bg-stone-50 border border-transparent rounded-sm hover:border-stone-300 focus:border-stone-400 p-1.5 outline-none font-mono text-stone-700 transition-colors uppercase tracking-wider" placeholder="Contraseña" /></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isChangeAdminPasswordOpen} onClose={()=>setIsChangeAdminPasswordOpen(false)} title="Clave de Dirección">
                <div className="space-y-5">
                    <p className="text-xs font-medium text-stone-600">Cambiar la contraseña maestra (Admin) afectará a todos los directivos. Asegúrese de comunicarlo.</p>
                    <div>
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">Nueva Contraseña</label>
                        <input type="text" className="input-field font-mono shadow-sm" placeholder="Mín. 6 caracteres" value={newAdminPasswordToChange} onChange={e => setNewAdminPasswordToChange(e.target.value)}/>
                    </div>
                    <button onClick={handleChangeAdminPassword} className="w-full bg-stone-800 text-white py-3.5 rounded-sm font-black hover:bg-stone-700 transition-colors shadow-md uppercase tracking-wider text-xs">Actualizar Clave</button>
                </div>
            </Modal>

            <Modal isOpen={showMsgModal} onClose={()=>setShowMsgModal(false)} title="📢 Notificar a Cuadrilla">
                 <div className="grid gap-3">
                     {lastSavedObra?.cuadrillas.length > 0 ? (
                         lastSavedObra.cuadrillas.map(t => (
                             <div key={t} className="flex flex-col bg-stone-50 border border-stone-200 p-4 rounded-sm hover:border-stone-400 transition-all">
                                 <div className="flex items-center mb-3"><div className="w-8 h-8 rounded-sm bg-stone-200 flex items-center justify-center mr-3 text-stone-600 font-bold">{t.charAt(0)}</div><span className="font-bold text-stone-800 uppercase text-xs tracking-wide">{t}</span></div>
                                 <div className="flex gap-2">
                                     <button onClick={()=>handleWhatsApp(t)} className="flex-1 text-emerald-700 flex items-center justify-center text-[10px] font-bold bg-white border border-emerald-200 px-3 py-2.5 rounded-sm hover:bg-emerald-700 hover:text-white transition-colors uppercase tracking-widest"><MessageCircle className="w-3.5 h-3.5 mr-1.5"/> WhatsApp</button>
                                     <button onClick={()=>handleEmail(t)} className="flex-1 text-stone-700 flex items-center justify-center text-[10px] font-bold bg-white border border-stone-200 px-3 py-2.5 rounded-sm hover:bg-stone-700 hover:text-white transition-colors uppercase tracking-widest"><Mail className="w-3.5 h-3.5 mr-1.5"/> Correo</button>
                                 </div>
                             </div>
                         ))
                     ) : (<p className="text-center text-stone-500 font-medium text-xs py-4 border border-dashed border-stone-300 rounded-sm bg-stone-50">No hay cuadrillas asignadas para notificar.</p>)}
                 </div>
            </Modal>

            <Modal isOpen={!!uploadingEvidenceService} onClose={()=>setUploadingEvidenceService(null)} title="Registrar Avance / Novedad">
                <div className="space-y-5">
                    <div>
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">Comentarios del Avance</label>
                        <textarea className="input-field h-24 text-xs shadow-sm" placeholder="Ej: Se finalizó el contrapiso, hubo demoras por lluvia..." value={evidenceData.comment} onChange={e=>setEvidenceData({...evidenceData, comment:e.target.value})}/>
                    </div>
                    <FileUploader files={evidenceData.files} setFiles={(f)=>setEvidenceData({...evidenceData, files:f})} label="FOTOS / DOCUMENTOS PLANOS"/>
                    <button onClick={handleTechEvidenceUpload} className="w-full bg-stone-800 text-white py-3.5 rounded-sm font-black uppercase tracking-wider text-xs shadow-md hover:bg-stone-700">Guardar Avance</button>
                </div>
            </Modal>

            <Modal isOpen={!!loggingHoursService} onClose={()=>setLoggingHoursService(null)} title="Cargar Horas Hombre">
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">Fecha</label>
                        <input type="date" className="input-field text-xs shadow-sm" value={dailyLogData.date} onChange={e=>setDailyLogData({...dailyLogData, date:e.target.value})}/>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">Tipo de Tarea</label>
                        <select className="input-field text-xs shadow-sm" value={dailyLogData.type} onChange={e=>setDailyLogData({...dailyLogData, type:e.target.value})}>
                            <option value="Trabajo">Trabajo Efectivo en Obra</option>
                            <option value="Viaje">Traslados / Viaje</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">Hora Inicio</label><input type="time" className="input-field text-xs shadow-sm" value={dailyLogData.start} onChange={e=>setDailyLogData({...dailyLogData, start:e.target.value})}/></div>
                        <div><label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">Hora Fin</label><input type="time" className="input-field text-xs shadow-sm" value={dailyLogData.end} onChange={e=>setDailyLogData({...dailyLogData, end:e.target.value})}/></div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">Cuadrillas Involucradas</label>
                        <div className="max-h-24 overflow-y-auto border border-stone-200 rounded-sm p-2 bg-stone-50 shadow-inner">
                            {loggingHoursService?.cuadrillas.map(t=>(
                                <label key={t} className="flex items-center space-x-2 py-1"><input type="checkbox" checked={techsForHours.includes(t)} onChange={()=>setTechsForHours(prev=>prev.includes(t)?prev.filter(x=>x!==t):[...prev,t])} className="accent-stone-800"/><span className="text-xs uppercase tracking-wide font-medium">{t}</span></label>
                            ))}
                            {(!loggingHoursService?.cuadrillas || loggingHoursService.cuadrillas.length === 0) && <span className="text-[10px] text-stone-400 font-medium">Obra sin personal asignado.</span>}
                        </div>
                    </div>
                    <button onClick={handleLogHours} className="w-full bg-stone-800 text-white py-3.5 rounded-sm font-black uppercase tracking-wider text-xs shadow-md hover:bg-stone-700 mt-2">Registrar HH</button>
                </div>
            </Modal>
            
            <Modal isOpen={!!loggingExpenseService} onClose={()=>setLoggingExpenseService(null)} title="Rendir Gasto Extra">
                <form onSubmit={handleSaveExpenseCuadrilla} className="space-y-4">
                    <p className="text-[10px] text-stone-500 uppercase tracking-wider font-bold mb-4 bg-stone-100 p-2 rounded-sm border border-stone-200">
                        Obra: {loggingExpenseService?.cliente} [{loggingExpenseService?.idProyecto}]
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">Fecha <span className="text-red-500">*</span></label>
                            <input type="date" className="input-field text-xs shadow-sm" value={expenseData.fecha} onChange={e=>setExpenseData({...expenseData, fecha:e.target.value})} required/>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">Monto Gastado ($) <span className="text-red-500">*</span></label>
                            <input type="number" className="input-field text-lg font-black text-amber-700 shadow-sm" placeholder="0.00" value={expenseData.amount} onChange={e=>setExpenseData({...expenseData, amount:e.target.value})} required/>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">Concepto / Detalle <span className="text-red-500">*</span></label>
                        <textarea className="input-field text-xs shadow-sm h-16 resize-none" placeholder="Ej: Compra de clavos, viáticos, flete..." value={expenseData.concept} onChange={e=>setExpenseData({...expenseData, concept:e.target.value})} required/>
                    </div>
                    <FileUploader files={expenseData.files} setFiles={(f)=>setExpenseData({...expenseData, files:f})} label="TICKET / FACTURA"/>
                    <button type="submit" className="w-full bg-amber-700 text-white py-3.5 rounded-sm font-black uppercase tracking-wider text-xs shadow-md hover:bg-amber-800 mt-2">Rendir Gasto</button>
                </form>
            </Modal>

            <Modal isOpen={!!closingService} onClose={()=>setClosingService(null)} title="Actualizar Estado (Cierre / Pausa)">
                <div className="space-y-5">
                    <div className="flex gap-3">
                        <button onClick={()=>setClosureData({...closureData, status:'Finalizado'})} className={`flex-1 py-3 border rounded-sm font-bold uppercase tracking-wider text-[10px] transition-all ${closureData.status==='Finalizado'?'bg-green-50 border-green-500 text-green-800 shadow-sm':'bg-white text-stone-500 hover:bg-stone-50'}`}>Obra Finalizada</button>
                        <button onClick={()=>setClosureData({...closureData, status:'No Finalizado'})} className={`flex-1 py-3 border rounded-sm font-bold uppercase tracking-wider text-[10px] transition-all ${closureData.status==='No Finalizado'?'bg-red-50 border-red-500 text-red-800 shadow-sm':'bg-white text-stone-500 hover:bg-stone-50'}`}>Pausar Obra</button>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">Observaciones de Cierre/Pausa</label>
                        <textarea className="input-field h-24 text-xs shadow-sm" placeholder="Resumen del trabajo realizado..." value={closureData.observation} onChange={e=>setClosureData({...closureData, observation:e.target.value})}/>
                    </div>
                    {closureData.status === 'No Finalizado' && (
                        <div className="space-y-4 bg-stone-50 p-4 border border-stone-200 rounded-sm animate-in slide-in-from-top-2">
                            <div>
                                <label className="block text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Motivo de Pausa / Interrupción</label>
                                <select className="input-field border-red-200 focus:border-red-500 text-xs shadow-sm" value={closureData.reasonType} onChange={e => setClosureData({...closureData, reasonType: e.target.value, reason: e.target.value === 'Otros' ? '' : e.target.value})}>
                                    <option value="">Seleccione un motivo...</option><option value="Falta de Materiales">Falta de Materiales</option><option value="Problemas Climáticos">Problemas Climáticos</option><option value="Pagos Atrasados">Falta de Pagos del Comitente</option><option value="Modificación de Planos">Modificación de Proyecto/Planos</option><option value="Otros">Otros (Especificar)</option>
                                </select>
                            </div>
                            {closureData.reasonType === 'Otros' && (
                                <input className="input-field border-red-200 focus:border-red-500 text-xs shadow-sm animate-in fade-in" placeholder="Especifique el motivo..." value={closureData.reason} onChange={e=>setClosureData({...closureData, reason:e.target.value})}/>
                            )}
                        </div>
                    )}
                    <FileUploader files={closureData.files} setFiles={(f)=>setClosureData({...closureData, files:f})} label="ACTAS DE CONFORMIDAD / PLANOS AS-BUILT"/>
                    <button onClick={handleTechClosure} className="w-full bg-stone-800 text-white py-3.5 rounded-sm font-black uppercase tracking-wider text-xs shadow-md hover:bg-stone-700">Confirmar Estado</button>
                </div>
            </Modal>

            <Modal isOpen={!!reopeningService} onClose={()=>setReopeningService(null)} title="Reanudar Obra">
                <div className="space-y-5">
                    <p className="text-[11px] font-bold uppercase tracking-wide bg-amber-50 p-3 rounded-sm text-amber-800 border border-amber-200 shadow-sm flex items-center"><RotateCcw className="w-4 h-4 mr-2 shrink-0"/> La obra volverá a estado "En Ejecución".</p>
                    <div>
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">Motivo o Novedad de Reanudación</label>
                        <textarea className="input-field h-24 text-xs shadow-sm" placeholder="Ingresaron materiales, se aprobó el plano..." value={reopenReason} onChange={e=>setReopenReason(e.target.value)}/>
                    </div>
                    <button onClick={handleReopenService} className="w-full bg-stone-800 text-white py-3.5 rounded-sm font-black uppercase tracking-wider text-xs shadow-md hover:bg-stone-700 mt-2">Reanudar</button>
                </div>
            </Modal>

            <Modal isOpen={!!deletingId} onClose={()=>setDeletingId(null)} title="Eliminar Registro Permanente">
                <div className="text-center p-6">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4"/>
                    <p className="mb-6 font-bold text-stone-700 text-sm">Esta acción es irreversible.<br/>¿Seguro deseas eliminar esta obra y todo su historial?</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={()=>setDeletingId(null)} className="px-6 py-3 bg-stone-100 rounded-sm font-bold text-stone-600 hover:bg-stone-200 transition-colors uppercase tracking-wider text-xs shadow-sm">Cancelar</button>
                        <button onClick={confirmDelete} className="px-6 py-3 bg-red-600 text-white rounded-sm font-bold hover:bg-red-700 transition-colors uppercase tracking-wider text-xs shadow-md">Sí, Eliminar</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}