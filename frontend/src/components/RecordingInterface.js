import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './RecordingInterface.css';

function RecordingInterface({ patientInfo, onComplete, onBack }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [soapNote, setSoapNote] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        processRecording(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      setError('Failed to access microphone: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const processRecording = async (audioBlob) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Transcribe audio
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('patient_id', patientInfo.patientId);

      const transcriptResponse = await axios.post('/api/v1/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const transcriptText = transcriptResponse.data.transcript;
      setTranscript(transcriptText);

      // Step 2: Generate SOAP note
      const soapResponse = await axios.post('/api/v1/generate-soap', {
        transcript: transcriptText,
        patient_id: patientInfo.patientId,
        chief_complaint: patientInfo.chiefComplaint,
      });

      setSoapNote(soapResponse.data);
      
      // Step 3: Complete
      setTimeout(() => {
        onComplete({
          transcript: transcriptText,
          soapNote: soapResponse.data,
          audioURL: audioURL,
          recordingTime: recordingTime
        });
      }, 1000);

    } catch (err) {
      setError('Failed to process recording: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="recording-interface">
      <div className="patient-context">
        <h3>Recording for: {patientInfo.name}</h3>
        <p>Patient ID: {patientInfo.patientId}</p>
        {patientInfo.chiefComplaint && (
          <p>Chief Complaint: {patientInfo.chiefComplaint}</p>
        )}
      </div>

      <div className="recording-controls">
        {!audioURL && (
          <>
            <div className={`recording-indicator ${isRecording ? 'active' : ''}`}>
              {isRecording ? (
                <>
                  <div className="pulse-dot"></div>
                  <span className="recording-time">{formatTime(recordingTime)}</span>
                </>
              ) : (
                <span>Ready to record</span>
              )}
            </div>

            <div className="control-buttons">
              {!isRecording ? (
                <button onClick={startRecording} className="btn btn-record">
                  🎤 Start Recording
                </button>
              ) : (
                <button onClick={stopRecording} className="btn btn-stop">
                  ⏹️ Stop Recording
                </button>
              )}
            </div>
          </>
        )}

        {audioURL && !isProcessing && (
          <div className="audio-preview">
            <h4>Recording Complete</h4>
            <audio src={audioURL} controls />
            <p>Duration: {formatTime(recordingTime)}</p>
          </div>
        )}

        {isProcessing && (
          <div className="processing-indicator">
            <div className="spinner"></div>
            <p>Processing your recording...</p>
            <div className="processing-steps">
              {transcript ? (
                <>
                  <p className="step-complete">✓ Transcription complete</p>
                  {soapNote ? (
                    <p className="step-complete">✓ SOAP note generated</p>
                  ) : (
                    <p className="step-processing">⏳ Generating SOAP note...</p>
                  )}
                </>
              ) : (
                <p className="step-processing">⏳ Transcribing audio...</p>
              )}
            </div>
          </div>
        )}

        {transcript && (
          <div className="transcript-preview">
            <h4>Transcript Preview</h4>
            <div className="transcript-text">{transcript}</div>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
        </div>
      )}

      <div className="action-buttons">
        <button onClick={onBack} className="btn btn-secondary" disabled={isRecording || isProcessing}>
          ← Back
        </button>
      </div>
    </div>
  );
}

export default RecordingInterface;
