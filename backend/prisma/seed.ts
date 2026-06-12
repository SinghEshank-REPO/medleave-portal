import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting SQLite database seeding...');

  // 1. Clean existing database
  await prisma.auditLog.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.missedClass.deleteMany({});
  await prisma.aIAnalysis.deleteMany({});
  await prisma.medicalDocument.deleteMany({});
  await prisma.leaveApplication.deleteMany({});
  await prisma.timetableSlot.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.faculty.deleteMany({});
  await prisma.warden.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleared SQLite database contents.');

  // 2. Hash default password
  const passwordHash = await bcrypt.hash('password123', 10);

  // 3. Create Departments
  const cseDept = await prisma.department.create({
    data: { name: 'Computer Science & Engineering', code: 'CSE' }
  });
  const eceDept = await prisma.department.create({
    data: { name: 'Electronics & Communication Engineering', code: 'ECE' }
  });

  console.log('Created departments: CSE, ECE');

  // 4. Create Users for Administrations and Staff
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@juit.ac.in',
      name: 'System Administrator',
      passwordHash,
      role: 'ADMIN'
    }
  });

  const doctorUser = await prisma.user.create({
    data: {
      email: 'doctor@juit.ac.in',
      name: 'Dr. R. K. Sharma (Medical Officer)',
      passwordHash,
      role: 'MED_OFFICER'
    }
  });

  const wardenUser = await prisma.user.create({
    data: {
      email: 'warden@juit.ac.in',
      name: 'Mr. Satish Kumar (Hostel H-1 Warden)',
      passwordHash,
      role: 'WARDEN'
    }
  });

  await prisma.warden.create({
    data: {
      userId: wardenUser.id,
      hostelName: 'H-1'
    }
  });

  console.log('Created Admin, Medical Officer, and Warden users.');

  // 5. Create Faculty Users
  const facultyData = [
    { email: 'prof.os@juit.ac.in', name: 'Prof. Amit Verma (OS Faculty)', code: 'CSE-301', title: 'Operating Systems' },
    { email: 'prof.db@juit.ac.in', name: 'Prof. Neha Gupta (DBMS Faculty)', code: 'CSE-302', title: 'Database Management Systems' },
    { email: 'prof.se@juit.ac.in', name: 'Prof. Vikas Singh (SE Faculty)', code: 'CSE-303', title: 'Software Engineering' },
    { email: 'prof.cn@juit.ac.in', name: 'Prof. Rohit Sen (CN Faculty)', code: 'CSE-304', title: 'Computer Networks' },
    { email: 'prof.cd@juit.ac.in', name: 'Prof. Preeti Shah (Compiler Faculty)', code: 'CSE-305', title: 'Compiler Design' }
  ];

  const facultyProfiles: any = {};

  for (const f of facultyData) {
    const u = await prisma.user.create({
      data: {
        email: f.email,
        name: f.name,
        passwordHash,
        role: 'FACULTY'
      }
    });

    const prof = await prisma.faculty.create({
      data: {
        userId: u.id,
        departmentId: cseDept.id,
        designation: 'Assistant Professor',
        isHOD: false,
        isAdvisor: false
      }
    });
    facultyProfiles[f.code] = prof;
  }

  // Create Faculty Advisor User
  const advisorUser = await prisma.user.create({
    data: {
      email: 'advisor@juit.ac.in',
      name: 'Dr. P. K. Bansal (CSE Advisor)',
      passwordHash,
      role: 'ADVISOR'
    }
  });

  const advisorProfile = await prisma.faculty.create({
    data: {
      userId: advisorUser.id,
      departmentId: cseDept.id,
      designation: 'Associate Professor & CSE Advisor',
      isAdvisor: true
    }
  });

  // Create HOD User
  const hodUser = await prisma.user.create({
    data: {
      email: 'hod.cse@juit.ac.in',
      name: 'Dr. S. P. Ghrera (CSE HOD)',
      passwordHash,
      role: 'HOD'
    }
  });

  await prisma.faculty.create({
    data: {
      userId: hodUser.id,
      departmentId: cseDept.id,
      designation: 'Professor & HOD CSE',
      isHOD: true
    }
  });

  console.log('Created Faculty profiles, HOD, and Advisor.');

  // 6. Create Courses for CSE
  const coursesData = [
    { code: 'CSE-301', name: 'Operating Systems', credits: 4 },
    { code: 'CSE-302', name: 'Database Management Systems', credits: 4 },
    { code: 'CSE-303', name: 'Software Engineering', credits: 3 },
    { code: 'CSE-304', name: 'Computer Networks', credits: 4 },
    { code: 'CSE-305', name: 'Compiler Design', credits: 4 }
  ];

  const courses: any = {};
  for (const c of coursesData) {
    const course = await prisma.course.create({
      data: {
        code: c.code,
        name: c.name,
        credits: c.credits,
        departmentId: cseDept.id
      }
    });
    courses[c.code] = course;
  }

  console.log('Created Courses.');

  // 7. Define Timetable slots for Section A1
  const slots = [
    // CSE-301 (OS)
    { courseCode: 'CSE-301', dayOfWeek: 1, startTime: '09:00', endTime: '10:00', type: 'LECTURE' },
    { courseCode: 'CSE-301', dayOfWeek: 3, startTime: '09:00', endTime: '10:00', type: 'LECTURE' },
    { courseCode: 'CSE-301', dayOfWeek: 4, startTime: '14:00', endTime: '16:00', type: 'LAB' },

    // CSE-302 (DBMS)
    { courseCode: 'CSE-302', dayOfWeek: 1, startTime: '10:00', endTime: '11:00', type: 'LECTURE' },
    { courseCode: 'CSE-302', dayOfWeek: 2, startTime: '09:00', endTime: '10:00', type: 'LECTURE' },
    { courseCode: 'CSE-302', dayOfWeek: 5, startTime: '14:00', endTime: '16:00', type: 'LAB' },

    // CSE-303 (SE)
    { courseCode: 'CSE-303', dayOfWeek: 2, startTime: '10:00', endTime: '11:00', type: 'LECTURE' },
    { courseCode: 'CSE-303', dayOfWeek: 3, startTime: '10:00', endTime: '11:00', type: 'LECTURE' },
    { courseCode: 'CSE-303', dayOfWeek: 4, startTime: '10:00', endTime: '11:00', type: 'TUTORIAL' },

    // CSE-304 (CN)
    { courseCode: 'CSE-304', dayOfWeek: 1, startTime: '11:00', endTime: '12:00', type: 'LECTURE' },
    { courseCode: 'CSE-304', dayOfWeek: 4, startTime: '11:00', endTime: '12:00', type: 'LECTURE' },
    { courseCode: 'CSE-304', dayOfWeek: 3, startTime: '14:00', endTime: '16:00', type: 'LAB' },

    // CSE-305 (Compiler)
    { courseCode: 'CSE-305', dayOfWeek: 2, startTime: '11:00', endTime: '12:00', type: 'LECTURE' },
    { courseCode: 'CSE-305', dayOfWeek: 5, startTime: '09:00', endTime: '10:00', type: 'LECTURE' },
    { courseCode: 'CSE-305', dayOfWeek: 5, startTime: '10:00', endTime: '11:00', type: 'TUTORIAL' }
  ];

  for (const s of slots) {
    await prisma.timetableSlot.create({
      data: {
        courseId: courses[s.courseCode].id,
        section: 'A1',
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        type: s.type
      }
    });
  }

  console.log('Seeded Timetable slots for Section A1.');

  // 8. Create a Student user
  const studentUser = await prisma.user.create({
    data: {
      email: 'student@juit.ac.in',
      name: 'Aditya Sen',
      passwordHash,
      role: 'STUDENT'
    }
  });

  const studentProfile = await prisma.student.create({
    data: {
      userId: studentUser.id,
      rollNumber: '211023',
      isResidential: true,
      hostelName: 'H-1',
      roomNumber: '101',
      parentContact: '+919876543210',
      departmentId: cseDept.id
    }
  });

  console.log('Created Student profile (Roll: 211023, Hostel: H-1).');

  // 9. Enroll the student in CSE courses for section A1
  for (const code in courses) {
    await prisma.enrollment.create({
      data: {
        studentId: studentProfile.id,
        courseId: courses[code].id,
        section: 'A1'
      }
    });
  }

  console.log('Enrolled student in CSE courses.');

  // 10. Seed a sample leave application that is already processed, and one pending
  const today = new Date();
  
  const pastStartDate = new Date(today);
  pastStartDate.setDate(today.getDate() - 10);
  const pastEndDate = new Date(today);
  pastEndDate.setDate(today.getDate() - 8);

  // Past application (Approved)
  const pastLeave = await prisma.leaveApplication.create({
    data: {
      studentId: studentProfile.id,
      startDate: pastStartDate,
      endDate: pastEndDate,
      reason: 'Suffered from acute gastroenteritis, doctor advised complete rest.',
      category: 'FEVER_INFECTION',
      status: 'APPROVED',
      healthCentreApproved: true,
      wardenApproved: true,
      advisorApproved: true,
      remarks: 'All documents verified and condonations completed.',
      currentApproverRole: 'FACULTY'
    }
  });

  const pastDoc = await prisma.medicalDocument.create({
    data: {
      leaveApplicationId: pastLeave.id,
      fileUrl: 'https://res.cloudinary.com/mock/image/upload/v12345/medical-cert.png',
      fileType: 'PNG',
      originalName: 'medical-certificate-sept2025.png'
    }
  });

  await prisma.aIAnalysis.create({
    data: {
      medicalDocumentId: pastDoc.id,
      patientName: 'Aditya Sen',
      doctorName: 'Dr. Anand Kumar',
      hospitalName: 'Apollo Clinic, Solan',
      diagnosis: 'Acute Gastroenteritis',
      restDays: 3,
      confidenceScore: 0.94,
      autoSummary: 'Patient Aditya Sen diagnosed with Gastroenteritis, advised 3 days rest from doctor Dr. Anand Kumar at Apollo Clinic.',
      status: 'VALID'
    }
  });

  // Seed some condoned classes for this past leave application
  const missed1 = await prisma.missedClass.create({
    data: {
      leaveApplicationId: pastLeave.id,
      courseId: courses['CSE-301'].id,
      date: pastStartDate,
      slotId: 'slot-1',
      slotName: 'Lecture (09:00 - 10:00)',
      status: 'CONDONED',
      facultyId: facultyProfiles['CSE-301'].id,
      condonedAt: new Date()
    }
  });

  const missed2 = await prisma.missedClass.create({
    data: {
      leaveApplicationId: pastLeave.id,
      courseId: courses['CSE-302'].id,
      date: pastStartDate,
      slotId: 'slot-2',
      slotName: 'Lecture (10:00 - 11:00)',
      status: 'CONDONED',
      facultyId: facultyProfiles['CSE-302'].id,
      condonedAt: new Date()
    }
  });

  // Log some audit entries
  await prisma.auditLog.create({
    data: {
      userId: doctorUser.id,
      action: 'APPROVE_MEDICAL_CERTIFICATE',
      details: JSON.stringify({ leaveApplicationId: pastLeave.id, status: 'VALID' })
    }
  });
  await prisma.auditLog.create({
    data: {
      userId: wardenUser.id,
      action: 'APPROVE_WARDEN_LEAVE',
      details: JSON.stringify({ leaveApplicationId: pastLeave.id })
    }
  });
  await prisma.auditLog.create({
    data: {
      userId: advisorUser.id,
      action: 'APPROVE_ADVISOR_LEAVE',
      details: JSON.stringify({ leaveApplicationId: pastLeave.id })
    }
  });
  await prisma.auditLog.create({
    data: {
      userId: facultyProfiles['CSE-301'].userId,
      action: 'CONDONE_ATTENDANCE',
      details: JSON.stringify({ missedClassId: missed1.id, course: 'CSE-301', student: 'Aditya Sen' })
    }
  });
  await prisma.auditLog.create({
    data: {
      userId: facultyProfiles['CSE-302'].userId,
      action: 'CONDONE_ATTENDANCE',
      details: JSON.stringify({ missedClassId: missed2.id, course: 'CSE-302', student: 'Aditya Sen' })
    }
  });

  console.log('Seeded past approved leave, documents, OCR analysis, and missed classes condonation data.');
  console.log('SQLite Database seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
