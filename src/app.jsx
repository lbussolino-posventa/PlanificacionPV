import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Calendar, Truck, AlertTriangle, CheckCircle, BarChart2, Table, 
  Trash2, Plus, X, Search, Edit2, LogOut, Menu, Copy, MessageCircle, Settings, 
  Phone, Lock, UserPlus, ExternalLink, Paperclip, FileText, Image as ImageIcon, 
  History, Eye, Save, XCircle, CheckSquare, List, MapPin, PlayCircle, Clock, Activity,
  Briefcase, ChevronRight, Globe, MapIcon, Filter, TrendingUp, UserCheck, CalendarPlus,
  Zap, Users, Target, Info, HelpCircle, Key, FileCheck, Timer, FolderOpen, AlertOctagon, Cloud,
  ShieldCheck, Loader, RotateCcw, LayoutList, Palmtree, ArrowUpDown, UserX, QrCode, Wifi, WifiOff, RefreshCw, Navigation, Layers, ChevronDown,
  Columns, Wrench, BarChart, Factory, Mail, Share2, Star, ClipboardList, ThumbsUp, MessageSquare, Download, PieChart as PieChartIcon,
  Percent, Shield, FileSpreadsheet, Folder, Loader2
} from 'lucide-react';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
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

const BACKGROUND_IMAGE = "https://i.imgur.com/EfUXRhd.png"; 
const COMPANY_LOGO = "https://imgur.com/tH8Cu4p.png"; 

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

