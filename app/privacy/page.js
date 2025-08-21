export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Politique de Confidentialité</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Dernière mise à jour :</strong> 21 août 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                DigiFlow Hub ("nous", "notre", "nos") s'engage à protéger la vie privée de ses utilisateurs. 
                Cette politique de confidentialité explique comment nous collectons, utilisons, divulguons et 
                protégeons vos informations lorsque vous utilisez notre plateforme de gestion marketing et nos 
                applications IA.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Informations que nous collectons</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Informations fournies directement</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Nom et prénom</li>
                <li>Adresse email professionnelle</li>
                <li>Nom de l'entreprise</li>
                <li>Numéro de téléphone (optionnel)</li>
                <li>Informations de paiement (traitées via Stripe)</li>
                <li>Données des campagnes publicitaires</li>
                <li>Contenus créatifs et messages marketing</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Informations collectées automatiquement</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Adresse IP</li>
                <li>Type de navigateur et système d'exploitation</li>
                <li>Pages visitées et temps passé</li>
                <li>Données d'utilisation des applications (Fidalyz, AIDs, etc.)</li>
                <li>Cookies et technologies similaires</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.3 Informations tierces</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Données Google Business Profile (via API avec votre autorisation)</li>
                <li>Métriques Meta Ads (Facebook/Instagram)</li>
                <li>Analytics des plateformes publicitaires connectées</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Utilisation des informations</h2>
              <p className="text-gray-700 mb-3">Nous utilisons vos informations pour :</p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Fournir et améliorer nos services</li>
                <li>Personnaliser votre expérience utilisateur</li>
                <li>Traiter vos paiements et gérer votre abonnement</li>
                <li>Générer des analyses et insights marketing via nos IA</li>
                <li>Créer et optimiser vos campagnes publicitaires</li>
                <li>Répondre automatiquement aux avis clients (Fidalyz)</li>
                <li>Vous envoyer des notifications importantes</li>
                <li>Assurer la sécurité et prévenir la fraude</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Intelligence Artificielle et traitement des données</h2>
              <p className="text-gray-700 mb-4">
                DigiFlow Hub utilise des modèles d'IA (Claude d'Anthropic, GPT d'OpenAI) pour :
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Analyser les performances de vos campagnes</li>
                <li>Générer des contenus publicitaires</li>
                <li>Optimiser vos stratégies marketing</li>
                <li>Fournir des recommandations personnalisées</li>
              </ul>
              <p className="text-gray-700 mb-4">
                <strong>Important :</strong> Vos données ne sont jamais utilisées pour entraîner les modèles d'IA. 
                Elles sont traitées de manière confidentielle et supprimées après utilisation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Partage des informations</h2>
              <p className="text-gray-700 mb-3">Nous ne vendons jamais vos données. Nous partageons vos informations uniquement avec :</p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li><strong>Fournisseurs de services :</strong> Anthropic, OpenAI, Meta, Google (pour les APIs)</li>
                <li><strong>Processeurs de paiement :</strong> Stripe pour les transactions sécurisées</li>
                <li><strong>Hébergement :</strong> Vercel et Firebase pour l'infrastructure</li>
                <li><strong>Autorités légales :</strong> Si requis par la loi</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Sécurité des données</h2>
              <p className="text-gray-700 mb-4">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données :
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Chiffrement SSL/TLS pour toutes les transmissions</li>
                <li>Authentification sécurisée via Firebase Auth</li>
                <li>Stockage chiffré des données sensibles</li>
                <li>Accès restreint aux données personnelles</li>
                <li>Audits de sécurité réguliers</li>
                <li>Conformité RGPD</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Vos droits (RGPD)</h2>
              <p className="text-gray-700 mb-3">Conformément au RGPD, vous avez le droit de :</p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li><strong>Accéder</strong> à vos données personnelles</li>
                <li><strong>Rectifier</strong> les informations inexactes</li>
                <li><strong>Effacer</strong> vos données ("droit à l'oubli")</li>
                <li><strong>Limiter</strong> le traitement de vos données</li>
                <li><strong>Porter</strong> vos données vers un autre service</li>
                <li><strong>Vous opposer</strong> au traitement de vos données</li>
                <li><strong>Retirer</strong> votre consentement à tout moment</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Pour exercer ces droits, contactez-nous à : privacy@digiflow-agency.fr
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Conservation des données</h2>
              <p className="text-gray-700 mb-4">
                Nous conservons vos données personnelles aussi longtemps que nécessaire pour :
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Fournir nos services pendant la durée de votre abonnement</li>
                <li>Respecter nos obligations légales (5 ans pour les données de facturation)</li>
                <li>Résoudre les litiges et faire respecter nos accords</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Les données sont supprimées ou anonymisées dans les 30 jours suivant la clôture de votre compte.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Cookies</h2>
              <p className="text-gray-700 mb-4">
                Nous utilisons des cookies pour :
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Maintenir votre session de connexion</li>
                <li>Mémoriser vos préférences</li>
                <li>Analyser l'utilisation de notre plateforme</li>
                <li>Améliorer nos services</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Transferts internationaux</h2>
              <p className="text-gray-700 mb-4">
                Vos données peuvent être transférées et traitées dans des pays en dehors de l'Union Européenne. 
                Nous nous assurons que ces transferts sont effectués conformément au RGPD avec des garanties 
                appropriées (clauses contractuelles types, Privacy Shield, etc.).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Mineurs</h2>
              <p className="text-gray-700 mb-4">
                DigiFlow Hub n'est pas destiné aux personnes de moins de 18 ans. Nous ne collectons pas 
                sciemment de données personnelles auprès de mineurs.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Modifications de cette politique</h2>
              <p className="text-gray-700 mb-4">
                Nous pouvons mettre à jour cette politique de confidentialité. Les modifications importantes 
                seront notifiées par email ou via une notification dans l'application. La date de "Dernière 
                mise à jour" en haut de cette page indique la dernière révision.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact</h2>
              <p className="text-gray-700 mb-4">
                Pour toute question concernant cette politique de confidentialité ou vos données personnelles :
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>DigiFlow Agency</strong></p>
                <p className="text-gray-700 mb-1">Email : privacy@digiflow-agency.fr</p>
                <p className="text-gray-700 mb-1">DPO : dpo@digiflow-agency.fr</p>
                <p className="text-gray-700 mb-1">Adresse : Paris, France</p>
                <p className="text-gray-700">Téléphone : +33 1 XX XX XX XX</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Autorité de contrôle</h2>
              <p className="text-gray-700 mb-4">
                Si vous estimez que vos droits ne sont pas respectés, vous pouvez déposer une réclamation 
                auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) :
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-1">Site web : www.cnil.fr</p>
                <p className="text-gray-700 mb-1">Adresse : 3 Place de Fontenoy, 75007 Paris</p>
                <p className="text-gray-700">Téléphone : +33 1 53 73 22 22</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}