import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Calendar, Truck, AlertTriangle, CheckCircle, BarChart2, Table, 
  Trash2, Plus, X, Search, Edit2, LogOut, Menu, Copy, MessageCircle, Settings, 
  Phone, Lock, UserPlus, ExternalLink, Paperclip, FileText, Image as ImageIcon, 
  History, Eye, Save, XCircle, CheckSquare, List, MapPin, PlayCircle, Clock, Activity,
  Briefcase, ChevronRight, Globe, Map, Filter, TrendingUp, UserCheck, CalendarPlus,
  Zap, Users, Target, Info, HelpCircle, Key, FileCheck, Timer, FolderOpen, AlertOctagon, Cloud,
  ShieldCheck, Loader, RotateCcw, LayoutList, Palmtree, ArrowUpDown, UserX, QrCode, Wifi, WifiOff, RefreshCw, Navigation, Layers, ChevronDown
} from 'lucide-react';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';

// --- IMPORTACIONES DE FIREBASE ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, getDoc, setDoc, query, where, enableIndexedDbPersistence } from 'firebase/firestore';

// --- ☁️ CONFIGURACIÓN DE FIREBASE SEGURA ---
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

// --- HABILITAR PERSISTENCIA OFFLINE ---
try {
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition' || err.code === 'unimplemented') {
            console.log('Persistencia no disponible:', err.code);
        }
    });
} catch (e) {
    // Persistencia ya habilitada
}

// --- CONFIGURACIÓN DE IMÁGENES ---
const BACKGROUND_IMAGE = "https://i.imgur.com/EfUXRhd.png"; 
const COMPANY_LOGO = "https://imgur.com/tH8Cu4p.png"; 
const NPS_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSelB7HDV2efUR4Wz3xohZqp1U9EXSx9LVpu0GN0WDXxMdIX6w/viewform";

// --- CONSTANTES ---
const TIPOS_TRABAJO = [
  "Montaje de Transformador", "Supervisión de Montaje", "Asistencia por reclamo", 
  "Servicio de Mantenimiento", "Toma de Muestras (Únicamente)", 
  "Ensayos Eléctricos (Únicamente)", "Supervisión de Puesta en Marcha", 
  "Desmontaje de Transformador", "Análisis de Aceite", "Vacaciones"
];

const COLORS_TRABAJO = {
  "Montaje de Transformador": "#ea580c", 
  "Supervisión de Montaje": "#f97316", 
  "Asistencia por reclamo": "#ef4444", 
  "Servicio de Mantenimiento": "#10b981", 
  "Toma de Muestras (Únicamente)": "#f59e0b", 
  "Ensayos Eléctricos (Únicamente)": "#8b5cf6", 
  "Supervisión de Puesta en Marcha": "#06b6d4", 
  "Desmontaje de Transformador": "#c2410c", 
  "Análisis de Aceite": "#64748b",
  "Vacaciones": "#38bdf8"
};

const FLOTA_PROPIA = ["KANGOO PLG", "KANGOO AF", "TRANSIT AG", "MASTER AB"];
const TERCERIZADOS = ["AEREO", "VEHICULO KINTO"];
const TODOS_VEHICULOS = [...FLOTA_PROPIA, ...TERCERIZADOS];

// --- HOOK: DETECTOR DE CONEXIÓN ---
const useOnlineStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    return isOnline;
};

// --- ESTILOS GLOBALES ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    body { font-family: 'Inter', sans-serif; }
    .input-field { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; background-color: #f8fafc; outline: none; transition: all 0.2s; font-size: 0.9rem; color: #334155; }
    .input-field:focus { border-color: #f97316; background-color: #ffffff; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1); }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    .app-background { background-image: url('${BACKGROUND_IMAGE}'); background-size: cover; background-position: center; background-repeat: no-repeat; }
    .app-overlay { background-color: rgba(255, 255, 255, 0.65); backdrop-filter: blur(0px); }
    
    @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
    .animate-ping-slow { animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
    
    /* Leaflet overrides */
    .leaflet-container { font-family: 'Inter', sans-serif; z-index: 0; }
  `}</style>
);

// --- COMPONENTES UI ---

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizeClasses = size === 'lg' ? 'max-w-4xl' : size === 'sm' ? 'max-w-sm' : 'max-w-md';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm transition-all">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses} overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]`}>
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};

const FileUploader = ({ files, setFiles, label, required = false, compact = false, isOffline = false }) => {
  const fileInputRef = useRef(null);
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const newFile = {
                name: file.name, type: file.type, url: e.target.result, date: new Date().toLocaleDateString(), pendingSync: isOffline
            };
            setFiles(prev => [...prev, newFile]);
        };
        reader.readAsDataURL(file);
    });
  };
  const removeFile = (index) => setFiles(files.filter((_, i) => i !== index));

  return (
    <div className={`mb-4 ${compact ? 'p-0 border-0' : 'p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50/50 hover:bg-slate-50'} transition-colors`}>
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-semibold text-slate-700">{label} {required && <span className="text-red-500">*</span>}</label>
        <button type="button" onClick={() => fileInputRef.current.click()} className="text-xs flex items-center bg-white border border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-200 px-3 py-1.5 rounded-lg transition-all shadow-sm font-medium">
          <Paperclip className="w-3.5 h-3.5 mr-1.5"/> Adjuntar
        </button>
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
      </div>
      {files.length > 0 ? (
        <div className="space-y-2">
          {files.map((f, idx) => (
            <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm text-xs group">
              <div className="flex items-center truncate">
                {f.type.includes('image') ? <ImageIcon className="w-4 h-4 mr-2 text-orange-500"/> : <FileText className="w-4 h-4 mr-2 text-rose-500"/>}
                <div className="flex flex-col truncate">
                    <a href={f.url} target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 truncate max-w-[200px] font-medium text-slate-600">{f.name}</a>
                    {f.pendingSync && <span className="text-[9px] text-amber-500 font-bold flex items-center"><WifiOff className="w-2 h-2 mr-1"/> Pendiente Sync</span>}
                </div>
              </div>
              <button type="button" onClick={() => removeFile(idx)} className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>
            </div>
          ))}
        </div>
      ) : !compact && <div className="text-xs text-slate-400 text-center py-2">Sin archivos adjuntos</div>}
    </div>
  );
};

