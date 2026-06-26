import { Utensils, Leaf, ChefHat } from "lucide-react";

const features = [
  {
    title: "Menu for every taste",
    desc: "Dolor sit amet, consectetur adipisicing elit et molestias possimus.",
    icon: <Utensils size={36} />,
  },
  {
    title: "Always fresh ingredients",
    desc: "Assumenda possimus eaque illa iste, autem. Porro eveniet autem.",
    icon: <Leaf size={36} />,
  },
  {
    title: "Experienced chefs",
    desc: "Rolorem, beatae dolorum, praesentium itaque et quam quaerat.",
    icon: <ChefHat size={36} />,
  },
];

export default function ChooseUs() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      {/* Dotted divider — full width on mobile, half on lg */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-14 sm:mb-20">
        <div className="w-full lg:w-1/2 lg:mx-auto border-t-4 border-dotted border-gray-200" />
      </div>

      {/* Heading */}
      <div className="max-w-2xl mx-auto text-center px-4 sm:px-6 mb-14 sm:mb-16">
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="h-[2px] w-10 bg-[#f5a623]" />
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-gray-400">
            Features
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#1b2a2f] font-bold leading-tight">
          Why people choose us?
        </h2>
        <p className="text-gray-500 text-sm sm:text-base mt-4">
          Porro eveniet, autem ipsam vitae consequatur!
        </p>
      </div>

      {/* Feature cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/*
          Layout:
            mobile (< sm)  → stacked column, each card full width
            sm → md        → 1 column still (small phones landscape)
            md             → 3 columns in a row
        */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6 lg:gap-12">
          {features.map((f, i) => (
            <FeatureCard key={i} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface Feature {
  title: string;
  desc: string;
  icon: React.ReactNode;
}

function FeatureCard({ feature: f, index }: { feature: Feature; index: number }) {
  return (
    <div
      className={`
        flex flex-col items-center text-center
        group relative
        ${index !== 2 ? "sm:border-r sm:border-dashed sm:border-gray-200" : ""}
        px-4 sm:px-6 lg:px-10
      `}
    >
      {/* Icon circle */}
      <div
        className="
          w-20 h-20 rounded-full
          flex items-center justify-center
          bg-gray-50 text-[#1b2a2f]
          border border-dashed border-gray-200
          mb-6
          transition-all duration-300
          group-hover:bg-[#f5a623] group-hover:text-white
          group-hover:border-[#f5a623]
          group-hover:shadow-lg group-hover:shadow-orange-100
        "
      >
        {f.icon}
      </div>

      {/* Title */}
      <h3 className="text-lg sm:text-xl font-bold font-serif text-[#1b2a2f] mb-3 leading-snug">
        {f.title}
      </h3>

      {/* Desc */}
      <p className="text-gray-500 text-sm leading-relaxed max-w-[260px]">
        {f.desc}
      </p>

      {/* Bottom accent line — appears on hover */}
      <div
        className="
          mt-6 h-[2px] w-0 bg-[#f5a623]
          transition-all duration-300
          group-hover:w-12
        "
      />
    </div>
  );
}