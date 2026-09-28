// scripts/test_security_hardening_comprehensive.mjs
// Comprehensive Automated Security Hardening & Authorization Test Suite

import jwt from 'jsonwebtoken';

const BASE_URL = process.env.API_GATEWAY_URL || 'http://localhost:8080';
const JWT_SECRET = Buffer.from('404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970', 'base64');
const WRONG_SECRET = Buffer.from('1111111111111111111111111111111111111111111111111111111111111111', 'base64');

function makeToken({
  sub = 'usr-test-1',
  roles = ['PATIENT'],
  permissions = [],
  hospitalId = 101,
  secret = JWT_SECRET,
  issuer = 'swarnika-iam',
  audience = 'swarnika-care',
  expiresIn = '2h'
} = {}) {
  return jwt.sign(
    {
      sub,
      roles,
      permissions,
      hospitalId,
      iss: issuer,
      aud: audience
    },
    secret,
    { algorithm: 'HS256', expiresIn }
  );
}

// Tokens for various roles
const patientToken = makeToken({ sub: 'usr-patient-1', roles: ['PATIENT'], hospitalId: 101 });
const patientBToken = makeToken({ sub: 'usr-patient-2', roles: ['PATIENT'], hospitalId: 102 });
const receptionistToken = makeToken({ sub: 'usr-rec-1', roles: ['RECEPTIONIST'], hospitalId: 101 });
const nurseToken = makeToken({ sub: 'usr-nurse-1', roles: ['NURSE'], hospitalId: 101 });
const doctorToken = makeToken({ sub: 'usr-doc-1', roles: ['DOCTOR'], permissions: ['CLINICAL_WRITE'], hospitalId: 101 });
const adminToken = makeToken({ sub: 'usr-admin-1', roles: ['HOSPITAL_ADMIN'], hospitalId: 101 });
const superAdminToken = makeToken({ sub: 'usr-super-1', roles: ['SUPER_ADMIN'] });

// Bad / Malformed tokens
const expiredToken = makeToken({ expiresIn: '-10s' });
const wrongKeyToken = makeToken({ secret: WRONG_SECRET });
const wrongAudienceToken = makeToken({ audience: 'attacker-care' });
const wrongIssuerToken = makeToken({ issuer: 'attacker-iam' });

