# 📋 Complete Workflow & Data Flow Documentation

## 🎯 Overview

This document explains the complete workflow and data flow for the Financial Management System (FMS) document upload and extraction process.

---

## 🔄 Complete Workflow Diagram

```
User Upload → Frontend → Backend → LlamaIndex Cloud → Database → Dashboard
```

---

## 📝 Step-by-Step Workflow

### **Step 1: User Upload (Frontend - Processor.jsx)**

**Location:** `fms/src/pages/Processor.jsx`

**User Actions:**
1. User selects a file (PDF, DOCX, XLSX, PPTX, etc.)
2. User optionally enters a custom file name
3. **User selects a category** from dropdown:
   - Salary
   - Bank Statement
   - Cash Flow
   - Report
   - Other

**Frontend Code:**
```javascript
const formData = new FormData();
formData.append("file", selectedFile);
formData.append("originalName", nameInput);  // Optional
formData.append("category", categoryInput);    // Required
```

**API Call:**
- Endpoint: `POST /api/files`
- Service: `uploadFile(formData)` from `fms/src/services/api.js`
- Method: FormData upload with credentials

---

### **Step 2: Backend Receives Upload (Backend - fileRoutes.js)**

**Location:** `fms_backend/routes/fileRoutes.js`

**Backend Processing:**
1. **Authentication Check:** `protect` middleware validates JWT token
2. **File Storage:** Multer saves file to `uploads/` directory
3. **Category Assignment:**
   - Uses user-provided category if valid
   - Falls back to filename-based classification if invalid
4. **Database Record Creation:**
   ```javascript
   File.create({
     user: req.user.id,
     originalName: providedName,
     category: category,  // User-provided or auto-detected
     mimeType: req.file.mimetype,
     size: req.file.size,
     path: relativePath,
     url: fileUrl,
     extractionStatus: 'pending'
   })
   ```

5. **PDF Conversion (if needed):**
   - Non-PDF files are converted to PDF using LibreOffice
   - PDF stored as `previewPath` and `previewUrl`

6. **Immediate Response:**
   - Returns file document to frontend (status 201)
   - User sees "Upload successful" message

---

### **Step 3: Background Extraction Process**

**Location:** `fms_backend/routes/fileRoutes.js` (async background job)

**Extraction Pipeline:**

#### **3.1 Primary: LlamaIndex Cloud Extraction**

**Location:** `fms_backend/utils/llamaExtract.js`

**Process:**
1. **Get/Create Extraction Agent:**
   - Checks if agent `fms_financial_extractor` exists
   - Creates agent with financial document schema if not exists
   - Agent schema includes: category, fields, tables

2. **Upload Document to LlamaIndex Cloud:**
   - Uploads original file (DOCX, PDF, etc.) to LlamaIndex Cloud
   - LlamaIndex supports multiple formats natively
   - Returns `fileId`

3. **Run Extraction Job:**
   - Creates extraction job with agent ID and file ID
   - Returns `jobId`

4. **Poll for Completion:**
   - Polls job status every 2 seconds
   - Maximum 30 attempts (60 seconds total)
   - Waits for status: `SUCCESS`, `FAILED`, or `ERROR`

5. **Get Results:**
   - Retrieves structured extraction results
   - Contains: category, fields, tables

**Extraction Schema:**
```json
{
  "category": "salary|bank_statement|cash_flow|report|other",
  "fields": {
    "employer": "string",
    "employee": "string",
    "period": "string",
    "accountNumber": "string",
    "totalIncome": number,
    "totalExpense": number,
    "net": number,
    "currency": "string",
    "notes": "string"
  },
  "tables": [
    {
      "name": "Transactions",
      "columns": ["S.No", "Date", "Description", "Debit", "Credit", "Balance"],
      "rows": [
        { "S.No": "1", "Date": "2024-01-01", ... }
      ]
    }
  ]
}
```

#### **3.2 Fallback: Heuristic Extraction**

**Location:** `fms_backend/utils/aiExtract.js`

**Triggered When:**
- LlamaIndex API key not configured
- LlamaIndex extraction fails
- Network/timeout errors

**Process:**
1. Extract text from PDF using LibreOffice
2. Parse text for table structures
3. Detect headers (S.No, Debit, Credit, Balance, etc.)
4. Extract rows based on delimiters (|, tabs, spaces)
5. Classify category from text keywords

#### **3.3 Last Resort: Filename Classification**

**Triggered When:**
- All extraction methods fail
- Uses filename-based category detection

---

### **Step 4: Save Extracted Data to Database**

**Location:** `fms_backend/routes/fileRoutes.js`

**Database Update:**
```javascript
doc.extractedCategory = aiResult.category || doc.category;
doc.extractedFields = aiResult.fields;
doc.extractedTables = aiResult.tables;
doc.extractionStatus = 'completed';

// Update main category if AI detected different one
if (aiResult.category && aiResult.category !== doc.category) {
  doc.category = aiResult.category;
}

await doc.save();
```

**MongoDB Document Structure:**
```javascript
{
  _id: ObjectId,
  user: ObjectId,              // User who uploaded
  originalName: "file.docx",
  category: "salary",           // User-provided or AI-detected
  extractedCategory: "salary", // AI-extracted category
  extractedFields: {
    employer: "Company Name",
    employee: "John Doe",
    period: "January 2024",
    totalIncome: 5000
  },
  extractedTables: [
    {
      name: "Earnings",
      columns: ["Type", "Amount"],
      rows: [
        { Type: "Basic Salary", Amount: 4000 },
        { Type: "Bonus", Amount: 1000 }
      ]
    }
  ],
  extractionStatus: "completed", // pending|processing|completed|failed
  extractionError: null,
  previewUrl: "http://...",
  createdAt: Date,
  updatedAt: Date
}
```

