import Image from "next/image";
import {
  ArrowRight,
  Building2,
  Camera,
  Car,
  Check,
  Clock,
  Flower2,
  Leaf,
  MapPin,
  Phone,
  ShieldCheck,
  Trees,
  Waves,
} from "lucide-react";
import { DroneReel } from "@/components/drone-reel";
import { LeadForm } from "@/components/lead-form";
import { VillaCarousel } from "@/components/villa-carousel";

const highlights = [
  { label: "Plot sizes", value: "10 guntas", detail: "Approx. 10,890 sq.ft. and above" },
  { label: "Built form", value: "10%", detail: "Construction permitted as per regulations" },
  { label: "Internal roads", value: "40 & 60 ft", detail: "Wide landscaped roads inside a gated layout" },
  { label: "Bidadi access", value: "10 mins", detail: "Near the industrial growth corridor" },
];

const villaImages = [
  {
    src: "/retreat/elevations/villa-elevation-5.jpg",
    alt: "Single-storey villa elevation with a low sloped roof and garden frontage",
    width: 1801,
    height: 1274,
    label: "Villa elevation 5",
  },
  {
    src: "/retreat/elevations/villa-elevation-6.jpg",
    alt: "Compact villa elevation with a covered deck in a landscaped setting",
    width: 1274,
    height: 1801,
    label: "Villa elevation 6",
  },
  {
    src: "/retreat/elevations/villa-elevation-7.jpg",
    alt: "A-frame villa elevation with glass frontage and timber accents",
    width: 1801,
    height: 1274,
    label: "Villa elevation 7",
  },
  {
    src: "/retreat/elevations/villa-elevation-8.jpg",
    alt: "Villa elevation with a black facade and open garden-facing deck",
    width: 1274,
    height: 1801,
    label: "Villa elevation 8",
  },
  {
    src: "/retreat/elevations/villa-elevation-9.jpg",
    alt: "Modern compact villa elevation surrounded by dense greenery",
    width: 1274,
    height: 1801,
    label: "Villa elevation 9",
  },
  {
    src: "/retreat/elevations/villa-elevation-10.jpg",
    alt: "Two-level villa elevation with large glazing below mature trees",
    width: 1274,
    height: 1801,
    label: "Villa elevation 10",
  },
  {
    src: "/retreat/elevations/villa-elevation-11.jpg",
    alt: "Elevated villa elevation with broad windows and tropical planting",
    width: 1274,
    height: 1801,
    label: "Villa elevation 11",
  },
];

const gardenFeatures = [
  "Prepared nutrient-rich soil beds",
  "Integrated drip irrigation",
  "Seasonal planting calendar",
  "Horticulture expert guidance",
  "Starter kit at handover",
  "Optional greenhouse and compost units",
];

const amenities = [
  { icon: Trees, title: "Nature trails", copy: "Walking-first pathways through orchards, landscaped gardens and quiet green pockets." },
  { icon: Waves, title: "Pool and clubhouse", copy: "Recreational spaces for weekends, community gatherings and slow family time." },
  { icon: Flower2, title: "Meditation lawns", copy: "Yoga decks, low-noise zones and open-air seating for a calmer daily rhythm." },
  { icon: ShieldCheck, title: "Gated security", copy: "Compound wall, CCTV surveillance and managed access for peace of mind." },
  { icon: Building2, title: "Rental management", copy: "Optional resort-management tie-up for owners who want managed rental income." },
  { icon: Camera, title: "Low-light zones", copy: "Reduced light pollution and landscape buffers designed for stargazing and rest." },
];

const locationPoints = [
  ["Mysore Expressway", "5 mins"],
  ["NICE Road", "25 mins"],
  ["Bengaluru city centre", "60 mins"],
  ["Art of Living International Center", "40 mins"],
  ["Hospital / clinic", "15 mins"],
  ["Hills and trek spots", "20-30 mins"],
];

