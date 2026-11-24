import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

const API_BASE = 'http://localhost:3001';

function CreateUser() {
  const navigate = useNavigate();

  // Form State initialized to empty strings to avoid uncontrolled-to-controlled React warnings
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: 'Not Specified',
    rollNo: '',
    course: 'Computer Science',
    department: 'School of Engineering',
    semester: '1st Semester',
    phone: '',
    address: '',
    gpa: '3.50',
    status: 'Active',
    enrollmentDate: new Date().toISOString().slice(0, 10),
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ message: '', type: 'error' });

  // Handle generic input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific validation error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Auto-generate roll number
  const handleGenerateRoll = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, rollNo: `STU-${randomSuffix}` }));
  };

  // Quick fill sample data for fast testing
  const handleAutoFill = () => {
    const sampleNames = [
      { name: 'Aditya Rao', gender: 'Male', dept: 'School of Engineering', course: 'Computer Science' },
      { name: 'Meera Nambiar', gender: 'Female', dept: 'School of Business', course: 'Business Administration' },
      { name: 'Kabir Singhania', gender: 'Male', dept: 'School of Science', course: 'Data Science & AI' },
      { name: 'Riya Sen', gender: 'Female', dept: 'School of Engineering', course: 'Electrical Engineering' },
    ];
    const picked = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const rollSuffix = Math.floor(2000 + Math.random() * 7000);

    setFormData({
      name: picked.name,
      email: `${picked.name.toLowerCase().replace(' ', '.')}@university.edu`,
      age: '20',
      gender: picked.gender,
      rollNo: `STU-${rollSuffix}`,
      course: picked.course,
      department: picked.dept,
      semester: '3rd Semester',
      phone: '+91 98765 ' + Math.floor(10000 + Math.random() * 90000),
      address: 'Hostel Block B, Campus Avenue',
      gpa: (3.2 + Math.random() * 0.7).toFixed(2),
      status: 'Active',
      enrollmentDate: new Date().toISOString().slice(0, 10),
    });
    setErrors({});
  };

  // Validate form before submission
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (formData.age && (isNaN(formData.age) || Number(formData.age) < 1 || Number(formData.age) > 120)) {
      newErrors.age = 'Age must be between 1 and 120';
    }

    if (formData.gpa && (isNaN(formData.gpa) || Number(formData.gpa) < 0 || Number(formData.gpa) > 10)) {
      newErrors.gpa = 'GPA must be between 0.0 and 10.0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      // Auto assign roll number if left empty
      const payload = {
        ...formData,
        rollNo: formData.rollNo.trim() || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
        age: formData.age ? Number(formData.age) : undefined,
        gpa: formData.gpa !== '' ? Number(formData.gpa) : 3.5,
      };

      await axios.post(`${API_BASE}/createUser`, payload);
      navigate('/', { state: { message: 'Student registered successfully!' } });
    } catch (err) {
      console.error('Failed to create student:', err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to create student. Please verify server connection.';
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'error' })}
      />

      {/* Navbar */}
      <Navbar />

      {/* Main Form Content */}
      <main className="main-content">
        <div className="container" style={{ maxWidth: '860px' }}>
          {/* Breadcrumb / Top Bar */}
          <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
            <Link to="/" className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1">
              <i className="bi bi-arrow-left"></i>
              <span>Back to Directory</span>
            </Link>

            <button
              type="button"
              className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1"
              onClick={handleAutoFill}
              title="Quick-fill random sample data"
            >
              <i className="bi bi-magic"></i>
              <span>Auto-Fill Sample</span>
            </button>
          </div>

          <div className="form-card">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between pb-3 mb-4 border-bottom">
              <div>
                <h3 className="fw-bold mb-1 text-dark">
                  <i className="bi bi-person-plus text-primary me-2"></i>
                  Register New Student
                </h3>
                <p className="text-muted small mb-0">
                  Fill in the details below to add a new student record to the system.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* SECTION 1: Personal Information */}
              <div className="form-section-title">
                <i className="bi bi-person-fill text-primary"></i>
                <span>Personal Information</span>
              </div>

              <div className="row g-3 mb-4">
                {/* Full Name */}
                <div className="col-md-6">
                  <label className="form-label-custom">
                    Full Name <span className="required-asterisk">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Aarav Sharma"
                    className={`form-control form-control-custom ${errors.name ? 'is-invalid' : ''}`}
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                {/* Email Address */}
                <div className="col-md-6">
                  <label className="form-label-custom">
                    Email Address <span className="required-asterisk">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="e.g. aarav.sharma@university.edu"
                    className={`form-control form-control-custom ${errors.email ? 'is-invalid' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                {/* Phone Number */}
                <div className="col-md-4">
                  <label className="form-label-custom">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="+91 98765 43210"
                    className="form-control form-control-custom"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                {/* Age */}
                <div className="col-md-4">
                  <label className="form-label-custom">Age</label>
                  <input
                    type="number"
                    name="age"
                    placeholder="e.g. 21"
                    min="1"
                    max="120"
                    className={`form-control form-control-custom ${errors.age ? 'is-invalid' : ''}`}
                    value={formData.age}
                    onChange={handleChange}
                  />
                  {errors.age && <div className="invalid-feedback">{errors.age}</div>}
                </div>

                {/* Gender */}
                <div className="col-md-4">
                  <label className="form-label-custom">Gender</label>
                  <select
                    name="gender"
                    className="form-select form-select-custom"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="Not Specified">Select Gender...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* SECTION 2: Academic Information */}
              <div className="form-section-title">
                <i className="bi bi-mortarboard-fill text-primary"></i>
                <span>Academic Details</span>
              </div>

              <div className="row g-3 mb-4">
                {/* Roll Number */}
                <div className="col-md-6">
                  <label className="form-label-custom">
                    Student ID / Roll Number
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      name="rollNo"
                      placeholder="e.g. STU-1001"
                      className="form-control form-control-custom"
                      value={formData.rollNo}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={handleGenerateRoll}
                      title="Auto-generate ID"
                    >
                      <i className="bi bi-arrow-repeat me-1"></i>Generate
                    </button>
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Leave blank to automatically generate.
                  </span>
                </div>

                {/* Course */}
                <div className="col-md-6">
                  <label className="form-label-custom">Program / Course</label>
                  <select
                    name="course"
                    className="form-select form-select-custom"
                    value={formData.course}
                    onChange={handleChange}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Data Science & AI">Data Science & AI</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Business Administration">Business Administration</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Biotechnology">Biotechnology</option>
                  </select>
                </div>

                {/* Department */}
                <div className="col-md-4">
                  <label className="form-label-custom">Department</label>
                  <select
                    name="department"
                    className="form-select form-select-custom"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="School of Engineering">School of Engineering</option>
                    <option value="School of Business">School of Business</option>
                    <option value="School of Science">School of Science</option>
                    <option value="School of Arts & Humanities">School of Arts & Humanities</option>
                    <option value="School of Medicine">School of Medicine</option>
                  </select>
                </div>

                {/* Semester */}
                <div className="col-md-4">
                  <label className="form-label-custom">Current Semester</label>
                  <select
                    name="semester"
                    className="form-select form-select-custom"
                    value={formData.semester}
                    onChange={handleChange}
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="3rd Semester">3rd Semester</option>
                    <option value="4th Semester">4th Semester</option>
                    <option value="5th Semester">5th Semester</option>
                    <option value="6th Semester">6th Semester</option>
                    <option value="7th Semester">7th Semester</option>
                    <option value="8th Semester">8th Semester</option>
                  </select>
                </div>

                {/* GPA */}
                <div className="col-md-4">
                  <label className="form-label-custom">GPA (Out of 4.0)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="gpa"
                    placeholder="3.50"
                    min="0"
                    max="10"
                    className={`form-control form-control-custom ${errors.gpa ? 'is-invalid' : ''}`}
                    value={formData.gpa}
                    onChange={handleChange}
                  />
                  {errors.gpa && <div className="invalid-feedback">{errors.gpa}</div>}
                </div>
              </div>

              {/* SECTION 3: Status & Enrollment */}
              <div className="form-section-title">
                <i className="bi bi-calendar-check-fill text-primary"></i>
                <span>Status & Location</span>
              </div>

              <div className="row g-3 mb-4">
                {/* Status */}
                <div className="col-md-4">
                  <label className="form-label-custom">Enrollment Status</label>
                  <select
                    name="status"
                    className="form-select form-select-custom"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Graduated">Graduated</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                {/* Enrollment Date */}
                <div className="col-md-4">
                  <label className="form-label-custom">Enrollment Date</label>
                  <input
                    type="date"
                    name="enrollmentDate"
                    className="form-control form-control-custom"
                    value={formData.enrollmentDate}
                    onChange={handleChange}
                  />
                </div>

                {/* Address */}
                <div className="col-md-4">
                  <label className="form-label-custom">Residential City / Address</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="e.g. Bengaluru, India"
                    className="form-control form-control-custom"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <Link to="/" className="btn btn-outline-secondary px-4">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary px-4 d-flex align-items-center gap-2 fw-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Saving Student...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle"></i>
                      <span>Save Student</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CreateUser;
