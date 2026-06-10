import { motion } from "framer-motion";
import { Sparkle } from "lucide-react";

interface Props {
  number: string;
  label: string;
  align?: "left" | "center";
}

const SectionLabel = ({ number, label, align = "left" }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.6 }}
    transition={{ duration: 0.5 }}
    className={`flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}
  >
    <Sparkle className="w-4 h-4 text-secondary fill-secondary/40" />
    <span className="font-heading text-sm tracking-wide text-foreground/90">
      {number}. {label}
    </span>
    <span className="h-px w-24 bg-gradient-to-r from-border to-transparent" />
  </motion.div>
);

export default SectionLabel;
