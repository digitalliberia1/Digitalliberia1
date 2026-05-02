import {
  TrendingUp,
  Store,
  Briefcase,
  Landmark,
  IdCard,
  Building2,
  ArrowRight,
} from "lucide-react";

export const ICONS = {
  "trending-up": TrendingUp,
  store: Store,
  briefcase: Briefcase,
  landmark: Landmark,
  "id-card": IdCard,
  "building-2": Building2,
  "arrow-right": ArrowRight,
};

export function ServiceIcon({ name, size = 24, className = "" }) {
  const Cmp = ICONS[name] || TrendingUp;
  return <Cmp size={size} className={className} aria-hidden="true" strokeWidth={1.6} />;
}
