import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import DashboardStats from './components/DashboardStats';
import StudentDetailsModal from './components/StudentDetailsModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import Toast from './components/Toast';

const API_BASE = 'http://localhost:3001';

function Users() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [selectedStudentForView, setSelectedStudentForView] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Fetch all students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE);
      // Support both array response and { students: [...] } format
      const data = Array.isArray(res.data) ? res.data : (res.data.students || []);
      setStudents(data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      showToast('Could not connect to the backend server. Make sure MongoDB and Server are running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Seed demo data handler
  const handleSeedDemo = async () => {
    try {
      setSeeding(true);
      const res = await axios.post(`${API_BASE}/api/seed?force=true`);
      showToast(res.data.message || 'Demo students populated successfully!', 'success');
      await fetchStudents();
    } catch (err) {
      console.error('Failed to seed demo data:', err);
      showToast('Failed to seed demo students.', 'error');
    } finally {
      setSeeding(false);
    }
  };

  // Delete student handler
  const handleDeleteConfirm = async (id) => {
    try {
      setDeleting(true);
      await axios.delete(`${API_BASE}/deleteUser/${id}`);
      showToast('Student deleted successfully', 'success');
      setStudents((prev) => prev.filter((s) => s._id !== id));
      setStudentToDelete(null);
    } catch (err) {
      console.error('Failed to delete student:', err);
      showToast('Failed to delete student. Please try again.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Export current filtered list to CSV
  const handleExportCSV = () => {
    if (filteredStudents.length === 0) {
      showToast('No student records to export.', 'info');
      return;
    }

    const headers = ['Roll No', 'Name', 'Email', 'Age', 'Gender', 'Course', 'Department', 'Semester', 'Phone', 'GPA', 'Status'];
    const rows = filteredStudents.map((s) => [
      `"${s.rollNo || ''}"`,
      `"${s.name || ''}"`,
      `"${s.email || ''}"`,
      `"${s.age || ''}"`,
      `"${s.gender || ''}"`,
      `"${s.course || ''}"`,
      `"${s.department || ''}"`,
      `"${s.semester || ''}"`,
      `"${s.phone || ''}"`,
      `"${s.gpa || ''}"`,
      `"${s.status || 'Active'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Students_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${filteredStudents.length} students to CSV!`, 'success');
  };

  // Distinct departments for filter dropdown
  const departmentOptions = useMemo(() => {
    const set = new Set();
    students.forEach((s) => {
      if (s.department) set.add(s.department);
    });
    return Array.from(set);
  }, [students]);

  // Filtered and Sorted Students
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        // Search filter
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          (s.name && s.name.toLowerCase().includes(query)) ||
          (s.email && s.email.toLowerCase().includes(query)) ||
          (s.rollNo && s.rollNo.toLowerCase().includes(query)) ||
          (s.course && s.course.toLowerCase().includes(query)) ||
          (s.department && s.department.toLowerCase().includes(query));

        // Department filter
        const matchesDept =
          departmentFilter === 'All' || s.department === departmentFilter;

        // Status filter
        const matchesStatus =
          statusFilter === 'All' || (s.status || 'Active') === statusFilter;

        return matchesSearch && matchesDept && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name-asc') {
          return (a.name || '').localeCompare(b.name || '');
        }
        if (sortBy === 'name-desc') {
          return (b.name || '').localeCompare(a.name || '');
        }
        if (sortBy === 'gpa-desc') {
          return (Number(b.gpa) || 0) - (Number(a.gpa) || 0);
        }
        if (sortBy === 'rollNo') {
          return (a.rollNo || '').localeCompare(b.rollNo || '');
        }
        // default 'newest'
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [students, searchQuery, departmentFilter, statusFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudents, currentPage]);

  const resetFilters = () => {
    setSearchQuery('');
    setDepartmentFilter('All');
    setStatusFilter('All');
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Avatar helper
  const getInitials = (name) => {
    if (!name) return 'ST';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Status badge styling helper
  const getStatusClass = (status) => {
    switch (status) {
      case 'Active':
        return 'status-active';
      case 'Inactive':
        return 'status-inactive';
      case 'Graduated':
        return 'status-graduated';
      case 'Suspended':
        return 'status-suspended';
      default:
        return 'status-active';
    }
  };

  // GPA badge styling helper
  const getGpaClass = (gpaVal) => {
    const gpa = Number(gpaVal);
    if (isNaN(gpa)) return 'gpa-mid';
    if (gpa >= 3.5) return 'gpa-high';
    if (gpa >= 3.0) return 'gpa-mid';
    return 'gpa-low';
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      {/* Main Navigation Bar */}
      <Navbar onSeedDemo={handleSeedDemo} seeding={seeding} />

      {/* Main Container */}
      <main className="main-content">
        <div className="container">
          {/* Top Dashboard Metric Cards */}
          <DashboardStats students={students} />

          {/* Main Content Card: Student Directory */}
          <div className="content-card">
            {/* Header */}
            <div className="content-card-header">
              <div className="d-flex align-items-center gap-2">
                <h4 className="card-title-main">
                  <i className="bi bi-person-lines-fill text-primary"></i>
                  <span>Students Directory</span>
                </h4>
                <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill">
                  {filteredStudents.length} {filteredStudents.length === 1 ? 'Student' : 'Students'}
                </span>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                  onClick={handleExportCSV}
                  title="Export filtered records to CSV"
                >
                  <i className="bi bi-download"></i>
                  <span className="d-none d-md-inline">Export CSV</span>
                </button>

                <Link to="/create" className="btn btn-primary btn-sm d-flex align-items-center gap-1">
                  <i className="bi bi-person-plus-fill"></i>
                  <span>Add Student</span>
                </Link>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="filters-bar">
              {/* Search input */}
              <div className="search-input-group">
                <i className="bi bi-search search-icon"></i>
                <input
                  type="text"
                  className="form-control form-control-sm search-input-field"
                  placeholder="Search by name, roll no, email, or course..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Department filter */}
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto', minWidth: '170px' }}
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Departments</option>
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              {/* Status filter */}
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto', minWidth: '130px' }}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Graduated">Graduated</option>
                <option value="Suspended">Suspended</option>
              </select>

              {/* Sort selector */}
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto', minWidth: '150px' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Sort: Newest First</option>
                <option value="name-asc">Sort: Name (A to Z)</option>
                <option value="name-desc">Sort: Name (Z to A)</option>
                <option value="gpa-desc">Sort: GPA (Highest)</option>
                <option value="rollNo">Sort: Roll Number</option>
              </select>

              {/* Reset filter button */}
              {(searchQuery || departmentFilter !== 'All' || statusFilter !== 'All' || sortBy !== 'newest') && (
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={resetFilters}
                  title="Clear all filters"
                >
                  <i className="bi bi-x-circle me-1"></i>Reset
                </button>
              )}
            </div>

            {/* Students Table */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted small">Loading student records...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="empty-state-wrapper">
                <div className="empty-state-icon">
                  <i className="bi bi-mortarboard"></i>
                </div>
                <h5>No students found</h5>
                <p className="text-muted small mb-3">
                  {students.length === 0
                    ? 'Your student database is currently empty. Get started by adding a student or load sample demo data.'
                    : 'No student matches your current filter and search criteria.'}
                </p>
                <div className="d-flex justify-content-center gap-2">
                  {students.length === 0 && (
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={handleSeedDemo}
                      disabled={seeding}
                    >
                      <i className="bi bi-database-fill-gear me-1"></i>
                      {seeding ? 'Loading Demo Data...' : 'Seed Demo Data'}
                    </button>
                  )}
                  <Link to="/create" className="btn btn-primary btn-sm">
                    <i className="bi bi-plus-lg me-1"></i>Add New Student
                  </Link>
                  {students.length > 0 && (
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={resetFilters}>
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table table align-middle">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Program & Dept</th>
                      <th>Contact</th>
                      <th>Age / Gender</th>
                      <th>GPA</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.map((user) => {
                      return (
                        <tr key={user._id}>
                          {/* Student Info */}
                          <td>
                            <div className="student-info-cell">
                              <div className="student-avatar">
                                {getInitials(user.name)}
                              </div>
                              <div>
                                <div className="student-name-text">{user.name}</div>
                                <span className="student-roll-text">
                                  {user.rollNo ? user.rollNo : 'No Roll ID'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Academic Info */}
                          <td>
                            <div className="fw-semibold text-dark small">{user.course || 'Computer Science'}</div>
                            <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                              {user.department || 'Engineering'} &bull; {user.semester || '1st Sem'}
                            </div>
                          </td>

                          {/* Contact Info */}
                          <td>
                            <div className="small text-dark">{user.email}</div>
                            {user.phone && (
                              <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                                <i className="bi bi-telephone me-1"></i>
                                {user.phone}
                              </div>
                            )}
                          </td>

                          {/* Age & Gender */}
                          <td>
                            <span className="small text-dark">
                              {user.age ? `${user.age} yrs` : '-'}
                            </span>
                            {user.gender && user.gender !== 'Not Specified' && (
                              <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                                {user.gender}
                              </div>
                            )}
                          </td>

                          {/* GPA */}
                          <td>
                            <span className={`gpa-badge ${getGpaClass(user.gpa)}`}>
                              {user.gpa !== undefined && user.gpa !== ''
                                ? Number(user.gpa).toFixed(2)
                                : '3.50'}
                            </span>
                          </td>

                          {/* Status */}
                          <td>
                            <span className={`status-pill ${getStatusClass(user.status || 'Active')}`}>
                              <i className="bi bi-circle-fill" style={{ fontSize: '0.45rem' }}></i>
                              {user.status || 'Active'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="text-end">
                            <div className="action-buttons-group justify-content-end">
                              {/* View Details */}
                              <button
                                type="button"
                                className="btn-icon-action"
                                title="View Student Details"
                                onClick={() => setSelectedStudentForView(user)}
                              >
                                <i className="bi bi-eye"></i>
                              </button>

                              {/* Edit */}
                              <Link
                                to={`/update/${user._id}`}
                                className="btn-icon-action"
                                title="Edit Student"
                              >
                                <i className="bi bi-pencil"></i>
                              </Link>

                              {/* Delete */}
                              <button
                                type="button"
                                className="btn-icon-action btn-icon-delete"
                                title="Delete Student"
                                onClick={() => setStudentToDelete(user)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {filteredStudents.length > itemsPerPage && (
              <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light flex-wrap gap-2">
                <span className="text-muted small">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of{' '}
                  {filteredStudents.length} entries
                </span>

                <nav aria-label="Student list pagination">
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(page)}>
                          {page}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Student Details Modal */}
      {selectedStudentForView && (
        <StudentDetailsModal
          student={selectedStudentForView}
          onClose={() => setSelectedStudentForView(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <DeleteConfirmationModal
          student={studentToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setStudentToDelete(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
}

export default Users;
