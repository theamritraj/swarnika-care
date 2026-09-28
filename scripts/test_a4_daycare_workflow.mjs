import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const BASE_URL = 'http://localhost:8088/api/v1'; // Patient
const ENCOUNTER_URL = 'http://localhost:8086/api/v1'; 
const IPD_URL = 'http://localhost:8092/api/v1'; 
const ORG_URL = 'http://localhost:8085/api/v1'; // Organization
const BILLING_URL = 'http://localhost:8095/api/v1'; // Billing

const TS = Date.now();
const SECRET = '404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970';

function b64u(str) {
  return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function jwt(email, role, userId, hospitalId = 1) {
  const h = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const p = { sub: email, roles: [role], hospitalId, userId, iss: 'swarnika-iam', aud: 'swarnika-care', iat: now, exp: now + 36000 };
  const si = `${b64u(JSON.stringify(h))}.${b64u(JSON.stringify(p))}`;
  const sig = crypto.createHmac('sha256', Buffer.from(SECRET, 'base64')).update(si).digest();
  return `${si}.${sig.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')}`;
}

async function api(path, method = 'GET', body = null, token = null, baseUrl = BASE_URL) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  
  try {
    const res = await fetch(`${baseUrl}${path}`, options);
    let data;
    const text = await res.text();
    try { data = JSON.parse(text); } catch(e) { data = text; }
    
    if (!res.ok) console.warn(`[WARN] ${method} ${path} -> ${res.status}:`, JSON.stringify(data));
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error(`[ERR] ${method} ${path} -> FETCH FAILED:`, err.message);
    return { ok: false, status: 500, data: err.message };
  }
}

function pass(msg) { console.log(`  ✅ ${msg}`); }
function fail(msg, detail = '') { 
  console.log(`  ❌ ${msg}`); 
  if (detail) console.log(`     ${detail}`);
  process.exit(1); 
}

async function run() {
  console.log('\n============================================================');
  console.log('🏥 PHASE A4: Day Care Workflow');
  console.log('============================================================\n');

  const adminToken = jwt(`admin.${TS}@test.sc`, 'SUPER_ADMIN', 401, 1);
  const billingToken = jwt(`billing.${TS}@test.sc`, 'BILLING_STAFF', 501, 1);
  
  console.log('── 1. INFRASTRUCTURE SETUP ─────────────────────────────────');
  
  // Create a Unit of type DAY_CARE
  const unitRes = await api('/units', 'POST', {
    hospitalId: 101, buildingId: 5, floorId: 3, name: 'Chemo Day Care', type: 'DAY_CARE', capacity: 10, code: `DCU-${TS}`, departmentId: 101
  }, adminToken, ORG_URL);
  
  let unitId;
  if (unitRes.ok) {
    unitId = unitRes.data?.data?.id || unitRes.data?.id;
    pass(`DAY_CARE Unit created (id=${unitId})`);
  } else fail('Unit creation failed', JSON.stringify(unitRes.data));

  // Create a Room
  const roomRes = await api('/rooms', 'POST', {
    hospitalId: 101, buildingId: 5, floorId: 3, unitId, roomNumber: 'DC-101', roomType: 'GENERAL', capacity: 2
  }, adminToken, ORG_URL);
  
  let roomId;
  if (roomRes.ok) {
    roomId = roomRes.data?.data?.id || roomRes.data?.id;
    pass(`Room created (id=${roomId})`);
  } else fail('Room creation failed', JSON.stringify(roomRes.data));

  // Create a Bed
  const bedRes = await api('/beds', 'POST', {
    hospitalId: 101, buildingId: 5, floorId: 3, unitId, roomId, bedNumber: `DC-B-${TS}`, bedType: 'GENERAL'
  }, adminToken, ORG_URL);
  
  let bedId;
  if (bedRes.ok) {
    bedId = bedRes.data?.data?.id || bedRes.data?.id;
    pass(`Bed created (id=${bedId})`);
  } else fail('Bed creation failed', JSON.stringify(bedRes.data));

  console.log('\n── 2. PATIENT & DAYCARE ADMISSION ──────────────────────────');
  const patientEmail = `daycare.${TS}@test.sc`;
  const pRes = await api('/patients', 'POST', {
    firstName: 'Day', lastName: 'CarePatient', email: patientEmail, phone: '8888888888', dateOfBirth: '1975-01-01', gender: 'FEMALE', hospitalId: 1
  }, adminToken);
  
  let patientId;
  if (pRes.ok) {
    patientId = pRes.data?.data?.id || pRes.data?.id;
    pass(`Patient created (id=${patientId})`);
  } else fail('Patient creation failed');

  let admId;
  const admRes = await api(`/admissions`, 'POST', {
    patientId: patientId, hospitalId: 1, departmentId: 2, admittingDoctorId: 5, reason: 'Chemotherapy cycle 2', admissionType: 'DAYCARE'
  }, adminToken, ENCOUNTER_URL);
  
  if (admRes.ok) {
    admId = admRes.data?.data?.id || admRes.data?.id;
    pass(`Daycare Admission created (id=${admId})`);
  } else fail('Daycare Admission creation failed', JSON.stringify(admRes.data));
  
  // Assign bed
  const bedAssignRes = await api(`/ipd/bed-assignments?hospitalId=1`, 'POST', {
    admissionId: admId, bedId: bedId
  }, adminToken, IPD_URL);
  
  if (bedAssignRes.ok) {
    pass(`Bed assigned successfully`);
  } else fail('Bed assignment failed', JSON.stringify(bedAssignRes.data));

  console.log('\n── 3. BILLING & DISCHARGE ──────────────────────────────────');
  
  const disRes = await api(`/ipd/discharges?hospitalId=1`, 'POST', {
    admissionId: admId, patientId: patientId, hospitalId: 1, dischargeStatus: 'STABLE', dischargeCondition: 'Completed cycle', dischargingDoctorId: 1
  }, adminToken, IPD_URL);

  if (disRes.ok) {
    pass(`Patient Discharged successfully`);
  } else fail('Discharge failed', JSON.stringify(disRes.data));

  console.log('\n✅ PHASE A4 DAY CARE COMPLETION CONFIRMED!\n');
}

run().catch(console.error);
