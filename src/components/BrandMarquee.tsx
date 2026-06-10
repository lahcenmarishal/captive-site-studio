const brands = ["Chargemap", "greenly", "GROWL", "Ramify", "Vibe Co.", "Nimbus", "Lumen", "Atlas"];

const BrandMarquee = () => (
  <div className="relative overflow-hidden py-10 border-y border-border/40 bg-card/30 backdrop-blur-sm">
    <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
    <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
    <div className="flex gap-16 animate-marquee whitespace-nowrap">
      {[...brands, ...brands, ...brands].map((b, i) => (
        <span
          key={i}
          className="font-heading text-2xl md:text-3xl font-bold text-muted-foreground/60 hover:text-foreground transition-colors"
        >
          {b}
        </span>
      ))}
    </div>
  </div>
);

export default BrandMarquee;
