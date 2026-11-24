const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const UserModel = require('./models/Users');

// Load environment variables from .env file if it exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const separatorIdx = trimmed.indexOf('=');
        if (separatorIdx !== -1) {
          const key = trimmed.substring(0, separatorIdx).trim();
          const val = trimmed.substring(separatorIdx + 1).trim().replace(/^['"]|['"]$/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    });
  } catch (err) {
    console.warn('Notice: Could not parse .env file:', err.message);
  }
}

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/crud';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log(`Connected to MongoDB successfully at: ${MONGO_URI}`);
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err.message);
  });

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB connection lost. Attempting to reconnect...');
});

// Demo sample data
const demoStudents = [
  {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@university.edu',
    rollNo: 'STU-1001',
    age: 21,
    gender: 'Male',
    course: 'Computer Science',
    department: 'School of Engineering',
    semester: '6th Semester',
    phone: '+91 98765 43210',
    address: '123 Tech Park Road, Bengaluru',
    gpa: 3.85,
    status: 'Active',
    enrollmentDate: new Date('2023-08-15'),
  },
  {
    name: 'Ananya Iyer',
    email: 'ananya.iyer@university.edu',
    rollNo: 'STU-1002',
    age: 20,
    gender: 'Female',
    course: 'Data Science & AI',
    department: 'School of Engineering',
    semester: '4th Semester',
    phone: '+91 98234 56789',
    address: '45 Innovation Ave, Chennai',
    gpa: 3.92,
    status: 'Active',
    enrollmentDate: new Date('2024-08-10'),
  },
  {
    name: 'Rohan Verma',
    email: 'rohan.verma@university.edu',
    rollNo: 'STU-1003',
    age: 22,
    gender: 'Male',
    course: 'Business Administration',
    department: 'School of Business',
    semester: '7th Semester',
    phone: '+91 97112 34567',
    address: '78 Commerce Blvd, Mumbai',
    gpa: 3.45,
    status: 'Active',
    enrollmentDate: new Date('2023-01-12'),
  },
  {
    name: 'Pooja Patel',
    email: 'pooja.patel@university.edu',
    rollNo: 'STU-1004',
    age: 21,
    gender: 'Female',
    course: 'Mechanical Engineering',
    department: 'School of Engineering',
    semester: '5th Semester',
    phone: '+91 99887 76655',
    address: '12 Heritage Lane, Ahmedabad',
    gpa: 3.68,
    status: 'Active',
    enrollmentDate: new Date('2023-08-20'),
  },
  {
    name: 'Vikram Malhotra',
    email: 'vikram.malhotra@university.edu',
    rollNo: 'STU-1005',
    age: 23,
    gender: 'Male',
    course: 'Electrical Engineering',
    department: 'School of Engineering',
    semester: '8th Semester',
    phone: '+91 91234 56780',
    address: '99 Ring Road, Delhi',
    gpa: 3.75,
    status: 'Graduated',
    enrollmentDate: new Date('2022-08-15'),
  },
  {
    name: 'Sneha Mukherjee',
    email: 'sneha.mukherjee@university.edu',
    rollNo: 'STU-1006',
    age: 19,
    gender: 'Female',
    course: 'Biotechnology',
    department: 'School of Science',
    semester: '2nd Semester',
    phone: '+91 98301 23456',
    address: '34 Park Circus, Kolkata',
    gpa: 3.52,
    status: 'Active',
    enrollmentDate: new Date('2025-08-12'),
  },
];

// Helper to filter/search students
async function fetchStudentsWithFilters(queryParams) {
  const { search, department, course, status, sortBy, sortOrder } = queryParams;
  const filter = {};

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { name: regex },
      { email: regex },
      { rollNo: regex },
      { course: regex },
      { department: regex },
    ];
  }

  if (department && department !== 'All') {
    filter.department = department;
  }

  if (course && course !== 'All') {
    filter.course = course;
  }

  if (status && status !== 'All') {
    filter.status = status;
  }

  const sort = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  } else {
    sort.createdAt = -1;
  }

  return await UserModel.find(filter).sort(sort);
}

