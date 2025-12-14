/**
 * Normalize extracted data into standardized cumulative table format
 * Each file becomes a single row: S.No | Date | Debit | Credit | Total
 */

/**
 * Extract summary row from extracted data
 * Returns a single row with: S.No, Date, Debit, Credit, Total
 */
function normalizeToSummaryRow(extractedData, fileIndex, fileName, createdAt) {
  const fields = extractedData.fields || {};
  const tables = extractedData.tables || [];
  
  // Extract date from fields or use file creation date
  let date = fields.date || fields.period || fields.transactionDate || fields.statementDate || createdAt.toISOString().split('T')[0];
  
  // Extract amounts from fields - support multiple field name variations
  let debit = 0;
  let credit = 0;
  let total = 0;
  
  // Debit variations (expenses, withdrawals, outflows, payments)
  // Priority: specific fields first, then general
  debit = parseFloat(
    fields.withdrawals || fields.outflows || fields.totalExpense || 
    fields.totalExpenses || fields.expenses || fields.outflow || 
    fields.payments || fields.debit || fields.debits || 0
  ) || 0;
  
  // Credit variations (income, deposits, inflows, receipts)
  // Priority: specific fields first, then general
  credit = parseFloat(
    fields.deposits || fields.inflows || fields.totalIncome || 
    fields.totalIncomes || fields.income || fields.inflow || 
    fields.receipts || fields.credit || fields.credits || 0
  ) || 0;
  
  // Total variations (net, balance, total, amount, final balance)
  // Priority: balance first (most common), then net, then others
  total = parseFloat(
    fields.balance || fields.net || fields.finalBalance || 
    fields.closingBalance || fields.total || fields.amount || 
    fields.netAmount || 0
  ) || 0;
  
  // If total not provided, calculate from debit/credit
  if (total === 0 && (debit > 0 || credit > 0)) {
    total = credit - debit;
  }
  
  // If no fields or amounts are zero, try to extract from tables
  if (debit === 0 && credit === 0 && total === 0 && tables.length > 0) {
    for (const table of tables) {
      const rows = table.rows || [];
      const columns = table.columns || [];
      
      // Find column indices for common column names
      const debitCols = columns.map((col, idx) => 
        col && col.toLowerCase().includes('debit') ? idx : -1
      ).filter(idx => idx >= 0);
      
      const creditCols = columns.map((col, idx) => 
        col && (col.toLowerCase().includes('credit') || col.toLowerCase().includes('deposit') || 
                col.toLowerCase().includes('income') || col.toLowerCase().includes('receipt')) ? idx : -1
      ).filter(idx => idx >= 0);
      
      const amountCols = columns.map((col, idx) => 
        col && (col.toLowerCase().includes('amount') || col.toLowerCase().includes('total') || 
                col.toLowerCase().includes('balance') || col.toLowerCase().includes('net')) ? idx : -1
      ).filter(idx => idx >= 0);
      
      const expenseCols = columns.map((col, idx) => 
        col && (col.toLowerCase().includes('expense') || col.toLowerCase().includes('withdrawal') || 
                col.toLowerCase().includes('payment') || col.toLowerCase().includes('outflow')) ? idx : -1
      ).filter(idx => idx >= 0);
      
      // Sum values from all rows
      for (const row of rows) {
        // Try column-based extraction first
        if (columns.length > 0 && Array.isArray(row)) {
          // Row is an array
          debitCols.forEach(idx => { if (row[idx]) debit += parseFloat(row[idx]) || 0; });
          creditCols.forEach(idx => { if (row[idx]) credit += parseFloat(row[idx]) || 0; });
          amountCols.forEach(idx => { if (row[idx]) total += parseFloat(row[idx]) || 0; });
          expenseCols.forEach(idx => { if (row[idx]) debit += parseFloat(row[idx]) || 0; });
        } else if (typeof row === 'object') {
          // Row is an object - try all possible key variations
          Object.keys(row).forEach(key => {
            const keyLower = key.toLowerCase();
            const value = parseFloat(row[key]) || 0;
            
            // Debit patterns
            if (keyLower.includes('debit') || keyLower.includes('expense') || 
                keyLower.includes('withdrawal') || keyLower.includes('payment') ||
                keyLower.includes('outflow') || keyLower.includes('spent')) {
              debit += value;
            }
            // Credit patterns
            else if (keyLower.includes('credit') || keyLower.includes('deposit') || 
                     keyLower.includes('income') || keyLower.includes('receipt') ||
                     keyLower.includes('inflow') || keyLower.includes('received')) {
              credit += value;
            }
            // Amount/Total patterns
            else if (keyLower.includes('amount') || keyLower.includes('total') || 
                     keyLower.includes('balance') || keyLower.includes('net') ||
                     keyLower.includes('sum') || keyLower.includes('value')) {
              // If it's clearly a credit amount, add to credit
              if (keyLower.includes('credit') || keyLower.includes('income') || 
                  keyLower.includes('deposit') || keyLower.includes('receipt')) {
                credit += value;
              }
              // If it's clearly a debit amount, add to debit
              else if (keyLower.includes('debit') || keyLower.includes('expense') || 
                       keyLower.includes('withdrawal') || keyLower.includes('payment')) {
                debit += value;
              }
              // Otherwise, add to total
              else {
                total += value;
              }
            }
          });
        }
      }
    }
    
    // If still no total, calculate
    if (total === 0 && (debit > 0 || credit > 0)) {
      total = credit - debit;
    }
  }
  
  // Extract date from tables if not found
  if (!date || date === createdAt.toISOString().split('T')[0]) {
    for (const table of tables) {
      const rows = table.rows || [];
      const columns = table.columns || [];
      
      // Find date column index
      const dateColIdx = columns.findIndex(col => 
        col && (col.toLowerCase().includes('date') || col.toLowerCase().includes('period'))
      );
      
      for (const row of rows) {
        if (dateColIdx >= 0 && Array.isArray(row) && row[dateColIdx]) {
          date = String(row[dateColIdx]);
          break;
        } else if (typeof row === 'object') {
          const dateKey = Object.keys(row).find(key => 
            key.toLowerCase().includes('date') || key.toLowerCase().includes('period')
          );
          if (dateKey && row[dateKey]) {
            date = String(row[dateKey]);
            break;
          }
        }
      }
      if (date && date !== createdAt.toISOString().split('T')[0]) break;
    }
  }
  
  return {
    'S.No': fileIndex,
    'Date': date || createdAt.toISOString().split('T')[0],
    'Debit': debit.toFixed(2),
    'Credit': credit.toFixed(2),
    'Total': total.toFixed(2),
    '_fileName': fileName, // Internal field for reference
    '_fileId': null // Will be set by caller
  };
}

/**
 * Build cumulative table from all files in a category
 */
function buildCumulativeTable(files, category) {
  const columns = ['S.No', 'Date', 'Debit', 'Credit', 'Total'];
  const rows = [];
  
  // Sort files by creation date
  const sortedFiles = [...files].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
  sortedFiles.forEach((file, index) => {
    const extractedData = {
      fields: file.extractedFields || {},
      tables: file.extractedTables || []
    };
    
    const row = normalizeToSummaryRow(
      extractedData,
      index + 1,
      file.originalName,
      new Date(file.createdAt)
    );
    
    // Add file ID for reference
    row._fileId = file._id.toString();
    
    rows.push(row);
  });
  
  return {
    name: `${category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')} Overview`,
    columns: columns,
    rows: rows
  };
}

module.exports = {
  normalizeToSummaryRow,
  buildCumulativeTable
};

