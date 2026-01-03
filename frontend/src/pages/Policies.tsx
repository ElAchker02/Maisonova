import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Policies = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Politiques
            </h1>
            <p className="text-muted-foreground">
              Consultez nos conditions générales et politiques
            </p>
          </div>

          <Tabs defaultValue="cgv" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="cgv">Conditions Générales</TabsTrigger>
              <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
              <TabsTrigger value="returns">Retours</TabsTrigger>
            </TabsList>

            <TabsContent value="cgv" className="space-y-6">
              <div className="prose prose-gray max-w-none">
                <h2 className="text-2xl font-serif font-semibold mb-4">
                  Conditions Générales de Vente
                </h2>
                
                <h3 className="text-lg font-semibold mt-6 mb-3">1. Objet</h3>
                <p className="text-muted-foreground mb-4">
                  Les présentes conditions générales de vente régissent les relations contractuelles 
                  entre Maisonova et ses clients dans le cadre de la vente de linge de maison 
                  via le site internet.
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-3">2. Prix</h3>
                <p className="text-muted-foreground mb-4">
                  Les prix de nos produits sont indiqués en euros toutes taxes comprises (TTC). 
                  Maisonova se réserve le droit de modifier ses prix à tout moment, étant entendu 
                  que le prix figurant au catalogue le jour de la commande sera le seul applicable.
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-3">3. Commandes</h3>
                <p className="text-muted-foreground mb-4">
                  Toute commande implique l'acceptation des présentes conditions générales de vente. 
                  La validation de la commande entraîne l'acceptation des prix et la description 
                  des produits disponibles à la vente.
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-3">4. Livraison</h3>
                <p className="text-muted-foreground mb-4">
                  Les livraisons sont effectuées en France métropolitaine. Les délais de livraison 
                  sont donnés à titre indicatif et peuvent varier selon la disponibilité des produits.
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-3">5. Paiement</h3>
                <p className="text-muted-foreground mb-4">
                  Le paiement s'effectue à la commande par les moyens de paiement proposés sur le site. 
                  Toutes les transactions sont sécurisées.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <div className="prose prose-gray max-w-none">
                <h2 className="text-2xl font-serif font-semibold mb-4">
                  Politique de Confidentialité
                </h2>

                <h3 className="text-lg font-semibold mt-6 mb-3">Collecte des données</h3>
                <p className="text-muted-foreground mb-4">
                  Nous collectons les informations que vous nous fournissez directement, telles que 
                  votre nom, adresse email, adresse postale et numéro de téléphone lorsque vous 
                  passez une commande ou nous contactez.
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-3">Utilisation des données</h3>
                <p className="text-muted-foreground mb-4">
                  Vos données personnelles sont utilisées pour :
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-4">
                  <li>Traiter et livrer vos commandes</li>
                  <li>Vous contacter concernant vos commandes</li>
                  <li>Améliorer nos services</li>
                  <li>Vous envoyer des informations commerciales (avec votre consentement)</li>
                </ul>

                <h3 className="text-lg font-semibold mt-6 mb-3">Protection des données</h3>
                <p className="text-muted-foreground mb-4">
                  Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos 
                  données personnelles contre tout accès non autorisé, modification, divulgation 
                  ou destruction.
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-3">Vos droits</h3>
                <p className="text-muted-foreground mb-4">
                  Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, 
                  de suppression et de portabilité de vos données personnelles. Pour exercer 
                  ces droits, contactez-nous à privacy@maisonluxe.fr.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="returns" className="space-y-6">
              <div className="prose prose-gray max-w-none">
                <h2 className="text-2xl font-serif font-semibold mb-4">
                  Politique de Retours et Remboursements
                </h2>

                <h3 className="text-lg font-semibold mt-6 mb-3">Droit de rétractation</h3>
                <p className="text-muted-foreground mb-4">
                  Conformément à la législation en vigueur, vous disposez d'un délai de 14 jours 
                  à compter de la réception de votre commande pour exercer votre droit de rétractation, 
                  sans avoir à justifier de motifs ni à payer de pénalités.
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-3">Conditions de retour</h3>
                <p className="text-muted-foreground mb-4">
                  Pour être acceptés, les produits retournés doivent être :
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-4">
                  <li>Non utilisés et non lavés</li>
                  <li>Dans leur emballage d'origine</li>
                  <li>Accompagnés de la facture ou du bon de livraison</li>
                </ul>

                <h3 className="text-lg font-semibold mt-6 mb-3">Procédure de retour</h3>
                <p className="text-muted-foreground mb-4">
                  Pour effectuer un retour, veuillez nous contacter par email à retours@maisonluxe.fr 
                  en précisant votre numéro de commande et le(s) article(s) à retourner. Nous vous 
                  fournirons alors les instructions pour le retour.
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-3">Remboursement</h3>
                <p className="text-muted-foreground mb-4">
                  Le remboursement sera effectué dans un délai de 14 jours suivant la réception 
                  et la vérification de l'article retourné. Le remboursement sera effectué via 
                  le même moyen de paiement que celui utilisé pour la commande initiale.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Policies;
