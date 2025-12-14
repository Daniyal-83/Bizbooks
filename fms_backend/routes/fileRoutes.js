const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const { PDFDocument, rgb } = require('pdf-lib');
const protect = require('../middleware/authMiddleware');
const File = require('../models/File');
const { extractStructuredDataWithLlamaIndex } = require('../utils/llamaExtract');
const { heuristicExtractStructuredData } = require('../utils/aiExtract');
const { buildCumulativeTable } = require('../utils/extractNormalizer');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const upload = multer({ storage });

const classifyCategory = (name = '') => {
  const lower = name.toLowerCase();
  if (lower.startsWith('salary')) return 'salary';
  if (lower.startsWith('bank') || lower.startsWith('bank statement') || lower.includes('statement')) return 'bank_statement';
  if (lower.startsWith('cash') || lower.includes('cash flow')) return 'cash_flow';
  if (lower.startsWith('report')) return 'report';
  return 'other';
};

// Helper: extract raw text from a PDF using LibreOffice to TXT
async function extractTextFromPdf(filePath) {
  const tempDir = path.join(uploadsDir, 'temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const librePaths = process.platform === 'win32' 
    ? [
        'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
        'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
        'C:\\Program Files\\LibreOffice 7\\program\\soffice.exe',
        'C:\\Program Files (x86)\\LibreOffice 7\\program\\soffice.exe',
        'soffice.exe'
      ]
    : ['/usr/bin/libreoffice', '/usr/local/bin/libreoffice', 'libreoffice'];

  let lastError = null;
  for (const librePath of librePaths) {
    try {
      if (!fs.existsSync(librePath) && !librePath.endsWith('soffice.exe')) continue;
      const args = [
        '--headless',
        '--invisible',
        '--nodefault',
        '--nolockcheck',
        '--nologo',
        '--norestore',
        '--convert-to', 'txt',
        '--outdir', tempDir,
        filePath,
      ];
      await execAsync(`"${librePath}" ${args.join(' ')}`, { timeout: 30000 });
      await new Promise(r => setTimeout(r, 500));
      const files = fs.readdirSync(tempDir).filter(f => f.endsWith('.txt'));
      if (files.length > 0) {
        // Pick the most recent txt file
        const chosen = files
          .map(f => ({ f, t: fs.statSync(path.join(tempDir, f)).mtime.getTime() }))
          .sort((a,b) => b.t - a.t)[0].f;
        const txtPath = path.join(tempDir, chosen);
        const text = fs.readFileSync(txtPath, 'utf8');
        try { fs.unlinkSync(txtPath); } catch (_) {}
        return text;
      }
    } catch (err) {
      lastError = err;
      continue;
    }
  }
  // Fallback
  if (lastError) throw lastError;
  throw new Error('Text extraction failed');
}

// Upload a file
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const relativePath = `uploads/${req.file.filename}`;
    // Use absolute URL when BACKEND_URL not provided
    const baseUrl = (process.env.BACKEND_URL && process.env.BACKEND_URL.trim().length > 0)
      ? process.env.BACKEND_URL.replace(/\/$/, '')
      : `${req.protocol}://${req.get('host')}`;
    const url = `${baseUrl}/${relativePath}`;

    const providedName = req.body?.originalName || req.file.originalname;
    // Use provided category or classify from filename
    const providedCategory = req.body?.category;
    const category = (providedCategory && ['salary', 'bank_statement', 'cash_flow', 'report', 'other'].includes(providedCategory))
      ? providedCategory
      : classifyCategory(providedName);

    const doc = await File.create({
      user: req.user.id,
      originalName: providedName,
      category,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: relativePath,
      url,
    });

    // Convert to PDF if not already PDF
    if (!req.file.mimetype.includes('pdf')) {
      // Set a timeout for conversion using direct LibreOffice command
      const conversionPromise = new Promise(async (resolve, reject) => {
        try {
          const inputPath = req.file.path;
          const inputName = path.basename(inputPath, path.extname(inputPath));
          const pdfPath = path.join(uploadsDir, `${inputName}.pdf`);
          
          // Try different LibreOffice paths
          const librePaths = process.platform === 'win32' 
            ? [
                'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
                'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
                'soffice.exe'
              ]
            : ['/usr/bin/libreoffice', '/usr/local/bin/libreoffice', 'libreoffice'];
          
          let conversionSuccess = false;
          
          for (let i = 0; i < librePaths.length; i++) {
            const currentPath = librePaths[i];
            
            try {
              // Use LibreOffice command line to convert
              const command = `"${currentPath}" --headless --convert-to pdf --outdir "${uploadsDir}" "${inputPath}"`;
              
              const { stdout, stderr } = await execAsync(command, { timeout: 30000 });
              
              // Check if PDF was created (LibreOffice creates PDF with same name as input)
              const expectedPdfPath = path.join(uploadsDir, `${inputName}.pdf`);
              
              if (fs.existsSync(expectedPdfPath)) {
                // Rename to our expected filename if needed
                if (expectedPdfPath !== pdfPath) {
                  fs.renameSync(expectedPdfPath, pdfPath);
                }
                conversionSuccess = true;
                break;
              }
            } catch (cmdErr) {
              if (i === librePaths.length - 1) {
                reject(cmdErr);
                return;
              }
            }
          }
          
          if (conversionSuccess) {
            // Update file record with PDF info
            const pdfRelativePath = `uploads/${inputName}.pdf`;
            const pdfUrl = `${baseUrl}/${pdfRelativePath}`;
            
            doc.previewUrl = pdfUrl;
            doc.previewPath = pdfRelativePath;
            await doc.save();
            resolve();
          } else {
            reject(new Error('PDF conversion failed with all LibreOffice paths'));
          }
        } catch (err) {
          reject(err);
        }
      });

      try {
        await Promise.race([
          conversionPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Conversion timeout')), 30000))
        ]);
      } catch (convertErr) {
        // Fallback: use original file as preview for supported types
        const supportedTypes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                               'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                               'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
        if (supportedTypes.includes(req.file.mimetype)) {
          doc.previewUrl = url;
          doc.previewPath = relativePath;
          await doc.save();
        }
      }
    } else {
      // For PDFs, use original file as preview
      doc.previewUrl = url;
      doc.previewPath = relativePath;
      await doc.save();
    }
    // Mark extraction as pending
    doc.extractionStatus = 'processing';
    await doc.save();

    // Respond immediately to client
    res.status(201).json(doc);

    // Kick off background extraction using LlamaIndex Cloud (best effort)
    ;(async () => {
      try {
        // Try original file first (LlamaIndex supports DOCX, PDF, etc. natively)
        const originalPath = path.isAbsolute(doc.path) 
          ? doc.path 
          : path.join(__dirname, '..', doc.path);
        
        // Also prepare PDF path as fallback
        const pdfPath = doc.previewPath 
          ? (path.isAbsolute(doc.previewPath) ? doc.previewPath : path.join(__dirname, '..', doc.previewPath))
          : null;

        let aiResult;
        let extractionMethod = 'none';
        
        try {
          // Try LlamaIndex Cloud extraction with original file first
          console.log(`[Extraction] Attempting LlamaIndex extraction for: ${doc.originalName}`);
          aiResult = await extractStructuredDataWithLlamaIndex(originalPath, doc.originalName);
          extractionMethod = 'llamaindex';
          console.log(`[Extraction] LlamaIndex extraction successful`);
        } catch (llamaErr) {
          console.warn(`[Extraction] LlamaIndex failed: ${llamaErr.message}`);
          
          // If original file failed and we have PDF, try PDF
          if (pdfPath && fs.existsSync(pdfPath) && originalPath !== pdfPath) {
            try {
              console.log(`[Extraction] Retrying LlamaIndex with PDF version`);
              aiResult = await extractStructuredDataWithLlamaIndex(pdfPath, doc.originalName);
              extractionMethod = 'llamaindex_pdf';
              console.log(`[Extraction] LlamaIndex PDF extraction successful`);
            } catch (pdfErr) {
              console.warn(`[Extraction] LlamaIndex PDF also failed: ${pdfErr.message}`);
              throw llamaErr; // Use original error
            }
          } else {
            throw llamaErr;
          }
        }

        // If LlamaIndex failed, try heuristic fallback
        if (!aiResult) {
          console.log(`[Extraction] Falling back to heuristic extraction`);
          try {
            // Try to extract text from PDF for heuristic
            const textSourcePath = pdfPath && fs.existsSync(pdfPath) ? pdfPath : originalPath;
            const rawText = await extractTextFromPdf(textSourcePath);
            aiResult = heuristicExtractStructuredData(rawText);
            extractionMethod = 'heuristic';
            console.log(`[Extraction] Heuristic extraction successful`);
          } catch (heuristicErr) {
            console.error(`[Extraction] Heuristic extraction failed: ${heuristicErr.message}`);
            // Last resort: use filename-based classification only
            aiResult = {
              category: classifyCategory(doc.originalName || ''),
              fields: {},
              tables: []
            };
            extractionMethod = 'filename_only';
            console.log(`[Extraction] Using filename-based classification only`);
          }
        }

        // Use AI-extracted category if available, otherwise use user-provided category
        const finalCategory = aiResult.category || doc.category || classifyCategory(doc.originalName || '');
        doc.extractedCategory = finalCategory;
        doc.extractedFields = aiResult.fields || {};
        doc.extractedTables = aiResult.tables || [];
        // Update main category if AI detected a different one
        if (aiResult.category && aiResult.category !== doc.category) {
          doc.category = aiResult.category;
          console.log(`[Extraction] Category updated from ${doc.category} to ${aiResult.category} based on AI analysis`);
        }
        doc.extractionStatus = 'completed';
        await doc.save();
        console.log(`[Extraction] Completed using method: ${extractionMethod}, category: ${finalCategory}, tables: ${aiResult.tables?.length || 0}`);
      } catch (bgErr) {
        console.error('[Extraction] Background extraction error:', bgErr);
        try {
          doc.extractionStatus = 'failed';
          doc.extractionError = bgErr.message || 'Unknown extraction error';
          await doc.save();
        } catch (saveErr) {
          console.error('[Extraction] Failed to save error status:', saveErr);
        }
      }
    })();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// List files for current user
router.get('/', protect, async (req, res) => {
  try {
    const files = await File.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch files' });
  }
});

// Rename/update a file's metadata
router.put('/:id', protect, async (req, res) => {
  try {
    const { originalName } = req.body;
    const file = await File.findOne({ _id: req.params.id, user: req.user.id });
    if (!file) return res.status(404).json({ message: 'File not found' });
    if (originalName) file.originalName = originalName;
    if (originalName) file.category = classifyCategory(originalName);
    await file.save();
    res.json(file);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update file' });
  }
});

// Summary of categories
router.get('/summary/categories', protect, async (req, res) => {
  try {
    const pipeline = [
      { $match: { user: new (require('mongoose').Types.ObjectId)(req.user.id) } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ];
    const result = await File.aggregate(pipeline);
    const summary = result.reduce((acc, cur) => { acc[cur._id || 'other'] = cur.count; return acc; }, {});
    res.json({ summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch summary' });
  }
});

// Delete a file
router.delete('/:id', protect, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, user: req.user.id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Remove original file from disk
    try {
      const absPath = path.isAbsolute(file.path) ? file.path : path.join(__dirname, '..', file.path);
      fs.unlinkSync(absPath);
    } catch (e) {
      // File not found, continue with DB deletion
    }

    // Remove PDF preview file from disk if it exists
    if (file.previewPath && file.previewPath !== file.path) {
      try {
        const pdfAbsPath = path.isAbsolute(file.previewPath) ? file.previewPath : path.join(__dirname, '..', file.previewPath);
        fs.unlinkSync(pdfAbsPath);
      } catch (e) {
        // PDF file not found, continue
      }
    }

    await file.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete file' });
  }
});

// Get PDF text content for editing
router.get('/:id/text', protect, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, user: req.user.id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Check if it's a PDF file or has a PDF preview
    if (!file.mimeType.includes('pdf') && !file.previewUrl) {
      return res.status(400).json({ message: 'File is not a PDF and has no PDF preview' });
    }

    // Use the PDF preview path if available, otherwise use the original path
    const filePath = file.previewPath 
      ? (path.isAbsolute(file.previewPath) ? file.previewPath : path.join(__dirname, '..', file.previewPath))
      : (path.isAbsolute(file.path) ? file.path : path.join(__dirname, '..', file.path));
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }

    // Use LibreOffice to convert PDF to text
    const librePaths = process.platform === 'win32' 
      ? [
          'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
          'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
          'C:\\Program Files\\LibreOffice 7\\program\\soffice.exe',
          'C:\\Program Files (x86)\\LibreOffice 7\\program\\soffice.exe',
          'soffice.exe'
        ]
      : ['/usr/bin/libreoffice', '/usr/local/bin/libreoffice', 'libreoffice'];

    const tempDir = path.join(uploadsDir, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Test if temp directory is writable
    try {
      const testFile = path.join(tempDir, 'test.txt');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      console.log(`Temp directory is writable: ${tempDir}`);
    } catch (err) {
      console.error(`Temp directory is not writable: ${tempDir}`, err.message);
    }

    let textExtracted = false;
    let extractedText = '';
    let lastError = null;

    console.log(`Attempting to extract text from: ${filePath}`);
    console.log(`File exists: ${fs.existsSync(filePath)}`);
    
    // Check PDF file size and basic info
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`PDF file size: ${stats.size} bytes`);
      console.log(`PDF file modified: ${stats.mtime}`);
    }

    for (const librePath of librePaths) {
      try {
        console.log(`Trying LibreOffice path: ${librePath}`);
        
        // Check if LibreOffice executable exists
        if (!fs.existsSync(librePath) && !librePath.endsWith('soffice.exe')) {
          console.log(`LibreOffice path does not exist: ${librePath}`);
          continue;
        }
        
        // Additional check for the first path that seemed to work
        if (librePath === 'C:\\Program Files\\LibreOffice\\program\\soffice.exe') {
          console.log(`Checking first LibreOffice path: ${librePath}`);
          console.log(`File exists: ${fs.existsSync(librePath)}`);
          if (fs.existsSync(librePath)) {
            const stats = fs.statSync(librePath);
            console.log(`File size: ${stats.size} bytes`);
            console.log(`File permissions: ${stats.mode.toString(8)}`);
          }
        }
        
        // Convert PDF to text using LibreOffice
        // Try different approaches for better compatibility
        const commandArgs = [
          '--headless',
          '--invisible',
          '--nodefault',
          '--nolockcheck',
          '--nologo',
          '--norestore',
          '--convert-to', 'txt',
          '--outdir', tempDir,
          filePath
        ];
        
        console.log(`Executing LibreOffice: ${librePath} ${commandArgs.join(' ')}`);
        
        const { stdout, stderr } = await execAsync(`"${librePath}" ${commandArgs.join(' ')}`, { 
          timeout: 30000,
          cwd: path.dirname(librePath), // Set working directory to LibreOffice directory
          maxBuffer: 1024 * 1024 * 10 // 10MB buffer
        });
        
        console.log(`LibreOffice stdout: ${stdout}`);
        if (stderr) console.log(`LibreOffice stderr: ${stderr}`);
        
        // Wait a moment for file system operations to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Find the generated text file
        const files = fs.readdirSync(tempDir);
        console.log(`Files in temp directory: ${files.join(', ')}`);
        
        const baseName = path.basename(filePath, path.extname(filePath));
        console.log(`Looking for text file with base name: ${baseName}`);
        
        // Look for any .txt file that might be the result
        // LibreOffice might create files with different naming patterns
        const txtFile = files.find(f => f.endsWith('.txt'));
        console.log(`Found text file: ${txtFile}`);
        
        // Also check if any file was created recently (within last 5 seconds)
        if (!txtFile) {
          const recentFiles = files.filter(f => {
            const filePath = path.join(tempDir, f);
            const stats = fs.statSync(filePath);
            const now = new Date();
            const fileTime = new Date(stats.mtime);
            return (now - fileTime) < 5000; // Created within last 5 seconds
          });
          console.log(`Recent files in temp directory: ${recentFiles.join(', ')}`);
        }
        
        if (txtFile) {
          const txtPath = path.join(tempDir, txtFile);
          extractedText = fs.readFileSync(txtPath, 'utf8');
          fs.unlinkSync(txtPath); // Clean up temp file
          textExtracted = true;
          console.log(`Successfully extracted text, length: ${extractedText.length}`);
          break;
        }
      } catch (err) {
        console.error(`LibreOffice path ${librePath} failed:`, err.message);
        lastError = err;
        // Try next LibreOffice path
        continue;
      }
    }

    if (!textExtracted) {
      console.error('All LibreOffice paths failed. Last error:', lastError?.message);
      
      // Provide a comprehensive fallback: allow user to create new content
      extractedText = `[PDF Content - Text extraction unavailable]\n\nThis PDF file could not be processed for text extraction.\nThis might be because:\n- The PDF is image-based (scanned document)\n- The PDF is password protected\n- LibreOffice is not properly configured\n- The PDF format is not supported\n\nFile Information:\n- Name: ${file.originalName}\n- Size: ${Math.round(file.size / 1024)} KB\n- Type: ${file.mimeType}\n- Uploaded: ${new Date(file.createdAt).toLocaleString()}\n\nYou can replace this text with your own content and save to create a new PDF with your text.`;
      textExtracted = true;
      console.log('Using fallback text content for PDF editing');
    }
    
    res.json({ 
      text: extractedText,
      pages: 1, // LibreOffice doesn't provide page count easily
      info: { title: file.originalName }
    });
  } catch (err) {
    console.error('Error extracting PDF text:', err);
    res.status(500).json({ message: 'Failed to extract PDF text' });
  }
});

