import React, { useState } from 'react';
import { Download, Upload, X, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const ExportImportModal = ({ isOpen, onClose, quizId, quizTitle }) => {
  const [activeTab, setActiveTab] = useState('export');
  const [selectedQuizzes, setSelectedQuizzes] = useState([]);
  const [importFile, setImportFile] = useState(null);
  const [importData, setImportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [availableQuizzes, setAvailableQuizzes] = useState([]);

  React.useEffect(() => {
    if (isOpen && activeTab === 'export') {
      fetchAvailableQuizzes();
    }
  }, [isOpen, activeTab]);

  const fetchAvailableQuizzes = async () => {
    try {
      const response = await fetch('http://localhost:8000/quizzes');
      if (response.ok) {
        const data = await response.json();
        setAvailableQuizzes(data.quizzes || []);
        if (quizId) {
          setSelectedQuizzes([quizId]);
        }
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const handleExportSingle = async () => {
    if (!quizId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/export-quiz/${quizId}`);
      if (response.ok) {
        const data = await response.json();
        downloadJSON(data, `quiz_${data.quiz_data.title.replace(/\s+/g, '_')}.json`);
        setMessage({ type: 'success', text: 'Quiz exported successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to export quiz' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Export failed: ' + error.message });
    }
    setLoading(false);
  };

  const handleExportMultiple = async () => {
    if (selectedQuizzes.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one quiz' });
      return;
    }

    setLoading(true);
    try {
      const quizIds = selectedQuizzes.join(',');
      const response = await fetch(`http://localhost:8000/export-multiple-quizzes?quiz_ids=${quizIds}`);
      if (response.ok) {
        const data = await response.json();
        downloadJSON(data, `quizzes_export_${new Date().toISOString().split('T')[0]}.json`);
        setMessage({ type: 'success', text: `${selectedQuizzes.length} quizzes exported successfully!` });
      } else {
        setMessage({ type: 'error', text: 'Failed to export quizzes' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Export failed: ' + error.message });
    }
    setLoading(false);
  };

  const downloadJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      setMessage({ type: 'error', text: 'Please select a JSON file' });
      return;
    }

    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        setImportData(data);
        setMessage({ type: 'success', text: 'File loaded successfully. Review and import below.' });
      } catch (error) {
        setMessage({ type: 'error', text: 'Invalid JSON file format' });
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importData) {
      setMessage({ type: 'error', text: 'No file selected' });
      return;
    }

    setLoading(true);
    try {
      let importPromises = [];

      if (importData.quiz_data) {
        // Single quiz import
        importPromises.push(
          fetch('http://localhost:8000/import-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              quiz_data: importData.quiz_data,
              import_options: { created_by: 'Imported User' }
            })
          })
        );
      } else if (importData.quizzes) {
        // Multiple quiz import
        importPromises = importData.quizzes.map(quizItem =>
          fetch('http://localhost:8000/import-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              quiz_data: quizItem.quiz_data,
              import_options: { created_by: 'Imported User' }
            })
          })
        );
      } else {
        throw new Error('Invalid file format. Expected quiz data not found.');
      }

      const responses = await Promise.all(importPromises);
      const results = await Promise.all(responses.map(r => r.json()));
      
      const successful = results.filter(r => r.message && r.message.includes('successfully'));
      const failed = results.filter(r => !r.message || !r.message.includes('successfully'));

      if (successful.length > 0) {
        setMessage({ 
          type: 'success', 
          text: `${successful.length} quiz(es) imported successfully!${failed.length > 0 ? ` ${failed.length} failed.` : ''}` 
        });
        // Reset form
        setImportFile(null);
        setImportData(null);
        document.getElementById('import-file-input').value = '';
      } else {
        setMessage({ type: 'error', text: 'Import failed for all quizzes' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Import failed: ' + error.message });
    }
    setLoading(false);
  };

  const toggleQuizSelection = (quizId) => {
    setSelectedQuizzes(prev => 
      prev.includes(quizId) 
        ? prev.filter(id => id !== quizId)
        : [...prev, quizId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content export-import-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Export / Import Quizzes</h3>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => setActiveTab('export')}
          >
            <Download size={16} />
            Export
          </button>
          <button 
            className={`tab ${activeTab === 'import' ? 'active' : ''}`}
            onClick={() => setActiveTab('import')}
          >
            <Upload size={16} />
            Import
          </button>
        </div>

        <div className="modal-body">
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{message.text}</span>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="export-section">
              {quizId ? (
                <div className="single-export">
                  <h4>Export Quiz: "{quizTitle}"</h4>
                  <p>Export this quiz as a JSON file that can be imported later or shared with others.</p>
                  <button 
                    onClick={handleExportSingle}
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    <Download size={16} />
                    {loading ? 'Exporting...' : 'Export Quiz'}
                  </button>
                </div>
              ) : (
                <div className="multiple-export">
                  <h4>Select Quizzes to Export</h4>
                  <div className="quiz-selection">
                    {availableQuizzes.map(quiz => (
                      <div key={quiz.id} className="quiz-checkbox">
                        <input
                          type="checkbox"
                          id={`quiz-${quiz.id}`}
                          checked={selectedQuizzes.includes(quiz.id)}
                          onChange={() => toggleQuizSelection(quiz.id)}
                        />
                        <label htmlFor={`quiz-${quiz.id}`}>
                          <span className="quiz-info">
                            <strong>{quiz.title}</strong>
                            <span className="quiz-meta">{quiz.category} • {quiz.difficulty}</span>
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={handleExportMultiple}
                    disabled={loading || selectedQuizzes.length === 0}
                    className="btn btn-primary"
                  >
                    <Download size={16} />
                    {loading ? 'Exporting...' : `Export ${selectedQuizzes.length} Quiz(es)`}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'import' && (
            <div className="import-section">
              <h4>Import Quiz from JSON File</h4>
              <p>Upload a JSON file exported from QuizMaster to import quiz(es).</p>
              
              <div className="file-upload">
                <input
                  id="import-file-input"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="file-input"
                />
                <label htmlFor="import-file-input" className="file-label">
                  <FileText size={20} />
                  {importFile ? importFile.name : 'Choose JSON file'}
                </label>
              </div>

              {importData && (
                <div className="import-preview">
                  <h5>Preview:</h5>
                  {importData.quiz_data ? (
                    <div className="quiz-preview">
                      <strong>{importData.quiz_data.title}</strong>
                      <p>{importData.quiz_data.description}</p>
                      <span className="quiz-meta">
                        {importData.quiz_data.category} • {importData.quiz_data.difficulty} • 
                        {importData.quiz_data.questions?.length} questions
                      </span>
                    </div>
                  ) : importData.quizzes ? (
                    <div className="multiple-quiz-preview">
                      <strong>{importData.quizzes.length} quizzes</strong>
                      {importData.quizzes.slice(0, 3).map((item, index) => (
                        <div key={index} className="quiz-preview-item">
                          • {item.quiz_data.title}
                        </div>
                      ))}
                      {importData.quizzes.length > 3 && (
                        <div className="more-quizzes">...and {importData.quizzes.length - 3} more</div>
                      )}
                    </div>
                  ) : (
                    <div className="invalid-format">Invalid file format</div>
                  )}
                </div>
              )}

              <button 
                onClick={handleImport}
                disabled={loading || !importData}
                className="btn btn-primary"
              >
                <Upload size={16} />
                {loading ? 'Importing...' : 'Import Quiz(es)'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportImportModal;
