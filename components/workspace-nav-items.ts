import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BrainCircuit,
  Calendar,
  FileText,
  LayoutDashboard,
  Lightbulb,
  Video,
} from "lucide-react";

interface WorkspaceNavItem {
  href: string;
  label: string;
  feature: string;
  icon: LucideIcon;
}

export const WORKSPACE_NAV_ITEMS: WorkspaceNavItem[] = [
  { href: "/", label: "Creative Director", feature: "Dashboard", icon: LayoutDashboard },
  { href: "/brand", label: "Brand Strategist", feature: "Brand Brain", icon: BrainCircuit },
  { href: "/scripts", label: "Script Writer", feature: "Script Studio", icon: FileText },
  { href: "/ideas", label: "Content Strategist", feature: "Idea Hub", icon: Lightbulb },
  { href: "/studio", label: "Video Editor", feature: "Captions & Media", icon: Video },
  { href: "/analytics", label: "Performance Analyst", feature: "Analytics & CSV", icon: BarChart3 },
  { href: "/calendar", label: "Content Planner", feature: "Calendar", icon: Calendar },
];
