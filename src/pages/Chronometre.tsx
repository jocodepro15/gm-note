import { useState, useEffect, useRef } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const presetTimes = [
  { label: '30s', seconds: 30 },
  { label: '1:00', seconds: 60 },
  { label: '1:30', seconds: 90 },
  { label: '2:00', seconds: 120 },
  { label: '2:30', seconds: 150 },
  { label: '3:00', seconds: 180 },
  { label: '4:00', seconds: 240 },
  { label: '5:00', seconds: 300 },
];

export default function Chronometre() {
  const [timeLeft, setTimeLeft] = useState(90);
  const [initialTime, setInitialTime] = useState(90);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(0);
  const [customSeconds, setCustomSeconds] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setIsFinished(true);
      playNotification();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const playNotification = () => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;

      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        const osc2 = audioContext.createOscillator();
        osc2.connect(gainNode);
        osc2.frequency.value = 1000;
        osc2.type = 'sine';
        osc2.start();
        setTimeout(() => osc2.stop(), 200);
      }, 200);
    } catch {
      console.log('Timer terminé !');
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const selectPreset = (seconds: number) => {
    setTimeLeft(seconds);
    setInitialTime(seconds);
    setIsRunning(false);
    setIsFinished(false);
  };

  const applyCustomTime = () => {
    const totalSeconds = (customMinutes * 60) + customSeconds;
    if (totalSeconds > 0) {
      setTimeLeft(totalSeconds);
      setInitialTime(totalSeconds);
      setIsRunning(false);
      setIsFinished(false);
    }
  };

  const toggleTimer = () => {
    if (isFinished) {
      setTimeLeft(initialTime);
      setIsFinished(false);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setTimeLeft(initialTime);
    setIsRunning(false);
    setIsFinished(false);
  };

  const progressPercent = ((initialTime - timeLeft) / initialTime) * 100;

  const getTimerColor = () => {
    if (isFinished) return 'text-green-400';
    if (timeLeft <= 10) return 'text-red-400';
    if (timeLeft <= 30) return 'text-orange-400';
    return 'text-gray-100';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-100">Chronomètre</h1>

      <Card className={`text-center ${isFinished ? 'bg-green-900/30 border-green-600' : ''}`}>
        <div className={`text-7xl font-bold mb-6 font-mono ${getTimerColor()}`}>
          {formatTime(timeLeft)}
        </div>

        <div className="w-full h-3 bg-gray-700 rounded-full mb-6 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              isFinished ? 'bg-green-500' : timeLeft <= 10 ? 'bg-red-500' : 'bg-primary-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {isFinished && (
          <div className="text-green-400 font-semibold mb-4 text-lg">
            Repos terminé ! C'est reparti !
          </div>
        )}

        <div className="flex justify-center gap-4">
          <Button
            onClick={toggleTimer}
            size="lg"
            variant={isRunning ? 'secondary' : 'primary'}
            className="w-32"
          >
            {isRunning ? 'Pause' : isFinished ? 'Relancer' : 'Démarrer'}
          </Button>
          <Button onClick={resetTimer} variant="secondary" size="lg">
            Reset
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Temps de repos</h2>
        <div className="grid grid-cols-4 gap-3">
          {presetTimes.map((preset) => (
            <button
              key={preset.seconds}
              onClick={() => selectPreset(preset.seconds)}
              className={`py-3 px-4 rounded-xl font-medium text-lg transition-colors ${
                initialTime === preset.seconds
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Temps personnalisé</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={customMinutes || ''}
              onChange={(e) => setCustomMinutes(Math.max(0, parseInt(e.target.value) || 0))}
              className="input w-20 text-center text-lg py-2"
              placeholder="0"
              min="0"
              max="120"
            />
            <span className="text-gray-400 font-medium">min</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={customSeconds || ''}
              onChange={(e) => setCustomSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
              className="input w-20 text-center text-lg py-2"
              placeholder="0"
              min="0"
              max="59"
            />
            <span className="text-gray-400 font-medium">sec</span>
          </div>
          <Button onClick={applyCustomTime} className="ml-2">
            Appliquer
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Ex: 60 min pour chronométrer ta séance complète
        </p>
      </Card>

      <Card className="bg-gray-900">
        <h2 className="text-sm font-semibold text-gray-300 mb-2">Rappel</h2>
        <div className="space-y-1 text-sm text-gray-400">
          <div className="flex justify-between">
            <span>Force pure (1-5 reps)</span>
            <span className="font-medium text-gray-300">3-5 min</span>
          </div>
          <div className="flex justify-between">
            <span>Hypertrophie (6-12 reps)</span>
            <span className="font-medium text-gray-300">1:30-2:30</span>
          </div>
          <div className="flex justify-between">
            <span>Endurance (15+ reps)</span>
            <span className="font-medium text-gray-300">30-60s</span>
          </div>
        </div>
      </Card>

      <audio ref={audioRef} />
    </div>
  );
}
