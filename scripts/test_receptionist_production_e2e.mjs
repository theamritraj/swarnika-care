import http from 'http';

const GATEWAY_URL = 'http://localhost:8080';
const SECRET_KEY = '404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970';

// Generate valid JWT using crypto
import crypto from 'crypto';

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function generateReceptionistToken() {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: 'usr-17',
    roles: ['RECEPTIONIST'],
    permissions: ['VIEW_PATIENTS', 'CREATE_PATIENTS', 'CREATE_APPOINTMENTS', 'MANAGE_QUEUE', 'VIEW_DOCTORS'],
    iss: 'swarnika-iam',
    aud: 'swarnika-care',
    iat: now,
    exp: now + 3600
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  
  // Spring Decoders.BASE64 decodes secretKey
  const keyBuffer = Buffer.from(SECRET_KEY, 'base64');
  const signature = crypto
    .createHmac('sha256', keyBuffer)
    .update(signatureInput)
    .digest();
  
  const encodedSignature = signature
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${signatureInput}.${encodedSignature}`;
}

const TOKEN = generateReceptionistToken();

async function api(path, method = 'GET', body = null) {
  const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  };

  const res = await fetch(`${GATEWAY_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  const text = await res.text();
  try {
    return { status: res.status, ok: res.ok, data: JSON.parse(text) };
  } catch {
    return { status: res.status, ok: res.ok, raw: text };
  }
}

async function runE2E() {
  console.log('===============================================================');
  console.log('🚀 SWARNIKA CARE RECEPTIONIST PORTAL — PRODUCTION E2E SUITE');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name} ${details ? '- ' + details : ''}`);
      failed++;
    }
  }

  // 1. Patient Registration
  console.log('▶ STEP 1: NEW PATIENT REGISTRATION (Capability 3)');
  const suffix = Date.now().toString().slice(-5);
  const pReq = {
    firstName: 'Aarav',
    lastName: `Sharma_${suffix}`,
    email: `aarav.sharma_${suffix}@example.com`,
    phone: `+9198765${suffix}`,
    dateOfBirth: '1990-05-15',
    gender: 'MALE',
    bloodGroup: 'O_POSITIVE',
    address: '42 Ring Road, Sasaram, Bihar',
    emergencyContact: '+919876543210'
  };

  const pRes = await api('/api/v1/patients', 'POST', pReq);
  assert(pRes.status === 201, 'Patient created with 201 Created', JSON.stringify(pRes));
  const patient = pRes.data?.data;
  assert(patient && patient.id && patient.mrn, `Patient assigned canonical MRN: ${patient?.mrn}`);

  // 2. Hospital Registration
  console.log('\n▶ STEP 2: HOSPITAL REGISTRATION (Capability 4)');
  const regRes = await api(`/api/v1/patients/${patient.id}/registrations`, 'POST', { hospitalId: 101 });
  assert(regRes.status === 201 || regRes.status === 200, 'Patient registered at Hospital #101', JSON.stringify(regRes));

  // 3. Demographic Update
  console.log('\n▶ STEP 3: DEMOGRAPHIC UPDATE (Capability 16)');
  const updateRes = await api(`/api/v1/patients/${patient.id}`, 'PUT', {
    firstName: patient.firstName,
    lastName: patient.lastName,
    email: patient.email,
    phone: `+9199999${suffix}`,
    address: 'Updated Address, Civil Lines, Sasaram',
    emergencyContact: '+919876543210'
  });
  assert(updateRes.ok, 'Patient administrative contact updated successfully', JSON.stringify(updateRes));

  // 4. Administrative Document Upload & Verification
  console.log('\n▶ STEP 4: ADMINISTRATIVE DOCUMENT COORDINATION (Capability 17)');
  const docRes = await api(`/api/v1/patients/${patient.id}/documents`, 'POST', {
    hospitalId: 101,
    documentType: 'NATIONAL_ID_PROOF',
    documentName: 'Aadhaar Card Copy',
    fileUrl: `https://storage.swarnikacare.internal/docs/${patient.id}/aadhaar.pdf`,
    notes: 'Verified against original copy'
  });
  assert(docRes.status === 201, 'Administrative document created', JSON.stringify(docRes));
  const doc = docRes.data?.data;
  assert(doc && doc.documentNumber, `Document assigned Doc #: ${doc?.documentNumber}`);

  const verifyRes = await api(`/api/v1/patients/${patient.id}/documents/${doc.id}/verify`, 'PATCH');
  assert(verifyRes.ok, 'Document status verified by receptionist');

  // 5. Normal Appointment Booking & Lifecycle (Capability 6, 10, 13, 14, 15)
  console.log('\n▶ STEP 5: APPOINTMENT BOOKING & LIFECYCLE (Capability 6, 10, 15)');
  // Doctor 1 is available on Sunday (08:00 - 20:00). Pick a future Sunday.
  const sundays = ['2026-10-04', '2026-10-11', '2026-10-18', '2026-10-25'];
  const testSunday = sundays[Math.floor(Math.random() * sundays.length)];
  const randH = 9 + Math.floor(Math.random() * 8);
  const randM = (Math.floor(Math.random() * 4) * 15).toString().padStart(2, '0');
  const startT = `${String(randH).padStart(2, '0')}:${randM}:00`;
  const endT = `${String(randH).padStart(2, '0')}:${String(Number(randM) + 15).padStart(2, '0')}:00`;

  const apptRes = await api('/api/v1/appointments', 'POST', {
    patientId: patient.id,
    doctorId: 1,
    hospitalId: 101,
    departmentId: 101,
    appointmentDate: testSunday,
    startTime: startT,
    endTime: endT,
    appointmentType: 'OPD',
    reason: 'Routine Cardiology Follow-up'
  });
  assert(apptRes.status === 201, 'OPD Appointment booked successfully', JSON.stringify(apptRes));
  const appointment = apptRes.data?.data;
  assert(appointment && appointment.appointmentNumber, `Appointment #: ${appointment?.appointmentNumber}`);

  // Check-In -> Encounter Creation (Capability 9)
  console.log('\n▶ STEP 6: PATIENT CHECK-IN & OPEN OPD ENCOUNTER (Capability 9, 11)');
  const encRes = await api('/api/v1/encounters', 'POST', {
    patientId: patient.id,
    hospitalId: 101,
    departmentId: 101,
    doctorId: 1,
    appointmentId: appointment.id,
    encounterType: 'OPD',
    source: 'WALK_IN',
    chiefComplaint: 'Cardiology routine check-up'
  });
  assert(encRes.status === 201, 'OPEN OPD Encounter created upon check-in', JSON.stringify(encRes));
  const encounter = encRes.data?.data;
  assert(encounter && encounter.encounterNumber, `Encounter #: ${encounter?.encounterNumber}`);

  // 7. Persistent Queue Token Generation & Lifecycle (Capability 11, 12)
  console.log('\n▶ STEP 7: PERSISTENT QUEUE TOKEN MANAGEMENT (Capability 11, 12)');
  const tokenRes = await api('/api/v1/queue-tokens', 'POST', {
    hospitalId: 101,
    departmentId: 101,
    doctorId: 1,
    patientId: patient.id,
    appointmentId: appointment.id,
    encounterId: encounter.id,
    priority: 'NORMAL'
  });
  assert(tokenRes.status === 201, 'Persistent Queue Token issued', JSON.stringify(tokenRes));
  const token = tokenRes.data?.data;
  assert(token && token.tokenNumber, `Token #: ${token?.tokenNumber}, Sequence: ${token?.sequenceNumber}`);

  const callRes = await api(`/api/v1/queue-tokens/${token.id}/status?status=CALLED`, 'PATCH');
  assert(callRes.ok, 'Token status transitioned to CALLED');

  const inServiceRes = await api(`/api/v1/queue-tokens/${token.id}/status?status=IN_SERVICE`, 'PATCH');
  assert(inServiceRes.ok, 'Token status transitioned to IN_SERVICE');

  // 8. Emergency Front-Desk Intake (Capability 21)
  console.log('\n▶ STEP 8: EMERGENCY FRONT-DESK INTAKE (Capability 21)');
  const emgPatientRes = await api('/api/v1/patients', 'POST', {
    firstName: 'Unknown',
    lastName: `Trauma_${suffix}`,
    email: `unknown.${suffix}@emergency.internal`,
    phone: `+9198111${suffix}`,
    gender: 'MALE',
    dateOfBirth: '1985-01-01',
    address: 'Brought by Emergency Ambulance 108',
    emergencyContact: '+919999988888'
  });
  const emgPatient = emgPatientRes.data?.data;
  assert(emgPatient && emgPatient.id, `Emergency patient registered: ${emgPatient?.mrn}`);

  const emgEncRes = await api('/api/v1/emergency/encounters', 'POST', {
    patientId: emgPatient.id,
    hospitalId: 101,
    departmentId: 101,
    doctorId: 1,
    chiefComplaint: 'Acute chest trauma / MVC accident',
    notes: 'Triage Priority RED - Ambulance 108 arrival'
  });
  assert(emgEncRes.status === 201, 'EMERGENCY encounter created and routed to ER trauma team');

  // 9. Inpatient Admission Initiation & Bed Allocation (Capability 22)
  console.log('\n▶ STEP 9: INPATIENT ADMISSION INITIATION & BED ALLOCATION (Capability 22)');
  const admRes = await api('/api/v1/admissions', 'POST', {
    patientId: patient.id,
    hospitalId: 101,
    departmentId: 101,
    admittingDoctorId: 1,
    admissionType: 'ELECTIVE',
    reason: 'Post-op observation and IV antibiotic therapy',
    notes: 'Pre-auth approved under corporate health plan'
  });
  assert(admRes.status === 201, 'Inpatient Admission initiated', JSON.stringify(admRes));
  const admission = admRes.data?.data;
  assert(admission && admission.admissionNumber, `Admission #: ${admission?.admissionNumber}, Status: ${admission?.status}`);

  const testBedId = 1000 + Math.floor(Math.random() * 90000);
  const notesEnc = encodeURIComponent(`Placed in General Ward Bed ${testBedId}`);
  const admUpdateRes = await api(`/api/v1/admissions/${admission.id}/status?status=ADMITTED&bedId=${testBedId}&notes=${notesEnc}`, 'PATCH');
  assert(admUpdateRes.ok, 'Admission placed in ward with Bed allocated (status ADMITTED)', JSON.stringify(admUpdateRes));

  // 10. Referral Coordination (Capability 23)
  console.log('\n▶ STEP 10: REFERRAL COORDINATION (Capability 23)');
  const refRes = await api('/api/v1/referrals', 'POST', {
    patientId: patient.id,
    hospitalId: 101,
    targetHospitalId: 102,
    targetDepartmentId: 101,
    priority: 'URGENT',
    reason: 'Specialized interventional cardiology evaluation required',
    clinicalNotes: 'ST elevation resolved, coronary angiography indicated',
    administrativeNotes: 'Patient opted for Patna branch evaluation'
  });
  assert(refRes.status === 201, 'Referral coordinated successfully', JSON.stringify(refRes));
  const referral = refRes.data?.data;
  assert(referral && referral.referralNumber, `Referral #: ${referral?.referralNumber}, Status: ${referral?.status}`);

  const ackRefRes = await api(`/api/v1/referrals/${referral.id}/status?status=ACKNOWLEDGED&administrativeNotes=Patna team notified`, 'PATCH');
  assert(ackRefRes.ok, 'Referral acknowledged by target facility');

  // 11. Front-Desk Operational Audit Trail (Capability 25)
  console.log('\n▶ STEP 11: FRONT-DESK AUDIT TRAIL TRACEABILITY (Capability 25)');
  const auditRes = await api('/api/v1/audit-logs', 'POST', {
    hospitalId: 101,
    actorUserId: 'reception.john',
    actorRole: 'RECEPTIONIST',
    action: 'VERIFIED_E2E_WORKFLOW',
    entityType: 'PATIENT',
    entityId: String(patient.id),
    details: 'Completed comprehensive production front-desk intake and coordination'
  });
  assert(auditRes.status === 201, 'Audit log event persisted successfully');

  const getLogsRes = await api('/api/v1/audit-logs?hospitalId=101&limit=10');
  assert(getLogsRes.ok && getLogsRes.data?.data?.length > 0, `Audit logs query returned ${getLogsRes.data?.data?.length} records`);

  console.log('\n===============================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runE2E().catch((err) => {
  console.error('Fatal error during E2E test:', err);
  process.exit(1);
});