// Update PDF with new text content
router.put('/:id/text', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text content is required' });

    const file = await File.findOne({ _id: req.params.id, user: req.user.id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Check if it's a PDF file or has a PDF preview
    if (!file.mimeType.includes('pdf') && !file.previewUrl) {
      return res.status(400).json({ message: 'File is not a PDF and has no PDF preview' });
    }

    // Use the PDF preview path if available, otherwise use the original path
    const originalPath = file.previewPath 
      ? (path.isAbsolute(file.previewPath) ? file.previewPath : path.join(__dirname, '..', file.previewPath))
      : (path.isAbsolute(file.path) ? file.path : path.join(__dirname, '..', file.path));
    
    if (!fs.existsSync(originalPath)) {
      return res.status(404).json({ message: 'Original file not found on disk' });
    }

    // Create a new PDF with the updated text
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();

    // Split text into lines and add to PDF
    const lines = text.split('\n');
    const fontSize = 12;
    const lineHeight = fontSize * 1.2;
    let currentPage = page;
    let y = height - 50;

    for (const line of lines) {
      if (y < 50) {
        // Add new page if needed
        currentPage = pdfDoc.addPage([600, 800]);
        y = currentPage.getSize().height - 50;
      }
      
      currentPage.drawText(line, {
        x: 50,
        y: y,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      
      y -= lineHeight;
    }

    // Save the new PDF
    const pdfBytes = await pdfDoc.save();
    const newFileName = `edited_${Date.now()}_${file.originalName}`;
    const newFilePath = path.join(uploadsDir, newFileName);
    
    fs.writeFileSync(newFilePath, pdfBytes);

    // Update file record
    const baseUrl = (process.env.BACKEND_URL && process.env.BACKEND_URL.trim().length > 0)
      ? process.env.BACKEND_URL.replace(/\/$/, '')
      : `${req.protocol}://${req.get('host')}`;
    
    const newUrl = `${baseUrl}/uploads/${newFileName}`;
    
    // Update the file record with new content
    file.path = `uploads/${newFileName}`;
    file.url = newUrl;
    file.previewUrl = newUrl;
    file.previewPath = `uploads/${newFileName}`;
    file.originalName = `edited_${file.originalName}`;
    
    await file.save();

    res.json(file);
  } catch (err) {
    console.error('Error updating PDF:', err);
    res.status(500).json({ message: 'Failed to update PDF' });
  }
});

// Apply text overlays onto an existing PDF (non-destructive overlay editing)
router.put('/:id/overlays', protect, async (req, res) => {
  try {
    const { overlays } = req.body;
    if (!Array.isArray(overlays) || overlays.length === 0) {
      return res.status(400).json({ message: 'Overlays array is required' });
    }

    const file = await File.findOne({ _id: req.params.id, user: req.user.id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Must have a PDF source (use PDF preview if available)
    if (!file.mimeType.includes('pdf') && !file.previewUrl) {
      return res.status(400).json({ message: 'File is not a PDF and has no PDF preview' });
    }

    const sourcePath = file.previewPath 
      ? (path.isAbsolute(file.previewPath) ? file.previewPath : path.join(__dirname, '..', file.previewPath))
      : (path.isAbsolute(file.path) ? file.path : path.join(__dirname, '..', file.path));

    if (!fs.existsSync(sourcePath)) {
      return res.status(404).json({ message: 'Source PDF not found on disk' });
    }

    // Load existing PDF
    const existingBytes = fs.readFileSync(sourcePath);
    const pdfDoc = await PDFDocument.load(existingBytes);

    // Apply overlays
    overlays.forEach((ov) => {
      if (!ov || typeof ov.text !== 'string') return;
      const pageIndex = Math.max(0, Math.min((Number(ov.page) || 1) - 1, pdfDoc.getPageCount() - 1));
      const page = pdfDoc.getPage(pageIndex);
      const x = Number(ov.x) || 50;
      const y = Number(ov.y) || 50;
      const size = Number(ov.size) || 12;
      const colorHex = (ov.color || '#000000').toString();

      // Simple hex to rgb converter (#RRGGBB)
      const parseHex = (hex) => {
        const h = hex.replace('#','');
        const r = parseInt(h.substring(0,2), 16) / 255;
        const g = parseInt(h.substring(2,4), 16) / 255;
        const b = parseInt(h.substring(4,6), 16) / 255;
        return rgb(isNaN(r)?0:r, isNaN(g)?0:g, isNaN(b)?0:b);
      };

      page.drawText(ov.text, {
        x,
        y,
        size,
        color: parseHex(colorHex),
      });
    });

    // Save updated PDF
    const updatedBytes = await pdfDoc.save();
    const newFileName = `edited_${Date.now()}_${file.originalName.endsWith('.pdf') ? file.originalName : file.originalName.replace(/\.[^/.]+$/, '') + '.pdf'}`;
    const newFilePath = path.join(uploadsDir, newFileName);
    fs.writeFileSync(newFilePath, updatedBytes);

    const baseUrl = (process.env.BACKEND_URL && process.env.BACKEND_URL.trim().length > 0)
      ? process.env.BACKEND_URL.replace(/\/$/, '')
      : `${req.protocol}://${req.get('host')}`;
    const newUrl = `${baseUrl}/uploads/${newFileName}`;

    // Update DB record to point to the new edited PDF
    file.path = `uploads/${newFileName}`;
    file.url = newUrl;
    file.previewUrl = newUrl;
    file.previewPath = `uploads/${newFileName}`;
    if (!file.originalName.toLowerCase().startsWith('edited_')) {
      file.originalName = `edited_${file.originalName}`;
    }
    await file.save();

    res.json(file);
  } catch (err) {
    console.error('Error applying overlays to PDF:', err);
    res.status(500).json({ message: 'Failed to apply overlays to PDF' });
  }
});

// Test LibreOffice installation
router.get('/test/libreoffice', protect, async (req, res) => {
  try {
    const librePaths = process.platform === 'win32' 
      ? [
          'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
          'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
          'C:\\Program Files\\LibreOffice 7\\program\\soffice.exe',
          'C:\\Program Files (x86)\\LibreOffice 7\\program\\soffice.exe',
          'soffice.exe'
        ]
      : ['/usr/bin/libreoffice', '/usr/local/bin/libreoffice', 'libreoffice'];

    const results = [];
    
    for (const librePath of librePaths) {
      try {
        const exists = fs.existsSync(librePath);
        results.push({
          path: librePath,
          exists: exists,
          accessible: false,
          error: null
        });

        if (exists || librePath.endsWith('soffice.exe')) {
          // Test if we can get version info
          const command = `"${librePath}" --version`;
          const { stdout, stderr } = await execAsync(command, { timeout: 10000 });
          
          results[results.length - 1].accessible = true;
          results[results.length - 1].version = stdout.trim();
        }
      } catch (err) {
        results[results.length - 1].error = err.message;
      }
    }

    res.json({
      platform: process.platform,
      results: results,
      workingPath: results.find(r => r.accessible)?.path || null
    });
  } catch (err) {
    console.error('LibreOffice test error:', err);
    res.status(500).json({ message: 'Test failed', error: err.message });
  }
});

// Get structured extraction for a single file
// List all files with structured data for the user (PLACE BEFORE param route)
router.get('/structured', protect, async (req, res) => {
  try {
    const files = await File.find({ user: req.user.id }).sort({ createdAt: -1 });
    const data = files.map(f => ({
      id: f._id,
      originalName: f.originalName,
      category: f.category,
      extractionStatus: f.extractionStatus,
      extractedCategory: f.extractedCategory,
      extractedFields: f.extractedFields,
      extractedTables: f.extractedTables,
      createdAt: f.createdAt,
    }));
    res.json({ items: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch structured list' });
  }
});

// Summary across categories for dashboard - returns cumulative tables
router.get('/summary/structured', protect, async (req, res) => {
  try {
    const files = await File.find({ user: req.user.id, extractionStatus: 'completed' }).sort({ createdAt: 1 });
    const summary = {};
    
    // Group files by category
    const filesByCategory = {};
    for (const f of files) {
      const cat = f.extractedCategory || f.category || 'other';
      if (!filesByCategory[cat]) filesByCategory[cat] = [];
      filesByCategory[cat].push(f);
    }
    
    // Build cumulative table for each category
    for (const [category, categoryFiles] of Object.entries(filesByCategory)) {
      if (categoryFiles.length > 0) {
        const cumulativeTable = buildCumulativeTable(categoryFiles, category);
        summary[category] = {
          count: categoryFiles.length,
          cumulativeTable: cumulativeTable
        };
      }
    }
    
    res.json({ summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch structured summary' });
  }
});

// Get structured extraction for a single file (PLACE AFTER static routes)
router.get('/:id/structured', protect, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, user: req.user.id });
    if (!file) return res.status(404).json({ message: 'File not found' });
    res.json({
      extractionStatus: file.extractionStatus,
      extractedCategory: file.extractedCategory,
      extractedFields: file.extractedFields,
      extractedTables: file.extractedTables,
      extractionError: file.extractionError || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch structured data' });
  }
});

module.exports = router;


