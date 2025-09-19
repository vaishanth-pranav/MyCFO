# Stratifi AI

<p align="center">
  <a href="#" target="_blank">
    <img src="https://raw.githubusercontent.com/user-attachments/assets/7a345511-9a70-4318-8d4e-63f5d564883f" alt="Stratifi AI Logo" width="80">
  </a>
</p>

<h1 align="center">Stratifi AI</h1>

<p align="center">
  Rebuilding strategic finance from the ground up—faster, smarter, autonomous.
  <br />
  <br />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
</p>

---

**Stratifi AI** is a revolutionary financial modeling application that leverages the power of Google's Gemini AI to transform complex spreadsheet operations into simple, conversational commands. It empowers CFOs, founders, and financial analysts to build, simulate, and analyze financial models with unprecedented speed and intuition.

## ✨ Key Features

- **🤖 Conversational AI Interface**: Interact with your financial model using natural language. Update variables, run simulations, and query data just by chatting.
- **📈 Dynamic Calculation Engine**: All calculations are interconnected. A change to one variable instantly and accurately ripples through the entire model.
- **📊 Multiple Business Models**: Get started instantly with pre-configured knowledge bases for **Large Enterprise**, **SMB**, or **Hybrid** go-to-market strategies.
- **🎨 Interactive Visualizations**: Understand your financial trajectory at a glance with a responsive dashboard and interactive charts powered by Recharts.
- **🔮 Advanced Scenario Simulation**: Project future months based on a set of mutable inputs. Effortlessly conduct "what-if" analysis to inform strategic decisions.
- **💾 Excel Compatibility**: Seamlessly import your existing data via `.xlsx` files and export your finished models for reporting or offline analysis.
- **🕰️ Full History Control**: Easily navigate through your changes with unlimited undo and redo capabilities, giving you the freedom to experiment.

## 🚀 How to Use

1.  **Select Your Model**: Choose the business model that best fits your company (Large Enterprise, SMB, or Hybrid).
2.  **Provide Your Data**:
    -   Click **Download Sample Template** to get a pre-formatted Excel file.
    -   Fill it with your initial data.
    -   Drag-and-drop or click to upload the file.
3.  **Chat with the AI**:
    -   Use the chat panel to modify your model. Try prompts like:
        -   *"Set the average revenue per large customer to 25000"*
        -   *"What is the total number of SME customers in month 6?"*
    -   Use the "Inputs" tab to see and fine-tune all the variables you can change.
4.  **Simulate the Future**:
    -   Ask the AI to project forward:
        -   *"Simulate 12 months ahead"*
        -   *"Project the next 2 years"*
5.  **Analyze & Export**:
    -   Review the updated metrics on the dashboard, the interactive chart, and the main data table.
    -   Click the **Export** button to download your new, comprehensive model as an Excel file.

## 🛠️ Technology Stack

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **AI Engine**: Google Gemini API (`@google/genai`)
-   **Charting**: Recharts
-   **Excel Parsing**: SheetJS (`xlsx`)

## ⚙️ Project Structure

The project is organized to separate concerns, making it modular and maintainable.

```
/
├── components/         # Reusable React components (UI elements)
│   ├── ChatPanel.tsx
│   ├── DataTable.tsx
│   └── ...
├── services/           # Core business logic
│   ├── geminiService.ts  # Logic for interacting with the Gemini API
│   └── sheetService.ts   # Calculation engine for the financial model
├── index.html          # Main HTML entry point
├── App.tsx             # Main application component, state management
├── constants.ts        # Knowledge bases and core model definitions
└── types.ts            # Global TypeScript type definitions
```

## 🔒 Environment Configuration

This application requires a Google Gemini API key to function.

-   Create a `.env` file in the root of the project.
-   Add your API key to the file:
    ```
    API_KEY=your_google_api_key_here
    ```
This key is used by `geminiService.ts` to make requests to the AI model.

---
_This project was built to demonstrate the future of intelligent, autonomous financial tooling._