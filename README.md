# Stratifi AI

Rebuilding strategic finance from the ground up—faster, smarter, autonomous.

Stratifi AI is an intelligent financial modeling application that empowers users to build, simulate, and analyze financial projections using natural language. By uploading a simple Excel file, users can interact with their data through an AI-powered chat, instantly see the impact of changes, and export their results.

## ✨ Key Features

-   **🤖 AI-Powered Chat Interface**: Interact with your financial model using natural language. Update variables, run simulations, and query data effortlessly with our Gemini-powered chat.
-   **📈 Dynamic Financial Modeling**: Choose from pre-defined business models (Large Enterprise, SMB, or Hybrid) to kickstart your analysis.
-   **📄 Excel Integration**: Seamlessly import your existing financial data from `.xlsx` files and export your modeled projections back to Excel.
-   **📊 Interactive Visualizations**: Visualize your financial metrics over time with interactive charts and a detailed data table.
-   **🚀 Forward-Looking Simulations**: Project future financial performance by simulating upcoming months based on your custom inputs.
-   **⏪ Time Travel**: Easily undo and redo changes to your model, allowing for safe experimentation.
-   **💅 Modern UI/UX**: A clean, responsive interface with both light and dark modes for a comfortable user experience, featuring glassmorphism and subtle animations.
-   **🚀 Sample Templates**: Download pre-formatted Excel templates to get started quickly.

## 🛠️ Tech Stack

### Frontend

-   **React**: For building the user interface.
-   **TypeScript**: For type-safe code.
-   **Tailwind CSS**: For utility-first styling.
-   **Recharts**: For creating beautiful, interactive charts.

### AI & Data

-   **Google Gemini API (`@google/genai`)**: For natural language understanding and intent detection.
-   **SheetJS (xlsx)**: For parsing and generating Excel files directly in the browser.

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   A modern web browser.
-   A Google Gemini API key.

### Setup

This project is a static web application that runs entirely in the browser.

1.  **Set up your API Key**
    The application requires a Google Gemini API key to function. The application is configured to read this key from an environment variable named `API_KEY`. You must ensure this variable is available in the execution context where the app is served.

    For local development, you might use a tool that can inject environment variables into static files or a simple server that replaces placeholders. The key's availability is a hard requirement.

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

1.  **Select a Business Model**: On the home screen, choose the model that best fits your company: Large Enterprise, SMB, or Hybrid. This loads the correct financial logic.
2.  **Upload Your Data**:
    -   If you're new, click **Download Sample Template** to get an Excel file with the correct structure.
    -   Fill out the template with your initial data.
    -   Drag and drop your `.xlsx` file onto the upload area or click to browse.
3.  **Interact with the AI**:
    -   The main dashboard will load with your data visualized.
    -   Use the **Chat** panel on the right to give commands:
        -   **Update an input**: *"Set the number of sales reps hired per month to 3"*
        -   **Run a simulation**: *"Simulate 12 months ahead"*
        -   **Query your data**: *"What is the total revenue in month 10?"*
4.  **Adjust Inputs Manually**:
    -   Switch to the **Inputs** tab to see all the editable variables for your model.
    -   Manually change these values before running your next simulation.
5.  **Analyze and Export**:
    -   Review the updated charts, metrics dashboard, and data table.
    -   Use the **Undo** and **Redo** buttons to navigate through your changes.
    -   When you're satisfied, click the **Export** button to download the complete model as a new Excel file.

## 🏗️ Project Structure
