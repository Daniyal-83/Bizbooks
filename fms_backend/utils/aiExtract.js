/**
 * Heuristic fallback extractor when LlamaIndex Cloud is not available
 * This provides basic structured extraction using rule-based methods
 */

// Fallback heuristic extractor when AI is not available
function heuristicCategoryFromText(text) {
  const t = (text || '').toLowerCase();
  if (t.includes('payslip') || t.includes('salary') || t.includes('pay slip')) return 'salary';
  if (t.includes('bank') && (t.includes('statement') || t.includes('txn') || t.includes('transaction'))) return 'bank_statement';
  if (t.includes('cash flow')) return 'cash_flow';
  if (t.includes('profit and loss') || t.includes('p&l') || t.includes('report')) return 'report';
  return 'other';
}

function splitSmart(line) {
  if (!line) return [];
  // Try common delimiters
  if (line.includes('|')) return line.split('|').map(s => s.trim()).filter(Boolean);
  if (line.includes('\t')) return line.split('\t').map(s => s.trim()).filter(Boolean);
  // Collapse multiple spaces
  return line.trim().split(/\s{2,}/).map(s => s.trim()).filter(Boolean);
}

function heuristicExtractStructuredData(rawText) {
  const lines = (rawText || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let columns = [];
  const rows = [];
  const headerKeywords = ['s.no', 'sno', 'debit', 'credit', 'balance', 'amount', 'date', 'description'];
  
  for (let i = 0; i < Math.min(lines.length, 200); i++) {
    const parts = splitSmart(lines[i]);
    if (parts.length >= 3) {
      const hit = parts.filter(p => headerKeywords.some(k => p.toLowerCase().includes(k))).length;
      if (hit >= 2) { 
        columns = parts; 
        break; 
      }
    }
  }
  
  if (columns.length === 0) {
    // try first non-trivial line as header
    for (let i = 0; i < Math.min(lines.length, 50); i++) {
      const parts = splitSmart(lines[i]);
      if (parts.length >= 3) { 
        columns = parts; 
        break; 
      }
    }
  }
  
  if (columns.length > 0) {
    let started = false;
    for (let i = 0; i < lines.length; i++) {
      const parts = splitSmart(lines[i]);
      if (!started) { 
        if (parts.join(' ').toLowerCase() === columns.join(' ').toLowerCase()) { 
          started = true; 
        } 
        continue; 
      }
      if (parts.length >= Math.max(2, Math.floor(columns.length * 0.6))) {
        const row = {};
        for (let j = 0; j < columns.length && j < parts.length; j++) {
          row[columns[j]] = parts[j];
        }
        rows.push(row);
      }
      if (rows.length >= 50) break;
    }
  }
  
  const table = {
    name: 'Extracted Table',
    columns: columns.length ? columns : ['Line'],
    rows: columns.length ? rows : lines.slice(0, 30).map((l) => ({ Line: l })),
  };
  
  return {
    category: heuristicCategoryFromText(rawText),
    fields: {},
    tables: [table],
  };
}

module.exports = { 
  heuristicExtractStructuredData 
};
