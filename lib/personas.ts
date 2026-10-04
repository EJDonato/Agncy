export const PERSONAS = {
  creativeDirector: {
    name: "Orson",
    role: "Creative Director",
    image: "/assets/persona-creative-director.png",
    greeting: "Let’s keep the whole content operation moving in one direction.",
  },
  brandStrategist: {
    name: "Vero",
    role: "Brand Strategist",
    image: "/assets/persona-brand-strategist.png",
    greeting: "Give me the voice and guardrails. I’ll keep every output on-brand.",
  },
  scriptWriter: {
    name: "Sera",
    role: "Script Writer",
    image: "/assets/persona-script-writer.png",
    greeting: "Bring me a premise. I’ll turn it into a hook, flow, and finish.",
  },
  contentStrategist: {
    name: "Vela",
    role: "Content Strategist",
    image: "/assets/persona-content-strategist.png",
    greeting: "Let’s find the tension that makes an idea worth watching.",
  },
  videoEditor: {
    name: "Kite",
    role: "Video Editor",
    image: "/assets/persona-video-editor.png",
    greeting: "Drop the footage here. I’ll help shape it for the final cut.",
  },
  performanceAnalyst: {
    name: "Axiom",
    role: "Performance Analyst",
    image: "/assets/persona-performance-analyst.png",
    greeting: "I’ll surface what held attention and what to repeat next time.",
  },
  contentPlanner: {
    name: "Navi",
    role: "Content Planner",
    image: "/assets/persona-content-planner.png",
    greeting: "Let’s turn finished ideas into a clear, realistic publishing rhythm.",
  },
} as const;

export type PersonaKey = keyof typeof PERSONAS;
