import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Calendar, 
  Globe, 
  RefreshCw, 
  FileSpreadsheet, 
  FileText, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Layers,
  CheckCircle2,
  Table,
  PieChart
} from 'lucide-react';

// Cartographie des Pays et de leurs Plateformes / SFD respectifs
const COUNTRIES_DATA = [
  { 
    code: 'ALL', 
    name: 'Tous les pays (Consolidé)', 
    flag: '🌍',
    platforms: [{ id: 'all', name: 'Toutes les Plateformes (Consolidé)' }]
  },
  { 
    code: 'BJ', 
    name: 'Bénin', 
    flag: '🇧🇯', 
    weight: 0.35,
    platforms: [
      { id: 'all_bj', name: 'Toutes les plateformes (Bénin)' },
      { id: 'fececam', name: 'FECECAM' },
      { id: 'laposte_bj', name: 'La Poste du Bénin' },
      { id: 'pebco', name: 'PEBCo-BETHESDA' },
      { id: 'padme', name: 'PADME' }
    ]
  },
  { 
    code: 'TG', 
    name: 'Togo', 
    flag: '🇹🇬', 
    weight: 0.18,
    platforms: [
      { id: 'all_tg', name: 'Toutes les plateformes (Togo)' },
      { id: 'fucec', name: 'FUCEC' },
      { id: 'epam', name: 'EPAM' },
      { id: 'laposte_tg', name: 'La Poste du Togo' }
    ]
  },
  { 
    code: 'BF', 
    name: 'Burkina-Faso', 
    flag: '🇧🇫', 
    weight: 0.20,
    platforms: [
      { id: 'all_bf', name: 'Toutes les plateformes (Burkina-Faso)' },
      { id: 'fcpb', name: 'FCPB' },
      { id: 'pmbf', name: 'PMBF' }
    ]
  },
  { 
    code: 'SN', 
    name: 'Sénégal', 
    flag: '🇸🇳', 
    weight: 0.15,
    platforms: [
      { id: 'all_sn', name: 'Toutes les plateformes (Sénégal)' },
      { id: 'pamecas', name: 'PAMECAS' }
    ]
  },
  { 
    code: 'ML', 
    name: 'Mali', 
    flag: '🇲🇱', 
    weight: 0.12,
    platforms: [
      { id: 'all_ml', name: 'Toutes les plateformes (Mali)' },
      { id: 'kafu', name: 'KAFU' },
      { id: 'nyesigiso', name: 'Nyèsigiso' }
    ]
  }
];

// Gestion dynamique des années (2021 à Année en cours)
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 2021 + 1 }, (_, i) => 2021 + i);

// Mois
const MONTHS = [
  'JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
  'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE'
];

// Générateur de données dynamiques selon Pays, Plateforme et Année
const generateData = (countryCode, platformId, year) => {
  const isCurrentYear = year === CURRENT_YEAR;
  const currentMonthIdx = new Date().getMonth();
  const yearMultiplier = 1 + (year - 2021) * 0.12;
  const countryObj = COUNTRIES_DATA.find(c => c.code === countryCode) || COUNTRIES_DATA[0];
  const countryWeight = countryObj.weight || 1;

  return MONTHS.map((month, idx) => {
    // Si année en cours et mois futur, pas de données
    if (isCurrentYear && idx > currentMonthIdx) {
      return {
        month, agents: null, beneficiaires: null, beneficiairesFemmes: null,
        plansEpargne: null, demandesCredit: null, creditsOctroyes: null, volumeEpargne: null
      };
    }

    const baseFactor = (Math.sin(idx + 1) * 0.08 + 1) * yearMultiplier * (countryCode === 'ALL' ? 1 : countryWeight);

    const agents = Math.round(240 * baseFactor);
    const beneficiaires = Math.round(2800 * baseFactor);
    const beneficiairesFemmes = Math.round(beneficiaires * 0.54);
    const plansEpargne = Math.round(42000 * baseFactor);
    const demandesCredit = Math.round(720 * baseFactor);
    const creditsOctroyes = Math.round(demandesCredit * 0.86);
    const volumeEpargne = Math.round(2600000000 * baseFactor);

    return {
      month, agents, beneficiaires, beneficiairesFemmes,
      plansEpargne, demandesCredit, creditsOctroyes, volumeEpargne
    };
  });
};

