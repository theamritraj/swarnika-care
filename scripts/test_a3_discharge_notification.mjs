import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---
const BASE_URL = 'http://localhost:8088/api/v1'; // Patient Service
const ENCOUNTER_URL = 'http://localhost:8086/api/v1'; 
const IPD_URL = 'http://localhost:8092/api/v1'; 
const NOTIFICATION_URL = 'http://localhost:8084/api/v1';
const TS = Date.now();
const SECRET = '404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970'; // Hardcoded HMAC secret

import crypto from 'crypto';

// --- HELPERS ---
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

// --- TEST EXECUTION ---
async function run() {
  console.log('\n============================================================');
  console.log('🏥 PHASE A3: Discharge & Notification');
  console.log('============================================================\n');

  const adminToken = jwt(`admin.${TS}@test.sc`, 'SUPER_ADMIN', 401, 1);
  const patientEmail = `discharge.${TS}@test.sc`;
  const patientUserId = `usr-dis-${TS}`;
  let patientToken = jwt(patientEmail, 'PATIENT', patientUserId, 1);
  
  console.log('── 1. SETUP: CREATE PATIENT & ENCOUNTER ──────────────────────');
  let patientId;
  let actualUserId;
  const pRes = await api('/patients', 'POST', {
    firstName: 'John', lastName: 'Discharge', email: patientEmail,
    phone: '7777777777', dateOfBirth: '1980-01-01', gender: 'MALE', hospitalId: 1
  }, adminToken);
  
  if (pRes.ok) {
    patientId = pRes.data?.data?.id || pRes.data?.id;
    const fetchP = await api(`/patients/${patientId}`, 'GET', null, adminToken);
    actualUserId = fetchP.data?.data?.userId;
    if (actualUserId) {
        // regenerate patientToken with correct userId
        const newPatientToken = jwt(patientEmail, 'PATIENT', actualUserId, 1);
        patientToken = newPatientToken;
    }
    pass(`Patient created (id=${patientId}, userId=${actualUserId})`);
  } else fail('Patient creation failed');

  // We don't need a separate Encounter if Admission creates it. Or we just create Admission.
  let admId;
  const admRes = await api(`/admissions`, 'POST', {
    patientId: patientId,
    hospitalId: 1, 
    departmentId: 2,
    admittingDoctorId: 5,
    reason: 'Pre-surgery admission',
    admissionType: 'ELECTIVE'
  }, adminToken, ENCOUNTER_URL);
  
  if (admRes.ok) {
    admId = admRes.data?.data?.id || admRes.data?.id;
    pass(`Admission created (id=${admId})`);
  } else fail('Admission creation failed', JSON.stringify(admRes.data));
  
  // Assign bed (just to set status)
  await api(`/ipd/bed-assignments?hospitalId=1`, 'POST', {
    admissionId: admId, bedId: 1
  }, adminToken, IPD_URL);

  console.log('\n── 2. DISCHARGE WORKFLOW ───────────────────────────────────');
  const disRes = await api(`/ipd/discharges?hospitalId=1`, 'POST', {
    admissionId: admId, patientId: patientId, hospitalId: 1,
    dischargeStatus: 'STABLE', dischargeCondition: 'Recovered',
    dischargingDoctorId: 1
  }, adminToken, IPD_URL);

  if (disRes.ok) {
    pass(`Patient Discharged successfully`);
  } else fail('Discharge failed', JSON.stringify(disRes.data));

  console.log('\n── 3. PATIENT PORTAL (NOTIFICATIONS) ───────────────────────');
  
  // Wait a bit for Kafka message to be processed
  console.log('  Waiting 3s for Kafka processing...');
  await new Promise(r => setTimeout(r, 3000));

  const nRes = await api(`/notifications/me?userId=${patientId}`, 'GET', null, patientToken, NOTIFICATION_URL);
  if (nRes.ok) {
    const notifs = nRes.data?.data || [];
    const dischargeNotif = notifs.find(n => n.type === 'DISCHARGE' || n.title?.toLowerCase().includes('discharge'));
    if (dischargeNotif) {
      pass(`Discharge notification received in Patient Portal`);
    } else {
      fail('Discharge notification missing from Patient Portal', JSON.stringify(notifs));
    }
  } else fail('Failed to fetch notifications', JSON.stringify(nRes.data));
  
  console.log('\n✅ PHASE A3 COMPLETION CONFIRMED!\n');
}

run().catch(console.error);
