import { useState } from 'react';
import Card from '../components/ui/Card';

const percentages = [95, 90, 85, 80, 75, 70, 65, 60, 55, 50];

export default function Calculatrice() {
  const [rm, setRm] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(80);

  const calculatedWeight = rm > 0 ? Math.round((rm * percentage) / 100 * 10) / 10 : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-100">Calculatrice</h1>

      {/* Calculateur principal */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-100 mb-4">
          Calcul du pourcentage de RM
        </h2>

        <div className="space-y-4">
          {/* Input RM */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Votre 1RM (kg)
            </label>
            <input
              type="number"
              value={rm || ''}
              onChange={(e) => setRm(parseFloat(e.target.value) || 0)}
              className="input text-lg"
              placeholder="Ex: 100"
            />
          </div>

          {/* Input Pourcentage */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Pourcentage souhaité
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={percentage || ''}
                onChange={(e) => setPercentage(parseFloat(e.target.value) || 0)}
                className="input text-lg w-24"
                min="1"
                max="100"
              />
              <span className="text-gray-400">%</span>
            </div>
          </div>

          {/* Boutons rapides */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Raccourcis
            </label>
            <div className="flex flex-wrap gap-2">
              {percentages.map((p) => (
                <button
                  key={p}
                  onClick={() => setPercentage(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    percentage === p
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          {/* Résultat */}
          <div className="mt-6 p-4 bg-primary-900/30 border border-primary-600 rounded-xl">
            <div className="text-sm text-primary-400 mb-1">Charge à utiliser</div>
            <div className="text-4xl font-bold text-primary-300">
              {calculatedWeight > 0 ? `${calculatedWeight} kg` : '— kg'}
            </div>
            {rm > 0 && percentage > 0 && (
              <div className="text-sm text-primary-500 mt-1">
                {percentage}% de {rm} kg
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Tableau de référence rapide */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-100 mb-3">
          Tableau de référence
        </h2>
        {rm > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 px-2 font-semibold text-gray-300">%</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-300">Charge</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-300">Reps</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-300">Objectif</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700 bg-red-900/20">
                  <td className="py-2 px-2 font-medium text-gray-200">95%</td>
                  <td className="py-2 px-2 font-bold text-gray-100">{Math.round(rm * 0.95 * 10) / 10} kg</td>
                  <td className="py-2 px-2 text-gray-300">1-2</td>
                  <td className="py-2 px-2 text-xs text-red-400">Force max</td>
                </tr>
                <tr className="border-b border-gray-700 bg-red-900/20">
                  <td className="py-2 px-2 font-medium text-gray-200">90%</td>
                  <td className="py-2 px-2 font-bold text-gray-100">{Math.round(rm * 0.90 * 10) / 10} kg</td>
                  <td className="py-2 px-2 text-gray-300">2-3</td>
                  <td className="py-2 px-2 text-xs text-red-400">Force pure</td>
                </tr>
                <tr className="border-b border-gray-700 bg-orange-900/20">
                  <td className="py-2 px-2 font-medium text-gray-200">85%</td>
                  <td className="py-2 px-2 font-bold text-gray-100">{Math.round(rm * 0.85 * 10) / 10} kg</td>
                  <td className="py-2 px-2 text-gray-300">4-5</td>
                  <td className="py-2 px-2 text-xs text-orange-400">Force</td>
                </tr>
                <tr className="border-b border-gray-700 bg-orange-900/20">
                  <td className="py-2 px-2 font-medium text-gray-200">80%</td>
                  <td className="py-2 px-2 font-bold text-gray-100">{Math.round(rm * 0.80 * 10) / 10} kg</td>
                  <td className="py-2 px-2 text-gray-300">6-7</td>
                  <td className="py-2 px-2 text-xs text-orange-400">Force + Hypertrophie</td>
                </tr>
                <tr className="border-b border-gray-700 bg-yellow-900/20">
                  <td className="py-2 px-2 font-medium text-gray-200">75%</td>
                  <td className="py-2 px-2 font-bold text-gray-100">{Math.round(rm * 0.75 * 10) / 10} kg</td>
                  <td className="py-2 px-2 text-gray-300">8-10</td>
                  <td className="py-2 px-2 text-xs text-yellow-400">Hypertrophie</td>
                </tr>
                <tr className="border-b border-gray-700 bg-yellow-900/20">
                  <td className="py-2 px-2 font-medium text-gray-200">70%</td>
                  <td className="py-2 px-2 font-bold text-gray-100">{Math.round(rm * 0.70 * 10) / 10} kg</td>
                  <td className="py-2 px-2 text-gray-300">10-12</td>
                  <td className="py-2 px-2 text-xs text-yellow-400">Hypertrophie</td>
                </tr>
                <tr className="border-b border-gray-700 bg-green-900/20">
                  <td className="py-2 px-2 font-medium text-gray-200">65%</td>
                  <td className="py-2 px-2 font-bold text-gray-100">{Math.round(rm * 0.65 * 10) / 10} kg</td>
                  <td className="py-2 px-2 text-gray-300">12-15</td>
                  <td className="py-2 px-2 text-xs text-green-400">Endurance</td>
                </tr>
                <tr className="bg-green-900/20">
                  <td className="py-2 px-2 font-medium text-gray-200">60%</td>
                  <td className="py-2 px-2 font-bold text-gray-100">{Math.round(rm * 0.60 * 10) / 10} kg</td>
                  <td className="py-2 px-2 text-gray-300">15-20</td>
                  <td className="py-2 px-2 text-xs text-green-400">Endurance / Volume</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">
            Entrez votre 1RM ci-dessus pour voir le tableau de référence
          </p>
        )}
      </Card>

      {/* Estimation du 1RM */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-100 mb-3">
          Estimer son 1RM
        </h2>
        <p className="text-gray-400 text-sm mb-3">
          Si vous ne connaissez pas votre 1RM, vous pouvez l'estimer avec la formule d'Epley :
        </p>
        <div className="bg-gray-900 rounded-lg p-3 text-center">
          <code className="text-sm text-gray-200">
            1RM = Poids × (1 + Répétitions / 30)
          </code>
        </div>
        <p className="text-gray-500 text-xs mt-3">
          Exemple : Si vous faites 80 kg × 8 reps, votre 1RM estimé est ≈ 101 kg
        </p>
      </Card>
    </div>
  );
}