export default function DashboardBFT() {
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [activeTab, setActiveTab] = useState('table');
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());
  const [isSyncing, setIsSyncing] = useState(false);

  // Mise à jour de la liste des plateformes disponibles selon le pays choisi
  const availablePlatforms = useMemo(() => {
    if (selectedCountry === 'ALL') {
      // Si "Tous les pays", regroupe l'ensemble des plateformes de tous les pays
      const allPlats = [{ id: 'all', name: 'Toutes les Plateformes (Consolidé)' }];
      COUNTRIES_DATA.forEach(c => {
        if (c.code !== 'ALL') {
          c.platforms.forEach(p => {
            if (!p.id.startsWith('all_')) allPlats.push({ ...p, name: `${p.name} (${c.name})` });
          });
        }
      });
      return allPlats;
    }
    const country = COUNTRIES_DATA.find(c => c.code === selectedCountry);
    return country ? country.platforms : [];
  }, [selectedCountry]);

  // Réinitialise la plateforme si elle n'appartient pas au nouveau pays sélectionné
  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);
    const countryObj = COUNTRIES_DATA.find(c => c.code === newCountry);
    if (countryObj && countryObj.platforms.length > 0) {
      setSelectedPlatform(countryObj.platforms[0].id);
    }
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setLastSync(new Date().toLocaleTimeString());
      setIsSyncing(false);
    }, 1000);
  };

  // Calcul des données du tableau
  const monthData = useMemo(() => {
    return generateData(selectedCountry, selectedPlatform, selectedYear);
  }, [selectedCountry, selectedPlatform, selectedYear]);

  // Totaux de l'année
  const totals = useMemo(() => {
    const validMonths = monthData.filter(m => m.volumeEpargne !== null);
    if (validMonths.length === 0) return {
      agents: 0, beneficiaires: 0, beneficiairesFemmes: 0, plansEpargne: 0, demandesCredit: 0, creditsOctroyes: 0, volumeEpargne: 0
    };

    return {
      agents: Math.round(validMonths.reduce((sum, m) => sum + (m.agents || 0), 0) / validMonths.length),
      beneficiaires: validMonths.reduce((sum, m) => sum + (m.beneficiaires || 0), 0),
      beneficiairesFemmes: validMonths.reduce((sum, m) => sum + (m.beneficiairesFemmes || 0), 0),
      plansEpargne: validMonths.reduce((sum, m) => sum + (m.plansEpargne || 0), 0),
      demandesCredit: validMonths.reduce((sum, m) => sum + (m.demandesCredit || 0), 0),
      creditsOctroyes: validMonths.reduce((sum, m) => sum + (m.creditsOctroyes || 0), 0),
      volumeEpargne: validMonths.reduce((sum, m) => sum + (m.volumeEpargne || 0), 0)
    };
  }, [monthData]);

  // Données comparatives par pays
  const countryComparisonData = useMemo(() => {
    return COUNTRIES_DATA.filter(c => c.code !== 'ALL').map(c => {
      const data = generateData(c.code, 'all', selectedYear);
      const valid = data.filter(m => m.volumeEpargne !== null);
      return {
        ...c,
        volumeEpargne: valid.reduce((acc, m) => acc + (m.volumeEpargne || 0), 0),
        beneficiaires: valid.reduce((acc, m) => acc + (m.beneficiaires || 0), 0),
        creditsOctroyes: valid.reduce((acc, m) => acc + (m.creditsOctroyes || 0), 0)
      };
    });
  }, [selectedYear]);

  const formatCFA = (val) => val === null ? '-' : new Intl.NumberFormat('fr-FR').format(val) + ' CFA';
  const formatNum = (val) => val === null ? '-' : new Intl.NumberFormat('fr-FR').format(val);

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* EN-TÊTE ET LOGO BFT SUR FOND BLANC */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center bg-white px-3 py-1.5 rounded border border-slate-100">
              <span className="text-3xl font-black text-[#2A3447]">B</span>
              <span className="text-3xl font-black text-[#76C043]">F</span>
              <span className="text-3xl font-black text-[#2A3447]">T</span>
              <div className="h-7 w-[2px] bg-slate-300 mx-2"></div>
              <div className="text-[10px] font-bold text-[#2A3447] leading-tight uppercase tracking-wider">
                Banking and<br />Financial<br />Technologies
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#2A3447]">Portail Centralisé Multi-Plateformes</h1>
              <p className="text-xs text-slate-500">Supervision régionale des plateformes financières</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-[#76C043]" />
              <span>Dernière synchro : <strong>{lastSync}</strong></span>
            </div>

            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-2 bg-[#76C043] hover:bg-[#68b037] text-white font-medium px-4 py-2 rounded-lg text-sm shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Synchronisation...' : 'Actualiser'}
            </button>

            <div className="flex gap-1 border border-slate-200 rounded-lg p-1 bg-slate-50">
              <button title="Exporter en Excel" className="p-1.5 hover:bg-white rounded text-slate-600 transition">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              </button>
              <button title="Exporter en PDF" className="p-1.5 hover:bg-white rounded text-slate-600 transition">
                <FileText className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        </header>

        {/* FILTRES STRATÉGIQUES */}
        <section className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 1. Sélection du Pays */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#76C043]" />
                Pays
              </label>
              <select 
                value={selectedCountry}
                onChange={handleCountryChange}
                className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-[#76C043] focus:outline-none shadow-sm"
              >
                {COUNTRIES_DATA.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Sélection de la Plateforme (Filtrée selon le pays) */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#76C043]" />
                Plateforme / Institution
              </label>
              <select 
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-[#76C043] focus:outline-none shadow-sm"
              >
                {availablePlatforms.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* 3. Sélection de l'Année (2021 à 2026+) */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#76C043]" />
                Année
              </label>
              <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-300">
                {YEARS.map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setSelectedYear(yr)}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                      selectedYear === yr 
                        ? 'bg-[#76C043] text-white shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Commutateur de Vues */}
          <div className="flex border-t border-slate-200 pt-3 gap-2">
            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'table' ? 'bg-[#2A3447] text-white' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Table className="w-4 h-4" />
              Tableau Mensuel ({selectedYear})
            </button>
            <button
              onClick={() => setActiveTab('country_comparison')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'country_comparison' ? 'bg-[#2A3447] text-white' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <PieChart className="w-4 h-4" />
              Comparatif Régional des 5 Pays ({selectedYear})
            </button>
          </div>
        </section>

        {/* INDICATEURS KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-[#76C043]"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Volume d'Épargne Total</p>
                <h3 className="text-lg font-black text-slate-900 mt-1">{formatCFA(totals.volumeEpargne)}</h3>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg text-[#76C043]"><TrendingUp className="w-5 h-5" /></div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {COUNTRIES_DATA.find(c => c.code === selectedCountry)?.name} • {selectedYear}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Bénéficiaires Totaux</p>
                <h3 className="text-lg font-black text-slate-900 mt-1">{formatNum(totals.beneficiaires)}</h3>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Users className="w-5 h-5" /></div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Dont {formatNum(totals.beneficiairesFemmes)} Femmes</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Crédits Octroyés</p>
                <h3 className="text-lg font-black text-slate-900 mt-1">{formatNum(totals.creditsOctroyes)}</h3>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><CreditCard className="w-5 h-5" /></div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Sur {formatNum(totals.demandesCredit)} demandes</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Agents / TPE Actifs</p>
                <h3 className="text-lg font-black text-slate-900 mt-1">{formatNum(totals.agents)}</h3>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Building2 className="w-5 h-5" /></div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Moyenne du réseau</p>
          </div>
        </div>

        {/* TABLEAU MENSUEL */}
        {activeTab === 'table' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-[#2A3447] text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-[#76C043] uppercase tracking-widest">Année {selectedYear}</span>
                <h2 className="text-base font-bold">Tableau des Indicateurs statistiques</h2>
              </div>
              <div className="text-xs bg-slate-700/50 px-3 py-1.5 rounded-lg border border-slate-600">
                Plateforme : <span className="font-bold text-[#76C043]">
                  {availablePlatforms.find(p => p.id === selectedPlatform)?.name || 'Toutes'}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#76C043] text-white font-bold border-b border-emerald-600">
                    <th className="p-3 sticky left-0 bg-[#76C043] min-w-[200px] border-r border-emerald-600">INDICATEURS</th>
                    {MONTHS.map((m) => (
                      <th key={m} className="p-3 text-center min-w-[100px] border-r border-emerald-600/30">{m}</th>
                    ))}
                    <th className="p-3 text-center bg-emerald-800 min-w-[120px]">TOTAL / MOY.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr className="hover:bg-slate-50 transition">
                    <td className="p-3 font-semibold bg-slate-50 sticky left-0 border-r border-slate-200 text-slate-900">
                      Utilisateurs / TPE / agents de crédit
                    </td>
                    {monthData.map((m, i) => <td key={i} className="p-3 text-center border-r border-slate-100">{formatNum(m.agents)}</td>)}
                    <td className="p-3 text-center font-bold bg-slate-100 text-slate-900">{formatNum(totals.agents)}</td>
                  </tr>

                  <tr className="hover:bg-slate-50 transition">
                    <td className="p-3 font-semibold bg-slate-50 sticky left-0 border-r border-slate-200 text-slate-900">
                      Nombre de bénéficiaires totaux
                    </td>
                    {monthData.map((m, i) => <td key={i} className="p-3 text-center border-r border-slate-100">{formatNum(m.beneficiaires)}</td>)}
                    <td className="p-3 text-center font-bold bg-slate-100 text-slate-900">{formatNum(totals.beneficiaires)}</td>
                  </tr>

                  <tr className="hover:bg-slate-50 transition">
                    <td className="p-3 font-semibold bg-slate-50 sticky left-0 border-r border-slate-200 text-slate-900">
                      Nombre de bénéficiaires femmes
                    </td>
                    {monthData.map((m, i) => <td key={i} className="p-3 text-center border-r border-slate-100 text-slate-500">{formatNum(m.beneficiairesFemmes)}</td>)}
                    <td className="p-3 text-center font-bold bg-slate-100 text-slate-900">{formatNum(totals.beneficiairesFemmes)}</td>
                  </tr>

                  <tr className="hover:bg-slate-50 transition">
                    <td className="p-3 font-semibold bg-slate-50 sticky left-0 border-r border-slate-200 text-slate-900">
                      Nombre de plans épargne activés
                    </td>
                    {monthData.map((m, i) => <td key={i} className="p-3 text-center border-r border-slate-100">{formatNum(m.plansEpargne)}</td>)}
                    <td className="p-3 text-center font-bold bg-slate-100 text-slate-900">{formatNum(totals.plansEpargne)}</td>
                  </tr>

                  <tr className="hover:bg-slate-50 transition">
                    <td className="p-3 font-semibold bg-slate-50 sticky left-0 border-r border-slate-200 text-slate-900">
                      Nombre de demandes de crédit
                    </td>
                    {monthData.map((m, i) => <td key={i} className="p-3 text-center border-r border-slate-100">{formatNum(m.demandesCredit)}</td>)}
                    <td className="p-3 text-center font-bold bg-slate-100 text-slate-900">{formatNum(totals.demandesCredit)}</td>
                  </tr>

                  <tr className="hover:bg-slate-50 transition">
                    <td className="p-3 font-semibold bg-slate-50 sticky left-0 border-r border-slate-200 text-slate-900">
                      Nombre de crédits octroyés
                    </td>
                    {monthData.map((m, i) => <td key={i} className="p-3 text-center border-r border-slate-100 text-emerald-700 font-medium">{formatNum(m.creditsOctroyes)}</td>)}
                    <td className="p-3 text-center font-bold bg-slate-100 text-slate-900">{formatNum(totals.creditsOctroyes)}</td>
                  </tr>

                  <tr className="bg-emerald-50/50 hover:bg-emerald-50 transition font-bold">
                    <td className="p-3 bg-emerald-100/80 sticky left-0 border-r border-slate-200 text-slate-900">
                      Volume d'épargne (CFA)
                    </td>
                    {monthData.map((m, i) => <td key={i} className="p-3 text-center border-r border-slate-200 text-slate-900 text-[11px]">{formatCFA(m.volumeEpargne)}</td>)}
                    <td className="p-3 text-center font-black bg-emerald-600 text-white text-[11px]">{formatCFA(totals.volumeEpargne)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VUE COMPARATIVE REGIONALE */}
        {activeTab === 'country_comparison' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#2A3447]">Performance Régionale par Pays ({selectedYear})</h2>
              <p className="text-xs text-slate-500">Comparaison des indicateurs consolidés</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {countryComparisonData.map((c) => (
                <div key={c.code} className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center space-y-2">
                  <div className="text-3xl">{c.flag}</div>
                  <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                  <div className="text-[10px] text-slate-500">
                    {c.platforms.filter(p => !p.id.startsWith('all_')).map(p => p.name).join(', ')}
                  </div>
                  <div className="pt-2 border-t border-slate-200 text-left space-y-1 text-xs">
                    <p><span className="text-slate-500">Volume :</span> <strong className="block text-emerald-700">{formatCFA(c.volumeEpargne)}</strong></p>
                    <p><span className="text-slate-500">Bénéficiaires :</span> <strong className="block">{formatNum(c.beneficiaires)}</strong></p>
                    <p><span className="text-slate-500">Crédits octroyés :</span> <strong className="block">{formatNum(c.creditsOctroyes)}</strong></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}