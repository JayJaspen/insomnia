import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Integritetspolicy',
  robots: { index: true, follow: false },
}

export default function PrivacyPage() {
  const updated = '2025-01-01'

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Rubrik */}
        <div>
          <Link href="/" className="text-accent-light text-sm hover:underline mb-6 inline-block">
            ← Tillbaka till startsidan
          </Link>
          <h1 className="text-3xl font-bold text-text-primary mt-2">Integritetspolicy</h1>
          <p className="text-text-muted text-sm mt-1">Senast uppdaterad: {updated}</p>
        </div>

        <div className="glass p-6 rounded-2xl space-y-6 text-sm text-text-muted leading-relaxed">

          <section>
            <h2 className="text-text-primary font-semibold text-base mb-2">1. Personuppgiftsansvarig</h2>
            <p>
              Insomnia.nu (nedan "vi", "oss" eller "tjänsten") är personuppgiftsansvarig för behandlingen
              av dina personuppgifter. Kontakta oss på{' '}
              <a href="mailto:info@insomnia.nu" className="text-accent-light hover:underline">
                info@insomnia.nu
              </a>{' '}
              vid frågor om denna policy.
            </p>
          </section>

          <section>
            <h2 className="text-text-primary font-semibold text-base mb-2">2. Vilka uppgifter samlar vi in?</h2>
            <p className="mb-2">Vi samlar in följande uppgifter när du skapar ett konto:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>E-postadress (används för inloggning, visas ej för andra)</li>
              <li>Visningsnamn (synligt i chatten)</li>
              <li>För- och efternamn (lagras men visas ej offentligt)</li>
              <li>Kön, födelseår, stad och län</li>
              <li>Vald avatar</li>
            </ul>
            <p className="mt-2">
              Vi loggar även teknisk information som IP-adress vid inloggning
              för att förhindra missbruk.
            </p>
          </section>

          <section>
            <h2 className="text-text-primary font-semibold text-base mb-2">3. Hur används uppgifterna?</h2>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>För att tillhandahålla och driva tjänsten</li>
              <li>För att visa din profil för andra inloggade användare</li>
              <li>För att administrera konton och hantera regelbrott</li>
              <li>Vi säljer eller delar aldrig dina uppgifter med tredje part i marknadsföringssyfte</li>
            </ul>
          </section>

          <section>
            <h2 className="text-text-primary font-semibold text-base mb-2">4. Datalagring och radering</h2>
            <p className="mb-2">
              <strong className="text-text-primary">Chattar och bilder</strong> raderas automatiskt varje
              morgon kl. 06:00 när tjänsten stänger. De lagras aldrig längre än en natt.
            </p>
            <p>
              <strong className="text-text-primary">Kontoinformation</strong> (namn, e-post, profildata)
              lagras så länge kontot är aktivt. Du kan när som helst begära radering av ditt konto
              och all tillhörande data via din profilsida eller via{' '}
              <a href="mailto:info@insomnia.nu" className="text-accent-light hover:underline">
                info@insomnia.nu
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-text-primary font-semibold text-base mb-2">5. Dina rättigheter (GDPR)</h2>
            <p className="mb-2">
              Enligt EU:s dataskyddsförordning (GDPR) har du rätt att:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong className="text-text-primary">Tillgång</strong> – begära ett utdrag av dina uppgifter</li>
              <li><strong className="text-text-primary">Rättelse</strong> – korrigera felaktiga uppgifter via profilsidan</li>
              <li><strong className="text-text-primary">Radering</strong> – begära att ditt konto och all data raderas</li>
              <li><strong className="text-text-primary">Invändning</strong> – invända mot behandling av dina uppgifter</li>
              <li><strong className="text-text-primary">Portabilitet</strong> – begära dina uppgifter i maskinläsbart format</li>
            </ul>
            <p className="mt-2">
              Skicka din begäran till{' '}
              <a href="mailto:info@insomnia.nu" className="text-accent-light hover:underline">
                info@insomnia.nu
              </a>.
              Vi svarar inom 30 dagar.
            </p>
          </section>

          <section>
            <h2 className="text-text-primary font-semibold text-base mb-2">6. Säkerhet</h2>
            <p>
              Vi skyddar dina uppgifter med industristandardkryptering (TLS/HTTPS) och lagrar
              lösenord i hashad form. Åtkomst till personuppgifter begränsas till behörig personal.
            </p>
          </section>

          <section>
            <h2 className="text-text-primary font-semibold text-base mb-2">7. Tredjepartstjänster</h2>
            <p>
              Tjänsten använder Supabase (databas och autentisering) och Vercel (webbhotell).
              Dessa partners behandlar personuppgifter i enlighet med GDPR.
            </p>
          </section>

          <section>
            <h2 className="text-text-primary font-semibold text-base mb-2">8. Klagomål</h2>
            <p>
              Om du anser att vi behandlar dina uppgifter på ett felaktigt sätt kan du lämna
              klagomål till{' '}
              <a
                href="https://www.imy.se"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-light hover:underline"
              >
                Integritetsskyddsmyndigheten (IMY)
              </a>.
            </p>
          </section>

        </div>

        <footer className="text-center text-text-muted text-xs">
          insomnia.nu &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  )
}