// ======================== API ROUTES ======================== //

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Student Management System API',
    mongoConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// Dashboard Statistics
app.get('/api/stats', async (req, res) => {
  try {
    const students = await UserModel.find({});
    const total = students.length;
    const active = students.filter((s) => s.status === 'Active').length;
    const inactive = students.filter((s) => s.status === 'Inactive').length;
    const graduated = students.filter((s) => s.status === 'Graduated').length;
    const suspended = students.filter((s) => s.status === 'Suspended').length;

    const gpaSum = students.reduce((acc, curr) => acc + (Number(curr.gpa) || 0), 0);
    const averageGpa = total > 0 ? (gpaSum / total).toFixed(2) : 0;

    const departmentMap = {};
    const courseMap = {};

    students.forEach((s) => {
      if (s.department) {
        departmentMap[s.department] = (departmentMap[s.department] || 0) + 1;
      }
      if (s.course) {
        courseMap[s.course] = (courseMap[s.course] || 0) + 1;
      }
    });

    res.json({
      totalStudents: total,
      activeStudents: active,
      inactiveStudents: inactive,
      graduatedStudents: graduated,
      suspendedStudents: suspended,
      averageGpa: Number(averageGpa),
      departmentsCount: Object.keys(departmentMap).length,
      coursesCount: Object.keys(courseMap).length,
      departmentBreakdown: departmentMap,
      courseBreakdown: courseMap,
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to retrieve stats', message: err.message });
  }
});

// Seed Demo Students
app.post('/api/seed', async (req, res) => {
  try {
    const force = req.query.force === 'true' || req.body.force === true;
    const count = await UserModel.countDocuments();

    if (count > 0 && !force) {
      return res.json({
        message: 'Database already has records. Use force=true to re-seed demo data.',
        count,
      });
    }

    if (force) {
      await UserModel.deleteMany({});
    }

    const inserted = await UserModel.insertMany(demoStudents);
    res.status(201).json({
      message: 'Demo students seeded successfully',
      count: inserted.length,
      students: inserted,
    });
  } catch (err) {
    console.error('Error seeding demo data:', err);
    res.status(500).json({ error: 'Failed to seed demo data', message: err.message });
  }
});

// GET all students (Supports both legacy '/' and '/api/students')
const getAllStudentsHandler = async (req, res) => {
  try {
    const students = await fetchStudentsWithFilters(req.query);
    res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Failed to fetch students', message: err.message });
  }
};
app.get('/', getAllStudentsHandler);
app.get('/api/students', getAllStudentsHandler);

// GET single student (Supports both legacy '/getUser/:id' and '/api/students/:id')
const getSingleStudentHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID format' });
    }

    const student = await UserModel.findById(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (err) {
    console.error('Error fetching student:', err);
    res.status(500).json({ error: 'Failed to fetch student', message: err.message });
  }
};
app.get('/getUser/:id', getSingleStudentHandler);
app.get('/api/students/:id', getSingleStudentHandler);

// POST create student (Supports both legacy '/createUser' and '/api/students')
const createStudentHandler = async (req, res) => {
  try {
    const {
      name,
      email,
      age,
      rollNo,
      gender,
      course,
      department,
      semester,
      phone,
      address,
      gpa,
      status,
      enrollmentDate,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Validation Error', message: 'Student Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Validation Error', message: 'Student Email is required' });
    }

    // Check duplicate email
    const existingEmail = await UserModel.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({ error: 'Conflict', message: 'A student with this email already exists' });
    }

    // Check duplicate rollNo if specified
    if (rollNo && rollNo.trim()) {
      const existingRoll = await UserModel.findOne({ rollNo: rollNo.trim() });
      if (existingRoll) {
        return res.status(409).json({ error: 'Conflict', message: 'A student with this Roll Number already exists' });
      }
    }

    const studentData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      age: age ? Number(age) : undefined,
      rollNo: rollNo && rollNo.trim() ? rollNo.trim() : undefined,
      gender: gender || 'Not Specified',
      course: course || 'Computer Science',
      department: department || 'School of Engineering',
      semester: semester || '1st Semester',
      phone: phone || '',
      address: address || '',
      gpa: gpa !== undefined && gpa !== '' ? Number(gpa) : 3.5,
      status: status || 'Active',
      enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : new Date(),
    };

    const newStudent = await UserModel.create(studentData);
    res.status(201).json(newStudent);
  } catch (err) {
    console.error('Error creating student:', err);
    res.status(500).json({ error: 'Failed to create student', message: err.message });
  }
};
app.post('/createUser', createStudentHandler);
app.post('/api/students', createStudentHandler);

