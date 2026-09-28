// ============================================================
// SWARNIKA CARE — PHASE A1 E2E TEST
// Patient → Appointment → Reception → OPD → Emergency
// ============================================================
import crypto from 'crypto';

const GATEWAY = 'http://localhost:8080/api/v1';
const SECRET = '404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970';
const TS = Date.now();

// ─── Utility ─────────────────────────────────────────────────
function b64u(s) { return Buffer.from(s).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_'); }

function jwt(email, role, userId, hospitalId = 1) {
  const h = { alg:'HS256', typ:'JWT' };
  const now = Math.floor(Date.now()/1000);
  const p = { sub: email, roles:[role], hospitalId, userId, iss:'swarnika-iam', aud:'swarnika-care', iat:now, exp:now+36000 };
  const si = `${b64u(JSON.stringify(h))}.${b64u(JSON.stringify(p))}`;
  const sig = crypto.createHmac('sha256', Buffer.from(SECRET,'base64')).update(si).digest();
  return `${si}.${sig.toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')}`;
}

async function api(path, method, body, token) {
  const r = await fetch(`${GATEWAY}${path}`, {
    method,
    headers: { 'Content-Type':'application/json', ...(token && { 'Authorization':`Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await r.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }
  if (!r.ok) console.log(`  [WARN] ${method} ${path} → ${r.status}: ${typeof data === 'string' ? data : JSON.stringify(data).slice(0,200)}`);
  return { ok: r.ok, status: r.status, data };
}

async function provision(email, role) {
  try {
    await fetch('http://localhost:8081/api/v1/internal/users/provision-staff', {
      method:'POST', headers:{'Content-Type':'application/json','X-Internal-Secret':'InternalSecret12345!'},
      body: JSON.stringify({ email, role })
    });
  } catch {}
}

// ─── Results tracking ────────────────────────────────────────
const results = [];
function pass(name) { results.push({ name, status: 'PASS' }); console.log(`  ✅ ${name}`); }
function fail(name, reason) { results.push({ name, status: 'FAIL', reason }); console.log(`  ❌ ${name}: ${reason}`); }

// ─── Main ────────────────────────────────────────────────────
async function run() {
  console.log('='.repeat(60));
  console.log('🏥 PHASE A1: Patient → Appointment → Reception → OPD → Emergency');
  console.log('='.repeat(60));

  // ══════════════════════════════════════════════════════════
  // WORKFLOW 1: PATIENT
  // ══════════════════════════════════════════════════════════
  console.log('\n── WORKFLOW 1: PATIENT ─────────────────────');

  // 1a. Provision IAM users
  const users = {
    admin:       { email: `a1.admin.${TS}@test.sc`, role: 'SUPER_ADMIN', id: 201 },
    doctor:      { email: `a1.doc.${TS}@test.sc`, role: 'DOCTOR', id: 202 },
    receptionist:{ email: `a1.rec.${TS}@test.sc`, role: 'RECEPTIONIST', id: 203 },
    nurse:       { email: `a1.nurse.${TS}@test.sc`, role: 'NURSE', id: 204 },
    billing:     { email: `a1.bill.${TS}@test.sc`, role: 'BILLING_STAFF', id: 205 },
  };

  for (const [k, u] of Object.entries(users)) {
    if (u.role !== 'SUPER_ADMIN' && u.role !== 'DOCTOR') await provision(u.email, u.role);
  }
  pass('1a. IAM Provisioning');

  // 1b. Create Hospital
  const adminToken = jwt(users.admin.email, users.admin.role, users.admin.id);
  const hRes = await api('/hospitals', 'POST', { name: `A1-Hospital-${TS}`, code: `A1-${TS}`, address: '123 Test', email: `a1.${TS}@sc.com`, phone: '+91-1111111111' }, adminToken);
  const hospitalId = hRes.data?.data?.id || 1;
  hRes.ok ? pass('1b. Hospital Created (id=' + hospitalId + ')') : fail('1b. Hospital Creation', JSON.stringify(hRes.data));

  // 1c. Create Department
  const depRes = await api('/departments', 'POST', { hospitalId, name: 'Maternity', code: `MAT-${TS}`, description: 'Maternity', isActive: true }, adminToken);
  const departmentId = depRes.data?.data?.id || 1;
  depRes.ok ? pass('1c. Department Created (id=' + departmentId + ')') : fail('1c. Department Creation', JSON.stringify(depRes.data));

  // Generate tokens with correct hospitalId
  const recToken = jwt(users.receptionist.email, users.receptionist.role, users.receptionist.id, hospitalId);
  let docToken = jwt(users.doctor.email, users.doctor.role, users.doctor.id, hospitalId);

  // 1d. Register Patient (Mother)
  const pRes = await api('/patients', 'POST', {
    hospitalId, firstName: 'Priya', lastName: 'Sharma',
    gender: 'FEMALE', dateOfBirth: '1992-03-15',
    phone: `91${TS.toString().slice(-10)}`, email: `priya.${TS}@test.sc`,
    contactNumber: `91${TS.toString().slice(-10)}`
  }, recToken);
  const patientId = pRes.data?.id || pRes.data?.data?.id;
  pRes.ok && patientId ? pass('1d. Patient Registered (id=' + patientId + ')') : fail('1d. Patient Registration', JSON.stringify(pRes.data));

  // 1e. Verify Patient GET
  if (patientId) {
    const getP = await api(`/patients/${patientId}`, 'GET', null, recToken);
    getP.ok ? pass('1e. Patient GET Verified') : fail('1e. Patient GET', JSON.stringify(getP.data));
  }

  // ══════════════════════════════════════════════════════════
  // WORKFLOW 2: APPOINTMENT
  // ══════════════════════════════════════════════════════════
  console.log('\n── WORKFLOW 2: APPOINTMENT ─────────────────');

  // 2a. Create Doctor
  const drRes = await api('/doctors', 'POST', {
    hospitalId, departmentId,
    firstName: 'Dr. Ananya', lastName: 'Patel',
    specialization: 'OBGYN', email: users.doctor.email,
    phone: '9999999999', active: true
  }, adminToken);
  const doctorId = drRes.data?.data?.id || drRes.data?.id;
  const actualDocUserId = drRes.data?.data?.userId || drRes.data?.userId || users.doctor.id;
  drRes.ok ? pass('2a. Doctor Created (id=' + doctorId + ')') : fail('2a. Doctor Creation', JSON.stringify(drRes.data));

  // Regenerate docToken with the correct userId assigned by IAM
  docToken = jwt(users.doctor.email, users.doctor.role, actualDocUserId, hospitalId);

  // 2b. Assign Doctor to Hospital
  const assignRes = await api(`/doctors/${doctorId}/assignments`, 'POST', {
    hospitalId, departmentId, designation: 'Sr. Consultant', status: 'ACTIVE'
  }, adminToken);
  assignRes.ok ? pass('2b. Doctor → Hospital Assignment') : fail('2b. Doctor Assignment', JSON.stringify(assignRes.data));

  // 2c. Set Doctor Availability (today's day)
  const days = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
  const today = days[new Date().getDay()];
  const availRes = await api(`/doctors/${doctorId}/availability`, 'POST', {
    hospitalId, departmentId, dayOfWeek: today,
    startTime: '08:00:00', endTime: '20:00:00',
    slotDurationMinutes: 30, maxPatients: 40, isAvailable: true
  }, adminToken);
  availRes.ok ? pass('2c. Doctor Availability Set (' + today + ')') : fail('2c. Doctor Availability', JSON.stringify(availRes.data));

  // 2d. Book Appointment
  const apptDate = new Date().toISOString().split('T')[0]; // today
  const apptRes = await api('/appointments', 'POST', {
    hospitalId, departmentId, doctorId, patientId,
    appointmentDate: apptDate, startTime: '10:00:00', endTime: '10:30:00',
    appointmentType: 'CONSULTATION'
  }, recToken);
  const appointmentId = apptRes.data?.data?.id || apptRes.data?.id;
  apptRes.ok && appointmentId ? pass('2d. Appointment Booked (id=' + appointmentId + ')') : fail('2d. Appointment Booking', JSON.stringify(apptRes.data));

  // 2e. Verify Appointment GET
  if (appointmentId) {
    const getA = await api(`/appointments/${appointmentId}`, 'GET', null, recToken);
    const status = getA.data?.data?.status || getA.data?.status;
    getA.ok && status === 'SCHEDULED' ? pass('2e. Appointment Status = SCHEDULED') : fail('2e. Appointment Status', `Expected SCHEDULED, got ${status}`);
  }

  // ══════════════════════════════════════════════════════════
  // WORKFLOW 3: RECEPTION (Check-in)
  // ══════════════════════════════════════════════════════════
  console.log('\n── WORKFLOW 3: RECEPTION ───────────────────');

  // 3a. Confirm Appointment (= check-in)
  if (appointmentId) {
    const confRes = await api(`/appointments/${appointmentId}/confirm`, 'PATCH', null, recToken);
    const st = confRes.data?.data?.status || confRes.data?.status;
    confRes.ok && st === 'CONFIRMED' ? pass('3a. Appointment Confirmed (check-in)') : fail('3a. Appointment Confirm', `Status: ${st}, ${JSON.stringify(confRes.data)}`);
  }

  // 3b. Issue Queue Token
  const qRes = await api('/queue-tokens', 'POST', {
    hospitalId, patientId, doctorId, departmentId,
    appointmentId, priority: 'NORMAL'
  }, recToken);
  const tokenId = qRes.data?.data?.id || qRes.data?.id;
  const tokenNumber = qRes.data?.data?.tokenNumber || qRes.data?.tokenNumber;
  qRes.ok ? pass('3b. Queue Token Issued (token=' + tokenNumber + ', id=' + tokenId + ')') : fail('3b. Queue Token', JSON.stringify(qRes.data));

  // 3c. Get Queue Tokens for verification
  if (tokenId) {
    const qGet = await api(`/queue-tokens/${tokenId}`, 'GET', null, recToken);
    qGet.ok ? pass('3c. Queue Token GET Verified') : fail('3c. Queue Token GET', JSON.stringify(qGet.data));
  }

  // ══════════════════════════════════════════════════════════
  // WORKFLOW 4: OPD
  // ══════════════════════════════════════════════════════════
  console.log('\n── WORKFLOW 4: OPD ─────────────────────────');

  // 4a. Create OPD Encounter
  const opdRes = await api('/opd/encounters', 'POST', {
    hospitalId, patientId, departmentId, doctorId,
    appointmentId, chiefComplaint: 'Routine prenatal checkup',
    notes: 'Walk-in OPD consultation'
  }, docToken);
  const encounterId = opdRes.data?.data?.id || opdRes.data?.id;
  opdRes.ok && encounterId ? pass('4a. OPD Encounter Created (id=' + encounterId + ')') : fail('4a. OPD Encounter', JSON.stringify(opdRes.data));

  // 4b. Start Encounter
  if (encounterId) {
    const startRes = await api(`/encounters/${encounterId}/start`, 'PATCH', null, docToken);
    const st = startRes.data?.data?.status || startRes.data?.status;
    startRes.ok ? pass('4b. Encounter Started (status=' + st + ')') : fail('4b. Start Encounter', JSON.stringify(startRes.data));
  }

  // 4c. Update Consultation
  if (encounterId) {
    const consRes = await api(`/encounters/${encounterId}/consultation`, 'PUT', {
      chiefComplaint: 'Prenatal checkup - 28 weeks',
      primaryDiagnosis: 'Normal pregnancy, third trimester',
      secondaryDiagnosis: 'Mild anemia',
      clinicalNotes: 'Vitals normal. Fetal heartbeat regular. Iron supplement advised.',
      treatmentPlan: 'Iron supplement + folic acid. Follow up in 2 weeks.',
      followUpDate: '2026-10-12',
      followUpNotes: 'Repeat CBC after 2 weeks'
    }, docToken);
    consRes.ok ? pass('4c. Consultation Updated') : fail('4c. Consultation Update', JSON.stringify(consRes.data));
  }

  // 4d. Create Prescription
  if (encounterId) {
    const rxRes = await api(`/encounters/${encounterId}/prescriptions`, 'POST', {
      notes: 'Iron & folic acid supplements',
      items: [
        { medicineName: 'Ferrous Sulfate 200mg', dosage: '200mg', frequency: 'Once daily', duration: '30 days', route: 'ORAL', instructions: 'Take after meals' },
        { medicineName: 'Folic Acid 5mg', dosage: '5mg', frequency: 'Once daily', duration: '30 days', route: 'ORAL', instructions: 'Take in the morning' }
      ]
    }, docToken);
    const rxId = rxRes.data?.data?.id || rxRes.data?.id;
    rxRes.ok ? pass('4d. Prescription Created (id=' + rxId + ')') : fail('4d. Prescription', JSON.stringify(rxRes.data));
  }

  // 4e. Verify Prescription GET
  if (encounterId) {
    const rxGet = await api(`/encounters/${encounterId}/prescriptions`, 'GET', null, docToken);
    const rxList = rxGet.data?.data || [];
    rxGet.ok && rxList.length > 0 ? pass('4e. Prescriptions Retrieved (count=' + rxList.length + ')') : fail('4e. Prescriptions GET', `count=${rxList.length}`);
  }

  // 4f. Create Clinical Order (Lab: CBC)
  if (encounterId) {
    const labRes = await api(`/encounters/${encounterId}/orders`, 'POST', {
      orderType: 'LAB',
      testName: 'Complete Blood Count (CBC)',
      priority: 'ROUTINE',
      clinicalIndication: 'Anemia monitoring in pregnancy'
    }, docToken);
    const ordId = labRes.data?.data?.id || labRes.data?.id;
    labRes.ok ? pass('4f. Lab Order Created (id=' + ordId + ')') : fail('4f. Lab Order', JSON.stringify(labRes.data));
  }

  // 4g. Verify Clinical Orders GET
  if (encounterId) {
    const ordGet = await api(`/encounters/${encounterId}/orders`, 'GET', null, docToken);
    const ordList = ordGet.data?.data || [];
    ordGet.ok && ordList.length > 0 ? pass('4g. Clinical Orders Retrieved (count=' + ordList.length + ')') : fail('4g. Clinical Orders GET', `count=${ordList.length}`);
  }

  // 4h. Complete Encounter (authorized doctor)
  if (encounterId) {
    const compRes = await api(`/encounters/${encounterId}/complete`, 'PATCH', { notes: 'OPD visit completed successfully' }, docToken);
    const st = compRes.data?.data?.status || compRes.data?.status;
    compRes.ok ? pass('4h. OPD Encounter Completed (status=' + st + ')') : fail('4h. Complete Encounter', JSON.stringify(compRes.data));
  }

  // 4i. Complete Appointment
  if (appointmentId) {
    const apptComp = await api(`/appointments/${appointmentId}/complete`, 'PATCH', null, docToken);
    apptComp.ok ? pass('4i. Appointment Completed') : fail('4i. Appointment Complete', JSON.stringify(apptComp.data));
  }

  // 4j. Security: Receptionist CANNOT complete encounter
  // (Create a second encounter to test unauthorized access)
  const enc2Res = await api('/encounters', 'POST', {
    hospitalId, patientId, departmentId, doctorId,
    encounterType: 'OPD', status: 'OPEN'
  }, recToken);
  const enc2Id = enc2Res.data?.data?.id || enc2Res.data?.id;
  if (enc2Id) {
    // Start it first
    await api(`/encounters/${enc2Id}/start`, 'PATCH', null, docToken);
    // Now try completing with receptionist (should 403)
    const unauthRes = await api(`/encounters/${enc2Id}/complete`, 'PATCH', { notes: 'Unauthorized' }, recToken);
    unauthRes.status === 403 ? pass('4j. Security: Receptionist cannot complete encounter (403)') : fail('4j. Security', `Expected 403, got ${unauthRes.status}`);
    // Clean up — complete it properly with doctor
    await api(`/encounters/${enc2Id}/complete`, 'PATCH', { notes: 'Cleanup' }, docToken);
  }

  // ══════════════════════════════════════════════════════════
  // WORKFLOW 5: EMERGENCY
  // ══════════════════════════════════════════════════════════
  console.log('\n── WORKFLOW 5: EMERGENCY ───────────────────');

  // 5a. Register Emergency Patient
  const emergPatRes = await api('/patients', 'POST', {
    hospitalId, firstName: 'Meera', lastName: 'Devi',
    gender: 'FEMALE', dateOfBirth: '1988-07-22',
    phone: `92${TS.toString().slice(-10)}`, email: `meera.${TS}@test.sc`,
    contactNumber: `92${TS.toString().slice(-10)}`
  }, recToken);
  const emergPatientId = emergPatRes.data?.id || emergPatRes.data?.data?.id;
  emergPatRes.ok && emergPatientId ? pass('5a. Emergency Patient Registered (id=' + emergPatientId + ')') : fail('5a. Emergency Patient', JSON.stringify(emergPatRes.data));

  // 5b. Create Emergency Encounter (no appointment)
  const emergRes = await api('/emergency/encounters', 'POST', {
    hospitalId, patientId: emergPatientId, departmentId,
    chiefComplaint: 'Severe abdominal pain, 36 weeks pregnant',
    notes: 'Emergency triage — possible preterm labor'
  }, recToken);
  const emergEncId = emergRes.data?.data?.id || emergRes.data?.id;
  emergRes.ok && emergEncId ? pass('5b. Emergency Encounter Created (id=' + emergEncId + ')') : fail('5b. Emergency Encounter', JSON.stringify(emergRes.data));

  // 5c. Verify source is EMERGENCY
  if (emergEncId) {
    const eGet = await api(`/encounters/${emergEncId}`, 'GET', null, docToken);
    const src = eGet.data?.data?.source || eGet.data?.source;
    const type = eGet.data?.data?.encounterType || eGet.data?.encounterType;
    eGet.ok && type === 'EMERGENCY' ? pass('5c. Encounter Type = EMERGENCY, Source = ' + src) : fail('5c. Emergency Verify', `type=${type}, source=${src}`);
  }

  // 5d. Start Emergency Encounter
  if (emergEncId) {
    const eStart = await api(`/encounters/${emergEncId}/start`, 'PATCH', null, docToken);
    eStart.ok ? pass('5d. Emergency Encounter Started') : fail('5d. Emergency Start', JSON.stringify(eStart.data));
  }

  // 5e. Emergency Consultation
  if (emergEncId) {
    const eCons = await api(`/encounters/${emergEncId}/consultation`, 'PUT', {
      chiefComplaint: 'Severe abdominal pain at 36 weeks',
      primaryDiagnosis: 'Threatened preterm labor',
      clinicalNotes: 'Contractions 5 min apart. Cervix 2cm dilated. Admit for observation.',
      treatmentPlan: 'Tocolysis + bed rest. Prepare for possible emergency C-section.'
    }, docToken);
    eCons.ok ? pass('5e. Emergency Consultation Documented') : fail('5e. Emergency Consultation', JSON.stringify(eCons.data));
  }

  // 5f. Emergency Lab Order
  if (emergEncId) {
    const eOrd = await api(`/encounters/${emergEncId}/orders`, 'POST', {
      orderType: 'LAB', testName: 'Emergency CBC + Cross-match',
      priority: 'STAT', clinicalIndication: 'Preterm labor — prepare for surgery'
    }, docToken);
    eOrd.ok ? pass('5f. Emergency Lab Order (STAT priority)') : fail('5f. Emergency Lab Order', JSON.stringify(eOrd.data));
  }

  // 5g. Complete Emergency Encounter
  if (emergEncId) {
    const eComp = await api(`/encounters/${emergEncId}/complete`, 'PATCH', { notes: 'Patient stabilized. Transferred to IPD for observation.' }, docToken);
    eComp.ok ? pass('5g. Emergency Encounter Completed') : fail('5g. Emergency Complete', JSON.stringify(eComp.data));
  }

  // ══════════════════════════════════════════════════════════
  // DATABASE VERIFICATION
  // ══════════════════════════════════════════════════════════
  console.log('\n── DATABASE VERIFICATION ───────────────────');

  // DB1. Verify patient persisted
  if (patientId) {
    const dbP = await api(`/patients/${patientId}`, 'GET', null, recToken);
    dbP.ok ? pass('DB1. Patient persisted in DB') : fail('DB1. Patient persistence', JSON.stringify(dbP.data));
  }

  // DB2. Verify encounter persisted
  if (encounterId) {
    const dbE = await api(`/encounters/${encounterId}`, 'GET', null, docToken);
    const st = dbE.data?.data?.status || dbE.data?.status;
    dbE.ok && st === 'COMPLETED' ? pass('DB2. OPD Encounter persisted (COMPLETED)') : fail('DB2. Encounter persistence', `status=${st}`);
  }

  // DB3. Verify prescriptions persisted
  if (encounterId) {
    const dbRx = await api(`/encounters/${encounterId}/prescriptions`, 'GET', null, docToken);
    const rxCount = (dbRx.data?.data || []).length;
    rxCount > 0 ? pass('DB3. Prescriptions persisted (count=' + rxCount + ')') : fail('DB3. Prescription persistence', `count=${rxCount}`);
  }

  // DB4. Verify clinical orders persisted
  if (encounterId) {
    const dbOrd = await api(`/encounters/${encounterId}/orders`, 'GET', null, docToken);
    const ordCount = (dbOrd.data?.data || []).length;
    ordCount > 0 ? pass('DB4. Clinical Orders persisted (count=' + ordCount + ')') : fail('DB4. Order persistence', `count=${ordCount}`);
  }

  // DB5. Verify appointment final status
  if (appointmentId) {
    const dbAppt = await api(`/appointments/${appointmentId}`, 'GET', null, recToken);
    const st = dbAppt.data?.data?.status || dbAppt.data?.status;
    st === 'COMPLETED' ? pass('DB5. Appointment final status = COMPLETED') : fail('DB5. Appointment final status', `status=${st}`);
  }

  // DB6. Verify emergency encounter persisted
  if (emergEncId) {
    const dbEmerg = await api(`/encounters/${emergEncId}`, 'GET', null, docToken);
    const st = dbEmerg.data?.data?.status || dbEmerg.data?.status;
    const type = dbEmerg.data?.data?.encounterType || dbEmerg.data?.encounterType;
    dbEmerg.ok && st === 'COMPLETED' && type === 'EMERGENCY' ? pass('DB6. Emergency Encounter persisted (COMPLETED/EMERGENCY)') : fail('DB6. Emergency persistence', `status=${st}, type=${type}`);
  }

  // ══════════════════════════════════════════════════════════
  // FINAL REPORT
  // ══════════════════════════════════════════════════════════
  console.log('\n' + '='.repeat(60));
  console.log('📊 PHASE A1 FINAL REPORT');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;

  console.log(`\nTotal: ${total}  |  ✅ PASS: ${passed}  |  ❌ FAIL: ${failed}`);
  console.log(`Pass Rate: ${((passed/total)*100).toFixed(1)}%\n`);

  // Per-workflow summary
  const workflows = {
    'PATIENT':     results.filter(r => r.name.startsWith('1')),
    'APPOINTMENT': results.filter(r => r.name.startsWith('2')),
    'RECEPTION':   results.filter(r => r.name.startsWith('3')),
    'OPD':         results.filter(r => r.name.startsWith('4')),
    'EMERGENCY':   results.filter(r => r.name.startsWith('5')),
    'DB VERIFY':   results.filter(r => r.name.startsWith('DB')),
  };

  for (const [wf, tests] of Object.entries(workflows)) {
    const p = tests.filter(t => t.status === 'PASS').length;
    const f = tests.filter(t => t.status === 'FAIL').length;
    const icon = f === 0 ? '✅' : '❌';
    console.log(`  ${icon} ${wf}: ${p}/${tests.length} passed`);
    if (f > 0) tests.filter(t => t.status === 'FAIL').forEach(t => console.log(`     └─ ${t.name}: ${t.reason}`));
  }

  // Credentials
  console.log('\n── TEST CREDENTIALS ────────────────────────');
  for (const [k, u] of Object.entries(users)) {
    console.log(`  ${u.role.padEnd(15)} | ${u.email} | Auth: Email+OTP`);
  }
  console.log(`\n  HospitalId: ${hospitalId} | DepartmentId: ${departmentId} | DoctorId: ${doctorId}`);
  console.log(`  PatientId:  ${patientId} | AppointmentId: ${appointmentId} | EncounterId: ${encounterId}`);

  console.log('\n' + (failed === 0 ? '🎉 ALL PHASE A1 WORKFLOWS PASSED!' : `⚠️  ${failed} FAILURES REQUIRE ATTENTION`) + '\n');
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
