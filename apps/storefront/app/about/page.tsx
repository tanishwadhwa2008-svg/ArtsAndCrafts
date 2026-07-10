import type { Metadata } from 'next';
import Link from 'next/link';
import { BadgeCheck, Hand, MapPin, Sprout } from 'lucide-react';
import { Button } from '@arts/ui';
import { OrnateFrame, Paisley } from '@/components/site/ornaments';
import { Reveal } from '@/components/site/reveal';

export const metadata: Metadata = {
  title: 'About',
  description:
    "The story behind Arts and Crafts of India: a curated home for the country's handmade traditions, working directly with the artisans who keep them alive.",
};

const crafts = [
  'Blue Pottery of Jaipur',
  'Bidriware',
  'Pashmina',
  'Madhubani',
  'Dhokra',
  'Pattachitra',
  'Channapatna',
  'Kutch Embroidery',
  'Warli',
  'Hand-hammered Brass',
];

const values = [
  {
    Icon: Hand,
    title: 'Made by hand',
    body: 'Every piece is shaped by a person, not a machine, so no two are ever exactly alike.',
  },
  {
    Icon: Sprout,
    title: 'Directly sourced',
    body: 'We buy straight from the artisans and their workshops, so more of the value stays with the maker.',
  },
  {
    Icon: BadgeCheck,
    title: 'Built to last',
    body: 'Honest materials, made to be lived with for a lifetime and passed on to the next.',
  },
  {
    Icon: MapPin,
    title: 'Rooted in place',
    body: 'Each craft belongs to a region and a lineage, and we keep that provenance with it.',
  },
];

const journey = [
  {
    step: '01',
    title: 'Found at the source',
    body: 'We seek out the workshops and family studios where a craft is still practised the old way.',
  },
  {
    step: '02',
    title: 'Shaped by hand',
    body: 'The maker forms each piece with the tools and techniques of their tradition.',
  },
  {
    step: '03',
    title: 'Finished with care',
    body: 'We check every piece, record its provenance, and celebrate its handmade character.',
  },
  {
    step: '04',
    title: 'Brought home',
    body: 'Carefully packed and shipped from India to your door, wherever in the world you are.',
  },
];

