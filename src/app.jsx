import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Calendar, Truck, AlertTriangle, CheckCircle, BarChart2, Table, 
  Trash2, Plus, X, Search, Edit2, LogOut, Menu, Copy, MessageCircle, Settings, 
  Phone, Lock, UserPlus, ExternalLink, Paperclip, FileText, Image as ImageIcon, 
  History, Eye, Save, XCircle, CheckSquare, List, MapPin, PlayCircle, Clock, Activity,
  Briefcase, ChevronRight, Globe, Map as MapIcon, Filter, TrendingUp, UserCheck, CalendarPlus,
  Zap, Users, Target, Info, HelpCircle, Key, FileCheck, Timer, FolderOpen, AlertOctagon, Cloud,
  ShieldCheck, Loader, RotateCcw, LayoutList, Palmtree, ArrowUpDown, UserX, QrCode, Wifi, WifiOff, RefreshCw, Navigation, Layers, ChevronDown,
  Columns, Wrench, BarChart, Factory, Mail
} from 'lucide-react';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, getDoc, setDoc, query, where, enableIndexedDbPersistence } from 'firebase/firestore';

// --- CONFIGURACIÓN DE FIREBASE ---
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

try {
    enableIndexedDbPersistence(db).catch((err) => {});
} catch (e) {}

// --- CONSTANTES ---
const BACKGROUND_IMAGE = "https://i.imgur.com/EfUXRhd.png"; 
const COMPANY_LOGO = "https://imgur.com/tH8Cu4p.png"; 
const NPS_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSelB7HDV2efUR4Wz3xohZqp1U9EXSx9LVpu0GN0WDXxMdIX6w/viewform";

const TIPOS_TRABAJO = [
  "Montaje de Transformador", "Supervisión de Montaje", "Asistencia por reclamo", 
  "Servicio de Mantenimiento", "Toma de Muestras (Únicamente)", 
  "Ensayos Eléctricos (Únicamente)", "Supervisión de Puesta en Marcha", 
  "Desmontaje de Transformador", "Análisis de Aceite", "Vacaciones", "Estudios Médicos", "Otro"
];

const COLORS_TRABAJO = {
  "Montaje de Transformador": "#ea580c", "Supervisión de Montaje": "#f97316", "Asistencia por reclamo": "#ef4444", 
  "Servicio de Mantenimiento": "#10b981", "Toma de Muestras (Únicamente)": "#f59e0b", "Ensayos Eléctricos (Únicamente)": "#8b5cf6", 
  "Supervisión de Puesta en Marcha": "#06b6d4", "Desmontaje de Transformador": "#c2410c", "Análisis de Aceite": "#64748b", "Vacaciones": "#38bdf8", "Estudios Médicos": "#f43f5e", "Otro": "#94a3b8"
};

const FLOTA_PROPIA = ["KANGOO PLG", "KANGOO AF", "TRANSIT AG", "MASTER AB"];
const TERCERIZADOS = ["AEREO", "VEHICULO KINTO"];
const TODOS_VEHICULOS = [...FLOTA_PROPIA, ...TERCERIZADOS];

// --- PRE-CARGA DEL MAPA MUNDIAL ---
const PRELOADED_LOCATIONS = [
  { lat: -34.6037, lng: -58.3816, popupContent: '<b>Cliente: Edesur S.A.</b><br>' },
  { lat: -37.3782, lng: -64.6042, popupContent: '<b>General Acha, La Pampa</b>' },
  { lat: -31.4647, lng: -64.3575, popupContent: '<b>Malagueño, Córdoba</b>' },
  { lat: -28.0652, lng: -67.5644, popupContent: '<b>Tinogasta, Catamarca</b>' },
  { lat: -45.8641, lng: -67.4965, popupContent: '<b>Comodoro Rivadavia, Chubut</b>' },
  { lat: -38.9516, lng: -68.0591, popupContent: '<b>Neuquén, Neuquén</b>' },
  { lat: -34.0833, lng: -59.0333, popupContent: '<b>Zárate, Buenos Aires</b>' },
  { lat: -23.4005, lng: -66.3672, popupContent: '<b>Susques, Jujuy</b>' },
  { lat: -30.2333, lng: -68.7500, popupContent: '<b>Jáchal, San Juan</b>' },
  { lat: -34.8584, lng: -57.9084, popupContent: '<b>Ensenada, Buenos Aires</b>' },
  { lat: -31.4201, lng: -64.1888, popupContent: '<b>Córdoba, Córdoba</b>' },
  { lat: -31.6804, lng: -63.8821, popupContent: '<b>Pilar, Córdoba</b>' },
  { lat: -32.7231, lng: -71.4158, popupContent: '<b>Puchuncaví, Chile</b>' },
  { lat: -33.1235, lng: -64.3499, popupContent: '<b>Río Cuarto, Córdoba</b>' },
  { lat: -27.2721, lng: -62.2345, popupContent: '<b>Otumpa, Santiago del Estero</b>' },
  { lat: -38.7196, lng: -62.2724, popupContent: '<b>Bahía Blanca, Buenos Aires</b>' },
  { lat: -41.1335, lng: -71.3103, popupContent: '<b>Bariloche, Río Negro</b>' },
  { lat: -28.0267, lng: -56.0272, popupContent: '<b>Virasoro, Corrientes</b>' },
  { lat: -46.5895, lng: -70.9309, popupContent: '<b>Perito Moreno, Santa Cruz</b>' },
  { lat: -34.6118, lng: -58.7656, popupContent: '<b>Trujui, Buenos Aires</b>' },
  { lat: -31.6389, lng: -68.9600, popupContent: '<b>Punta Negra, San Juan</b>' },
  { lat: -32.1800, lng: -64.4167, popupContent: '<b>Embalse, Córdoba</b>' },
  { lat: -30.9333, lng: -69.6000, popupContent: '<b>Tocota, San Juan</b>' },
  { lat: -34.7069, lng: -58.3100, popupContent: '<b>Bernal, Buenos Aires</b>' },
  { lat: -42.7692, lng: -65.0245, popupContent: '<b>Puerto Madryn, Chubut</b>' },
  { lat: -38.8386, lng: -61.8594, popupContent: '<b>Bajo Hondo, Buenos Aires</b>' },
  { lat: -32.1764, lng: -64.1132, popupContent: '<b>Río Tercero, Córdoba</b>' },
  { lat: -37.3217, lng: -59.1332, popupContent: '<b>Tandil, Buenos Aires</b>' },
  { lat: -39.8142, lng: -73.2459, popupContent: '<b>Valdivia, Chile</b>' },
  { lat: -32.6284, lng: -62.6868, popupContent: '<b>Bell Ville, Córdoba</b>' },
  { lat: -46.5458, lng: -71.6277, popupContent: '<b>Los Antiguos, Santa Cruz</b>' },
  { lat: -39.7554, lng: -65.7362, popupContent: '<b>El Solito, Río Negro</b>' },
  { lat: -37.9833, lng: -60.1000, popupContent: '<b>Adolfo Gonzales Chaves, Buenos Aires</b>' },
  { lat: -24.7859, lng: -65.0453, popupContent: '<b>Güemes, Salta</b>' },
  { lat: -28.4696, lng: -65.7852, popupContent: '<b>Catamarca, Catamarca</b>' },
  { lat: -34.8167, lng: -58.5167, popupContent: '<b>Ezeiza, Buenos Aires</b>' },
  { lat: -37.9500, lng: -68.8500, popupContent: '<b>Rincón de los Sauces, Neuquén</b>' },
  { lat: -34.1167, lng: -63.3667, popupContent: '<b>Laboulaye, Córdoba</b>' },
  { lat: -39.4333, lng: -66.2167, popupContent: '<b>Pomona, Río Negro</b>' },
  { lat: -33.2867, lng: -60.5847, popupContent: '<b>Arroyo Seco, Santa Fe</b>' },
  { lat: -31.7319, lng: -60.5238, popupContent: '<b>Paraná, Entre Ríos</b>' },
  { lat: -34.1633, lng: -58.9592, popupContent: '<b>Campana, Buenos Aires</b>' },
  { lat: -29.9833, lng: -64.3500, popupContent: '<b>Villa de María, Córdoba</b>' },
  { lat: -34.1833, lng: -70.3333, popupContent: '<b>El Teniente (Maitenes), Chile</b>' },
  { lat: -25.2637, lng: -57.5759, popupContent: '<b>Asunción, Paraguay</b>' },
  { lat: -38.9960, lng: -64.2591, popupContent: '<b>Río Colorado, Río Negro</b>' },
  { lat: -36.8889, lng: -60.3225, popupContent: '<b>Olavarría, Buenos Aires</b>' },
  { lat: -25.4667, lng: -57.5500, popupContent: '<b>Ypané, Paraguay</b>' },
  { lat: -39.1167, lng: -65.2667, popupContent: '<b>Pichi Mahuida, Río Negro</b>' },
  { lat: -34.6037, lng: -58.3816, popupContent: '<b>Buenos Aires, CABA</b>' },
  { lat: -26.9000, lng: -61.1667, popupContent: '<b>Pampa del Infierno, Chaco</b>' },
  { lat: -36.0151, lng: -59.0967, popupContent: '<b>Las Flores, Buenos Aires</b>' },
  { lat: -32.3333, lng: -64.9667, popupContent: '<b>Los Molles, San Luis</b>' },
  { lat: -36.6500, lng: -61.2667, popupContent: '<b>La Elbita, Buenos Aires</b>' },
  { lat: -35.9833, lng: -62.7333, popupContent: '<b>Trenque Lauquen, Buenos Aires</b>' },
  { lat: -38.5744, lng: -58.7885, popupContent: '<b>Necochea, Buenos Aires</b>' },
  { lat: -37.1667, lng: -57.9167, popupContent: '<b>Las Armas, Buenos Aires</b>' },
  { lat: -35.6167, lng: -69.5833, popupContent: '<b>Malargüe, Mendoza</b>' },
  { lat: -28.3167, lng: -63.1333, popupContent: '<b>Lugones, Santiago del Estero</b>' },
  { lat: -27.9500, lng: -63.8833, popupContent: '<b>Forres, Santiago del Estero</b>' },
  { lat: -27.5833, lng: -60.4167, popupContent: '<b>Villa Ángela, Chaco</b>' },
  { lat: -28.4500, lng: -63.4667, popupContent: '<b>Garza, Santiago del Estero</b>' },
  { lat: -27.4606, lng: -58.8341, popupContent: '<b>Corrientes, Corrientes</b>' },
  { lat: -33.3021, lng: -66.3368, popupContent: '<b>San Luis, San Luis</b>' },
  { lat: -31.5500, lng: -65.0167, popupContent: '<b>Villa Cura Brochero, Córdoba</b>' },
  { lat: -34.1208, lng: -70.4358, popupContent: '<b>Sewell, Chile</b>' },
  { lat: -23.4000, lng: -57.1667, popupContent: '<b>Horqueta, Paraguay</b>' },
  { lat: -27.8167, lng: -64.0667, popupContent: '<b>Robles, Santiago del Estero</b>' },
  { lat: 35.2529,  lng: -95.3486, popupContent: '<b>Eufaula Dam, Oklahoma, USA</b>' },
  { lat: 39.7817,  lng: -89.6501, popupContent: '<b>Springfield, Illinois, USA</b>' },
  { lat: 47.4235,  lng: -120.3103, popupContent: '<b>Wenatchee, Washington, USA</b>' },
  { lat: 44.9778,  lng: -93.2650, popupContent: '<b>Minneapolis, Minnesota, USA</b>' },
  { lat: 41.3459,  lng: -73.0784, popupContent: '<b>Ansonia, Connecticut, USA</b>' },
  { lat: 36.2920,  lng: -95.6186, popupContent: '<b>Pryor Creek, Oklahoma, USA</b>' },
  { lat: 33.4735,  lng: -82.0105, popupContent: '<b>Augusta, Georgia, USA</b>' },
  { lat: 44.0582,  lng: -121.3153, popupContent: '<b>Bend, Oregon, USA</b>' },
  { lat: 33.9982,  lng: -96.3378, popupContent: '<b>Durant, Oklahoma, USA</b>' },
  { lat: 32.0232,  lng: -97.3917, popupContent: '<b>Blum, Texas, USA</b>' },
  { lat: 8.2936,   lng: -62.7208, popupContent: '<b>Puerto Ordaz, Venezuela</b>' },
  { lat: 13.6929,  lng: -89.2182, popupContent: '<b>San Salvador, El Salvador</b>' },
  { lat: 25.0479,  lng: -77.3554, popupContent: '<b>Nassau, Bahamas</b>' },
  { lat: 19.3133,  lng: -81.3875, popupContent: '<b>George Town, Cayman Islands</b>' },
  { lat: 21.2323,  lng: -86.7303, popupContent: '<b>Isla Mujeres, Mexico</b>' },
  { lat: -32.4075, lng: -63.2402, popupContent: '<b>Villa María, Córdoba</b>' },
  { lat: 32.3792,  lng: -86.3077, popupContent: '<b>Montgomery, Alabama, USA</b>' },
  { lat: 30.2980,  lng: -87.6833, popupContent: '<b>Foley, Alabama, USA</b>' },
  { lat: 35.5398,  lng: -109.8037, popupContent: '<b>Oak Springs, Arizona, USA</b>' },
  { lat: -25.4284, lng: -49.2733, popupContent: '<b>Curitiba, Brazil</b>' },
  { lat: -17.7833, lng: -63.1833, popupContent: '<b>Santa Cruz de la Sierra, Bolivia</b>' },
  { lat: -24.9140, lng: -65.4883, popupContent: '<b>Cerrillos, Salta</b>' },
  { lat: -43.2489, lng: -65.3094, popupContent: '<b>Trelew, Chubut</b>' },
  { lat: -31.8360, lng: -60.5165, popupContent: '<b>Oro Verde, Entre Ríos</b>' },
  { lat: -34.5153, lng: -58.7658, popupContent: '<b>José C. Paz, Buenos Aires</b>' },
  { lat: -32.9247, lng: -68.7972, popupContent: '<b>Luzuriaga, Mendoza</b>' },
  { lat: -43.7667, lng: -66.4500, popupContent: '<b>Dique Florentino Ameghino, Chubut</b>' },
  { lat: -29.4131, lng: -66.8557, popupContent: '<b>La Rioja (ET Tardecitas)</b>' },
  { lat: -34.9205, lng: -57.9536, popupContent: '<b>La Plata, Buenos Aires</b>' },
  { lat: -51.3536, lng: -70.4373, popupContent: '<b>La Esperanza, Santa Cruz</b>' },
  { lat: -39.0333, lng: -67.5833, popupContent: '<b>General Roca, Río Negro</b>' },
  { lat: -31.8667, lng: -62.7167, popupContent: '<b>Las Varillas, Córdoba</b>' },
  { lat: -38.2500, lng: -61.9000, popupContent: '<b>Tres Picos, Buenos Aires</b>' },
  { lat: -34.8039, lng: -69.6053, popupContent: '<b>El Sosneado, Mendoza</b>' },
  { lat: -26.8329, lng: -65.1664, popupContent: '<b>Banda del Río Salí, Tucumán</b>' },
  { lat: -26.9167, lng: -65.3333, popupContent: '<b>Lules, Tucumán</b>' },
  { lat: -38.9333, lng: -69.2333, popupContent: '<b>Cutral Có, Neuquén</b>' },
  { lat: -46.5895, lng: -70.9309, popupContent: '<b>Perito Moreno, Santa Cruz</b>' },
  { lat: -53.7883, lng: -67.7032, popupContent: '<b>Río Grande, Tierra del Fuego</b>' }
];

