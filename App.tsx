import React, { useState, useCallback, useEffect } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { DataTable } from './components/DataTable';
import { FileUpload } from './components/FileUpload';
import { Header } from './components/Header';
import { ExportButton } from './components/ExportButton';
import { FinancialChart } from './components/FinancialChart';
import { HistoryControls } from './components/HistoryControls';
import { CustomerTypeSelector } from './components/CustomerTypeSelector';
import { KNOWLEDGE_BASES } from './constants';
import { getIntentFromQuery } from './services/geminiService';
import { parseExcel, recalculateSheet, simulateMonths, exportToExcel, exportSampleTemplate } from './services/sheetService';
import type { SheetRow, ChatMessage, GeminiIntent, KnowledgeBase } from './types';

interface HistoryState {
  past: SheetRow[][];
  present: SheetRow[] | null;
  future: SheetRow[][];
}

const App: React.FC = () => {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: null,
    future: [],
  });
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isBotLoading, setIsBotLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [customerType, setCustomerType] = useState<'sme' | 'large' | null>(null);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null);

  useEffect(() => {
    if (customerType) {
        setKnowledgeBase(KNOWLEDGE_BASES[customerType]);
        if (customerType === 'large') {
            setSelectedMetrics(['total_revenues', 'cumulative_large_customers']);
        } else {
            setSelectedMetrics(['total_revenues', 'cumulative_sme_customers']);
        }
    } else {
        setKnowledgeBase(null);
        setSelectedMetrics([]);
    }
  }, [customerType]);

  const sheetData = history.present;
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const handleMetricSelectionChange = (metric: string) => {
    setSelectedMetrics(prev => {
        const isSelected = prev.includes(metric);
        if (isSelected) {
            return prev.filter(m => m !== metric);
        }
        if (prev.length < 2) {
            return [...prev, metric];
        }
        return prev; // Do nothing if limit of 2 is reached
    });
  };

  const handleFileUpload = async (file: File) => {
    setError(null);
    if (!knowledgeBase) {
      setError("An error occurred. Please select a business model again.");
      return;
    }
    try {
      const rawData = await parseExcel(file);

      // Create a mapping from the human-readable description back to the internal key
      // This is necessary because the exported sample uses descriptions as headers.
      const descriptionToKeyMap = Object.fromEntries(
        Object.entries(knowledgeBase.variables).map(([key, config]) => [config.description, key])
      );
      
      // Remap the data from the sheet to use the internal keys expected by the application logic
      const data = rawData.map(row => {
        const newRow: SheetRow = {};
        for (const descriptionKey in row) {
          const internalKey = descriptionToKeyMap[descriptionKey];
          if (internalKey) {
            newRow[internalKey] = row[descriptionKey];
          }
        }
        return newRow;
      });

      const recalculatedData = recalculateSheet(data, knowledgeBase);
      setHistory({
        past: [],
        present: recalculatedData,
        future: [],
      });
      setChatHistory([
        { sender: 'bot', text: 'Sheet uploaded successfully! You can now ask me to make changes or simulate future months.' }
      ]);
    } catch (err) {
      console.error(err);
      setError('Failed to process the Excel file. Please ensure it has the correct columns for the selected model.');
      setHistory({ past: [], present: null, future: [] });
    }
  };

  const addMessageToHistory = (sender: 'user' | 'bot', text: string) => {
    setChatHistory(prev => [...prev, { sender, text }]);
  };

  const handleSendMessage = useCallback(async (message: string) => {
    addMessageToHistory('user', message);
    setIsBotLoading(true);

    try {
      if (!knowledgeBase) {
        addMessageToHistory('bot', "An internal error occurred. Please refresh and select a model.");
        setIsBotLoading(false);
        return;
      }
      
      const intent: GeminiIntent = await getIntentFromQuery(message, knowledgeBase);
      let botResponse = "I've updated the sheet and recalculated all dependent values.";
      let stateChanged = false;
      let nextData: SheetRow[] | null = null;
      
      if (!history.present) {
          addMessageToHistory('bot', "Please upload a sheet first.");
          setIsBotLoading(false);
          return;
      }

      let currentData = [...history.present];

      switch (intent.intent) {
        case 'UPDATE_VARIABLE': {
          const { variable, value, month } = intent.params;
          if (variable && !knowledgeBase.variables[variable]?.mutable) {
            botResponse = `The variable "${knowledgeBase.variables[variable]?.description || variable}" cannot be directly modified as it is calculated automatically.`;
            break;
          }
          if (month && month > 0 && month <= currentData.length) {
            currentData[month - 1][variable] = value;
          } else {
            currentData = currentData.map(row => ({ ...row, [variable]: value }));
          }
          nextData = recalculateSheet(currentData, knowledgeBase);
          stateChanged = true;
          break;
        }
        case 'SIMULATE': {
          const { months } = intent.params;
          nextData = simulateMonths(currentData, months, knowledgeBase);
          botResponse = `OK, I've simulated ${months} months ahead.`;
          stateChanged = true;
          break;
        }
        case 'GET_INFO': {
             botResponse = `I am an AI assistant for the CFO's office. I can help you model financial data based on the provided knowledge base. You can ask me to update variables (e.g., "set sales people to 10") or simulate future periods (e.g., "simulate 6 months ahead").`;
             break;
        }
        default:
          botResponse = "Sorry, I didn't understand that request. Please try asking in a different way.";
      }

      if (stateChanged && nextData) {
        const dataForHistory = nextData;
        setHistory(current => ({
          past: [...current.past, current.present!],
          present: dataForHistory,
          future: [],
        }));
      }

      addMessageToHistory('bot', botResponse);
    } catch (err) {
      console.error(err);
      addMessageToHistory('bot', 'An error occurred while processing your request. Please try again.');
    } finally {
      setIsBotLoading(false);
    }
  }, [history, knowledgeBase]);
  
  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    setHistory(current => {
      const previous = current.past[current.past.length - 1];
      const newPast = current.past.slice(0, current.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [current.present!, ...current.future],
      };
    });
  }, [canUndo]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    setHistory(current => {
      const next = current.future[0];
      const newFuture = current.future.slice(1);
      return {
        past: [...current.past, current.present!],
        present: next,
        future: newFuture,
      };
    });
  }, [canRedo]);

  const handleExport = () => {
    if (sheetData && knowledgeBase) {
      exportToExcel(sheetData, knowledgeBase, 'MyCFO_Model_Export.xlsx');
    }
  };

  const handleDownloadSample = () => {
    if (customerType && knowledgeBase) {
      const fileName = `MyCFO_Sample_Template_${customerType.toUpperCase()}.xlsx`;
      exportSampleTemplate(knowledgeBase, fileName, customerType);
    }
  };

  const renderContent = () => {
    if (!customerType) {
      return <CustomerTypeSelector onSelectType={setCustomerType} />;
    }
    if (!sheetData || !knowledgeBase) {
      return <FileUpload onFileUpload={handleFileUpload} onDownloadSample={handleDownloadSample} error={error} />;
    }
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Financial Metrics Over Time</h2>
            <FinancialChart 
              data={sheetData} 
              knowledgeBase={knowledgeBase} 
              selectedMetrics={selectedMetrics}
              onMetricChange={handleMetricSelectionChange}
            />
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Financial Model</h2>
              <div className="flex items-center gap-4">
                <HistoryControls
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  canUndo={canUndo}
                  canRedo={canRedo}
                />
                <ExportButton onExport={handleExport} />
              </div>
            </div>
            <DataTable data={sheetData} knowledgeBase={knowledgeBase} />
          </div>
        </div>
        <div className="mt-8 lg:mt-0">
           <ChatPanel
            messages={chatHistory}
            onSendMessage={handleSendMessage}
            isLoading={isBotLoading}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;