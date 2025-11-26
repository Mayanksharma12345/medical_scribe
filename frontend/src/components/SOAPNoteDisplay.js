import React, { useState } from 'react';
import axios from 'axios';
import './SOAPNoteDisplay.css';

function SOAPNoteDisplay({ encounterData, patientInfo, onStartOver }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState(encounterData.soapNote);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.post('/api/v1/encounters/save', {
        patient_id: patientInfo.patientId,
        transcript: encounterData.transcript,
        soap_note: editedNote,
        recording_duration: encounterData.recordingTime
      });
      setSaveSuccess(true);
      setIsEditing(false);
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (section, value) => {
    setEditedNote({
      ...editedNote,
      [section]: value
    });
  };

  return (
    <div className="soap-note-display">
      <div className="header-section">
        <h2>Clinical Documentation</h2>
        <div className="patient-header">
          <p><strong>Patient:</strong> {patientInfo.name}</p>
          <p><strong>MRN:</strong> {patientInfo.patientId}</p>
          <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {saveSuccess && (
        <div className="success-message">
          ✓ Documentation saved successfully
        </div>
      )}

      <div className="soap-sections">
        <div className="soap-section">
          <h3>Subjective</h3>
          {isEditing ? (
            <textarea
              value={editedNote.subjective}
              onChange={(e) => handleFieldChange('subjective', e.target.value)}
              rows="6"
            />
          ) : (
            <p>{editedNote.subjective}</p>
          )}
        </div>

        <div className="soap-section">
          <h3>Objective</h3>
          {isEditing ? (
            <textarea
              value={editedNote.objective}
              onChange={(e) => handleFieldChange('objective', e.target.value)}
              rows="6"
            />
          ) : (
            <p>{editedNote.objective}</p>
          )}
        </div>

        <div className="soap-section">
          <h3>Assessment</h3>
          {isEditing ? (
            <textarea
              value={editedNote.assessment}
              onChange={(e) => handleFieldChange('assessment', e.target.value)}
              rows="6"
            />
          ) : (
            <p>{editedNote.assessment}</p>
          )}
        </div>

        <div className="soap-section">
          <h3>Plan</h3>
          {isEditing ? (
            <textarea
              value={editedNote.plan}
              onChange={(e) => handleFieldChange('plan', e.target.value)}
              rows="6"
            />
          ) : (
            <p>{editedNote.plan}</p>
          )}
        </div>

        {editedNote.icd10_codes && (
          <div className="soap-section">
            <h3>ICD-10 Codes</h3>
            <ul className="code-list">
              {editedNote.icd10_codes.map((code, idx) => (
                <li key={idx}>
                  <strong>{code.code}:</strong> {code.description}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="transcript-section">
        <details>
          <summary>View Full Transcript</summary>
          <div className="transcript-content">
            {encounterData.transcript}
          </div>
        </details>
      </div>

      <div className="action-buttons">
        {!isEditing ? (
          <>
            <button onClick={handleEdit} className="btn btn-secondary">
              ✏️ Edit
            </button>
            <button onClick={handleSave} className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : '💾 Sign & Save'}
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleSave} className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </>
        )}
        <button onClick={onStartOver} className="btn btn-outline">
          New Encounter
        </button>
      </div>
    </div>
  );
}

export default SOAPNoteDisplay;