// PUT update student (Supports both legacy '/updateUser/:id' and '/api/students/:id')
const updateStudentHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID format' });
    }

    const existingStudent = await UserModel.findById(id);
    if (!existingStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const {
      name,
      email,
      age,
      rollNo,
      gender,
      course,
      department,
      semester,
      phone,
      address,
      gpa,
      status,
      enrollmentDate,
    } = req.body;

    // Check email conflict with other students
    if (email && email.trim().toLowerCase() !== existingStudent.email.toLowerCase()) {
      const duplicateEmail = await UserModel.findOne({
        _id: { $ne: id },
        email: email.trim().toLowerCase(),
      });
      if (duplicateEmail) {
        return res.status(409).json({ error: 'Conflict', message: 'Another student already has this email' });
      }
    }

    // Check rollNo conflict with other students
    if (rollNo && rollNo.trim() !== existingStudent.rollNo) {
      const duplicateRoll = await UserModel.findOne({
        _id: { $ne: id },
        rollNo: rollNo.trim(),
      });
      if (duplicateRoll) {
        return res.status(409).json({ error: 'Conflict', message: 'Another student already has this Roll Number' });
      }
    }

    const updateData = {
      ...(name !== undefined && { name: name.trim() }),
      ...(email !== undefined && { email: email.trim().toLowerCase() }),
      ...(age !== undefined && { age: age !== '' ? Number(age) : null }),
      ...(rollNo !== undefined && { rollNo: rollNo.trim() }),
      ...(gender !== undefined && { gender }),
      ...(course !== undefined && { course: course.trim() }),
      ...(department !== undefined && { department: department.trim() }),
      ...(semester !== undefined && { semester: semester.trim() }),
      ...(phone !== undefined && { phone: phone.trim() }),
      ...(address !== undefined && { address: address.trim() }),
      ...(gpa !== undefined && { gpa: gpa !== '' ? Number(gpa) : 0 }),
      ...(status !== undefined && { status }),
      ...(enrollmentDate !== undefined && { enrollmentDate: new Date(enrollmentDate) }),
    };

    const updatedStudent = await UserModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    res.json(updatedStudent);
  } catch (err) {
    console.error('Error updating student:', err);
    res.status(500).json({ error: 'Failed to update student', message: err.message });
  }
};
app.put('/updateUser/:id', updateStudentHandler);
app.put('/api/students/:id', updateStudentHandler);

// DELETE student (Supports both legacy '/deleteUser/:id' and '/api/students/:id')
const deleteStudentHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID format' });
    }

    const deletedStudent = await UserModel.findByIdAndDelete(id);
    if (!deletedStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully', deletedStudent });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ error: 'Failed to delete student', message: err.message });
  }
};
app.delete('/deleteUser/:id', deleteStudentHandler);
app.delete('/api/students/:id', deleteStudentHandler);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` Student Management System API running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(` Students API: http://localhost:${PORT}/api/students`);
  console.log(`===============================================`);
});