---

### **Step 5: Dashboard Display**

**Location:** `fms/src/pages/Dashboard.jsx`

**Data Fetching:**
1. **API Call:** `GET /api/files/summary/structured`
   - Service: `getStructuredSummary()` from `fms/src/services/api.js`
   - Returns summary grouped by category

2. **Data Structure:**
   ```javascript
   {
     summary: {
       salary: {
         count: 5,
         sampleTables: [table1, table2, table3]
       },
       bank_statement: {
         count: 3,
         sampleTables: [table1]
       }
     }
   }
   ```

3. **Frontend Display:**
   - Shows category cards with document counts
   - Displays sample tables for each category
   - Tables show: columns and first 10 rows
   - Auto-refreshes every 3 seconds (10 times) to catch new extractions

**Dashboard Components:**
- Category summary cards
- Structured data tables per category
- Real-time updates via polling

---

## 🔗 API Endpoints

### **File Upload**
- **POST** `/api/files`
- **Body:** FormData (file, originalName, category)
- **Response:** File document with `extractionStatus: 'processing'`

### **Get Structured Summary**
- **GET** `/api/files/summary/structured`
- **Response:** Summary grouped by category with sample tables

### **Get Structured Data for File**
- **GET** `/api/files/:id/structured`
- **Response:** Extraction status, fields, tables for specific file

### **List All Structured Data**
- **GET** `/api/files/structured`
- **Response:** All files with their extracted data

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│   User      │
│  Uploads    │
│   File +    │
│  Category   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Frontend       │
│  Processor.jsx  │
│  FormData       │
└──────┬──────────┘
       │ POST /api/files
       ▼
┌─────────────────┐
│  Backend        │
│  fileRoutes.js  │
│  1. Save file   │
│  2. Create DB   │
│  3. Convert PDF │
└──────┬──────────┘
       │
       ├──► Immediate Response (201)
       │    └──► Frontend shows "Upload successful"
       │
       └──► Background Job (async)
            │
            ├──► LlamaIndex Cloud
            │    ├──► Upload document
            │    ├──► Run extraction
            │    └──► Get structured data
            │
            ├──► Fallback: Heuristic
            │    └──► Text extraction + parsing
            │
            └──► Save to MongoDB
                 ├──► extractedCategory
                 ├──► extractedFields
                 └──► extractedTables
                      │
                      ▼
┌─────────────────┐
│   Dashboard     │
│   Polls API     │
│   Displays      │
│   Tables        │
└─────────────────┘
```

---

## 🔑 Key Components

### **Frontend:**
- `Processor.jsx` - Upload form with category selection
- `Dashboard.jsx` - Displays extracted data by category
- `api.js` - API service functions

### **Backend:**
- `fileRoutes.js` - File upload and extraction orchestration
- `llamaExtract.js` - LlamaIndex Cloud integration
- `aiExtract.js` - Heuristic fallback extraction
- `File.js` - MongoDB schema/model

### **External Services:**
- **LlamaIndex Cloud** - AI-powered structured extraction
- **LibreOffice** - PDF conversion and text extraction
- **MongoDB** - Data storage

---

## ⚙️ Configuration

### **Required Environment Variables:**

**Backend (.env):**
```env
MONGO_URI=mongodb://localhost:27017/fms
JWT_SECRET=your_secret
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
LLAMA_CLOUD_API_KEY=your_llama_api_key  # Get from https://cloud.llamaindex.ai
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🎯 Category Handling Logic

1. **User Selection:** User chooses category in upload form
2. **Initial Assignment:** Backend uses user category or filename-based detection
3. **AI Override:** LlamaIndex can detect and override category if different
4. **Final Category:** 
   - `category` field = User-provided or AI-detected
   - `extractedCategory` field = AI-detected category (if available)

---

## 📈 Extraction Status Flow

```
pending → processing → completed
                    ↓
                  failed
```

- **pending:** File uploaded, extraction not started
- **processing:** Extraction job running
- **completed:** Extraction successful, data saved
- **failed:** Extraction failed, error message saved

---

## 🔍 Error Handling

1. **LlamaIndex Fails:** Falls back to heuristic extraction
2. **Heuristic Fails:** Uses filename-based classification
3. **All Fail:** Sets `extractionStatus: 'failed'` with error message
4. **User Feedback:** Dashboard shows extraction status

---

## 🚀 Performance

- **Upload Response:** Immediate (< 1 second)
- **Extraction Time:** 
  - LlamaIndex: 10-60 seconds (depends on document size)
  - Heuristic: 2-5 seconds
- **Dashboard Polling:** Every 3 seconds (10 attempts = 30 seconds)

---

## 📝 Summary

1. **User uploads file + selects category** → Frontend
2. **Backend saves file + creates DB record** → Immediate response
3. **Background job extracts data** → LlamaIndex Cloud (primary) or heuristic (fallback)
4. **Structured data saved to MongoDB** → Category, fields, tables
5. **Dashboard displays extracted tables** → Grouped by category, auto-refreshes

The system is designed to be resilient with multiple fallback mechanisms ensuring data extraction always completes, even if AI services are unavailable.


