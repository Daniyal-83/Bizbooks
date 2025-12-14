const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const LLAMA_CLOUD_API_BASE = 'https://api.cloud.llamaindex.ai/api/v1';

/**
 * LlamaIndex Cloud Extract API integration for structured data extraction
 * Documentation: https://developers.llamaindex.ai/python/cloud/llamaextract/getting_started/api/
 */

// Financial document extraction schema for LlamaIndex
const FINANCIAL_EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    category: {
      type: "string",
      enum: ["salary", "bank_statement", "cash_flow", "report", "other"],
      description: "Document category classification"
    },
    fields: {
      type: "object",
      properties: {
        employer: { 
          type: "string",
          description: "Employer or company name"
        },
        employee: { 
          type: "string",
          description: "Employee name"
        },
        period: { 
          type: "string",
          description: "Period or date range"
        },
        accountNumber: { 
          type: "string",
          description: "Account number if applicable"
        },
        totalIncome: { 
          type: "number",
          description: "Total income/credit/deposit amount (sum of all credits, deposits, receipts, inflows)"
        },
        totalExpense: { 
          type: "number",
          description: "Total expense/debit/withdrawal amount (sum of all debits, withdrawals, payments, outflows)"
        },
        net: { 
          type: "number",
          description: "Net amount (totalIncome - totalExpense), final balance, or closing balance"
        },
        date: {
          type: "string",
          description: "Document date, statement date, transaction date, or period (e.g., '2024-01-15' or 'January 2024')"
        },
        deposits: {
          type: "number",
          description: "Total deposits (for bank statements)"
        },
        withdrawals: {
          type: "number",
          description: "Total withdrawals (for bank statements)"
        },
        inflows: {
          type: "number",
          description: "Total cash inflows (for cash flow statements)"
        },
        outflows: {
          type: "number",
          description: "Total cash outflows (for cash flow statements)"
        },
        balance: {
          type: "number",
          description: "Final balance, closing balance, or account balance"
        },
        currency: { 
          type: "string",
          description: "Currency code (USD, EUR, etc.)"
        },
        notes: { 
          type: "string",
          description: "Additional notes or remarks"
        }
      }
    },
    tables: {
      type: "array",
      description: "Extracted tables from the document",
      items: {
        type: "object",
        properties: {
          name: { 
            type: "string",
            description: "Table name or identifier (e.g., 'Transactions', 'Earnings', 'Deductions')"
          },
          columns: { 
            type: "array",
            items: { type: "string" },
            description: "Column names"
          },
          rows: {
            type: "array",
            items: { 
              type: "object",
              description: "Row data as key-value pairs"
            },
            description: "Table rows"
          }
        },
        required: ["name", "columns", "rows"]
      }
    }
  },
  required: ["category", "fields", "tables"]
};

/**
 * Get or create extraction agent for financial documents
 */
async function getOrCreateExtractionAgent(apiKey, projectId = null) {
  const agentName = process.env.LLAMA_EXTRACTION_AGENT_NAME || 'fms_financial_extractor';
  
  try {
    // Try to get existing agent by name
    const getResponse = await axios.get(
      `${LLAMA_CLOUD_API_BASE}/extraction/extraction-agents/by-name/${agentName}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'accept': 'application/json'
        }
      }
    );
    
    if (getResponse.data && getResponse.data.id) {
      console.log(`Using existing extraction agent: ${agentName}`);
      return getResponse.data.id;
    }
  } catch (err) {
    // Agent doesn't exist, create it
    if (err.response?.status === 404) {
      console.log(`Creating new extraction agent: ${agentName}`);
    } else {
      throw new Error(`Failed to check agent: ${err.message}`);
    }
  }

  // Create new agent
  const createPayload = {
    name: agentName,
    data_schema: FINANCIAL_EXTRACTION_SCHEMA,
    config: {
      extraction_target: "PER_DOC",
      extraction_mode: "BALANCED"
    }
  };

  if (projectId) {
    createPayload.project_id = projectId;
  }

  const createResponse = await axios.post(
    `${LLAMA_CLOUD_API_BASE}/extraction/extraction-agents`,
    createPayload,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }
  );

  if (!createResponse.data || !createResponse.data.id) {
    throw new Error('Failed to create extraction agent');
  }

  console.log(`Created extraction agent: ${agentName} (${createResponse.data.id})`);
  return createResponse.data.id;
}

/**
 * Upload document to LlamaIndex Cloud
 */
async function uploadDocument(apiKey, filePath, originalName) {
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Determine content type from file extension
  const ext = filePath.toLowerCase().split('.').pop();
  const contentTypeMap = {
    'pdf': 'application/pdf',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'doc': 'application/msword',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'xls': 'application/vnd.ms-excel',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'ppt': 'application/vnd.ms-powerpoint'
  };
  const contentType = contentTypeMap[ext] || 'application/octet-stream';

  const formData = new FormData();
  formData.append('upload_file', fs.createReadStream(filePath), {
    filename: originalName,
    contentType: contentType
  });

  try {
    const response = await axios.post(
      `${LLAMA_CLOUD_API_BASE}/files`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'accept': 'application/json',
          ...formData.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 120000 // 2 minute timeout for large files
      }
    );

    if (!response.data || !response.data.id) {
      throw new Error('Failed to upload document to LlamaIndex Cloud - no file ID returned');
    }

    return response.data.id;
  } catch (err) {
    if (err.response) {
      throw new Error(`LlamaIndex upload failed: ${err.response.status} - ${err.response.data?.message || err.response.statusText}`);
    } else if (err.request) {
      throw new Error(`LlamaIndex upload failed: No response from server - ${err.message}`);
    } else {
      throw new Error(`LlamaIndex upload failed: ${err.message}`);
    }
  }
}

/**
 * Run extraction job
 */
async function runExtractionJob(apiKey, agentId, fileId) {
  const response = await axios.post(
    `${LLAMA_CLOUD_API_BASE}/extraction/jobs`,
    {
      extraction_agent_id: agentId,
      file_id: fileId
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.data || !response.data.id) {
    throw new Error('Failed to create extraction job');
  }

  return response.data.id;
}

/**
 * Poll extraction job status
 */
async function pollJobStatus(apiKey, jobId, maxAttempts = 30, intervalMs = 2000) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await axios.get(
      `${LLAMA_CLOUD_API_BASE}/extraction/jobs/${jobId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'accept': 'application/json'
        }
      }
    );

    const status = response.data?.status;
    
    if (status === 'SUCCESS') {
      return true;
    } else if (status === 'FAILED' || status === 'ERROR') {
      throw new Error(`Extraction job failed: ${response.data?.error || 'Unknown error'}`);
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error('Extraction job timeout - exceeded max polling attempts');
}

/**
 * Get extraction results
 */
async function getExtractionResults(apiKey, jobId) {
  const response = await axios.get(
    `${LLAMA_CLOUD_API_BASE}/extraction/jobs/${jobId}/result`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'accept': 'application/json'
      }
    }
  );

  return response.data;
}

