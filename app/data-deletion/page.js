export default function DataDeletion() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Instructions de Suppression des Données</h1>
          <p className="text-sm text-gray-600 mb-6">
            <strong>Data Deletion Instructions</strong> | Instructions pour la suppression de vos données Facebook/Meta
          </p>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Comment supprimer vos données</h2>
              <p className="text-gray-700 mb-4">
                DigiFlow Hub respecte votre droit à la suppression de vos données personnelles. Si vous avez 
                connecté votre compte Facebook/Meta à notre application, vous pouvez demander la suppression 
                complète de vos données en suivant les instructions ci-dessous.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Méthode 1 : Suppression automatique (Recommandée)</h2>
              <ol className="list-decimal pl-6 mb-4 text-gray-700 space-y-2">
                <li>Connectez-vous à votre compte DigiFlow Hub</li>
                <li>Accédez aux <strong>Paramètres</strong> → <strong>Confidentialité</strong></li>
                <li>Cliquez sur <strong>"Supprimer mes données Facebook"</strong></li>
                <li>Confirmez la suppression en cliquant sur <strong>"Confirmer la suppression"</strong></li>
                <li>Vous recevrez un email de confirmation sous 24h</li>
              </ol>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  <strong>Note :</strong> Cette action supprimera immédiatement :
                </p>
                <ul className="list-disc pl-5 mt-2 text-blue-700">
                  <li>Vos tokens d'accès Meta/Facebook</li>
                  <li>Les données de vos campagnes publicitaires</li>
                  <li>Les métriques et analyses liées à Meta</li>
                  <li>Votre historique de connexion Facebook</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Méthode 2 : Demande par email</h2>
              <p className="text-gray-700 mb-4">
                Vous pouvez également demander la suppression de vos données en nous contactant directement :
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700 mb-2">
                  <strong>Email :</strong> privacy@digiflow-agency.fr
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Objet :</strong> Demande de suppression des données Facebook
                </p>
                <p className="text-gray-700">
                  <strong>Informations à fournir :</strong>
                </p>
                <ul className="list-disc pl-5 mt-2 text-gray-600">
                  <li>Votre email de compte DigiFlow Hub</li>
                  <li>Votre ID Facebook (optionnel)</li>
                  <li>La date de connexion approximative</li>
                </ul>
              </div>
              <p className="text-gray-700">
                Nous traiterons votre demande dans un délai de <strong>48 heures ouvrées</strong>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Méthode 3 : Via les paramètres Facebook</h2>
              <ol className="list-decimal pl-6 mb-4 text-gray-700 space-y-2">
                <li>Allez sur <a href="https://www.facebook.com/settings?tab=applications" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook Settings → Apps and Websites</a></li>
                <li>Trouvez <strong>"DigiFlow Hub"</strong> dans la liste</li>
                <li>Cliquez sur <strong>"Remove"</strong> ou <strong>"Supprimer"</strong></li>
                <li>Confirmez la suppression</li>
              </ol>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  <strong>Important :</strong> Cette méthode révoque l'accès de DigiFlow Hub à vos données 
                  Facebook, mais ne supprime pas les données déjà collectées. Pour une suppression complète, 
                  utilisez la Méthode 1 ou 2.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Types de données supprimées</h2>
              <p className="text-gray-700 mb-4">
                Lorsque vous demandez la suppression de vos données, nous supprimons :
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">✅ Données supprimées</h3>
                  <ul className="list-disc pl-5 text-green-700 text-sm space-y-1">
                    <li>Profil Facebook (nom, email, photo)</li>
                    <li>Tokens d'accès et permissions</li>
                    <li>Données des Pages Facebook</li>
                    <li>Métriques publicitaires Meta</li>
                    <li>Audiences personnalisées</li>
                    <li>Historique des campagnes</li>
                    <li>Pixels de tracking</li>
                    <li>Webhooks et intégrations</li>
                  </ul>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-900 mb-2">⚠️ Données conservées</h3>
                  <ul className="list-disc pl-5 text-red-700 text-sm space-y-1">
                    <li>Factures (obligation légale 5 ans)</li>
                    <li>Logs de sécurité (30 jours)</li>
                    <li>Données anonymisées pour statistiques</li>
                    <li>Contenu créé non lié à Facebook</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Délais de suppression</h2>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-700">Type de données</th>
                      <th className="px-4 py-2 text-left text-gray-700">Délai de suppression</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2 text-gray-600">Tokens d'accès</td>
                      <td className="px-4 py-2 text-gray-600">Immédiat</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-gray-600">Données de profil</td>
                      <td className="px-4 py-2 text-gray-600">24 heures</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-gray-600">Métriques publicitaires</td>
                      <td className="px-4 py-2 text-gray-600">48 heures</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-gray-600">Sauvegardes</td>
                      <td className="px-4 py-2 text-gray-600">30 jours maximum</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Confirmation de suppression</h2>
              <p className="text-gray-700 mb-4">
                Une fois vos données supprimées, vous recevrez :
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Un <strong>email de confirmation</strong> à l'adresse associée à votre compte</li>
                <li>Un <strong>rapport de suppression</strong> détaillant les données effacées</li>
                <li>Un <strong>certificat de suppression</strong> pour vos archives</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Vos droits (RGPD)</h2>
              <p className="text-gray-700 mb-4">
                Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li><strong>Droit d'accès :</strong> Obtenir une copie de vos données</li>
                <li><strong>Droit de rectification :</strong> Corriger vos données</li>
                <li><strong>Droit à l'effacement :</strong> Supprimer vos données ("droit à l'oubli")</li>
                <li><strong>Droit à la portabilité :</strong> Transférer vos données</li>
                <li><strong>Droit d'opposition :</strong> Refuser certains traitements</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Questions fréquentes</h2>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Puis-je récupérer mes données après suppression ?
                  </h3>
                  <p className="text-gray-700">
                    Non, la suppression est définitive et irréversible. Nous vous recommandons d'exporter 
                    vos données importantes avant de demander leur suppression.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    La suppression affecte-t-elle mes campagnes actives ?
                  </h3>
                  <p className="text-gray-700">
                    Oui, toutes les campagnes liées à votre compte Meta seront arrêtées et les données 
                    associées seront supprimées.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Puis-je supprimer seulement certaines données ?
                  </h3>
                  <p className="text-gray-700">
                    Oui, contactez-nous à privacy@digiflow-agency.fr pour une suppression sélective de 
                    certaines catégories de données.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact et support</h2>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="font-semibold text-purple-900 mb-3">Besoin d'aide ?</h3>
                <p className="text-purple-700 mb-4">
                  Notre équipe de protection des données est là pour vous aider.
                </p>
                <div className="space-y-2 text-purple-700">
                  <p><strong>Email DPO :</strong> dpo@digiflow-agency.fr</p>
                  <p><strong>Email Support :</strong> privacy@digiflow-agency.fr</p>
                  <p><strong>Téléphone :</strong> +33 1 XX XX XX XX (Lun-Ven, 9h-18h)</p>
                  <p><strong>Délai de réponse :</strong> 48h ouvrées maximum</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Autorité de contrôle</h2>
              <p className="text-gray-700 mb-4">
                Si vous n'êtes pas satisfait de notre réponse, vous pouvez contacter la CNIL :
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-1"><strong>CNIL</strong> (Commission Nationale de l'Informatique et des Libertés)</p>
                <p className="text-gray-700 mb-1">Site web : www.cnil.fr</p>
                <p className="text-gray-700 mb-1">Adresse : 3 Place de Fontenoy, 75007 Paris</p>
                <p className="text-gray-700">Téléphone : +33 1 53 73 22 22</p>
              </div>
            </section>

            <div className="mt-12 p-6 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Notre engagement</h3>
              <p className="text-green-700">
                DigiFlow Hub s'engage à respecter votre vie privée et à traiter vos demandes de suppression 
                de données avec la plus grande diligence. Toutes les suppressions sont effectuées conformément 
                au RGPD et aux politiques de Meta/Facebook.
              </p>
            </div>

            <div className="mt-6 text-sm text-gray-600">
              <p><strong>Dernière mise à jour :</strong> 21 août 2025</p>
              <p><strong>Version :</strong> 1.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}