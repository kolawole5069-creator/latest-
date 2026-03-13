export type UserRole = 'super_admin' | 'school_admin' | 'teacher';

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
  schoolId?: string;
  status: 'Active' | 'Inactive';
}

export interface School {
  id: string;
  name: string;
  code: string;
  address: string;
  state: string;
  phone: string;
  email: string;
  logoUrl?: string;
  motto: string;
  type: 'Primary' | 'Junior Secondary' | 'Senior Secondary' | 'Combined';
  currentSession: string;
  currentTerm: 'Term 1' | 'Term 2' | 'Term 3';
  subscriptionStatus: 'Active' | 'Expired' | 'Suspended' | 'Trial';
  subscriptionExpiry?: string;
  pricingPerStudent: number;
}

export interface Student {
  id: string;
  studentId: string;
  fullName: string;
  dob: string;
  gender: 'Male' | 'Female';
  schoolId: string;
  currentClassId: string;
  department: string;
  photoUrl?: string;
  guardianName: string;
  guardianPhone: string;
  admissionDate: string;
  status: 'Active' | 'Inactive' | 'Graduated';
}

export interface Class {
  id: string;
  name: string;
  arm: string;
  schoolId: string;
  department: string;
  formTeacherId?: string;
  session: string;
}

export interface Subject {
  id: string;
  name: string;
  classId: string;
  schoolId: string;
  teacherId?: string;
  weights: {
    test1: number;
    test2: number;
    test3: number;
    exam: number;
  };
}

export interface Result {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  schoolId: string;
  session: string;
  term: string;
  test1: number;
  test2: number;
  test3: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
}
