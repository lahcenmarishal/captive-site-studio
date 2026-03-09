export const getDefaultTechnologies = (type?: string | null): string[] => {
  const base = ["React", "TypeScript", "Tailwind CSS", "Node.js"];
  const withBackend = [...base, "Supabase"];

  switch (type) {
    case "Site vitrine":
      return base; // pas de backend
    case "Site vitrine personnalisé":
      return withBackend;
    case "Site vitrine professionnel":
      return withBackend;
    case "Site e-commerce":
    case "Application web":
    case "Plateforme SaaS":
    case "Marketplace":
    case "Blog":
      return withBackend;
    default:
      return withBackend;
  }
};

export const resolveTechnologies = (
  type?: string | null,
  technologies?: string[] | null,
): string[] => {
  const cleaned = (technologies ?? []).map((t) => t.trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned : getDefaultTechnologies(type);
};