/**
 * Main extraction function using LlamaIndex Cloud Extract API
 */
async function extractStructuredDataWithLlamaIndex(filePath, originalName) {
  const apiKey = process.env.LLAMA_CLOUD_API_KEY;
  if (!apiKey) {
    throw new Error('LLAMA_CLOUD_API_KEY not configured. Get your API key from https://cloud.llamaindex.ai');
  }

  const projectId = process.env.LLAMA_PROJECT_ID || null;
  let agentId, fileId, jobId;

  try {
    // Step 1: Get or create extraction agent
    console.log('[LlamaIndex] Getting/creating extraction agent...');
    agentId = await getOrCreateExtractionAgent(apiKey, projectId);

    // Step 2: Upload document
    console.log(`[LlamaIndex] Uploading document: ${originalName}...`);
    fileId = await uploadDocument(apiKey, filePath, originalName);
    console.log(`[LlamaIndex] Document uploaded with ID: ${fileId}`);

    // Step 3: Run extraction job
    console.log('[LlamaIndex] Starting extraction job...');
    jobId = await runExtractionJob(apiKey, agentId, fileId);
    console.log(`[LlamaIndex] Extraction job started with ID: ${jobId}`);

    // Step 4: Poll for completion
    console.log('[LlamaIndex] Polling for extraction results...');
    await pollJobStatus(apiKey, jobId);
    console.log('[LlamaIndex] Extraction job completed successfully');

    // Step 5: Get results
    console.log('[LlamaIndex] Retrieving extraction results...');
    const results = await getExtractionResults(apiKey, jobId);

    // Transform LlamaIndex results to our format
    const normalized = normalizeLlamaIndexResults(results);
    console.log(`[LlamaIndex] Extracted category: ${normalized.category}, tables: ${normalized.tables.length}`);
    return normalized;
  } catch (err) {
    const errorDetails = {
      message: err.message,
      agentId: agentId || 'not created',
      fileId: fileId || 'not uploaded',
      jobId: jobId || 'not started'
    };
    console.error('[LlamaIndex] Extraction error details:', errorDetails);
    throw new Error(`LlamaIndex extraction failed: ${err.message}`);
  }
}

/**
 * Normalize LlamaIndex extraction results to our format
 */
function normalizeLlamaIndexResults(results) {
  // Log raw response for debugging
  console.log('[LlamaIndex] Raw extraction results:', JSON.stringify(results, null, 2).substring(0, 1000));
  
  // LlamaIndex returns results in a specific format
  // Extract the structured data from the response
  let extractedData;
  
  // Handle different response structures
  if (results.data && Array.isArray(results.data) && results.data.length > 0) {
    // Multiple results (if PER_DOC mode)
    extractedData = results.data[0];
  } else if (results.data && typeof results.data === 'object') {
    // Single result object
    extractedData = results.data;
  } else if (results.result && typeof results.result === 'object') {
    // Alternative response format
    extractedData = results.result;
  } else if (typeof results === 'object' && results.category) {
    // Direct result object
    extractedData = results;
  } else {
    // Fallback: try to find any object with our expected fields
    extractedData = results;
  }

  // Ensure we have the expected structure
  const category = extractedData.category || 'other';
  const fields = extractedData.fields || {};
  const tables = Array.isArray(extractedData.tables) ? extractedData.tables : [];

  // Normalize table structures
  const normalizedTables = tables.map(t => ({
    name: t.name || 'Table',
    columns: Array.isArray(t.columns) ? t.columns : 
             (Array.isArray(t.rows) && t.rows[0] ? Object.keys(t.rows[0]) : []),
    rows: Array.isArray(t.rows) ? t.rows : []
  }));

  // If no tables but we have fields, create a summary table
  if (normalizedTables.length === 0 && Object.keys(fields).length > 0) {
    const fieldEntries = Object.entries(fields).filter(([k, v]) => v != null && v !== '');
    if (fieldEntries.length > 0) {
      normalizedTables.push({
        name: 'Document Information',
        columns: ['Field', 'Value'],
        rows: fieldEntries.map(([key, value]) => ({
          Field: key,
          Value: typeof value === 'object' ? JSON.stringify(value) : String(value)
        }))
      });
    }
  }

  console.log(`[LlamaIndex] Normalized: category=${category}, fields=${Object.keys(fields).length}, tables=${normalizedTables.length}`);
  
  return { category, fields, tables: normalizedTables };
}

module.exports = {
  extractStructuredDataWithLlamaIndex
};