const TechReportViewer = ({ service }) => {
  const [activeTab, setActiveTab] = useState('logs');
  const logs = service.progressLogs || [];
  const hours = service.dailyLogs || [];
  const closure = service.closureData;

  return (
    <div className="mt-6 border-t border-slate-200 pt-6">
      <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center"><FolderOpen className="w-4 h-4 mr-2 text-orange-600"/> REPORTE TÉCNICO DE CAMPO</h4>
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg mb-4">
        {['logs', 'hours', 'closure'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === tab ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{tab === 'logs' ? 'Bitácora Avance' : tab === 'hours' ? 'Parte Diario' : 'Cierre'}</button>
        ))}
      </div>
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 min-h-[150px]">
        {activeTab === 'logs' && (
          <div className="space-y-3">
            {logs.length === 0 ? <p className="text-xs text-slate-400 italic text-center">Sin avances registrados.</p> : 
              logs.sort((a,b) => new Date(b.date) - new Date(a.date)).map((log, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                  <div className="flex justify-between mb-1"><span className="text-xs font-bold text-slate-700">{log.date}</span></div>
                  <p className="text-xs text-slate-600 mb-2">{log.comment}</p>
                  <div className="flex gap-2 flex-wrap">{log.files && log.files.map((f, i) => (<a key={i} href={f.url} target="_blank" className="flex items-center px-2 py-1 bg-blue-50 text-blue-600 text-[10px] rounded border border-blue-100 hover:bg-blue-100"><Paperclip className="w-3 h-3 mr-1"/> {f.name}</a>))}</div>
                </div>
              ))
            }
          </div>
        )}
        {activeTab === 'hours' && (
          <div>
             <table className="w-full text-xs text-left">
               <thead><tr className="text-slate-400 border-b border-slate-200"><th className="pb-2">Fecha</th><th className="pb-2">Personal</th><th className="pb-2">Tipo</th><th className="pb-2">Horario</th><th className="pb-2 text-right">Hs Total</th></tr></thead>
               <tbody>
                 {hours.length === 0 ? <tr><td colSpan="6" className="text-center py-4 text-slate-400 italic">Sin horas cargadas.</td></tr> : 
                   hours.map((h, i) => {
                     const start = new Date(`2000-01-01T${h.start}`);
                     const end = new Date(`2000-01-01T${h.end}`);
                     let duration = (end - start) / (1000 * 60 * 60);
                     if (duration < 0) duration += 24;
                     const workerList = h.workers || [];
                     const techCount = workerList.length > 0 ? workerList.length : 1;
                     const totalManHours = duration * techCount;
                     const workerDisplay = (workerList.length > 0) ? workerList.join(', ') : 'Equipo Completo';
                     return (
                       <tr key={i} className="border-b border-slate-100 last:border-0">
                         <td className="py-2 font-medium text-slate-700">{h.date}</td>
                         <td className="py-2 text-slate-500 max-w-[100px] truncate" title={workerDisplay}>{workerDisplay}</td>
                         <td className="py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${h.type === 'Viaje' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>{h.type || 'Trabajo'}</span></td>
                         <td className="py-2 text-slate-600">{h.start} - {h.end}</td>
                         <td className="py-2 font-bold text-slate-800 text-right">{totalManHours.toFixed(1)}{techCount > 1 && <span className="text-[10px] text-slate-400 font-normal ml-1 block">({duration.toFixed(1)}h x {techCount})</span>}</td>
                       </tr>
                     )
                   })
                 }
               </tbody>
             </table>
          </div>
        )}
        {activeTab === 'closure' && (
          <div>
            {!closure ? <p className="text-xs text-slate-400 italic text-center">Servicio no finalizado aún.</p> : (
              <div className="space-y-3">
                 <div className={`p-2 rounded text-xs font-bold text-center border ${closure.status === 'Finalizado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>ESTADO FINAL: {closure.status.toUpperCase()}</div>
                 {closure.reason && <p className="text-xs text-rose-600 font-medium">Motivo: {closure.reason}</p>}
                 <div><span className="text-xs font-bold text-slate-500 block mb-1">Observación Final:</span><p className="text-xs text-slate-700 bg-white p-2 rounded border border-slate-100">{closure.observation}</p></div>
                 <div><span className="text-xs font-bold text-slate-500 block mb-1">Acta y Archivos Finales:</span><div className="flex gap-2 flex-wrap">{closure.files.map((f, i) => (<a key={i} href={f.url} target="_blank" className="flex items-center px-2 py-1 bg-slate-100 text-slate-600 text-[10px] rounded border border-slate-200 hover:bg-slate-200"><FileCheck className="w-3 h-3 mr-1"/> {f.name}</a>))}</div></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- COMPONENTE MAPA EN VIVO (CON LEAFLET REAL) ---
const LiveFleetMap = () => {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef({});
    const [fleetData, setFleetData] = useState([]);

    useEffect(() => {
        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css'; link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }
        if (!document.getElementById('leaflet-js')) {
            const script = document.createElement('script');
            script.id = 'leaflet-js'; script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.async = true;
            script.onload = () => initMap();
            document.body.appendChild(script);
        } else if (window.L) { initMap(); }
        setFleetData(FLOTA_PROPIA.map((vehicle, i) => ({ id: i, patent: vehicle, lat: -34.6037 + (Math.random() * 0.05 - 0.025), lng: -58.3816 + (Math.random() * 0.05 - 0.025), speed: 0, status: 'stopped', lastUpdate: 'Ahora' })));
    }, []);

    const initMap = () => {
        if (mapInstanceRef.current || !mapContainerRef.current || !window.L) return;
        const map = window.L.map(mapContainerRef.current).setView([-34.6037, -58.3816], 12);
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map);
        mapInstanceRef.current = map;
    };

    useEffect(() => {
        if (!mapInstanceRef.current || !window.L) return;
        const map = mapInstanceRef.current;
        const L = window.L;
        const truckIcon = L.divIcon({ className: 'custom-div-icon', html: `<div style="background-color:#4f46e5; width:24px; height:24px; border-radius:50%; border:2px solid white; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 5px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg></div>`, iconSize: [24, 24], iconAnchor: [12, 12] });
        fleetData.forEach(vehicle => {
            if (markersRef.current[vehicle.id]) {
                markersRef.current[vehicle.id].setLatLng([vehicle.lat, vehicle.lng]);
                markersRef.current[vehicle.id].bindPopup(`<b>${vehicle.patent}</b><br>Velocidad: ${vehicle.speed} km/h`);
            } else {
                const marker = L.marker([vehicle.lat, vehicle.lng], { icon: truckIcon }).addTo(map);
                marker.bindPopup(`<b>${vehicle.patent}</b><br>Velocidad: ${vehicle.speed} km/h`);
                markersRef.current[vehicle.id] = marker;
            }
        });
    }, [fleetData]);

    useEffect(() => {
        const interval = setInterval(() => {
            setFleetData(prev => prev.map(v => ({ ...v, lat: v.lat + (Math.random() * 0.001 - 0.0005), lng: v.lng + (Math.random() * 0.001 - 0.0005), speed: Math.random() > 0.3 ? Math.floor(Math.random() * 60) + 10 : 0, status: Math.random() > 0.3 ? 'moving' : 'stopped' })));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-[600px] relative animate-in fade-in">
            <div className="absolute top-4 left-14 z-[400] bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-200 max-w-xs">
                <h3 className="font-bold text-slate-800 flex items-center mb-1"><Navigation className="w-4 h-4 mr-2 text-indigo-600" /> Monitoreo de Flota</h3>
                <p className="text-xs text-slate-500 mb-3">Integración LoJack Strix (En Vivo)</p>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {fleetData.map(v => (
                        <div key={v.id} className="flex justify-between items-center text-xs border-b border-slate-100 pb-1 last:border-0 cursor-pointer hover:bg-slate-50 p-1 rounded" onClick={() => { if (mapInstanceRef.current) { mapInstanceRef.current.flyTo([v.lat, v.lng], 15); markersRef.current[v.id]?.openPopup(); } }}>
                            <span className="font-bold text-slate-700">{v.patent}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${v.speed > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{v.speed > 0 ? `${v.speed} km/h` : 'Detenido'}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div ref={mapContainerRef} className="w-full h-full bg-slate-100 z-0"></div>
        </div>
    );
};

// --- LOGIN SEGURO CON FIREBASE ---
const LoginScreen = ({ onLogin, tecnicosData }) => {
  const [role, setRole] = useState('admin');
  const [selectedTechName, setSelectedTechName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [adminSetupRequired, setAdminSetupRequired] = useState(false);
  const [adminConfig, setAdminConfig] = useState(null);

  useEffect(() => {
    const checkAdminConfig = async () => {
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'admin_settings', 'config');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) { setAdminConfig(docSnap.data()); setAdminSetupRequired(false); } else { setAdminSetupRequired(true); }
      } catch (err) { console.error("Error checking admin config:", err); } finally { setLoading(false); }
    };
    checkAdminConfig();
  }, []);

  const handleAdminSetup = async () => {
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
    setLoading(true);
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'admin_settings', 'config'), { password: password, createdAt: new Date().toISOString() });
      setAdminConfig({ password: password }); setAdminSetupRequired(false); setPassword(''); setError(''); alert("¡Contraseña de Administrador configurada con éxito!");
    } catch (err) { setError("Error al guardar configuración: " + err.message); } finally { setLoading(false); }
  };

  const handleLogin = () => {
    setError('');
    if (role === 'admin') {
      if (adminSetupRequired) { handleAdminSetup(); return; }
      if (!adminConfig) { setError("Error de configuración. Recargue la página."); return; }
      if (password === adminConfig.password) { onLogin({ name: 'Administrador', role: 'admin' }); } else { setError('Contraseña incorrecta.'); }
    } else {
      const tech = tecnicosData.find(t => t.name === selectedTechName);
      if (!tech) return;
      if (tech.password === password) { onLogin({ name: tech.name, role: 'tech', phone: tech.phone }); } else { setError('Contraseña incorrecta.'); }
    }
  };

  const sortedTecnicos = useMemo(() => [...tecnicosData].sort((a, b) => a.name.localeCompare(b.name)), [tecnicosData]);

  if (loading) return <div className="min-h-screen app-background flex items-center justify-center"><div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center"><Loader className="w-8 h-8 text-orange-600 animate-spin mb-4" /><p className="text-slate-600 font-medium">Cargando configuración...</p></div></div>;

  return (
    <div className="min-h-screen app-background flex items-center justify-center p-4">
      <div className="absolute inset-0 app-overlay"></div>
      <GlobalStyles />
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-slate-100 relative z-10">
        <div className="text-center mb-10">
          <div className="w-24 h-24 mx-auto mb-6 relative"><div className="absolute inset-0 bg-orange-500/10 rounded-full blur-xl"></div><img src={COMPANY_LOGO} alt="Logo" className="w-full h-full object-contain relative z-10 drop-shadow-xl" /></div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Planificación<br/><span className="text-orange-600">Postventa</span></h1>
        </div>
        {adminSetupRequired && role === 'admin' ? (
           <div className="space-y-4 animate-in fade-in">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm"><p className="font-bold flex items-center mb-1"><ShieldCheck className="w-4 h-4 mr-2"/> Configuración Inicial</p>Establece la contraseña maestra para el Administrador.</div>
              <div className="relative group"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Key className="h-5 w-5 text-slate-400" /></div><input type="password" placeholder="Crear contraseña Admin" className="w-full pl-10 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 outline-none" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              {error && <p className="text-rose-500 text-sm text-center font-medium bg-rose-50 py-2 rounded-lg">{error}</p>}
              <button onClick={handleAdminSetup} className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">Guardar y Continuar</button>
           </div>
        ) : (
          <div className="space-y-5">
            <div className="flex bg-slate-100 p-1.5 rounded-xl">
              <button onClick={() => { setRole('admin'); setError(''); }} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${role === 'admin' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}>Admin</button>
              <button onClick={() => { setRole('tech'); setError(''); }} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${role === 'tech' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}>Técnico</button>
            </div>
            {role === 'tech' && (<div className="relative group"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Briefcase className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" /></div><select className="w-full pl-10 pr-3 py-3 border-none bg-slate-50 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-orange-100 transition-all outline-none" value={selectedTechName} onChange={(e) => { setSelectedTechName(e.target.value); setError(''); }}><option value="">Selecciona tu usuario...</option>{sortedTecnicos.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}</select></div>)}
            {(role === 'admin' || (role === 'tech' && selectedTechName)) && (<div className="relative group"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" /></div><input type="password" placeholder="Contraseña de acceso" className="w-full pl-10 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-orange-100 outline-none" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} /></div>)}
            {error && <p className="text-rose-500 text-sm text-center font-medium bg-rose-50 py-2 rounded-lg">{error}</p>}
            <button onClick={handleLogin} disabled={role === 'tech' && !selectedTechName} className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${role === 'tech' && !selectedTechName ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed' : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-orange-200'}`}>Ingresar</button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---

export default function App() {
  const [user, setUser] = useState(null); 
  const [activeTab, setActiveTab] = useState('gantt');
  const isOnline = useOnlineStatus();

  // --- LOCALSTORAGE PERSISTENCIA (SINCRO FIREBASE) ---
  const [services, setServices] = useState([]);
  const [tecnicosData, setTecnicosData] = useState([]);

  useEffect(() => {
    if (!db) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
           await signInWithCustomToken(auth, __initial_auth_token);
        } else {
           await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Auth error", e);
      }
    };
    initAuth();

    const unsubscribeServices = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'services'), (snapshot) => {
      const loadedServices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(loadedServices);
    });

    const unsubscribeTechnicians = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'technicians'), (snapshot) => {
       const loadedTechs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
       setTecnicosData(loadedTechs);
    });

    return () => {
      unsubscribeServices();
      unsubscribeTechnicians();
    };
  }, []);

  useEffect(() => {
    if (user) {
        setActiveTab(user.role === 'admin' ? 'gantt' : 'tasks');
    }
  }, [user]);

  const [notification, setNotification] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [lastSavedService, setLastSavedService] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [kpiYear, setKpiYear] = useState(new Date().getFullYear().toString());
  const [kpiMonth, setKpiMonth] = useState("all");
  const [isManageTechOpen, setIsManageTechOpen] = useState(false);
  const [techSearch, setTechSearch] = useState("");
  const [newTechName, setNewTechName] = useState("");
  const [newTechPhone, setNewTechPhone] = useState("");
  const [newTechPassword, setNewTechPassword] = useState(""); 
  const [closingService, setClosingService] = useState(null);
  const [uploadingEvidenceService, setUploadingEvidenceService] = useState(null); 
  const [loggingHoursService, setLoggingHoursService] = useState(null); 
  const [reopeningService, setReopeningService] = useState(null);
  const [reopenReason, setReopenReason] = useState("");
  const [closureData, setClosureData] = useState({ status: 'Finalizado', reason: '', observation: '', files: [] });
  const [evidenceData, setEvidenceData] = useState({ comment: '', files: [] }); 
  const [dailyLogData, setDailyLogData] = useState({ date: new Date().toISOString().split('T')[0], start: '', end: '', type: 'Trabajo' });
  const [techsForHours, setTechsForHours] = useState([]);
  const [showNPSModal, setShowNPSModal] = useState(false);
  const [npsService, setNpsService] = useState(null);

  const [formData, setFormData] = useState({
    oci: '', cliente: '', fSolicitud: new Date().toISOString().split('T')[0],
    fInicio: '', fFin: '', tipoTrabajo: TIPOS_TRABAJO[0],
    tecnicos: [], vehiculos: [], estado: 'Agendado', observaciones: '',
    postergado: false, motivoPostergacion: '',
    trafoSerie: '', trafoPotencia: '', trafoVoltaje: '',
    ubicacion: '', alcance: 'Nacional', files: [],
    progressLogs: [], dailyLogs: [], closureData: null
  });

  const isAdmin = user?.role === 'admin';

  // --- LÓGICA DE NEGOCIO ---

  const sortedServices = useMemo(() => {
    return [...services].sort((a, b) => new Date(a.fInicio) - new Date(b.fInicio));
  }, [services]);

  const availableTechnicians = useMemo(() => {
    if (!formData.fInicio || !formData.fFin) return [];
    const start = new Date(formData.fInicio);
    const end = new Date(formData.fFin);
    if (start > end) return [];
    return tecnicosData.filter(tech => {
      const hasConflict = services.some(s => {
        if (editingId && s.id === editingId) return false;
        if (!s.tecnicos.includes(tech.name)) return false;
        const sStart = new Date(s.fInicio);
        const sEnd = new Date(s.fFin);
        return (start <= sEnd && end >= sStart);
      });
      return !hasConflict;
    });
  }, [formData.fInicio, formData.fFin, services, tecnicosData, editingId]);


  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const addTechnician = async () => {
    if (newTechName && !tecnicosData.find(t => t.name === newTechName.toUpperCase())) {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'technicians'), { 
          name: newTechName.toUpperCase(), phone: newTechPhone, password: newTechPassword || "1234" 
      });
      setNewTechName(""); setNewTechPhone(""); setNewTechPassword("");
      showNotification("Técnico agregado correctamente");
    }
  };

  const removeTechnician = async (id, name) => {
    if(window.confirm(`¿Seguro deseas eliminar a ${name}?`)) {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'technicians', id));
    }
  };

  const updateTechData = async (id, field, value) => {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'technicians', id), { [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.oci || !formData.cliente || !formData.fInicio || !formData.fFin) {
      showNotification("Faltan datos obligatorios (OCI, Cliente, Fechas).", "error"); return;
    }
    if (new Date(formData.fInicio) > new Date(formData.fFin)) {
        showNotification("La fecha de inicio no puede ser posterior al fin.", "error"); return;
    }

    const serviceData = { 
        ...formData, 
        closureData: editingId ? (services.find(s=>s.id===editingId)?.closureData || null) : null,
        progressLogs: editingId ? (services.find(s=>s.id===editingId)?.progressLogs || []) : [],
        dailyLogs: editingId ? (services.find(s=>s.id===editingId)?.dailyLogs || []) : []
    };

    if (editingId) {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', editingId), serviceData);
      showNotification(`Servicio OCI ${formData.oci} actualizado.`);
    } else {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'services'), serviceData);
      showNotification(`Servicio OCI ${formData.oci} agendado.`);
    }

    setLastSavedService(serviceData);
    if (!editingId || (editingId && !formData.postergado)) setShowMsgModal(true);
    resetForm();
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleTechEvidenceUpload = async () => {
    if (evidenceData.files.length === 0 && !evidenceData.comment.trim()) {
      showNotification("Ingresa un comentario o adjunta archivos.", "error"); return;
    }
    const newLog = {
      id: Date.now(),
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
      comment: evidenceData.comment || "Sin comentarios",
      files: evidenceData.files
    };
    const updatedLogs = [...(uploadingEvidenceService.progressLogs || []), newLog];
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', uploadingEvidenceService.id), { progressLogs: updatedLogs });
    showNotification("Avance registrado correctamente.");
    setUploadingEvidenceService(null);
    setEvidenceData({ comment: '', files: [] });
  };

  const handleLogHours = async () => {
    if(!dailyLogData.date || !dailyLogData.start || !dailyLogData.end) {
      showNotification("Completa todos los campos de horario.", "error"); return;
    }
    const newLog = { ...dailyLogData, id: Date.now(), workers: techsForHours };
    const updatedLogs = [...(loggingHoursService.dailyLogs || []), newLog];
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', loggingHoursService.id), { dailyLogs: updatedLogs });
    showNotification("Horas registradas para el equipo.");
    setLoggingHoursService(null);
    setDailyLogData({ date: new Date().toISOString().split('T')[0], start: '', end: '', type: 'Trabajo' });
    setTechsForHours([]);
  }

  const handleStartService = async (service) => {
    const startLog = { id: Date.now(), date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(), comment: `🚀 SERVICIO INICIADO POR ${user.name}`, files: [] };
    const currentLogs = service.progressLogs || [];
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', service.id), { estado: 'En Servicio', progressLogs: [...currentLogs, startLog] });
    showNotification("¡Servicio Iniciado! Se ha notificado al sistema.");
  };

  const handleTechClosure = async () => {
      if (closureData.status === 'No Finalizado' && !closureData.reason) { showNotification("Debes indicar el motivo.", "error"); return; }
      if (!closureData.observation) { showNotification("Debes agregar una observación final.", "error"); return; }
      const closureInfo = { ...closureData, date: new Date().toISOString() };
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', closingService.id), { estado: closureData.status, closureData: closureInfo });
      showNotification("Servicio reportado correctamente.");
      setClosingService(null);
      setClosureData({ status: 'Finalizado', reason: '', observation: '', files: [] });
  };

  const handleReopenService = async () => {
      if (!reopenReason.trim()) { showNotification("El motivo es obligatorio.", "error"); return; }
      const newLog = { id: Date.now(), date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(), comment: `🔄 REAPERTURA DE CASO: ${reopenReason}`, files: [] };
      const updatedLogs = [...(reopeningService.progressLogs || []), newLog];
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', reopeningService.id), { estado: 'En Servicio', progressLogs: updatedLogs });
      showNotification("Servicio reabierto correctamente.");
      setReopeningService(null);
      setReopenReason("");
  };

  const handleDelete = (id) => { setDeletingId(id); };

  const confirmDelete = async () => {
    if (deletingId) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', deletingId));
      if (editingId === deletingId) resetForm();
      setDeletingId(null);
      showNotification("Servicio eliminado correctamente.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      oci: '', cliente: '', fSolicitud: new Date().toISOString().split('T')[0],
      fInicio: '', fFin: '', tipoTrabajo: TIPOS_TRABAJO[0],
      tecnicos: [], vehiculos: [], estado: 'Agendado', observaciones: '',
      postergado: false, motivoPostergacion: '',
      trafoSerie: '', trafoPotencia: '', trafoVoltaje: '',
      ubicacion: '', alcance: 'Nacional', files: [], 
      progressLogs: [], dailyLogs: [], closureData: null
    });
    setTechSearch("");
  };

  const handleEdit = (service) => {
    setEditingId(service.id);
    setFormData(service);
    setIsSidebarOpen(true);
    showNotification("Cargado para editar", "info");
  };

  const handleWhatsApp = (techName) => {
    if (!lastSavedService) return;
    const tech = tecnicosData.find(t => t.name === techName);
    if (!tech || !tech.phone) { showNotification(`Sin teléfono para ${techName}`, "error"); return; }
    
    const duracion = (new Date(lastSavedService.fFin) - new Date(lastSavedService.fInicio)) / (1000 * 60 * 60 * 24) + 1;
    const flag = lastSavedService.alcance === 'Internacional' ? 'INTERNACIONAL' : 'NACIONAL';
    const sDate = lastSavedService.fInicio.replace(/-/g, '');
    const eDate = new Date(new Date(lastSavedService.fFin).getTime() + 86400000).toISOString().split('T')[0].replace(/-/g, ''); 
    const calDetails = `OCI: ${lastSavedService.oci}\nCliente: ${lastSavedService.cliente}\nTarea: ${lastSavedService.tipoTrabajo}\nObs: ${lastSavedService.observaciones || 'N/A'}`;
    const gCalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${flag} | ${lastSavedService.cliente} - ${lastSavedService.tipoTrabajo}`)}&dates=${sDate}/${eDate}&details=${encodeURIComponent(calDetails)}&location=${encodeURIComponent(lastSavedService.ubicacion || '')}`;
    const msg = `--- TICKET DE SERVICIO TECNICO ---\n\nTECNICO: ${techName}\nCLIENTE: ${lastSavedService.cliente}\nOCI: ${lastSavedService.oci}\nALCANCE: ${flag}\n\nINICIO: ${lastSavedService.fInicio}\nFIN: ${lastSavedService.fFin}\nDURACION: ${duracion} dias\n\nTAREA: ${lastSavedService.tipoTrabajo}\nEQUIPO: ${lastSavedService.tecnicos.join(', ')}\nMOVIL: ${lastSavedService.vehiculos.join(', ')}\nNOTAS: ${lastSavedService.observaciones || '-'}\n\nAGENDAR: ${gCalLink}\n\n>> Iniciar en App al llegar.`;
    window.open(`https://wa.me/${tech.phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // --- VISTAS ---

  const GanttChart = ({ mode = 'operations' }) => {
      const [selectedGanttService, setSelectedGanttService] = useState(null);
      const visibleServices = useMemo(() => {
          let base = isAdmin ? sortedServices : sortedServices.filter(s => s.tecnicos.includes(user.name));
          if (mode === 'operations') { return base.filter(s => s.tipoTrabajo !== 'Vacaciones'); } else { return base.filter(s => s.tipoTrabajo === 'Vacaciones'); }
      }, [sortedServices, mode, user, isAdmin]);

      if (visibleServices.length === 0) return <div className="p-12 text-center text-slate-400 bg-white/90 rounded-2xl border border-dashed border-slate-200">No hay registros para mostrar.</div>;
      
      const dates = visibleServices.flatMap(s => [new Date(s.fInicio), new Date(s.fFin)]);
      const minDate = new Date(Math.min(...dates)); minDate.setDate(minDate.getDate() - 2);
      const maxDate = new Date(Math.max(...dates)); maxDate.setDate(maxDate.getDate() + 5);
      const totalDays = Math.max((maxDate - minDate) / (1000 * 60 * 60 * 24), 1);
      
      return (
          <div className="bg-white/90 rounded-2xl shadow-sm border border-slate-100 p-6 overflow-hidden backdrop-blur-sm relative">
             {selectedGanttService && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-2xl shadow-2xl border border-slate-100 z-50 w-80 animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-start mb-3 pb-2 border-b border-slate-50">
                        <div><h4 className="font-black text-slate-800 text-sm uppercase tracking-wide">{selectedGanttService.tipoTrabajo}</h4><span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{selectedGanttService.oci}</span></div>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedGanttService(null); }} className="p-1 hover:bg-rose-50 rounded-full text-slate-400 hover:text-rose-500 transition-colors"><X className="w-5 h-5"/></button>
                    </div>
                    <div className="text-xs text-slate-600 space-y-2.5">
                        <div className="flex items-start"><Briefcase className="w-4 h-4 mr-2 text-indigo-500 shrink-0"/> <span><span className="font-bold">Cliente:</span> {selectedGanttService.cliente}</span></div>
                        <div className="flex items-start"><Users className="w-4 h-4 mr-2 text-indigo-500 shrink-0"/> <span><span className="font-bold">Equipo:</span> {selectedGanttService.tecnicos.join(', ')}</span></div>
                        <div className="flex items-start"><Calendar className="w-4 h-4 mr-2 text-indigo-500 shrink-0"/> <span><span className="font-bold">Fecha:</span> {selectedGanttService.fInicio} al {selectedGanttService.fFin}</span></div>
                        {mode !== 'vacations' && <div className="flex items-start"><Truck className="w-4 h-4 mr-2 text-indigo-500 shrink-0"/> <span><span className="font-bold">Móvil:</span> {selectedGanttService.vehiculos.join(', ') || 'N/A'}</span></div>}
                        <div className="flex items-center mt-2"><span className={`px-2 py-1 rounded text-[10px] font-bold border w-full text-center ${selectedGanttService.estado==='Finalizado'?'bg-emerald-50 border-emerald-200 text-emerald-700':selectedGanttService.estado==='En Servicio'?'bg-blue-50 border-blue-200 text-blue-700':selectedGanttService.estado==='No Finalizado'?'bg-rose-50 border-rose-200 text-rose-700':'bg-amber-50 border-amber-200 text-amber-700'}`}>{selectedGanttService.postergado ? 'POSTERGADO' : selectedGanttService.estado}</span></div>
                    </div>
                </div>
             )}
             <div className="overflow-x-auto pb-4 custom-scrollbar">
               <div className="relative" style={{ minWidth: '800px', height: `${Math.max(visibleServices.length * 60 + 60, 200)}px` }}>
                 <div className="absolute top-0 left-0 w-full h-10 border-b border-slate-100 flex text-xs font-semibold text-slate-400">
                    {Array.from({ length: Math.ceil(totalDays) }).map((_, i) => {
                      if (i % 2 !== 0 && totalDays > 20) return null;
                      const d = new Date(minDate); d.setDate(d.getDate() + i);
                      const leftPos = ((d - minDate) / (1000 * 60 * 60 * 24)) / totalDays * 100;
                      return <div key={i} className="absolute border-l border-slate-50 pl-2 pt-2" style={{ left: `${leftPos}%` }}>{d.getDate()}/{d.getMonth()+1}</div>;
                    })}
                 </div>
                 {visibleServices.map((srv, idx) => {
                   const start = new Date(srv.fInicio);
                   const offset = (start - minDate) / (1000 * 60 * 60 * 24);
                   const duration = (new Date(srv.fFin) - start) / (1000 * 60 * 60 * 24) + 1;
                   const colorClass = srv.tipoTrabajo === 'Vacaciones' ? 'bg-sky-400 shadow-sky-200' : srv.estado === 'Finalizado' ? 'bg-emerald-500 shadow-emerald-200' : srv.estado === 'No Finalizado' ? 'bg-slate-700 shadow-slate-300' : srv.estado === 'En Servicio' ? 'bg-blue-500 shadow-blue-200' : srv.postergado ? 'bg-rose-500 shadow-rose-200' : 'bg-orange-500 shadow-orange-200';
                   return (
                     <div key={srv.id} className="absolute w-full flex items-center group hover:bg-slate-50 rounded-lg transition-colors" style={{ top: `${50 + idx * 60}px` }}>
                       <div className="w-44 pr-6 text-right text-xs font-bold text-slate-600 truncate">{mode === 'vacations' ? srv.tecnicos[0] : srv.cliente}</div>
                       <div className="flex-1 relative h-12 border-l border-r border-slate-100 bg-slate-50/30 rounded-lg mx-2">
                         <div onClick={() => setSelectedGanttService(srv)} className={`absolute h-8 top-2 rounded-lg shadow-md flex items-center px-3 text-xs text-white font-medium cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${colorClass}`} style={{ left: `${(offset/totalDays)*100}%`, width: `${Math.max((duration/totalDays)*100, 1)}%` }}>
                           <span className="truncate">{mode === 'vacations' ? '🏖️ Vacaciones' : srv.oci}</span>
                         </div>
                       </div>
                       {isAdmin && <div className="w-10 pl-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => handleEdit(srv)} className="p-2 hover:bg-orange-50 rounded-full text-slate-400 hover:text-orange-600"><Edit2 className="w-4 h-4"/></button></div>}
                     </div>
                   );
                 })}
               </div>
             </div>
          </div>
      );
  };

  const ServiceSheet = ({ mode = 'operations' }) => {
      const filteredSheetServices = useMemo(() => {
          if (mode === 'operations') return sortedServices.filter(s => s.tipoTrabajo !== 'Vacaciones');
          return sortedServices.filter(s => s.tipoTrabajo === 'Vacaciones');
      }, [sortedServices, mode]);

      return (
        <div className="bg-white/95 rounded-2xl shadow-sm border border-slate-100 overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50">
                <tr>
                    <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">{mode === 'vacations' ? 'Tipo' : 'OCI'}</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">{mode === 'vacations' ? 'Técnico' : 'Cliente'}</th>
                    {mode !== 'vacations' && <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">Alcance</th>}
                    <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">Fechas</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">Estado</th>
                    <th className="px-6 py-4 text-right font-bold text-slate-600 uppercase tracking-wider text-xs">Acciones</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                {filteredSheetServices.map(s => (
                    <tr key={s.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-700">{mode === 'vacations' ? '🏖️ Vacaciones' : s.oci}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{mode === 'vacations' ? s.tecnicos.join(', ') : s.cliente}</td>
                    {mode !== 'vacations' && (
                        <td className="px-6 py-4">{s.alcance === 'Internacional' ? <span className="flex items-center text-xs font-bold text-orange-600"><Globe className="w-3 h-3 mr-1"/> INT</span> : <span className="flex items-center text-xs font-bold text-slate-500"><Map className="w-3 h-3 mr-1"/> NAC</span>}</td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">{s.fInicio} <span className="text-slate-300 mx-1">➜</span> {s.fFin}</td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${s.estado==='Finalizado'?'bg-emerald-50 border-emerald-100 text-emerald-700':s.estado==='En Servicio'?'bg-blue-50 border-blue-100 text-blue-700':s.postergado?'bg-rose-50 border-rose-100 text-rose-700':'bg-amber-50 border-amber-100 text-amber-700'}`}>{s.postergado ? 'Postergado' : s.estado}</span></td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button type="button" onClick={() => handleEdit(s)} className="text-orange-500 hover:text-orange-700 mx-2 p-1 hover:bg-orange-50 rounded"><Edit2 className="w-4 h-4"/></button>
                        <button type="button" onClick={() => handleDelete(s.id)} className="text-rose-400 hover:text-rose-600 mx-2 p-1 hover:bg-rose-50 rounded"><Trash2 className="w-4 h-4"/></button>
                    </td>
                    </tr>
                ))}
                {filteredSheetServices.length === 0 && <tr><td colSpan="6" className="text-center py-10 text-slate-400">Sin registros disponibles</td></tr>}
                </tbody>
            </table>
            </div>
        </div>
      );
  };

  const TransformerHistory = () => { /* ...Código existente... */
    const [searchSerial, setSearchSerial] = useState("");
    const history = useMemo(() => { if (!searchSerial) return []; return services.filter(s => s.trafoSerie && s.trafoSerie.includes(searchSerial)); }, [searchSerial, services]);
    const lastServiceWithLoc = history.find(s => s.ubicacion);
    const mapUrl = lastServiceWithLoc ? `https://maps.google.com/maps?q=${encodeURIComponent(lastServiceWithLoc.ubicacion)}&t=&z=13&ie=UTF8&iwloc=&output=embed` : null;
    return (
        <div className="space-y-6">
            <div className="bg-white/95 p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center backdrop-blur-sm">
                <h3 className="text-lg font-bold flex items-center text-slate-800"><History className="w-5 h-5 mr-3 text-orange-600"/> Hoja de Vida de Transformador</h3>
                <div className="flex w-full md:w-auto flex-1 max-w-md relative">
                    <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400"/>
                    <input type="text" placeholder="Buscar por Nro de Serie..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-100 outline-none" value={searchSerial} onChange={(e) => setSearchSerial(e.target.value)} />
                </div>
            </div>
            {history.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="col-span-1 space-y-4">
                        <div className="bg-white/90 p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h4 className="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-3 flex items-center"><Activity className="w-4 h-4 mr-2 text-orange-500"/> Datos Técnicos</h4>
                            <div className="space-y-4 text-sm">
                                <div className="bg-slate-50 p-3 rounded-lg"><span className="block text-xs text-slate-400 font-bold uppercase mb-1">Nro Serie</span><span className="font-mono font-bold text-xl text-slate-800">{history[0].trafoSerie}</span></div>
                                <div className="grid grid-cols-2 gap-3">
                                   <div className="bg-slate-50 p-3 rounded-lg"><span className="block text-xs text-slate-400 font-bold uppercase mb-1">Potencia</span><span className="font-bold text-slate-700">{history[0].trafoPotencia || 'N/D'}</span></div>
                                   <div className="bg-slate-50 p-3 rounded-lg"><span className="block text-xs text-slate-400 font-bold uppercase mb-1">Tensión</span><span className="font-bold text-slate-700">{history[0].trafoVoltaje || 'N/D'}</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-64 relative group">
                             {mapUrl ? (
                                 <iframe title="map" width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0" src={mapUrl} className="grayscale group-hover:grayscale-0 transition-all duration-500"></iframe>
                             ) : (
                                 <div className="h-full flex items-center justify-center text-slate-400 text-xs bg-slate-50 flex-col"><MapPin className="w-8 h-8 mb-2 opacity-20"/>Sin ubicación registrada</div>
                             )}
                        </div>
                    </div>
                    <div className="col-span-2 space-y-4">
                        {history.sort((a,b) => new Date(b.fInicio) - new Date(a.fInicio)).map(srv => (
                            <div key={srv.id} className="bg-white/90 p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <h5 className="font-bold text-lg text-slate-800">{srv.tipoTrabajo}</h5>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${srv.estado === 'Finalizado' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>{srv.estado}</span>
                                </div>
                                <div className="flex items-center text-xs text-slate-500 mb-3 space-x-4">
                                  <span className="flex items-center"><Calendar className="w-3 h-3 mr-1"/> {srv.fInicio}</span>
                                  <span className="flex items-center font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{srv.oci}</span>
                                  {srv.alcance === 'Internacional' && <span className="flex items-center text-orange-600 font-bold"><Globe className="w-3 h-3 mr-1"/> INT</span>}
                                </div>
                                {srv.ubicacion && <p className="text-xs text-orange-500 flex items-center font-medium mb-3"><MapPin className="w-3 h-3 mr-1"/> {srv.ubicacion}</p>}
                                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl italic">"{srv.observaciones || 'Sin observaciones'}"</p>
                                <TechReportViewer service={srv} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
  };

  const TechPortal = () => ( /* ...Código existente... */
      <div className="space-y-6">
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-8 rounded-3xl shadow-lg text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
              <h2 className="text-3xl font-extrabold mb-2 relative z-10">Hola, {user.name} 👋</h2>
              <p className="text-orange-100 relative z-10">Aquí tienes tus servicios asignados para hoy.</p>
              {!isOnline && (
                  <div className="mt-4 bg-amber-500/20 border border-amber-300/50 p-3 rounded-xl flex items-center animate-in fade-in">
                      <WifiOff className="w-5 h-5 mr-3 text-amber-100" />
                      <span className="text-sm font-bold text-amber-50">Modo Sin Conexión - Trabajando Localmente</span>
                  </div>
              )}
          </div>
          <div className="grid grid-cols-1 gap-5">
              {services.filter(s => s.tecnicos.includes(user.name)).map(srv => (
                  <div key={srv.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
                      <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${srv.estado==='Finalizado'?'bg-emerald-50 border-emerald-100 text-emerald-700':srv.estado==='En Servicio'?'bg-blue-50 border-blue-100 text-blue-700':srv.estado==='No Finalizado'?'bg-rose-50 border-rose-100 text-rose-700':'bg-amber-50 border-amber-100 text-amber-700'}`}>{srv.estado}</span>
                              <span className="text-xs text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded">OCI: {srv.oci}</span>
                              {srv.alcance === 'Internacional' && <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded font-bold border border-orange-100">INTERNACIONAL</span>}
                          </div>
                          <h3 className="font-bold text-xl text-slate-800 mb-1">{srv.cliente}</h3>
                          <div className="flex flex-wrap gap-2 mb-4">
                              {srv.ubicacion && (
                                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(srv.ubicacion)}`} target="_blank" rel="noreferrer" className="text-xs bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg border border-orange-100 hover:bg-orange-100 flex items-center font-bold transition-colors">
                                      <MapPin className="w-3.5 h-3.5 mr-1.5"/> Navegar
                                  </a>
                              )}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-2">
                              <div className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-slate-400"/> {srv.fInicio} ➔ {srv.fFin}</div>
                              <div className="flex items-center"><Truck className="w-4 h-4 mr-2 text-slate-400"/> {srv.vehiculos.join(', ')}</div>
                          </div>
                          {srv.technicianFiles && srv.technicianFiles.length > 0 && (
                              <div className="text-xs text-slate-500 flex items-center mt-2"><Paperclip className="w-3 h-3 mr-1"/> {srv.technicianFiles.length} archivos subidos</div>
                          )}
                      </div>
                      <div className="flex flex-col gap-3 justify-center min-w-[180px] border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 pt-4 md:pt-0">
                          {srv.estado === 'Agendado' && (
                              <button onClick={() => handleStartService(srv)} className="bg-blue-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center justify-center transition-all active:scale-95">
                                  <PlayCircle className="w-5 h-5 mr-2"/> Iniciar Tarea
                              </button>
                          )}
                          
                          {/* BOTONES DE ACCIÓN EN SERVICIO */}
                          {srv.estado === 'En Servicio' && (
                              <>
                                <button onClick={() => { setUploadingEvidenceService(srv); setEvidenceData({comment: '', files: []}); }} className="bg-white text-blue-600 border border-blue-200 py-2 px-3 rounded-lg font-bold hover:bg-blue-50 flex items-center justify-center text-xs transition-colors">
                                    <ImageIcon className="w-4 h-4 mr-2"/> Subir Avance
                                </button>
                                <button 
                                    onClick={() => { 
                                        setLoggingHoursService(srv); 
                                        setDailyLogData({date: new Date().toISOString().split('T')[0], start:'', end:'', type: 'Trabajo'});
                                        setTechsForHours(srv.tecnicos); // Pre-seleccionar a todos
                                    }} 
                                    className="bg-white text-indigo-600 border border-indigo-200 py-2 px-3 rounded-lg font-bold hover:bg-indigo-50 flex items-center justify-center text-xs transition-colors"
                                >
                                    <Timer className="w-4 h-4 mr-2"/> Cargar Horas
                                </button>
                                {/* BOTÓN DE ENCUESTA NPS */}
                                <button 
                                    onClick={() => { setNpsService(srv); setShowNPSModal(true); }}
                                    className="bg-white text-purple-600 border border-purple-200 py-2 px-3 rounded-lg font-bold hover:bg-purple-50 flex items-center justify-center text-xs transition-colors"
                                >
                                    <QrCode className="w-4 h-4 mr-2"/> Encuesta Calidad
                                </button>
                              </>
                          )}

                          {srv.estado === 'Finalizado' || srv.estado === 'No Finalizado' ? (
                              <div className="flex flex-col gap-2">
                                <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium">
                                  <CheckSquare className="w-5 h-5 mx-auto mb-1 text-slate-400"/>
                                  Servicio Reportado
                                </div>
                                {/* ENCUESTA TAMBIEN DISPONIBLE AL FINALIZAR */}
                                <button 
                                    onClick={() => { setNpsService(srv); setShowNPSModal(true); }}
                                    className="w-full py-2 text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors flex items-center justify-center"
                                >
                                    <QrCode className="w-3 h-3 mr-1"/> Encuesta Calidad
                                </button>
                                <button 
                                  onClick={() => { setReopeningService(srv); setReopenReason(""); }}
                                  className="w-full py-2 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors flex items-center justify-center"
                                >
                                  <RotateCcw className="w-3 h-3 mr-1"/> Reabrir Caso
                                </button>
                              </div>
                          ) : (
                              <button onClick={() => { setClosingService(srv); setClosureData({status:'Finalizado', reason:'', observation: '', files:[]}); }} className="bg-white text-orange-600 border-2 border-orange-600 py-3 px-4 rounded-xl font-bold hover:bg-orange-50 flex items-center justify-center transition-colors mt-1">
                                  <CheckCircle className="w-5 h-5 mr-2"/> Cerrar Servicio
                              </button>
                          )}
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const KPIs = () => {
    // --- LÓGICA DE FILTRADO PARA KPI: EXCLUIR VACACIONES ---
    const filteredServices = services.filter(s => { 
        const sDate = new Date(s.fInicio); 
        return (kpiYear === 'all' || sDate.getFullYear().toString() === kpiYear) && (kpiMonth === 'all' || sDate.getMonth().toString() === kpiMonth); 
    });
    
    // Dataset para cálculos (EXCLUYENDO VACACIONES)
    const servicesForCalc = filteredServices.filter(s => s.tipoTrabajo !== 'Vacaciones');

    if (servicesForCalc.length === 0) return (<div className="space-y-6 animate-in fade-in pb-10"><div className="flex items-center gap-4 bg-white/90 p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 backdrop-blur-sm"><div className="flex items-center text-slate-500 text-sm font-bold"><Filter className="w-4 h-4 mr-2"/> Filtrar Periodo:</div><select className="bg-slate-50 border-none rounded-lg text-sm p-2 focus:ring-2 focus:ring-orange-100 outline-none" value={kpiYear} onChange={e=>setKpiYear(e.target.value)}><option value="all">Todos los Años</option>{[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}</select><select className="bg-slate-50 border-none rounded-lg text-sm p-2 focus:ring-2 focus:ring-orange-100 outline-none" value={kpiMonth} onChange={e=>setKpiMonth(e.target.value)}><option value="all">Todos los Meses</option>{["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"].map((m,i) => <option key={i} value={i.toString()}>{m}</option>)}</select></div><div className="p-10 text-center text-slate-400 bg-white/50 rounded-xl">Sin datos operativos en el periodo seleccionado.</div></div>);
    
    const totalServices = servicesForCalc.length;
    const leadTimes = servicesForCalc.map(s => (new Date(s.fInicio) - new Date(s.fSolicitud)) / (1000 * 3600 * 24));
    const avgLeadTime = leadTimes.length ? (leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length).toFixed(1) : 0;
    const closedServices = servicesForCalc.filter(s => s.estado === 'Finalizado' || s.estado === 'No Finalizado');
    const successRate = closedServices.length ? ((closedServices.filter(s => s.estado === 'Finalizado').length / closedServices.length) * 100).toFixed(0) : 0;
    const postponedCount = servicesForCalc.filter(s => s.postergado).length;
    const adherenceRate = totalServices ? (((totalServices - postponedCount) / totalServices) * 100).toFixed(0) : 0;
    const totalClaims = servicesForCalc.filter(s => s.tipoTrabajo === "Asistencia por reclamo").length;
    const qualityRate = totalServices ? (((totalServices - totalClaims) / totalServices) * 100).toFixed(1) : 100;
    const postponementRate = totalServices ? ((postponedCount / totalServices) * 100).toFixed(1) : 0;
    const activeServicesCount = servicesForCalc.filter(s => s.estado === 'En Servicio').length;
    const internationalCount = servicesForCalc.filter(s => s.alcance === 'Internacional').length;
    const internationalRate = totalServices ? ((internationalCount / totalServices) * 100).toFixed(1) : 0;
    let ownFleetUses = 0; let totalVehicleUses = 0;
    servicesForCalc.forEach(s => { s.vehiculos.forEach(v => { totalVehicleUses++; if (FLOTA_PROPIA.includes(v)) ownFleetUses++; }); });
    const ownFleetRate = totalVehicleUses ? ((ownFleetUses / totalVehicleUses) * 100).toFixed(1) : 0;
    const activeTechsSet = new Set(); servicesForCalc.forEach(s => s.tecnicos.forEach(t => activeTechsSet.add(t)));
    const activeTechsCount = activeTechsSet.size;
    const clientMap = {}; servicesForCalc.forEach(s => { clientMap[s.cliente] = (clientMap[s.cliente] || 0) + 1; });
    const topClientEntry = Object.entries(clientMap).sort((a,b) => b[1] - a[1])[0];
    const topClientName = topClientEntry ? topClientEntry[0] : "-";
    const durations = servicesForCalc.map(s => (new Date(s.fFin) - new Date(s.fInicio)) / (1000 * 3600 * 24) + 1);
    const avgDuration = durations.length ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(1) : 0;
    
    let totalWorkHours = 0;
    let totalTravelHours = 0;
    servicesForCalc.forEach(s => {
        if(s.dailyLogs) {
            s.dailyLogs.forEach(log => {
                const start = new Date(`2000-01-01T${log.start}`);
                const end = new Date(`2000-01-01T${log.end}`);
                let hours = (end - start) / (1000 * 60 * 60);
                if (hours < 0) hours += 24;
                
                // MULTIPLICAR POR CANTIDAD DE TÉCNICOS
                const techCount = (log.workers && log.workers.length > 0) ? log.workers.length : 1;
                const total = hours * techCount;

                if (total > 0) {
                    if (log.type === 'Viaje') totalTravelHours += total;
                    else totalWorkHours += total;
                }
            });
        }
    });
    const dataHoursType = [
        { name: 'Trabajo', value: parseFloat(totalWorkHours.toFixed(1)) },
        { name: 'Viaje', value: parseFloat(totalTravelHours.toFixed(1)) }
    ];

    const vehicleJobMap = {}; TODOS_VEHICULOS.forEach(v => vehicleJobMap[v] = { name: v });
    servicesForCalc.forEach(s => s.vehiculos.forEach(v => { if (vehicleJobMap[v]) vehicleJobMap[v][s.tipoTrabajo] = (vehicleJobMap[v][s.tipoTrabajo] || 0) + 1; }));
    const dataVehiclesByJob = Object.values(vehicleJobMap).filter(v => Object.keys(v).length > 1);
    const dataTopClients = Object.entries(clientMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5);
    const statusMap = { 'Finalizado': 0, 'No Finalizado': 0, 'En Servicio': 0, 'Agendado': 0 };
    servicesForCalc.forEach(s => { const st = s.postergado ? 'Agendado' : s.estado; statusMap[st] = (statusMap[st] || 0) + 1; });
    const dataStatus = Object.entries(statusMap).map(([name, value]) => ({ name, value }));
    const COLORS_STATUS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'];
    const techLoadMap = {}; servicesForCalc.forEach(s => s.tecnicos.forEach(t => { techLoadMap[t] = (techLoadMap[t] || 0) + 1; }));
    const dataTechLoad = Object.entries(techLoadMap).map(([name, value]) => ({ name, value })).sort((a,b)=>b.value-a.value).slice(0,10);
    const servicesByMonth = {}; servicesForCalc.forEach(s => { const d = new Date(s.fInicio); const m = d.toLocaleString('default', { month: 'short' }); servicesByMonth[m] = (servicesByMonth[m] || 0) + 1; });
    const dataTrend = Object.entries(servicesByMonth).map(([name, value]) => ({ name, value }));
    const scopeMap = { 'Nacional': 0, 'Internacional': 0 }; servicesForCalc.forEach(s => { const k = s.alcance || 'Nacional'; scopeMap[k] = (scopeMap[k] || 0) + 1; });
    const dataScope = Object.entries(scopeMap).map(([name, value]) => ({ name, value }));

    return (
        <div className="space-y-8 animate-in fade-in pb-10 font-sans">
            {/* --- FILTROS SUPERIORES --- */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-white/95 p-5 rounded-2xl border border-slate-100 shadow-sm backdrop-blur-sm sticky top-0 z-20">
                <div className="flex items-center gap-3 mb-4 md:mb-0">
                    <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
                        <BarChart2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Panel de Control</h3>
                        <p className="text-xs text-slate-400 font-medium">Indicadores clave de rendimiento</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                    <div className="flex items-center px-3 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <Filter className="w-3.5 h-3.5 mr-2"/> Periodo
                    </div>
                    <select 
                        className="bg-white border border-slate-200 rounded-lg text-sm py-1.5 px-3 focus:ring-2 focus:ring-orange-200 outline-none text-slate-700 font-medium shadow-sm transition-all hover:border-orange-300" 
                        value={kpiYear} 
                        onChange={e=>setKpiYear(e.target.value)}
                    >
                        <option value="all">Año: Todos</option>
                        {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select 
                        className="bg-white border border-slate-200 rounded-lg text-sm py-1.5 px-3 focus:ring-2 focus:ring-orange-200 outline-none text-slate-700 font-medium shadow-sm transition-all hover:border-orange-300" 
                        value={kpiMonth} 
                        onChange={e=>setKpiMonth(e.target.value)}
                    >
                        <option value="all">Mes: Todos</option>
                        {["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"].map((m,i) => <option key={i} value={i.toString()}>{m}</option>)}
                    </select>
                </div>
            </div>

            {/* --- TARJETAS KPI PRINCIPALES --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
                {[
                    { title: "Total Servicios", val: totalServices, unit: "", icon: Calendar, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
                    { title: "En Ejecución", val: activeServicesCount, unit: "", icon: Zap, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
                    { title: "Lead Time", val: avgLeadTime, unit: "días", icon: Clock, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
                    { title: "Efectividad", val: successRate, unit: "%", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
                    { title: "Adherencia", val: adherenceRate, unit: "%", icon: Target, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
                    { title: "Tasa Calidad", val: qualityRate, unit: "%", icon: ShieldCheck, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-100" },
                ].map((k, i) => (
                    <div key={i} className={`bg-white p-5 rounded-2xl shadow-sm border ${k.border} hover:shadow-md transition-all duration-300 group`}>
                        <div className="flex justify-between items-start mb-3">
                            <div className={`p-2.5 rounded-xl ${k.bg} ${k.color} group-hover:scale-110 transition-transform duration-300`}>
                                <k.icon className="w-5 h-5"/>
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-slate-800 tracking-tight mb-1">
                                {k.val} <span className="text-sm font-bold text-slate-400 ml-0.5">{k.unit}</span>
                            </div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{k.title}</span>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* --- SECCIÓN 2: GRÁFICOS DE RENDIMIENTO --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* DISTRIBUCIÓN HORAS */}
                 <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-50 to-transparent rounded-bl-full -mr-8 -mt-8 opacity-50"></div>
                    
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm flex items-center mb-1">
                                <Timer className="w-4 h-4 mr-2 text-orange-500"/> Distribución Horaria
                            </h4>
                            <p className="text-[10px] text-slate-400 font-medium">Horas Hombre (Productivas vs Viaje)</p>
                        </div>
                    </div>
                    
                    <div className="h-64 relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={dataHoursType} 
                                    innerRadius={60} 
                                    outerRadius={80} 
                                    paddingAngle={5} 
                                    dataKey="value" 
                                    stroke="none"
                                >
                                    {dataHoursType.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#f97316', '#cbd5e1'][index % 2]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                    itemStyle={{fontSize: '12px', fontWeight: 'bold', color: '#475569'}}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '11px', fontWeight: 600, color: '#64748b'}}/>
                            </PieChart>
                        </ResponsiveContainer>
                        
                        {/* Centro del Donut */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-[-10px]">
                            <span className="text-2xl font-black text-slate-700 block">{(totalWorkHours + totalTravelHours).toFixed(0)}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total HH</span>
                        </div>
                    </div>
                </div>
                
                {/* EVOLUCIÓN MENSUAL */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative col-span-2 group">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm flex items-center mb-1">
                                <TrendingUp className="w-4 h-4 mr-2 text-indigo-500"/> Tendencia de Servicios
                            </h4>
                            <p className="text-[10px] text-slate-400 font-medium">Evolución mensual de carga de trabajo</p>
                        </div>
                    </div>
                    
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dataTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorServ" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill:'#94a3b8', fontSize:11, fontWeight: 600}} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill:'#94a3b8', fontSize:11, fontWeight: 600}}
                                />
                                <Tooltip 
                                    cursor={{stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4'}}
                                    contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                    itemStyle={{color: '#4f46e5', fontWeight: 'bold', fontSize: '12px'}}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#6366f1" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorServ)" 
                                    activeDot={{r: 6, strokeWidth: 0, fill:'#4f46e5'}}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* --- SECCIÓN 3: DETALLES OPERATIVOS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ESTADOS */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-80 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center">
                            <PieChart className="w-4 h-4 mr-2 text-emerald-500"/> Estado de Proyectos
                        </h4>
                    </div>
                    <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie 
                                data={dataStatus} 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={60} 
                                outerRadius={80} 
                                paddingAngle={5} 
                                dataKey="value"
                                stroke="none"
                            >
                                {dataStatus.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS_STATUS[index % COLORS_STATUS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                itemStyle={{fontSize: '12px', fontWeight: 'bold', color: '#334155'}}
                            />
                            <Legend 
                                layout="vertical" 
                                verticalAlign="middle" 
                                align="right"
                                iconType="circle"
                                wrapperStyle={{fontSize: '11px', fontWeight: 600, color: '#64748b'}}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* CARGA TÉCNICA (TOP 10) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-80 relative">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center">
                            <Briefcase className="w-4 h-4 mr-2 text-violet-500"/> Top 10 Técnicos (Carga)
                        </h4>
                    </div>
                    <ResponsiveContainer width="100%" height="85%">
                        <RechartsBarChart data={dataTechLoad} layout="vertical" margin={{left: 20}}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9"/>
                            <XAxis type="number" hide/>
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                width={100} 
                                tick={{fontSize:10, fill:'#64748b', fontWeight: 600}} 
                                axisLine={false} 
                                tickLine={false}
                            />
                            <Tooltip 
                                cursor={{fill: '#f8fafc'}}
                                contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                            />
                            <Bar 
                                dataKey="value" 
                                fill="#8b5cf6" 
                                radius={[0, 4, 4, 0]} 
                                barSize={12}
                                background={{ fill: '#f8fafc' }}
                            />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* --- SECCIÓN 4: MÉTRICAS SECUNDARIAS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* ALCANCE */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="font-bold text-slate-700 text-xs mb-4 uppercase tracking-wider flex items-center">
                        <Globe className="w-3.5 h-3.5 mr-2 text-teal-500"/> Alcance Geográfico
                    </h4>
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={dataScope} 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={35} 
                                    outerRadius={55} 
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {dataScope.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#14b8a6'][index % 2]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{borderRadius:'8px', border:'none', fontSize:'11px'}}/>
                                <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* TOP CLIENTES */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="font-bold text-slate-700 text-xs mb-4 uppercase tracking-wider flex items-center">
                        <UserCheck className="w-3.5 h-3.5 mr-2 text-pink-500"/> Top 5 Clientes
                    </h4>
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={dataTopClients} layout="vertical" margin={{left: 0}}>
                                <XAxis type="number" hide/>
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    width={80} 
                                    tick={{fontSize:9, fill:'#64748b'}} 
                                    axisLine={false} 
                                    tickLine={false}
                                />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius:'8px', border:'none', fontSize:'11px'}}/>
                                <Bar dataKey="value" fill="#ec4899" radius={[0,2,2,0]} barSize={8} background={{ fill: '#fdf2f8' }}/>
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* FLOTA */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="font-bold text-slate-700 text-xs mb-4 uppercase tracking-wider flex items-center">
                        <Truck className="w-3.5 h-3.5 mr-2 text-orange-500"/> Uso de Flota
                    </h4>
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={dataVehiclesByJob} layout="vertical" margin={{left: 0}}>
                                <XAxis type="number" hide/>
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    width={80} 
                                    tick={{fontSize:9, fill:'#64748b'}} 
                                    axisLine={false} 
                                    tickLine={false}
                                />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius:'8px', border:'none', fontSize:'11px'}}/>
                                {TIPOS_TRABAJO.slice(0, 3).map((type, idx) => (
                                    <Bar key={type} dataKey={type} stackId="a" fill={Object.values(COLORS_TRABAJO)[idx]} barSize={16} />
                                ))}
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  if (!user) return <LoginScreen onLogin={setUser} tecnicosData={tecnicosData}/>;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden app-background">
      <div className="absolute inset-0 app-overlay z-0"></div>
      <GlobalStyles />
      {/* MOBILE NAV */}
      <div className="lg:hidden fixed w-full bg-white border-b border-slate-100 z-20 px-4 py-3 flex justify-between items-center shadow-sm">
        <span className="font-bold text-orange-600 flex items-center text-lg"><Truck className="w-6 h-6 mr-2"/> POSTVENTA</span>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-600"><Menu /></button>
      </div>

      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-30 w-full lg:w-80 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
            <div className="flex items-center">
               <img src={COMPANY_LOGO} alt="Logo" className="w-10 h-10 object-contain mr-2 drop-shadow-sm" />
               <div>
                 <h2 className="text-sm font-black text-slate-800 tracking-tight">PLANIFICACIÓN</h2>
                 <p className="text-xs font-bold text-orange-600">POSTVENTA</p>
               </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400"><X /></button>
          </div>
          
          {isAdmin ? (
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-5">
              <button onClick={() => setIsManageTechOpen(true)} className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:border-orange-300 hover:shadow-md transition-all text-sm font-bold group">
                <span className="flex items-center"><Settings className="w-4 h-4 mr-2 text-slate-400 group-hover:text-orange-500"/> Gestionar Personal</span>
                <ChevronRight className="w-4 h-4 text-slate-300"/>
              </button>

              <div className="border-t border-slate-100 pt-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">Nueva Asignación</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {editingId && (
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-sm text-amber-800 flex flex-col gap-2 mb-2 font-bold shadow-sm">
                      <div className="flex justify-between items-center">
                        <span>✏️ Editando servicio...</span>
                        <button type="button" onClick={resetForm} className="bg-white px-2 py-1 rounded border border-amber-200 hover:bg-amber-100 text-xs">Cancelar</button>
                      </div>
                      
                      {/* --- SELECTOR DE ESTADO PARA ADMIN --- */}
                      <div className="mt-2">
                        <label className="text-[10px] text-amber-600 uppercase mb-1 block">Estado Actual</label>
                        <select 
                          className="w-full p-2 bg-white border border-amber-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-amber-300"
                          value={formData.estado}
                          onChange={(e) => setFormData({...formData, estado: e.target.value})}
                        >
                          <option value="Agendado">Agendado</option>
                          <option value="En Servicio">En Servicio</option>
                          <option value="Finalizado">Finalizado</option>
                          <option value="No Finalizado">No Finalizado</option>
                        </select>
                      </div>
                    </div>
                  )}
                  
                  {/* TIPO DE TRABAJO MOVIDO ARRIBA PARA CONDICIONAR EL RESTO */}
                  <div>
                      <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">TIPO TRABAJO</label>
                      <div className="relative">
                        <select 
                            className="input-field appearance-none" 
                            value={formData.tipoTrabajo} 
                            onChange={e => {
                                const newVal = e.target.value;
                                setFormData(prev => ({
                                    ...prev, 
                                    tipoTrabajo: newVal,
                                    // Auto-relleno inteligente para Vacaciones
                                    cliente: newVal === 'Vacaciones' ? 'INTERNO' : prev.cliente,
                                    oci: newVal === 'Vacaciones' ? 'VACACIONES' : prev.oci,
                                    vehiculos: newVal === 'Vacaciones' ? [] : prev.vehiculos
                                }));
                            }}
                        >
                            {TIPOS_TRABAJO.map(t=><option key={t} value={t}>{t}</option>)}
                        </select>
                        <div className="absolute right-3 top-3 pointer-events-none text-slate-400"><Briefcase className="w-4 h-4"/></div>
                      </div>
                  </div>

                  {formData.tipoTrabajo !== 'Vacaciones' && (
                    <>
                      <div className="grid grid-cols-2 gap-3 animate-in fade-in">
                          <div><label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">OCI</label><input type="text" className="input-field font-mono" placeholder="45021" value={formData.oci} onChange={e=>setFormData({...formData, oci:e.target.value})} /></div>
                          <div><label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">CLIENTE</label><input type="text" className="input-field uppercase" placeholder="NOMBRE" value={formData.cliente} onChange={e=>setFormData({...formData, cliente:e.target.value.toUpperCase()})} /></div>
                      </div>

                      {/* SELECTOR DE ALCANCE */}
                      <div className="animate-in fade-in">
                          <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">ALCANCE</label>
                          <div className="flex bg-slate-100 p-1 rounded-lg">
                              <button type="button" onClick={() => setFormData({...formData, alcance: 'Nacional'})} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center ${formData.alcance === 'Nacional' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                  <Map className="w-3 h-3 mr-1"/> NACIONAL
                              </button>
                              <button type="button" onClick={() => setFormData({...formData, alcance: 'Internacional'})} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center ${formData.alcance === 'Internacional' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                  <Globe className="w-3 h-3 mr-1"/> INTERNACIONAL
                              </button>
                          </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm group hover:border-orange-200 transition-colors animate-in fade-in">
                          <label className="text-xs font-bold text-orange-500 block mb-3 flex items-center"><Activity className="w-3 h-3 mr-1"/> DATOS TRANSFORMADOR</label>
                          <div className="grid grid-cols-2 gap-3 mb-3">
                              <input type="text" placeholder="Nro Serie" className="input-field text-xs bg-white" value={formData.trafoSerie} onChange={e=>setFormData({...formData, trafoSerie:e.target.value})} />
                              <input type="text" placeholder="Potencia" className="input-field text-xs bg-white" value={formData.trafoPotencia} onChange={e=>setFormData({...formData, trafoPotencia:e.target.value})} />
                          </div>
                          <input type="text" placeholder="Tensión" className="input-field text-xs bg-white" value={formData.trafoVoltaje} onChange={e=>setFormData({...formData, trafoVoltaje:e.target.value})} />
                      </div>

                      <div className="animate-in fade-in">
                          <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">UBICACIÓN (Google Maps)</label>
                          <div className="flex items-center input-field bg-white p-0 overflow-hidden focus-within:ring-2 ring-orange-100 border-slate-200">
                              <div className="pl-3 pr-2 text-slate-400"><MapPin className="w-4 h-4"/></div>
                              <input type="text" placeholder="Pegar Link o Coordenadas..." className="w-full py-2 bg-transparent outline-none text-sm" value={formData.ubicacion} onChange={e=>setFormData({...formData, ubicacion:e.target.value})} />
                          </div>
                      </div>
                    </>
                  )}

                  {formData.tipoTrabajo === 'Vacaciones' && (
                      <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 text-sky-800 text-xs font-bold flex items-center animate-in fade-in">
                          <Palmtree className="w-5 h-5 mr-3"/>
                          Registro de Vacaciones: Selecciona las fechas y los técnicos ausentes.
                      </div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                      {formData.tipoTrabajo !== 'Vacaciones' && (
                        <div>
                            <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">FECHA SOLICITUD</label>
                            <input type="date" className="input-field" value={formData.fSolicitud} onChange={e=>setFormData({...formData, fSolicitud:e.target.value})} />
                        </div>
                      )}
                      <div>
                        <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                            {formData.tipoTrabajo === 'Vacaciones' ? 'PERIODO VACACIONAL' : 'EJECUCIÓN (INICIO - FIN)'}
                        </label>
                        <div className="flex items-center gap-2">
                            <input type="date" className="input-field text-xs" value={formData.fInicio} onChange={e=>setFormData({...formData, fInicio:e.target.value})} />
                            <span className="text-slate-300">➜</span>
                            <input type="date" className="input-field text-xs" value={formData.fFin} onChange={e=>setFormData({...formData, fFin:e.target.value})} />
                        </div>
                      </div>
                  </div>

                  {/* SELECCIÓN DE TÉCNICOS MEJORADA: CON DISPONIBILIDAD */}
                  <div>
                      <div className="flex justify-between mb-1 ml-1 items-center">
                          <label className="text-xs font-bold text-slate-500">TÉCNICOS DISPONIBLES</label>
                          {formData.fInicio && formData.fFin && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 rounded-full font-bold border border-emerald-200">
                              {availableTechnicians.length} Libres
                            </span>
                          )}
                      </div>
                      
                      {(!formData.fInicio || !formData.fFin) ? (
                        <div className="p-4 text-center border border-dashed border-slate-300 rounded-xl bg-slate-50">
                           <Calendar className="w-5 h-5 text-slate-400 mx-auto mb-1"/>
                           <p className="text-xs text-slate-500 font-medium">Selecciona fechas primero</p>
                        </div>
                      ) : (
                        <>
                           <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 mb-2">
                              <Search className="w-3 h-3 text-slate-400"/>
                              <input type="text" placeholder="Filtrar por nombre..." className="text-xs py-1.5 px-2 w-full outline-none" value={techSearch} onChange={e=>setTechSearch(e.target.value)}/>
                           </div>
                           <div className="h-32 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50 text-sm custom-scrollbar">
                              {availableTechnicians.length === 0 ? (
                                <div className="text-center py-4 text-xs text-rose-500 font-bold">
                                   <AlertTriangle className="w-4 h-4 mx-auto mb-1"/>
                                   ¡Todos ocupados!
                                </div>
                              ) : (
                                availableTechnicians.filter(t=>t.name.toLowerCase().includes(techSearch.toLowerCase())).map(t=>(
                                    <label key={t.name} className={`flex items-center space-x-2 p-1.5 rounded-lg cursor-pointer transition-colors ${formData.tecnicos.includes(t.name) ? 'bg-orange-50 text-orange-700 font-medium' : 'hover:bg-white text-slate-600'}`}>
                                        <input type="checkbox" checked={formData.tecnicos.includes(t.name)} onChange={()=>setFormData(prev=>({...prev, tecnicos: prev.tecnicos.includes(t.name)?prev.tecnicos.filter(x=>x!==t.name):[...prev.tecnicos, t.name]}))} className="accent-orange-600 w-4 h-4 rounded"/>
                                        <span>{t.name}</span>
                                    </label>
                                ))
                              )}
                           </div>
                        </>
                      )}
                  </div>

                  {formData.tipoTrabajo !== 'Vacaciones' && (
                    <div className="animate-in fade-in">
                        <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">VEHÍCULOS</label>
                        <div className="flex flex-wrap gap-2">
                            {TODOS_VEHICULOS.map(v=>(
                                <label key={v} className={`border px-3 py-1.5 text-xs rounded-lg cursor-pointer transition-all ${formData.vehiculos.includes(v)?'bg-slate-800 text-white border-slate-800 shadow-md transform scale-105':'bg-white text-slate-600 border-slate-200 hover:border-orange-300'}`}>
                                    <input type="checkbox" className="hidden" checked={formData.vehiculos.includes(v)} onChange={()=>setFormData(prev=>({...prev, vehiculos: prev.vehiculos.includes(v)?prev.vehiculos.filter(x=>x!==v):[...prev.vehiculos, v]}))} />
                                    {v}
                                </label>
                            ))}
                        </div>
                    </div>
                  )}

                  <FileUploader files={formData.files} setFiles={(f)=>setFormData({...formData, files:f})} label="DOCUMENTACIÓN" />
                  <textarea className="input-field h-24 text-sm resize-none" placeholder="Observaciones y detalles importantes..." value={formData.observaciones} onChange={e=>setFormData({...formData, observaciones:e.target.value})} />

                  {/* VISUALIZADOR DE REPORTE TÉCNICO EN MODO EDICIÓN */}
                  {editingId && (
                    <TechReportViewer service={services.find(s => s.id === editingId)} />
                  )}

                  {editingId && formData.tipoTrabajo !== 'Vacaciones' && (
                      <div className="border border-rose-100 p-3 rounded-xl bg-rose-50/50">
                          <label className="flex items-center space-x-2 font-bold text-rose-700 text-sm cursor-pointer">
                              <input type="checkbox" className="accent-rose-600 w-4 h-4" checked={formData.postergado} onChange={e=>setFormData({...formData, postergado:e.target.checked})} />
                              <span>MARCAR COMO POSTERGADO</span>
                          </label>
                          {formData.postergado && <input type="text" placeholder="Motivo de la postergación..." className="input-field mt-3 bg-white border-rose-200 focus:border-rose-400 focus:ring-rose-100" value={formData.motivoPostergacion} onChange={e=>setFormData({...formData, motivoPostergacion:e.target.value})}/>}
                      </div>
                  )}

                  <button type="submit" className="w-full bg-orange-600 text-white py-3.5 rounded-xl font-bold hover:bg-orange-700 shadow-lg shadow-orange-200 transition-all active:scale-95 flex justify-center items-center">
                    {editingId ? <><Save className="w-4 h-4 mr-2"/> Guardar Cambios</> : <><Plus className="w-4 h-4 mr-2"/> {formData.tipoTrabajo === 'Vacaciones' ? 'Registrar Vacaciones' : 'Agendar Servicio'}</>}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center flex flex-col items-center justify-center flex-1 text-slate-400">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4"><Calendar className="w-8 h-8 opacity-20"/></div>
               <p className="text-sm font-medium">Panel Técnico</p>
               <p className="text-xs opacity-70 mt-1">Selecciona tus tareas en el panel principal.</p>
            </div>
          )}

          <div className="p-4 border-t border-slate-100 bg-white">
             <button onClick={()=>setUser(null)} className="flex items-center justify-center w-full py-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-sm font-medium"><LogOut className="w-4 h-4 mr-2"/> Cerrar Sesión</button>
          </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden pt-14 lg:pt-0 relative z-10">
         {isAdmin && (
             <header className="hidden lg:flex bg-white/95 border-b border-slate-100 px-8 py-5 justify-between items-center shadow-sm backdrop-blur-sm">
                 <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard</h1>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Visión General de Operaciones</p>
                 </div>
                 <div className="flex bg-slate-100 p-1.5 rounded-xl">
                     {[
                         {id:'gantt', label:'Gantt', icon:Calendar},
                         // {id:'map', label:'Mapa en Vivo', icon:Map},  <-- LINEA ELIMINADA/COMENTADA
                         {id:'sheet', label:'Planilla', icon:List}, 
                         {id:'vacations', label:'Vacaciones', icon:Palmtree}, 
                         {id:'history', label:'Histórico', icon:History},
                         {id:'kpis', label:'KPIs', icon:BarChart2}
                     ].map(tab=>(
                         <button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab===tab.id?'bg-white text-orange-600 shadow-sm scale-100':'text-slate-500 hover:text-slate-700 scale-95'}`}>
                             <tab.icon className="w-4 h-4 mr-2"/> {tab.label}
                         </button>
                     ))}
                 </div>
             </header>
         )}

         <main className="flex-1 overflow-auto p-4 lg:p-8 custom-scrollbar">
             {notification && <div className={`fixed top-24 right-8 px-6 py-4 rounded-xl shadow-2xl text-white font-bold z-50 animate-in slide-in-from-right flex items-center ${notification.type==='error'?'bg-rose-500':'bg-emerald-500'}`}>{notification.type==='error'?<AlertTriangle className="mr-2 w-5 h-5"/>:<CheckCircle className="mr-2 w-5 h-5"/>} {notification.msg}</div>}
             
             {isAdmin ? (
                 <div className="max-w-7xl mx-auto">
                    {/* --- VISTAS ADMIN --- */}
                    {activeTab === 'gantt' && <GanttChart mode="operations" />}
                    {/* {activeTab === 'map' && <LiveFleetMap />} */}  {/* <-- LINEA ELIMINADA/COMENTADA */}
                    {activeTab === 'sheet' && <ServiceSheet mode="operations" />}
                    
                    {activeTab === 'vacations' && (
                        <div className="space-y-8 animate-in fade-in">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <h3 className="text-lg font-bold text-slate-700 flex items-center"><Palmtree className="w-5 h-5 mr-2 text-sky-500"/> Cronograma de Vacaciones</h3>
                                </div>
                                <GanttChart mode="vacations" />
                            </div>
                            
                            <div className="pt-6 border-t border-slate-200">
                                <h3 className="text-lg font-bold text-slate-700 flex items-center mb-4"><List className="w-5 h-5 mr-2 text-slate-500"/> Listado de Ausencias</h3>
                                <ServiceSheet mode="vacations" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && <TransformerHistory />}
                    {activeTab === 'kpis' && <KPIs />}
                 </div>
             ) : (
                 <div className="max-w-5xl mx-auto">
                    {/* --- NAVEGACIÓN PARA TÉCNICOS --- */}
                    <div className="flex justify-center mb-6">
                        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                            <button 
                                onClick={() => setActiveTab('tasks')} 
                                className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'tasks' ? 'bg-orange-100 text-orange-700' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <LayoutList className="w-4 h-4 mr-2"/> Mis Tareas
                            </button>
                            <button 
                                onClick={() => setActiveTab('history')} 
                                className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-orange-100 text-orange-700' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <History className="w-4 h-4 mr-2"/> Historial Equipos
                            </button>
                        </div>
                    </div>

                    {activeTab === 'tasks' && <TechPortal />}
                    {activeTab === 'history' && <TransformerHistory />}
                 </div>
             )}
         </main>
      </div>

      {/* MODAL EVIDENCIA (TECNICO) */}
      <Modal isOpen={!!uploadingEvidenceService} onClose={()=>setUploadingEvidenceService(null)} title="Subir Evidencia en Proceso">
          <div className="space-y-4">
              <p className="text-sm text-slate-500">Carga fotos o documentos de avance sin cerrar el servicio.</p>
              
              <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Comentario de Avance</label>
                  <textarea 
                    className="input-field h-20 resize-none" 
                    placeholder="Describe el avance (ej: Desmontaje completado...)" 
                    value={evidenceData.comment} 
                    onChange={e=>setEvidenceData({...evidenceData, comment:e.target.value})} 
                  />
              </div>

              <FileUploader 
                files={evidenceData.files} 
                setFiles={(newFiles) => setEvidenceData({ ...evidenceData, files: newFiles })} 
                label="ARCHIVOS DE AVANCE" 
                required={false}
                isOffline={!isOnline}
              />
              <button onClick={handleTechEvidenceUpload} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">Guardar Avance</button>
          </div>
      </Modal>

      {/* MODAL CARGA HORAS (TECNICO) */}
      <Modal isOpen={!!loggingHoursService} onClose={()=>setLoggingHoursService(null)} title="Cargar Horas (Parte Diario)">
          <div className="space-y-4">
              <p className="text-sm text-slate-500 mb-2">Registra tu jornada laboral para el servicio actual.</p>
              <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Fecha</label>
                  <input type="date" className="input-field" value={dailyLogData.date} onChange={e=>setDailyLogData({...dailyLogData, date:e.target.value})} />
              </div>
              
              {/* SELECTOR DE PERSONAL PARA HORAS (NUEVO) */}
              <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Personal Involucrado</label>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 max-h-32 overflow-y-auto custom-scrollbar">
                      {loggingHoursService?.tecnicos.map(t => (
                          <label key={t} className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${techsForHours.includes(t) ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-white text-slate-600'}`}>
                              <input 
                                  type="checkbox" 
                                  checked={techsForHours.includes(t)} 
                                  onChange={() => {
                                      setTechsForHours(prev => 
                                          prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
                                      );
                                  }}
                                  className="accent-indigo-600 w-4 h-4 rounded"
                              />
                              <span className="text-xs">{t}</span>
                          </label>
                      ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 italic">Desmarca a quienes no trabajaron en este horario.</p>
              </div>

              <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Tipo de Actividad</label>
                  <select 
                    className="input-field"
                    value={dailyLogData.type}
                    onChange={e=>setDailyLogData({...dailyLogData, type:e.target.value})}
                  >
                    <option value="Trabajo">Trabajo en Sitio</option>
                    <option value="Viaje">Viaje / Traslado</option>
                  </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Hora Inicio</label>
                      <input type="time" className="input-field" value={dailyLogData.start} onChange={e=>setDailyLogData({...dailyLogData, start:e.target.value})} />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Hora Fin</label>
                      <input type="time" className="input-field" value={dailyLogData.end} onChange={e=>setDailyLogData({...dailyLogData, end:e.target.value})} />
                  </div>
              </div>
              <button onClick={handleLogHours} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 mt-2">Registrar Horas</button>
          </div>
      </Modal>

      {/* MODAL ENCUESTA NPS (NUEVO) */}
      <Modal isOpen={showNPSModal} onClose={()=>setShowNPSModal(false)} title="Encuesta de Satisfacción">
          <div className="space-y-6 text-center">
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                  <QrCode className="w-16 h-16 mx-auto text-purple-600 mb-3"/>
                  <h4 className="font-bold text-slate-800">Escanea para Calificar</h4>
                  <p className="text-xs text-slate-500 mt-1">Pídele al cliente que escanee este código.</p>
              </div>
              
              {/* QR Code Generado Dinámicamente */}
              <div className="flex justify-center my-4">
                  <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(NPS_FORM_URL)}`} 
                      alt="QR Encuesta" 
                      className="rounded-lg shadow-lg border-4 border-white"
                  />
              </div>

              <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">O comparte el enlace</p>
                  <div className="flex gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={NPS_FORM_URL} 
                        className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 w-full text-slate-500 select-all"
                      />
                      <button 
                        onClick={() => { navigator.clipboard.writeText(NPS_FORM_URL); showNotification("Enlace copiado!"); }}
                        className="bg-purple-600 text-white px-3 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                          <Copy className="w-4 h-4"/>
                      </button>
                  </div>
              </div>
          </div>
      </Modal>

      {/* MODAL FINALIZAR SERVICIO */}
      <Modal isOpen={!!closingService} onClose={()=>setClosingService(null)} title="Finalizar Servicio">
          <div className="space-y-5">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                  <div className="flex justify-between mb-2"><span className="text-slate-400 font-bold text-xs uppercase">Cliente</span><span className="font-bold text-slate-700">{closingService?.cliente}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400 font-bold text-xs uppercase">OCI</span><span className="font-mono font-bold text-slate-700">{closingService?.oci}</span></div>
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Resultado</label>
                  <div className="flex gap-3">
                      <button onClick={()=>setClosureData({...closureData, status:'Finalizado'})} className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${closureData.status==='Finalizado'?'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm':'bg-white border-slate-200 text-slate-400 hover:border-emerald-200'}`}>Finalizado</button>
                      <button onClick={()=>setClosureData({...closureData, status:'No Finalizado'})} className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${closureData.status==='No Finalizado'?'bg-rose-50 border-rose-500 text-rose-700 shadow-sm':'bg-white border-slate-200 text-slate-400 hover:border-rose-200'}`}>No Finalizado</button>
                  </div>
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Observaciones Finales</label>
                  <textarea className="input-field h-28 resize-none" placeholder="Detalle técnico del trabajo realizado..." value={closureData.observation} onChange={e=>setClosureData({...closureData, observation:e.target.value})} />
              </div>
              {closureData.status === 'No Finalizado' && (
                  <div className="animate-in slide-in-from-top-2">
                      <label className="block text-xs font-bold text-rose-500 mb-2 uppercase tracking-wider">Motivo Específico</label>
                      <input type="text" className="input-field border-rose-200 focus:border-rose-500 focus:ring-rose-100" placeholder="Ej: Falta de repuestos..." value={closureData.reason} onChange={e=>setClosureData({...closureData, reason:e.target.value})} />
                  </div>
              )}
              <FileUploader 
                files={closureData.files} 
                setFiles={(f)=>setClosureData({...closureData, files:f})} 
                label="ACTA DE SERVICIO + FOTOS" 
                required={false}
                isOffline={!isOnline}
              />
              <button onClick={handleTechClosure} className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-slate-900 mt-2 shadow-lg transition-transform active:scale-95">Confirmar y Cerrar</button>
          </div>
      </Modal>

      {/* MODAL REABRIR SERVICIO */}
      <Modal isOpen={!!reopeningService} onClose={()=>setReopeningService(null)} title="Reabrir Servicio">
          <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-xl text-orange-800 text-sm border border-orange-100 flex items-start">
                  <AlertTriangle className="w-5 h-5 mr-3 shrink-0" />
                  <p>Estás a punto de reabrir un caso finalizado. Esto cambiará su estado a <strong>En Servicio</strong> y podrás cargar nuevas evidencias u horas.</p>
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Motivo de Reapertura</label>
                  <textarea 
                      className="input-field h-24 resize-none" 
                      placeholder="Explica por qué se reabre el trabajo..." 
                      value={reopenReason} 
                      onChange={e=>setReopenReason(e.target.value)} 
                  />
              </div>
              <button onClick={handleReopenService} className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 shadow-lg shadow-orange-200">
                  Confirmar Reapertura
              </button>
          </div>
      </Modal>

      {/* MODAL GESTIONAR PERSONAL (Mejorado) */}
      <Modal isOpen={isManageTechOpen} onClose={()=>setIsManageTechOpen(false)} title="Equipo de Trabajo" size="lg">
         <div className="space-y-6">
            <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 flex gap-4 items-end">
               <div className="flex-1">
                  <label className="text-xs font-bold text-orange-700 uppercase mb-1 block">Nuevo Técnico</label>
                  <input type="text" className="input-field bg-white" placeholder="Nombre completo" value={newTechName} onChange={e=>setNewTechName(e.target.value.toUpperCase())} />
               </div>
               <div className="flex-1">
                  <label className="text-xs font-bold text-orange-700 uppercase mb-1 block">Teléfono</label>
                  <input type="text" className="input-field bg-white" placeholder="Ej: 549351..." value={newTechPhone} onChange={e=>setNewTechPhone(e.target.value)} />
               </div>
               <div className="w-32">
                  <label className="text-xs font-bold text-orange-700 uppercase mb-1 block">Contraseña</label>
                  <input type="text" className="input-field bg-white" placeholder="Clave" value={newTechPassword} onChange={e=>setNewTechPassword(e.target.value)} />
               </div>
               <button onClick={addTechnician} className="bg-orange-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-orange-700 h-[46px] shadow-md shadow-orange-200 transition-transform active:scale-95">Agregar</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
               {tecnicosData.sort((a,b)=>a.name.localeCompare(b.name)).map(t=>(
                  <div key={t.name} className="flex flex-col p-4 border border-slate-100 rounded-xl hover:border-orange-200 hover:shadow-sm bg-white group transition-all">
                     <div className="flex justify-between items-center mb-2">
                        <div className="font-bold text-slate-800">{t.name}</div>
                        <button onClick={()=>removeTechnician(t.id, t.name)} className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                     </div>
                     <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                           <label className="text-slate-400 font-bold block mb-0.5">Teléfono</label>
                           <input 
                              type="text" 
                              className="w-full bg-slate-50 border-b border-transparent hover:border-slate-300 focus:border-orange-500 outline-none p-1 rounded" 
                              value={t.phone} 
                              onChange={(e)=>updateTechData(t.id, 'phone', e.target.value)}
                           />
                        </div>
                        <div>
                           <label className="text-slate-400 font-bold block mb-0.5">Contraseña</label>
                           <input 
                              type="text" 
                              className="w-full bg-slate-50 border-b border-transparent hover:border-slate-300 focus:border-orange-500 outline-none p-1 rounded font-mono text-slate-600" 
                              value={t.password} 
                              onChange={(e)=>updateTechData(t.id, 'password', e.target.value)}
                           />
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </Modal>
      
      {/* MODAL CONFIRMAR ELIMINACIÓN SERVICIO */}
      <Modal isOpen={!!deletingId} onClose={() => setDeletingId(null)} title="Confirmar Eliminación" size="sm">
        <div className="text-center p-4">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertOctagon className="w-8 h-8 text-rose-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">¿Estás seguro?</h3>
          <p className="text-sm text-slate-500 mb-6">Esta acción eliminará el servicio de forma permanente. No se puede deshacer.</p>
          <div className="flex gap-3 justify-center">
            <button 
              type="button"
              onClick={() => setDeletingId(null)} 
              className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="button"
              onClick={confirmDelete} 
              className="px-5 py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
            >
              Sí, Eliminar
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showMsgModal} onClose={()=>setShowMsgModal(false)} title="📢 Notificar Asignación">
         <div className="grid gap-3">
             {lastSavedService?.tecnicos.length > 0 ? (
                 lastSavedService.tecnicos.map(t => (
                     <button key={t} onClick={()=>handleWhatsApp(t)} className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all group">
                         <div className="flex items-center"><div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-3 text-slate-500 font-bold">{t.charAt(0)}</div><span className="font-bold text-slate-700">{t}</span></div>
                         <span className="text-emerald-600 flex items-center text-sm font-bold bg-emerald-50 px-3 py-1.5 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors"><MessageCircle className="w-4 h-4 mr-2"/> Enviar Ticket</span>
                     </button>
                 ))
             ) : (
                 <p className="text-center text-slate-500 text-sm py-4">No hay técnicos asignados para notificar.</p>
             )}
         </div>
      </Modal>
    </div>
  );
}