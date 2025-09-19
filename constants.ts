import type { KnowledgeBase } from "./types";

// Fix: Explicitly type `largeCustomerVariables` to match the `KnowledgeBase` interface.
const largeCustomerVariables: KnowledgeBase['variables'] = {
    "month": { "description": "Month", "unit": "count", "mutable": false },
    "initial_sales_people": { "description": "Initial # of Sales People", "unit": "count", "mutable": true, "hidden": true },
    "sales_rep_hired_per_month": { "description": "# of sales reps hired per month", "unit": "count", "mutable": true },
    "sales_people": { "description": "# of sales people", "unit": "count", "mutable": false, "formula": "previous(sales_people) + sales_rep_hired_per_month" },
    "large_customer_accounts_per_salesperson": { "description": "# of large customer accounts signed per month/salesperson", "unit": "count", "mutable": true },
    "large_customer_accounts_onboarded": { "description": "# of large customer accounts onboarded per month", "formula": "sales_people * large_customer_accounts_per_salesperson", "unit": "count", "mutable": false },
    "cumulative_large_customers": { "description": "Cumulative # of large paying customers", "formula": "previous(cumulative_large_customers) + large_customer_accounts_onboarded", "unit": "count", "mutable": false },
    "average_revenue_per_large_customer": { "description": "Average revenue per large customer", "unit": "currency", "mutable": true },
    "total_revenues": { "description": "Total Revenues", "formula": "cumulative_large_customers * average_revenue_per_large_customer", "unit": "currency", "mutable": false }
};

// Fix: Explicitly type `smeCustomerVariables` to match the `KnowledgeBase` interface.
const smeCustomerVariables: KnowledgeBase['variables'] = {
    "month": { "description": "Month", "unit": "count", "mutable": false },
    "revenue_share_for_marketing": { "description": "Revenue Share for Marketing Spend (%)", "unit": "%", "mutable": true },
    "digital_marketing_spend": { "description": "Digital marketing spend per month", "unit": "currency", "mutable": true, "sim_formula": "previous(digital_marketing_spend) + (previous(total_revenues) * (revenue_share_for_marketing / 100))" },
    "sme_cac": { "description": "SME customer acquisition cost", "unit": "currency", "mutable": true },
    "sme_customers_onboarded": { "description": "New SME paying customers onboarded per month", "formula": "digital_marketing_spend / sme_cac", "unit": "count", "mutable": false },
    "cumulative_sme_customers": { "description": "Cumulative total of SME customers", "formula": "previous(cumulative_sme_customers) + sme_customers_onboarded", "unit": "count", "mutable": false },
    "average_revenue_per_sme_customer": { "description": "Average monthly revenue per SME customer", "unit": "currency", "mutable": true },
    "revenue_from_sme_clients": { "description": "Monthly revenue from SME clients", "formula": "cumulative_sme_customers * average_revenue_per_sme_customer", "unit": "currency", "mutable": false },
    "total_revenues": { "description": "Total Revenues", "formula": "revenue_from_sme_clients", "unit": "currency", "mutable": false }
};

export const KNOWLEDGE_BASES: { [key in 'sme' | 'large']: KnowledgeBase } = {
  large: {
    variables: largeCustomerVariables
  },
  sme: {
    variables: smeCustomerVariables
  }
};