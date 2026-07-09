export function AnnouncementBar() {
  return (
    <div className="border-b border-line bg-surface/50">
      <p className="mx-auto max-w-7xl px-4 py-2 text-center text-[0.68rem] uppercase tracking-[0.2em] text-muted sm:px-6 lg:px-8">
        Handcrafted across India{' '}
        <span aria-hidden="true" className="mx-1 text-faint">
          ·
        </span>{' '}
        <span className="text-gold-300">Every piece one of a kind</span>
      </p>
    </div>
  );
}
