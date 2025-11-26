import React, { useState } from 'react';
import './PatientInfo.css';

function PatientInfo({ onSubmit }) {
  const [formData, setFormData] = useState({
    patientId: '',
    name: '',
    dob: '',
    chiefComplaint: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="patient-info-container">
      <h2>Patient Information</h2>
      <form onSubmit={handleSubmit} className="patient-form">
        <div className="form-group">
          <label htmlFor="patientId">Patient ID *</label>
          <input
            type="text"
            id="patientId"
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            required
            placeholder="Enter patient ID or MRN"
          />
        </div>

        <div className="form-group">
          <label htmlFor="name">Patient Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Last, First"
          />
        </div>

        <div className="form-group">
          <label htmlFor="dob">Date of Birth *</label>
          <input
            type="date"
            id="dob"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="chiefComplaint">Chief Complaint</label>
          <textarea
            id="chiefComplaint"
            name="chiefComplaint"
            value={formData.chiefComplaint}
            onChange={handleChange}
            placeholder="Brief description of the reason for visit"
            rows="3"
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Continue to Recording
        </button>
      </form>

      <div className="privacy-notice">
        <p>🔒 Patient information is encrypted and HIPAA-compliant</p>
      </div>
    </div>
  );
}

export default PatientInfo;
