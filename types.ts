export type SheetRow = {
  [key: string]: string | number;
};

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export interface KnowledgeBaseVariable {
  description: string;
  unit: 'count' | 'currency' | '%';
  mutable: boolean;
  formula?: string;
  sim_formula?: string;
  hidden?: boolean;
}

export interface KnowledgeBase {
  variables: {
    [key: string]: KnowledgeBaseVariable;
  };
}

export type GeminiIntent = {
  intent: 'UPDATE_VARIABLE' | 'SIMULATE' | 'GET_INFO' | 'QUERY_DATA' | 'UNKNOWN';
  params: {
    variable?: string;
    value?: number;
    month?: number;
    months?: number;
    [key: string]: any;
  };
  answer?: string;
};

// Fix: Add FinancialRow type to resolve import error in ResultsTable.tsx.
export interface FinancialRow {
  metric: string;
  formula: string;
  [key: string]: string | number;
}