export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <span className="text-6xl mb-6">🌙</span>
      <h1 className="text-3xl font-bold mb-3 text-text-primary">Ingen anslutning</h1>
      <p className="text-text-muted max-w-sm">
        Du behöver en internetanslutning för att använda Insomnia.
        Försök igen när du är uppkopplad.
      </p>
    </div>
  )
}
