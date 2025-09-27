# Stratifi AI

An AI-powered application designed to automate and streamline financial modeling and projections. Stratifi AI leverages natural language prompts and a defined knowledge base to make strategic finance faster, smarter, and more autonomous.

## ✨ Key Features

- **🤖 AI-Powered Chat Interface**: Interact with your financial model using natural language. Update variables, run simulations, and query data effortlessly with our Gemini-powered chat.
- **📈 Dynamic Financial Modeling**: Choose from pre-defined business models (Large Enterprise, SMB, or Hybrid) to kickstart your analysis.
- **📄 Excel Integration**: Seamlessly import your existing financial data from `.xlsx` files and export your modeled projections back to Excel.
- **📊 Interactive Visualizations**: Visualize your financial metrics over time with interactive charts and a detailed data table.
- **🚀 Forward-Looking Simulations**: Project future financial performance by simulating upcoming months based on your custom inputs.
- **⏪ Time Travel**: Easily undo and redo changes to your model, allowing for safe experimentation.
- **💅 Modern UI/UX**: A clean, responsive interface with both light and dark modes for a comfortable user experience.
- **🚀 Sample Templates**: Download pre-formatted Excel templates to get started quickly.

## 🛠️ Tech Stack

- **Frontend**: [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI**: [Google Gemini API](https://ai.google.dev/) (`@google/genai`)
- **Charting**: [Recharts](https://recharts.org/)
- **Excel Processing**: [SheetJS (xlsx)](https://sheetjs.com/)

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- A modern web browser.
- A Google Gemini API key.

### Setup

This project is configured to run in a modern web development environment that supports ES modules.

1.  **Set up your API Key**
    The application requires a Google Gemini API key to function. You must set this key as an environment variable named `API_KEY`. How you do this depends on your deployment environment. For local development with a server, you might use a `.env` file:
    ```
    API_KEY="YOUR_GEMINI_API_KEY"
    ```
    *Note: The current code in `services/geminiService.ts` directly reads `process.env.API_KEY`. Ensure your development server or build tool is configured to handle environment variables.*

2.  **Run the application**
    Since this is a static application, you can serve `index.html` using any simple web server. A popular choice is `serve`:
    ```sh
    # Install serve globally if you haven't already
    npm install -g serve

    # Serve the project directory from its root folder
    serve .
    ```
    The application will then be available at the URL provided by the server (e.g., `http://localhost:3000`).

## 📖 How to Use

1.  **Select a Business Model**: On the home screen, choose the model that best fits your company: Large Enterprise, SMB, or Hybrid.
2.  **Upload Your Data**:
    - If you're new, click **Download Sample Template** to get an Excel file with the correct structure for your chosen model.
    - Fill out the template with your initial data.
    - Drag and drop your `.xlsx` file onto the upload area or click to browse.
3.  **Interact with the AI**:
    - The main dashboard will load with your data visualized.
    - Use the **Chat** panel on the right to give commands:
      - **Update a variable**: *"Set the number of sales reps hired per month to 3"*
      - **Run a simulation**: *"Simulate 12 months ahead"*
      - **Query your data**: *"What is the total revenue in month 10?"*
4.  **Adjust Inputs Manually**:
    - Switch to the **Inputs** tab to see all the mutable variables for your model.
    - Manually change these values before running your next simulation.
5.  **Analyze and Export**:
    - Review the updated charts, metrics dashboard, and data table.
    - Use the **Undo** and **Redo** buttons to navigate through your changes.
    - When you're satisfied, click the **Export** button to download the complete model as a new Excel file.
