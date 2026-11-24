import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

const API_BASE = 'http://localhost:3001';

function UpdateUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Controlled form state initialized to empty strings
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
    enrollmentDate: '',
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({});
  const [notFound, setNotFound] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'error' });

  // Fetch student data on mount
  useEffect(() => {
    let isMounted = true;

    axios
      .get(`${API_BASE}/getUser/${id}`)
      .then((res) => {
        if (!isMounted) return;
        const student = res.data;
        if (!student || student.error) {
          setNotFound(true);
          return;
        }

        // Format enrollmentDate to YYYY-MM-DD for date input
        let formattedDate = '';
        if (student.enrollmentDate) {
          try {
            formattedDate = new Date(student.enrollmentDate).toISOString().slice(0, 10);
          } catch {
            formattedDate = '';
          }
        }

        setFormData({
          name: student.name || '',
          email: student.email || '',
          age: student.age !== undefined && student.age !== null ? String(student.age) : '',
          gender: student.gender || 'Not Specified',
          rollNo: student.rollNo || '',
          course: student.course || 'Computer Science',
          department: student.department || 'School of Engineering',
          semester: student.semester || '1st Semester',
          phone: student.phone || '',
          address: student.address || '',
          gpa: student.gpa !== undefined && student.gpa !== null ? String(student.gpa) : '3.50',
          status: student.status || 'Active',
          enrollmentDate: formattedDate,
        });
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Error fetching student details:', err);
        setNotFound(true);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Form validation
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Student Name is required';
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

  // Update submission
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setUpdating(true);
      const payload = {
        ...formData,
        age: formData.age ? Number(formData.age) : undefined,
        gpa: formData.gpa !== '' ? Number(formData.gpa) : 3.5,
      };

      await axios.put(`${API_BASE}/updateUser/${id}`, payload);
      navigate('/', { state: { message: 'Student updated successfully!' } });
    } catch (err) {
      console.error('Failed to update student:', err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to update student. Please check server connection.';
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setUpdating(false);
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
          {/* Back button */}
          <div className="mb-3">
            <Link to="/" className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1">
              <i className="bi bi-arrow-left"></i>
              <span>Back to Directory</span>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5 bg-white rounded-3 shadow-sm border p-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted">Loading student information...</p>
            </div>
          ) : notFound ? (
            <div className="text-center py-5 bg-white rounded-3 shadow-sm border p-5">
              <div className="text-danger fs-1 mb-2">
                <i className="bi bi-person-x"></i>
              </div>
              <h4 className="fw-bold">Student Not Found</h4>
              <p className="text-muted small mb-4">
                The requested student record could not be found or has been removed.
              </p>
              <Link to="/" className="btn btn-primary btn-sm">
                Return to Students Directory
              </Link>
            </div>
          ) : (
            <div className="form-card">
              {/* Header */}
              <div className="d-flex align-items-center justify-content-between pb-3 mb-4 border-bottom">
                <div>
                  <h3 className="fw-bold mb-1 text-dark">
                    <i className="bi bi-pencil-square text-primary me-2"></i>
                    Update Student Record
                  </h3>
                  <p className="text-muted small mb-0">
                    Modifying profile for <strong className="text-dark">{formData.name}</strong>{' '}
                    {formData.rollNo && <span className="badge bg-light text-dark border">ID: {formData.rollNo}</span>}
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdate}>
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

                  {/* Email */}
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

                  {/* Phone */}
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

                {/* SECTION 2: Academic Details */}
                <div className="form-section-title">
                  <i className="bi bi-mortarboard-fill text-primary"></i>
                  <span>Academic Details</span>
                </div>

                <div className="row g-3 mb-4">
                  {/* Roll Number */}
                  <div className="col-md-6">
                    <label className="form-label-custom">Student ID / Roll Number</label>
                    <input
                      type="text"
                      name="rollNo"
                      placeholder="e.g. STU-1001"
                      className="form-control form-control-custom"
                      value={formData.rollNo}
                      onChange={handleChange}
                    />
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
                      placeholder="e.g. Mumbai, India"
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
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2"></i>
                        <span>Update Student</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default UpdateUser;
