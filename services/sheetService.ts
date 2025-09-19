import type { SheetRow, KnowledgeBase, KnowledgeBaseVariable } from '../types';

declare var XLSX: any;

export const parseExcel = (file: File): Promise<SheetRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: SheetRow[] = XLSX.utils.sheet_to_json(worksheet);
        resolve(json);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

const evaluateFormula = (formula: string, currentRow: SheetRow, previousRow: SheetRow | null, unit: KnowledgeBaseVariable['unit'], kbVariableKey?: string): number => {
  // Special case: In month 1, # of sales people equals the initial # of sales people. Hires from month 1 are added starting in month 2.
  if (kbVariableKey === 'sales_people' && !previousRow) {
    return Number(currentRow['initial_sales_people'] || 0);
  }

  let expression = formula;

  // Handle previous() function calls
  expression = expression.replace(/previous\((.*?)\)/g, (_, varName) => {
    const trimmedVarName = varName.trim();
    if (!previousRow) { // This is the first row of the sheet
      if (trimmedVarName === 'sales_people') {
        // Special case: For the first month, the "previous" number of sales people is the initial starting value.
        return String(currentRow['initial_sales_people'] || 0);
      }
      // For all other variables, the previous value is 0 for the first row.
      return '0';
    }
    return String(previousRow[trimmedVarName] || 0);
  });

  // Find all potential variable names in the formula.
  const variablesInFormula = [...new Set(formula.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [])];
  
  variablesInFormula.forEach(variable => {
    if (variable !== 'previous') {
      const regex = new RegExp(`\\b${variable}\\b`, 'g');
      // Look up the variable's value in the current row's context. Default to 0 if not found.
      // This prevents ReferenceError for fields not yet calculated in an iteration.
      const value = currentRow[variable] === undefined ? 0 : currentRow[variable];
      expression = expression.replace(regex, String(value));
    }
  });

  try {
    let result = new Function(`return ${expression}`)();
    // A formula like "1000 / 0" results in Infinity. We should treat this as 0.
    result = isFinite(result) ? result : 0;

    // For metrics that are counts (e.g., people, customers), round down to the nearest whole number.
    if (unit === 'count') {
      return Math.floor(result);
    }
    
    return result;

  } catch (e) {
    console.error(`Error evaluating formula "${formula}" as "${expression}":`, e);
    return 0; // Return 0 if formula fails
  }
};


export const recalculateSheet = (data: SheetRow[], kb: KnowledgeBase, startIndex: number = 0): SheetRow[] => {
  // Start with the portion of the data that doesn't need recalculation.
  const recalculatedData: SheetRow[] = data.slice(0, startIndex);
  const formulaEntries = Object.entries(kb.variables).filter(([, config]) => config.formula);
  const mutableKeys = Object.keys(kb.variables).filter(key => kb.variables[key].mutable);

  // Iterate over the slice of data that needs to be recalculated.
  data.slice(startIndex).forEach((row, relativeIndex) => {
    const absoluteIndex = startIndex + relativeIndex;
    let newRow = { ...row };
    const previousRow = absoluteIndex > 0 ? recalculatedData[absoluteIndex - 1] : null;

    // For mutable fields that are undefined, null, or blank in the current row,
    // carry over the value from the previous valid row.
    if (previousRow) {
      mutableKeys.forEach(key => {
        const currentValue = newRow[key];
        if (currentValue === null || currentValue === undefined || currentValue === '') {
           newRow[key] = previousRow[key];
        }
      });
    }
    
    // Iteratively calculate formulas to resolve dependencies. 5 passes should be enough for deep dependency chains.
    for (let i = 0; i < 5; i++) {
        formulaEntries.forEach(([key, config]) => {
            if (config.formula) {
                newRow[key] = evaluateFormula(config.formula, newRow, previousRow, config.unit, key);
            }
        });
    }
    recalculatedData.push(newRow);
  });
  return recalculatedData;
};

