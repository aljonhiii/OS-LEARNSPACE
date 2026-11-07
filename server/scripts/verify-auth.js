import { pool } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'learnspace-secret-key-2026';
const API_BASE = 'http://localhost:5000/api';

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Test failed: ${message}`);
  }
}

async function runAuthTests() {
  console.log('\n====================================================');
  console.log('🔒 LEARNSPACE ACCOUNT AUTHENTICATION VERIFICATION');
  console.log('====================================================\n');

  try {
    // 1. Database Connectivity & User Accounts
    console.log('1. Checking Database Accounts in MariaDB...');
    const [users] = await pool.query(`
      SELECT u.id, u.email, u.password_hash, u.account_status, r.name as role
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      ORDER BY r.id ASC
    `);
    assert(users.length >= 3, `Found ${users.length} registered accounts in MariaDB`);

    const admin = users.find(u => u.role === 'admin');
    const teacher = users.find(u => u.role === 'teacher');
    const student = users.find(u => u.role === 'student');

    assert(!!admin, `Admin account present: ${admin?.email}`);
    assert(!!teacher, `Teacher account present: ${teacher?.email}`);
    assert(!!student, `Student account present: ${student?.email}`);

    // 2. Administrator Login Test
    console.log('\n2. Testing Administrator Login Process...');
    const adminRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: admin.email, password: 'password123' })
    });
    const adminData = await adminRes.json();
    assert(adminRes.status === 200, 'Admin login returned HTTP 200');
    assert(!!adminData.token, 'Admin login issued signed JWT token');
    assert(adminData.user.role === 'admin', 'Admin user role is "admin"');
    assert(adminData.user.email === admin.email, 'Admin user email matches database');

    // 3. Teacher Login Test
    console.log('\n3. Testing Teacher Login Process...');
    const teacherRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: teacher.email, password: 'password123' })
    });
    const teacherData = await teacherRes.json();
    assert(teacherRes.status === 200, 'Teacher login returned HTTP 200');
    assert(!!teacherData.token, 'Teacher login issued signed JWT token');
    assert(teacherData.user.role === 'teacher', 'Teacher user role is "teacher"');
    assert(teacherData.user.email === teacher.email, 'Teacher user email matches database');

    // 4. Student Login Test
    console.log('\n4. Testing Student Login Process...');
    const studentRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: student.email, password: 'password123' })
    });
    const studentData = await studentRes.json();
    assert(studentRes.status === 200, 'Student login returned HTTP 200');
    assert(!!studentData.token, 'Student login issued signed JWT token');
    assert(studentData.user.role === 'student', 'Student user role is "student"');
    assert(studentData.user.email === student.email, 'Student user email matches database');

    // 5. Invalid Credentials Tests
    console.log('\n5. Testing Invalid Credentials & Error Handling...');
    
    // Wrong password
    const wrongPassRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: admin.email, password: 'wrong_password_999' })
    });
    const wrongPassData = await wrongPassRes.json();
    assert(wrongPassRes.status === 401, 'Wrong password rejected with HTTP 401');
    assert(wrongPassData.error === 'Invalid email or password', 'Clear error message returned for invalid password');

    // Non-existent email
    const noUserRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ghost_user@learnspace.edu', password: 'password123' })
    });
    assert(noUserRes.status === 401, 'Unregistered email rejected with HTTP 401');

    // Empty fields
    const emptyRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '', password: '' })
    });
    assert(emptyRes.status === 400, 'Empty login payload rejected with HTTP 400');

    // 6. Suspended Account Login Rejection
    console.log('\n6. Testing Suspended Account Policy...');
    // Create a temporary suspended user
    const hashed = await bcrypt.hash('password123', 10);
    const [suspInsert] = await pool.query(`
      INSERT INTO users (first_name, last_name, email, password_hash, account_status)
      VALUES ('Suspended', 'User', 'suspended.test@learnspace.edu', ?, 'suspended')
    `, [hashed]);
    const suspId = suspInsert.insertId;
    await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, 3)', [suspId]);

    const suspLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'suspended.test@learnspace.edu', password: 'password123' })
    });
    const suspData = await suspLoginRes.json();
    assert(suspLoginRes.status === 403, 'Suspended account rejected with HTTP 403');
    assert(suspData.error.includes('suspended'), 'Error message informs user of suspended status');

    // Clean up temporary suspended user
    await pool.query('DELETE FROM user_roles WHERE user_id = ?', [suspId]);
    await pool.query('DELETE FROM users WHERE id = ?', [suspId]);
    assert(true, 'Pruned temporary suspended test user');

    // 7. Token Verification & Session Handling (/api/auth/me)
    console.log('\n7. Testing Session Verification (/api/auth/me)...');
    const meRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${teacherData.token}` }
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, 'Valid token accepted by /api/auth/me');
    assert(meData.email === teacher.email, 'Token correctly identified user email');
    assert(meData.role === 'teacher', 'Token correctly verified user role');

    // 8. Protected Routes & Unauthenticated Access Prevention
    console.log('\n8. Testing Route Protection Against Unauthenticated Access...');
    const noTokenRes = await fetch(`${API_BASE}/audit-logs`);
    assert(noTokenRes.status === 401, 'Request without token rejected with HTTP 401');

    const invalidTokenRes = await fetch(`${API_BASE}/audit-logs`, {
      headers: { 'Authorization': 'Bearer bogus-invalid-jwt-token' }
    });
    assert(invalidTokenRes.status === 403, 'Request with forged/tampered token rejected with HTTP 403');

    // 9. Role-Based Access Control (RBAC) Enforcement
    console.log('\n9. Testing Role-Based API Authorization (RBAC)...');
    
    // Student attempting to access Admin Audit Logs -> 403 Forbidden
    const studentAuditRes = await fetch(`${API_BASE}/audit-logs`, {
      headers: { 'Authorization': `Bearer ${studentData.token}` }
    });
    assert(studentAuditRes.status === 403, 'Student denied access to Admin Audit Logs (HTTP 403)');

    // Teacher attempting to access Admin Audit Logs -> 403 Forbidden
    const teacherAuditRes = await fetch(`${API_BASE}/audit-logs`, {
      headers: { 'Authorization': `Bearer ${teacherData.token}` }
    });
    assert(teacherAuditRes.status === 403, 'Teacher denied access to Admin Audit Logs (HTTP 403)');

    // Admin accessing Admin Audit Logs -> 200 OK
    const adminAuditRes = await fetch(`${API_BASE}/audit-logs`, {
      headers: { 'Authorization': `Bearer ${adminData.token}` }
    });
    assert(adminAuditRes.status === 200, 'Admin granted access to Admin Audit Logs (HTTP 200)');

    // Student attempting to create a course category -> 403 Forbidden
    const studentCatRes = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentData.token}` 
      },
      body: JSON.stringify({ name: 'Hacked Category' })
    });
    assert(studentCatRes.status === 403, 'Student forbidden from creating Course Categories (HTTP 403)');

    // 10. Logout & Session Termination Audit
    console.log('\n10. Testing Logout & Audit Logs...');
    const logoutRes = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${teacherData.token}` }
    });
    assert(logoutRes.status === 200, 'Logout request accepted with HTTP 200');

    // Verify audit logs in MariaDB
    const [recentLogs] = await pool.query(`
      SELECT action, summary FROM audit_logs 
      WHERE action IN ('USER_LOGIN', 'USER_LOGOUT') 
      ORDER BY id DESC LIMIT 5
    `);
    const hasLoginLog = recentLogs.some(l => l.action === 'USER_LOGIN');
    const hasLogoutLog = recentLogs.some(l => l.action === 'USER_LOGOUT');
    assert(hasLoginLog, 'MariaDB audit_logs recorded USER_LOGIN event');
    assert(hasLogoutLog, 'MariaDB audit_logs recorded USER_LOGOUT event');

    // 11. Password Reset Request Flow (Section 5.3)
    console.log('\n11. Testing Secure Password Reset Request...');
    const forgotRes = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: student.email })
    });
    const forgotData = await forgotRes.json();
    assert(forgotRes.status === 200, 'Password reset request returned HTTP 200');
    assert(forgotData.message.includes('password reset instructions'), 'Non-revealing security message returned');

    console.log('\n====================================================');
    console.log(`AUTH VERIFICATION COMPLETE: ${passedTests} / ${totalTests} PASSED`);
    console.log('====================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ AUTH VERIFICATION ERROR:', err);
    process.exit(1);
  }
}

runAuthTests();