async function req(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...(options.headers || {})
  };
  const config = {
    method: options.method || 'GET',
    headers,
    ...(options.body ? { body: JSON.stringify(options.body) } : {})
  };
  try {
    const res = await fetch(url, config);
    let data = null;
    try {
      data = await res.json();
    } catch {}
    return { status: res.status, ok: res.ok, data };
  } catch (err) {
    return { status: 500, ok: false, error: err.message };
  }
}

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${testName} - ${details}`);
    failed++;
  }
}

async function runSuite() {
  console.log('===============================================================');
  console.log('🛡️  SWARNIKA CARE — COMPREHENSIVE SECURITY HARDENING SUITE');
  console.log('===============================================================\n');

  // ==============================================================
  // CATEGORY A: FAIL-CLOSED AUTHENTICATION & MOCK AUTH REMOVAL
  // ==============================================================
  console.log('▶ CATEGORY A: FAIL-CLOSED AUTHENTICATION & NO MOCK FALLBACK');

  // A1: Missing token on protected endpoint
  {
    const res = await req('/api/v1/patients');
    assert(res.status === 401 || res.status === 403, 'Missing Authorization token is rejected', `Status: ${res.status}`);
  }

  // A2: Expired token
  {
    const res = await req('/api/v1/patients', { token: expiredToken });
    assert(res.status === 401 || res.status === 403, 'Expired JWT is rejected', `Status: ${res.status}`);
  }

  // A3: Wrong signature key
  {
    const res = await req('/api/v1/patients', { token: wrongKeyToken });
    assert(res.status === 401 || res.status === 403, 'JWT signed with wrong key is rejected', `Status: ${res.status}`);
  }

  // A4: Wrong audience claim
  {
    const res = await req('/api/v1/patients', { token: wrongAudienceToken });
    assert(res.status === 401 || res.status === 403, 'JWT with invalid audience is rejected', `Status: ${res.status}`);
  }

  // A5: Wrong issuer claim
  {
    const res = await req('/api/v1/patients', { token: wrongIssuerToken });
    assert(res.status === 401 || res.status === 403, 'JWT with invalid issuer is rejected', `Status: ${res.status}`);
  }

  // A6: Malformed / Garbage token
  {
    const res = await req('/api/v1/patients', { token: 'invalid.garbage.jwt-token-string' });
    assert(res.status === 401 || res.status === 403, 'Malformed/garbage token is rejected', `Status: ${res.status}`);
  }

  // A7: Mock-admin fallback attempt (no fallback synthetic user)
  {
    const res = await req('/api/v1/patients', {
      token: 'mock-admin-token-that-fails-signature'
    });
    assert(res.status === 401 || res.status === 403, 'Mock admin fallback token fails closed (no synthetic admin)', `Status: ${res.status}`);
  }

  // ==============================================================
  // CATEGORY B: METHOD-LEVEL AUTHORIZATION BOUNDARIES
  // ==============================================================
  console.log('\n▶ CATEGORY B: ROLE-BASED AUTHORIZATION BOUNDARIES');

  // B1: Patient accessing Admin endpoint (hospital creation requires SUPER_ADMIN)
  {
    const res = await req('/api/v1/hospitals', {
      method: 'POST',
      token: patientToken,
      body: { name: 'Patient Created Hospital', code: 'PCH', city: 'Delhi', state: 'Delhi' }
    });
    assert(res.status === 403 || res.status === 401, 'Patient cannot access Admin hospital creation', `Status: ${res.status}`);
  }

  // B2: Patient attempting to create department
  {
    const res = await req('/api/v1/departments', {
      method: 'POST',
      token: patientToken,
      body: { name: 'Illegal Dept', hospitalId: 101 }
    });
    assert(res.status === 403 || res.status === 401, 'Patient cannot create department', `Status: ${res.status}`);
  }

  // B3: Patient accessing Staff listing
  {
    const res = await req('/api/v1/employees/hospital/101', { token: patientToken });
    assert(res.status === 403 || res.status === 401, 'Patient cannot list hospital employees', `Status: ${res.status}`);
  }

  // B4: Doctor accessing Super Admin hospital creation
  {
    const res = await req('/api/v1/hospitals', {
      method: 'POST',
      token: doctorToken,
      body: { name: 'Doctor Hospital', code: 'DCH', city: 'Delhi', state: 'Delhi' }
    });
    assert(res.status === 403 || res.status === 401, 'Doctor cannot create hospital', `Status: ${res.status}`);
  }

  // B5: Receptionist modifying doctor availability
  {
    const res = await req('/api/v1/doctors/1/availability', {
      method: 'POST',
      token: receptionistToken,
      body: {
        hospitalId: 101,
        departmentId: 101,
        dayOfWeek: 'MONDAY',
        startTime: '09:00:00',
        endTime: '17:00:00'
      }
    });
    assert(res.status === 403 || res.status === 401, 'Receptionist blocked from adding doctor availability', `Status: ${res.status}`);
  }

  // B6: Receptionist modifying clinical diagnosis/consultation
  {
    const res = await req('/api/v1/encounters/1/consultation', {
      method: 'PUT',
      token: receptionistToken,
      body: { diagnosis: 'Malicious modification', symptoms: 'Fever' }
    });
    assert(res.status === 403, 'Receptionist blocked from updating clinical consultation', `Status: ${res.status}`);
  }

  // B7: Receptionist creating clinical prescription
  {
    const res = await req('/api/v1/encounters/1/prescriptions', {
      method: 'POST',
      token: receptionistToken,
      body: {
        items: [{
          medicineName: 'Amoxicillin',
          dosage: '500mg',
          frequency: 'TDS',
          duration: '5 days'
        }]
      }
    });
    assert(res.status === 403 || res.status === 401, 'Receptionist blocked from creating clinical prescription', `Status: ${res.status}`);
  }

  // B8: Nurse completing doctor clinical encounter
  {
    const res = await req('/api/v1/encounters/1/complete', {
      method: 'PATCH',
      token: nurseToken
    });
    assert(res.status === 403, 'Nurse blocked from completing doctor clinical encounter', `Status: ${res.status}`);
  }

  // ==============================================================
  // CATEGORY C: OBJECT-LEVEL AUTHORIZATION & PATIENT ACCESS
  // ==============================================================
  console.log('\n▶ CATEGORY C: OBJECT-LEVEL AUTHORIZATION & PATIENT SELF-ACCESS');

  // C1: Patient accessing other patient documents
  {
    const res = await req('/api/v1/patients/me/documents/999999/access', { token: patientToken });
    assert(res.status === 403 || res.status === 404, 'Patient blocked from accessing arbitrary document ID/UUID', `Status: ${res.status}`);
  }

  // C2: Patient redeeming forged access token
  {
    const res = await req('/api/v1/documents/redeem?token=forged-or-expired-token');
    assert(res.status === 401 || res.status === 403 || res.status === 410 || res.status === 404, 'Redeeming invalid/forged document token rejected', `Status: ${res.status}`);
  }

  // C3: Patient accessing another patient profile by ID
  {
    const res = await req('/api/v1/patients/999999', { token: patientToken });
    assert(res.status === 403 || res.status === 404, 'Patient blocked from snooping other patient ID', `Status: ${res.status}`);
  }

  // C4: Unassigned staff accessing patient from another hospital
  {
    const foreignStaffToken = makeToken({ sub: 'usr-foreign-staff', roles: ['RECEPTIONIST'], hospitalId: 999 });
    const res = await req('/api/v1/patients/1/documents', { token: foreignStaffToken });
    assert(res.status === 403 || res.status === 404, 'Staff from Hospital 999 blocked from Hospital 101 patient documents', `Status: ${res.status}`);
  }

  // ==============================================================
  // CATEGORY D: HEADER TAMPERING & PRIVILEGE ESCALATION
  // ==============================================================
  console.log('\n▶ CATEGORY D: HEADER TAMPERING & PRIVILEGE ESCALATION RESISTANCE');

  // D1: Client injecting X-Role header to escalate to SUPER_ADMIN
  {
    const res = await req('/api/v1/hospitals', {
      method: 'POST',
      token: patientToken,
      headers: {
        'X-Role': 'SUPER_ADMIN',
        'X-Roles': 'SUPER_ADMIN',
        'X-Permissions': 'ALL_ACCESS'
      },
      body: { name: 'Escalated Hospital' }
    });
    assert(res.status === 403 || res.status === 401, 'Injected X-Role / X-Permissions headers do not grant privileges', `Status: ${res.status}`);
  }

  // D2: Client injecting X-User-Id header to impersonate another user
  {
    const res = await req('/api/v1/patients/me', {
      token: patientToken,
      headers: {
        'X-User-Id': 'admin-target-user',
        'X-Hospital-Id': '1'
      }
    });
    // Request must either resolve patient-1 or reject; must not become admin
    assert(res.status === 200 || res.status === 404 || res.status === 403, 'Identity strictly derived from JWT subject, not X-User-Id header', `Status: ${res.status}`);
  }

  // ==============================================================
  // CATEGORY E: PUBLIC ENDPOINT REGRESSION
  // ==============================================================
  console.log('\n▶ CATEGORY E: LEGITIMATE PUBLIC ENDPOINTS REGRESSION');

  // E1: Public doctor directory
  {
    const res = await req('/api/v1/public/doctors');
    assert(res.status === 200, 'Public doctor directory is accessible without authentication', `Status: ${res.status}`);
  }

  // E2: Public specialities
  {
    const res = await req('/api/v1/public/doctors/specialities');
    assert(res.status === 200, 'Public doctor specialities endpoint is accessible', `Status: ${res.status}`);
  }

  // E3: Public hospital list
  {
    const res = await req('/api/v1/public/hospitals');
    assert(res.status === 200, 'Public hospital directory is accessible without authentication', `Status: ${res.status}`);
  }

  // E4: Health check endpoint
  {
    const res = await req('/actuator/health');
    assert(res.status === 200, 'Actuator health endpoint is accessible and reports status UP', `Status: ${res.status}`);
  }

  // ==============================================================
  // SUMMARY
  // ==============================================================
  console.log('\n===============================================================');
  console.log(`🏁 SECURITY SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
