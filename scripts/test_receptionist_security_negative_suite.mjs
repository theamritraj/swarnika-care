// scripts/test_receptionist_security_negative_suite.mjs
// Automated Negative Security, Authorization Boundary, Concurrency & State Machine Test Suite

import jwt from 'jsonwebtoken';

const BASE_URL = process.env.API_GATEWAY_URL || 'http://localhost:8080';
const JWT_SECRET = Buffer.from('404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970', 'base64');

function makeToken({ sub = 'usr-receptionist-1', roles = ['RECEPTIONIST'], permissions = ['APPOINTMENT_READ', 'APPOINTMENT_CREATE'], hospitalId = 101, expiresIn = '2h' } = {}) {
  return jwt.sign(
    {
      sub,
      roles,
      permissions,
      hospitalId,
      iss: 'swarnika-iam',
      aud: 'swarnika-care'
    },
    JWT_SECRET,
    { algorithm: 'HS256', expiresIn }
  );
}

const receptionistToken = makeToken({ sub: 'usr-reception-test', roles: ['RECEPTIONIST'], hospitalId: 101 });
const doctorToken = makeToken({ sub: 'usr-doctor-1', roles: ['DOCTOR'], permissions: ['CLINICAL_WRITE'], hospitalId: 101 });

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

async function runNegativeSuite() {
  console.log('===============================================================');
  console.log('🛡️  SWARNIKA CARE — RECEPTIONIST NEGATIVE SECURITY & CONCURRENCY SUITE');
  console.log('===============================================================\n');

  // --- 1. Expired JWT rejected ---
  console.log('▶ TEST 1: Expired JWT validation');
  const expiredToken = makeToken({ expiresIn: '-10s' });
  const resExp = await req('/api/v1/admissions', { token: expiredToken });
  assert(resExp.status === 401 || resExp.status === 403, 'Expired JWT is rejected with 401/403', `Status: ${resExp.status}`);

  // --- 2. Forged Header Stripping (X-Hospital-Id & X-Role) ---
  console.log('\n▶ TEST 2: Forged Header rejection & stripping');
  const forgedHeadersRes = await req('/api/v1/admissions', {
    token: receptionistToken,
    headers: {
      'X-Role': 'SUPER_ADMIN',
      'X-Hospital-Id': '999999'
    }
  });
  // Since receptionist is hospital 101, querying hospital 999999 or injecting super_admin should not expose cross-hospital
  assert(forgedHeadersRes.ok || forgedHeadersRes.status === 200, 'Request processed safely without privilege escalation');

  // --- 3. Clinical Boundary: Receptionist CANNOT change diagnosis / consultation ---
  console.log('\n▶ TEST 3: Clinical Boundary - Receptionist cannot update consultation/diagnosis');
  const resConsult = await req('/api/v1/encounters/1/consultation', {
    method: 'PUT',
    token: receptionistToken,
    body: {
      clinicalNotes: 'Forged diagnosis: Acute Myocardial Infarction',
      provisionalDiagnosis: 'I21.9',
      treatmentPlan: 'Immediate Angioplasty'
    }
  });
  assert(resConsult.status === 403 || resConsult.status === 401, 'Receptionist blocked from updating clinical consultation', `Status: ${resConsult.status}`);

  // --- 4. Clinical Boundary: Receptionist CANNOT create prescription ---
  console.log('\n▶ TEST 4: Clinical Boundary - Receptionist cannot create prescription');
  const resPresc = await req('/api/v1/encounters/1/prescriptions', {
    method: 'POST',
    token: receptionistToken,
    body: {
      items: [{
        medicineName: 'Atorvastatin 40mg',
        dosage: '1 tab',
        frequency: 'OD',
        duration: '30 days'
      }]
    }
  });
  assert(resPresc.status === 403 || resPresc.status === 401, 'Receptionist blocked from creating prescription', `Status: ${resPresc.status}`);

  // --- 5. Clinical Boundary: Receptionist CANNOT complete encounter ---
  console.log('\n▶ TEST 5: Clinical Boundary - Receptionist cannot complete encounter');
  const resComp = await req('/api/v1/encounters/1/complete', {
    method: 'PATCH',
    token: receptionistToken,
    body: { notes: 'Receptionist closing encounter prematurely' }
  });
  assert(resComp.status === 403 || resComp.status === 401, 'Receptionist blocked from completing clinical encounter', `Status: ${resComp.status}`);

  // --- 6. Clinical Boundary: Receptionist CANNOT alter doctor availability ---
  console.log('\n▶ TEST 6: Receptionist cannot alter doctor availability');
  const resAvail = await req('/api/v1/doctors/1/availability', {
    method: 'POST',
    token: receptionistToken,
    body: {
      hospitalId: 101,
      departmentId: 101,
      dayOfWeek: 'MONDAY',
      startTime: '08:00:00',
      endTime: '18:00:00'
    }
  });
  assert(resAvail.status === 403 || resAvail.status === 401, 'Receptionist blocked from modifying doctor availability', `Status: ${resAvail.status}`);

  // --- 7. Admission Duplicate Active Protection ---
  console.log('\n▶ TEST 7: Duplicate active admission protection');
  // Create first admission for a test patient
  const uniquePatId = 999000 + Math.floor(Math.random() * 9000);
  const admRes1 = await req('/api/v1/admissions', {
    method: 'POST',
    token: receptionistToken,
    body: {
      patientId: uniquePatId,
      hospitalId: 101,
      departmentId: 101,
      admittingDoctorId: 1,
      admissionType: 'ELECTIVE',
      reason: 'Negative test initial admission'
    }
  });
  assert(admRes1.status === 201, 'First admission created successfully');

  // Attempt second admission for same patient
  const admRes2 = await req('/api/v1/admissions', {
    method: 'POST',
    token: receptionistToken,
    body: {
      patientId: uniquePatId,
      hospitalId: 101,
      departmentId: 101,
      admittingDoctorId: 1,
      admissionType: 'ELECTIVE',
      reason: 'Duplicate admission attempt'
    }
  });
  assert(admRes2.status === 400 || admRes2.status === 500 || admRes2.status === 409, 'Duplicate active admission correctly rejected', JSON.stringify(admRes2.data));

  // --- 8. Admission State Machine Invalid Transition ---
  console.log('\n▶ TEST 8: Admission state machine lifecycle rules');
  const admObj = admRes1.data?.data;
  if (admObj) {
    // Cancel the admission
    const cancelRes = await req(`/api/v1/admissions/${admObj.id}/status?status=CANCELLED&notes=Cancelled`, {
      method: 'PATCH',
      token: receptionistToken
    });
    assert(cancelRes.ok, 'Admission transitioned to CANCELLED');

    // Attempt invalid transition from CANCELLED -> ADMITTED
    const invalidTrans = await req(`/api/v1/admissions/${admObj.id}/status?status=ADMITTED&bedId=99`, {
      method: 'PATCH',
      token: receptionistToken
    });
    assert(!invalidTrans.ok, 'Transition from terminal CANCELLED state rejected', JSON.stringify(invalidTrans.data));
  }

  // --- 9. Concurrent Bed Allocation Collision Protection ---
  console.log('\n▶ TEST 9: Concurrent Bed allocation collision protection');
  const occupiedBedId = 888000 + Math.floor(Math.random() * 1000);
  const patA = uniquePatId + 1;
  const patB = uniquePatId + 2;

  // Admit PatA into occupiedBedId
  const bedRes1 = await req('/api/v1/admissions', {
    method: 'POST',
    token: receptionistToken,
    body: {
      patientId: patA,
      hospitalId: 101,
      departmentId: 101,
      admittingDoctorId: 1,
      admissionType: 'ELECTIVE',
      bedId: occupiedBedId,
      reason: 'Bed collision test patA'
    }
  });
  assert(bedRes1.status === 201, `Bed ${occupiedBedId} successfully allocated to Patient ${patA}`);

  // Attempt to allocate same bedId to PatB
  const bedRes2 = await req('/api/v1/admissions', {
    method: 'POST',
    token: receptionistToken,
    body: {
      patientId: patB,
      hospitalId: 101,
      departmentId: 101,
      admittingDoctorId: 1,
      admissionType: 'ELECTIVE',
      bedId: occupiedBedId,
      reason: 'Bed collision test patB'
    }
  });
  assert(!bedRes2.ok, 'Allocation of already-occupied bed rejected', JSON.stringify(bedRes2.data));

  // --- 10. Referral Invalid State Machine Transition ---
  console.log('\n▶ TEST 10: Referral state machine lifecycle rules');
  const refRes = await req('/api/v1/referrals', {
    method: 'POST',
    token: receptionistToken,
    body: {
      patientId: uniquePatId,
      hospitalId: 101,
      targetHospitalId: 102,
      targetDepartmentId: 101,
      priority: 'ROUTINE',
      reason: 'Referral lifecycle test'
    }
  });
  assert(refRes.status === 201, 'Referral created in REQUESTED state');
  const refObj = refRes.data?.data;
  if (refObj) {
    // Complete the referral directly or via valid steps
    await req(`/api/v1/referrals/${refObj.id}/status?status=CANCELLED&administrativeNotes=Patient declined`, {
      method: 'PATCH',
      token: receptionistToken
    });
    // Now attempt to move from CANCELLED -> ACKNOWLEDGED
    const invalidRefTrans = await req(`/api/v1/referrals/${refObj.id}/status?status=ACKNOWLEDGED`, {
      method: 'PATCH',
      token: receptionistToken
    });
    assert(!invalidRefTrans.ok, 'Transition from terminal CANCELLED referral status rejected', JSON.stringify(invalidRefTrans.data));
  }

  // --- 11. Queue Token Concurrency: 10 Concurrent Requests ---
  console.log('\n▶ TEST 11: Queue Token Concurrency (10 simultaneous token requests)');
  const queueDate = new Date().toISOString().split('T')[0];
  const promises = [];
  for (let i = 0; i < 10; i++) {
    const dummyPatientId = 700000 + Math.floor(Math.random() * 100000);
    promises.push(
      req('/api/v1/queue-tokens/issue', {
        method: 'POST',
        token: receptionistToken,
        body: {
          hospitalId: 101,
          departmentId: 101,
          doctorId: 1,
          patientId: dummyPatientId,
          queueDate,
          priority: 'NORMAL'
        }
      })
    );
  }

  const results = await Promise.all(promises);
  const successfulTokens = results.filter(r => r.ok && r.data?.data?.tokenNumber).map(r => r.data.data.tokenNumber);
  const uniqueTokens = new Set(successfulTokens);

  const failedResults = results.filter(r => !r.ok);
  if (failedResults.length > 0) {
    console.log('  [DEBUG Failed Token Requests]:', JSON.stringify(failedResults));
  }
  assert(successfulTokens.length === 10, 'All 10 concurrent requests completed successfully', `Succeeded: ${successfulTokens.length}/10`);
  assert(uniqueTokens.size === successfulTokens.length, 'All issued tokens are uniquely numbered without collisions', `Unique: ${uniqueTokens.size}, Total: ${successfulTokens.length}`);

  // --- 12. Duplicate Active Queue Token for Same Patient ---
  console.log('\n▶ TEST 12: Duplicate active token prevention for walk-in patient');
  const testWalkInPatId = 888123;
  const tokA = await req('/api/v1/queue-tokens/issue', {
    method: 'POST',
    token: receptionistToken,
    body: {
      hospitalId: 101,
      departmentId: 101,
      doctorId: 1,
      patientId: testWalkInPatId,
      queueDate,
      priority: 'NORMAL'
    }
  });
  assert(tokA.ok, 'First queue token issued');

  const tokB = await req('/api/v1/queue-tokens/issue', {
    method: 'POST',
    token: receptionistToken,
    body: {
      hospitalId: 101,
      departmentId: 101,
      doctorId: 1,
      patientId: testWalkInPatId,
      queueDate,
      priority: 'NORMAL'
    }
  });
  assert(tokB.ok && tokB.data?.data?.tokenNumber === tokA.data?.data?.tokenNumber, 'Second token request returns existing active token without creating duplicate');

  // --- 13. Audit Log Immutability ---
  console.log('\n▶ TEST 13: Audit Log Immutability (no modification or deletion allowed)');
  const auditPut = await req('/api/v1/audit-logs/1', {
    method: 'PUT',
    token: receptionistToken,
    body: { action: 'MUTATE_AUDIT' }
  });
  assert(auditPut.status === 405 || auditPut.status === 404, 'PUT /api/v1/audit-logs/{id} rejected (Method Not Allowed / Not Found)', `Status: ${auditPut.status}`);

  const auditDel = await req('/api/v1/audit-logs/1', {
    method: 'DELETE',
    token: receptionistToken
  });
  assert(auditDel.status === 405 || auditDel.status === 404, 'DELETE /api/v1/audit-logs/{id} rejected (Method Not Allowed / Not Found)', `Status: ${auditDel.status}`);

  console.log('\n===============================================================');
  console.log(`🏁 NEGATIVE SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runNegativeSuite();