const disciplines = [
  { name: 'Pottery & terracotta', note: 'Blue pottery, black clay and hand-thrown stoneware.' },
  { name: 'Metal & brass', note: 'Bidriware, dhokra casting and hammered brassware.' },
  { name: 'Weaving & textiles', note: 'Pashmina, handloom cotton and mirror-worked embroidery.' },
  { name: 'Painting & folk art', note: 'Madhubani, Pattachitra and Warli narratives.' },
  { name: 'Wood & stone', note: 'Hand-carved wood, inlay and quiet carved stone.' },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero — rotating mandala behind an ornate frame, echoing the home hero. */}
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[130vmax] w-[130vmax] -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
        >
          <div
            className="h-full w-full animate-[slowRotate_120s_linear_infinite]"
            style={{
              backgroundImage: "url('/patterns/sacred-geometry.svg')",
              backgroundSize: '440px',
              backgroundRepeat: 'repeat',
              backgroundPosition: 'center',
            }}
          />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(227,185,72,0.1),transparent_70%)]"
        />

        <div className="mx-auto max-w-4xl px-6 py-24 sm:py-28">
          <Reveal>
            <OrnateFrame className="flex flex-col items-center px-6 py-14 text-center sm:px-12 sm:py-16">
              <p className="eyebrow mb-4">Our story</p>
              <h1 className="bg-gradient-to-br from-gold-300 via-gold-400 to-gold-600 bg-clip-text font-display text-4xl leading-[1.14] text-transparent sm:text-5xl">
                The hands behind
                <br />
                every piece.
              </h1>
              <p className="mt-6 max-w-xl font-serif text-lg italic leading-relaxed text-muted sm:text-xl">
                Arts and Crafts of India is a curated home for the country&rsquo;s
                handmade traditions, carrying the craft of the workshop to people
                who value what is made slowly, by hand, and to last.
              </p>
            </OrnateFrame>
          </Reveal>
        </div>
      </section>

      {/* Infinite craft marquee. */}
      <section
        aria-label="Crafts we carry"
        className="relative overflow-hidden border-y border-line/70 py-5"
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-bg to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-bg to-transparent" />
        <div className="flex w-max animate-[marquee_40s_linear_infinite] items-center gap-x-12">
          {[...crafts, ...crafts].map((craft, i) => (
            <span
              key={i}
              className="flex items-center gap-x-12 whitespace-nowrap font-serif text-lg italic text-gold-300/85"
            >
              {craft}
              <span aria-hidden="true" className="text-sm not-italic text-gold-500/70">
                &#10022;
              </span>
            </span>
          ))}
        </div>
      </section>

      {/* Story + pull-quote. */}
      <section className="mx-auto max-w-2xl px-6 py-20 sm:py-24">
        <Reveal className="space-y-6 text-base leading-relaxed text-muted">
          <p>
            Arts and Crafts of India began with a simple conviction: that the
            objects we live with should carry the mark of a human hand. In a world
            of the mass-produced and the disposable, we set out to bring the
            country&rsquo;s handmade traditions to people who still care where
            their things come from, and who made them.
          </p>
          <p>
            We travel to the workshops and family studios where these crafts are
            still practised the old way, and work directly with the artisans who
            keep them alive. Pottery and metalwork, weaving and painting, each
            discipline carries centuries of skill, handed from one generation to
            the next.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <blockquote className="my-14 border-l-2 border-gold-500/50 pl-6 font-serif text-2xl italic leading-relaxed text-gold-200 sm:text-3xl">
            &ldquo;We believe the objects we live with should carry a story worth
            keeping.&rdquo;
          </blockquote>
        </Reveal>

        <Reveal delay={80} className="space-y-6 text-base leading-relaxed text-muted">
          <p>
            Working directly with makers means the craft, and the livelihoods
            behind it, can continue to thrive. Every piece you bring home helps
            keep a tradition, and a pair of hands, at work. That is the quiet
            exchange at the heart of everything we do.
          </p>
        </Reveal>
      </section>

      {/* Values pillars. */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal className="mb-12 text-center">
          <p className="eyebrow">What we stand for</p>
          <h2 className="mt-2 font-display text-3xl text-gold-300 sm:text-4xl">
            Principles, not slogans
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 90}>
              <div className="group h-full border-t border-line pt-6 transition-colors duration-500 hover:border-gold-500/60">
                <Icon
                  className="h-7 w-7 text-gold-500 transition-transform duration-500 group-hover:-translate-y-1"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <h3 className="mt-4 font-display text-lg text-fg">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* The craft journey. */}
      <section className="border-y border-line bg-surface/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Reveal className="mb-14 text-center">
            <p className="eyebrow">From hand to home</p>
            <h2 className="mt-2 font-display text-3xl text-gold-300 sm:text-4xl">
              How a piece reaches you
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {journey.map(({ step, title, body }, i) => (
              <Reveal key={step} delay={i * 110}>
                <div className="relative">
                  <span className="font-display text-4xl text-gold-500/70">{step}</span>
                  <h3 className="mt-3 font-display text-lg text-fg">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Crafts of India — hover underline draw. */}
      <section className="mx-auto max-w-4xl px-6 py-20 sm:py-24">
        <Reveal className="mb-10 text-center">
          <p className="eyebrow">Crafts of India</p>
          <h2 className="mt-2 font-display text-3xl text-gold-300 sm:text-4xl">Traditions we carry</h2>
        </Reveal>
        <div className="border-t border-line/70">
          {disciplines.map(({ name, note }, i) => (
            <Reveal key={name} delay={i * 70}>
              <div className="group flex flex-col gap-1 border-b border-line/70 py-6 sm:flex-row sm:items-baseline sm:justify-between">
                <span className="relative w-fit font-display text-xl text-fg transition-colors duration-300 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-gold-400 after:transition-all after:duration-500 group-hover:text-gold-200 group-hover:after:w-full">
                  {name}
                </span>
                <span className="max-w-md font-serif text-sm italic text-muted sm:text-right">
                  {note}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Closing CTA. */}
      <section className="relative isolate overflow-hidden">
        <Paisley className="pointer-events-none absolute -bottom-16 -right-16 -z-10 h-80 w-80 text-gold-500/[0.05]" />
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <Reveal>
            <p className="eyebrow">Begin your collection</p>
            <h2 className="mt-3 font-display text-3xl text-gold-300 sm:text-4xl">
              Bring a piece of India home
            </h2>
            <p className="mx-auto mt-5 max-w-xl font-serif text-lg italic leading-relaxed text-muted">
              Explore a collection shaped entirely by hand, or reach out and we
              will help you find the right piece.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              <Button asChild variant="luxury" className="px-6">
                <Link href="/collections">Explore the collection</Link>
              </Button>
              <Link
                href="/contact"
                className="text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-gold-300"
              >
                Talk to us
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
