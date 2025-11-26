import React, { useState, useRef } from 'react';
import './App.css';
import RecordingInterface from './components/RecordingInterface';
import PatientInfo from './components/PatientInfo';
import SOAPNoteDisplay from './components/SOAPNoteDisplay';

function App() {
  const [patientInfo, setPatientInfo] = useState({
    patientId: '',
    name: '',
    dob: '',
    chiefComplaint: ''
  });
  const [encounterData, setEncounterData] = useState(null);
  const [currentStep, setCurrentStep] = useState('patient-info'); // patient-info, recording, review

  const handlePatientInfoSubmit = (info) => {
    setPatientInfo(info);
    setCurrentStep('recording');
  };

  const handleRecordingComplete = (data) => {
    setEncounterData(data);
    setCurrentStep('review');
  };

  const handleStartOver = () => {
    setPatientInfo({
      patientId: '',
      name: '',
      dob: '',
      chiefComplaint: ''
    });
    setEncounterData(null);
    setCurrentStep('patient-info');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏥 Medical Scribe AI</h1>
        <p>HIPAA-Compliant Clinical Documentation Assistant</p>
      </header>

      <main className="App-main">
        {currentStep === 'patient-info' && (
          <PatientInfo onSubmit={handlePatientInfoSubmit} />
        )}

        {currentStep === 'recording' && (
          <RecordingInterface
            patientInfo={patientInfo}
            onComplete={handleRecordingComplete}
            onBack={() => setCurrentStep('patient-info')}
          />
        )}

        {currentStep === 'review' && (
          <SOAPNoteDisplay
            encounterData={encounterData}
            patientInfo={patientInfo}
            onStartOver={handleStartOver}
          />
        )}
      </main>

      <footer className="App-footer">
        <p>🔒 All data encrypted end-to-end | HIPAA & HITRUST Compliant</p>
      </footer>
    </div>
  );
}

export default App;
