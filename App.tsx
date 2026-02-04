import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Utensils, Dumbbell, ChevronLeft, ChevronRight, Plus, Trash2, 
  Settings, Clock, Check, Moon, Sun, Flame, 
  Play, Square, Timer, TrendingUp, BarChart3, X, Download, Upload, RefreshCw, Award, ArrowUpRight
} from 'lucide-react';
import { Button } from './components/ui/Button';
import { ProgressChart } from './components/ProgressChart';
import { Transaction, UserSettings, DayData } from './types';
import { calculateMonthData, formatTime, getMonthKey } from './utils';

// --- Composant Principal ---
export default function App() {
  
  // --- États ---
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fastfood_tracker_theme') === 'dark';
    }
    return false;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('fastfood_tracker_data_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('fastfood_tracker_settings_v3');
    if (saved) return JSON.parse(saved);
    return { 
      standardDuration: 60,
      schedule: [
        { dayIndex: 1, time: "18:00" },
        { dayIndex: 4, time: "19:00" }
      ]
    };
  });
  
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modales & Inputs
  const [activeModal, setActiveModal] = useState<'expense' | 'session' | 'settings' | 'timer' | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [sessionDuration, setSessionDuration] = useState('60');
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);

  // Timer
  const [timerState, setTimerState] = useState({
    isRunning: false,
    startTime: null as Date | null,
    elapsedSeconds: 0,
  });
  const timerIntervalRef = useRef<any>(null);

  const [tempSettings, setTempSettings] = useState(userSettings);

  // Référence pour l'import de fichier
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effets ---
  useEffect(() => {
    localStorage.setItem('fastfood_tracker_data_v2', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('fastfood_tracker_settings_v3', JSON.stringify(userSettings));
  }, [userSettings]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('fastfood_tracker_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('fastfood_tracker_theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    if (timerState.isRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerState(prev => ({ ...prev, elapsedSeconds: prev.elapsedSeconds + 1 }));
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [timerState.isRunning]);

  // --- Données Calculées ---
  const currentMonthData = useMemo(() => 
    calculateMonthData(transactions, currentDate, userSettings), 
    [transactions, currentDate, userSettings]
  );

  const currentMonthKey = getMonthKey(currentDate);

  // --- Génération du Calendrier ---
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: DayData[] = [];
    let startDay = firstDay.getDay() - 1; // 0=Dim, 1=Lun. On veut Lun=0.
    if (startDay === -1) startDay = 6;
    
    for (let i = 0; i < startDay; i++) {
      days.push({ day: null, date: '', isToday: false });
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dateObj = new Date(year, month, i);
      const dateStr = dateObj.toISOString().split('T')[0];
      // getDay: 0=Dim, 1=Lun. Ajustement pour correspondre aux settings (1=Lun..7=Dim)
      const dayOfWeek = dateObj.getDay() === 0 ? 7 : dateObj.getDay();
      
      const scheduleItem = userSettings.schedule.find(s => s.dayIndex === dayOfWeek);
      const session = currentMonthData.sessionsByDate[dateStr];
      
      days.push({
        day: i,
        date: dateStr,
        schedule: scheduleItem,
        isToday: dateStr === new Date().toISOString().split('T')[0],
        session: session
      });
    }
    return days;
  }, [currentDate, userSettings.schedule, currentMonthData.sessionsByDate]);

  // --- Handlers ---
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));

  const openExpenseModal = () => {
    setAmount('');
    setDescription('');
    const today = new Date();
    // Par défaut aujourd'hui si dans le mois courant, sinon le 1er du mois affiché
    const isCurrentMonth = getMonthKey(today) === currentMonthKey;
    setDateInput(isCurrentMonth ? today.toISOString().split('T')[0] : `${currentMonthKey}-01`);
    setActiveModal('expense');
  };

  const openSessionModal = (dateStr?: string) => {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    const existingSession = currentMonthData.sessionsByDate[targetDate];

    if (existingSession) {
      setEditingTransactionId(existingSession.id);
      setSessionDuration(existingSession.amount.toString());
      setDateInput(targetDate);
    } else {
      setEditingTransactionId(null);
      setSessionDuration(currentMonthData.suggestedDuration.toString());
      setDateInput(targetDate);
    }
    setActiveModal('session');
  };

  const startTimer = () => {
    setTimerState({
      isRunning: true,
      startTime: new Date(),
      elapsedSeconds: 0,
    });
    setActiveModal('timer');
  };

  const stopTimer = () => {
    setTimerState(prev => ({ ...prev, isRunning: false }));
    const finalMinutes = Math.floor(timerState.elapsedSeconds / 60);
    
    if (finalMinutes < 1) {
      alert("Séance trop courte (< 1 min) !");
      return;
    }

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      type: 'sport',
      amount: finalMinutes,
      targetStandard: userSettings.standardDuration,
      date: new Date().toISOString().split('T')[0],
      description: `Séance Chrono`
    };

    setTransactions(prev => [...prev, newTransaction]);
    setActiveModal(null);
  };

  const handleSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = parseInt(sessionDuration);
    if (!duration || duration <= 0) return;

    if (editingTransactionId) {
      setTransactions(prev => prev.map(t => 
        t.id === editingTransactionId ? { ...t, amount: duration, date: dateInput } : t
      ));
    } else {
      setTransactions(prev => [...prev, {
        id: crypto.randomUUID(),
        type: 'sport',
        amount: duration,
        targetStandard: userSettings.standardDuration,
        date: dateInput,
        description: `Saisie Manuelle`
      }]);
    }
    setActiveModal(null);
  };

  const handleDeleteSessionInModal = () => {
    if (editingTransactionId && window.confirm('Supprimer cette séance ?')) {
      setTransactions(prev => prev.filter(t => t.id !== editingTransactionId));
      setActiveModal(null);
    }
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !dateInput) return;
    setTransactions(prev => [...prev, {
      id: crypto.randomUUID(),
      type: 'expense',
      amount: parseFloat(amount),
      date: dateInput,
      description: description || 'Fast Food'
    }]);
    setActiveModal(null);
  };

  const toggleDayInSettings = (dayIndex: number) => {
    setTempSettings(prev => {
      const exists = prev.schedule.find(s => s.dayIndex === dayIndex);
      if (exists) {
        return { ...prev, schedule: prev.schedule.filter(s => s.dayIndex !== dayIndex) };
      }
      return { ...prev, schedule: [...prev.schedule, { dayIndex, time: "18:00" }] };
    });
  };

  const updateTimeInSettings = (dayIndex: number, time: string) => {
    setTempSettings(prev => {
      const newSchedule = prev.schedule.map(s => 
        s.dayIndex === dayIndex ? { ...s, time } : s
      );
      return { ...prev, schedule: newSchedule };
    });
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(transactions);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `fastfood-tracker-backup-${new Date().toISOString().slice(0,10)}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          if (event.target?.result) {
            const parsed = JSON.parse(event.target.result as string);
            if (Array.isArray(parsed)) {
              if(window.confirm(`${parsed.length} entrées trouvées. Écraser les données actuelles ?`)) {
                setTransactions(parsed);
                alert("Données importées avec succès !");
                setActiveModal(null);
              }
            } else {
              alert("Format de fichier invalide.");
            }
          }
        } catch (error) {
          alert("Erreur lors de la lecture du JSON.");
        }
      };
    }
  };

  const handleResetDebt = () => {
    if (window.confirm("Repartir à zéro ? Cela effacera l'historique passé pour supprimer la dette accumulée.")) {
      const firstDayOfCurrentMonth = `${getMonthKey(new Date())}-01`;
      setTransactions(prev => prev.filter(t => t.date >= firstDayOfCurrentMonth));
      setActiveModal(null);
    }
  }

  const isDebtFree = currentMonthData.remainingDebt === 0 && currentMonthData.accumulatedDebt <= 0;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'} pb-24 md:pb-10 selection:bg-blue-500 selection:text-white`}>
      
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-30 transition-all duration-500">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-orange-500 to-rose-600 p-2.5 rounded-xl text-white shadow-lg shadow-orange-500/20">
               <TrendingUp size={20} strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent leading-tight">
                Debt<span className="font-extrabold text-slate-900 dark:text-white">Tracker</span>
              </h1>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block -mt-0.5">FastFood Edition</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isDebtFree && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400/10 text-yellow-600 dark:text-yellow-400 rounded-full text-xs font-bold border border-yellow-400/20 animate-pulse">
                <Award size={14} fill="currentColor" />
                <span>Libre !</span>
              </div>
            )}
            
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-xs font-bold border border-orange-500/20">
              <Flame size={14} fill="currentColor" />
              <span>{currentMonthData.currentStreak} séries</span>
            </div>
            
            <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-full transition-all active:scale-95">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => { setTempSettings(userSettings); setActiveModal('settings'); }} className="p-2.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-full transition-all active:scale-95">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-500">

        {/* Month Navigation */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50">
          <button onClick={handlePrevMonth} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-600 dark:text-slate-400">
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold text-slate-800 dark:text-slate-200 capitalize text-lg">
            {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={handleNextMonth} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-600 dark:text-slate-400">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* --- DASHBOARD GRID --- */}
        <div className="grid grid-cols-2 gap-4">
          {/* Card: Debt/Expenses */}
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 relative overflow-hidden group transition-all duration-300 hover:shadow-md">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
              <Utensils size={100} />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Dépenses</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
                  {currentMonthData.currentExpensesTotal}
                </span>
                <span className="text-lg font-bold text-slate-400">€</span>
              </div>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1.5 rounded-lg border border-rose-100 dark:border-rose-500/20">
                <TrendingUp size={14} />
                <span>+{Math.ceil(currentMonthData.currentExpensesTotal)}m dette</span>
              </div>
            </div>
            <button 
              onClick={openExpenseModal}
              className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/30 transition-all active:scale-95"
            >
              <Plus size={24} strokeWidth={3} />
            </button>
          </div>

          {/* Card: Next Goal */}
          <div className={`rounded-[2rem] p-6 shadow-sm border relative overflow-hidden text-white transition-all duration-500 ${
            isDebtFree 
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400/50 shadow-emerald-500/20' 
            : 'bg-slate-800 dark:bg-blue-600 border-slate-700 dark:border-blue-500/50 dark:shadow-blue-500/10'
          }`}>
             <div className="absolute -bottom-6 -right-6 opacity-10 rotate-12">
               {isDebtFree ? <Award size={140} /> : <Timer size={140} />}
             </div>
             <div className="relative z-10 h-full flex flex-col justify-between">
               <div>
                 <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${isDebtFree ? 'text-emerald-100' : 'text-slate-300 dark:text-blue-100'}`}>Objectif</p>
                 <div className="flex items-baseline gap-1">
                   <span className="text-5xl font-black tracking-tight">
                     {currentMonthData.suggestedDuration}
                   </span>
                   <span className="text-lg font-bold opacity-60">min</span>
                 </div>
               </div>
               
               <div className="space-y-2 mt-4">
                  <div className={`flex items-center gap-2 text-xs font-medium ${isDebtFree ? 'text-emerald-50' : 'text-slate-300 dark:text-blue-100'}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                    Base : {userSettings.standardDuration} min
                  </div>
                  {currentMonthData.bonusPerSession > 0 && (
                    <div className="bg-white/10 backdrop-blur-sm px-2.5 py-1.5 rounded-lg text-xs font-bold w-fit border border-white/10 flex items-center gap-1.5">
                      <ArrowUpRight size={12} />
                      +{currentMonthData.bonusPerSession} min dette
                    </div>
                  )}
               </div>
             </div>
          </div>
        </div>

        {/* --- CALENDAR --- */}
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Clock size={16} /> Agenda & Suivi
            </h2>
            <Button variant="success" onClick={() => openSessionModal()} className="!py-1.5 !px-3 !text-xs !rounded-lg !h-auto">
              <Plus size={14} /> Ajouter Séance
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-y-4 gap-x-2">
            {['L','M','M','J','V','S','D'].map((d, i) => (
              <div key={i} className="text-center text-[10px] font-bold text-slate-300 dark:text-slate-600 mb-1">{d}</div>
            ))}
            
            {calendarDays.map((day, i) => {
              if (!day.day) return <div key={`empty-${i}`} />;
              
              const isDone = !!day.session;
              const isScheduled = !!day.schedule;
              const isToday = day.isToday;
              // Bonus calculation: amount > standard
              const bonusAmount = isDone && day.session 
                ? Math.max(0, day.session.amount - (day.session.targetStandard || userSettings.standardDuration)) 
                : 0;

              return (
                <button
                  key={day.date}
                  onClick={() => openSessionModal(day.date)}
                  className={`
                    relative aspect-[0.85] rounded-2xl flex flex-col items-center justify-center transition-all duration-300 group
                    ${isDone 
                      ? bonusAmount > 0 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      : isScheduled 
                        ? isToday 
                          ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 border-2 border-blue-500 dark:border-blue-400' 
                          : 'bg-slate-50 dark:bg-slate-700/30 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700'
                        : isToday
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-300 dark:text-slate-600'
                    }
                  `}
                >
                  <span className={`text-sm ${isDone || isToday ? 'font-bold' : 'font-medium'}`}>{day.day}</span>
                  
                  {isDone && (
                    <div className="mt-1 flex flex-col items-center">
                       <span className="text-[10px] font-bold leading-none">{day.session?.amount}</span>
                       {bonusAmount > 0 && <div className="w-1 h-1 bg-white rounded-full mt-1 opacity-80" />}
                    </div>
                  )}
                  
                  {!isDone && isScheduled && (
                    <div className={`absolute bottom-1.5 text-[9px] font-bold opacity-80 ${isToday ? 'text-blue-700 dark:text-blue-300' : 'text-slate-400 dark:text-slate-500'}`}>
                      {day.schedule?.time}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* --- CHART --- */}
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
           <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <BarChart3 size={16} /> Évolution Dette
              </h2>
              <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400">
                 Net : {Math.round(currentMonthData.remainingDebt)} min restants
              </span>
           </div>
           <ProgressChart 
              transactions={transactions} 
              currentDate={currentDate} 
              standardDuration={userSettings.standardDuration} 
           />
        </div>

        {/* --- HISTORY LIST --- */}
        <div className="space-y-4 pb-8">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Activité Récente</h2>
          {currentMonthData.history.length === 0 ? (
            <div className="text-center py-12 opacity-40 text-sm italic">Aucune activité ce mois-ci.</div>
          ) : (
            currentMonthData.history.map(item => (
              <div key={item.id} className="group bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between transition-all hover:shadow-md hover:border-slate-200 dark:hover:border-slate-600">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    item.type === 'expense' 
                      ? 'bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400' 
                      : 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400'
                  }`}>
                    {item.type === 'expense' ? <Utensils size={20} /> : <Dumbbell size={20} />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{item.description}</div>
                    <div className="text-xs font-medium text-slate-400 capitalize">
                      {new Date(item.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className={`block font-black text-lg ${item.type === 'expense' ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {item.type === 'expense' ? `-${item.amount.toFixed(2)}€` : `+${item.amount}m`}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                       if(confirm('Supprimer cet élément ?')) setTransactions(t => t.filter(x => x.id !== item.id));
                    }}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 md:opacity-0"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </main>

      {/* --- FLOATING ACTION BUTTON FOR TIMER --- */}
      <div className="fixed bottom-6 right-6 z-20 md:hidden">
        <button 
          onClick={startTimer}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl shadow-blue-600/30 flex items-center justify-center active:scale-90 transition-transform"
        >
          <Play size={24} fill="currentColor" className="ml-1" />
        </button>
      </div>

      {/* --- MODALS --- */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setActiveModal(null)} />
          
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md md:rounded-[2rem] rounded-t-[2rem] p-6 shadow-2xl animate-[slideIn_0.3s_ease-out] border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {activeModal === 'expense' && 'Ajouter Dépense'}
                {activeModal === 'session' && 'Enregistrer Séance'}
                {activeModal === 'settings' && 'Paramètres'}
                {activeModal === 'timer' && 'Chrono en Cours'}
              </h2>
              <button onClick={() => setActiveModal(null)} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* EXPENSE FORM */}
            {activeModal === 'expense' && (
              <form onSubmit={handleExpenseSubmit} className="space-y-8">
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Montant (€)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        autoFocus
                        required
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="w-full text-5xl font-black bg-transparent border-b-2 border-slate-100 dark:border-slate-800 focus:border-rose-500 outline-none py-2 text-slate-900 dark:text-white placeholder:text-slate-200 dark:placeholder:text-slate-800 transition-colors"
                        placeholder="0.00"
                      />
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xl">EUR</span>
                    </div>
                 </div>
                 <Button type="submit" variant="danger" className="w-full py-4 text-lg rounded-2xl shadow-xl shadow-rose-500/20">
                   Ajouter la Dépense
                 </Button>
              </form>
            )}

            {/* SESSION FORM */}
            {activeModal === 'session' && (
              <form onSubmit={handleSessionSubmit} className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-700/50">
                  <span className="text-slate-500 font-medium">Date</span>
                  <input 
                    type="date" 
                    value={dateInput}
                    onChange={e => setDateInput(e.target.value)}
                    className="bg-transparent font-bold text-slate-900 dark:text-white outline-none text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Durée (minutes)</label>
                  <div className="flex items-center gap-4">
                     <button type="button" onClick={() => setSessionDuration(d => String(Math.max(0, parseInt(d)-5)))} className="p-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-300 transition-colors">-5</button>
                     <input
                      type="number"
                      required
                      value={sessionDuration}
                      onChange={e => setSessionDuration(e.target.value)}
                      className="flex-1 text-center text-5xl font-black bg-transparent border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3 focus:border-emerald-500 outline-none text-slate-900 dark:text-white transition-colors"
                    />
                    <button type="button" onClick={() => setSessionDuration(d => String(parseInt(d)+5))} className="p-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-300 transition-colors">+5</button>
                  </div>
                </div>

                <div className="text-center py-2">
                  {parseInt(sessionDuration) > userSettings.standardDuration ? (
                     <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                       <TrendingUp size={18} /> 
                       <span className="font-bold">Rembourse {parseInt(sessionDuration) - userSettings.standardDuration} min de dette !</span>
                     </div>
                  ) : (
                    <p className="text-slate-400 text-sm font-medium">Séance standard (pas de remboursement)</p>
                  )}
                </div>

                <div className="flex gap-3">
                   {!editingTransactionId && (
                      <Button type="button" variant="secondary" onClick={startTimer} className="flex-1 rounded-2xl">
                        <Play size={18} /> Chrono
                      </Button>
                   )}
                   <Button type="submit" variant="success" className="flex-[2] py-4 text-lg rounded-2xl shadow-xl shadow-emerald-500/20">
                     {editingTransactionId ? 'Modifier' : 'Valider'}
                   </Button>
                </div>
                
                {editingTransactionId && (
                  <button 
                    type="button" 
                    onClick={handleDeleteSessionInModal}
                    className="w-full text-sm text-rose-500 hover:text-rose-600 font-bold py-2 transition-colors"
                  >
                    Supprimer la séance
                  </button>
                )}
              </form>
            )}

            {/* TIMER MODAL */}
            {activeModal === 'timer' && (
              <div className="flex flex-col items-center py-6">
                <div className="relative w-72 h-72 flex items-center justify-center mb-10">
                  {/* Decorative rings */}
                  <div className="absolute inset-0 border-[6px] border-slate-100 dark:border-slate-800 rounded-full" />
                  <div className="absolute inset-0 border-[6px] border-t-emerald-500 border-r-emerald-500 border-b-transparent border-l-transparent rounded-full animate-spin [animation-duration:3s]" />
                  
                  <div className="text-center z-10">
                    <div className="text-7xl font-black tabular-nums text-slate-900 dark:text-white tracking-tighter">
                      {formatTime(timerState.elapsedSeconds)}
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Temps Écoulé</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full mb-8">
                   <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-700/50">
                     <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Standard</div>
                     <div className="text-xl font-black text-slate-700 dark:text-slate-200">{userSettings.standardDuration}m</div>
                   </div>
                   <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-2xl text-center border border-emerald-100 dark:border-emerald-500/20">
                     <div className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-wider mb-1">Objectif</div>
                     <div className="text-xl font-black text-emerald-700 dark:text-emerald-300">{currentMonthData.suggestedDuration}m</div>
                   </div>
                </div>

                <Button onClick={stopTimer} variant="danger" className="w-full py-5 text-xl rounded-2xl shadow-xl shadow-rose-500/20">
                  <Square fill="currentColor" size={20} /> Arrêter & Sauvegarder
                </Button>
              </div>
            )}

            {/* SETTINGS FORM */}
            {activeModal === 'settings' && (
              <form onSubmit={(e) => { e.preventDefault(); setUserSettings(tempSettings); setActiveModal(null); }} className="space-y-8">
                 
                 {/* Standard Duration */}
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Séance Standard (min)</label>
                    <input 
                      type="number" 
                      value={tempSettings.standardDuration}
                      onChange={e => setTempSettings({...tempSettings, standardDuration: parseInt(e.target.value)})}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-black text-slate-900 dark:text-white focus:ring-2 ring-blue-500 outline-none text-xl border border-transparent focus:border-transparent transition-all"
                    />
                 </div>
                 
                 {/* Weekly Schedule */}
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Semaine Type</label>
                    <div className="space-y-2">
                      {['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'].map((day, i) => {
                         const dayIndex = i + 1;
                         const scheduleItem = tempSettings.schedule.find(s => s.dayIndex === dayIndex);
                         const isSelected = !!scheduleItem;

                         return (
                           <div key={i} className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${isSelected ? 'bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-750'}`} onClick={() => toggleDayInSettings(dayIndex)}>
                             <div className={`flex items-center gap-3 font-bold text-sm ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-400'}`}>
                               <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800'}`}>
                                 {isSelected && <Check size={14} strokeWidth={4} />}
                               </div>
                               {day}
                             </div>

                             {isSelected ? (
                               <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                 <Clock size={14} className="text-blue-500" />
                                 <input 
                                    type="time" 
                                    value={scheduleItem.time}
                                    onChange={(e) => updateTimeInSettings(dayIndex, e.target.value)}
                                    className="bg-transparent font-bold text-slate-700 dark:text-slate-200 outline-none p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50"
                                 />
                               </div>
                             ) : (
                               <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-wider px-2">Repos</span>
                             )}
                           </div>
                         )
                      })}
                    </div>
                 </div>

                 {/* Data Management */}
                 <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Données</label>
                    <div className="grid grid-cols-2 gap-3">
                       <Button type="button" variant="secondary" onClick={handleExportData} className="text-sm rounded-xl h-12">
                          <Download size={16} /> Exporter
                       </Button>
                       <div className="relative">
                          <Button type="button" variant="secondary" className="text-sm w-full rounded-xl h-12" onClick={() => fileInputRef.current?.click()}>
                              <Upload size={16} /> Importer
                          </Button>
                          <input 
                            ref={fileInputRef}
                            type="file" 
                            accept=".json" 
                            className="hidden" 
                            onChange={handleImportData}
                          />
                       </div>
                    </div>
                 </div>
                 
                 {/* Reset */}
                 <div>
                    <button 
                      type="button" 
                      onClick={handleResetDebt} 
                      className="w-full text-xs text-rose-400 hover:text-rose-500 py-3 flex items-center justify-center gap-2 font-medium transition-colors hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl"
                    >
                      <RefreshCw size={14} /> Réinitialiser l'historique (Effacer la dette passée)
                    </button>
                 </div>

                 <Button type="submit" variant="primary" className="w-full py-4 text-lg rounded-2xl shadow-lg shadow-blue-500/20">Sauvegarder</Button>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
}