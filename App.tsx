import React, { useState, useCallback, useEffect } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { DataTable } from './components/DataTable';
import { FileUpload } from './components/FileUpload';
import { Header } from './components/Header';
import { ExportButton } from './components/ExportButton';
import { FinancialChart } from './components/FinancialChart';
import { HistoryControls } from './components/HistoryControls';
import { CustomerTypeSelector } from './components/CustomerTypeSelector';
import { VariableControls } from './components/VariableControls';
import { MetricsDashboard } from './components/MetricsDashboard';
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
  const [simulationInputs, setSimulationInputs] = useState<SheetRow | null>(null);

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
        setSimulationInputs(null);
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

      const descriptionToKeyMap = Object.fromEntries(
        Object.entries(knowledgeBase.variables).map(([key, config]) => [config.description, key])
      );
      
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
      
      if (recalculatedData.length > 0) {
        const lastRow = recalculatedData[recalculatedData.length - 1];
        const mutableInputs: SheetRow = {};
        Object.entries(knowledgeBase.variables).forEach(([key, config]) => {
          if (config.mutable) {
            mutableInputs[key] = lastRow[key];
          }
        });
        setSimulationInputs(mutableInputs);
      }
      
      setChatHistory([
        { sender: 'bot', text: 'Sheet uploaded successfully! You can now ask me to make changes or simulate future months.' }
      ]);
    } catch (err) {
      console.error(err);
      setError('Failed to process the Excel file. Please ensure it has the correct columns for the selected model.');
      setHistory({ past: [], present: null, future: [] });
      setSimulationInputs(null);
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
        return;
      }
      
      if (!history.present) {
          addMessageToHistory('bot', "Please upload a sheet first.");
          return;
      }

      const intent: GeminiIntent = await getIntentFromQuery(message, knowledgeBase, history.present);
      let botResponse = "I've updated the sheet and recalculated all dependent values.";
      let stateChanged = false;
      let nextData: SheetRow[] | null = null;
      
      let currentData = [...history.present];

      switch (intent.intent) {
        case 'UPDATE_VARIABLE': {
          const { variable, value } = intent.params || {};

          if (!variable || typeof value !== 'number' || isNaN(value)) {
              botResponse = "I seem to be missing the variable or a valid numerical value to perform the update. Please try again and be more specific.";
              break;
          }
          
          const variableConfig = knowledgeBase.variables[variable];
          if (!variableConfig) {
              botResponse = `The variable "${variable}" is not recognized in the current financial model.`;
              break;
          }
          if (!variableConfig.mutable) {
              botResponse = `The variable "${variableConfig.description}" cannot be directly modified as it is calculated automatically.`;
              break;
          }

          setSimulationInputs(prev => ({ ...prev, [variable]: value }));
          botResponse = `OK, I've set "${variableConfig.description}" to ${value} for the next simulation. To see the results, ask me to simulate.`;
          break;
        }
        case 'SIMULATE': {
          const { months } = intent.params;
          if (!months || typeof months !== 'number' || months <= 0) {
              botResponse = "Please specify a valid number of months to simulate.";
              break;
          }
          nextData = simulateMonths(currentData, months, knowledgeBase, simulationInputs);
          botResponse = `OK, I've simulated ${months} months ahead using your specified inputs.`;
          stateChanged = true;
          break;
        }
        case 'QUERY_DATA': {
          botResponse = intent.answer || "I found the information, but there was an issue displaying it.";
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
  }, [history, knowledgeBase, simulationInputs]);
  
  const handleVariableChange = useCallback((variable: string, value: number) => {
    setSimulationInputs(prev => {
        if (!prev) return null;
        return { ...prev, [variable]: value };
    });
  }, []);

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
      <>
        {sheetData.length > 0 && (
          <MetricsDashboard
            lastRow={sheetData[sheetData.length - 1]}
            knowledgeBase={knowledgeBase}
            customerType={customerType}
          />
        )}
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
              <div className="sticky top-8 flex flex-col gap-8">
                  <ChatPanel
                      messages={chatHistory}
                      onSendMessage={handleSendMessage}
                      isLoading={isBotLoading}
                  />
                  <VariableControls 
                      knowledgeBase={knowledgeBase}
                      simulationInputs={simulationInputs}
                      onVariableChange={handleVariableChange}
                  />
            </div>
          </div>
        </div>
      </>
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
