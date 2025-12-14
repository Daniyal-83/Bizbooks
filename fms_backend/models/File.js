const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalName: { type: String, required: true },
  category: { type: String, enum: ['salary','bank_statement','cash_flow','report','other'], default: 'other' },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
  url: { type: String, required: true },
  previewUrl: { type: String },
  previewPath: { type: String },
  extractionStatus: { type: String, enum: ['pending','processing','completed','failed'], default: 'pending' },
  extractedCategory: { type: String },
  extractedFields: { type: Object },
  extractedTables: [
    {
      name: { type: String },
      columns: [{ type: String }],
      rows: [{ type: Object }]
    }
  ],
  extractionError: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);


