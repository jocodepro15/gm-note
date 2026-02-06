import Card from '../components/ui/Card';

export default function Informations() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-100">Informations</h1>

      {/* Section RIR */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-100 mb-3">
          RIR (Répétitions en Réserve)
        </h2>
        <div className="space-y-3 text-gray-300">
          <p>
            Le RIR indique combien de répétitions supplémentaires vous auriez pu faire
            après votre dernière répétition.
          </p>
          <div className="bg-green-900/30 border border-green-600 rounded-lg p-3">
            <p className="font-medium text-green-400 mb-1">Recommandation générale</p>
            <p className="text-green-300 text-sm">
              Essayez de garder <strong>1 à 2 répétitions en réserve</strong> pour éviter
              une fatigue excessive tout en stimulant suffisamment les muscles.
            </p>
          </div>
          <div className="bg-orange-900/30 border border-orange-600 rounded-lg p-3">
            <p className="font-medium text-orange-400 mb-1">Aller à l'échec musculaire (RIR = 0)</p>
            <p className="text-orange-300 text-sm">
              Plus optimal pour la <strong>prise de force</strong>, mais entraîne une
              <strong> fatigue importante</strong> sur le corps. À utiliser avec modération
              et sur des exercices ciblés.
            </p>
          </div>
        </div>
      </Card>

      {/* Tableau pourcentage RM */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-100 mb-3">
          Pourcentage de 1RM et objectifs
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          Choisissez votre charge en fonction de votre objectif d'entraînement.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-2 font-semibold text-gray-300">% de 1RM</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-300">Répétitions</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-300">Objectif principal</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-700">
                <td className="py-3 px-2">
                  <span className="font-medium text-red-400">&gt; 90%</span>
                </td>
                <td className="py-3 px-2 text-gray-300">1 - 3</td>
                <td className="py-3 px-2">
                  <span className="bg-red-900/50 text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                    Force pure
                  </span>
                  <span className="text-gray-500 text-xs ml-2">(Système nerveux)</span>
                </td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-3 px-2">
                  <span className="font-medium text-orange-400">80% - 90%</span>
                </td>
                <td className="py-3 px-2 text-gray-300">4 - 7</td>
                <td className="py-3 px-2">
                  <span className="bg-orange-900/50 text-orange-400 px-2 py-1 rounded-full text-xs font-medium">
                    Force + Hypertrophie
                  </span>
                  <span className="text-gray-500 text-xs ml-2">(Fonctionnelle)</span>
                </td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-3 px-2">
                  <span className="font-medium text-yellow-400">70% - 80%</span>
                </td>
                <td className="py-3 px-2 text-gray-300">8 - 12</td>
                <td className="py-3 px-2">
                  <span className="bg-yellow-900/50 text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
                    Hypertrophie
                  </span>
                  <span className="text-gray-500 text-xs ml-2">(Prise de muscle)</span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-2">
                  <span className="font-medium text-green-400">60% - 70%</span>
                </td>
                <td className="py-3 px-2 text-gray-300">12 - 20</td>
                <td className="py-3 px-2">
                  <span className="bg-green-900/50 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                    Endurance
                  </span>
                  <span className="text-gray-500 text-xs ml-2">(Volume musculaire)</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Exemple de calcul */}
        <div className="mt-4 bg-gray-900 rounded-lg p-3">
          <p className="font-medium text-gray-300 text-sm mb-2">Exemple de calcul</p>
          <p className="text-gray-400 text-xs">
            Si votre 1RM au squat est de <strong className="text-gray-200">100 kg</strong> et vous voulez travailler
            en hypertrophie (70-80%), utilisez une charge entre <strong className="text-gray-200">70 et 80 kg</strong> pour
            des séries de 8 à 12 répétitions.
          </p>
        </div>
      </Card>

      {/* Tableau temps de repos */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-100 mb-3">
          Temps de repos entre les séries
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          Adaptez votre temps de repos en fonction de votre objectif.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-2 font-semibold text-gray-300">Objectif</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-300">Temps de repos</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-300">Pourquoi ?</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-700">
                <td className="py-3 px-2">
                  <span className="font-medium text-red-400">Force Pure</span>
                  <span className="text-gray-500 text-xs block">(1-5 reps)</span>
                </td>
                <td className="py-3 px-2">
                  <span className="bg-red-900/50 text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                    3 à 5 minutes
                  </span>
                </td>
                <td className="py-3 px-2 text-gray-400 text-xs">
                  Pour recharger complètement l'ATP (ton carburant immédiat) et laisser le système nerveux récupérer.
                </td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-3 px-2">
                  <span className="font-medium text-yellow-400">Hypertrophie / Muscle</span>
                  <span className="text-gray-500 text-xs block">(6-12 reps)</span>
                </td>
                <td className="py-3 px-2">
                  <span className="bg-yellow-900/50 text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
                    1min30 à 2min30
                  </span>
                </td>
                <td className="py-3 px-2 text-gray-400 text-xs">
                  Le bon compromis pour maintenir une intensité élevée tout en accumulant du stress métabolique.
                </td>
              </tr>
              <tr>
                <td className="py-3 px-2">
                  <span className="font-medium text-green-400">Endurance / Brûlure</span>
                  <span className="text-gray-500 text-xs block">(15+ reps)</span>
                </td>
                <td className="py-3 px-2">
                  <span className="bg-green-900/50 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                    30 à 60 secondes
                  </span>
                </td>
                <td className="py-3 px-2 text-gray-400 text-xs">
                  Pour forcer le muscle à travailler en milieu acide (acide lactique) et améliorer sa résistance.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Conseils supplémentaires */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-100 mb-3">
          Conseils pratiques
        </h2>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-primary-400 mt-1">•</span>
            <span>Notez votre RM régulièrement pour ajuster vos charges de travail</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-400 mt-1">•</span>
            <span>Le RIR peut varier selon les séries : plus de réserve au début, moins à la fin</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-400 mt-1">•</span>
            <span>Pour les mouvements d'haltérophilie, privilégiez la technique à la charge maximale</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-400 mt-1">•</span>
            <span>Écoutez votre corps : si le RIR diminue trop vite, réduisez la charge</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