export const simulateMonths = (data: SheetRow[], months: number, kb: KnowledgeBase, overrides: SheetRow | null): SheetRow[] => {
  let extendedData = [...data];
  if (data.length === 0) return [];

  const formulaEntries = Object.entries(kb.variables).filter(([, config]) => config.formula);
  const simFormulaEntries = Object.entries(kb.variables).filter(([, config]) => config.sim_formula);

  for (let i = 0; i < months; i++) {
    const previousRow = extendedData[extendedData.length - 1];
    let newRow: SheetRow = {};

    // Carry over mutable values from the last row
    Object.entries(kb.variables).forEach(([key, config]) => {
      if (config.mutable) {
        newRow[key] = previousRow[key];
      }
    });
    
    // Apply user-defined overrides for the simulation
    if (overrides) {
        Object.entries(overrides).forEach(([key, value]) => {
            if (kb.variables[key]?.mutable) {
                newRow[key] = value;
            }
        });
    }

    // Set the new month number
    newRow.month = (previousRow.month as number) + 1;

    // Calculate special simulation formulas for mutable fields before the main pass.
    // This allows fields to be user-provided in the initial sheet but auto-calculated for simulations.
    for (let j = 0; j < 2; j++) {
        simFormulaEntries.forEach(([key, config]) => {
            if (config.sim_formula) {
                newRow[key] = evaluateFormula(config.sim_formula, newRow, previousRow, config.unit, key);
            }
        });
    }

    // Iteratively calculate standard formulas to resolve dependencies
    for (let j = 0; j < 5; j++) {
        formulaEntries.forEach(([key, config]) => {
            if (config.formula) {
                newRow[key] = evaluateFormula(config.formula, newRow, previousRow, config.unit, key);
            }
        });
    }

    extendedData.push(newRow);
  }
  return extendedData;
};


export const exportToExcel = (data: SheetRow[], kb: KnowledgeBase, fileName: string): void => {
  const orderedHeaders = Object.keys(kb.variables);
  
  // Create a worksheet with headers in the correct order
  const worksheetData = data.map(row => {
      const newRow: any = {};
      orderedHeaders.forEach(header => {
          newRow[header] = row[header];
      });
      return newRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(worksheetData, { header: orderedHeaders });
  
  // Set column headers from descriptions
  const headerDescriptions = orderedHeaders.map(key => kb.variables[key].description);
  XLSX.utils.sheet_add_aoa(worksheet, [headerDescriptions], { origin: "A1" });
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Financial Model');
  XLSX.writeFile(workbook, fileName);
};

export const exportSampleTemplate = (kb: KnowledgeBase, fileName:string, customerType: 'sme' | 'large'): void => {
    const orderedHeaders = Object.keys(kb.variables);
    const mutableHeaders = orderedHeaders.filter(key => kb.variables[key]?.mutable);

    const sampleData = Array.from({ length: 3 }, (_, i) => {
        const row: SheetRow = { month: i + 1 };
        
        if (customerType === 'large') {
            if (mutableHeaders.includes('initial_sales_people')) row['initial_sales_people'] = 5;
            if (mutableHeaders.includes('sales_rep_hired_per_month')) row['sales_rep_hired_per_month'] = (i === 0) ? 2 : 1;
            if (mutableHeaders.includes('large_customer_accounts_per_salesperson')) row['large_customer_accounts_per_salesperson'] = 1;
            if (mutableHeaders.includes('average_revenue_per_large_customer')) row['average_revenue_per_large_customer'] = 16500;
        }

        if (customerType === 'sme') {
            if (mutableHeaders.includes('revenue_share_for_marketing')) row['revenue_share_for_marketing'] = 35;
            if (mutableHeaders.includes('digital_marketing_spend')) row['digital_marketing_spend'] = 5000;
            if (mutableHeaders.includes('sme_cac')) row['sme_cac'] = 1500;
            if (mutableHeaders.includes('average_revenue_per_sme_customer')) row['average_revenue_per_sme_customer'] = 500;
        }
        
        orderedHeaders.forEach(h => {
            if (!row.hasOwnProperty(h)) {
                row[h] = '';
            }
        });

        return row;
    });

    const worksheetData = sampleData.map(row => {
      const newRow: any = {};
      orderedHeaders.forEach(header => {
          newRow[header] = row[header];
      });
      return newRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData, { header: orderedHeaders });
  
    const headerDescriptions = orderedHeaders.map(key => kb.variables[key].description);
    XLSX.utils.sheet_add_aoa(worksheet, [headerDescriptions], { origin: "A1" });
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample Data');
    XLSX.writeFile(workbook, fileName);
}