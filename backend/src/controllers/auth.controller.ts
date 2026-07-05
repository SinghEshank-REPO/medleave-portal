import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { env } from '../config/env';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Role } from '../types';

export class AuthController {
  static async register(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        email,
        password,
        name,
        role,
        // Student specific fields
        rollNumber,
        isResidential,
        hostelName,
        roomNumber,
        parentContact,
        departmentId,
        // Faculty specific fields
        designation,
        isHOD,
        // Warden specific fields
        wardenHostelName
      } = req.body;

      if (!email || !password || !name || !role) {
        return res.status(400).json({ message: 'Email, password, name, and role are required.' });
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ message: 'A user with this email already exists.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      // We will perform database operations in a transaction
      const newUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            name,
            passwordHash,
            role: role as Role
          }
        });

        if (role === 'STUDENT') {
          if (!rollNumber || !departmentId) {
            throw new Error('Roll number and Department are required for students.');
          }

          // Verify department exists
          const dept = await tx.department.findUnique({ where: { id: departmentId } });
          if (!dept) throw new Error('Invalid Department ID.');

          const student = await tx.student.create({
            data: {
              userId: user.id,
              rollNumber,
              isResidential: isResidential ?? true,
              hostelName: isResidential ? hostelName : null,
              roomNumber: isResidential ? roomNumber : null,
              parentContact,
              departmentId
            }
          });

          // Enroll the student in all courses belonging to their department by default
          const deptCourses = await tx.course.findMany({ where: { departmentId } });
          for (const course of deptCourses) {
            await tx.enrollment.create({
              data: {
                studentId: student.id,
                courseId: course.id,
                section: 'A1' // Default section
              }
            });
          }
        } else if (role === 'WARDEN') {
          if (!wardenHostelName) throw new Error('Hostel name is required for wardens.');
          await tx.warden.create({
            data: {
              userId: user.id,
              hostelName: wardenHostelName
            }
          });
        } else if (['FACULTY', 'HOD'].includes(role)) {
          if (!departmentId) throw new Error('Department is required for faculty members.');
          await tx.faculty.create({
            data: {
              userId: user.id,
              departmentId,
              designation: designation || 'Instructor',
              isHOD: role === 'HOD' || !!isHOD
            }
          });
        }

        return user;
      });

      // Generate JWT
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN as any }
      );

      res.status(211).json({
        message: 'User registered successfully.',
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({ message: error.message || 'Registration failed.' });
    }
  }

  static async login(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN as any }
      );

      res.json({
        message: 'Login successful.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed. Please try again.' });
    }
  }

  static async me(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated.' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          student: {
            include: {
              department: true
            }
          },
          warden: true,
          faculty: {
            include: {
              department: true
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ message: 'User profile not found.' });
      }

      // Format response to omit passwordHash
      const { passwordHash, ...profileData } = user;
      res.json(profileData);
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch user profile.' });
    }
  }
}
