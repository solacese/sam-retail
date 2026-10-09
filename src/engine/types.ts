export type Resource = "inventory" | "security" | "reputation" | "cash";
export type Resources = Record<Resource, number>;
export type AgentId = "SAM" | "STOCKY" | "PENNY" | "SHIELD" | "SPARK";
export type Category =
  | "business"
  | "pattern"
  | "agent"
  | "message"
  | "decision"
  | "action"
  | "outcome";
export type Choice = "approve" | "reject" | "timeout";
export type Family =
  | "stock"
  | "supplier"
  | "fraud"
  | "review"
  | "promotion"
  | "staff"
  | "waste"
  | "equipment"
  | "delivery"
  | "cash"
  | "loyalty"
  | "resilience";
export interface RetailEvent {
  id: string;
  sequence: number;
  step: number;
  minute: number;
  topic: string;
  category: Category;
  source: string;
  data: Record<string, string | number | boolean>;
  correlationId?: string;
  causationId?: string;
  simulated: boolean;
}
export interface Operation {
  demand: number;
  stockCover: number;
  supplierDelay: number;
  promotion: number;
  queue: number;
  fraud: number;
  freshness: number;
  equipment: number;
  margin: number;
  loyalty: number;
  staff: number;
  volatility: number;
}
export interface Effect {
  delta: Resources;
  demand?: number;
  promotion?: number;
  delivery?: number;
  waste?: number;
  fraud?: number;
  staff?: number;
  equipment?: number;
  loyalty?: number;
  margin?: number;
  delay?: number;
  outcome: string;
}
export interface SituationTemplate {
  id: string;
  family: Family;
  title: string;
  situation: string;
  recommendation: string;
  approveLabel: string;
  rejectLabel: string;
  agent: AgentId;
  peer: AgentId;
  opinion: string;
  peerOpinion: string;
  approve: Effect;
  reject: Effect;
  minDay: number;
  threshold: number;
}
export interface Evidence {
  event: RetailEvent;
  fact: string;
}
export interface Proposal {
  id: string;
  template: SituationTemplate;
  evidence: Evidence[];
  rule: string;
  confidence: number;
  crisis: boolean;
  updated: boolean;
  updateReason?: string;
  recommendation: string;
  suggested: "approve" | "reject";
}
export interface Pending {
  due: number;
  kind: "delivery" | "waste" | "incident" | "campaign";
  amount: number;
  causedBy: string;
}
export interface History {
  family: Family;
  templateId: string;
  title: string;
  choice: Choice;
  delta: Resources;
  day: number;
  score: number;
  crisis: boolean;
  outcome: string;
}
export interface DayReport {
  day: number;
  revenue: number;
  profit: number;
  stockouts: number;
  fraud: number;
  satisfaction: number;
  interventions: number;
  score: number;
}
export interface ScoreBreakdown {
  survival: number;
  balance: number;
  profit: number;
  customers: number;
  crises: number;
  collaboration: number;
  penalties: number;
  total: number;
}
export interface GameState {
  seed: string;
  mode: "full" | "quick";
  day: number;
  turn: number;
  step: number;
  minutes: number;
  resources: Resources;
  ops: Operation;
  events: RetailEvent[];
  proposal: Proposal | null;
  pending: Pending[];
  history: History[];
  reports: DayReport[];
  revenue: number;
  profit: number;
  stockouts: number;
  fraudIncidents: number;
  waste: number;
  interventions: number;
  crisesManaged: number;
  delegated: boolean;
  status: "playing" | "report" | "won" | "lost";
  failure?: Resource;
  score: ScoreBreakdown;
  lastResult?: History;
}