const extractCoordinates = (str) => {
    if (!str) return null;
    const match = str.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
    if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }
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

// --- ESTILOS GLOBALES ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
    .input-field { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; background-color: #f8fafc; outline: none; transition: all 0.2s; font-size: 0.9rem; color: #334155; }
    .input-field:focus { border-color: #f97316; background-color: #ffffff; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1); }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    .app-background { background-image: url('${BACKGROUND_IMAGE}'); background-size: cover; background-position: center; background-repeat: no-repeat; }
    .app-overlay { background-color: rgba(255, 255, 255, 0.90); backdrop-filter: blur(2px); }
    .kanban-column { transition: background-color 0.2s; }
    .kanban-card { transition: transform 0.2s, box-shadow 0.2s; cursor: grab; }
    .kanban-card:active { cursor: grabbing; transform: scale(1.02); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
    .leaflet-container { font-family: 'Inter', sans-serif; z-index: 0; }
    .animate-in { animation: fadeIn 0.3s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `}</style>
);

// --- COMPONENTES UI (Modal, FileUploader, etc.) ---
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizeClasses = size === 'lg' ? 'max-w-4xl' : size === 'sm' ? 'max-w-sm' : 'max-w-md';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm transition-all">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses} overflow-hidden animate-in flex flex-col max-h-[90vh]`}>
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
          <div><table className="w-full text-xs text-left"><thead><tr className="text-slate-400 border-b border-slate-200"><th className="pb-2">Fecha</th><th className="pb-2">Personal</th><th className="pb-2">Tipo</th><th className="pb-2">Horario</th><th className="pb-2 text-right">Hs Total</th></tr></thead><tbody>{hours.length===0?<tr><td colSpan="6" className="text-center py-4 text-slate-400 italic">Sin horas cargadas.</td></tr>:hours.map((h,i)=>{const start=new Date(`2000-01-01T${h.start}`);const end=new Date(`2000-01-01T${h.end}`);let duration=(end-start)/(1000*60*60);if(duration<0)duration+=24;const workerList=h.workers||[];const techCount=workerList.length>0?workerList.length:1;const totalManHours=duration*techCount;const workerDisplay=(workerList.length>0)?workerList.join(', '):'Equipo Completo';return(<tr key={i} className="border-b border-slate-100 last:border-0"><td className="py-2 font-medium text-slate-700">{h.date}</td><td className="py-2 text-slate-500 max-w-[100px] truncate" title={workerDisplay}>{workerDisplay}</td><td className="py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${h.type==='Viaje'?'bg-indigo-100 text-indigo-700':'bg-orange-100 text-orange-700'}`}>{h.type||'Trabajo'}</span></td><td className="py-2 text-slate-600">{h.start} - {h.end}</td><td className="py-2 font-bold text-slate-800 text-right">{totalManHours.toFixed(1)}{techCount>1&&<span className="text-[10px] text-slate-400 font-normal ml-1 block">({duration.toFixed(1)}h x {techCount})</span>}</td></tr>)})}</tbody></table></div>
        )}
        {activeTab === 'closure' && (
          <div>
            {!closure ? <p className="text-xs text-slate-400 italic text-center">Servicio no finalizado aún.</p> : (
              <div className="space-y-3">
                 <div className={`p-2 rounded text-xs font-bold text-center border ${closure.status === 'Finalizado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>ESTADO FINAL: {closure.status.toUpperCase()}</div>
                 {closure.reason && <p className="text-xs text-rose-600 font-medium">Motivo: {closure.reasonType} - {closure.reason}</p>}
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

// --- COMPONENTES KANBAN Y GANTT ---
const KanbanBoard = ({ services, onStatusChange, handleEdit }) => {
    const columns = [
        { id: 'Agendado', label: 'Agendado', color: 'bg-amber-50 border-amber-200 text-amber-700' },
        { id: 'En Servicio', label: 'En Servicio', color: 'bg-blue-50 border-blue-200 text-blue-700' },
        { id: 'No Finalizado', label: 'Pendiente / Postergado', color: 'bg-rose-50 border-rose-200 text-rose-700' },
        { id: 'Finalizado', label: 'Finalizado', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' }
    ];
    const handleDragStart = (e, serviceId) => e.dataTransfer.setData("serviceId", serviceId);
    const handleDragOver = (e) => e.preventDefault();
    const handleDrop = (e, targetStatus) => {
        const serviceId = e.dataTransfer.getData("serviceId");
        if (serviceId) onStatusChange(serviceId, targetStatus);
    };
    const getServicesByStatus = (status) => {
        return services.filter(s => {
            if (status === 'No Finalizado') return s.estado === 'No Finalizado' || s.postergado;
            if (status === 'Agendado') return s.estado === 'Agendado' && !s.postergado;
            return s.estado === status && !s.postergado;
        }).sort((a,b) => new Date(a.fInicio) - new Date(b.fInicio));
    };
    return (
        <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-200px)] overflow-x-auto pb-4">
            {columns.map(col => (
                <div key={col.id} className={`kanban-column flex-1 min-w-[280px] bg-slate-100/50 rounded-2xl border ${col.color.split(' ')[1]} flex flex-col`} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.id)}>
                    <div className={`p-3 rounded-t-xl font-bold border-b text-sm flex justify-between items-center ${col.color}`}>
                        <span>{col.label}</span><span className="bg-white/50 px-2 py-0.5 rounded text-xs">{getServicesByStatus(col.id).length}</span>
                    </div>
                    <div className="p-2 overflow-y-auto flex-1 custom-scrollbar space-y-2">
                        {getServicesByStatus(col.id).map(service => (
                            <div key={service.id} draggable onDragStart={(e) => handleDragStart(e, service.id)} onClick={() => handleEdit(service)} className="kanban-card bg-white p-3 rounded-xl shadow-sm border border-slate-200 group">
                                <div className="flex justify-between items-start mb-1"><span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">{service.oci}</span>{service.alcance === 'Internacional' && <Globe className="w-3 h-3 text-orange-500"/>}</div>
                                <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1">{service.cliente}</h4>
                                <p className="text-[11px] text-slate-500 truncate mb-2">{service.tipoTrabajo === 'Otro' && service.tipoTrabajoOtro ? `Otro: ${service.tipoTrabajoOtro}` : service.tipoTrabajo}</p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-50 p-1.5 rounded-lg"><Calendar className="w-3 h-3"/><span>{service.fInicio}</span><span className="text-slate-300">|</span><Users className="w-3 h-3"/><span>{service.tecnicos.length}</span></div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const GanttChart = ({ services, mode = 'operations', handleEdit, isAdmin }) => {
    const [selectedGanttService, setSelectedGanttService] = useState(null);
    const visibleServices = useMemo(() => {
        let base = services.filter(s => s.estado !== 'Finalizado'); 
        if (mode === 'operations') { return base.filter(s => s.tipoTrabajo !== 'Vacaciones' && s.tipoTrabajo !== 'Estudios Médicos'); } 
        else if (mode === 'vacations') { return base.filter(s => s.tipoTrabajo === 'Vacaciones' || s.tipoTrabajo === 'Estudios Médicos'); }
        return base;
    }, [services, mode]);

    if (visibleServices.length === 0) return <div className="p-12 text-center text-slate-400 bg-white/90 rounded-2xl border border-dashed border-slate-200">No hay registros para mostrar.</div>;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() - 1); 

    const serviceEndDates = visibleServices.map(s => new Date(s.fFin));
    let maxDate = new Date(Math.max(...serviceEndDates, today.getTime()));
    maxDate.setDate(maxDate.getDate() + 30); 
    
    const DAY_WIDTH = 50; 
    const totalDays = Math.max((maxDate - minDate) / (1000 * 60 * 60 * 24), 30); 
    const chartWidth = totalDays * DAY_WIDTH;

    const sortedVisibleServices = [...visibleServices].sort((a,b) => new Date(a.fInicio) - new Date(b.fInicio));

    return (
        <div className="bg-white/90 rounded-2xl shadow-sm border border-slate-100 p-6 overflow-hidden backdrop-blur-sm relative flex flex-col h-[calc(100vh-200px)]">
           {selectedGanttService && (
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-2xl shadow-2xl border border-slate-100 z-[100] w-80 animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-start mb-3 pb-2 border-b border-slate-50"><div><h4 className="font-black text-slate-800 text-sm uppercase tracking-wide">{selectedGanttService.tipoTrabajo === 'Otro' && selectedGanttService.tipoTrabajoOtro ? `Otro: ${selectedGanttService.tipoTrabajoOtro}` : selectedGanttService.tipoTrabajo}</h4><span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{selectedGanttService.oci}</span></div><button onClick={(e) => { e.stopPropagation(); setSelectedGanttService(null); }} className="p-1 hover:bg-rose-50 rounded-full text-slate-400 hover:text-rose-500 transition-colors"><X className="w-5 h-5"/></button></div>
                  <div className="text-xs text-slate-600 space-y-2.5">
                      <div className="flex items-start"><CalendarPlus className="w-4 h-4 mr-2 text-orange-500 shrink-0"/> <span><span className="font-bold">Solicitado el:</span> {selectedGanttService.fSolicitud || 'N/D'}</span></div>
                      <div className="flex items-start"><Briefcase className="w-4 h-4 mr-2 text-indigo-500 shrink-0"/> <span><span className="font-bold">Cliente:</span> {selectedGanttService.cliente}</span></div>
                      <div className="flex items-start"><Users className="w-4 h-4 mr-2 text-indigo-500 shrink-0"/> <span><span className="font-bold">Equipo:</span> {selectedGanttService.tecnicos.join(', ')}</span></div>
                      <div className="flex items-start"><Calendar className="w-4 h-4 mr-2 text-indigo-500 shrink-0"/> <span><span className="font-bold">Ejecución:</span> {selectedGanttService.fInicio} al {selectedGanttService.fFin}</span></div>
                      
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 grid grid-cols-2 gap-2 mt-2">
                          <div><span className="text-[9px] text-slate-400 font-bold block uppercase">Potencia</span><span className="font-bold text-slate-700">{selectedGanttService.trafoPotencia || '-'}</span></div>
                          <div><span className="text-[9px] text-slate-400 font-bold block uppercase">Relación</span><span className="font-bold text-slate-700">{selectedGanttService.trafoRelacion || '-'}</span></div>
                          <div className="col-span-2"><span className="text-[9px] text-slate-400 font-bold block uppercase">Serie</span><span className="font-mono text-slate-700">{selectedGanttService.trafoSerie || '-'}</span></div>
                      </div>

                      {selectedGanttService.fSolicitud && (
                          <div className="bg-orange-50 text-orange-700 p-2 rounded-lg font-bold text-center border border-orange-100">
                              ⏱️ Lead Time: {Math.max(0, Math.floor((new Date(selectedGanttService.fInicio) - new Date(selectedGanttService.fSolicitud)) / (1000 * 3600 * 24)))} días
                          </div>
                      )}
                      <div className="flex items-center mt-2"><span className={`px-2 py-1 rounded text-[10px] font-bold border w-full text-center ${selectedGanttService.estado==='Finalizado'?'bg-emerald-50 border-emerald-200 text-emerald-700':selectedGanttService.estado==='En Servicio'?'bg-blue-50 border-blue-200 text-blue-700':selectedGanttService.estado==='No Finalizado'?'bg-rose-50 border-rose-200 text-rose-700':'bg-amber-50 border-amber-200 text-amber-700'}`}>{selectedGanttService.postergado ? 'POSTERGADO' : selectedGanttService.estado}</span></div>
                  </div>
              </div>
           )}
           <div className="overflow-auto custom-scrollbar flex-1 relative border rounded-xl border-slate-100">
             <div className="relative" style={{ minWidth: `${chartWidth + 200}px`, height: '100%' }}>
               <div className="sticky top-0 left-0 z-20 bg-white border-b border-slate-200 h-12 flex text-xs font-semibold text-slate-500 shadow-sm pl-48">
                  {Array.from({ length: Math.ceil(totalDays) }).map((_, i) => {
                    const d = new Date(minDate); d.setDate(d.getDate() + i);
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    const isToday = d.toDateString() === new Date().toDateString();
                    return (
                        <div key={i} className={`flex-shrink-0 border-l border-slate-100 flex flex-col justify-center items-center ${isWeekend ? 'bg-slate-50' : ''} ${isToday ? 'bg-orange-50 border-orange-200' : ''}`} style={{ width: `${DAY_WIDTH}px` }}>
                            <span className={`text-[10px] uppercase ${isToday ? 'text-orange-500 font-bold' : 'text-slate-300'}`}>{d.toLocaleString('es-ES', { weekday: 'short' })}</span><span className={`font-bold ${isToday ? 'text-orange-600' : 'text-slate-700'}`}>{d.getDate()}/{d.getMonth()+1}</span>
                        </div>
                    );
                  })}
               </div>
               <div className="pt-2">
                   {sortedVisibleServices.map((srv, idx) => {
                     const start = new Date(srv.fInicio);
                     if (new Date(srv.fFin) < minDate) return null; 

                     let offsetDays = (start - minDate) / (1000 * 60 * 60 * 24);
                     const duration = (new Date(srv.fFin) - start) / (1000 * 60 * 60 * 24) + 1;
                     const leftPos = offsetDays * DAY_WIDTH;
                     const width = Math.max(duration * DAY_WIDTH, DAY_WIDTH); 
                     const colorClass = srv.tipoTrabajo === 'Vacaciones' ? 'bg-sky-400 shadow-sky-200' : srv.estado === 'Finalizado' ? 'bg-emerald-500 shadow-emerald-200' : srv.estado === 'No Finalizado' ? 'bg-slate-700 shadow-slate-300' : srv.estado === 'En Servicio' ? 'bg-blue-500 shadow-blue-200' : srv.postergado ? 'bg-rose-500 shadow-rose-200' : 'bg-orange-500 shadow-orange-200';
                     return (
                       <div key={srv.id} className="flex items-center group hover:bg-slate-50 transition-colors h-14 border-b border-slate-50/50">
                         <div className="sticky left-0 z-10 w-48 pl-4 pr-4 bg-white/95 backdrop-blur-sm border-r border-slate-100 h-full flex items-center justify-end shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)]"><span className="text-xs font-bold text-slate-600 truncate text-right w-full" title={srv.cliente}>{mode === 'vacations' ? srv.tecnicos[0] : srv.cliente}</span></div>
                         <div className="relative h-full flex-1"><div onClick={() => setSelectedGanttService(srv)} className={`absolute h-8 top-3 rounded-lg shadow-md flex items-center px-3 text-xs text-white font-medium cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${colorClass} overflow-hidden whitespace-nowrap`} style={{ left: `${leftPos}px`, width: `${width - 4}px` }}><span className="truncate drop-shadow-md">{mode === 'vacations' ? '🏖️ Vacaciones' : `${srv.oci} - ${srv.tipoTrabajo === 'Otro' && srv.tipoTrabajoOtro ? srv.tipoTrabajoOtro : srv.tipoTrabajo}`}</span></div></div>
                         {isAdmin && <div className="sticky right-0 z-10 w-10 bg-white/50 h-full flex items-center justify-center"><button onClick={() => handleEdit(srv)} className="p-1.5 hover:bg-orange-50 rounded-full text-slate-300 hover:text-orange-600 transition-colors"><Edit2 className="w-3.5 h-3.5"/></button></div>}
                       </div>
                     );
                   })}
               </div>
               <div className="absolute top-0 bottom-0 pointer-events-none border-l-2 border-orange-400 z-0" style={{ left: `${48 * 4 + DAY_WIDTH}px` }}></div>
               <div className="absolute top-12 left-48 bottom-0 pointer-events-none flex">{Array.from({ length: Math.ceil(totalDays) }).map((_, i) => (<div key={i} className="border-r border-slate-100 h-full" style={{ width: `${DAY_WIDTH}px` }}></div>))}</div>
             </div>
           </div>
        </div>
    );
};

// --- COMPONENTE MAPA DEL MUNDO DE SERVICIOS ---
const MapDashboard = ({ services }) => {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        let initTimeout;
        const init = () => {
            if (!window.L) {
                initTimeout = setTimeout(init, 500);
                return;
            }
            if (!mapContainerRef.current) return;
            
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
            }

            if (mapContainerRef.current._leaflet_id) {
                mapContainerRef.current._leaflet_id = null;
            }

            try {
                const map = window.L.map(mapContainerRef.current).setView([-38.4161, -63.6167], 4); 
                window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap'
                }).addTo(map);
                
                mapInstanceRef.current = map;

                // Forzar re-render del mapa para evitar cuadros grises al cambiar de pestaña
                setTimeout(() => {
                    if (map) map.invalidateSize();
                }, 250);

                const transformerIcon = window.L.icon({
                    iconUrl: 'https://i.imgur.com/xX4Jhem.png',
                    iconSize:     [62, 52],
                    iconAnchor:   [31, 52],
                    popupAnchor:  [0, -52]
                });

                const allMarkers = [...PRELOADED_LOCATIONS];
                
                const finishedServices = services.filter(s => s.estado === 'Finalizado' && s.ubicacion);
                finishedServices.forEach(s => {
                    const coords = extractCoordinates(s.ubicacion);
                    if (coords) {
                        allMarkers.push({
                            lat: coords.lat,
                            lng: coords.lng,
                            popupContent: `<b>Cliente: ${s.cliente}</b><br><span style="font-size:10px">${s.tipoTrabajo}<br>OCI: ${s.oci}</span>`
                        });
                    }
                });

                allMarkers.forEach(loc => {
                    if(loc.lat && loc.lng) {
                        window.L.marker([loc.lat, loc.lng], { icon: transformerIcon })
                            .addTo(map)
                            .bindPopup(loc.popupContent);
                    }
                });
            } catch (e) {
                console.error("Error initializing map: ", e);
            }
        };
        init();

        return () => {
            if (initTimeout) clearTimeout(initTimeout);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [services]);

    return <div ref={mapContainerRef} className="w-full h-[calc(100vh-220px)] rounded-xl z-0 border border-slate-200" />;
};

const KPIs = ({ services }) => {
    const [kpiYear, setKpiYear] = useState('all');
    const [kpiMonth, setKpiMonth] = useState('all');

    const filteredServices = services.filter(s => { 
        const sDate = new Date(s.fInicio); 
        return (kpiYear === 'all' || sDate.getFullYear().toString() === kpiYear) && (kpiMonth === 'all' || sDate.getMonth().toString() === kpiMonth); 
    });
    
    const servicesForCalc = filteredServices.filter(s => s.tipoTrabajo !== 'Vacaciones' && s.tipoTrabajo !== 'Estudios Médicos');

    if (servicesForCalc.length === 0) return (<div className="space-y-6 animate-in fade-in pb-10"><div className="flex items-center gap-4 bg-white/90 p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 backdrop-blur-sm"><div className="flex items-center text-slate-500 text-sm font-bold"><Filter className="w-4 h-4 mr-2"/> Filtrar Periodo:</div><select className="bg-slate-50 border-none rounded-lg text-sm p-2 focus:ring-2 focus:ring-orange-100 outline-none" value={kpiYear} onChange={e=>setKpiYear(e.target.value)}><option value="all">Todos los Años</option>{[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}</select><select className="bg-slate-50 border-none rounded-lg text-sm p-2 focus:ring-2 focus:ring-orange-100 outline-none" value={kpiMonth} onChange={e=>setKpiMonth(e.target.value)}><option value="all">Todos los Meses</option>{["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"].map((m,i) => <option key={i} value={i.toString()}>{m}</option>)}</select></div><div className="p-10 text-center text-slate-400 bg-white/50 rounded-xl">Sin datos operativos en el periodo seleccionado.</div></div>);
    
    const totalServices = servicesForCalc.length;
    const closedServices = servicesForCalc.filter(s => s.estado === 'Finalizado' || s.estado === 'No Finalizado');
    const successRate = closedServices.length ? ((closedServices.filter(s => s.estado === 'Finalizado').length / closedServices.length) * 100).toFixed(0) : 0;
    const activeServicesCount = servicesForCalc.filter(s => s.estado === 'En Servicio').length;
    
    const postponedCount = servicesForCalc.filter(s => s.postergado).length;
    const adherenceRate = totalServices ? (((totalServices - postponedCount) / totalServices) * 100).toFixed(0) : 0;
    const totalClaims = servicesForCalc.filter(s => s.tipoTrabajo === "Asistencia por reclamo").length;
    const qualityRate = totalServices ? (((totalServices - totalClaims) / totalServices) * 100).toFixed(1) : 100;
    
    const cancelledCount = servicesForCalc.filter(s => s.estado === 'No Finalizado').length;
    const cancellationRate = totalServices ? ((cancelledCount / totalServices) * 100).toFixed(1) : 0;

    let ownFleetUses = 0; let totalVehicleUses = 0;
    servicesForCalc.forEach(s => { s.vehiculos.forEach(v => { totalVehicleUses++; if (FLOTA_PROPIA.includes(v)) ownFleetUses++; }); });
    const ownFleetRate = totalVehicleUses ? ((ownFleetUses / totalVehicleUses) * 100).toFixed(0) : 0;

    const clientMap = {}; servicesForCalc.forEach(s => { clientMap[s.cliente] = (clientMap[s.cliente] || 0) + 1; });
    const dataTopClients = Object.entries(clientMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5);

    const techLoadMap = {}; servicesForCalc.forEach(s => s.tecnicos.forEach(t => { techLoadMap[t] = (techLoadMap[t] || 0) + 1; }));
    const dataTechLoad = Object.entries(techLoadMap).map(([name, value]) => ({ name, value })).sort((a,b)=>b.value-a.value).slice(0,10);

    let totalWorkHours = 0;
    let totalTravelHours = 0;
    servicesForCalc.forEach(s => {
        if(s.dailyLogs) {
            s.dailyLogs.forEach(log => {
                const start = new Date(`2000-01-01T${log.start}`);
                const end = new Date(`2000-01-01T${log.end}`);
                let hours = (end - start) / (1000 * 60 * 60);
                if (hours < 0) hours += 24;
                const techCount = (log.workers && log.workers.length > 0) ? log.workers.length : 1;
                const total = hours * techCount;
                if (total > 0) {
                    if (log.type === 'Viaje') totalTravelHours += total;
                    else totalWorkHours += total;
                }
            });
        }
    });
    const dataHoursType = [{ name: 'Trabajo', value: parseFloat(totalWorkHours.toFixed(1)) }, { name: 'Viaje', value: parseFloat(totalTravelHours.toFixed(1)) }];
    const statusMap = { 'Finalizado': 0, 'No Finalizado': 0, 'En Servicio': 0, 'Agendado': 0 };
    servicesForCalc.forEach(s => { const st = s.postergado ? 'Agendado' : s.estado; statusMap[st] = (statusMap[st] || 0) + 1; });
    const dataStatus = Object.entries(statusMap).map(([name, value]) => ({ name, value }));
    const COLORS_STATUS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'];

    const leadTimeByMonth = {};
    const servicesByMonth = {}; 

    servicesForCalc.forEach(s => {
        if (s.fSolicitud && s.fInicio) {
            const d = new Date(s.fInicio);
            const m = d.toLocaleString('default', { month: 'short' });
            const lead = Math.max(0, (new Date(s.fInicio) - new Date(s.fSolicitud)) / (1000 * 3600 * 24));
            if (!leadTimeByMonth[m]) leadTimeByMonth[m] = { total: 0, count: 0 };
            leadTimeByMonth[m].total += lead;
            leadTimeByMonth[m].count += 1;
            servicesByMonth[m] = (servicesByMonth[m] || 0) + 1;
        }
    });
    const dataLeadTimeTrend = Object.entries(leadTimeByMonth).map(([name, data]) => ({
        name,
        avg: parseFloat((data.total / data.count).toFixed(1))
    }));
    const dataMonthlyVolume = Object.entries(servicesByMonth).map(([name, value]) => ({ name, value }));

    let totalServiceDuration = 0;
    servicesForCalc.forEach(s => {
        totalServiceDuration += (new Date(s.fFin) - new Date(s.fInicio)) / (1000 * 3600 * 24) + 1;
    });
    const avgDuration = totalServices ? (totalServiceDuration / totalServices).toFixed(1) : 0;

    const servicesByTypeMap = {};
    servicesForCalc.forEach(s => { servicesByTypeMap[s.tipoTrabajo] = (servicesByTypeMap[s.tipoTrabajo] || 0) + 1; });
    const dataServicesByType = Object.entries(servicesByTypeMap).map(([name, value]) => ({ name, value }));

    return (
        <div className="space-y-8 animate-in fade-in pb-10 font-sans">
            <div className="flex flex-col md:flex-row items-center justify-between bg-white/95 p-5 rounded-2xl border border-slate-100 shadow-sm backdrop-blur-sm sticky top-0 z-20">
                <div className="flex items-center gap-3 mb-4 md:mb-0"><div className="bg-orange-50 p-2 rounded-lg text-orange-600"><BarChart2 className="w-5 h-5" /></div><div><h3 className="text-lg font-bold text-slate-800">Panel de Control</h3><p className="text-xs text-slate-400 font-medium">Indicadores clave de rendimiento</p></div></div>
                <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                    <div className="flex items-center px-3 text-slate-500 text-xs font-bold uppercase tracking-wider"><Filter className="w-3.5 h-3.5 mr-2"/> Periodo</div>
                    <select className="bg-white border border-slate-200 rounded-lg text-sm py-1.5 px-3 outline-none" value={kpiYear} onChange={e=>setKpiYear(e.target.value)}><option value="all">Año: Todos</option>{[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}</select>
                    <select className="bg-white border border-slate-200 rounded-lg text-sm py-1.5 px-3 outline-none" value={kpiMonth} onChange={e=>setKpiMonth(e.target.value)}><option value="all">Mes: Todos</option>{["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"].map((m,i) => <option key={i} value={i.toString()}>{m}</option>)}</select>
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-5">
                {[
                    { title: "Total Servicios", val: totalServices, unit: "", icon: Calendar, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
                    { title: "En Ejecución", val: activeServicesCount, unit: "", icon: Zap, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
                    { title: "Efectividad", val: successRate, unit: "%", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
                    { title: "Adherencia", val: adherenceRate, unit: "%", icon: Target, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
                    { title: "Calidad (Sin Reclamos)", val: qualityRate, unit: "%", icon: ShieldCheck, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-100" },
                    { title: "Uso Flota Propia", val: ownFleetRate, unit: "%", icon: Truck, color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-100" },
                    { title: "Prom. Duración", val: avgDuration, unit: "días", icon: Clock, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
                    { title: "Tasa Cancelación", val: cancellationRate, unit: "%", icon: AlertOctagon, color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
                ].map((k, i) => (
                    <div key={i} className={`bg-white p-5 rounded-2xl shadow-sm border ${k.border} hover:shadow-md transition-all duration-300 group`}>
                        <div className="flex justify-between items-start mb-3"><div className={`p-2.5 rounded-xl ${k.bg} ${k.color} group-hover:scale-110 transition-transform duration-300`}><k.icon className="w-5 h-5"/></div></div>
                        <div><div className="text-3xl font-black text-slate-800 tracking-tight mb-1">{k.val} <span className="text-sm font-bold text-slate-400 ml-0.5">{k.unit}</span></div><span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{k.title}</span></div>
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative col-span-2">
                    <div className="flex justify-between items-center mb-6"><div><h4 className="font-bold text-slate-800 text-sm flex items-center mb-1"><Clock className="w-4 h-4 mr-2 text-indigo-500"/> Tiempos de Respuesta (Lead Time)</h4><p className="text-[10px] text-slate-400 font-medium">Promedio de días desde Solicitud hasta Inicio por mes</p></div></div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={dataLeadTimeTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#94a3b8', fontSize:11, fontWeight: 600}} dy={10}/>
                                <YAxis axisLine={false} tickLine={false} tick={{fill:'#94a3b8', fontSize:11, fontWeight: 600}}/>
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}/>
                                <Bar dataKey="avg" name="Días Promedio" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                 <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group overflow-hidden">
                    <div className="flex justify-between items-center mb-6 relative z-10"><div><h4 className="font-bold text-slate-800 text-sm flex items-center mb-1"><Timer className="w-4 h-4 mr-2 text-orange-500"/> Distribución Horaria</h4><p className="text-[10px] text-slate-400 font-medium">Horas Hombre (Productivas vs Viaje)</p></div></div>
                    <div className="h-64 relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={dataHoursType} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                    {dataHoursType.map((entry, index) => (<Cell key={`cell-${index}`} fill={['#f97316', '#cbd5e1'][index % 2]} />))}
                                </Pie>
                                <Tooltip contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-[-10px]"><span className="text-2xl font-black text-slate-700 block">{(totalWorkHours + totalTravelHours).toFixed(0)}</span><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total HH</span></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-80">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center mb-4"><BarChart className="w-4 h-4 mr-2 text-blue-500"/> Evolución Mensual de Servicios</h4>
                    <ResponsiveContainer width="100%" height="85%">
                        <RechartsBarChart data={dataMonthlyVolume}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#94a3b8', fontSize:11, fontWeight: 600}} dy={10}/>
                            <YAxis axisLine={false} tickLine={false} tick={{fill:'#94a3b8', fontSize:11, fontWeight: 600}}/>
                            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: 'none'}}/>
                            <Bar dataKey="value" name="Servicios" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-80 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-2"><h4 className="font-bold text-slate-800 text-sm flex items-center"><Wrench className="w-4 h-4 mr-2 text-emerald-500"/> Servicios por Tipo</h4></div>
                    <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie data={dataServicesByType} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                                {dataServicesByType.map((entry, index) => (<Cell key={`cell-${index}`} fill={Object.values(COLORS_TRABAJO)[index % 10] || '#ccc'} />))}
                            </Pie>
                            <Tooltip contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: 'none'}}/>
                            <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '10px'}}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-80">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center mb-4"><UserCheck className="w-4 h-4 mr-2 text-pink-500"/> Top 5 Clientes</h4>
                    <ResponsiveContainer width="100%" height="85%">
                        <RechartsBarChart data={dataTopClients} layout="vertical" margin={{left: 0}}>
                            <XAxis type="number" hide/>
                            <YAxis dataKey="name" type="category" width={80} tick={{fontSize:9, fill:'#64748b'}} axisLine={false} tickLine={false}/>
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius:'8px', border:'none', fontSize:'11px'}}/>
                            <Bar dataKey="value" fill="#ec4899" radius={[0,2,2,0]} barSize={8} background={{ fill: '#fdf2f8' }}/>
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-80">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center mb-4"><Briefcase className="w-4 h-4 mr-2 text-violet-500"/> Carga Técnica (Top 10)</h4>
                    <ResponsiveContainer width="100%" height="85%">
                        <RechartsBarChart data={dataTechLoad} layout="vertical" margin={{left: 20}}>
                            <XAxis type="number" hide/>
                            <YAxis dataKey="name" type="category" width={100} tick={{fontSize:10, fill:'#64748b', fontWeight: 600}} axisLine={false} tickLine={false}/>
                            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                            <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={12} background={{ fill: '#f8fafc' }}/>
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const ServiceSheet = ({ mode = 'operations', sortedServices, handleEdit, handleDelete }) => {
    const [hideCompleted, setHideCompleted] = useState(false);

    const filteredSheetServices = useMemo(() => {
        let list;
        if (mode === 'operations') list = sortedServices.filter(s => s.tipoTrabajo !== 'Vacaciones' && s.tipoTrabajo !== 'Estudios Médicos');
        else list = sortedServices.filter(s => s.tipoTrabajo === 'Vacaciones' || s.tipoTrabajo === 'Estudios Médicos');
        
        if (hideCompleted) {
            list = list.filter(s => s.estado !== 'Finalizado');
        }
        
        return list.sort((a,b) => new Date(a.fInicio) - new Date(b.fInicio));
    }, [sortedServices, mode, hideCompleted]);

    return (
      <div className="bg-white/95 rounded-2xl shadow-sm border border-slate-100 overflow-hidden backdrop-blur-sm">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-700 text-sm">
                  {mode === 'operations' ? 'Listado de Operaciones' : 'Listado de Vacaciones'}
              </h3>
              <label className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
                  <input
                      type="checkbox"
                      checked={hideCompleted}
                      onChange={(e) => setHideCompleted(e.target.checked)}
                      className="accent-orange-600 w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-600">Ocultar Finalizados</span>
              </label>
          </div>
          <div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-100 text-sm"><thead className="bg-slate-50"><tr><th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">{mode === 'vacations' ? 'Tipo' : 'OCI'}</th><th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">{mode === 'vacations' ? 'Técnico' : 'Cliente'}</th>{mode !== 'vacations' && (<><th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">Solicitud</th><th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">Alcance</th></>)}<th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">Fechas</th><th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">Estado</th><th className="px-6 py-4 text-right font-bold text-slate-600 uppercase tracking-wider text-xs">Acciones</th></tr></thead><tbody className="divide-y divide-slate-50">{filteredSheetServices.map(s => (<tr key={s.id} className="hover:bg-orange-50/30 transition-colors"><td className="px-6 py-4 font-mono font-medium text-slate-700">{mode === 'vacations' ? '🏖️ Vacaciones' : <div>{s.oci}<div className="text-[10px] text-slate-500 font-sans leading-none mt-1">{s.tipoTrabajo === 'Otro' && s.tipoTrabajoOtro ? `Otro: ${s.tipoTrabajoOtro}` : s.tipoTrabajo}</div></div>}</td><td className="px-6 py-4 font-medium text-slate-800">{mode === 'vacations' ? s.tecnicos.join(', ') : s.cliente}</td>{mode !== 'vacations' && (<><td className="px-6 py-4 text-xs text-slate-500">{s.fSolicitud || '-'}</td><td className="px-6 py-4">{s.alcance === 'Internacional' ? <span className="flex items-center text-xs font-bold text-orange-600"><Globe className="w-3 h-3 mr-1"/> INT</span> : <span className="flex items-center text-xs font-bold text-slate-500"><MapIcon className="w-3 h-3 mr-1"/> NAC</span>}</td></>)}<td className="px-6 py-4 whitespace-nowrap text-slate-500">{s.fInicio} <span className="text-slate-300 mx-1">➜</span> {s.fFin}</td><td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${s.estado==='Finalizado'?'bg-emerald-50 border-emerald-100 text-emerald-700':s.estado==='En Servicio'?'bg-blue-50 border-blue-100 text-blue-700':s.postergado?'bg-rose-50 border-rose-100 text-rose-700':'bg-amber-50 border-amber-100 text-amber-700'}`}>{s.postergado ? 'Postergado' : s.estado}</span></td><td className="px-6 py-4 text-right whitespace-nowrap"><button type="button" onClick={() => handleEdit(s)} className="text-orange-500 hover:text-orange-700 mx-2 p-1 hover:bg-orange-50 rounded"><Edit2 className="w-4 h-4"/></button><button type="button" onClick={() => handleDelete(s.id)} className="text-rose-400 hover:text-rose-600 mx-2 p-1 hover:bg-rose-50 rounded"><Trash2 className="w-4 h-4"/></button></td></tr>))}</tbody></table></div>
      </div>
    );
};

const TransformerHistory = ({ services }) => {
    const [searchSerial, setSearchSerial] = useState("");
    const history = useMemo(() => { if (!searchSerial) return []; return services.filter(s => (s.trafoSerie && s.trafoSerie.toLowerCase().includes(searchSerial.toLowerCase())) || (s.trafoFabricacion && s.trafoFabricacion.toLowerCase().includes(searchSerial.toLowerCase()))); }, [searchSerial, services]);
    const displayHistory = searchSerial ? history : services.sort((a,b) => new Date(b.fInicio) - new Date(a.fInicio)).slice(0, 5);

    return (
        <div className="space-y-6">
            <div className="bg-white/95 p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center backdrop-blur-sm">
                <h3 className="text-lg font-bold flex items-center text-slate-800"><History className="w-5 h-5 mr-3 text-orange-600"/> Historial de Equipos</h3>
                <div className="flex w-full md:w-auto flex-1 max-w-md relative"><Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400"/><input type="text" placeholder="Buscar por Serie o Fabricación..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-100 outline-none" value={searchSerial} onChange={(e) => setSearchSerial(e.target.value)} /></div>
            </div>
            {displayHistory.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4">
                    {displayHistory.map(srv => (
                        <div key={srv.id} className="bg-white/90 p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <div><h5 className="font-bold text-lg text-slate-800">{srv.cliente}</h5><p className="text-sm text-slate-500">{srv.tipoTrabajo === 'Otro' && srv.tipoTrabajoOtro ? `Otro: ${srv.tipoTrabajoOtro}` : srv.tipoTrabajo}</p></div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${srv.estado === 'Finalizado' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>{srv.estado}</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <div><span className="text-[10px] uppercase font-bold text-slate-400 block">Serie</span><span className="text-sm font-mono font-bold text-slate-700">{srv.trafoSerie || '-'}</span></div>
                                <div><span className="text-[10px] uppercase font-bold text-slate-400 block">Fabricación</span><span className="text-sm font-mono font-bold text-slate-700">{srv.trafoFabricacion || '-'}</span></div>
                                <div><span className="text-[10px] uppercase font-bold text-slate-400 block">Potencia</span><span className="text-sm font-bold text-slate-700">{srv.trafoPotencia || '-'}</span></div>
                                <div><span className="text-[10px] uppercase font-bold text-slate-400 block">Relación</span><span className="text-sm font-bold text-slate-700">{srv.trafoRelacion || '-'}</span></div>
                            </div>
                            <div className="flex items-center text-xs text-slate-500 mb-3 space-x-4">
                                <span className="flex items-center"><Calendar className="w-3 h-3 mr-1"/> {srv.fInicio}</span>
                                <span className="flex items-center font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">OCI: {srv.oci}</span>
                            </div>
                            <TechReportViewer service={srv} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-12 text-slate-400 italic bg-white rounded-xl border border-dashed">No se encontraron servicios con ese número de serie o fabricación.</div>
            )}
        </div>
    );
};

const TechPortal = ({ services, user, handleStartService, setUploadingEvidenceService, setEvidenceData, setLoggingHoursService, setDailyLogData, setTechsForHours, setClosingService, setClosureData, setReopeningService, setReopenReason }) => {
    const [view, setView] = useState('list'); 
    const [hideCompleted, setHideCompleted] = useState(false);

    const myServices = useMemo(() => {
        let list = services.filter(s => s.tecnicos.includes(user.name));
        if (hideCompleted) {
            list = list.filter(s => s.estado !== 'Finalizado');
        }
        return list.sort((a,b) => new Date(a.fInicio) - new Date(b.fInicio));
    }, [services, user.name, hideCompleted]);

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-8 rounded-3xl shadow-lg text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-center">
                <div className="relative z-10 mb-4 md:mb-0">
                    <h2 className="text-3xl font-extrabold mb-1">Hola, {user.name} 👋</h2>
                    <p className="text-orange-100">Aquí tienes tus servicios asignados.</p>
                </div>
                <div className="relative z-10 bg-white/20 p-1 rounded-xl flex items-center">
                    <label className="flex items-center space-x-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white mr-2 border-r border-white/20">
                        <input type="checkbox" checked={hideCompleted} onChange={(e) => setHideCompleted(e.target.checked)} className="accent-orange-500 w-4 h-4 rounded border-white/30" />
                        <span className="text-xs font-bold">Ocultar Finalizados</span>
                    </label>
                    <button onClick={()=>setView('list')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view==='list'?'bg-white text-orange-600 shadow-sm':'text-white hover:bg-white/10'}`}><List className="w-4 h-4 inline-block mr-2"/> Lista</button>
                    <button onClick={()=>setView('gantt')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view==='gantt'?'bg-white text-orange-600 shadow-sm':'text-white hover:bg-white/10'}`}><Calendar className="w-4 h-4 inline-block mr-2"/> Calendario</button>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
            </div>

            {view === 'list' ? (
                <div className="grid grid-cols-1 gap-5">
                    {myServices.map(srv => (
                        <div key={srv.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${srv.estado==='Finalizado'?'bg-emerald-50 border-emerald-100 text-emerald-700':srv.estado==='En Servicio'?'bg-blue-50 border-blue-100 text-blue-700':srv.estado==='No Finalizado'?'bg-rose-50 border-rose-100 text-rose-700':'bg-amber-50 border-amber-100 text-amber-700'}`}>{srv.estado}</span><span className="text-xs text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded">OCI: {srv.oci}</span></div>
                                <h3 className="font-bold text-xl text-slate-800 mb-1">{srv.cliente}</h3>
                                
                                {srv.contactoResponsable && (
                                    <div className="mb-3 text-xs bg-orange-50 text-orange-800 p-2 rounded-lg inline-flex items-center border border-orange-100 font-medium">
                                        <UserCheck className="w-3.5 h-3.5 mr-1.5"/> Contacto: {srv.contactoResponsable}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-2"><div className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-slate-400"/> {srv.fInicio} ➔ {srv.fFin}</div><div className="flex items-center"><Truck className="w-4 h-4 mr-2 text-slate-400"/> {srv.vehiculos.join(', ')}</div></div>
                            </div>
                            <div className="flex flex-col gap-3 justify-center min-w-[180px] border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 pt-4 md:pt-0">
                                {srv.estado === 'Agendado' && <button onClick={() => handleStartService(srv)} className="bg-blue-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center justify-center transition-all active:scale-95"><PlayCircle className="w-5 h-5 mr-2"/> Iniciar Tarea</button>}
                                {srv.estado === 'En Servicio' && (<><button onClick={() => { setUploadingEvidenceService(srv); setEvidenceData({comment: '', files: []}); }} className="bg-white text-blue-600 border border-blue-200 py-2 px-3 rounded-lg font-bold hover:bg-blue-50 flex items-center justify-center text-xs transition-colors"><ImageIcon className="w-4 h-4 mr-2"/> Subir Avance</button><button onClick={() => { setLoggingHoursService(srv); setDailyLogData({date: new Date().toISOString().split('T')[0], start:'', end:'', type: 'Trabajo'}); setTechsForHours(srv.tecnicos); }} className="bg-white text-indigo-600 border border-indigo-200 py-2 px-3 rounded-lg font-bold hover:bg-indigo-50 flex items-center justify-center text-xs transition-colors"><Timer className="w-4 h-4 mr-2"/> Cargar Horas</button></>)}
                                {srv.estado === 'En Servicio' && <button onClick={() => { setClosingService(srv); setClosureData({status:'Finalizado', reasonType: '', reason:'', observation: '', files:[]}); }} className="bg-white text-orange-600 border-2 border-orange-600 py-3 px-4 rounded-xl font-bold hover:bg-orange-50 flex items-center justify-center transition-colors mt-1"><CheckCircle className="w-5 h-5 mr-2"/> Cerrar Servicio</button>}
                                {(srv.estado === 'Finalizado' || srv.estado === 'No Finalizado') && <button onClick={() => { setReopeningService(srv); setReopenReason(""); }} className="w-full py-2 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors flex items-center justify-center"><RotateCcw className="w-3 h-3 mr-1"/> Reabrir Caso</button>}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <GanttChart services={myServices} mode="mixed" isAdmin={false} handleEdit={()=>{}} />
            )}
        </div>
    );
};

const LoginScreen = ({ onLogin, tecnicosData }) => {
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
        } catch (e) { setError("Error"); }
        setLoading(false);
    };
    const handleLogin = () => {
        if(role === 'admin') {
            if(adminSetupRequired) { handleAdminSetup(); return; }
            const validPass = adminConfig ? adminConfig.password : 'admin123';
            if(password === validPass) { onLogin({ name: 'Administrador', role: 'admin' }); } else { setError('Contraseña incorrecta'); }
        } else {
            const tech = tecnicosData.find(t => t.name === selectedTechName);
            if(tech && tech.password === password) { onLogin({ name: selectedTechName, role: 'tech', phone: tech.phone }); } else { setError('Credenciales inválidas'); }
        }
    };
    const sortedTecnicos = useMemo(() => [...tecnicosData].sort((a, b) => a.name.localeCompare(b.name)), [tecnicosData]);
    return (
        <div className="min-h-screen app-background flex items-center justify-center p-4">
            <div className="absolute inset-0 app-overlay"></div>
            <GlobalStyles />
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-slate-100 relative z-10">
                <div className="text-center mb-10"><h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Planificación<br/><span className="text-orange-600">Postventa</span></h1></div>
                {adminSetupRequired && role === 'admin' ? (
                    <div className="space-y-4"><input type="password" placeholder="Nueva Contraseña" class="input-field" value={password} onChange={e=>setPassword(e.target.value)}/><button onClick={handleAdminSetup} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Guardar</button></div>
                ) : (
                    <div className="space-y-5">
                        <div className="flex bg-slate-100 p-1.5 rounded-xl"><button onClick={() => { setRole('admin'); setError(''); }} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${role === 'admin' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-400'}`}>Admin</button><button onClick={() => { setRole('tech'); setError(''); }} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${role === 'tech' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-400'}`}>Técnico</button></div>
                        {role === 'tech' && (<div className="relative group"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Briefcase className="h-5 w-5 text-slate-400" /></div><select className="w-full pl-10 pr-3 py-3 border-none bg-slate-50 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-orange-100 outline-none" value={selectedTechName} onChange={(e) => setSelectedTechName(e.target.value)}><option value="">Selecciona tu usuario...</option>{sortedTecnicos.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}</select></div>)}
                        <div className="relative group"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400" /></div><input type="password" placeholder="Contraseña" className="w-full pl-10 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-orange-100 outline-none" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                        {error && <p className="text-rose-500 text-sm text-center font-medium bg-rose-50 py-2 rounded-lg">{error}</p>}
                        <button onClick={handleLogin} className="w-full bg-orange-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-orange-700 transition-all">Ingresar</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function App() {
    const [user, setUser] = useState(null); 
    const [activeTab, setActiveTab] = useState('kanban'); 
    const isOnline = useOnlineStatus();
    const [services, setServices] = useState([]);
    const [tecnicosData, setTecnicosData] = useState([]);
    const [lastSavedService, setLastSavedService] = useState(null);
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
        const initAuth = async () => { try { await signInAnonymously(auth); } catch (e) {} };
        initAuth();
        const unsubscribeServices = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'services'), (snapshot) => {
            const loadedServices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setServices(loadedServices);
        });
        const unsubscribeTechnicians = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'technicians'), (snapshot) => {
            const loadedTechs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTecnicosData(loadedTechs);
        });
        return () => { unsubscribeServices(); unsubscribeTechnicians(); };
    }, []);

    const [notification, setNotification] = useState(null);
    const showNotification = (msg, type='success') => { setNotification({msg, type}); setTimeout(()=>setNotification(null), 3000); };

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isManageTechOpen, setIsManageTechOpen] = useState(false);
    const [isChangeAdminPasswordOpen, setIsChangeAdminPasswordOpen] = useState(false); 
    const [newAdminPasswordToChange, setNewAdminPasswordToChange] = useState(""); 
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        oci: '', cliente: '', fSolicitud: new Date().toISOString().split('T')[0],
        fInicio: '', fFin: '', tipoTrabajo: TIPOS_TRABAJO[0], tipoTrabajoOtro: '',
        tecnicos: [], vehiculos: [], estado: 'Agendado', observaciones: '',
        postergado: false, motivoPostergacion: '', alcance: 'Nacional', files: [], 
        progressLogs: [], dailyLogs: [], closureData: null,
        trafoFabricacion: '', trafoSerie: '', trafoPotencia: '', trafoRelacion: '', ubicacion: '', contactoResponsable: ''
    });

    const [uploadingEvidenceService, setUploadingEvidenceService] = useState(null);
    const [evidenceData, setEvidenceData] = useState({ comment: '', files: [] });
    const [loggingHoursService, setLoggingHoursService] = useState(null);
    const [dailyLogData, setDailyLogData] = useState({ date: new Date().toISOString().split('T')[0], start: '', end: '', type: 'Trabajo' });
    const [techsForHours, setTechsForHours] = useState([]);
    const [closingService, setClosingService] = useState(null);
    const [closureData, setClosureData] = useState({ status: 'Finalizado', reasonType: '', reason: '', observation: '', files: [] });
    const [reopeningService, setReopeningService] = useState(null);
    const [reopenReason, setReopenReason] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [newTechName, setNewTechName] = useState("");
    const [newTechPhone, setNewTechPhone] = useState("");
    const [newTechEmail, setNewTechEmail] = useState("");
    const [newTechPassword, setNewTechPassword] = useState("");

    const addTechnician = async () => {
        if (newTechName && !tecnicosData.find(t => t.name === newTechName.toUpperCase())) {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'technicians'), { 
                name: newTechName.toUpperCase(), 
                phone: newTechPhone, 
                email: newTechEmail,
                password: newTechPassword || "1234" 
            });
            setNewTechName(""); setNewTechPhone(""); setNewTechEmail(""); setNewTechPassword(""); showNotification("Técnico agregado");
        }
    };
    const removeTechnician = async (id, name) => { if(window.confirm(`¿Eliminar a ${name}?`)) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'technicians', id)); };
    const updateTechData = async (id, field, value) => { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'technicians', id), { [field]: value }); };

    const handleChangeAdminPassword = async () => {
        if (newAdminPasswordToChange.length < 6) {
            showNotification("La contraseña debe tener al menos 6 caracteres", "error");
            return;
        }
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'admin_settings', 'config'), { password: newAdminPasswordToChange }, { merge: true });
            showNotification("Contraseña de Administrador actualizada");
            setIsChangeAdminPasswordOpen(false);
            setNewAdminPasswordToChange("");
        } catch (e) {
            showNotification("Error al actualizar la contraseña", "error");
        }
    };

    const handleEdit = (service) => {
        if(service.id === 'new') {
            setEditingId(null);
            setFormData({
                oci: '', cliente: '', fSolicitud: new Date().toISOString().split('T')[0],
                fInicio: '', fFin: '', tipoTrabajo: TIPOS_TRABAJO[0], tipoTrabajoOtro: '',
                tecnicos: [], vehiculos: [], estado: 'Agendado', observaciones: '',
                postergado: false, motivoPostergacion: '', alcance: 'Nacional', files: [], 
                progressLogs: [], dailyLogs: [], closureData: null,
                trafoFabricacion: '', trafoSerie: '', trafoPotencia: '', trafoRelacion: '', ubicacion: '', contactoResponsable: ''
            });
        } else {
            setEditingId(service.id);
            setFormData(service);
        }
        setIsSidebarOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // --- VALIDACIÓN DE UBICACIÓN PARA MONTAJE ---
        if (formData.tipoTrabajo.includes('Montaje') && !formData.ubicacion) {
            showNotification("La ubicación (Coordenadas) es obligatoria para trabajos de Montaje.", "error");
            return;
        }

        const serviceData = { 
            ...formData, 
            closureData: editingId ? (services.find(s=>s.id===editingId)?.closureData || null) : null,
            progressLogs: editingId ? (services.find(s=>s.id===editingId)?.progressLogs || []) : [],
            dailyLogs: editingId ? (services.find(s=>s.id===editingId)?.dailyLogs || []) : []
        };
        if (editingId) { 
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', editingId), serviceData); 
            showNotification("Servicio actualizado"); 
        } else { 
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'services'), serviceData); 
            showNotification("Servicio creado"); 
        }
        setLastSavedService(serviceData);
        if (!editingId || (editingId && !formData.postergado)) setShowMsgModal(true);
        setIsSidebarOpen(false); resetForm();
    };

    const handleWhatsApp = (techName) => {
        if (!lastSavedService) return;
        const tech = tecnicosData.find(t => t.name === techName);
        if (!tech || !tech.phone) { showNotification(`Sin teléfono para ${techName}`, "error"); return; }
        const duracion = (new Date(lastSavedService.fFin) - new Date(lastSavedService.fInicio)) / (1000 * 60 * 60 * 24) + 1;
        const tipoDetallado = lastSavedService.tipoTrabajo === 'Otro' && lastSavedService.tipoTrabajoOtro ? lastSavedService.tipoTrabajoOtro : lastSavedService.tipoTrabajo;
        const msg = `--- TICKET DE SERVICIO TECNICO ---\n\nTECNICO: ${techName}\nCLIENTE: ${lastSavedService.cliente}\nOCI: ${lastSavedService.oci}\nINICIO: ${lastSavedService.fInicio}\nFIN: ${lastSavedService.fFin}\nDURACION: ${duracion} dias\nTAREA: ${tipoDetallado}\n\n>> Iniciar en App al llegar.`;
        window.open(`https://wa.me/${tech.phone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const handleEmail = (techName) => {
        if (!lastSavedService) return;
        const tech = tecnicosData.find(t => t.name === techName);
        if (!tech || !tech.email) { showNotification(`Sin correo configurado para ${techName}`, "error"); return; }
        const subject = encodeURIComponent(`Asignación de Servicio: ${lastSavedService.cliente} - OCI ${lastSavedService.oci}`);
        const tipoDetallado = lastSavedService.tipoTrabajo === 'Otro' && lastSavedService.tipoTrabajoOtro ? lastSavedService.tipoTrabajoOtro : lastSavedService.tipoTrabajo;
        const body = encodeURIComponent(`Hola ${techName},\n\nSe te ha asignado un nuevo servicio.\n\nCliente: ${lastSavedService.cliente}\nOCI: ${lastSavedService.oci}\nFecha: ${lastSavedService.fInicio} al ${lastSavedService.fFin}\nTarea: ${tipoDetallado}\n\nPor favor, revisa el portal para más detalles.`);
        
        window.location.href = `mailto:${tech.email}?subject=${subject}&body=${body}`;
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            oci: '', cliente: '', fSolicitud: new Date().toISOString().split('T')[0],
            fInicio: '', fFin: '', tipoTrabajo: TIPOS_TRABAJO[0], tipoTrabajoOtro: '',
            tecnicos: [], vehiculos: [], estado: 'Agendado', observaciones: '',
            postergado: false, motivoPostergacion: '', alcance: 'Nacional', files: [], 
            progressLogs: [], dailyLogs: [], closureData: null,
            trafoFabricacion: '', trafoSerie: '', trafoPotencia: '', trafoRelacion: '', ubicacion: '', contactoResponsable: ''
        });
    };

    const handleStatusChange = async (serviceId, newStatus) => {
        const updateData = { estado: newStatus };
        if (newStatus === 'Agendado') updateData.postergado = false;
        try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', serviceId), updateData); showNotification(`Movido a ${newStatus}`); } catch (e) { showNotification("Error", "error"); }
    };

    const handleTechEvidenceUpload = async () => { if (evidenceData.files.length === 0 && !evidenceData.comment.trim()) return; const newLog = { id: Date.now(), date: new Date().toLocaleString(), comment: evidenceData.comment, files: evidenceData.files }; const updatedLogs = [...(uploadingEvidenceService.progressLogs || []), newLog]; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', uploadingEvidenceService.id), { progressLogs: updatedLogs }); setUploadingEvidenceService(null); showNotification("Avance subido"); };
    const handleLogHours = async () => { const newLog = { ...dailyLogData, id: Date.now(), workers: techsForHours }; const updatedLogs = [...(loggingHoursService.dailyLogs || []), newLog]; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', loggingHoursService.id), { dailyLogs: updatedLogs }); setLoggingHoursService(null); showNotification("Horas registradas"); };
    const handleStartService = async (service) => { const startLog = { id: Date.now(), date: new Date().toLocaleString(), comment: `🚀 INICIO`, files: [] }; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', service.id), { estado: 'En Servicio', progressLogs: [...(service.progressLogs||[]), startLog] }); showNotification("Servicio iniciado"); };
    const handleTechClosure = async () => { const closureInfo = { ...closureData, date: new Date().toISOString() }; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', closingService.id), { estado: closureData.status, closureData: closureInfo }); setClosingService(null); showNotification("Servicio cerrado"); };
    const handleReopenService = async () => { const newLog = { id: Date.now(), date: new Date().toLocaleString(), comment: `🔄 REAPERTURA: ${reopenReason}`, files: [] }; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', reopeningService.id), { estado: 'En Servicio', progressLogs: [...(reopeningService.progressLogs||[]), newLog] }); setReopeningService(null); };
    const handleDelete = (id) => setDeletingId(id);
    const confirmDelete = async () => { if (deletingId) { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', deletingId)); setDeletingId(null); showNotification("Servicio eliminado"); } };

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

    if (!user) return <LoginScreen onLogin={setUser} tecnicosData={tecnicosData}/>;

    const isAdmin = user.role === 'admin';

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden app-background">
            <div className="absolute inset-0 app-overlay z-0"></div>
            <GlobalStyles />
            <div className={`fixed inset-y-0 left-0 z-30 w-full lg:w-80 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white"><div className="flex items-center"><img src={COMPANY_LOGO} alt="Logo" className="w-10 h-10 object-contain mr-2" /><div><h2 className="text-sm font-black">PLANIFICACIÓN</h2><p className="text-xs font-bold text-orange-600">POSTVENTA</p></div></div><button onClick={()=>setIsSidebarOpen(false)} className="lg:hidden"><X/></button></div>
                {isAdmin ? (
                    <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
                        <div className="mb-6 space-y-2">
                            <button onClick={() => setIsManageTechOpen(true)} className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-orange-300 text-sm font-bold transition-all shadow-sm">
                                <span className="flex items-center"><Users className="w-4 h-4 mr-2 text-slate-400"/> Personal y Claves</span><ChevronRight className="w-4 h-4 text-slate-300"/>
                            </button>
                            <button onClick={() => setIsChangeAdminPasswordOpen(true)} className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-orange-300 text-sm font-bold transition-all shadow-sm">
                                <span className="flex items-center"><Key className="w-4 h-4 mr-2 text-slate-400"/> Clave Administrador</span><ChevronRight className="w-4 h-4 text-slate-300"/>
                            </button>
                        </div>

                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Asignación</p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {editingId && (<div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-sm flex justify-between items-center"><span className="font-bold text-amber-800">✏️ Editando...</span><button type="button" onClick={resetForm} className="text-xs bg-white border px-2 py-1 rounded">Cancelar</button></div>)}
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">TIPO</label>
                                <select className="input-field" value={formData.tipoTrabajo} onChange={e=>{
                                    const v = e.target.value; 
                                    const isAbsence = v === 'Vacaciones' || v === 'Estudios Médicos';
                                    setFormData(p=>({...p, tipoTrabajo: v, cliente: isAbsence?'INTERNO':p.cliente, oci: isAbsence?v.toUpperCase():p.oci, vehiculos: isAbsence?[]:p.vehiculos}));
                                }}>{TIPOS_TRABAJO.map(t=><option key={t} value={t}>{t}</option>)}</select>
                                {formData.tipoTrabajo === 'Otro' && (
                                    <input type="text" className="input-field mt-2 text-xs animate-in fade-in" placeholder="Especifique el tipo de trabajo..." value={formData.tipoTrabajoOtro || ''} onChange={e=>setFormData({...formData, tipoTrabajoOtro: e.target.value})} />
                                )}
                            </div>
                            {formData.tipoTrabajo !== 'Vacaciones' && formData.tipoTrabajo !== 'Estudios Médicos' && (<div className="grid grid-cols-2 gap-2"><div><label className="text-xs font-bold text-slate-500 mb-1 block">OCI</label><input className="input-field font-mono" value={formData.oci} onChange={e=>setFormData({...formData, oci:e.target.value})} placeholder="OCI"/></div><div><label className="text-xs font-bold text-slate-500 mb-1 block">CLIENTE</label><input className="input-field uppercase" value={formData.cliente} onChange={e=>setFormData({...formData, cliente:e.target.value.toUpperCase()})} placeholder="CLIENTE"/></div></div>)}
                            <div className="grid grid-cols-2 gap-2"><div><label className="text-xs font-bold text-slate-500 mb-1 block">INICIO</label><input type="date" className="input-field text-xs" value={formData.fInicio} onChange={e=>setFormData({...formData, fInicio:e.target.value})}/></div><div><label className="text-xs font-bold text-slate-500 mb-1 block">FIN</label><input type="date" className="input-field text-xs" value={formData.fFin} onChange={e=>setFormData({...formData, fFin:e.target.value})}/></div></div>
                            {formData.tipoTrabajo !== 'Vacaciones' && formData.tipoTrabajo !== 'Estudios Médicos' && (<div><label className="text-xs font-bold text-slate-500 mb-1 block">FECHA SOLICITUD</label><input type="date" className="input-field" value={formData.fSolicitud} onChange={e=>setFormData({...formData, fSolicitud:e.target.value})} /></div>)}
                            
                            <div>
                                <div className="flex justify-between items-center mb-1"><label className="text-xs font-bold text-slate-500">TÉCNICOS ({availableTechnicians.length} Disp.)</label></div>
                                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50">
                                    {availableTechnicians.map(t=>(<label key={t.name} className={`flex items-center space-x-2 p-1 rounded cursor-pointer ${formData.tecnicos.includes(t.name)?'bg-orange-100 font-bold text-orange-800':''}`}><input type="checkbox" checked={formData.tecnicos.includes(t.name)} onChange={()=>{const newTechs = formData.tecnicos.includes(t.name) ? formData.tecnicos.filter(n=>n!==t.name) : [...formData.tecnicos, t.name]; setFormData({...formData, tecnicos: newTechs});}} className="accent-orange-600"/><span className="text-xs">{t.name}</span></label>))}
                                    {availableTechnicians.length === 0 && <p className="text-xs text-center text-slate-400">Selecciona fechas primero</p>}
                                </div>
                            </div>

                            {/* --- SECCIÓN DATOS TRANSFORMADOR Y SITIO --- */}
                            {formData.tipoTrabajo !== 'Vacaciones' && formData.tipoTrabajo !== 'Estudios Médicos' && (
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm group hover:border-orange-200 transition-colors animate-in fade-in">
                                    <label className="text-xs font-bold text-orange-500 block mb-3 flex items-center"><Activity className="w-3 h-3 mr-1"/> DATOS TRANSFORMADOR Y SITIO</label>
                                    <div className="grid grid-cols-2 gap-3 mb-2">
                                        <input type="text" placeholder="Nº Fabricación" className="input-field text-xs bg-white" value={formData.trafoFabricacion} onChange={e=>setFormData({...formData, trafoFabricacion:e.target.value})} />
                                        <input type="text" placeholder="Nº Serie" className="input-field text-xs bg-white" value={formData.trafoSerie} onChange={e=>setFormData({...formData, trafoSerie:e.target.value})} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-2">
                                        <input type="text" placeholder="Potencia (KVA)" className="input-field text-xs bg-white" value={formData.trafoPotencia} onChange={e=>setFormData({...formData, trafoPotencia:e.target.value})} />
                                        <input type="text" placeholder="Relación/Tens" className="input-field text-xs bg-white" value={formData.trafoRelacion} onChange={e=>setFormData({...formData, trafoRelacion:e.target.value})} />
                                    </div>
                                    <div className="mb-2">
                                        <input type="text" placeholder="Contacto Responsable (Ej: Juan Perez - 3512...)" className="input-field text-xs bg-white w-full" value={formData.contactoResponsable} onChange={e=>setFormData({...formData, contactoResponsable:e.target.value})} />
                                    </div>
                                    <div>
                                        <input type="text" placeholder="Ubicación o Google Maps..." className="input-field text-xs bg-white w-full" value={formData.ubicacion} onChange={e=>setFormData({...formData, ubicacion:e.target.value})} />
                                    </div>
                                </div>
                            )}

                            {formData.tipoTrabajo !== 'Vacaciones' && formData.tipoTrabajo !== 'Estudios Médicos' && (<div><label className="text-xs font-bold text-slate-500 mb-1 block">VEHÍCULOS</label><div className="flex flex-wrap gap-1">{TODOS_VEHICULOS.map(v=>(<label key={v} className={`text-[10px] px-2 py-1 border rounded cursor-pointer ${formData.vehiculos.includes(v)?'bg-slate-800 text-white':''}`}><input type="checkbox" className="hidden" checked={formData.vehiculos.includes(v)} onChange={()=>{const newVehs = formData.vehiculos.includes(v) ? formData.vehiculos.filter(x=>x!==v) : [...formData.vehiculos, v]; setFormData({...formData, vehiculos: newVehs});}}/>{v}</label>))}</div></div>)}
                            
                            <div><label className="text-xs font-bold text-slate-500 mb-1 block">OBSERVACIONES</label><textarea className="input-field h-24 resize-none text-xs" placeholder="Detalles del trabajo..." value={formData.observaciones} onChange={e=>setFormData({...formData, observaciones:e.target.value})} /></div>

                            <button className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-orange-700 active:scale-95 transition-all">{editingId ? 'Guardar Cambios' : 'Agendar'}</button>
                        </form>
                    </div>
                ) : (<div className="p-8 text-center flex-1 text-slate-400"><div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4"><Calendar className="w-8 h-8 opacity-20"/></div><p>Panel Técnico</p></div>)}
                <div className="p-4 border-t border-slate-100 bg-white"><button onClick={()=>setUser(null)} className="flex items-center justify-center w-full py-2 text-slate-500 hover:text-rose-600 font-medium"><LogOut className="w-4 h-4 mr-2"/> Salir</button></div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                <header className="bg-white/95 border-b border-slate-100 px-8 py-4 flex flex-col md:flex-row justify-between items-center shadow-sm backdrop-blur-sm gap-4">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight hidden md:block">Dashboard</h1>
                    {isAdmin && (
                        <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full">
                            {[
                                {id:'map', label:'Mapa Mundial', icon:MapIcon},
                                {id:'kanban', label:'Tablero', icon:Columns},
                                {id:'gantt', label:'Cronograma', icon:Calendar},
                                {id:'sheet', label:'Planilla', icon:List},
                                {id:'vacations', label:'Vacaciones', icon:Palmtree},
                                {id:'history', label:'Historial', icon:History},
                                {id:'kpis', label:'KPIs', icon:BarChart2} 
                            ].map(tab=>(<button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab===tab.id?'bg-white text-orange-600 shadow-sm':'text-slate-500 hover:text-slate-700'}`}><tab.icon className="w-4 h-4 mr-2"/> {tab.label}</button>))}
                        </div>
                    )}
                    {!isAdmin && (<div className="flex bg-slate-100 p-1 rounded-xl"><button onClick={()=>setActiveTab('tasks')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold ${activeTab==='tasks'?'bg-white text-orange-600 shadow-sm':'text-slate-500'}`}><LayoutList className="w-4 h-4 mr-2"/> Mis Tareas</button><button onClick={()=>setActiveTab('history')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold ${activeTab==='history'?'bg-white text-orange-600 shadow-sm':'text-slate-500'}`}><History className="w-4 h-4 mr-2"/> Historial</button></div>)}
                </header>

                <main className="flex-1 overflow-auto p-4 md:p-6 custom-scrollbar">
                    {notification && <div className={`fixed top-20 right-8 px-6 py-3 rounded-xl shadow-lg z-50 animate-in fade-in text-white font-bold flex items-center ${notification.type==='error'?'bg-rose-500':'bg-emerald-500'}`}>{notification.msg}</div>}
                    
                    {isAdmin ? (
                        <div className="max-w-7xl mx-auto h-full">
                            {activeTab === 'map' && <MapDashboard services={services} />}
                            {activeTab === 'kanban' && <KanbanBoard services={services} onStatusChange={handleStatusChange} handleEdit={handleEdit}/>}
                            {activeTab === 'gantt' && <GanttChart services={services} mode="operations" handleEdit={handleEdit} isAdmin={isAdmin}/>}
                            {activeTab === 'sheet' && <ServiceSheet sortedServices={services} mode="operations" handleEdit={handleEdit} handleDelete={handleDelete}/>}
                            {activeTab === 'vacations' && (<div className="space-y-6"><GanttChart services={services} mode="vacations" handleEdit={handleEdit} isAdmin={isAdmin}/><ServiceSheet sortedServices={services} mode="vacations" handleEdit={handleEdit} handleDelete={handleDelete}/></div>)}
                            {activeTab === 'history' && <TransformerHistory services={services} />}
                            {activeTab === 'kpis' && <KPIs services={services} />}
                        </div>
                    ) : (
                        <div className="max-w-5xl mx-auto">
                            {activeTab === 'tasks' && <TechPortal services={services} user={user} handleStartService={handleStartService} setUploadingEvidenceService={setUploadingEvidenceService} setEvidenceData={setEvidenceData} setLoggingHoursService={setLoggingHoursService} setDailyLogData={setDailyLogData} setTechsForHours={setTechsForHours} setClosingService={setClosingService} setClosureData={setClosureData} setReopeningService={setReopeningService} setReopenReason={setReopenReason} />}
                            {activeTab === 'history' && <TransformerHistory services={services} />}
                        </div>
                    )}
                </main>
            </div>

            {/* MODALES */}
            <Modal isOpen={isManageTechOpen} onClose={()=>setIsManageTechOpen(false)} title="Personal y Claves" size="lg">
                <div className="space-y-6">
                    <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                        <div>
                            <label className="text-[10px] font-bold text-orange-700 uppercase mb-1 block">Nombre</label>
                            <input className="input-field bg-white text-xs py-2" placeholder="Nombre completo" value={newTechName} onChange={e=>setNewTechName(e.target.value.toUpperCase())} />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-orange-700 uppercase mb-1 block">Teléfono</label>
                            <input className="input-field bg-white text-xs py-2" placeholder="Ej: 549351..." value={newTechPhone} onChange={e=>setNewTechPhone(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-orange-700 uppercase mb-1 block">Correo Electrónico</label>
                            <input type="email" className="input-field bg-white text-xs py-2" placeholder="tecnico@empresa.com" value={newTechEmail} onChange={e=>setNewTechEmail(e.target.value)} />
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-orange-700 uppercase mb-1 block">Contraseña</label>
                                <input className="input-field bg-white text-xs py-2" placeholder="Clave" value={newTechPassword} onChange={e=>setNewTechPassword(e.target.value)} />
                            </div>
                            <button onClick={addTechnician} className="bg-orange-600 text-white px-3 rounded-lg font-bold hover:bg-orange-700 transition-transform active:scale-95 h-[34px] self-end shadow-md"><Plus className="w-4 h-4"/></button>
                        </div>
                    </div>
                    <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg border border-blue-100 font-medium">
                        💡 Puedes editar las contraseñas y datos directamente en los campos de abajo. ¡Se guardan automáticamente!
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                        {tecnicosData.sort((a,b)=>a.name.localeCompare(b.name)).map(t=>(
                            <div key={t.id} className="p-3 border border-slate-200 rounded-xl bg-white shadow-sm hover:border-orange-200 transition-all group">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-sm text-slate-700">{t.name}</span>
                                    <button onClick={() => removeTechnician(t.id, t.name)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                        <input type="text" value={t.phone || ''} onChange={(e) => updateTechData(t.id, 'phone', e.target.value)} className="text-xs w-full bg-slate-50 border border-transparent rounded hover:border-slate-300 focus:border-orange-300 p-1.5 outline-none transition-colors" placeholder="Teléfono" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                        <input type="email" value={t.email || ''} onChange={(e) => updateTechData(t.id, 'email', e.target.value)} className="text-xs w-full bg-slate-50 border border-transparent rounded hover:border-slate-300 focus:border-orange-300 p-1.5 outline-none transition-colors" placeholder="Correo electrónico" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Key className="w-3 h-3 text-slate-400 shrink-0" />
                                        <input type="text" value={t.password || ''} onChange={(e) => updateTechData(t.id, 'password', e.target.value)} className="text-xs w-full bg-slate-50 border border-transparent rounded hover:border-slate-300 focus:border-orange-300 p-1.5 outline-none font-mono text-slate-700 transition-colors" placeholder="Contraseña" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isChangeAdminPasswordOpen} onClose={()=>setIsChangeAdminPasswordOpen(false)} title="Cambiar Clave de Administrador" size="sm">
                <div className="space-y-4">
                    <p className="text-sm text-slate-500">Ingresa la nueva contraseña maestra para acceder al panel de administración.</p>
                    <input 
                        type="text" 
                        className="input-field font-mono" 
                        placeholder="Nueva contraseña (mínimo 6 caracteres)" 
                        value={newAdminPasswordToChange} 
                        onChange={e => setNewAdminPasswordToChange(e.target.value)}
                    />
                    <button onClick={handleChangeAdminPassword} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">Actualizar Contraseña</button>
                </div>
            </Modal>

            {/* MODALES TÉCNICOS Y OPERATIVOS */}
            <Modal isOpen={showMsgModal} onClose={()=>setShowMsgModal(false)} title="📢 Notificar Asignación">
                 <div className="grid gap-3">
                     {lastSavedService?.tecnicos.length > 0 ? (
                         lastSavedService.tecnicos.map(t => (
                             <div key={t} className="flex flex-col bg-white border border-slate-200 p-4 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all group">
                                 <div className="flex items-center mb-3">
                                     <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-3 text-slate-500 font-bold">{t.charAt(0)}</div>
                                     <span className="font-bold text-slate-700">{t}</span>
                                 </div>
                                 <div className="flex gap-2">
                                     <button onClick={()=>handleWhatsApp(t)} className="flex-1 text-emerald-600 flex items-center justify-center text-xs font-bold bg-emerald-50 border border-emerald-100 px-3 py-2.5 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors">
                                         <MessageCircle className="w-4 h-4 mr-1.5"/> WhatsApp
                                     </button>
                                     <button onClick={()=>handleEmail(t)} className="flex-1 text-blue-600 flex items-center justify-center text-xs font-bold bg-blue-50 border border-blue-100 px-3 py-2.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">
                                         <Mail className="w-4 h-4 mr-1.5"/> Correo
                                     </button>
                                 </div>
                             </div>
                         ))
                     ) : (
                         <p className="text-center text-slate-500 text-sm py-4">No hay técnicos asignados para notificar.</p>
                     )}
                 </div>
            </Modal>

            <Modal isOpen={!!uploadingEvidenceService} onClose={()=>setUploadingEvidenceService(null)} title="Subir Evidencia">
                <div className="space-y-4">
                    <textarea className="input-field h-24" placeholder="Comentario..." value={evidenceData.comment} onChange={e=>setEvidenceData({...evidenceData, comment:e.target.value})}/>
                    <FileUploader files={evidenceData.files} setFiles={(f)=>setEvidenceData({...evidenceData, files:f})} label="ARCHIVOS"/>
                    <button onClick={handleTechEvidenceUpload} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Guardar</button>
                </div>
            </Modal>

            <Modal isOpen={!!loggingHoursService} onClose={()=>setLoggingHoursService(null)} title="Cargar Horas">
                <div className="space-y-4">
                    <input type="date" className="input-field" value={dailyLogData.date} onChange={e=>setDailyLogData({...dailyLogData, date:e.target.value})}/>
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Tipo de Actividad</label>
                        <select className="input-field" value={dailyLogData.type} onChange={e=>setDailyLogData({...dailyLogData, type:e.target.value})}>
                            <option value="Trabajo">Trabajo en Sitio</option>
                            <option value="Viaje">Viaje / Traslado</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <input type="time" className="input-field" value={dailyLogData.start} onChange={e=>setDailyLogData({...dailyLogData, start:e.target.value})}/>
                        <input type="time" className="input-field" value={dailyLogData.end} onChange={e=>setDailyLogData({...dailyLogData, end:e.target.value})}/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Personal</label>
                        <div className="max-h-24 overflow-y-auto border rounded p-2">
                            {loggingHoursService?.tecnicos.map(t=>(
                                <label key={t} className="flex items-center space-x-2"><input type="checkbox" checked={techsForHours.includes(t)} onChange={()=>setTechsForHours(prev=>prev.includes(t)?prev.filter(x=>x!==t):[...prev,t])} className="accent-indigo-600"/><span className="text-xs">{t}</span></label>
                            ))}
                        </div>
                    </div>
                    <button onClick={handleLogHours} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">Registrar</button>
                </div>
            </Modal>

            <Modal isOpen={!!closingService} onClose={()=>setClosingService(null)} title="Cierre de Servicio">
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <button onClick={()=>setClosureData({...closureData, status:'Finalizado'})} className={`flex-1 py-2 border rounded-lg font-bold ${closureData.status==='Finalizado'?'bg-emerald-50 border-emerald-500 text-emerald-700':'bg-white'}`}>Finalizado</button>
                        <button onClick={()=>setClosureData({...closureData, status:'No Finalizado'})} className={`flex-1 py-2 border rounded-lg font-bold ${closureData.status==='No Finalizado'?'bg-rose-50 border-rose-500 text-rose-700':'bg-white'}`}>No Finalizado</button>
                    </div>
                    <textarea className="input-field h-24" placeholder="Observaciones finales..." value={closureData.observation} onChange={e=>setClosureData({...closureData, observation:e.target.value})}/>
                    
                    {closureData.status === 'No Finalizado' && (
                        <div className="space-y-3 animate-in slide-in-from-top-2">
                            <label className="block text-xs font-bold text-rose-500 uppercase tracking-wider">Especificar Motivo</label>
                            <select 
                                className="input-field border-rose-200 focus:border-rose-500 focus:ring-rose-100" 
                                value={closureData.reasonType} 
                                onChange={e => setClosureData({...closureData, reasonType: e.target.value, reason: e.target.value === 'Otros' ? '' : e.target.value})}
                            >
                                <option value="">Seleccione un motivo...</option>
                                <option value="Falta de repuestos">Falta de repuestos</option>
                                <option value="Falta de tiempo">Falta de tiempo</option>
                                <option value="Cliente ausente/no disponible">Cliente ausente / no disponible</option>
                                <option value="Condiciones climáticas adversas">Condiciones climáticas adversas</option>
                                <option value="Problema técnico no resuelto">Problema técnico no resuelto</option>
                                <option value="Otros">Otros (Especificar)</option>
                            </select>
                            
                            {closureData.reasonType === 'Otros' && (
                                <input 
                                    className="input-field border-rose-200 focus:border-rose-500 focus:ring-rose-100 animate-in fade-in" 
                                    placeholder="Describa el motivo..." 
                                    value={closureData.reason} 
                                    onChange={e=>setClosureData({...closureData, reason:e.target.value})}
                                />
                            )}
                        </div>
                    )}
                    
                    <FileUploader files={closureData.files} setFiles={(f)=>setClosureData({...closureData, files:f})} label="ACTA"/>
                    <button onClick={handleTechClosure} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold">Confirmar Cierre</button>
                </div>
            </Modal>

            <Modal isOpen={!!reopeningService} onClose={()=>setReopeningService(null)} title="Reabrir">
                <div className="space-y-4">
                    <p className="text-sm bg-orange-50 p-3 rounded text-orange-800">El servicio volverá a estado "En Servicio".</p>
                    <textarea className="input-field h-24" placeholder="Motivo..." value={reopenReason} onChange={e=>setReopenReason(e.target.value)}/>
                    <button onClick={handleReopenService} className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold">Confirmar</button>
                </div>
            </Modal>

            <Modal isOpen={!!deletingId} onClose={()=>setDeletingId(null)} title="Eliminar">
                <div className="text-center p-4">
                    <p className="mb-4">¿Seguro deseas eliminar este servicio permanentemente?</p>
                    <div className="flex gap-2 justify-center">
                        <button onClick={()=>setDeletingId(null)} className="px-4 py-2 bg-slate-100 rounded-lg">Cancelar</button>
                        <button onClick={confirmDelete} className="px-4 py-2 bg-rose-600 text-white rounded-lg font-bold">Eliminar</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}