// Validamos qué trabajos requieren ensayos
const REQUIRES_TESTS_TYPES = ["Montaje de Transformador", "Supervisión de Montaje", "Servicio de Mantenimiento", "Ensayos Eléctricos (Únicamente)"];

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    }
    return dateStr;
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const PRELOADED_LOCATIONS = [
  { lat: -34.6037, lng: -58.3816, popupContent: '<b>Cliente: Edesur S.A.</b><br>' },
  { lat: -37.3782, lng: -64.6042, popupContent: '<b>General Acha, La Pampa</b>' },
  { lat: -31.4647, lng: -64.3575, popupContent: '<b>Malagueño, Córdoba</b>' },
  { lat: -12.0464, lng: -77.0428, popupContent: '<b>Lima, Perú</b>' },
  { lat: -3.7319, lng: -38.5267, popupContent: '<b>Fortaleza, Brasil</b>' },
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
  { lat: -22.9068, lng: -43.1729, popupContent: '<b>Río de Janeiro, Brasil</b>' },
  { lat: -34.0617, lng: -60.1022, popupContent: '<b>Arrecifes, Buenos Aires</b>' },
  { lat: -22.4694, lng: -43.8250, popupContent: '<b>Barra do Piraí, Brasil</b>' },
  { lat: -23.5936, lng: -49.8339, popupContent: '<b>Siqueira Campos, Brasil</b>' },
  { lat: -26.4170, lng: -54.6167, popupContent: '<b>Eldorado, Misiones</b>' },
  { lat: -27.3671, lng: -55.8961, popupContent: '<b>Posadas, Misiones</b>' },
  { lat: -27.5954, lng: -48.5480, popupContent: '<b>Florianópolis (Santa Catarina), Brasil</b>' },
  { lat: -25.0950, lng: -50.1614, popupContent: '<b>Ponta Grossa, Brasil</b>' },
  { lat: -34.9011, lng: -56.1645, popupContent: '<b>Montevideo, Uruguay</b>' },
  { lat: -31.3927, lng: -58.0209, popupContent: '<b>Concordia, Entre Ríos</b>' },
  { lat: -31.0036, lng: -57.8969, popupContent: '<b>Federación, Entre Ríos</b>' },
  { lat: -27.4853, lng: -55.1199, popupContent: '<b>Oberá, Misiones</b>' },
  { lat: -28.5524, lng: -56.0422, popupContent: '<b>Santo Tomé, Corrientes</b>' },
  { lat: -27.5833, lng: -56.6833, popupContent: '<b>Ituzaingó, Corrientes</b>' },
  { lat: -29.1441, lng: -59.6465, popupContent: '<b>Reconquista, Santa Fe</b>' },
  { lat: -26.5051, lng: -61.1744, popupContent: '<b>Pampa del Infierno, Chaco</b>' },
  { lat: -27.5739, lng: -60.7153, popupContent: '<b>Villa Ángela, Chaco</b>' },
  { lat: -27.4514, lng: -58.9867, popupContent: '<b>Resistencia, Chaco</b>' },
  { lat: -24.6667, lng: -65.0500, popupContent: '<b>General Güemes, Salta/Jujuy</b>' },
  { lat: -24.2333, lng: -64.8667, popupContent: '<b>San Pedro de Jujuy, Jujuy</b>' },
  { lat: -23.8233, lng: -64.7876, popupContent: '<b>Libertador Gral. San Martín (Ledesma), Jujuy</b>' },
  { lat: -21.5355, lng: -64.7297, popupContent: '<b>Tarija, Bolivia</b>' },
  { lat: -14.8586, lng: -66.7475, popupContent: '<b>San Borja, Bolivia</b>' },
  { lat: -14.8333, lng: -64.9000, popupContent: '<b>Trinidad, Bolivia</b>' },
  { lat: -15.1167, lng: -67.0333, popupContent: '<b>Yucumo, Bolivia</b>' },
  { lat: -16.3700, lng: -60.9500, popupContent: '<b>San Ignacio de Velasco, Bolivia</b>' },
  { lat: -19.5836, lng: -65.7531, popupContent: '<b>Potosí, Bolivia</b>' },
  { lat: -33.4489, lng: -70.6693, popupContent: '<b>Santiago, Chile</b>' },
  { lat: -32.9250, lng: -71.5167, popupContent: '<b>Concón, Chile</b>' },
  { lat: -37.4697, lng: -72.3539, popupContent: '<b>Los Ángeles, Chile</b>' },
  { lat: -46.4394, lng: -67.5191, popupContent: '<b>Caleta Olivia, Santa Cruz</b>' },
  { lat: -46.5417, lng: -68.9247, popupContent: '<b>Las Heras, Santa Cruz</b>' },
  { lat: 10.6918, lng: -61.2225, popupContent: '<b>Isla de Trinidad, Trinidad y Tobago</b>' },
  { lat: 11.2385, lng: -60.6720, popupContent: '<b>Isla de Tobago, Trinidad y Tobago</b>' },
  { lat: 36.1540, lng: -95.9928, popupContent: '<b>Tulsa, Estados Unidos</b>' },
  { lat: -51.6226, lng: -69.2181, popupContent: '<b>Río Gallegos, Santa Cruz</b>' },
  { lat: -46.5492, lng: -71.6288, popupContent: '<b>Los Antiguos, Santa Cruz</b>' },
  { lat: -37.3875, lng: -68.9248, popupContent: '<b>Rincón de los Sauces, Neuquén</b>' },
  { lat: -38.9026, lng: -70.0645, popupContent: '<b>Zapala, Neuquén</b>' },
  { lat: -39.2831, lng: -65.4682, popupContent: '<b>Choele Choel, Río Negro</b>' },
  { lat: -38.8500, lng: -60.0667, popupContent: '<b>Claromecó, Buenos Aires</b>' },
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
  { lat: 18.4861, lng: -69.9312, popupContent: '<b>Santo Domingo, República Dominicana</b>' },
  { lat: 18.2206, lng: -63.0686, popupContent: '<b>The Valley, Anguila</b>' },
  { lat: 11.0200, lng: -63.9100, popupContent: '<b>Isla de Margarita, Venezuela</b>' },
  { lat: 8.3019, lng: -62.7108, popupContent: '<b>Puerto Ordaz, Venezuela</b>' },
  { lat: -0.1807, lng: -78.4678, popupContent: '<b>Quito, Ecuador</b>' },
  { lat: 9.9281, lng: -84.0907, popupContent: '<b>San José, Costa Rica</b>' },
  { lat: 12.1364, lng: -86.2514, popupContent: '<b>Managua, Nicaragua</b>' },
  { lat: 14.5995, lng: 120.9842, popupContent: '<b>Manila, Filipinas</b>' },
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
  { lat: -29.4131, lng: -66.8557, popupContent: '<b>La Rioja, La Rioja, Argentina</b>' },
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
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    body{font-family:'Inter',sans-serif;background-color:#020617;color:#f8fafc;letter-spacing:0.01em;}
    .app-background{background-image:url('${BACKGROUND_IMAGE}');background-size:cover;background-position:center;background-repeat:no-repeat;}
    .app-overlay{background-color:rgba(2,6,23,0.60)!important;backdrop-filter:blur(1px)!important;}
    .bg-white,.bg-slate-50,.bg-slate-100,.bg-white\\/95,.bg-white\\/90,.bg-white\\/50{background-color:rgba(15,23,42,0.65)!important;border-color:rgba(255,255,255,0.08)!important;backdrop-filter:blur(8px)!important;}
    .fixed.z-\\[100\\] .bg-white,.fixed.z-\\[100\\] .bg-slate-50,.fixed.z-\\[100\\] .bg-slate-100{background-color:#0f172a!important;backdrop-filter:none!important;}
    h1,h2,h3,h4,h5,label,p,span{text-shadow:0 1px 2px rgba(0,0,0,0.3);}
    .text-slate-800,.text-slate-700{color:#ffffff!important;font-weight:600;}
    .text-slate-600{color:#e2e8f0!important;}
    .text-slate-500,.text-slate-400{color:#94a3b8!important;}
    .input-field,input[type="text"],input[type="password"],input[type="email"],input[type="date"],input[type="time"],input[type="number"],select,textarea{background-color:#ffffff!important;color:#b34505ce!important;border:1px solid #cbd5e1!important;border-radius:0.75rem!important;padding:0.75rem 1rem!important;font-size:0.9rem!important;font-weight:500!important;outline:none!important;box-shadow:inset 0 2px 4px rgba(0,0,0,0.05)!important;width:100%!important;}
    .input-field:focus,input:focus,select:focus,textarea:focus{border-color:#f97316!important;box-shadow:0 0 0 3px rgba(249,115,22,0.2)!important;}
    .input-field::placeholder,input::placeholder,textarea::placeholder{color:#94a3b8!important;font-weight:400!important;text-shadow:none!important;}
    .kanban-card{background-color:rgba(30,41,59,0.85)!important;border:1px solid rgba(255,255,255,0.1)!important;border-radius:1rem!important;color:#ffffff!important;transition:transform 0.2s,box-shadow 0.2s;cursor:grab;}
    .kanban-card:active{transform:scale(1.02);box-shadow:0 10px 15px -3px rgba(0,0,0,0.5);}
    .btn-bubble-container{display:flex;background-color:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);border-radius:9999px;padding:0.35rem;margin:0 auto 1.5rem auto;width:fit-content;}
    .btn-bubble{padding:0.5rem 1.5rem;border-radius:9999px;font-size:0.85rem;font-weight:700;transition:all 0.3s ease;text-transform:uppercase;border:none;cursor:pointer;}
    .btn-bubble-inactive{background-color:transparent!important;color:#94a3b8!important;}
    .btn-bubble-active{background-color:#ea580c!important;color:#ffffff!important;box-shadow:0 4px 12px rgba(234,88,12,0.4)!important;}
    .custom-scrollbar::-webkit-scrollbar{width:6px;height:6px;}
    .custom-scrollbar::-webkit-scrollbar-track{background:transparent;}
    .custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.2);border-radius:10px;}
    .custom-scrollbar::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.3);}
    .leaflet-container{font-family:'Inter',sans-serif;z-index:0;}
    .animate-in{animation:fadeIn 0.3s ease-out forwards;}
    @keyframes fadeIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
    .survey-container{background-color:#f0ebf8!important;color:#202124!important;min-height:100vh;}
    .survey-container h1,.survey-container h2,.survey-container h3,.survey-container label,.survey-container p,.survey-container span{text-shadow:none!important;color:#202124!important;}
    .survey-card{background-color:#ffffff!important;border-radius:8px!important;border:1px solid #dadce0!important;border-top:10px solid #673ab7!important;box-shadow:0 1px 4px rgba(0,0,0,0.1)!important;}
    .survey-card-inner{background-color:#ffffff!important;border-radius:8px!important;border:1px solid #dadce0!important;box-shadow:none!important;}
    .survey-input{background-color:transparent!important;border:none!important;border-bottom:1px solid #dadce0!important;border-radius:0!important;padding:8px 0!important;box-shadow:none!important;color:#202124!important;}
    .survey-input:focus{border-bottom:2px solid #673ab7!important;box-shadow:none!important;}
    .survey-radio-group input[type="radio"]{accent-color:#673ab7!important;width:20px;height:20px;}
  `}</style>
);

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizeClasses = size === 'full' ? 'w-full h-full max-w-none max-h-none rounded-none' : size === 'lg' ? 'max-w-4xl' : size === 'xl' ? 'max-w-6xl' : size === 'sm' ? 'max-w-sm' : 'max-w-md';
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-0 md:p-4 backdrop-blur-sm transition-all">
      <div className={`bg-white shadow-2xl w-full ${sizeClasses} overflow-hidden animate-in flex flex-col ${size === 'full' ? '' : 'rounded-2xl max-h-[90vh]'}`}>
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50">{children}</div>
      </div>
    </div>
  );
};

// ============================================================================
// MODULO DE ENSAYOS (PLANILLA)
// ============================================================================

const TestSheetEditor = ({ testData, onSave, onBack }) => {
  const [activeTab, setActiveTab] = useState('ttr');
  const [tapRange, setTapRange] = useState(testData.tapRange || 5);
  const [data, setData] = useState(testData.data || {});
  const [tgDeltaData, setTgDeltaData] = useState(testData.tgDeltaData || [
    { id: generateId() }, { id: generateId() }, { id: generateId() }, { id: generateId() }
  ]);
  const [insulationData, setInsulationData] = useState(testData.insulationData ||
    Array(6).fill(null).map(() => ({ id: generateId() }))
  );
  const [headerInfo, setHeaderInfo] = useState(testData.headerInfo || {
    manufacturingNumber: '', serialNumber: '', client: '', date: new Date().toISOString().split('T')[0]
  });
  const [resistanceSettings, setResistanceSettings] = useState(testData.resistanceSettings || {
    measuredTemp: '20', refTemp: '75', conn1Name: 'Conexión 1', conn2Name: 'Conexión 2', conn3Name: 'Conexión 3'
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsSaving(true);
    const updatedTest = {
      ...testData,
      tapRange, data, tgDeltaData, insulationData, headerInfo, resistanceSettings,
      lastModified: new Date().toISOString()
    };
    const timeoutId = setTimeout(() => {
      onSave(updatedTest).then(() => setIsSaving(false));
    }, 1500); 
    return () => clearTimeout(timeoutId);
  }, [tapRange, data, tgDeltaData, insulationData, headerInfo, resistanceSettings]);

  useEffect(() => {
    const loadScript = (src) => {
      if (document.querySelector(`script[src="${src}"]`)) return;
      const script = document.createElement('script');
      script.src = src; script.async = true;
      document.body.appendChild(script);
    };
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js");
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js");
  }, []);

  const tapRows = useMemo(() => {
    const rows = [];
    for (let i = tapRange; i >= 1; i--) rows.push({ id: `pos-${i}`, label: `+${i}` });
    rows.push({ id: 'neutral', label: '0 (Nominal)' });
    for (let i = 1; i <= tapRange; i++) rows.push({ id: `neg-${i}`, label: `-${i}` });
    return rows;
  }, [tapRange]);

  const handleInputChange = (id, field, value) => {
    const valWithComma = value.replace('.', ',');
    setData(prev => ({ ...prev, [id]: { ...prev[id], [field]: valWithComma } }));
  };

  const handleTgDeltaChange = (id, field, value) => {
    const valFormatted = (field === 'testVoltage' || field === 'tgPercent' || field === 'capacitance')
      ? value.replace('.', ',') : value;
    setTgDeltaData(prev => prev.map(row => row.id === id ? { ...row, [field]: valFormatted } : row));
  };
  const addTgDeltaRow = () => setTgDeltaData(prev => [...prev, { id: generateId() }]);
  const removeTgDeltaRow = (id) => { if (confirm('¿Borrar fila?')) setTgDeltaData(prev => prev.filter(row => row.id !== id)); };

  const handleInsulationChange = (id, field, value) => {
    const numericFields = ['val30s', 'val1m', 'val2m', 'val3m', 'val4m', 'val5m', 'val6m', 'val7m', 'val8m', 'val9m', 'val10m'];
    const valFormatted = numericFields.includes(field) ? value.replace('.', ',') : value;
    setInsulationData(prev => prev.map(row => row.id === id ? { ...row, [field]: valFormatted } : row));
  };
  const addInsulationRow = () => setInsulationData(prev => [...prev, { id: generateId() }]);
  const removeInsulationRow = (id) => { if (confirm('¿Borrar fila?')) setInsulationData(prev => prev.filter(row => row.id !== id)); };

  const parseNum = (val) => val ? parseFloat(String(val).replace(',', '.')) : 0;
  const formatNum = (val, decimals = 3) => (val === null || val === undefined || isNaN(val)) ? '-' : val.toFixed(decimals).replace('.', ',');

  const calculateDeviation = (measured, rated) => {
    const m = parseNum(measured); const r = parseNum(rated);
    if (isNaN(m) || isNaN(r) || r === 0) return null;
    return ((m - r) / r) * 100;
  };

  const calculateResistanceCorrection = (measuredVal) => {
    const m = parseNum(measuredVal);
    const t_meas = parseNum(resistanceSettings.measuredTemp);
    const t_ref = parseNum(resistanceSettings.refTemp);
    if (isNaN(m) || isNaN(t_meas) || isNaN(t_ref)) return null;
    return m * ((235 + t_ref) / (235 + t_meas));
  };

  const calculateDAR = (val1m, val30s) => {
    const v1 = parseNum(val1m); const v30 = parseNum(val30s);
    if (v30 === 0 || isNaN(v1) || isNaN(v30)) return null;
    return v1 / v30;
  };
  const calculatePI = (val10m, val1m) => {
    const v10 = parseNum(val10m); const v1 = parseNum(val1m);
    if (v1 === 0 || isNaN(v10) || isNaN(v1)) return null;
    return v10 / v1;
  };

  const getStatusTTR = (deviation) => {
    if (deviation === null) return { color: 'bg-gray-50 text-gray-400 print:text-gray-400', icon: null };
    const absDev = Math.abs(deviation);
    if (absDev <= 0.5) return { color: 'bg-green-100 text-green-700 font-bold border-green-300 print:bg-gray-100 print:text-black print:border-gray-400', icon: <CheckCircle className="w-4 h-4 inline mr-1 text-green-600 print:hidden" /> };
    return { color: 'bg-red-100 text-red-700 font-bold border-red-300 print:bg-gray-200 print:text-black print:font-bold print:border-black', icon: <AlertCircle className="w-4 h-4 inline mr-1 text-red-600 print:text-black" /> };
  };

  const getStatusTG = (valStr) => {
    if (!valStr) return { color: 'bg-white', icon: null };
    const val = parseNum(valStr);
    if (val < 0.5) return { color: 'bg-green-100 text-green-700 font-bold border-green-300 print:bg-gray-100 print:text-black print:border-gray-400', icon: <CheckCircle className="w-4 h-4 inline mr-1 text-green-600 print:hidden" /> };
    return { color: 'bg-red-100 text-red-700 font-bold border-red-300 print:bg-gray-200 print:text-black print:font-bold print:border-black', icon: <AlertCircle className="w-4 h-4 inline mr-1 text-red-600 print:text-black" /> };
  };

  const getStatusIP = (piValue) => {
    if (piValue === null) return { color: 'bg-white', icon: null, label: '-' };
    if (piValue > 1.0) return { color: 'bg-green-100 text-green-700 font-bold border-green-300 print:bg-gray-100 print:text-black print:border-gray-400', icon: <CheckCircle className="w-4 h-4 inline mr-1 text-green-600 print:hidden" />, label: 'ACEPTABLE' };
    return { color: 'bg-red-100 text-red-700 font-bold border-red-300 print:bg-gray-200 print:text-black print:font-bold print:border-black', icon: <AlertCircle className="w-4 h-4 inline mr-1 text-red-600 print:text-black" />, label: 'NO ACEPTABLE' };
  };

  const handleDownloadExcel = () => {
    if (!window.XLSX) return alert("Cargando librería Excel...");
    const wb = window.XLSX.utils.book_new();
    const ttrData = [
      ["PLANILLA DE ENSAYOS - TTR"],
      ["Cliente:", headerInfo.client, "Fecha:", headerInfo.date],
      ["Nº Serie:", headerInfo.serialNumber, "Nº Fab:", headerInfo.manufacturingNumber],
      [], ["Tap", "Ratio %", "Rated Ratio", "Ph A Meas", "Dev A %", "Ph B Meas", "Dev B %", "Ph C Meas", "Dev C %"]
    ];
    tapRows.forEach(row => {
      const d = data[row.id] || {};
      const devA = calculateDeviation(d.phaseA, d.ratedRatio);
      const devB = calculateDeviation(d.phaseB, d.ratedRatio);
      const devC = calculateDeviation(d.phaseC, d.ratedRatio);
      ttrData.push([row.label, d.ratioPercent, d.ratedRatio, d.phaseA, devA !== null ? formatNum(devA) : "", d.phaseB, devB !== null ? formatNum(devB) : "", d.phaseC, devC !== null ? formatNum(devC) : ""]);
    });
    window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.aoa_to_sheet(ttrData), "TTR");

    const resData = [
      ["PLANILLA DE ENSAYOS - RESISTENCIA"],
      [], ["Tap", `${resistanceSettings.conn1Name} (Meas)`, `${resistanceSettings.conn1Name} (Corr)`, `${resistanceSettings.conn2Name} (Meas)`, `${resistanceSettings.conn2Name} (Corr)`, `${resistanceSettings.conn3Name} (Meas)`, `${resistanceSettings.conn3Name} (Corr)`]
    ];
    tapRows.forEach(row => {
      const d = data[row.id] || {};
      const c1 = calculateResistanceCorrection(d.resConn1Meas); const c2 = calculateResistanceCorrection(d.resConn2Meas); const c3 = calculateResistanceCorrection(d.resConn3Meas);
      resData.push([row.label, d.resConn1Meas, c1 !== null ? formatNum(c1, 4) : "", d.resConn2Meas, c2 !== null ? formatNum(c2, 4) : "", d.resConn3Meas, c3 !== null ? formatNum(c3, 4) : ""]);
    });
    window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.aoa_to_sheet(resData), "Resistencia");

    const tgData = [
      ["PLANILLA DE ENSAYOS - TANGENTE DELTA"],
      [], ["Modo", "Inyección", "Medición", "Guarda", "Tensión Ensayo", "TG (%)", "Cx (pF)"]
    ];
    tgDeltaData.forEach(row => tgData.push([row.mode, row.injection, row.measurement, row.guard, row.testVoltage, row.tgPercent, row.capacitance]));
    window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.aoa_to_sheet(tgData), "TG Delta");

    const insData = [
      ["PLANILLA DE ENSAYOS - RESISTENCIA DE AISLACIÓN (GΩ)"],
      [], ["Inyección", "Medición", "Guarda", "30\"", "1'", "2'", "3'", "4'", "5'", "6'", "7'", "8'", "9'", "10'", "RAD (DAR)", "IP (PI)", "Estado IP"]
    ];
    insulationData.forEach(row => {
      const dar = calculateDAR(row.val1m, row.val30s); const pi = calculatePI(row.val10m, row.val1m); const statusIP = getStatusIP(pi);
      insData.push([row.injection, row.measurement, row.guard, row.val30s, row.val1m, row.val2m, row.val3m, row.val4m, row.val5m, row.val6m, row.val7m, row.val8m, row.val9m, row.val10m, dar !== null ? formatNum(dar, 2) : "", pi !== null ? formatNum(pi, 2) : "", statusIP.label]);
    });
    window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.aoa_to_sheet(insData), "Aislación");

    window.XLSX.writeFile(wb, `Ensayo_${headerInfo.serialNumber || 'SN'}.xlsx`);
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('printable-content');
    if (!window.html2pdf) return alert("Cargando librería PDF...");
    document.body.classList.add('generating-pdf');
    const opt = { margin: 5, filename: `Ensayo_${headerInfo.serialNumber || 'SN'}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' } };
    window.html2pdf().set(opt).from(element).save().then(() => document.body.classList.remove('generating-pdf'));
  };

  return (
    <div className="animate-in fade-in duration-300 w-full bg-white rounded-xl shadow-inner border border-slate-200">
      <style>{`
        @media print { @page { size: landscape; margin: 10mm; } .no-print { display: none !important; } .print-border { border: 1px solid #000 !important; } }
        body.generating-pdf input, body.generating-pdf select { border: none !important; background: transparent !important; padding: 0 !important; text-align: center; appearance: none; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .ensayo-input { border: 1px solid #cbd5e1; border-radius: 4px; text-align: center; width: 100%; padding: 4px; font-size: 12px; }
        .ensayo-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.2); }
      `}</style>

      <div className="bg-slate-800 text-white p-3 flex items-center justify-between rounded-t-xl sticky top-0 z-50 no-print" data-html2canvas-ignore="true">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-2 hover:bg-slate-700 px-3 py-1.5 rounded transition font-bold text-sm">
              <ArrowLeft size={16} /> Volver a Ensayos
            </button>
          )}
          <div className="h-6 w-px bg-slate-600"></div>
          <div>
            <h2 className="font-bold text-sm">{headerInfo.client || 'Sin Cliente'}</h2>
            <p className="text-xs text-slate-400">SN: {headerInfo.serialNumber || '---'}</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {isSaving ? (
            <span className="text-xs text-amber-400 flex items-center gap-1 font-bold"><Loader2 size={14} className="animate-spin" /> Guardando...</span>
          ) : (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold"><Cloud size={14} /> Guardado</span>
          )}
        </div>
      </div>

      <div id="printable-content" className="max-w-[1400px] mx-auto p-4 bg-slate-50 min-h-[70vh] print:bg-white print:p-0 rounded-b-xl text-slate-800">
        <header className="bg-white shadow-sm rounded-lg p-5 mb-4 border-l-4 border-blue-600 print:shadow-none print:border-none print:mb-2 print:p-0">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="w-full">
              <h1 className="text-xl font-bold text-slate-800 print:text-black mb-1">Planilla de Ensayos Eléctricos</h1>
              <p className="text-slate-500 print:text-slate-700 mb-4 text-xs uppercase tracking-wide font-bold">
                {activeTab === 'ttr' ? 'Relación de Transformación (TTR)' : activeTab === 'resistance' ? 'Resistencia de Devanados' : activeTab === 'tgdelta' ? 'Factor de Potencia / TG Delta' : 'Resistencia de Aislación'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200 print:bg-white print:border-black print:border-2 print:p-2 text-sm">
                <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nº Fabricación</label><input type="text" className="w-full p-1.5 bg-white border border-slate-300 rounded font-bold uppercase text-xs" value={headerInfo.manufacturingNumber} onChange={(e) => setHeaderInfo({ ...headerInfo, manufacturingNumber: e.target.value })} /></div>
                <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nº Serie</label><input type="text" className="w-full p-1.5 bg-white border border-slate-300 rounded font-bold uppercase text-xs" value={headerInfo.serialNumber} onChange={(e) => setHeaderInfo({ ...headerInfo, serialNumber: e.target.value })} /></div>
                <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cliente / Proyecto</label><input type="text" className="w-full p-1.5 bg-white border border-slate-300 rounded uppercase text-xs font-medium" value={headerInfo.client} onChange={(e) => setHeaderInfo({ ...headerInfo, client: e.target.value })} /></div>
                <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fecha</label><input type="date" className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-medium" value={headerInfo.date} onChange={(e) => setHeaderInfo({ ...headerInfo, date: e.target.value })} /></div>
              </div>
            </div>
            <div className="flex flex-col gap-2 no-print min-w-[160px]" data-html2canvas-ignore="true">
              <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow text-xs uppercase font-bold tracking-wide w-full justify-center"><Download size={16} /> Exportar PDF</button>
              <button onClick={handleDownloadExcel} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow text-xs uppercase font-bold tracking-wide w-full justify-center"><FileSpreadsheet size={16} /> Exportar Excel</button>
            </div>
          </div>
        </header>

        <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 mb-4 no-print flex flex-wrap items-center gap-4" data-html2canvas-ignore="true">
          {(activeTab === 'ttr' || activeTab === 'resistance') && (
            <div className="flex items-center gap-2 pr-4 border-r border-slate-100">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Taps (+/-)</label>
                <select value={tapRange} onChange={(e) => setTapRange(parseInt(e.target.value))} className="block w-24 border-slate-300 rounded border p-1 text-xs bg-slate-50 font-bold">
                  {[...Array(17).keys()].map(num => <option key={num} value={num}>+/- {num}</option>)}
                </select>
              </div>
            </div>
          )}
          <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto">
            <button onClick={() => setActiveTab('ttr')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'ttr' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Zap size={14} /> TTR</button>
            <button onClick={() => setActiveTab('resistance')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'resistance' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Activity size={14} /> Resistencia</button>
            <button onClick={() => setActiveTab('tgdelta')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'tgdelta' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Percent size={14} /> TG Delta</button>
            <button onClick={() => setActiveTab('insulation')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'insulation' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Shield size={14} /> Aislación</button>
          </div>
        </div>

        {activeTab === 'ttr' && (
          <div className="bg-white rounded-lg border border-slate-200 print:border-black animate-in fade-in">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-800 text-white print:bg-slate-300 print:text-black border-b print:border-black">
                    <th colSpan="3" className="py-2 px-2 border-r border-slate-600 print:border-black text-center font-bold text-[10px] uppercase">Referencia</th>
                    <th colSpan="6" className="py-2 px-2 text-center font-bold bg-blue-900 print:bg-slate-300 print:text-black text-[10px] uppercase">Mediciones (3 Fases)</th>
                  </tr>
                  <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold text-center border-b-2 border-slate-300 print:border-black print:text-black">
                    <th className="py-2 px-1 w-12 border-r border-slate-300 print:border-black">Tap</th>
                    <th className="py-2 px-1 w-20 border-r border-slate-300 print:border-black">Ratio %</th>
                    <th className="py-2 px-1 w-24 border-r border-slate-400 print:border-black bg-amber-50 print:bg-white">Teórico</th>
                    <th className="py-2 px-1 w-24 bg-blue-50 print:bg-white border-r print:border-black">Fase A</th>
                    <th className="py-2 px-1 w-16 border-r border-slate-300 print:border-black bg-blue-50 print:bg-white">Dev A</th>
                    <th className="py-2 px-1 w-24 bg-blue-50 print:bg-white border-r print:border-black">Fase B</th>
                    <th className="py-2 px-1 w-16 border-r border-slate-300 print:border-black bg-blue-50 print:bg-white">Dev B</th>
                    <th className="py-2 px-1 w-24 bg-blue-50 print:bg-white border-r print:border-black">Fase C</th>
                    <th className="py-2 px-1 w-16 bg-blue-50 print:bg-white">Dev C</th>
                  </tr>
                </thead>
                <tbody>
                  {tapRows.map((row, index) => {
                    const rowData = data[row.id] || {};
                    const devA = calculateDeviation(rowData.phaseA, rowData.ratedRatio);
                    const devB = calculateDeviation(rowData.phaseB, rowData.ratedRatio);
                    const devC = calculateDeviation(rowData.phaseC, rowData.ratedRatio);
                    const statusA = getStatusTTR(devA); const statusB = getStatusTTR(devB); const statusC = getStatusTTR(devC);
                    return (
                      <tr key={row.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-b border-slate-200 print:border-slate-300`}>
                        <td className="py-1 px-2 border-r border-slate-300 print:border-black text-center font-bold text-slate-700">{row.label}</td>
                        <td className="py-1 px-1 border-r border-slate-300 print:border-black"><input type="text" className="ensayo-input" value={rowData.ratioPercent || ''} onChange={(e) => handleInputChange(row.id, 'ratioPercent', e.target.value)} /></td>
                        <td className="py-1 px-1 border-r border-slate-400 print:border-black bg-amber-50/50 print:bg-white"><input type="text" inputMode="decimal" className="ensayo-input font-bold" value={rowData.ratedRatio || ''} onChange={(e) => handleInputChange(row.id, 'ratedRatio', e.target.value)} /></td>
                        <td className="py-1 px-1 border-r print:border-black border-slate-200"><input type="text" inputMode="decimal" className="ensayo-input" value={rowData.phaseA || ''} onChange={(e) => handleInputChange(row.id, 'phaseA', e.target.value)} /></td>
                        <td className={`py-1 px-1 border-r border-slate-300 print:border-black text-center ${statusA.color} print:border text-[10px]`}>{statusA.icon} {devA !== null ? formatNum(devA) : '-'}%</td>
                        <td className="py-1 px-1 border-r print:border-black border-slate-200"><input type="text" inputMode="decimal" className="ensayo-input" value={rowData.phaseB || ''} onChange={(e) => handleInputChange(row.id, 'phaseB', e.target.value)} /></td>
                        <td className={`py-1 px-1 border-r border-slate-300 print:border-black text-center ${statusB.color} print:border text-[10px]`}>{statusB.icon} {devB !== null ? formatNum(devB) : '-'}%</td>
                        <td className="py-1 px-1 border-r print:border-black border-slate-200"><input type="text" inputMode="decimal" className="ensayo-input" value={rowData.phaseC || ''} onChange={(e) => handleInputChange(row.id, 'phaseC', e.target.value)} /></td>
                        <td className={`py-1 px-1 text-center ${statusC.color} print:border text-[10px]`}>{statusC.icon} {devC !== null ? formatNum(devC) : '-'}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'resistance' && (
          <div className="bg-white rounded-lg border border-slate-200 print:border-black animate-in fade-in">
            <div className="bg-purple-50 p-2 border-b border-purple-200 grid grid-cols-1 md:grid-cols-2 gap-4 print:bg-white print:border-black print:border-b-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase text-purple-900">Temp. Observada:</span>
                <input type="text" inputMode="decimal" value={resistanceSettings.measuredTemp} onChange={(e) => setResistanceSettings({ ...resistanceSettings, measuredTemp: e.target.value.replace('.', ',') })} className="w-16 p-1 border border-purple-300 rounded text-center font-bold text-xs" />
                <span className="text-xs text-purple-800 font-bold">°C</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase text-purple-900">Temp. Referencia:</span>
                <input type="text" inputMode="decimal" value={resistanceSettings.refTemp} onChange={(e) => setResistanceSettings({ ...resistanceSettings, refTemp: e.target.value.replace('.', ',') })} className="w-16 p-1 border border-purple-300 rounded text-center font-bold text-xs" />
                <span className="text-xs text-purple-800 font-bold">°C</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-xs">
                <thead>
                  <tr className="bg-purple-900 text-white print:bg-slate-300 print:text-black border-b print:border-black">
                    <th className="py-2 px-2 border-r border-purple-700 print:border-black w-16 text-[10px]">POS</th>
                    <th colSpan="2" className="py-1 px-2 border-r border-purple-700 print:border-black text-center"><input type="text" value={resistanceSettings.conn1Name} onChange={(e) => setResistanceSettings({ ...resistanceSettings, conn1Name: e.target.value })} className="bg-transparent text-white print:text-black text-center font-bold text-[10px] w-full focus:outline-none" placeholder="Conexión 1" /></th>
                    <th colSpan="2" className="py-1 px-2 border-r border-purple-700 print:border-black text-center"><input type="text" value={resistanceSettings.conn2Name} onChange={(e) => setResistanceSettings({ ...resistanceSettings, conn2Name: e.target.value })} className="bg-transparent text-white print:text-black text-center font-bold text-[10px] w-full focus:outline-none" placeholder="Conexión 2" /></th>
                    <th colSpan="2" className="py-1 px-2 text-center"><input type="text" value={resistanceSettings.conn3Name} onChange={(e) => setResistanceSettings({ ...resistanceSettings, conn3Name: e.target.value })} className="bg-transparent text-white print:text-black text-center font-bold text-[10px] w-full focus:outline-none" placeholder="Conexión 3" /></th>
                  </tr>
                  <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold text-center border-b-2 border-slate-300 print:border-black print:text-black">
                    <th className="py-2 px-1 border-r border-slate-300 print:border-black">Tap</th>
                    <th className="py-1 px-1 w-32 border-r border-slate-300 print:border-black">Medido</th>
                    <th className="py-1 px-1 w-32 border-r border-slate-400 print:border-black bg-purple-50 print:bg-white">Corregido</th>
                    <th className="py-1 px-1 w-32 border-r border-slate-300 print:border-black">Medido</th>
                    <th className="py-1 px-1 w-32 border-r border-slate-400 print:border-black bg-purple-50 print:bg-white">Corregido</th>
                    <th className="py-1 px-1 w-32 border-r border-slate-300 print:border-black">Medido</th>
                    <th className="py-1 px-1 w-32 bg-purple-50 print:bg-white">Corregido</th>
                  </tr>
                </thead>
                <tbody>
                  {tapRows.map((row, index) => {
                    const rowData = data[row.id] || {};
                    const c1 = calculateResistanceCorrection(rowData.resConn1Meas); const c2 = calculateResistanceCorrection(rowData.resConn2Meas); const c3 = calculateResistanceCorrection(rowData.resConn3Meas);
                    return (
                      <tr key={row.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-b border-slate-200 print:border-slate-300`}>
                        <td className="py-1 px-2 border-r border-slate-300 print:border-black text-center font-bold text-slate-700">{row.label}</td>
                        <td className="py-1 px-1 border-r border-slate-300 print:border-black"><input type="text" inputMode="decimal" className="ensayo-input" value={rowData.resConn1Meas || ''} onChange={(e) => handleInputChange(row.id, 'resConn1Meas', e.target.value)} /></td>
                        <td className="py-1 px-1 border-r border-slate-400 print:border-black bg-purple-50/30 text-center font-mono text-blue-800 font-bold">{c1 !== null ? formatNum(c1, 4) : '-'}</td>
                        <td className="py-1 px-1 border-r border-slate-300 print:border-black"><input type="text" inputMode="decimal" className="ensayo-input" value={rowData.resConn2Meas || ''} onChange={(e) => handleInputChange(row.id, 'resConn2Meas', e.target.value)} /></td>
                        <td className="py-1 px-1 border-r border-slate-400 print:border-black bg-purple-50/30 text-center font-mono text-blue-800 font-bold">{c2 !== null ? formatNum(c2, 4) : '-'}</td>
                        <td className="py-1 px-1 border-r border-slate-300 print:border-black"><input type="text" inputMode="decimal" className="ensayo-input" value={rowData.resConn3Meas || ''} onChange={(e) => handleInputChange(row.id, 'resConn3Meas', e.target.value)} /></td>
                        <td className="py-1 px-1 bg-purple-50/30 text-center font-mono text-blue-800 font-bold">{c3 !== null ? formatNum(c3, 4) : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'tgdelta' && (
          <div className="bg-white rounded-lg border border-slate-200 print:border-black animate-in fade-in">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-xs">
                <thead>
                  <tr className="bg-orange-800 text-white print:bg-slate-300 print:text-black border-b print:border-black">
                    <th rowSpan="2" className="py-2 px-3 border-r border-orange-700 print:border-black w-24 text-[10px]">MODO</th>
                    <th colSpan="3" className="py-1 px-2 border-r border-orange-700 print:border-black text-center bg-orange-900 print:bg-slate-400 text-[10px]">CONEXIONES</th>
                    <th rowSpan="2" className="py-2 px-2 border-r border-orange-700 print:border-black w-32 text-[10px]">TENSIÓN</th>
                    <th rowSpan="2" className="py-2 px-2 border-r border-orange-700 print:border-black w-32 text-[10px]">TG (%)</th>
                    <th rowSpan="2" className="py-2 px-2 w-32 text-[10px]">Cx (pF)</th>
                    <th rowSpan="2" className="py-2 px-1 w-10 no-print"></th>
                  </tr>
                  <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold text-center border-b-2 border-slate-300 print:border-black print:text-black">
                    <th className="py-1 px-1 border-r border-slate-300 print:border-black w-24">INYECCIÓN</th>
                    <th className="py-1 px-1 border-r border-slate-300 print:border-black">MEDICIÓN</th>
                    <th className="py-1 px-1 border-r border-slate-300 print:border-black">GUARDA</th>
                  </tr>
                </thead>
                <tbody>
                  {tgDeltaData.map((row) => {
                    const status = getStatusTG(row.tgPercent);
                    return (
                      <tr key={row.id} className="bg-white border-b border-slate-200 print:border-slate-300">
                        <td className="py-1 px-1 border-r border-slate-300 print:border-black">
                          <select value={row.mode || ''} onChange={(e) => handleTgDeltaChange(row.id, 'mode', e.target.value)} className="ensayo-input border-none font-bold text-slate-700">
                            <option value="">-</option><option value="UST">UST</option><option value="GST g">GST g</option><option value="GST-GND">GST-GND</option>
                          </select>
                        </td>
                        <td className="py-1 px-1 border-r border-slate-300 print:border-black">
                          <select value={row.injection || ''} onChange={(e) => handleTgDeltaChange(row.id, 'injection', e.target.value)} className="ensayo-input border-none font-medium">
                            <option value="">-</option><option value="AT">AT</option><option value="MT">MT</option><option value="BT">BT</option>
                          </select>
                        </td>
                        <td className="py-1 px-1 border-r border-slate-300 print:border-black"><input type="text" className="ensayo-input border-none" value={row.measurement || ''} onChange={(e) => handleTgDeltaChange(row.id, 'measurement', e.target.value)} /></td>
                        <td className="py-1 px-1 border-r border-slate-300 print:border-black"><input type="text" className="ensayo-input border-none" value={row.guard || ''} onChange={(e) => handleTgDeltaChange(row.id, 'guard', e.target.value)} /></td>
                        <td className="py-1 px-1 border-r border-slate-300 print:border-black"><input type="text" inputMode="decimal" className="ensayo-input border-none font-bold" value={row.testVoltage || ''} onChange={(e) => handleTgDeltaChange(row.id, 'testVoltage', e.target.value)} /></td>
                        <td className={`py-1 px-1 border-r border-slate-300 print:border-black text-center ${status.color} print:border`}><div className="flex items-center justify-center gap-1">{status.icon}<input type="text" inputMode="decimal" className="w-16 p-1 border-none bg-transparent text-center font-bold focus:outline-none text-xs" placeholder="%" value={row.tgPercent || ''} onChange={(e) => handleTgDeltaChange(row.id, 'tgPercent', e.target.value)} /></div></td>
                        <td className="py-1 px-1 print:border-black"><input type="text" inputMode="decimal" className="ensayo-input border-none" placeholder="pF" value={row.capacitance || ''} onChange={(e) => handleTgDeltaChange(row.id, 'capacitance', e.target.value)} /></td>
                        <td className="py-1 px-1 text-center no-print"><button onClick={() => removeTgDeltaRow(row.id)} className="text-slate-300 hover:text-rose-500 transition"><X size={14} /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 print:bg-white text-[10px] text-slate-500 flex justify-between items-center font-medium">
              <span>* TG aceptable &lt; 0,5%</span>
              <button onClick={addTgDeltaRow} className="flex items-center gap-1 text-orange-600 font-bold hover:text-orange-800 no-print"><Plus size={14} /> Fila</button>
            </div>
          </div>
        )}

        {activeTab === 'insulation' && (
          <div className="bg-white rounded-lg border border-slate-200 print:border-black animate-in fade-in">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-xs">
                <thead>
                  <tr className="bg-teal-800 text-white print:bg-slate-300 print:text-black border-b print:border-black">
                    <th colSpan="3" className="py-1 px-2 border-r border-teal-700 print:border-black text-center bg-teal-900 print:bg-slate-400 text-[10px]">CONEXIÓN</th>
                    <th colSpan="11" className="py-1 px-2 border-r border-teal-700 print:border-black text-center text-[10px]">RESULTADOS (GΩ)</th>
                    <th colSpan="3" className="py-1 px-2 border-r border-teal-700 print:border-black text-center bg-teal-900 print:bg-slate-400 text-[10px]">ÍNDICES</th>
                    <th rowSpan="2" className="py-1 px-1 w-8 no-print"></th>
                  </tr>
                  <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold text-center border-b-2 border-slate-300 print:border-black print:text-black">
                    <th className="py-1 px-1 border-r border-slate-300 print:border-black w-16">INY</th><th className="py-1 px-1 border-r border-slate-300 print:border-black w-16">MED</th><th className="py-1 px-1 border-r border-slate-300 print:border-black w-16">GDA</th>
                    {['30"',"1'","2'","3'","4'","5'","6'","7'","8'","9'","10'"].map(t=><th key={t} className="py-1 px-1 border-r border-slate-300 print:border-black w-10">{t}</th>)}
                    <th className="py-1 px-1 border-r border-slate-300 print:border-black w-12 bg-amber-50 print:bg-white">RAD</th><th className="py-1 px-1 border-r border-slate-300 print:border-black w-12 bg-amber-50 print:bg-white">IP</th><th className="py-1 px-1 w-24 bg-slate-50 print:bg-white">Estado IP</th>
                  </tr>
                </thead>
                <tbody>
                  {insulationData.map((row) => {
                    const dar = calculateDAR(row.val1m, row.val30s); const pi = calculatePI(row.val10m, row.val1m); const statusIP = getStatusIP(pi);
                    return (
                      <tr key={row.id} className="bg-white border-b border-slate-200 print:border-slate-300">
                        <td className="py-1 px-1 border-r border-slate-300 print:border-black"><select value={row.injection || ''} onChange={(e) => handleInsulationChange(row.id, 'injection', e.target.value)} className="ensayo-input border-none font-bold text-[10px]"><option value="">-</option><option value="AT">AT</option><option value="MT">MT</option><option value="BT">BT</option></select></td>
                        <td className="py-1 px-1 border-r border-slate-300 print:border-black"><input type="text" className="ensayo-input border-none text-[10px]" value={row.measurement || ''} onChange={(e) => handleInsulationChange(row.id, 'measurement', e.target.value)} /></td>
                        <td className="py-1 px-1 border-r border-slate-300 print:border-black"><input type="text" className="ensayo-input border-none text-[10px]" value={row.guard || ''} onChange={(e) => handleInsulationChange(row.id, 'guard', e.target.value)} /></td>
                        {['val30s','val1m','val2m','val3m','val4m','val5m','val6m','val7m','val8m','val9m','val10m'].map(f=>(<td key={f} className="py-1 px-0.5 border-r border-slate-300 print:border-black"><input type="text" inputMode="decimal" className="ensayo-input border-none text-[10px] p-0" value={row[f] || ''} onChange={(e) => handleInsulationChange(row.id, f, e.target.value)} /></td>))}
                        <td className="py-1 px-1 border-r border-slate-300 print:border-black bg-amber-50/50 text-center font-bold text-[10px] text-blue-800">{dar !== null ? formatNum(dar, 2) : '-'}</td>
                        <td className="py-1 px-1 border-r border-slate-300 print:border-black bg-amber-50/50 text-center font-bold text-[10px] text-blue-800">{pi !== null ? formatNum(pi, 2) : '-'}</td>
                        <td className={`py-1 px-1 text-center font-bold text-[9px] uppercase ${statusIP.color} print:border-black print:border`}><div className="flex items-center justify-center gap-1">{statusIP.icon}<span>{statusIP.label}</span></div></td>
                        <td className="py-1 px-1 text-center no-print"><button onClick={() => removeInsulationRow(row.id)} className="text-slate-300 hover:text-rose-500 transition"><X size={12} /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 print:bg-white text-[10px] text-slate-500 flex justify-between items-center font-medium">
              <span>* IP Aceptable &gt; 1.0</span>
              <button onClick={addInsulationRow} className="flex items-center gap-1 text-teal-600 font-bold hover:text-teal-800 no-print"><Plus size={14} /> Fila</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente intermediario para listar/crear ensayos de un servicio
const ServiceTestsManager = ({ service, onUpdateService, onClose }) => {
  const [activeTest, setActiveTest] = useState(null);
  const maxTrafos = service.cantidadTrafos || 1;
  const tests = service.ensayos || [];

  const handleSaveTest = async (updatedTest) => {
    let newTests = [...tests];
    const index = newTests.findIndex(t => t.id === updatedTest.id);
    if (index >= 0) newTests[index] = updatedTest;
    else newTests.push(updatedTest);
    
    await onUpdateService({ ensayos: newTests });
  };

  const handleCreateTest = () => {
    if (tests.length >= maxTrafos) {
      alert("Ya se alcanzó la cantidad máxima de transformadores configurada para este servicio.");
      return;
    }
    const newTest = {
      id: generateId(), lastModified: new Date().toISOString(), tapRange: 5,
      headerInfo: { manufacturingNumber: service.trafoFabricacion||'', serialNumber: service.trafoSerie||'', client: service.cliente||'', date: new Date().toISOString().split('T')[0] },
      data: {}, resistanceSettings: { measuredTemp: '20', refTemp: '75', conn1Name: 'Conexión 1', conn2Name: 'Conexión 2', conn3Name: 'Conexión 3' },
      tgDeltaData: Array(4).fill(null).map(() => ({ id: generateId() })),
      insulationData: Array(6).fill(null).map(() => ({ id: generateId() }))
    };
    setActiveTest(newTest);
  };

  const handleDeleteTest = async (testId, e) => {
    e.stopPropagation();
    if (window.confirm("¿Seguro que deseas eliminar esta planilla?")) {
      const newTests = tests.filter(t => t.id !== testId);
      await onUpdateService({ ensayos: newTests });
    }
  };

  if (activeTest) {
    return <TestSheetEditor testData={activeTest} onSave={handleSaveTest} onBack={() => setActiveTest(null)} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto py-4">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-bold text-lg text-slate-800 flex items-center"><FileSpreadsheet className="w-5 h-5 mr-2 text-teal-600"/> Ensayos del Servicio</h3>
          <p className="text-xs text-slate-500 mt-1">Transformadores ensayados: <b>{tests.length} de {maxTrafos}</b> permitidos.</p>
        </div>
        {tests.length < maxTrafos && (
          <button onClick={handleCreateTest} className="bg-teal-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-teal-700 transition flex items-center text-sm shadow-md active:scale-95">
            <Plus className="w-4 h-4 mr-1"/> Nueva Planilla
          </button>
        )}
      </div>

      {tests.length === 0 ? (
        <div className="text-center p-12 text-slate-400 italic bg-white/50 rounded-xl border border-dashed border-slate-200">
          Aún no se han cargado planillas de ensayo para este servicio.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tests.map(t => (
            <div key={t.id} onClick={() => setActiveTest(t)} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 cursor-pointer hover:border-teal-400 hover:shadow-md transition-all group relative">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold bg-teal-50 text-teal-700 px-2 py-1 rounded uppercase tracking-wider">Planilla TTR/Res/TG/Aisl</span>
                <button onClick={(e) => handleDeleteTest(t.id, e)} className="text-slate-300 hover:text-rose-500 transition-colors p-1"><Trash2 className="w-4 h-4"/></button>
              </div>
              <h4 className="font-black text-slate-800 text-lg leading-tight mb-1">SN: {t.headerInfo.serialNumber || 'Sin especificar'}</h4>
              <p className="text-xs text-slate-500 mb-3">Fabricación: {t.headerInfo.manufacturingNumber || '-'}</p>
              <div className="flex items-center text-[10px] text-slate-400 font-medium">
                <Clock className="w-3 h-3 mr-1"/> Modificado: {new Date(t.lastModified).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Panel global de ensayos para Administrador
const EnsayosDashboard = ({ services }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const allTests = useMemo(() => {
    return services.flatMap(s => (s.ensayos || []).map(t => ({
      ...t, 
      serviceId: s.id, 
      serviceOci: s.oci, 
      serviceCliente: s.cliente,
      serviceDate: s.fInicio
    }))).sort((a,b) => new Date(b.lastModified) - new Date(a.lastModified));
  }, [services]);

  const filteredTests = allTests.filter(t => 
    (t.headerInfo.serialNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.serviceCliente || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.serviceOci || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in h-full flex flex-col">
      <div className="bg-white/95 p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center backdrop-blur-sm shrink-0">
        <div>
            <h3 className="text-lg font-bold flex items-center text-slate-800"><FileSpreadsheet className="w-5 h-5 mr-3 text-teal-600"/> Base de Datos de Ensayos</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Registro global de planillas eléctricas</p>
        </div>
        <div className="flex w-full md:w-auto flex-1 max-w-md relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400"/>
            <input type="text" placeholder="Buscar por Cliente, OCI o Serie..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-teal-100 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50 sticky top-0 z-10">
                    <tr>
                        <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-[10px]">Cliente / OCI</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-[10px]">Transformador</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-[10px]">Fecha Servicio</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-[10px]">Última Modificación</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredTests.map((t, idx) => (
                        <tr key={`${t.id}-${idx}`} className="hover:bg-teal-50/30 transition-colors">
                            <td className="px-6 py-4">
                                <div className="font-bold text-slate-800">{t.serviceCliente}</div>
                                <div className="text-xs font-mono text-slate-500">OCI: {t.serviceOci}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-bold text-slate-700">SN: {t.headerInfo.serialNumber || 'S/N'}</div>
                                <div className="text-[10px] text-slate-500">FAB: {t.headerInfo.manufacturingNumber || '-'}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-600 font-medium">{formatDate(t.serviceDate)}</td>
                            <td className="px-6 py-4 text-xs text-slate-500">{new Date(t.lastModified).toLocaleString()}</td>
                        </tr>
                    ))}
                    {filteredTests.length === 0 && <tr><td colSpan="4" className="text-center py-12 text-slate-400 italic">No se encontraron ensayos.</td></tr>}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
// ============================================================================


// ... (CÓDIGO ANTERIOR DE ENCUESTAS, DASHBOARDS, MAPA, KANBAN, ETC.) ...
// (Se mantienen igual que en tu código original)
const surveyQuestionsData = [
    { id: 'q1', title: '1. Califique la atención que el servicio de post venta le brindo previo a iniciar los trabajos.', obsLabel: 'Observaciones (Atención previa)' },
    { id: 'q2', title: '2. Califique la coordinación y cumplimiento en la ejecución de los trabajos en sitio.', obsLabel: 'Observaciones (Coordinación y ejecución)' },
    { id: 'q3', title: '3. Califique el estado de las herramientas y equipamiento utilizados por el servicio de post venta.', obsLabel: 'Observaciones (Herramientas y equipamiento)' },
    { id: 'q4', title: '4. Califique el proceso de ensayos de TTE del transformador recibido.', obsLabel: 'Observaciones (Proceso de ensayos)' },
    { id: 'q5', title: '5. Califique el desempeño del supervisor responsable en obra', obsLabel: 'Observaciones (Desempeño del supervisor)' },
    { id: 'q6', title: '6. Califique el conocimiento del supervisor respecto al servicio realizado.', obsLabel: 'Observaciones (Conocimiento del supervisor)' },
    { id: 'q7', title: '7. Califique el grado de cumplimiento del servicio solicitado inicialmente.', obsLabel: 'Observaciones (Cumplimiento del servicio)' },
    { id: 'q8', title: '8. El servicio de post venta de TTE tiene como objetivo asistirlo hasta que su transformador esté en funcionamiento según las normas y especificaciones y durante la vida útil del transformador. ¿Recomendaría Ud. a nuestra área de Servicio Post Venta? Indique el grado de recomendación.', obsLabel: 'Comentarios (Recomendación)', labels: ['No Recomendable', 'Recomendable'] }
];

const SurveyForm = ({ serviceId }) => {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombreCompleto: '', fechaAsistencia: new Date().toISOString().split('T')[0], email: '', empresa: '', cargo: '', motivo: '', tipoTrabajo: ''
    });
    const [ratings, setRatings] = useState({ q1: null, q2: null, q3: null, q4: null, q5: null, q6: null, q7: null, q8: null });
    const [observations, setObservations] = useState({ q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '' });

    const handleRatingChange = (q, val) => setRatings(prev => ({ ...prev, [q]: val }));
    const handleObsChange = (q, val) => setObservations(prev => ({ ...prev, [q]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!formData.nombreCompleto || !formData.email || !formData.empresa || !formData.tipoTrabajo) {
            alert("Por favor complete los campos obligatorios (*)"); return;
        }
        const missingRating = Object.keys(ratings).find(k => ratings[k] === null);
        if (missingRating) {
            alert("Por favor califique todas las preguntas con escala del 1 al 5."); return;
        }

        setLoading(true);
        try {
            const surveyDoc = { serviceId, timestamp: new Date().toISOString(), ...formData, ratings, observations };
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'surveys'), surveyDoc);
            setSubmitted(true);
        } catch (error) {
            console.error("Error saving survey", error);
            alert("Hubo un error al enviar la encuesta. Por favor intente nuevamente.");
        }
        setLoading(false);
    };

    if (submitted) {
        return (
            <div className="survey-container flex items-center justify-center p-4">
                <div className="survey-card w-full max-w-3xl p-8 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">¡Gracias por su respuesta!</h2>
                    <p className="text-gray-600">Su opinión es muy importante para ayudarnos a mejorar nuestro servicio de Post Venta.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="survey-container font-sans p-4 pb-20">
            <div className="max-w-3xl mx-auto space-y-4">
                <div className="survey-card p-6">
                    <h1 className="text-3xl font-bold mb-2">Encuesta de Satisfacción - Servicio Post Venta</h1>
                    <p className="text-sm text-gray-600 border-t border-gray-200 pt-4 mt-4">
                        Por favor, complete la siguiente encuesta para evaluar el servicio recibido. Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="survey-card-inner p-6 space-y-6">
                        <div><label className="block font-semibold mb-1">Nombre completo <span className="text-red-500">*</span></label><input type="text" className="survey-input w-full md:w-1/2" placeholder="Tu respuesta" value={formData.nombreCompleto} onChange={e=>setFormData({...formData, nombreCompleto: e.target.value})} required /></div>
                        <div><label className="block font-semibold mb-1">Fecha de asistencia <span className="text-red-500">*</span></label><input type="date" className="survey-input w-full md:w-1/3" value={formData.fechaAsistencia} onChange={e=>setFormData({...formData, fechaAsistencia: e.target.value})} required /></div>
                        <div><label className="block font-semibold mb-1">Dirección de correo electrónico <span className="text-red-500">*</span></label><input type="email" className="survey-input w-full md:w-1/2" placeholder="Tu respuesta" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} required /></div>
                        <div><label className="block font-semibold mb-1">Empresa a la que pertenece <span className="text-red-500">*</span></label><input type="text" className="survey-input w-full md:w-1/2" placeholder="Tu respuesta" value={formData.empresa} onChange={e=>setFormData({...formData, empresa: e.target.value})} required /></div>
                        <div><label className="block font-semibold mb-1">Cargo dentro de la empresa <span className="text-red-500">*</span></label><input type="text" className="survey-input w-full md:w-1/2" placeholder="Tu respuesta" value={formData.cargo} onChange={e=>setFormData({...formData, cargo: e.target.value})} required /></div>
                        <div><label className="block font-semibold mb-1">Motivo de asistencia <span className="text-red-500">*</span></label><textarea className="survey-input w-full resize-none h-10" placeholder="Tu respuesta" value={formData.motivo} onChange={e=>setFormData({...formData, motivo: e.target.value})} required /></div>
                        <div>
                            <label className="block font-semibold mb-4">Tipo de trabajo <span className="text-red-500">*</span></label>
                            <div className="space-y-3 survey-radio-group">
                                {TIPOS_TRABAJO.filter(t=>t!=='Vacaciones' && t!=='Estudios Médicos').map(t => (
                                    <label key={t} className="flex items-center space-x-3 cursor-pointer">
                                        <input type="radio" name="tipoTrabajo" value={t} checked={formData.tipoTrabajo === t} onChange={e=>setFormData({...formData, tipoTrabajo: e.target.value})} required/>
                                        <span>{t}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {surveyQuestionsData.map((q, idx) => (
                        <div key={q.id} className="space-y-4">
                            <div className="survey-card-inner p-6">
                                <label className="block font-semibold mb-6">{q.title} <span className="text-red-500">*</span></label>
                                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 survey-radio-group">
                                    <span className="text-sm text-gray-500 font-medium hidden md:block">{q.labels ? q.labels[0] : 'Muy Insatisfecho'}</span>
                                    <div className="flex justify-between w-full md:w-auto gap-4 md:gap-8">
                                        {[1, 2, 3, 4, 5].map(val => (
                                            <div key={val} className="flex flex-col items-center gap-2">
                                                <span className="text-sm">{val}</span>
                                                <input type="radio" name={q.id} value={val} checked={ratings[q.id] === val} onChange={() => handleRatingChange(q.id, val)} required/>
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-500 font-medium hidden md:block">{q.labels ? q.labels[1] : 'Muy Satisfecho'}</span>
                                </div>
                                <div className="flex justify-between w-full mt-2 md:hidden">
                                     <span className="text-xs text-gray-500">{q.labels ? q.labels[0] : 'Muy Insatisfecho'}</span>
                                     <span className="text-xs text-gray-500">{q.labels ? q.labels[1] : 'Muy Satisfecho'}</span>
                                </div>
                            </div>
                            <div className="survey-card-inner p-6">
                                <label className="block font-semibold mb-2">{q.obsLabel}</label>
                                <textarea className="survey-input w-full resize-none h-10" placeholder="Tu respuesta" value={observations[q.id]} onChange={(e) => handleObsChange(q.id, e.target.value)} />
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-between items-center pt-4">
                        <button type="submit" disabled={loading} className="bg-[#673ab7] hover:bg-[#5e35b1] text-white font-semibold py-2 px-6 rounded-md transition-colors disabled:opacity-50">
                            {loading ? 'Enviando...' : 'Enviar'}
                        </button>
                        <span className="text-xs text-gray-400">Nunca envíes contraseñas a través de este formulario.</span>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SurveyDashboard = ({ surveys }) => {
    const [filterYear, setFilterYear] = useState('all');
    const [selectedSurveyModal, setSelectedSurveyModal] = useState(null);

    const availableYears = useMemo(() => {
        const years = new Set();
        (surveys || []).forEach(s => {
            if (s.timestamp) years.add(new Date(s.timestamp).getFullYear());
        });
        const yearsArray = Array.from(years).sort((a, b) => b - a);
        return yearsArray.length > 0 ? yearsArray : [new Date().getFullYear()];
    }, [surveys]);

    const filteredSurveys = useMemo(() => {
        if (!surveys) return [];
        if (filterYear === 'all') return surveys;
        return surveys.filter(s => new Date(s.timestamp).getFullYear().toString() === filterYear);
    }, [surveys, filterYear]);

    const handleExportExcel = () => {
        if (!filteredSurveys || filteredSurveys.length === 0) return;
        
        let table = "<table><thead><tr>";
        const headers = [
            "nombre completo", "fecha de asistencia", "direccion de correo electronico", "Empresa a la que pertenece", 
            "Cargo dentro de la empresa", "Motivo de asistencia", 
            "1. Califique la atención que el servicio de post venta le brindo previo a iniciar los trabajos.", "Observaciones (Atención previa)", 
            "2. Califique la coordinación y cumplimiento en la ejecución de los trabajos en sitio.", "Observaciones (Coordinación y ejecución)", 
            "3. Califique el estado de las herramientas y equipamiento utilizados por el servicio de post venta.", "Observaciones (Herramientas y equipamiento)", 
            "4. Califique el proceso de ensayos de TTE del transformador recibido.", "Observaciones (Proceso de ensayos)", 
            "5. Califique el desempeño del supervisor responsable en obra", "Observaciones (Desempeño del supervisor)", 
            "6. Califique el conocimiento del supervisor respecto al servicio realizado.", "Observaciones (Conocimiento del supervisor)", 
            "7. Califique el grado de cumplimiento del servicio solicitado inicialmente.", "Observaciones (Cumplimiento del servicio)", 
            "8. El servicio de post venta de TTE tiene como objetivo asistirlo hasta que su transformador esté funcionamiento según las normas y especificaciones y durante la vida útil del transformador. ¿Recomendaría Ud. a nuestra área de Servicio Post Venta? Indique el grado de recomendación.", "Comentarios (Recomendación)", 
            "Marca temporal (Fecha de respuesta)", "Tipo de trabajo"
        ];
        headers.forEach(h => table += `<th style="background-color:#fef08a; font-weight:bold;">${h}</th>`);
        table += "</tr></thead><tbody>";

        filteredSurveys.forEach(s => {
            table += "<tr>";
            table += `<td>${s.nombreCompleto || ''}</td>`;
            table += `<td>${s.fechaAsistencia || ''}</td>`;
            table += `<td>${s.email || ''}</td>`;
            table += `<td>${s.empresa || ''}</td>`;
            table += `<td>${s.cargo || ''}</td>`;
            table += `<td>${s.motivo || ''}</td>`;
            table += `<td>${s.ratings?.q1 || ''}</td>`;
            table += `<td>${s.observations?.q1 || ''}</td>`;
            table += `<td>${s.ratings?.q2 || ''}</td>`;
            table += `<td>${s.observations?.q2 || ''}</td>`;
            table += `<td>${s.ratings?.q3 || ''}</td>`;
            table += `<td>${s.observations?.q3 || ''}</td>`;
            table += `<td>${s.ratings?.q4 || ''}</td>`;
            table += `<td>${s.observations?.q4 || ''}</td>`;
            table += `<td>${s.ratings?.q5 || ''}</td>`;
            table += `<td>${s.observations?.q5 || ''}</td>`;
            table += `<td>${s.ratings?.q6 || ''}</td>`;
            table += `<td>${s.observations?.q6 || ''}</td>`;
            table += `<td>${s.ratings?.q7 || ''}</td>`;
            table += `<td>${s.observations?.q7 || ''}</td>`;
            table += `<td>${s.ratings?.q8 || ''}</td>`;
            table += `<td>${s.observations?.q8 || ''}</td>`;
            table += `<td>${s.timestamp ? new Date(s.timestamp).toLocaleString('es-ES') : ''}</td>`;
            table += `<td>${s.tipoTrabajo || ''}</td>`;
            table += "</tr>";
        });
        table += "</tbody></table>";

        const blob = new Blob([`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8" /></head><body>${table}</body></html>`], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Respuestas_Encuestas_${filterYear}.xls`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDeleteSurvey = async (e, surveyId) => {
        e.stopPropagation();
        if (window.confirm('¿Seguro que deseas eliminar esta encuesta permanentemente?')) {
            try {
                await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'surveys', surveyId));
            } catch (error) {
                console.error("Error eliminando encuesta", error);
                alert("Error al eliminar la encuesta.");
            }
        }
    };

    const averages = useMemo(() => {
        if (!filteredSurveys || filteredSurveys.length === 0) return null;
        const sums = { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0, q7: 0, q8: 0 };
        const counts = { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0, q7: 0, q8: 0 };

        filteredSurveys.forEach(s => {
            Object.keys(s.ratings || {}).forEach(k => {
                if(s.ratings[k]) {
                    sums[k] += Number(s.ratings[k]);
                    counts[k] += 1;
                }
            });
        });

        const labels = {
            q1: 'Atención Previa', q2: 'Coordinación', q3: 'Herramientas', q4: 'Ensayos TTE',
            q5: 'Desempeño Sup.', q6: 'Conocimiento Sup.', q7: 'Cumplimiento', q8: 'Recomendación'
        };

        const result = Object.keys(sums).map(k => ({
            name: labels[k],
            promedio: counts[k] > 0 ? parseFloat((sums[k] / counts[k]).toFixed(1)) : 0,
            fullMark: 5
        }));
        const globalAvg = result.reduce((acc, curr) => acc + curr.promedio, 0) / (result.length || 1);
        return { data: result, global: globalAvg.toFixed(1) };
    }, [filteredSurveys]);

    const getDonutDataForQuestion = (qKey) => {
        const counts = { '5 Puntos':0, '4 Puntos':0, '3 Puntos':0, '2 Puntos':0, '1 Punto':0 };
        filteredSurveys.forEach(s => {
            const val = s.ratings?.[qKey];
            if (val === 5) counts['5 Puntos']++;
            else if (val === 4) counts['4 Puntos']++;
            else if (val === 3) counts['3 Puntos']++;
            else if (val === 2) counts['2 Puntos']++;
            else if (val === 1) counts['1 Punto']++;
        });
        return Object.keys(counts).filter(k=>counts[k]>0).map(k => ({ name: k, value: counts[k] }));
    };

    const getTipoTrabajoData = () => {
        const counts = {};
        filteredSurveys.forEach(s => {
            const tipo = s.tipoTrabajo || 'Desconocido';
            counts[tipo] = (counts[tipo] || 0) + 1;
        });
        return Object.keys(counts).map(k => ({ name: k, value: counts[k] }));
    };

    const getLeadTimeData = () => {
        const buckets = { "0 A 10 Dias": 0, "11 A 20 Dias": 0, "21 A 30 Dias": 0, "+30 Dias": 0 };
        filteredSurveys.forEach(s => {
            if (s.fechaAsistencia && s.timestamp) {
                const diffDays = Math.floor((new Date(s.timestamp) - new Date(s.fechaAsistencia)) / (1000 * 60 * 60 * 24));
                if (diffDays <= 10) buckets["0 A 10 Dias"]++;
                else if (diffDays <= 20) buckets["11 A 20 Dias"]++;
                else if (diffDays <= 30) buckets["21 A 30 Dias"]++;
                else buckets["+30 Dias"]++;
            }
        });
        return Object.keys(buckets).filter(k=>buckets[k]>0).map(k => ({ name: k, value: buckets[k] }));
    };

    const PIE_COLORS = { '5 Puntos': '#3b82f6', '4 Puntos': '#ef4444', '3 Puntos': '#f59e0b', '2 Puntos': '#f97316', '1 Punto': '#94a3b8' };
    const LEAD_COLORS = ['#3b82f6', '#facc15', '#f97316', '#ef4444'];

    return (
        <div className="space-y-6 animate-in fade-in pb-10">
            <div className="flex flex-col md:flex-row items-center justify-between bg-white/95 p-5 rounded-2xl border border-slate-100 shadow-sm backdrop-blur-sm sticky top-0 z-20">
                <div className="flex items-center gap-3 mb-4 md:mb-0">
                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><ClipboardList className="w-5 h-5" /></div>
                    <div><h3 className="text-lg font-bold text-slate-800">Dashboard de Encuestas</h3><p className="text-xs text-slate-400 font-medium">Análisis de Satisfacción Post Venta</p></div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                        <div className="flex items-center px-3 text-slate-500 text-xs font-bold uppercase tracking-wider"><Filter className="w-3.5 h-3.5 mr-2"/> Año</div>
                        <select className="bg-white border border-slate-200 rounded-lg text-sm py-1.5 px-3 outline-none" value={filterYear} onChange={e=>setFilterYear(e.target.value)}>
                            <option value="all">Todos los Años</option>
                            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <button onClick={handleExportExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl shadow-md text-sm transition-colors flex items-center">
                        <Download className="w-4 h-4 mr-2" /> Exportar a Excel
                    </button>
                </div>
            </div>

            {!filteredSurveys || filteredSurveys.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-white/90 rounded-2xl border border-dashed border-slate-200">
                    <ClipboardList className="w-12 h-12 mx-auto mb-4 text-slate-300"/>
                    <p>No hay respuestas de encuestas registradas para el año seleccionado.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                                <Star className="w-8 h-8 text-emerald-500 fill-emerald-500"/>
                            </div>
                            <h3 className="text-4xl font-black text-slate-800 mb-1">{averages.global} <span className="text-lg text-slate-400">/ 5</span></h3>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Satisfacción General Promedio</p>
                            <p className="text-xs text-slate-400 mt-2">Basado en {filteredSurveys.length} respuesta(s)</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:col-span-2 h-80">
                            <h4 className="font-bold text-slate-800 text-sm mb-4 flex items-center"><BarChart2 className="w-4 h-4 mr-2 text-indigo-500"/> Promedio por Categoría</h4>
                            <ResponsiveContainer width="100%" height="85%">
                                <RechartsBarChart data={averages.data} layout="vertical" margin={{ left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9"/>
                                    <XAxis type="number" domain={[0, 5]} hide/>
                                    <YAxis dataKey="name" type="category" width={120} tick={{fontSize:11, fill:'#64748b', fontWeight: 600}} axisLine={false} tickLine={false}/>
                                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                                    <Bar dataKey="promedio" fill="#673ab7" radius={[0, 4, 4, 0]} barSize={20} label={{ position: 'right', fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-80 flex flex-col">
                            <h4 className="font-bold text-slate-800 text-sm mb-2">Distribucion de Trabajos por Categoria</h4>
                            <div className="flex-1 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={getTipoTrabajoData()} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={2}>
                                            {getTipoTrabajoData().map((entry, index) => <Cell key={`cell-${index}`} fill={Object.values(COLORS_TRABAJO)[index % 12]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{borderRadius: '8px', border: 'none', fontSize: '12px'}} />
                                        <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '10px'}}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-80 flex flex-col">
                            <h4 className="font-bold text-slate-800 text-sm mb-2">Lead Time Respuestas {filterYear !== 'all' ? filterYear : ''}</h4>
                            <div className="flex-1 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={getLeadTimeData()} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={2}>
                                            {getLeadTimeData().map((entry, index) => <Cell key={`cell-${index}`} fill={LEAD_COLORS[index % LEAD_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{borderRadius: '8px', border: 'none', fontSize: '12px'}} />
                                        <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '10px'}}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {surveyQuestionsData.map((q, idx) => {
                            const data = getDonutDataForQuestion(q.id);
                            return (
                                <div key={q.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 h-64 flex flex-col relative group">
                                    <h4 className="font-bold text-slate-600 text-[11px] text-center mb-1 line-clamp-2 h-8" title={q.title}>{idx+1}. {q.title.split('. ')[1]}</h4>
                                    <div className="flex-1 relative mt-2">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={1}>
                                                    {data.map((entry, i) => <Cell key={`cell-${i}`} fill={PIE_COLORS[entry.name] || '#ccc'} />)}
                                                </Pie>
                                                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', fontSize: '10px', padding: '5px'}} itemStyle={{padding: 0}}/>
                                                <Legend verticalAlign="bottom" wrapperStyle={{fontSize: '9px', marginTop: '10px'}}/>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-700 text-sm flex items-center"><MessageSquare className="w-4 h-4 mr-2 text-indigo-500"/> Respuestas Individuales</h3>
                            <span className="text-xs text-slate-400 font-medium italic">Haz clic en una fila para ver el detalle</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100 text-sm">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">Fecha / Cliente</th>
                                        <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">Servicio</th>
                                        <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-wider text-[10px]">Promedio</th>
                                        <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">Motivo / Comentario Principal</th>
                                        <th className="px-6 py-4 text-right font-bold text-slate-500 uppercase tracking-wider text-[10px]">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredSurveys.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).map((s, i) => {
                                        const avg = (Object.values(s.ratings||{}).reduce((a,b)=>a+Number(b),0) / 8).toFixed(1);
                                        return (
                                            <tr key={s.id || i} onClick={() => setSelectedSurveyModal(s)} className="hover:bg-indigo-50/50 transition-colors cursor-pointer group">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{s.empresa}</div>
                                                    <div className="text-xs text-slate-500">{formatDate(s.fechaAsistencia)} • {s.nombreCompleto}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded">{s.tipoTrabajo}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`font-black text-sm ${avg >= 4 ? 'text-emerald-600' : avg >= 3 ? 'text-amber-600' : 'text-rose-600'}`}>{avg}</span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate" title={s.motivo}>
                                                    <span className="font-bold text-slate-400">Motivo:</span> {s.motivo}
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <button 
                                                        onClick={(e) => handleDeleteSurvey(e, s.id)} 
                                                        className="text-rose-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded transition-colors"
                                                        title="Eliminar encuesta"
                                                    >
                                                        <Trash2 className="w-4 h-4"/>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            <Modal isOpen={!!selectedSurveyModal} onClose={() => setSelectedSurveyModal(null)} title="Detalle de Respuesta de Encuesta" size="lg">
                {selectedSurveyModal && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                            <div><span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Cliente / Empresa</span><span className="font-bold text-slate-800">{selectedSurveyModal.empresa}</span></div>
                            <div><span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Nombre y Cargo</span><span className="font-bold text-slate-800">{selectedSurveyModal.nombreCompleto} ({selectedSurveyModal.cargo})</span></div>
                            <div><span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Fecha Asistencia</span><span className="font-medium text-slate-700">{formatDate(selectedSurveyModal.fechaAsistencia)}</span></div>
                            <div><span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Fecha Respuesta (Marca Temporal)</span><span className="font-medium text-slate-700">{new Date(selectedSurveyModal.timestamp).toLocaleString('es-ES')}</span></div>
                            <div><span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Correo</span><span className="font-medium text-slate-700">{selectedSurveyModal.email}</span></div>
                            <div><span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Tipo Trabajo</span><span className="font-medium text-slate-700">{selectedSurveyModal.tipoTrabajo}</span></div>
                            <div className="md:col-span-2"><span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Motivo</span><span className="font-medium text-slate-700">{selectedSurveyModal.motivo}</span></div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-bold text-slate-700 border-b pb-2">Calificaciones y Observaciones</h4>
                            {surveyQuestionsData.map((q, i) => {
                                const score = selectedSurveyModal.ratings?.[q.id];
                                const obs = selectedSurveyModal.observations?.[q.id];
                                return (
                                    <div key={q.id} className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-sm font-semibold text-slate-700 pr-4">{q.title}</p>
                                            <span className={`px-2 py-1 rounded text-xs font-black shrink-0 border ${score >= 4 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : score >= 3 ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                                                {score} / 5
                                            </span>
                                        </div>
                                        {obs && (
                                            <div className="mt-2 bg-slate-50 p-3 rounded text-xs text-slate-600 italic border border-slate-100">
                                                <span className="font-bold text-slate-500 block mb-1">Observación:</span>
                                                {obs}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </Modal>
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
    <div className="mb-4 p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-semibold text-slate-700">{label} {required && <span className="text-red-500">*</span>}</label>
        <button type="button" onClick={() => fileInputRef.current.click()} className="text-xs flex items-center bg-white border border-slate-200 text-slate-600 hover:text-orange-600 px-3 py-1.5 rounded-lg shadow-sm font-medium"><Paperclip className="w-3.5 h-3.5 mr-1.5"/> Adjuntar</button>
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
      </div>
      {files.length > 0 ? (
        <div className="space-y-2">
          {files.map((f, idx) => (
            <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm text-xs group">
              <div className="flex items-center truncate">
                {f.type.includes('image') ? <ImageIcon className="w-4 h-4 mr-2 text-orange-500"/> : <FileText className="w-4 h-4 mr-2 text-rose-500"/>}
                <a href={f.url} target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 truncate max-w-[200px] font-medium text-slate-600">{f.name}</a>
              </div>
              <button type="button" onClick={() => removeFile(idx)} className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>
            </div>
          ))}
        </div>
      ) : <div className="text-xs text-slate-400 text-center py-2">Sin archivos adjuntos</div>}
    </div>
  );
};

const TechReportViewer = ({ service }) => { 
  const [activeTab, setActiveTab] = useState('logs');
  const logs = service.progressLogs || [];
  const hours = service.dailyLogs || [];
  const closure = service.closureData;

  const handleDeleteLog = async (logToRemove) => {
      if(!window.confirm('¿Seguro que deseas eliminar este registro de la bitácora?')) return;
      const newLogs = logs.filter(l => l !== logToRemove);
      try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', service.id), { progressLogs: newLogs }); } 
      catch (error) { console.error("Error al eliminar log", error); }
  };

  const handleDeleteHour = async (hourToRemove) => {
      if(!window.confirm('¿Seguro que deseas eliminar este parte diario?')) return;
      const newHours = hours.filter(h => h !== hourToRemove);
      try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', service.id), { dailyLogs: newHours }); } 
      catch (error) { console.error("Error al eliminar horas", error); }
  };

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
                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm relative group">
                  <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-slate-700">{log.date && log.date.includes(',') ? `${formatDate(log.date.split(',')[0])} ${log.date.split(',')[1]}` : log.date}</span>
                      <button onClick={() => handleDeleteLog(log)} className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">{log.comment}</p>
                  <div className="flex gap-2 flex-wrap">{log.files && log.files.map((f, i) => (<a key={i} href={f.url} target="_blank" className="flex items-center px-2 py-1 bg-blue-50 text-blue-600 text-[10px] rounded border border-blue-100 hover:bg-blue-100"><Paperclip className="w-3 h-3 mr-1"/> {f.name}</a>))}</div>
                </div>
              ))
            }
          </div>
        )}
        {activeTab === 'hours' && (
          <div><table className="w-full text-xs text-left"><thead><tr className="text-slate-400 border-b border-slate-200"><th className="pb-2">Fecha</th><th className="pb-2">Personal</th><th className="pb-2">Tipo</th><th className="pb-2">Horario</th><th className="pb-2 text-right">Hs Total</th><th className="pb-2"></th></tr></thead><tbody>{hours.length===0?<tr><td colSpan="6" className="text-center py-4 text-slate-400 italic">Sin horas cargadas.</td></tr>:hours.map((h,i)=>{const start=new Date(`2000-01-01T${h.start}`);const end=new Date(`2000-01-01T${h.end}`);let duration=(end-start)/(1000*60*60);if(duration<0)duration+=24;const workerList=h.workers||[];const techCount=workerList.length>0?workerList.length:1;const totalManHours=duration*techCount;const workerDisplay=(workerList.length>0)?workerList.join(', '):'Equipo Completo';return(<tr key={i} className="border-b border-slate-100 last:border-0 group"><td className="py-2 font-medium text-slate-700">{formatDate(h.date)}</td><td className="py-2 text-slate-500 max-w-[100px] truncate" title={workerDisplay}>{workerDisplay}</td><td className="py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${h.type==='Viaje'?'bg-indigo-100 text-indigo-700':'bg-orange-100 text-orange-700'}`}>{h.type||'Trabajo'}</span></td><td className="py-2 text-slate-600">{h.start} - {h.end}</td><td className="py-2 font-bold text-slate-800 text-right">{totalManHours.toFixed(1)}{techCount>1&&<span className="text-[10px] text-slate-400 font-normal ml-1 block">({duration.toFixed(1)}h x {techCount})</span>}</td><td className="py-2 text-right opacity-0 group-hover:opacity-100"><button onClick={() => handleDeleteHour(h)} className="text-slate-300 hover:text-rose-500"><Trash2 className="w-3.5 h-3.5"/></button></td></tr>)})}</tbody></table></div>
        )}
        {activeTab === 'closure' && (
          <div>
            {!closure ? <p className="text-xs text-slate-400 italic text-center">Servicio no finalizado aún.</p> : (
              <div className="space-y-3">
                 <div className={`p-2 rounded text-xs font-bold text-center border ${closure.status === 'Finalizado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>ESTADO FINAL: {closure.status.toUpperCase()}</div>
                 {closure.reason && <p className="text-xs text-rose-600 font-medium">Motivo: {closure.reasonType} - {closure.reason}</p>}
                 <div><span className="text-xs font-bold text-slate-500 block mb-1">Observación Final:</span><p className="text-xs text-slate-700 bg-white p-2 rounded border border-slate-100">{closure.observation}</p></div>
                 <div><span className="text-xs font-bold text-slate-500 block mb-1">Acta y Archivos Finales:</span><div className="flex gap-2 flex-wrap">{closure.files && closure.files.map((f, i) => (<a key={i} href={f.url} target="_blank" className="flex items-center px-2 py-1 bg-slate-100 text-slate-600 text-[10px] rounded border border-slate-200 hover:bg-slate-200"><FileCheck className="w-3 h-3 mr-1"/> {f.name}</a>))}</div></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const MapDashboard = ({ services }) => {
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
                map = window.L.map(mapContainerRef.current).setView([-38.4161, -63.6167], 4); 
                window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map);
                setTimeout(() => { if (map && isMounted) map.invalidateSize(); }, 300);

                const transformerIcon = window.L.icon({ iconUrl: 'https://i.imgur.com/xX4Jhem.png', iconSize: [62, 52], iconAnchor: [31, 52], popupAnchor: [0, -52] });
                const uniqueMarkers = [];
                const locationKeys = new Set();
                const addressKeys = new Set();

                const addMarkerIfUnique = (lat, lng, popupContent) => {
                    if (!lat || !lng) return;
                    const key = `${parseFloat(lat).toFixed(3)},${parseFloat(lng).toFixed(3)}`;
                    if (!locationKeys.has(key)) { locationKeys.add(key); uniqueMarkers.push({ lat, lng, popupContent }); }
                };

                PRELOADED_LOCATIONS.forEach(loc => addMarkerIfUnique(loc.lat, loc.lng, loc.popupContent));

                const finishedServices = services.filter(s => 
                    s.estado === 'Finalizado' && 
                    s.ubicacion && 
                    (s.tipoTrabajo === "Montaje de Transformador" || s.tipoTrabajo === "Supervisión de Montaje")
                );
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
                        addMarkerIfUnique(coords.lat, coords.lng, `<b>Cliente: ${s.cliente}</b><br><span style="font-size:10px">${s.tipoTrabajo}<br>OCI: ${s.oci}</span>`);
                    }
                }

                uniqueMarkers.forEach(loc => {
                    if (isMounted) window.L.marker([loc.lat, loc.lng], { icon: transformerIcon }).addTo(map).bindPopup(loc.popupContent);
                });
            } catch (e) { console.error("Error initializing map: ", e); }
        };

        mapInitInterval = setInterval(() => {
            if (window.L && mapContainerRef.current) { clearInterval(mapInitInterval); initMap(); }
        }, 500);

        return () => { isMounted = false; clearInterval(mapInitInterval); if (map) map.remove(); };
    }, [services]);

    return (
        <div className="w-full bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <div ref={mapContainerRef} style={{ height: '65vh', minHeight: '500px', width: '100%' }} className="rounded-xl z-0 relative overflow-hidden" />
        </div>
    );
};

const KanbanBoard = ({ services, maintenanceRecords, onStatusChange, onMaintenanceStatusChange, handleEditService, handleEditMaintenance }) => {
    const [boardType, setBoardType] = useState('services');

    const serviceColumns = [
        { id: 'Agendado', label: 'Agendado', color: 'bg-amber-50 border-amber-200 text-amber-700' },
        { id: 'En Servicio', label: 'En Servicio', color: 'bg-blue-50 border-blue-200 text-blue-700' },
        { id: 'No Finalizado', label: 'Pendiente / Postergado', color: 'bg-rose-50 border-rose-200 text-rose-700' },
        { id: 'Finalizado', label: 'Finalizado', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' }
    ];

    const fleetColumns = [
        { id: 'Pendiente', label: 'Pendiente', color: 'bg-amber-50 border-amber-200 text-amber-700' },
        { id: 'En Taller', label: 'En Taller / Proceso', color: 'bg-blue-50 border-blue-200 text-blue-700' },
        { id: 'Realizado', label: 'Realizado', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' }
    ];

    const columns = boardType === 'services' ? serviceColumns : fleetColumns;

    const handleDragStart = (e, id, type) => { e.dataTransfer.setData("itemId", id); e.dataTransfer.setData("itemType", type); };
    const handleDragOver = (e) => e.preventDefault();
    const handleDrop = (e, targetStatus) => {
        const itemId = e.dataTransfer.getData("itemId");
        const itemType = e.dataTransfer.getData("itemType");
        if (itemId && itemType === boardType) {
            if (itemType === 'services') onStatusChange(itemId, targetStatus);
            else if (itemType === 'fleet') onMaintenanceStatusChange(itemId, targetStatus);
        }
    };

    const getItemsByStatus = (status) => {
        if (boardType === 'services') {
            return services.filter(s => {
                if (status === 'No Finalizado') return s.estado === 'No Finalizado' || s.postergado;
                if (status === 'Agendado') return s.estado === 'Agendado' && !s.postergado;
                return s.estado === status && !s.postergado;
            }).sort((a,b) => new Date(a.fInicio) - new Date(b.fInicio));
        } else {
            return maintenanceRecords.filter(m => m.estado === status).sort((a,b) => new Date(a.fecha) - new Date(b.fecha));
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-200px)]">
            <div className="flex bg-slate-100 p-1 rounded-xl mb-4 w-fit shadow-sm border border-slate-200">
                <button onClick={() => setBoardType('services')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center ${boardType === 'services' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Wrench className="w-4 h-4 mr-2"/> Servicios Postventa</button>
                <button onClick={() => setBoardType('fleet')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center ${boardType === 'fleet' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Truck className="w-4 h-4 mr-2"/> Mantenimiento Flota</button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 flex-1 overflow-x-auto pb-4">
                {columns.map(col => {
                    const items = getItemsByStatus(col.id);
                    return (
                        <div key={col.id} className={`kanban-column flex-1 min-w-[280px] bg-slate-100/50 rounded-2xl border ${col.color.split(' ')[1]} flex flex-col`} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.id)}>
                            <div className={`p-3 rounded-t-xl font-bold border-b text-sm flex justify-between items-center ${col.color}`}><span>{col.label}</span><span className="bg-white/50 px-2 py-0.5 rounded text-xs">{items.length}</span></div>
                            <div className="p-2 overflow-y-auto flex-1 custom-scrollbar space-y-2">
                                {items.map(item => (
                                    <div key={item.id} draggable onDragStart={(e) => handleDragStart(e, item.id, boardType)} onClick={() => boardType === 'services' ? handleEditService(item) : handleEditMaintenance(item)} className="kanban-card bg-white p-3 rounded-xl shadow-sm border border-slate-200 group">
                                        {boardType === 'services' ? (
                                            <>
                                                <div className="flex justify-between items-start mb-1"><span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">{item.oci}</span>{item.alcance === 'Internacional' && <Globe className="w-3 h-3 text-orange-500"/>}</div>
                                                <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1">{item.cliente}</h4>
                                                <p className="text-[11px] text-slate-500 truncate mb-2">{item.tipoTrabajo === 'Otro' && item.tipoTrabajoOtro ? `Otro: ${item.tipoTrabajoOtro}` : item.tipoTrabajo}</p>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-50 p-1.5 rounded-lg"><Calendar className="w-3 h-3"/><span>{formatDate(item.fInicio)}</span><span className="text-slate-300">|</span><Users className="w-3 h-3"/><span>{item.tecnicos?.length || 0}</span></div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-start mb-1"><span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-mono uppercase">Mantenimiento</span></div>
                                                <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1">{item.vehiculo}</h4>
                                                <p className="text-[11px] text-slate-500 truncate mb-2">{item.tipo}</p>
                                                <div className="flex items-center flex-wrap gap-2 text-[10px] text-slate-400 bg-slate-50 p-1.5 rounded-lg">
                                                    <div className="flex items-center"><Calendar className="w-3 h-3 mr-1"/><span>{formatDate(item.fecha)}</span></div><span className="text-slate-300">|</span><div className="flex items-center"><Activity className="w-3 h-3 mr-1"/><span>{item.km ? `${item.km} km` : 'N/A'}</span></div>
                                                    {item.tecnicoAsignado && (<><span className="text-slate-300">|</span><div className="flex items-center text-indigo-600"><UserCheck className="w-3 h-3 mr-1"/><span className="font-bold truncate max-w-[70px]" title={item.tecnicoAsignado}>{item.tecnicoAsignado}</span></div></>)}
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

const GanttChart = ({ services, maintenanceRecords = [], mode = 'operations', handleEdit, isAdmin }) => {
    const [selectedGanttService, setSelectedGanttService] = useState(null);
    
    const visibleServices = useMemo(() => {
        let base = services || []; 
        if (mode === 'operations') { return base.filter(s => s.estado !== 'Finalizado' && s.tipoTrabajo !== 'Vacaciones' && s.tipoTrabajo !== 'Estudios Médicos'); } 
        else if (mode === 'vacations') { return base.filter(s => s.estado !== 'Finalizado' && (s.tipoTrabajo === 'Vacaciones' || s.tipoTrabajo === 'Estudios Médicos')); }
        else if (mode === 'fleet') {
            return (maintenanceRecords||[]).filter(m => m.estado !== 'Realizado').map(m => ({
                ...m, fInicio: m.fecha, fFin: m.fecha, cliente: m.vehiculo, tipoTrabajo: m.tipo, estado: m.estado,
                oci: m.km ? `${m.km} km` : 'MANT', tecnicos: m.tecnicoAsignado ? [m.tecnicoAsignado] : ['Taller Externo / Ninguno'], esMantenimiento: true
            }));
        } else if (mode === 'mixed') {
            const activeServices = base.filter(s => s.estado !== 'Finalizado');
            const activeMaintenance = (maintenanceRecords||[]).filter(m => m.estado !== 'Realizado').map(m => ({
                ...m, fInicio: m.fecha, fFin: m.fecha, cliente: m.vehiculo, tipoTrabajo: m.tipo, estado: m.estado,
                oci: m.km ? `${m.km} km` : 'MANT', tecnicos: m.tecnicoAsignado ? [m.tecnicoAsignado] : ['Taller Externo / Ninguno'], esMantenimiento: true
            }));
            return [...activeServices, ...activeMaintenance];
        }
        return base.filter(s => s.estado !== 'Finalizado');
    }, [services, maintenanceRecords, mode]);

    const today = new Date(); 
    today.setHours(0,0,0,0);

    const minDate = new Date(today); 
    
    const serviceDates = visibleServices.flatMap(s => [new Date(s.fFin)]).filter(d => !isNaN(d.getTime()));
    const maxServiceDate = serviceDates.length > 0 ? new Date(Math.max(...serviceDates)) : new Date(today);
    
    const maxDate = new Date(maxServiceDate);
    maxDate.setDate(maxDate.getDate() + 15); 

    const DAY_WIDTH = 50; 
    const totalDays = Math.max((maxDate - minDate) / (1000 * 60 * 60 * 24), 30); 
    const chartWidth = totalDays * DAY_WIDTH;

    const sortedVisibleServices = [...visibleServices]
        .filter(s => new Date(s.fFin) >= minDate)
        .sort((a,b) => new Date(a.fInicio) - new Date(b.fInicio));

    if (visibleServices.length === 0) return <div className="p-12 text-center text-slate-400 bg-white/90 rounded-2xl border border-dashed border-slate-200">No hay registros pendientes para mostrar en el calendario.</div>;
    
    return (
        <div className="bg-white/90 rounded-2xl shadow-sm border border-slate-100 p-6 overflow-hidden backdrop-blur-sm relative flex flex-col h-[calc(100vh-200px)]">
           {selectedGanttService && (
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-2xl shadow-2xl border border-slate-100 z-[100] w-80 animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-start mb-3 pb-2 border-b border-slate-50">
                      <div>
                          <h4 className="font-black text-slate-800 text-sm uppercase tracking-wide">{selectedGanttService.tipoTrabajo === 'Otro' && selectedGanttService.tipoTrabajoOtro ? `Otro: ${selectedGanttService.tipoTrabajoOtro}` : selectedGanttService.tipoTrabajo}</h4>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{selectedGanttService.oci}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setSelectedGanttService(null); }} className="p-1 hover:bg-rose-50 rounded-full text-slate-400 hover:text-rose-500 transition-colors"><X className="w-5 h-5"/></button>
                  </div>
                  <div className="text-xs text-slate-600 space-y-2.5">
                      {!selectedGanttService.esMantenimiento && <div className="flex items-start"><CalendarPlus className="w-4 h-4 mr-2 text-orange-500 shrink-0"/> <span><span className="font-bold">Solicitado el:</span> {formatDate(selectedGanttService.fSolicitud)}</span></div>}
                      <div className="flex items-start"><Briefcase className="w-4 h-4 mr-2 text-indigo-500 shrink-0"/> <span><span className="font-bold">{selectedGanttService.esMantenimiento ? 'Vehículo:' : 'Cliente:'}</span> {selectedGanttService.cliente}</span></div>
                      <div className="flex items-start"><Users className="w-4 h-4 mr-2 text-indigo-500 shrink-0"/> <span><span className="font-bold">{selectedGanttService.esMantenimiento ? 'Responsable:' : 'Equipo:'}</span> {selectedGanttService.tecnicos?.join(', ')}</span></div>
                      <div className="flex items-start"><Calendar className="w-4 h-4 mr-2 text-indigo-500 shrink-0"/> <span><span className="font-bold">{selectedGanttService.esMantenimiento ? 'Fecha Prog.:' : 'Ejecución:'}</span> {formatDate(selectedGanttService.fInicio)} {!selectedGanttService.esMantenimiento && `al ${formatDate(selectedGanttService.fFin)}`}</span></div>
                      
                      {selectedGanttService.estado === 'En Servicio' && <div className="animate-pulse flex items-center text-blue-600 font-bold bg-blue-50 p-2 rounded-lg"><Activity className="w-3 h-3 mr-2"/> TRABAJO EN CURSO</div>}

                      <div className="flex items-center mt-2">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold border w-full text-center ${selectedGanttService.estado==='Finalizado'||selectedGanttService.estado==='Realizado'?'bg-emerald-50 border-emerald-200 text-emerald-700':selectedGanttService.estado==='En Servicio'||selectedGanttService.estado==='En Taller'?'bg-blue-50 border-blue-200 text-blue-700':selectedGanttService.estado==='No Finalizado'?'bg-rose-50 border-rose-200 text-rose-700':'bg-amber-50 border-amber-200 text-amber-700'}`}>
                              {selectedGanttService.postergado ? 'POSTERGADO' : selectedGanttService.estado}
                          </span>
                      </div>
                  </div>
              </div>
           )}
           <div className="overflow-auto custom-scrollbar flex-1 relative border rounded-xl border-slate-100">
             <div className="relative" style={{ minWidth: `${chartWidth + 200}px`, height: '100%' }}>
               <div className="sticky top-0 left-0 z-20 bg-white border-b border-slate-200 h-12 flex text-xs font-semibold text-slate-500 shadow-sm pl-48">
                  {Array.from({ length: Math.ceil(totalDays) }).map((_, i) => {
                    const d = new Date(minDate); d.setDate(d.getDate() + i);
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    const isToday = d.toDateString() === today.toDateString();
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
                     const end = new Date(srv.fFin);
                     
                     const effectiveStart = start < minDate ? minDate : start;
                     
                     let offsetDays = (effectiveStart - minDate) / (1000 * 60 * 60 * 24);
                     const duration = (end - effectiveStart) / (1000 * 60 * 60 * 24) + 1;
                     
                     const leftPos = offsetDays * DAY_WIDTH;
                     const width = Math.max(duration * DAY_WIDTH, DAY_WIDTH); 
                     
                     let colorClass = 'bg-orange-500 shadow-orange-200';
                     if (srv.esMantenimiento) {
                         colorClass = srv.estado === 'Realizado' ? 'bg-emerald-500 shadow-emerald-200' : srv.estado === 'En Taller' ? 'bg-blue-500 shadow-blue-200' : 'bg-indigo-500 shadow-indigo-200';
                     } else {
                         colorClass = (srv.tipoTrabajo === 'Vacaciones' || srv.tipoTrabajo === 'Estudios Médicos') ? 'bg-sky-400 shadow-sky-200' : srv.estado === 'Finalizado' ? 'bg-emerald-500 shadow-emerald-200' : srv.estado === 'No Finalizado' ? 'bg-slate-700 shadow-slate-300' : srv.estado === 'En Servicio' ? 'bg-blue-500 shadow-blue-200' : srv.postergado ? 'bg-rose-500 shadow-rose-200' : 'bg-orange-500 shadow-orange-200';
                     }

                     return (
                       <div key={srv.id} className="flex items-center group hover:bg-slate-50 transition-colors h-14 border-b border-slate-50/50">
                         <div className="sticky left-0 z-10 w-48 pl-4 pr-4 bg-white/95 backdrop-blur-sm border-r border-slate-100 h-full flex items-center justify-end shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)]">
                             <span className="text-xs font-bold text-slate-600 truncate text-right w-full" title={srv.cliente}>{srv.tipoTrabajo === 'Vacaciones' ? (srv.tecnicos?.[0] || 'N/A') : srv.cliente}</span>
                         </div>
                         <div className="relative h-full flex-1">
                             <div onClick={() => setSelectedGanttService(srv)} className={`absolute h-8 top-3 rounded-lg shadow-md flex items-center px-3 text-xs text-white font-medium cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${colorClass} overflow-hidden whitespace-nowrap`} style={{ left: `${leftPos}px`, width: `${width - 4}px` }}>
                                 <span className="truncate drop-shadow-md">
                                     {srv.tipoTrabajo === 'Vacaciones' ? srv.tipoTrabajo : srv.esMantenimiento ? `${srv.cliente} - ${srv.tipoTrabajo}` : `${srv.oci} - ${srv.tipoTrabajo === 'Otro' && srv.tipoTrabajoOtro ? srv.tipoTrabajoOtro : srv.tipoTrabajo}`}
                                 </span>
                             </div>
                         </div>
                         {isAdmin && <div className="sticky right-0 z-10 w-10 bg-white/50 h-full flex items-center justify-center"><button onClick={() => handleEdit(srv)} className="p-1.5 hover:bg-orange-50 rounded-full text-slate-300 hover:text-orange-600 transition-colors"><Edit2 className="w-3.5 h-3.5"/></button></div>}
                       </div>
                     );
                   })}
               </div>
               <div className="absolute top-12 left-48 bottom-0 pointer-events-none flex">
                  {Array.from({ length: Math.ceil(totalDays) }).map((_, i) => (
                    <div key={i} className="border-r border-slate-100 h-full" style={{ width: `${DAY_WIDTH}px` }}></div>
                  ))}
               </div>
             </div>
           </div>
        </div>
    );
};

const KPIs = ({ services, maintenanceRecords = [], vehiculosData = [] }) => {
    const [kpiYear, setKpiYear] = useState('all');
    const [kpiMonth, setKpiMonth] = useState('all');
    const [selectedVehicleKpi, setSelectedVehicleKpi] = useState('');

    const availableYears = useMemo(() => {
        const years = new Set();
        (services || []).forEach(s => {
            if (s.fInicio) years.add(new Date(s.fInicio).getFullYear());
        });
        const yearsArray = Array.from(years).sort((a, b) => b - a);
        return yearsArray.length > 0 ? yearsArray : [new Date().getFullYear()];
    }, [services]);

    const filteredServices = services.filter(s => { 
        if (!s.fInicio) return false;
        const sDate = new Date(s.fInicio); 
        if (isNaN(sDate.getTime())) return false;
        return (kpiYear === 'all' || sDate.getFullYear().toString() === kpiYear) && (kpiMonth === 'all' || sDate.getMonth().toString() === kpiMonth); 
    });
    
    const servicesForCalc = filteredServices.filter(s => s.tipoTrabajo !== 'Vacaciones' && s.tipoTrabajo !== 'Estudios Médicos');

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
    const servicesByMonth = {}; 
    const hoursByMonth = {};

    let totalWorkHours = 0;
    let totalTravelHours = 0;

    servicesForCalc.forEach(s => {
        if (s.fInicio) {
            const dInicio = new Date(s.fInicio);
            const mKey = formatMonthKey(dInicio);
            if (mKey) {
                servicesByMonth[mKey] = (servicesByMonth[mKey] || 0) + 1;
                
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

    const dataMonthlyVolume = Object.keys(servicesByMonth).sort().map(k => ({
        name: formatMonthLabel(k),
        value: servicesByMonth[k]
    }));

    const dataHoursByMonth = Object.keys(hoursByMonth).sort().map(k => ({
        name: formatMonthLabel(k),
        horas: parseFloat(hoursByMonth[k].toFixed(1))
    }));

    const dataHoursType = [{ name: 'Trabajo', value: parseFloat(totalWorkHours.toFixed(1)) || 0 }, { name: 'Viaje', value: parseFloat(totalTravelHours.toFixed(1)) || 0 }];

    const validVehicles = vehiculosData.filter(v => {
        const vLow = (v.name || '').toLowerCase();
        return !vLow.includes('aereo') && !vLow.includes('aéreo') && !vLow.includes('alquiler');
    });

    const vehicleNamesList = validVehicles.map(v => v.name).sort();
    
    useEffect(() => {
        if (!selectedVehicleKpi && vehicleNamesList.length > 0) {
            setSelectedVehicleKpi(vehicleNamesList[0]);
        }
    }, [vehicleNamesList, selectedVehicleKpi]);

    const safeSelectedVehicle = vehicleNamesList.includes(selectedVehicleKpi) ? selectedVehicleKpi : vehicleNamesList[0];
    const selectedVehObj = validVehicles.find(v => v.name === safeSelectedVehicle);
    const currentVehKm = selectedVehObj ? (Number(selectedVehObj.km) || 0) : 0;
    
    const maxKmLimit = 180000;
    const isKmExceeded = currentVehKm > maxKmLimit;
    const gaugePercentage = Math.min(currentVehKm / maxKmLimit, 1) * 100;
    const gaugeData = [
        { name: 'Km', value: gaugePercentage, fill: isKmExceeded ? '#ef4444' : '#f97316' },
        { name: 'Rest', value: 100 - gaugePercentage, fill: '#f1f5f9' }
    ];

    if (servicesForCalc.length === 0) return (<div className="space-y-6 animate-in fade-in pb-10"><div className="flex items-center gap-4 bg-white/90 p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 backdrop-blur-sm"><div className="flex items-center text-slate-500 text-sm font-bold"><Filter className="w-4 h-4 mr-2"/> Filtrar Periodo:</div><select className="bg-slate-50 border-none rounded-lg text-sm p-2 focus:ring-2 focus:ring-orange-100 outline-none" value={kpiYear} onChange={e=>setKpiYear(e.target.value)}><option value="all">Todos los Años</option>{availableYears.map(y => <option key={y} value={y}>{y}</option>)}</select><select className="bg-slate-50 border-none rounded-lg text-sm p-2 focus:ring-2 focus:ring-orange-100 outline-none" value={kpiMonth} onChange={e=>setKpiMonth(e.target.value)}><option value="all">Todos los Meses</option>{["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"].map((m,i) => <option key={i} value={i.toString()}>{m}</option>)}</select></div><div className="p-10 text-center text-slate-400 bg-white/50 rounded-xl">Sin datos operativos en el periodo seleccionado.</div></div>);
    
    const totalServices = servicesForCalc.length;
    const closedServices = servicesForCalc.filter(s => s.estado === 'Finalizado' || s.estado === 'No Finalizado');
    const successRate = closedServices.length ? ((closedServices.filter(s => s.estado === 'Finalizado').length / closedServices.length) * 100).toFixed(0) : 0;
    const activeServicesCount = servicesForCalc.filter(s => s.estado === 'En Servicio').length;
    const postponedCount = servicesForCalc.filter(s => s.postergado).length;
    const qualityRate = totalServices ? (((totalServices - servicesForCalc.filter(s => s.tipoTrabajo === "Asistencia por reclamo").length) / totalServices) * 100).toFixed(1) : 100;

    const clientMap = {}; 
    servicesForCalc.forEach(s => { 
        const cli = String(s.cliente || 'Desconocido');
        clientMap[cli] = (clientMap[cli] || 0) + 1; 
    });
    const dataTopClients = Object.entries(clientMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5);

    const techLoadMap = {}; 
    servicesForCalc.forEach(s => { 
        const techs = Array.isArray(s.tecnicos) ? s.tecnicos : [];
        techs.forEach(t => { 
            const tName = String(t);
            techLoadMap[tName] = (techLoadMap[tName] || 0) + 1; 
        }); 
    });
    const dataTechLoad = Object.entries(techLoadMap).map(([name, value]) => ({ name, value })).sort((a,b)=>b.value-a.value).slice(0,10);

    const servicesByTypeMap = {};
    servicesForCalc.forEach(s => { 
        const tipo = String(s.tipoTrabajo || 'Desconocido');
        servicesByTypeMap[tipo] = (servicesByTypeMap[tipo] || 0) + 1; 
    });
    const dataServicesByType = Object.entries(servicesByTypeMap).map(([name, value]) => ({ name, value }));

    return (
        <div className="space-y-8 animate-in fade-in pb-10 font-sans">
            <div className="flex flex-col md:flex-row items-center justify-between bg-white/95 p-5 rounded-2xl border border-slate-100 shadow-sm backdrop-blur-sm sticky top-0 z-20">
                <div className="flex items-center gap-3 mb-4 md:mb-0"><div className="bg-orange-50 p-2 rounded-lg text-orange-600"><BarChart2 className="w-5 h-5" /></div><div><h3 className="text-lg font-bold text-slate-800">Panel de Control</h3><p className="text-xs text-slate-400 font-medium">Indicadores clave de rendimiento</p></div></div>
                <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                    <div className="flex items-center px-3 text-slate-500 text-xs font-bold uppercase tracking-wider"><Filter className="w-3.5 h-3.5 mr-2"/> Periodo</div>
                    <select className="bg-white border border-slate-200 rounded-lg text-sm py-1.5 px-3 outline-none" value={kpiYear} onChange={e=>setKpiYear(e.target.value)}>
                        <option value="all">Año: Todos</option>
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select className="bg-white border border-slate-200 rounded-lg text-sm py-1.5 px-3 outline-none" value={kpiMonth} onChange={e=>setKpiMonth(e.target.value)}><option value="all">Mes: Todos</option>{["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"].map((m,i) => <option key={i} value={i.toString()}>{m}</option>)}</select>
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-5">
                {[
                    { title: "Total Servicios", val: totalServices, unit: "", icon: Calendar, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
                    { title: "En Ejecución", val: activeServicesCount, unit: "", icon: Zap, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
                    { title: "Efectividad", val: successRate, unit: "%", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
                    { title: "Calidad", val: qualityRate, unit: "%", icon: ShieldCheck, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-100" }
                ].map((k, i) => (
                    <div key={i} className={`bg-white p-5 rounded-2xl shadow-sm border ${k.border} hover:shadow-md transition-all duration-300 group`}>
                        <div className="flex justify-between items-start mb-3"><div className={`p-2.5 rounded-xl ${k.bg} ${k.color} group-hover:scale-110 transition-transform duration-300`}><k.icon className="w-5 h-5"/></div></div>
                        <div><div className="text-3xl font-black text-slate-800 tracking-tight mb-1">{k.val} <span className="text-sm font-bold text-slate-400 ml-0.5">{k.unit}</span></div><span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{k.title}</span></div>
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden h-80">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center"><Activity className="w-4 h-4 mr-2 text-rose-500"/> Estado de Flota (KM)</h4>
                        <select className="bg-slate-50 border border-slate-200 rounded-lg text-xs py-1 px-2 outline-none max-w-[150px] truncate font-bold text-slate-700" value={selectedVehicleKpi} onChange={e=>setSelectedVehicleKpi(e.target.value)}>
                            {vehicleNamesList.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                    <div className="h-full w-full relative">
                        {vehicleNamesList.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={gaugeData} cx="50%" cy="65%" startAngle={180} endAngle={0} innerRadius={70} outerRadius={90} dataKey="value" stroke="none" isAnimationActive={false} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute top-[55%] left-1/2 transform -translate-x-1/2 flex flex-col items-center text-center w-full">
                                    <span className={`text-4xl font-black ${isKmExceeded ? 'text-rose-500' : 'text-slate-700'}`}>{currentVehKm.toLocaleString()}</span>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">KM Actuales</span>
                                    {isKmExceeded && <span className="text-[10px] font-bold text-white bg-rose-500 px-3 py-1 rounded-full mt-2 animate-pulse shadow-md shadow-rose-200">LÍMITE EXCEDIDO</span>}
                                    {!isKmExceeded && <span className="text-[10px] font-bold text-slate-400 mt-2 bg-slate-50 px-2 py-0.5 rounded">Límite: 180.000 km</span>}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full pb-10 text-xs text-slate-400 italic">Sin datos de KM registrados o aplicables.</div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-80">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center mb-4"><Timer className="w-4 h-4 mr-2 text-indigo-500"/> Horas Trabajadas por Mes</h4>
                    <ResponsiveContainer width="100%" height="85%">
                        <RechartsBarChart data={dataHoursByMonth}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#94a3b8', fontSize:11, fontWeight: 600}} dy={10}/>
                            <YAxis axisLine={false} tickLine={false} tick={{fill:'#94a3b8', fontSize:11, fontWeight: 600}}/>
                            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                            <Bar dataKey="horas" name="Horas Hombre" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative col-span-2">
                    <div className="flex justify-between items-center mb-6"><div><h4 className="font-bold text-slate-800 text-sm flex items-center mb-1"><Clock className="w-4 h-4 mr-2 text-blue-500"/> Tiempos de Respuesta (Lead Time)</h4><p className="text-[10px] text-slate-400 font-medium">Promedio de días desde Solicitud hasta Inicio por mes</p></div></div>
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
                    <div className="flex justify-between items-center mb-6 relative z-10"><div><h4 className="font-bold text-slate-800 text-sm flex items-center mb-1"><PieChartIcon className="w-4 h-4 mr-2 text-orange-500"/> Distribución Horaria</h4><p className="text-[10px] text-slate-400 font-medium">Horas Totales (Productivas vs Viaje)</p></div></div>
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
        if (mode === 'operations') list = sortedServices.filter(s => s.tipoTrabajo !== 'Vacaciones');
        else list = sortedServices.filter(s => s.tipoTrabajo === 'Vacaciones');
        
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
                  <input type="checkbox" checked={hideCompleted} onChange={(e) => setHideCompleted(e.target.checked)} className="accent-orange-600 w-4 h-4 rounded border-slate-300" />
                  <span className="text-xs font-bold text-slate-600">Ocultar Finalizados</span>
              </label>
          </div>
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                  <thead className="bg-slate-50">
                      <tr>
                          <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">{mode === 'vacations' ? 'Tipo' : 'OCI'}</th>
                          <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">{mode === 'vacations' ? 'Técnico' : 'Cliente'}</th>
                          {mode !== 'vacations' && (<><th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">Solicitud</th><th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">Alcance</th></>)}
                          <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">Fechas</th>
                          <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">Estado</th>
                          <th className="px-6 py-4 text-right font-bold text-slate-600 uppercase tracking-wider text-xs">Acciones</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                      {filteredSheetServices.map(s => (
                          <tr key={s.id} className="hover:bg-orange-50/30 transition-colors">
                              <td className="px-6 py-4 font-mono font-medium text-slate-700">{mode === 'vacations' ? '🏖️ Vacaciones' : <div>{s.oci}<div className="text-[10px] text-slate-500 font-sans leading-none mt-1">{s.tipoTrabajo === 'Otro' && s.tipoTrabajoOtro ? `Otro: ${s.tipoTrabajoOtro}` : s.tipoTrabajo}</div></div>}</td>
                              <td className="px-6 py-4 font-medium text-slate-800">{mode === 'vacations' ? (s.tecnicos || []).join(', ') : s.cliente}</td>
                              {mode !== 'vacations' && (<><td className="px-6 py-4 text-xs text-slate-500">{formatDate(s.fSolicitud)}</td><td className="px-6 py-4">{s.alcance === 'Internacional' ? <span className="flex items-center text-xs font-bold text-orange-600"><Globe className="w-3 h-3 mr-1"/> INT</span> : <span className="flex items-center text-xs font-bold text-slate-500"><MapIcon className="w-3 h-3 mr-1"/> NAC</span>}</td></>)}
                              <td className="px-6 py-4 whitespace-nowrap text-slate-500">{formatDate(s.fInicio)} <span className="text-slate-300 mx-1">➜</span> {formatDate(s.fFin)}</td>
                              <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${s.estado==='Finalizado'?'bg-emerald-50 border-emerald-100 text-emerald-700':s.estado==='En Servicio'?'bg-blue-50 border-blue-100 text-blue-700':s.postergado?'bg-rose-50 border-rose-100 text-rose-700':'bg-amber-50 border-amber-100 text-amber-700'}`}>{s.postergado ? 'Postergado' : s.estado}</span></td>
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                  <button type="button" onClick={() => handleEdit(s)} className="text-orange-500 hover:text-orange-700 mx-2 p-1 hover:bg-orange-50 rounded"><Edit2 className="w-4 h-4"/></button>
                                  <button type="button" onClick={() => handleDelete(s.id)} className="text-rose-400 hover:text-rose-600 mx-2 p-1 hover:bg-rose-50 rounded"><Trash2 className="w-4 h-4"/></button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
    );
};

const TransformerHistory = ({ services }) => {
    const [searchSerial, setSearchSerial] = useState("");
    const [managingTestsService, setManagingTestsService] = useState(null);

    const history = useMemo(() => { 
        if (!searchSerial) return []; 
        return services.filter(s => (s.trafoSerie && s.trafoSerie.toLowerCase().includes(searchSerial.toLowerCase())) || (s.trafoFabricacion && s.trafoFabricacion.toLowerCase().includes(searchSerial.toLowerCase()))); 
    }, [searchSerial, services]);
    const displayHistory = searchSerial ? history : services.sort((a,b) => new Date(b.fInicio) - new Date(a.fInicio)).slice(0, 5);

    const handleUpdateServiceTests = async (testUpdates) => {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', managingTestsService.id), testUpdates);
        setManagingTestsService(prev => ({...prev, ...testUpdates}));
    };

    return (
        <div className="space-y-6 animate-in fade-in">
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
                                <span className="flex items-center"><Calendar className="w-3 h-3 mr-1"/> {formatDate(srv.fInicio)}</span>
                                <span className="flex items-center font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">OCI: {srv.oci}</span>
                            </div>
                            
                            {srv.ensayos && srv.ensayos.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <button onClick={() => setManagingTestsService(srv)} className="flex items-center text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-2 rounded-lg hover:bg-teal-100 transition-colors">
                                        <FileSpreadsheet className="w-4 h-4 mr-2"/> Ver Ensayos Eléctricos ({srv.ensayos.length})
                                    </button>
                                </div>
                            )}

                            <TechReportViewer service={srv} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-12 text-slate-400 italic bg-white rounded-xl border border-dashed border-slate-200">No se encontraron servicios con ese número de serie o fabricación.</div>
            )}

            <Modal isOpen={!!managingTestsService} onClose={() => setManagingTestsService(null)} title="Gestión de Ensayos" size="xl">
                {managingTestsService && <ServiceTestsManager service={managingTestsService} onUpdateService={handleUpdateServiceTests} onClose={() => setManagingTestsService(null)} />}
            </Modal>
        </div>
    );
};

const TechPortal = ({ services, maintenanceRecords, user, handleStartService, onMaintenanceStatusChange, setUploadingEvidenceService, setEvidenceData, setLoggingHoursService, setDailyLogData, setTechsForHours, setClosingService, setClosureData, setReopeningService, setReopenReason, showNotification }) => {
    const [view, setView] = useState('list'); 
    const [hideCompleted, setHideCompleted] = useState(false);
    const [previewService, setPreviewService] = useState(null);
    const [managingTestsService, setManagingTestsService] = useState(null);

    useEffect(() => {
        const handleBack = (e) => {
            if (managingTestsService) {
                e.preventDefault();
                setManagingTestsService(null);
            } else if (previewService) {
                e.preventDefault(); 
                setPreviewService(null); 
            } else if (view === 'gantt') {
                e.preventDefault();
                setView('list'); 
            }
        };

        window.addEventListener('app-back', handleBack);
        return () => window.removeEventListener('app-back', handleBack);
    }, [previewService, view, managingTestsService]);

    const myServices = useMemo(() => {
        let list = services.filter(s => s.tecnicos && s.tecnicos.includes(user.name));
        if (hideCompleted) {
            list = list.filter(s => s.estado !== 'Finalizado');
        }
        return list.sort((a,b) => new Date(a.fInicio) - new Date(b.fInicio));
    }, [services, user.name, hideCompleted]);

    const myMaintenance = useMemo(() => {
        let list = (maintenanceRecords || []).filter(m => m.tecnicoAsignado === user.name);
        if (hideCompleted) list = list.filter(m => m.estado !== 'Realizado');
        return list.sort((a,b) => new Date(a.fecha) - new Date(b.fecha));
    }, [maintenanceRecords, user.name, hideCompleted]);

    const handleShareSurvey = (e, serviceId) => {
        e.stopPropagation();
        const link = `${window.location.origin}${window.location.pathname}?survey=true&serviceId=${serviceId}`;
        navigator.clipboard.writeText(link);
        showNotification("Link de encuesta copiado al portapapeles", "success");
    };

    const handleUpdateServiceTests = async (testUpdates) => {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', managingTestsService.id), testUpdates);
        setManagingTestsService(prev => ({...prev, ...testUpdates}));
        showNotification("Ensayos actualizados");
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-8 rounded-3xl shadow-lg text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-center">
                <div className="relative z-10 mb-4 md:mb-0">
                    <h2 className="text-3xl font-extrabold mb-1">Hola, {user.name} 👋</h2>
                    <p className="text-orange-100">Aquí tienes tus servicios y tareas asignadas.</p>
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

            <div className="space-y-6">
                {view === 'list' ? (
                    <>
                        {myMaintenance.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center"><Truck className="w-4 h-4 mr-2"/> Tareas de Flota Asignadas</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {myMaintenance.map(m => (
                                        <div key={m.id} className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-5 flex flex-col relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                                            <div className="pl-2">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${m.estado==='Realizado'?'bg-emerald-50 border-emerald-200 text-emerald-700':m.estado==='En Taller'?'bg-blue-50 border-blue-200 text-blue-700':'bg-amber-50 border-amber-200 text-amber-700'}`}>{m.estado}</span>
                                                    <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">Mantenimiento de Vehículo</span>
                                                </div>
                                                <h3 className="font-black text-lg text-slate-800 mb-1">{m.vehiculo}</h3>
                                                <p className="text-sm text-slate-600 mb-3">{m.tipo} {m.observaciones && `- ${m.observaciones}`}</p>
                                                <div className="flex items-center gap-4 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 w-fit">
                                                    <div className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-400"/> {formatDate(m.fecha)}</div>
                                                    {m.km && <div className="flex items-center"><Activity className="w-3.5 h-3.5 mr-1.5 text-indigo-400"/> {m.km} km</div>}
                                                </div>
                                                
                                                {m.estado === 'Pendiente' && (
                                                    <button 
                                                        onClick={() => onMaintenanceStatusChange(m.id, 'En Taller')}
                                                        className="mt-4 w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex justify-center items-center text-xs shadow-md active:scale-95"
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-2"/> Entregado / En Taller
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {myServices.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center"><Wrench className="w-4 h-4 mr-2"/> Servicios de Campo</h3>
                                <div className="grid grid-cols-1 gap-5">
                                    {myServices.map(srv => {
                                        const requiresTests = REQUIRES_TESTS_TYPES.includes(srv.tipoTrabajo);
                                        return (
                                        <div key={srv.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow group/card">
                                            <div className="flex-1 cursor-pointer" onClick={() => setPreviewService(srv)}>
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${srv.estado==='Finalizado'?'bg-emerald-50 border-emerald-100 text-emerald-700':srv.estado==='En Servicio'?'bg-blue-50 border-blue-100 text-blue-700':srv.estado==='No Finalizado'?'bg-rose-50 border-rose-100 text-rose-700':'bg-amber-50 border-amber-100 text-amber-700'}`}>{srv.estado}</span>
                                                    <span className="text-xs text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded">OCI: {srv.oci}</span>
                                                    <span className="opacity-0 group-hover/card:opacity-100 transition-opacity text-[10px] font-bold text-blue-600 flex items-center bg-blue-50 px-2 py-1 rounded-lg">
                                                        <Eye className="w-3 h-3 mr-1"/> Ver detalles completos
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-xl text-slate-800 mb-1 group-hover/card:text-blue-600 transition-colors">{srv.cliente}</h3>
                                                
                                                {srv.contactoResponsable && (
                                                    <div className="mb-3 text-xs bg-orange-50 text-orange-800 p-2 rounded-lg inline-flex items-center border border-orange-100 font-medium">
                                                        <UserCheck className="w-3.5 h-3.5 mr-1.5"/> Contacto: {srv.contactoResponsable}
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-2">
                                                    <div className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-slate-400 shrink-0"/> <span className="truncate">{formatDate(srv.fInicio)} ➔ {formatDate(srv.fFin)}</span></div>
                                                    <div className="flex items-center"><Truck className="w-4 h-4 mr-2 text-slate-400 shrink-0"/> <span className="truncate">{(srv.vehiculos && srv.vehiculos.length > 0) ? srv.vehiculos.join(', ') : 'Sin vehículo asignado'}</span></div>
                                                    <div className="flex items-center md:col-span-2 mt-1 pt-3 border-t border-slate-200/60">
                                                        <Users className="w-4 h-4 mr-2 text-orange-500 shrink-0"/>
                                                        <span className="truncate">
                                                            <strong className="text-slate-700 mr-1">Equipo asignado:</strong>
                                                            {srv.tecnicos?.length > 1
                                                                ? srv.tecnicos.filter(t => t !== user.name).join(', ') + ' y Tú'
                                                                : 'Asignación individual'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-3 justify-center min-w-[180px] border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 pt-4 md:pt-0">
                                                {srv.estado === 'Agendado' && <button onClick={() => handleStartService(srv)} className="bg-blue-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center justify-center transition-all active:scale-95"><PlayCircle className="w-5 h-5 mr-2"/> Iniciar Tarea</button>}
                                                {srv.estado === 'En Servicio' && (
                                                    <>
                                                        <button onClick={(e) => handleShareSurvey(e, srv.id)} className="bg-emerald-50 text-emerald-700 border border-emerald-200 py-2 px-3 rounded-lg font-bold hover:bg-emerald-100 flex items-center justify-center text-xs transition-colors shadow-sm"><Share2 className="w-4 h-4 mr-2"/> Encuesta a Cliente</button>
                                                        <button onClick={() => { setUploadingEvidenceService(srv); setEvidenceData({comment: '', files: []}); }} className="bg-white text-blue-600 border border-blue-200 py-2 px-3 rounded-lg font-bold hover:bg-blue-50 flex items-center justify-center text-xs transition-colors"><ImageIcon className="w-4 h-4 mr-2"/> Subir Avance</button>
                                                        {requiresTests && (
                                                            <button onClick={() => setManagingTestsService(srv)} className="bg-white text-teal-600 border border-teal-200 py-2 px-3 rounded-lg font-bold hover:bg-teal-50 flex items-center justify-center text-xs transition-colors"><FileSpreadsheet className="w-4 h-4 mr-2"/> Cargar Ensayos</button>
                                                        )}
                                                        <button onClick={() => { setLoggingHoursService(srv); setDailyLogData({date: new Date().toISOString().split('T')[0], start:'', end:'', type: 'Trabajo'}); setTechsForHours(srv.tecnicos); }} className="bg-white text-indigo-600 border border-indigo-200 py-2 px-3 rounded-lg font-bold hover:bg-indigo-50 flex items-center justify-center text-xs transition-colors"><Timer className="w-4 h-4 mr-2"/> Cargar Horas</button>
                                                    </>
                                                )}
                                                {srv.estado === 'En Servicio' && <button onClick={() => { setClosingService(srv); setClosureData({status:'Finalizado', reasonType: '', reason:'', observation: '', files:[]}); }} className="bg-white text-orange-600 border-2 border-orange-600 py-3 px-4 rounded-xl font-bold hover:bg-orange-50 flex items-center justify-center transition-colors mt-1"><CheckCircle className="w-5 h-5 mr-2"/> Cerrar Servicio</button>}
                                                {(srv.estado === 'Finalizado' || srv.estado === 'No Finalizado') && <button onClick={() => { setReopeningService(srv); setReopenReason(""); }} className="w-full py-2 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors flex items-center justify-center"><RotateCcw className="w-3 h-3 mr-1"/> Reabrir Caso</button>}
                                            </div>
                                        </div>
                                    )})}
                                </div>
                            </div>
                        )}
                        {myServices.length === 0 && myMaintenance.length === 0 && (
                            <div className="text-center p-12 text-slate-400 italic bg-white rounded-xl border border-dashed border-slate-200">No tienes tareas ni mantenimientos asignados actualmente.</div>
                        )}
                    </>
                ) : (
                    <GanttChart services={myServices} maintenanceRecords={myMaintenance} mode="mixed" isAdmin={false} handleEdit={()=>{}} />
                )}
            </div>

            <Modal isOpen={!!previewService} onClose={() => setPreviewService(null)} title="Ficha Técnica del Servicio" size="lg">
                {previewService && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Nro. OCI</span>
                                <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 border border-slate-200 rounded">{previewService.oci || '-'}</span>
                            </div>
                            <div className="md:col-span-2">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Cliente</span>
                                <span className="font-bold text-slate-800">{previewService.cliente}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Estado Actual</span>
                                <span className={`font-bold ${previewService.estado === 'Finalizado' ? 'text-emerald-600' : previewService.estado === 'En Servicio' ? 'text-blue-600' : 'text-amber-600'}`}>
                                    {previewService.postergado ? 'Postergado' : previewService.estado}
                                </span>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-700 mb-2 flex items-center text-sm"><Calendar className="w-4 h-4 mr-2 text-blue-500"/> Programación y Tarea</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tipo de Trabajo</span>
                                    <span className="text-sm font-medium text-slate-700">{previewService.tipoTrabajo === 'Otro' ? previewService.tipoTrabajoOtro : previewService.tipoTrabajo}</span>
                                </div>
                                <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fecha de Inicio</span>
                                    <span className="text-sm font-medium text-slate-700">{formatDate(previewService.fInicio)}</span>
                                </div>
                                <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fecha de Fin</span>
                                    <span className="text-sm font-medium text-slate-700">{formatDate(previewService.fFin)}</span>
                                </div>
                                {previewService.alcance && (
                                    <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Alcance</span>
                                        <span className="text-sm font-medium text-slate-700 flex items-center">
                                            {previewService.alcance === 'Internacional' ? <Globe className="w-3.5 h-3.5 mr-1 text-orange-500"/> : <MapIcon className="w-3.5 h-3.5 mr-1 text-slate-400"/>}
                                            {previewService.alcance}
                                        </span>
                                    </div>
                                )}
                                <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm md:col-span-2">
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ubicación del Sitio</span>
                                    <span className="text-sm font-medium text-slate-700">{previewService.ubicacion || 'No especificada'}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-700 mb-2 flex items-center text-sm"><Users className="w-4 h-4 mr-2 text-indigo-500"/> Equipo y Logística</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Técnicos Asignados</span>
                                    <span className="text-sm font-medium text-slate-700">{previewService.tecnicos?.join(', ') || 'Ninguno'}</span>
                                </div>
                                <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Vehículos de Flota</span>
                                    <span className="text-sm font-medium text-slate-700">{previewService.vehiculos?.join(', ') || 'Ninguno'}</span>
                                </div>
                                <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm md:col-span-2">
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Contacto Responsable en Sitio</span>
                                    <span className="text-sm font-medium text-slate-700">{previewService.contactoResponsable || 'No especificado'}</span>
                                </div>
                            </div>
                        </div>

                        {(previewService.trafoSerie || previewService.trafoFabricacion || previewService.trafoPotencia || previewService.trafoRelacion) && (
                            <div>
                                <h4 className="font-bold text-slate-700 mb-2 flex items-center text-sm"><Activity className="w-4 h-4 mr-2 text-orange-500"/> Datos del Transformador</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nº Serie</span>
                                        <span className="text-sm font-mono font-bold text-slate-700">{previewService.trafoSerie || '-'}</span>
                                    </div>
                                    <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fabricación</span>
                                        <span className="text-sm font-mono font-bold text-slate-700">{previewService.trafoFabricacion || '-'}</span>
                                    </div>
                                    <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Potencia</span>
                                        <span className="text-sm font-medium text-slate-700">{previewService.trafoPotencia || '-'}</span>
                                    </div>
                                    <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Relación</span>
                                        <span className="text-sm font-medium text-slate-700">{previewService.trafoRelacion || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {previewService.observaciones && (
                            <div>
                                <h4 className="font-bold text-slate-400 mb-2 flex items-center text-sm"><FileText className="w-4 h-4 mr-2 text-emerald-500"/> Observaciones Iniciales</h4>
                                <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg text-sm text-slate-100 whitespace-pre-wrap leading-relaxed shadow-inner">
                                    {previewService.observaciones}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
            
            {/* Modal Especial para Ensayos */}
            <Modal isOpen={!!managingTestsService} onClose={() => setManagingTestsService(null)} title="Gestión de Ensayos" size="xl">
                {managingTestsService && <ServiceTestsManager service={managingTestsService} onUpdateService={handleUpdateServiceTests} onClose={() => setManagingTestsService(null)} />}
            </Modal>
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
                    <div className="space-y-4"><input type="password" placeholder="Nueva Contraseña" className="input-field" value={password} onChange={e=>setPassword(e.target.value)}/><button onClick={handleAdminSetup} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Guardar</button></div>
                ) : (
                    <div className="space-y-5">
                        <div className="btn-bubble-container">
                            <button onClick={() => { setRole('admin'); setError(''); }} className={`btn-bubble ${role === 'admin' ? 'btn-bubble-active' : 'btn-bubble-inactive'}`}>Admin</button>
                            <button onClick={() => { setRole('tech'); setError(''); }} className={`btn-bubble ${role === 'tech' ? 'btn-bubble-active' : 'btn-bubble-inactive'}`}>Técnico</button>
                        </div>
                        {role === 'tech' && (<div className="relative group"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Briefcase className="h-5 w-5 text-slate-400" /></div><select className="input-field pl-10" value={selectedTechName} onChange={(e) => setSelectedTechName(e.target.value)}><option value="">Selecciona tu usuario...</option>{sortedTecnicos.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}</select></div>)}
                        <div className="relative group"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400" /></div><input type="password" placeholder="Contraseña" className="input-field pl-10" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                        {error && <p className="text-rose-500 text-sm text-center font-medium bg-rose-50 py-2 rounded-lg">{error}</p>}
                        <button onClick={handleLogin} className="w-full bg-orange-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-orange-700 transition-all">Ingresar</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function App() {
    const urlParams = new URLSearchParams(window.location.search);
    const isSurveyRoute = urlParams.get('survey') === 'true';
    const surveyServiceId = urlParams.get('serviceId');

    const [user, setUser] = useState(null); 
    const [activeTab, setActiveTab] = useState('kanban'); 
    const isOnline = useOnlineStatus();
    const [services, setServices] = useState([]);
    const [tecnicosData, setTecnicosData] = useState([]);
    const [vehiculosData, setVehiculosData] = useState([]);
    const [maintenanceRecords, setMaintenanceRecords] = useState([]);
    const [surveysData, setSurveysData] = useState([]); 
    const [lastSavedService, setLastSavedService] = useState(null);
    const [notification, setNotification] = useState(null);
    const [showMsgModal, setShowMsgModal] = useState(false);
    const [managingTestsService, setManagingTestsService] = useState(null);

    const changeTab = (newTab) => {
        if (activeTab !== newTab) {
            window.history.pushState({ tab: newTab }, '');
            setActiveTab(newTab);
        }
    };

    useEffect(() => {
        if (!window.history.state?.tab) {
            window.history.replaceState({ tab: activeTab }, '');
        }

        const handlePopState = (e) => {
            const event = new CustomEvent('app-back', { cancelable: true });
            window.dispatchEvent(event);

            if (event.defaultPrevented) {
                window.history.pushState({ tab: activeTab }, '');
            } else {
                if (e.state && e.state.tab) {
                    setActiveTab(e.state.tab);
                } else {
                    window.history.pushState({ tab: activeTab }, ''); 
                }
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [activeTab]);

    useEffect(() => {
        if (user && !isSurveyRoute) {
            const initialTab = user.role === 'admin' ? 'kanban' : 'tasks';
            setActiveTab(initialTab);
            window.history.replaceState({ tab: initialTab }, '');
        }
    }, [user, isSurveyRoute]);

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
            setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubscribeTechnicians = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'technicians'), (snapshot) => {
            setTecnicosData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubscribeVehicles = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'vehicles'), (snapshot) => {
            setVehiculosData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubscribeMaintenance = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'fleet_maintenance'), (snapshot) => {
            setMaintenanceRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubscribeSurveys = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'surveys'), (snapshot) => {
            setSurveysData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => { unsubscribeServices(); unsubscribeTechnicians(); unsubscribeVehicles(); unsubscribeMaintenance(); unsubscribeSurveys(); };
    }, []);

    if (isSurveyRoute) {
        return (
            <>
                <GlobalStyles />
                <SurveyForm serviceId={surveyServiceId} />
            </>
        );
    }

    const showNotification = (msg, type='success') => { setNotification({msg, type}); setTimeout(()=>setNotification(null), 3000); };

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isManageTechOpen, setIsManageTechOpen] = useState(false);
    const [manageTab, setManageTab] = useState('techs');
    const [isChangeAdminPasswordOpen, setIsChangeAdminPasswordOpen] = useState(false); 
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
    
    const [editingMaintenanceId, setEditingMaintenanceId] = useState(null);
    const [maintenanceFormData, setMaintenanceFormData] = useState({
        vehiculo: '', tipo: 'Service / Cambio de Aceite', fecha: new Date().toISOString().split('T')[0], km: '', estado: 'Pendiente', observaciones: '', tecnicoAsignado: ''
    });

    const [newAdminPasswordToChange, setNewAdminPasswordToChange] = useState(""); 
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        oci: '', cliente: '', fSolicitud: new Date().toISOString().split('T')[0], fInicio: '', fFin: '', tipoTrabajo: TIPOS_TRABAJO[0], tipoTrabajoOtro: '',
        tecnicos: [], vehiculos: [], estado: 'Agendado', observaciones: '', postergado: false, motivoPostergacion: '', alcance: 'Nacional', files: [], 
        progressLogs: [], dailyLogs: [], closureData: null, trafoFabricacion: '', trafoSerie: '', trafoPotencia: '', trafoRelacion: '', ubicacion: '', contactoResponsable: '', cantidadTrafos: 1
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
    const [newVehicleName, setNewVehicleName] = useState("");

    useEffect(() => {
        const handleBack = (e) => {
            const anyOpen = isSidebarOpen || isManageTechOpen || isChangeAdminPasswordOpen || isMaintenanceModalOpen || showMsgModal || uploadingEvidenceService || loggingHoursService || closingService || reopeningService || deletingId || managingTestsService;
            if (anyOpen) {
                e.preventDefault(); 
                setIsSidebarOpen(false); setIsManageTechOpen(false); setIsChangeAdminPasswordOpen(false); setIsMaintenanceModalOpen(false); setShowMsgModal(false); setUploadingEvidenceService(null); setLoggingHoursService(null); setClosingService(null); setReopeningService(null); setDeletingId(null); setManagingTestsService(null);
            }
        };
        window.addEventListener('app-back', handleBack);
        return () => window.removeEventListener('app-back', handleBack);
    }, [isSidebarOpen, isManageTechOpen, isChangeAdminPasswordOpen, isMaintenanceModalOpen, showMsgModal, uploadingEvidenceService, loggingHoursService, closingService, reopeningService, deletingId, managingTestsService]);

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            oci: '', cliente: '', fSolicitud: new Date().toISOString().split('T')[0], fInicio: '', fFin: '', tipoTrabajo: TIPOS_TRABAJO[0], tipoTrabajoOtro: '',
            tecnicos: [], vehiculos: [], estado: 'Agendado', observaciones: '', postergado: false, motivoPostergacion: '', alcance: 'Nacional', files: [], 
            progressLogs: [], dailyLogs: [], closureData: null, trafoFabricacion: '', trafoSerie: '', trafoPotencia: '', trafoRelacion: '', ubicacion: '', contactoResponsable: '', cantidadTrafos: 1
        });
    };

    // Funciones de Personal y Flota
    const addTechnician = async () => {
        if (newTechName && !tecnicosData.find(t => t.name === newTechName.toUpperCase())) {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'technicians'), { name: newTechName.toUpperCase(), phone: newTechPhone, email: newTechEmail, password: newTechPassword || "1234" });
            setNewTechName(""); setNewTechPhone(""); setNewTechEmail(""); setNewTechPassword(""); showNotification("Técnico agregado");
        }
    };
    const removeTechnician = async (id, name) => { if(window.confirm(`¿Eliminar a ${name}?`)) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'technicians', id)); };
    const updateTechData = async (id, field, value) => { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'technicians', id), { [field]: value }); };

    const addVehicle = async () => {
        if (newVehicleName && !vehiculosData.find(v => v.name === newVehicleName.toUpperCase())) {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'vehicles'), { name: newVehicleName.toUpperCase(), km: 0 });
            setNewVehicleName(""); showNotification("Vehículo agregado");
        }
    };
    const removeVehicle = async (id, name) => { if(window.confirm(`¿Eliminar vehículo ${name}?`)) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'vehicles', id)); };
    const updateVehicleData = async (id, field, value) => { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'vehicles', id), { [field]: value }); };

    const handleChangeAdminPassword = async () => {
        if (newAdminPasswordToChange.length < 6) { showNotification("La contraseña debe tener al menos 6 caracteres", "error"); return; }
        try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'admin_settings', 'config'), { password: newAdminPasswordToChange }, { merge: true }); showNotification("Contraseña actualizada"); setIsChangeAdminPasswordOpen(false); setNewAdminPasswordToChange(""); } 
        catch (e) { showNotification("Error al actualizar la contraseña", "error"); }
    };

    // Funciones de Mantenimiento
    const handleEditMaintenance = (record) => {
        if(record === 'new') {
            setEditingMaintenanceId(null);
            setMaintenanceFormData({ vehiculo: vehiculosData.length > 0 ? vehiculosData[0].name : '', tipo: 'Service / Cambio de Aceite', fecha: new Date().toISOString().split('T')[0], km: '', estado: 'Pendiente', observaciones: '', tecnicoAsignado: '' });
        } else { setEditingMaintenanceId(record.id); setMaintenanceFormData(record); }
        setIsMaintenanceModalOpen(true);
    };

    const handleSaveMaintenance = async (e) => {
        e.preventDefault();
        if (editingMaintenanceId) { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'fleet_maintenance', editingMaintenanceId), maintenanceFormData); showNotification("Registro actualizado"); } 
        else { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'fleet_maintenance'), maintenanceFormData); showNotification("Mantenimiento agendado"); }
        setIsMaintenanceModalOpen(false);
    };
    const handleMaintenanceStatusChange = async (id, newStatus) => { try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'fleet_maintenance', id), { estado: newStatus }); showNotification(`Movido a ${newStatus}`); } catch (e) {} };
    const handleDeleteMaintenance = async (id) => { if(window.confirm('¿Seguro que deseas eliminar este registro de mantenimiento?')) { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'fleet_maintenance', id)); showNotification("Registro eliminado"); } };

    // Funciones de Servicios
    const handleEdit = (service) => {
        if(service.id === 'new') resetForm();
        else { setEditingId(service.id); setFormData(service); }
        setIsSidebarOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const serviceData = { 
            ...formData, 
            closureData: editingId ? (services.find(s=>s.id===editingId)?.closureData || null) : null,
            progressLogs: editingId ? (services.find(s=>s.id===editingId)?.progressLogs || []) : [],
            dailyLogs: editingId ? (services.find(s=>s.id===editingId)?.dailyLogs || []) : [],
            ensayos: editingId ? (services.find(s=>s.id===editingId)?.ensayos || []) : []
        };
        if (editingId) { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', editingId), serviceData); showNotification("Servicio actualizado"); } 
        else { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'services'), serviceData); showNotification("Servicio creado"); }
        setLastSavedService(serviceData);
        if (!editingId || (editingId && !formData.postergado)) setShowMsgModal(true);
        setIsSidebarOpen(false);
    };

    const handleUpdateServiceTests = async (testUpdates) => {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', managingTestsService.id), testUpdates);
        setManagingTestsService(prev => ({...prev, ...testUpdates}));
        showNotification("Ensayos guardados");
    };

    const handleStatusChange = async (serviceId, newStatus) => {
        const updateData = { estado: newStatus };
        if (newStatus === 'Agendado') updateData.postergado = false;
        try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', serviceId), updateData); showNotification(`Movido a ${newStatus}`); } catch (e) { }
    };

    const handleWhatsApp = (techName) => {
        if (!lastSavedService) return;
        const tech = tecnicosData.find(t => t.name === techName);
        if (!tech || !tech.phone) { showNotification(`Sin teléfono para ${techName}`, "error"); return; }
        const msg = `--- TICKET DE SERVICIO ---\nTECNICO: ${techName}\nCLIENTE: ${lastSavedService.cliente}\nINICIO: ${formatDate(lastSavedService.fInicio)}\nFIN: ${formatDate(lastSavedService.fFin)}\nTAREA: ${lastSavedService.tipoTrabajo === 'Otro' && lastSavedService.tipoTrabajoOtro ? lastSavedService.tipoTrabajoOtro : lastSavedService.tipoTrabajo}\n>> Iniciar en App al llegar.`;
        window.open(`https://wa.me/${tech.phone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const handleEmail = (techName) => {
        if (!lastSavedService) return;
        const tech = tecnicosData.find(t => t.name === techName);
        if (!tech || !tech.email) { showNotification(`Sin correo para ${techName}`, "error"); return; }
        const subject = encodeURIComponent(`Asignación de Servicio: ${lastSavedService.cliente}`);
        const body = encodeURIComponent(`Hola ${techName},\n\nSe te ha asignado un nuevo servicio.\n\nCliente: ${lastSavedService.cliente}\nFecha: ${formatDate(lastSavedService.fInicio)} al ${formatDate(lastSavedService.fFin)}\nTarea: ${lastSavedService.tipoTrabajo === 'Otro' && lastSavedService.tipoTrabajoOtro ? lastSavedService.tipoTrabajoOtro : lastSavedService.tipoTrabajo}\n\nRevisa el portal.`);
        window.location.href = `mailto:${tech.email}?subject=${subject}&body=${body}`;
    };

    const handleStartService = async (service) => { const startLog = { id: Date.now(), date: new Date().toLocaleString(), comment: `🚀 INICIO`, files: [] }; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', service.id), { estado: 'En Servicio', progressLogs: [...(service.progressLogs||[]), startLog] }); showNotification("Servicio iniciado"); };
    const handleTechEvidenceUpload = async () => { if (evidenceData.files.length === 0 && !evidenceData.comment.trim()) return; const newLog = { id: Date.now(), date: new Date().toLocaleString(), comment: evidenceData.comment, files: evidenceData.files }; const updatedLogs = [...(uploadingEvidenceService.progressLogs || []), newLog]; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', uploadingEvidenceService.id), { progressLogs: updatedLogs }); setUploadingEvidenceService(null); showNotification("Avance subido"); };
    const handleLogHours = async () => { const newLog = { ...dailyLogData, id: Date.now(), workers: techsForHours }; const updatedLogs = [...(loggingHoursService.dailyLogs || []), newLog]; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', loggingHoursService.id), { dailyLogs: updatedLogs }); setLoggingHoursService(null); showNotification("Horas registradas"); };
    const handleTechClosure = async () => { const closureInfo = { ...closureData, date: new Date().toISOString() }; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', closingService.id), { estado: closureData.status, closureData: closureInfo }); setClosingService(null); showNotification("Servicio cerrado"); };
    const handleReopenService = async () => { const newLog = { id: Date.now(), date: new Date().toLocaleString(), comment: `🔄 REAPERTURA: ${reopenReason}`, files: [] }; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', reopeningService.id), { estado: 'En Servicio', progressLogs: [...(reopeningService.progressLogs||[]), newLog] }); setReopeningService(null); };
    const handleDelete = (id) => setDeletingId(id);
    const confirmDelete = async () => { if (deletingId) { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', deletingId)); setDeletingId(null); showNotification("Servicio eliminado"); } };

    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

    const overdueServices = services.filter(s => s.estado !== 'Finalizado' && s.fFin < todayStr && s.tipoTrabajo !== 'Vacaciones' && s.tipoTrabajo !== 'Estudios Médicos');
    const upcomingMedical = services.filter(s => s.estado !== 'Finalizado' && s.tipoTrabajo === 'Estudios Médicos' && (s.fInicio === tomorrowStr || s.fInicio === todayStr));
    const upcomingMaintenance = maintenanceRecords.filter(m => m.estado === 'Pendiente' && (m.fecha === tomorrowStr || m.fecha === todayStr));

    if (!user) return <LoginScreen onLogin={setUser} tecnicosData={tecnicosData}/>;

    const isAdmin = user.role === 'admin';

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden app-background">
            <div className="absolute inset-0 app-overlay z-0"></div>
            <GlobalStyles />
            
            <div className="lg:hidden absolute top-0 left-0 w-full bg-white/95 backdrop-blur-sm border-b border-slate-100 z-40 px-4 py-3 flex justify-between items-center shadow-sm">
                <div className="flex items-center">
                    <img src={COMPANY_LOGO} alt="Logo" className="w-8 h-8 object-contain mr-2" />
                    <span className="font-black text-slate-800 text-sm tracking-tight">PLANIFICACIÓN</span>
                </div>
                <button onClick={() => setIsSidebarOpen(true)} className="text-orange-600 p-2 bg-orange-50 hover:bg-orange-100 rounded-lg flex items-center transition-colors shadow-sm">
                    <Menu className="w-5 h-5 mr-1" /> <span className="text-xs font-bold uppercase">Agendar / Menú</span>
                </button>
            </div>

            <div className={`fixed inset-y-0 left-0 z-50 w-full lg:w-80 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div className="flex items-center">
                        <img src={COMPANY_LOGO} alt="Logo" className="w-10 h-10 object-contain mr-2" />
                        <div><h2 className="text-sm font-black">PLANIFICACIÓN</h2><p className="text-xs font-bold text-orange-600">POSTVENTA</p></div>
                    </div>
                    <button onClick={()=>setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"><X className="w-6 h-6"/></button>
                </div>
                
                {isAdmin ? (
                    <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
                        <div className="mb-6 space-y-2">
                            <button onClick={() => setIsManageTechOpen(true)} className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-orange-300 text-sm font-bold transition-all shadow-sm">
                                <span className="flex items-center"><Users className="w-4 h-4 mr-2 text-slate-400"/> Personal y Flota</span><ChevronRight className="w-4 h-4 text-slate-300"/>
                            </button>
                            <button onClick={() => setIsChangeAdminPasswordOpen(true)} className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-orange-300 text-sm font-bold transition-all shadow-sm">
                                <span className="flex items-center"><Key className="w-4 h-4 mr-2 text-slate-400"/> Clave Administrador</span><ChevronRight className="w-4 h-4 text-slate-300"/>
                            </button>
                        </div>

                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Asignación</p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {editingId && (<div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-sm flex justify-between items-center"><span className="font-bold text-amber-800">✏️ Editando...</span><button type="button" onClick={resetForm} className="text-xs bg-white border px-2 py-1 rounded">Cancelar</button></div>)}
                            
                            <div className="form-group">
                                <label className="text-xs font-bold text-slate-500 mb-1 block">TIPO</label>
                                <select className="input-field" value={formData.tipoTrabajo} onChange={e=>{
                                    const v = e.target.value; 
                                    const isAbsence = v === 'Vacaciones' || v === 'Estudios Médicos';
                                    setFormData(p=>({...p, tipoTrabajo: v, cliente: isAbsence?'INTERNO':p.cliente, oci: isAbsence?v.toUpperCase():p.oci, vehiculos: isAbsence?[]:p.vehiculos}));
                                }}>{TIPOS_TRABAJO.map(t=><option key={t} value={t}>{t}</option>)}</select>
                                {formData.tipoTrabajo === 'Otro' && (
                                    <input type="text" className="input-field mt-2 text-xs animate-in fade-in" placeholder="Especifique..." value={formData.tipoTrabajoOtro || ''} onChange={e=>setFormData({...formData, tipoTrabajoOtro: e.target.value})} />
                                )}
                            </div>
                            
                            {REQUIRES_TESTS_TYPES.includes(formData.tipoTrabajo) && (
                                <div className="form-group animate-in fade-in mt-2">
                                    <label className="text-[10px] font-bold text-teal-600 mb-1 block flex items-center uppercase tracking-wider">
                                        <FileSpreadsheet className="w-3 h-3 mr-1"/> Cant. de Transformadores (Ensayos)
                                    </label>
                                    <input type="number" min="1" className="input-field text-xs border-teal-200 focus:border-teal-500" value={formData.cantidadTrafos || 1} onChange={e=>setFormData({...formData, cantidadTrafos: parseInt(e.target.value) || 1})} />
                                </div>
                            )}

                            {formData.tipoTrabajo !== 'Vacaciones' && formData.tipoTrabajo !== 'Estudios Médicos' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="form-group"><label className="text-xs font-bold text-slate-500 mb-1 block">OCI</label><input className="input-field font-mono" value={formData.oci} onChange={e=>setFormData({...formData, oci:e.target.value})} placeholder="OCI"/></div>
                                    <div className="form-group"><label className="text-xs font-bold text-slate-500 mb-1 block">CLIENTE</label><input className="input-field uppercase" value={formData.cliente} onChange={e=>setFormData({...formData, cliente:e.target.value.toUpperCase()})} placeholder="CLIENTE"/></div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                                <div className="form-group"><label className="text-xs font-bold text-slate-500 mb-1 block">INICIO</label><input type="date" className="input-field text-xs" value={formData.fInicio} onChange={e=>setFormData({...formData, fInicio:e.target.value})}/></div>
                                <div className="form-group"><label className="text-xs font-bold text-slate-500 mb-1 block">FIN</label><input type="date" className="input-field text-xs" value={formData.fFin} onChange={e=>setFormData({...formData, fFin:e.target.value})}/></div>
                            </div>
                            
                            {formData.tipoTrabajo !== 'Vacaciones' && formData.tipoTrabajo !== 'Estudios Médicos' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="form-group">
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">ALCANCE</label>
                                        <select className="input-field text-xs bg-white" value={formData.alcance} onChange={e=>setFormData({...formData, alcance:e.target.value})}>
                                            <option value="Nacional">Nacional</option>
                                            <option value="Internacional">Internacional</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">FECHA SOLICITUD</label>
                                        <input type="date" className="input-field text-xs bg-white" value={formData.fSolicitud} onChange={e=>setFormData({...formData, fSolicitud:e.target.value})} />
                                    </div>
                                </div>
                            )}
                            
                            <div className="form-group">
                                <div className="flex justify-between items-center mb-1"><label className="text-xs font-bold text-slate-500">TÉCNICOS</label></div>
                                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50">
                                    {tecnicosData.map(t=>(
                                        <label key={t.id} className={`flex items-center space-x-2 p-1 rounded cursor-pointer ${formData.tecnicos.includes(t.name)?'bg-orange-100 font-bold text-orange-800':''}`}>
                                            <input type="checkbox" checked={formData.tecnicos.includes(t.name)} onChange={()=>{const newTechs = formData.tecnicos.includes(t.name) ? formData.tecnicos.filter(n=>n!==t.name) : [...formData.tecnicos, t.name]; setFormData({...formData, tecnicos: newTechs});}} className="accent-orange-600"/>
                                            <span className="text-xs">{t.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

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
                                        <label className="text-[10px] font-bold text-orange-700 uppercase mb-1 block">Ubicación (Ciudad o Coordenadas)</label>
                                        <input type="text" placeholder="Ej: Neuquén, Argentina o -38.95, -68.05" className="input-field text-xs bg-white w-full" value={formData.ubicacion} onChange={e=>setFormData({...formData, ubicacion:e.target.value})} />
                                        <p className="text-[9px] text-slate-400 mt-1 leading-tight">Evita enlaces cortos (goo.gl). Ingresa el nombre de la ciudad o lat/lng para que aparezca en el mapa.</p>
                                    </div>
                                </div>
                            )}

                            {formData.tipoTrabajo !== 'Vacaciones' && formData.tipoTrabajo !== 'Estudios Médicos' && (
                                <div className="form-group">
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">VEHÍCULOS</label>
                                    <div className="flex flex-wrap gap-1">
                                        {vehiculosData.map(v=>(
                                            <label key={v.id} className={`text-[10px] px-2 py-1 border rounded cursor-pointer transition-colors ${formData.vehiculos.includes(v.name)?'bg-orange-500 text-white border-orange-500 font-bold shadow-sm':'bg-white text-slate-600 hover:bg-orange-50 hover:border-orange-200'}`}>
                                                <input type="checkbox" className="hidden" checked={formData.vehiculos.includes(v.name)} onChange={()=>{const newVehs = formData.vehiculos.includes(v.name) ? formData.vehiculos.filter(x=>x!==v.name) : [...formData.vehiculos, v.name]; setFormData({...formData, vehiculos: newVehs});}}/>
                                                {v.name}
                                            </label>
                                        ))}
                                        {vehiculosData.length === 0 && <span className="text-[10px] text-slate-400">Sin vehículos en la base.</span>}
                                    </div>
                                </div>
                            )}
                            
                            <div className="form-group">
                                <label className="text-xs font-bold text-slate-500 mb-1 block">OBSERVACIONES</label>
                                <textarea className="input-field h-24 resize-none text-xs" placeholder="Detalles del trabajo..." value={formData.observaciones} onChange={e=>setFormData({...formData, observaciones:e.target.value})} />
                            </div>

                            <button className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-orange-700 active:scale-95 transition-all">
                                {editingId ? 'Guardar Cambios' : 'Agendar'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="p-8 text-center flex-1 flex flex-col justify-center items-center">
                        <UserCheck className="w-12 h-12 text-orange-400 mb-2"/>
                        <h3 className="text-lg font-black text-slate-700">¡Hola, {user.name}!</h3>
                        <p className="text-sm text-slate-500 mt-2">Bienvenido a tu panel de tareas.</p>
                    </div>
                )}
                
                <div className="p-4 border-t border-slate-100 bg-white">
                    <button onClick={()=>setUser(null)} className="flex items-center justify-center w-full py-2 text-slate-500 hover:text-rose-600 font-medium transition-colors">
                        <LogOut className="w-4 h-4 mr-2"/> Salir
                    </button>
                </div>
            </div>

            {/* Área Principal */}
            <div className="flex-1 flex flex-col overflow-hidden relative z-10 pt-[68px] lg:pt-0">
                <header className="bg-white/95 border-b border-slate-100 px-8 py-4 flex flex-col md:flex-row justify-between items-center shadow-sm backdrop-blur-sm gap-4">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight hidden md:block">Dashboard</h1>
                    {isAdmin ? (
                        <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full">
                            {[ {id:'map', label:'Mapa Mundial', icon:MapIcon}, {id:'kanban', label:'Tablero', icon:Columns}, {id:'gantt', label:'Cronograma', icon:Calendar}, {id:'sheet', label:'Planilla', icon:List}, {id:'vehicles', label:'Flota', icon:Truck}, {id:'vacations', label:'Vacaciones', icon:Palmtree}, {id:'history', label:'Historial', icon:History}, {id:'kpis', label:'KPIs', icon:BarChart2}, {id:'surveys', label:'Encuestas', icon:ClipboardList}, {id:'tests', label:'Ensayos', icon:FileSpreadsheet} ].map(tab=>(<button key={tab.id} onClick={()=>changeTab(tab.id)} className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab===tab.id?'bg-white text-orange-600 shadow-sm':'text-slate-500 hover:text-slate-700'}`}><tab.icon className="w-4 h-4 mr-2"/> {tab.label}</button>))}
                        </div>
                    ) : (
                        <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full">
                            <button onClick={()=>changeTab('tasks')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab==='tasks'?'bg-white text-orange-600 shadow-sm':'text-slate-500 hover:text-slate-700'}`}><LayoutList className="w-4 h-4 mr-2"/> Mis Tareas</button>
                            <button onClick={()=>changeTab('map')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab==='map'?'bg-white text-orange-600 shadow-sm':'text-slate-500 hover:text-slate-700'}`}><MapIcon className="w-4 h-4 mr-2"/> Mapa Mundial</button>
                            <button onClick={()=>changeTab('history')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab==='history'?'bg-white text-orange-600 shadow-sm':'text-slate-500 hover:text-slate-700'}`}><History className="w-4 h-4 mr-2"/> Historial</button>
                        </div>
                    )}
                </header>

                <main className="flex-1 overflow-auto p-4 md:p-6 custom-scrollbar">
                    {notification && <div className={`fixed top-20 right-8 px-6 py-3 rounded-xl shadow-lg z-50 animate-in fade-in text-white font-bold flex items-center ${notification.type==='error'?'bg-rose-500':'bg-emerald-500'}`}>{notification.msg}</div>}
                    
                    {isAdmin && (overdueServices.length > 0 || upcomingMedical.length > 0 || upcomingMaintenance.length > 0) && (
                        <div className="mb-6 space-y-3 animate-in fade-in slide-in-from-top-4 max-w-7xl mx-auto">
                            {overdueServices.length > 0 && <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3.5 rounded-xl flex items-center shadow-sm"><AlertTriangle className="w-5 h-5 mr-3 text-rose-600 shrink-0"/><span className="text-sm font-medium">Hay <b>{overdueServices.length} servicio(s)</b> con fecha de fin superada que siguen sin marcarse como "Finalizado" en el tablero.</span></div>}
                            {upcomingMedical.length > 0 && <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3.5 rounded-xl flex items-center shadow-sm"><Activity className="w-5 h-5 mr-3 text-amber-600 shrink-0"/><span className="text-sm font-medium">Recordatorio: Hay <b>{upcomingMedical.length} turno(s)</b> programado(s) para Estudios Médicos.</span></div>}
                            {upcomingMaintenance.length > 0 && <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 px-4 py-3.5 rounded-xl flex items-center shadow-sm"><Truck className="w-5 h-5 mr-3 text-indigo-600 shrink-0"/><span className="text-sm font-medium">Recordatorio: Hay <b>{upcomingMaintenance.length} mantenimiento(s)</b> de vehículo programado(s).</span></div>}
                        </div>
                    )}

                    {isAdmin ? (
                        <div className="max-w-7xl mx-auto h-full">
                            {activeTab === 'map' && <MapDashboard services={services} />}
                            {activeTab === 'kanban' && <KanbanBoard services={services} maintenanceRecords={maintenanceRecords} onStatusChange={handleStatusChange} onMaintenanceStatusChange={handleMaintenanceStatusChange} handleEditService={handleEdit} handleEditMaintenance={handleEditMaintenance}/>}
                            {activeTab === 'gantt' && <GanttChart services={services} mode="operations" handleEdit={handleEdit} isAdmin={isAdmin}/>}
                            {activeTab === 'sheet' && <ServiceSheet sortedServices={services} mode="operations" handleEdit={handleEdit} handleDelete={handleDelete}/>}
                            {activeTab === 'vehicles' && (
                                <div className="space-y-6">
                                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 shadow-sm flex justify-between items-center">
                                        <div><h3 className="font-bold text-orange-800 text-sm flex items-center"><Calendar className="w-4 h-4 mr-2"/> Calendario de Mantenimientos</h3><p className="text-xs text-orange-600">Próximos mantenimientos de la flota.</p></div>
                                        <button onClick={() => handleEditMaintenance('new')} className="bg-orange-600 text-white px-4 py-2 rounded-xl font-bold flex items-center hover:bg-orange-700 shadow-md active:scale-95 text-xs"><Plus className="w-4 h-4 mr-2"/> Nuevo Registro</button>
                                    </div>
                                    <GanttChart maintenanceRecords={maintenanceRecords} mode="fleet" handleEdit={handleEditMaintenance} isAdmin={isAdmin}/>
                                </div>
                            )}
                            {activeTab === 'vacations' && (<div className="space-y-6"><GanttChart services={services} mode="vacations" handleEdit={handleEdit} isAdmin={isAdmin}/><ServiceSheet sortedServices={services} mode="vacations" handleEdit={handleEdit} handleDelete={handleDelete}/></div>)}
                            {activeTab === 'history' && <TransformerHistory services={services} />}
                            {activeTab === 'kpis' && <KPIs services={services} vehiculosData={vehiculosData} />}
                            {activeTab === 'surveys' && <SurveyDashboard surveys={surveysData} />}
                            {activeTab === 'tests' && <EnsayosDashboard services={services} />}
                        </div>
                    ) : (
                        <div className="max-w-7xl mx-auto h-full">
                            {activeTab === 'map' && <MapDashboard services={services} />}
                            {activeTab === 'tasks' && <TechPortal services={services} maintenanceRecords={maintenanceRecords} user={user} handleStartService={handleStartService} onMaintenanceStatusChange={handleMaintenanceStatusChange} setUploadingEvidenceService={setUploadingEvidenceService} setEvidenceData={setEvidenceData} setLoggingHoursService={setLoggingHoursService} setDailyLogData={setDailyLogData} setTechsForHours={setTechsForHours} setClosingService={setClosingService} setClosureData={setClosureData} setReopeningService={setReopeningService} setReopenReason={setReopenReason} showNotification={showNotification} setManagingTestsService={setManagingTestsService} />}
                            {activeTab === 'history' && <TransformerHistory services={services} />}
                        </div>
                    )}
                </main>

                {isAdmin && (
                    <button onClick={() => { resetForm(); setIsSidebarOpen(true); }} className="lg:hidden fixed bottom-6 right-6 z-30 bg-orange-600 text-white p-4 rounded-full shadow-xl shadow-orange-300 hover:bg-orange-700 active:scale-95 transition-all">
                        <Plus className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* MODALES GLOBALES */}
            <Modal isOpen={isMaintenanceModalOpen} onClose={()=>setIsMaintenanceModalOpen(false)} title={editingMaintenanceId ? 'Editar Mantenimiento' : 'Agendar Mantenimiento'}>
                <form onSubmit={handleSaveMaintenance} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Vehículo</label>
                        <select className="input-field" value={maintenanceFormData.vehiculo} onChange={e=>setMaintenanceFormData({...maintenanceFormData, vehiculo: e.target.value})}>
                            {vehiculosData.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                            {vehiculosData.length === 0 && <option value="">Sin vehículos registrados</option>}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Tipo de Tarea</label>
                        <select className="input-field" value={maintenanceFormData.tipo} onChange={e=>setMaintenanceFormData({...maintenanceFormData, tipo: e.target.value})}>
                            <option value="Service / Cambio de Aceite">Service / Cambio de Aceite</option>
                            <option value="VTV / RTO">VTV / RTO</option>
                            <option value="Cambio de Cubiertas">Cambio de Cubiertas</option>
                            <option value="Renovación Seguro">Renovación Seguro</option>
                            <option value="Reparación Mecánica">Reparación Mecánica</option>
                            <option value="Mantenimiento General">Mantenimiento General</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Técnico Asignado</label>
                        <select className="input-field" value={maintenanceFormData.tecnicoAsignado || ''} onChange={e=>setMaintenanceFormData({...maintenanceFormData, tecnicoAsignado: e.target.value})}>
                            <option value="">Taller Externo / No requiere</option>
                            {tecnicosData.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">Fecha</label>
                            <input type="date" className="input-field text-xs" value={maintenanceFormData.fecha} onChange={e=>setMaintenanceFormData({...maintenanceFormData, fecha: e.target.value})} required/>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">Kilometraje</label>
                            <input type="number" className="input-field text-xs" value={maintenanceFormData.km} onChange={e=>setMaintenanceFormData({...maintenanceFormData, km: e.target.value})} placeholder="Opcional"/>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Estado</label>
                        <select className="input-field text-xs" value={maintenanceFormData.estado} onChange={e=>setMaintenanceFormData({...maintenanceFormData, estado: e.target.value})}>
                            <option value="Pendiente">Pendiente</option>
                            <option value="En Taller">En Taller / Proceso</option>
                            <option value="Realizado">Realizado</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Observaciones</label>
                        <textarea className="input-field h-24 resize-none text-xs" value={maintenanceFormData.observaciones} onChange={e=>setMaintenanceFormData({...maintenanceFormData, observaciones: e.target.value})} placeholder="Detalles adicionales..."></textarea>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setIsMaintenanceModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancelar</button>
                        <button type="submit" className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-lg active:scale-95">{editingMaintenanceId ? 'Guardar' : 'Agendar'}</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isManageTechOpen} onClose={()=>setIsManageTechOpen(false)} title="Gestión de Personal y Flota" size="lg">
                <div className="flex space-x-2 mb-6 bg-slate-100 p-1.5 rounded-xl w-fit">
                    <button type="button" onClick={() => setManageTab('techs')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${manageTab === 'techs' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}>Técnicos</button>
                    <button type="button" onClick={() => setManageTab('vehicles')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${manageTab === 'vehicles' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}>Flota</button>
                </div>
                {manageTab === 'techs' ? (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                            <div><label className="text-[10px] font-bold text-orange-700 uppercase mb-1 block">Nombre</label><input className="input-field bg-white text-xs py-2" placeholder="Nombre" value={newTechName} onChange={e=>setNewTechName(e.target.value.toUpperCase())} /></div>
                            <div><label className="text-[10px] font-bold text-orange-700 uppercase mb-1 block">Teléfono</label><input className="input-field bg-white text-xs py-2" placeholder="Ej: 549351..." value={newTechPhone} onChange={e=>setNewTechPhone(e.target.value)} /></div>
                            <div><label className="text-[10px] font-bold text-orange-700 uppercase mb-1 block">Correo</label><input type="email" className="input-field bg-white text-xs py-2" placeholder="Email" value={newTechEmail} onChange={e=>setNewTechEmail(e.target.value)} /></div>
                            <div className="flex gap-2">
                                <div className="flex-1"><label className="text-[10px] font-bold text-orange-700 uppercase mb-1 block">Contraseña</label><input className="input-field bg-white text-xs py-2" placeholder="Clave" value={newTechPassword} onChange={e=>setNewTechPassword(e.target.value)} /></div>
                                <button onClick={addTechnician} className="bg-orange-600 text-white px-3 rounded-lg font-bold hover:bg-orange-700 active:scale-95 h-[34px] self-end shadow-md"><Plus className="w-4 h-4"/></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                            {tecnicosData.sort((a,b)=>a.name.localeCompare(b.name)).map(t=>(
                                <div key={t.id} className="p-3 border border-slate-200 rounded-xl bg-white shadow-sm hover:border-orange-200 transition-all group">
                                    <div className="flex justify-between items-center mb-2"><span className="font-bold text-sm text-slate-700">{t.name}</span><button onClick={() => removeTechnician(t.id, t.name)} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button></div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2"><Phone className="w-3 h-3 text-slate-400 shrink-0" /><input type="text" value={t.phone || ''} onChange={(e) => updateTechData(t.id, 'phone', e.target.value)} className="text-xs w-full bg-slate-50 border border-transparent rounded hover:border-slate-300 focus:border-orange-300 p-1.5 outline-none transition-colors" placeholder="Teléfono" /></div>
                                        <div className="flex items-center gap-2"><Mail className="w-3 h-3 text-slate-400 shrink-0" /><input type="email" value={t.email || ''} onChange={(e) => updateTechData(t.id, 'email', e.target.value)} className="text-xs w-full bg-slate-50 border border-transparent rounded hover:border-slate-300 focus:border-orange-300 p-1.5 outline-none transition-colors" placeholder="Correo" /></div>
                                        <div className="flex items-center gap-2"><Key className="w-3 h-3 text-slate-400 shrink-0" /><input type="text" value={t.password || ''} onChange={(e) => updateTechData(t.id, 'password', e.target.value)} className="text-xs w-full bg-slate-50 border border-transparent rounded hover:border-slate-300 focus:border-orange-300 p-1.5 outline-none font-mono text-slate-700 transition-colors" placeholder="Contraseña" /></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100 flex gap-2 items-end mb-6">
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-indigo-700 uppercase mb-1 block">Patente / Nombre del Vehículo</label>
                                <input className="input-field bg-white text-xs py-2" placeholder="Ej: KANGOO AB 123 CD" value={newVehicleName} onChange={e=>setNewVehicleName(e.target.value.toUpperCase())} />
                            </div>
                            <button type="button" onClick={addVehicle} className="bg-indigo-600 text-white px-4 rounded-lg font-bold hover:bg-indigo-700 active:scale-95 h-[34px] shadow-md flex items-center"><Plus className="w-4 h-4 mr-1"/> Agregar</button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                            {vehiculosData.sort((a,b)=>a.name.localeCompare(b.name)).map(v=>(
                                <div key={v.id} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3 group hover:border-indigo-200 transition-all">
                                    <div className="flex items-center w-full md:w-auto">
                                        <Truck className="w-5 h-5 text-indigo-400 mr-3 shrink-0"/>
                                        <span className="font-bold text-sm text-slate-700 truncate max-w-[200px]">{v.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                                            <Activity className="w-3.5 h-3.5 text-slate-400 mr-2"/>
                                            <input type="number" value={v.km || ''} onChange={(e) => updateVehicleData(v.id, 'km', Number(e.target.value))} className="w-24 bg-transparent text-xs font-bold text-slate-700 outline-none" placeholder="Km actuales" />
                                            <span className="text-[10px] font-bold text-slate-400 ml-1">KM</span>
                                        </div>
                                        <button type="button" onClick={() => removeVehicle(v.id, v.name)} className="text-slate-300 hover:text-rose-500 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                            {vehiculosData.length === 0 && <div className="text-center text-slate-400 text-sm py-4">No hay vehículos registrados.</div>}
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={isChangeAdminPasswordOpen} onClose={()=>setIsChangeAdminPasswordOpen(false)} title="Cambiar Clave de Administrador" size="sm">
                <div className="space-y-4">
                    <p className="text-sm text-slate-500">Ingresa la nueva contraseña maestra para acceder al panel de administración.</p>
                    <input type="text" className="input-field font-mono" placeholder="Nueva contraseña (mínimo 6 caracteres)" value={newAdminPasswordToChange} onChange={e => setNewAdminPasswordToChange(e.target.value)}/>
                    <button onClick={handleChangeAdminPassword} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">Actualizar Contraseña</button>
                </div>
            </Modal>

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
                                     <button onClick={()=>handleWhatsApp(t)} className="flex-1 text-emerald-600 flex items-center justify-center text-xs font-bold bg-emerald-50 border border-emerald-100 px-3 py-2.5 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors"><MessageCircle className="w-4 h-4 mr-1.5"/> WhatsApp</button>
                                     <button onClick={()=>handleEmail(t)} className="flex-1 text-blue-600 flex items-center justify-center text-xs font-bold bg-blue-50 border border-blue-100 px-3 py-2.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"><Mail className="w-4 h-4 mr-1.5"/> Correo</button>
                                 </div>
                             </div>
                         ))
                     ) : (<p className="text-center text-slate-500 text-sm py-4">No hay técnicos asignados para notificar.</p>)}
                 </div>
            </Modal>

            <Modal isOpen={!!uploadingEvidenceService} onClose={()=>setUploadingEvidenceService(null)} title="Subir Avance">
                <div className="space-y-4">
                    <textarea className="input-field h-24" placeholder="Comentario..." value={evidenceData.comment} onChange={e=>setEvidenceData({...evidenceData, comment:e.target.value})}/>
                    <FileUploader files={evidenceData.files} setFiles={(f)=>setEvidenceData({...evidenceData, files:f})} label="ARCHIVOS"/>
                    <button onClick={handleTechEvidenceUpload} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Guardar</button>
                </div>
            </Modal>

            <Modal isOpen={!!loggingHoursService} onClose={()=>setLoggingHoursService(null)} title="Cargar Horas">
                <div className="space-y-4">
                    <input type="date" className="input-field" value={dailyLogData.date} onChange={e=>setDailyLogData({...dailyLogData, date:e.target.value})}/>
                    <div className="grid grid-cols-2 gap-2">
                        <input type="time" className="input-field" value={dailyLogData.start} onChange={e=>setDailyLogData({...dailyLogData, start:e.target.value})}/>
                        <input type="time" className="input-field" value={dailyLogData.end} onChange={e=>setDailyLogData({...dailyLogData, end:e.target.value})}/>
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
                    <button onClick={handleTechClosure} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold">Cerrar Servicio</button>
                </div>
            </Modal>

            <Modal isOpen={!!reopeningService} onClose={()=>setReopeningService(null)} title="Reabrir">
                <div className="space-y-4">
                    <textarea className="input-field h-24" placeholder="Motivo..." value={reopenReason} onChange={e=>setReopenReason(e.target.value)}/>
                    <button onClick={handleReopenService} className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold">Confirmar</button>
                </div>
            </Modal>

            <Modal isOpen={!!deletingId} onClose={()=>setDeletingId(null)} title="Eliminar">
                <div className="text-center p-4">
                    <p className="mb-4">¿Seguro deseas eliminar este registro permanentemente?</p>
                    <div className="flex gap-2 justify-center">
                        <button onClick={()=>setDeletingId(null)} className="px-4 py-2 bg-slate-100 rounded-lg font-bold text-slate-600">Cancelar</button>
                        <button onClick={confirmDelete} className="px-4 py-2 bg-rose-600 text-white rounded-lg font-bold">Eliminar</button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={!!managingTestsService} onClose={() => setManagingTestsService(null)} title="Gestión de Ensayos" size="xl">
                {managingTestsService && <ServiceTestsManager service={managingTestsService} onUpdateService={handleUpdateServiceTests} onClose={() => setManagingTestsService(null)} />}
            </Modal>
        </div>
    );
}