function Logo() {
  return (
    <a
      href="#top"
      className="inline-flex items-center gap-2 bg-white/95 px-2 py-1.5 shadow-xl shadow-black/20 sm:gap-3 sm:px-3 sm:py-2"
      aria-label="Caaizen Realty The Retreat"
    >
      <Image
        src="/retreat/logos/caaizen-logo.png"
        alt="Caaizen Realty"
        width={451}
        height={201}
        priority
        className="h-7 w-auto sm:h-9 md:h-10"
      />
      <span className="h-8 w-px bg-[#182015]/18 sm:h-10" aria-hidden="true" />
      <Image
        src="/retreat/logos/the-retreat-logo.png"
        alt="The Retreat"
        width={732}
        height={352}
        priority
        className="h-8 w-auto sm:h-10 md:h-12"
      />
    </a>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#9e6f32]">
      {children}
    </p>
  );
}

export default function Home() {
  return (
    <main id="top" className="overflow-hidden">
      <section className="relative min-h-screen bg-[#10170f] text-white">
        <Image
          src="/retreat/forest-cottage-deck.png"
          alt="A forest cottage deck surrounded by dense greenery"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,18,11,0.88),rgba(12,18,11,0.58)_46%,rgba(12,18,11,0.26))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(201,162,93,0.2),transparent_30%)]" />

        <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-medium text-white/78 md:flex">
            <a className="transition hover:text-white" href="#location">Location</a>
            <a className="transition hover:text-white" href="#land">Land</a>
            <a className="transition hover:text-white" href="#amenities">Amenities</a>
            <a className="transition hover:text-white" href="#lead">Callback</a>
          </nav>
          <a
            href="tel:+919731199655"
            className="inline-flex h-10 items-center gap-2 border border-white/25 px-4 text-sm font-semibold text-white transition hover:border-[#c9a25d] hover:text-[#e0bd76]"
          >
            <Phone className="size-4" />
            <span className="hidden sm:inline">+91 97311 99655</span>
            <span className="sm:hidden">Call</span>
          </a>
        </header>

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-7xl items-center gap-10 px-5 pb-12 pt-10 md:grid-cols-[1fr_420px] md:px-8 md:pb-16">
          <div className="max-w-3xl animate-rise">
            <p className="mb-5 inline-flex items-center gap-2 border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#e0bd76] backdrop-blur">
              <MapPin className="size-4" />
              Bidadi, Bengaluru
            </p>
            <h1 className="font-display text-5xl font-semibold leading-[0.95] text-white md:text-7xl lg:text-8xl">
              The Retreat for land-led luxury living
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78 md:text-xl">
              A gated farmhouse community of expansive plots, compact cottages
              and edible gardens near Mysore Road. Built for buyers who want
              nature, privacy and long-term Bidadi growth in one address.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#lead"
                className="group inline-flex h-12 items-center justify-center gap-2 bg-[#c9a25d] px-6 text-sm font-bold uppercase tracking-[0.18em] text-[#10170f] transition hover:bg-[#e0bd76]"
              >
                Request callback
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </a>
              <a
                href="#details"
                className="inline-flex h-12 items-center justify-center border border-white/25 px-6 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:border-white hover:bg-white/10"
              >
                View highlights
              </a>
            </div>
          </div>

          <div id="lead" className="animate-rise-delayed md:sticky md:top-5">
            <LeadForm />
          </div>
        </div>
      </section>

      <DroneReel />

      <section id="details" className="bg-[#182015] px-5 py-7 text-white md:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          {highlights.map((item) => (
            <div key={item.label} className="border-l border-white/15 pl-5">
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">{item.label}</p>
              <p className="mt-2 font-sans text-4xl font-extrabold tracking-normal text-[#e0bd76] [font-variant-numeric:tabular-nums]">{item.value}</p>
              <p className="mt-1 text-sm leading-6 text-white/65">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="land" className="bg-[#f4f0e6] px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionLabel>Core proposition</SectionLabel>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight text-[#182015] md:text-6xl">
              Own land that gives back every season
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#4c5847]">
              The Retreat is positioned for people who do not want another apartment
              in the city. Each villa plot is planned around the privilege of
              growing food, slowing down, and using the land as a private
              weekend sanctuary or long-stay home.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {gardenFeatures.map((feature) => (
                <div key={feature} className="flex items-start gap-3 border border-[#d7c8aa] bg-white/55 p-4">
                  <Check className="mt-0.5 size-5 shrink-0 text-[#557247]" />
                  <span className="text-sm font-medium leading-6 text-[#35402f]">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-[520px] overflow-hidden bg-[#24301f]">
            <Image
              src="/retreat/edible-garden.png"
              alt="Raised edible garden beds with vegetables and herbs"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#10170f]/90 to-transparent p-6 text-white">
              <p className="max-w-md text-xl font-semibold">
                Professionally customised garden spaces, designed to thrive from day one.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <VillaCarousel images={villaImages} />
          <div>
            <SectionLabel>Community design</SectionLabel>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">
              Spacious, managed and intentionally low-chaos
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#4c5847]">
              The brochure points to a rare mix: private land ownership, a
              secure gated layout, nature-first amenities and optional hospitality
              management. That makes the project relevant for end-use, weekend
              retreat living and owners who want professional maintenance.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="border border-[#e1d7c6] p-5">
                <Clock className="size-6 text-[#9e6f32]" />
                <p className="mt-4 text-lg font-semibold">Weekend-ready</p>
                <p className="mt-2 text-sm leading-6 text-[#5e6759]">
                  Close enough for city access, far enough to reset without traffic noise.
                </p>
              </div>
              <div className="border border-[#e1d7c6] p-5">
                <Leaf className="size-6 text-[#557247]" />
                <p className="mt-4 text-lg font-semibold">Eco-conscious</p>
                <p className="mt-2 text-sm leading-6 text-[#5e6759]">
                  Compact cottages, passive design thinking and low-footprint living.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="location" className="bg-[#10170f] px-5 py-20 text-white md:px-8 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <SectionLabel>Location advantage</SectionLabel>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">
              Bidadi is the growth story. The Retreat is the quieter side of it.
            </h2>
            <p className="mt-6 text-lg leading-8 text-white/70">
              The project sits near Mysore Road with access to the Bidadi
              industrial corridor, NICE Road, forest reserves, hill trails and
              upcoming regional infrastructure narratives highlighted in the brochure.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {locationPoints.map(([place, time]) => (
              <div key={place} className="flex items-center justify-between border border-white/12 bg-white/[0.04] p-5">
                <span className="text-white/78">{place}</span>
                <span className="font-display text-2xl font-semibold text-[#e0bd76]">{time}</span>
              </div>
            ))}
            <div className="border border-[#c9a25d]/40 bg-[#c9a25d]/10 p-5 sm:col-span-2">
              <div className="flex items-start gap-3">
                <Car className="mt-1 size-5 text-[#e0bd76]" />
                <p className="text-sm leading-6 text-white/72">
                  Exact location and route details are best shared after callback
                  so interested buyers receive accurate navigation and availability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="amenities" className="bg-[#eef3e7] px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <SectionLabel>Lifestyle infrastructure</SectionLabel>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">
              Amenities that support stillness, family and resale confidence
            </h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {amenities.map((item) => (
              <article key={item.title} className="border border-[#d0dac6] bg-white p-6">
                <item.icon className="size-7 text-[#557247]" />
                <h3 className="mt-6 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#5e6759]">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <SectionLabel>Master plan</SectionLabel>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">
              Limited plotted layout with landscaped internal roads
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#4c5847]">
              The master plan has been thoughtfully designed with fewer than three plots per acre, creating a low-density gated community with modern infrastructure, designer landscapes, and well-planned access roads.
            </p>
          </div>
          <div className="overflow-hidden border border-[#e1d7c6] bg-[#6e7a5a] p-3">
            <Image
              src="/retreat/master-layout.jpeg"
              alt="Caaizen Retreat plotted master layout"
              width={1191}
              height={1685}
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      <section className="bg-[#182015] px-5 py-16 text-white md:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <p className="font-display text-4xl font-semibold leading-tight md:text-6xl">
              If you aspire to experience nature-inspired living in a resort-themed gated community surrounded by fresh air and pollution-free surroundings
            </p>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
              Submit your name and mobile number. The team will share current
              availability, pricing, visit slots and exact location details.
            </p>
          </div>
          <LeadForm compact />
        </div>
      </section>

      <footer className="bg-[#0b100a] px-5 py-8 text-white/55 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm leading-6 md:flex-row md:items-center md:justify-between">
          <p>Caaizen Realty · The Retreat · Bidadi, Bengaluru</p>
          <p>Conceptual visuals are for representation. Specifications may vary.</p>
        </div>
      </footer>
    </main>
  );
}
