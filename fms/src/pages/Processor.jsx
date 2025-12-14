import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import ErrorMessage from "../components/UI/ErrorMessage";
import { uploadFile } from "../services/api";
import "../styles/Pages.css";

export default function Processor() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [categoryInput, setCategoryInput] = useState("other");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastFile, setLastFile] = useState(null);
  
  useEffect(() => {}, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("category", categoryInput);
      
      const { data } = await uploadFile(formData);
      
      setSelectedFile(null);
      setCategoryInput("other");
      setLastFile(data);
    } catch (err) {
      setError(`Upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  

  if (!user) {
    return (
      <div className="page-error">
        <ErrorMessage title="Unauthorized" message="Please log in to access Processor." showGoHome={true} onGoHome={() => (window.location.href = "/login")} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Document Uploader</h1>
      <p>Upload a document and select its category. The system will automatically extract structured data using AI.</p>

      <form onSubmit={handleUpload} className="upload-form">
        <input
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          required
        />
        <select
          value={categoryInput}
          onChange={(e) => setCategoryInput(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', minWidth: 180 }}
          required
        >
          <option value="salary">Salary</option>
          <option value="bank_statement">Bank Statement</option>
          <option value="cash_flow">Cash Flow</option>
          <option value="report">Report</option>
          <option value="other">Other</option>
        </select>
        <button type="submit" className="btn-primary" disabled={!selectedFile || loading}>
          {loading ? "Uploading..." : "Upload & Extract"}
        </button>
      </form>

      {loading && (
        <div className="page-loading">
          <LoadingSpinner size="small" text="Loading..." />
        </div>
      )}

      {error && (
        <div className="page-error">
          <ErrorMessage title="Error" message={error} />
        </div>
      )}

       <div className="files-list">
         {lastFile ? (
           <div style={{ marginTop: 12 }}>
             <p style={{ color: '#374151' }}>Upload successful. We are extracting structured data in the background.</p>
             {lastFile.previewUrl ? (
               <a href={lastFile.previewUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ marginTop: 8, display: 'inline-block' }}>
                 View PDF
               </a>
             ) : (
               <a href={lastFile.url} target="_blank" rel="noreferrer" className="btn-secondary" style={{ marginTop: 8, display: 'inline-block' }}>
                 Download File
               </a>
             )}
           </div>
         ) : (
           <p style={{ color: '#6b7280' }}>
             Upload a file to start analysis. Supported files are converted to PDF for processing.
           </p>
         )}
       </div>
    </div>
  );
}