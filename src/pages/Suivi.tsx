import { useState, useMemo } from 'react';
import { useBody } from '../context/BodyContext';
import { MeasurementType } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { darkTooltipStyle } from '../utils/calcUtils';

type Tab = 'poids' | 'mensurations' | 'wellness';

const MEASUREMENT_LABELS: Record<MeasurementType, string> = {
  bras: 'Tour de bras',
  cuisses: 'Tour de cuisses',
  poitrine: 'Tour de poitrine',
  taille: 'Tour de taille',
  mollets: 'Tour de mollets',
  cou: 'Tour de cou',
};

const MEASUREMENT_TYPES: MeasurementType[] = ['bras', 'cuisses', 'poitrine', 'taille', 'mollets', 'cou'];

export default function Suivi() {
  const {
    bodyWeights, measurements, wellness,
    addBodyWeight, deleteBodyWeight,
    addMeasurement, deleteMeasurement,
    addWellness, deleteWellness,
  } = useBody();

  const [activeTab, setActiveTab] = useState<Tab>('poids');

  // --- Poids ---
  const [weightDate, setWeightDate] = useState(new Date().toISOString().split('T')[0]);
  const [weightValue, setWeightValue] = useState('');

  const weightChartData = useMemo(() => {
    return [...bodyWeights]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(bw => ({
        date: new Date(bw.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        fullDate: new Date(bw.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
        poids: bw.weight,
      }));
  }, [bodyWeights]);

  const weightStats = useMemo(() => {
    if (bodyWeights.length === 0) return null;
    const sorted = [...bodyWeights].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const current = sorted[0].weight;
    const min = Math.min(...bodyWeights.map(bw => bw.weight));
    const max = Math.max(...bodyWeights.map(bw => bw.weight));

    // Delta 30 jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const oldEntry = sorted.find(bw => new Date(bw.date) <= thirtyDaysAgo);
    const delta30 = oldEntry ? current - oldEntry.weight : null;

    return { current, min, max, delta30 };
  }, [bodyWeights]);

  const handleAddWeight = async () => {
    const w = parseFloat(weightValue);
    if (!w || w <= 0) return;
    await addBodyWeight(weightDate, w);
    setWeightValue('');
  };

  // --- Mensurations ---
  const [measDate, setMeasDate] = useState(new Date().toISOString().split('T')[0]);
  const [measType, setMeasType] = useState<MeasurementType>('bras');
  const [measValue, setMeasValue] = useState('');
  const [selectedMeasType, setSelectedMeasType] = useState<MeasurementType>('bras');

  const measChartData = useMemo(() => {
    return measurements
      .filter(m => m.type === selectedMeasType)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(m => ({
        date: new Date(m.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        fullDate: new Date(m.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
        valeur: m.value,
      }));
  }, [measurements, selectedMeasType]);

  const filteredMeasurements = useMemo(() => {
    return measurements
      .filter(m => m.type === selectedMeasType)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [measurements, selectedMeasType]);

  const handleAddMeasurement = async () => {
    const v = parseFloat(measValue);
    if (!v || v <= 0) return;
    await addMeasurement(measDate, measType, v);
    setMeasValue('');
  };

  // --- Bien-être ---
  const [wellDate, setWellDate] = useState(new Date().toISOString().split('T')[0]);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [muscleSoreness, setMuscleSoreness] = useState(3);
  const [wellNotes, setWellNotes] = useState('');

  const wellnessChartData = useMemo(() => {
    return [...wellness]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(w => ({
        date: new Date(w.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        fullDate: new Date(w.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
        sommeil: w.sleepQuality,
        energie: w.energyLevel,
        courbatures: w.muscleSoreness,
      }));
  }, [wellness]);

  const handleAddWellness = async () => {
    await addWellness({
      date: wellDate,
      sleepQuality,
      energyLevel,
      muscleSoreness,
      notes: wellNotes || undefined,
    });
    setWellNotes('');
  };

  // Rating component (boutons ronds 1-5)
  const RatingButtons = ({ value, onChange, color }: { value: number; onChange: (v: number) => void; color: string }) => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
            n <= value ? `${color} text-white` : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: 'poids', label: 'Poids' },
    { key: 'mensurations', label: 'Mensurations' },
    { key: 'wellness', label: 'Bien-être' },
  ];

  return (
    <div className="space-y-4 pb-6">
      <h1 className="text-2xl font-bold text-white">Suivi du corps</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-primary-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB POIDS */}
      {activeTab === 'poids' && (
        <>
          <Card>
            <h2 className="text-lg font-semibold text-white mb-3">Ajouter un poids</h2>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs text-gray-400 mb-1 block">Date</label>
                <input
                  type="date"
                  value={weightDate}
                  onChange={(e) => setWeightDate(e.target.value)}
                  className="input w-full text-sm py-2"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-400 mb-1 block">Poids (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightValue}
                  onChange={(e) => setWeightValue(e.target.value)}
                  className="input w-full text-sm py-2"
                  placeholder="85.0"
                />
              </div>
              <Button onClick={handleAddWeight} size="md">Ajouter</Button>
            </div>
          </Card>

          {/* Stats */}
          {weightStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Card className="text-center !p-3">
                <div className="text-xl font-bold text-green-400">{weightStats.current} kg</div>
                <div className="text-xs text-gray-400">Actuel</div>
              </Card>
              <Card className="text-center !p-3">
                <div className="text-xl font-bold text-blue-400">{weightStats.min} kg</div>
                <div className="text-xs text-gray-400">Min</div>
              </Card>
              <Card className="text-center !p-3">
                <div className="text-xl font-bold text-red-400">{weightStats.max} kg</div>
                <div className="text-xs text-gray-400">Max</div>
              </Card>
              <Card className="text-center !p-3">
                <div className={`text-xl font-bold ${
                  weightStats.delta30 !== null
                    ? weightStats.delta30 >= 0 ? 'text-yellow-400' : 'text-green-400'
                    : 'text-gray-500'
                }`}>
                  {weightStats.delta30 !== null ? `${weightStats.delta30 >= 0 ? '+' : ''}${weightStats.delta30.toFixed(1)} kg` : '-'}
                </div>
                <div className="text-xs text-gray-400">Delta 30j</div>
              </Card>
            </div>
          )}

          {/* Graphique */}
          {weightChartData.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-white mb-4">Évolution du poids</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip
                      contentStyle={darkTooltipStyle}
                      labelFormatter={(_, payload) => payload[0]?.payload?.fullDate || ''}
                      formatter={(value: unknown) => [`${value} kg`, 'Poids']}
                    />
                    <Line type="monotone" dataKey="poids" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Liste récente */}
          {bodyWeights.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-white mb-3">Historique récent</h2>
              <div className="space-y-2">
                {[...bodyWeights]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map(bw => (
                    <div key={bw.id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                      <div>
                        <span className="text-gray-300 font-medium">{bw.weight} kg</span>
                        <span className="text-gray-500 text-sm ml-3">
                          {new Date(bw.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteBodyWeight(bw.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* TAB MENSURATIONS */}
      {activeTab === 'mensurations' && (
        <>
          <Card>
            <h2 className="text-lg font-semibold text-white mb-3">Ajouter une mensuration</h2>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Date</label>
                <input
                  type="date"
                  value={measDate}
                  onChange={(e) => setMeasDate(e.target.value)}
                  className="input w-full text-sm py-2"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Type</label>
                <select
                  value={measType}
                  onChange={(e) => setMeasType(e.target.value as MeasurementType)}
                  className="input w-full text-sm py-2"
                >
                  {MEASUREMENT_TYPES.map(t => (
                    <option key={t} value={t}>{MEASUREMENT_LABELS[t]}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs text-gray-400 mb-1 block">Valeur (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={measValue}
                  onChange={(e) => setMeasValue(e.target.value)}
                  className="input w-full text-sm py-2"
                  placeholder="40.0"
                />
              </div>
              <Button onClick={handleAddMeasurement} size="md">Ajouter</Button>
            </div>
          </Card>

          {/* Filtre type pour graphique */}
          <div className="flex flex-wrap gap-2">
            {MEASUREMENT_TYPES.map(t => (
              <button
                key={t}
                onClick={() => setSelectedMeasType(t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedMeasType === t
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {MEASUREMENT_LABELS[t]}
              </button>
            ))}
          </div>

          {/* Graphique */}
          {measChartData.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-white mb-4">{MEASUREMENT_LABELS[selectedMeasType]}</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={measChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip
                      contentStyle={darkTooltipStyle}
                      labelFormatter={(_, payload) => payload[0]?.payload?.fullDate || ''}
                      formatter={(value: unknown) => [`${value} cm`, MEASUREMENT_LABELS[selectedMeasType]]}
                    />
                    <Line type="monotone" dataKey="valeur" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Liste récente */}
          {filteredMeasurements.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-white mb-3">Historique - {MEASUREMENT_LABELS[selectedMeasType]}</h2>
              <div className="space-y-2">
                {filteredMeasurements.slice(0, 10).map(m => (
                  <div key={m.id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                    <div>
                      <span className="text-gray-300 font-medium">{m.value} cm</span>
                      <span className="text-gray-500 text-sm ml-3">
                        {new Date(m.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteMeasurement(m.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors p-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* TAB BIEN-ÊTRE */}
      {activeTab === 'wellness' && (
        <>
          <Card>
            <h2 className="text-lg font-semibold text-white mb-3">Journal du jour</h2>
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-1 block">Date</label>
              <input
                type="date"
                value={wellDate}
                onChange={(e) => setWellDate(e.target.value)}
                className="input w-full text-sm py-2"
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Qualité du sommeil</label>
                <RatingButtons value={sleepQuality} onChange={setSleepQuality} color="bg-blue-500" />
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Niveau d'énergie</label>
                <RatingButtons value={energyLevel} onChange={setEnergyLevel} color="bg-green-500" />
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Courbatures</label>
                <RatingButtons value={muscleSoreness} onChange={setMuscleSoreness} color="bg-red-500" />
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Notes</label>
                <textarea
                  value={wellNotes}
                  onChange={(e) => setWellNotes(e.target.value)}
                  className="input w-full text-sm resize-none"
                  rows={2}
                  placeholder="Ressenti général, douleurs, stress..."
                />
              </div>
            </div>

            <div className="mt-4">
              <Button onClick={handleAddWellness} className="w-full">Enregistrer</Button>
            </div>
          </Card>

          {/* Graphique */}
          {wellnessChartData.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-white mb-4">Évolution bien-être</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={wellnessChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                    <Tooltip
                      contentStyle={darkTooltipStyle}
                      labelFormatter={(_, payload) => payload[0]?.payload?.fullDate || ''}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="sommeil" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} name="Sommeil" />
                    <Line type="monotone" dataKey="energie" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} name="Énergie" />
                    <Line type="monotone" dataKey="courbatures" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 3 }} name="Courbatures" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Liste récente */}
          {wellness.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-white mb-3">Historique récent</h2>
              <div className="space-y-2">
                {[...wellness]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map(w => (
                    <div key={w.id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                      <div className="flex-1">
                        <div className="text-sm text-gray-400 mb-1">
                          {new Date(w.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          <span className="text-blue-400">Sommeil: {w.sleepQuality}/5</span>
                          <span className="text-green-400">Énergie: {w.energyLevel}/5</span>
                          <span className="text-red-400">Courbatures: {w.muscleSoreness}/5</span>
                        </div>
                        {w.notes && <p className="text-xs text-gray-500 mt-1">{w.notes}</p>}
                      </div>
                      <button
                        onClick={() => deleteWellness(w.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1 ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
