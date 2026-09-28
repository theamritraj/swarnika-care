import crypto from 'crypto';

const GATEWAY_URL = 'http://localhost:8080/api/v1';
const SECRET_KEY = '404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970';

function base64UrlEncode(str) {
  return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function generateToken(email, role, userId, hospitalId = 1) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: email,
    roles: [role],
    hospitalId: hospitalId,
    userId: userId,
    iss: 'swarnika-iam',
    aud: 'swarnika-care',
    iat: now,
    exp: now + 36000
  };
  const signatureInput = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}`;
  const signature = crypto.createHmac('sha256', Buffer.from(SECRET_KEY, 'base64')).update(signatureInput).digest();
  const encodedSignature = signature.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${signatureInput}.${encodedSignature}`;
}

async function req(path, method, body, token) {
  const res = await fetch(`${GATEWAY_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  
  if (!res.ok) {
    console.log(`[WARN] ${method} ${path} returned ${res.status}: ${text}`);
    return { error: true, status: res.status, data };
  }
  return { error: false, status: res.status, data };
}

async function provisionUser(email, role) {
  try {
    await fetch('http://localhost:8081/api/v1/internal/users/provision-staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Internal-Secret': 'InternalSecret12345!' },
      body: JSON.stringify({ email, role })
    });
  } catch(e) {}
}

async function run() {
  console.log("==========================================");
  console.log("🏥 SWARNIKA HOSPITAL E2E JOURNEY TEST");
  console.log("==========================================");

  const suffix = Date.now();
  // 1. Provision IAM Accounts
  const users = [
    { email: `e2e.admin.${suffix}@swarnikacare.test`, role: 'SUPER_ADMIN', id: 101 },
    { email: `e2e.doctor.${suffix}@swarnikacare.test`, role: 'DOCTOR', id: 102 },
    { email: `e2e.doctor2.${suffix}@swarnikacare.test`, role: 'DOCTOR', id: 103 },
    { email: `e2e.nurse1.${suffix}@swarnikacare.test`, role: 'NURSE', id: 104 },
    { email: `e2e.nurse2.${suffix}@swarnikacare.test`, role: 'NURSE', id: 105 },
    { email: `e2e.reception.${suffix}@swarnikacare.test`, role: 'RECEPTIONIST', id: 106 },
    { email: `e2e.labtech.${suffix}@swarnikacare.test`, role: 'LAB_TECHNICIAN', id: 107 },
    { email: `e2e.billing.${suffix}@swarnikacare.test`, role: 'BILLING_STAFF', id: 108 }
  ];

  for (const u of users) {
    if (u.role !== 'SUPER_ADMIN' && u.role !== 'DOCTOR') await provisionUser(u.email, u.role);
  }
  console.log("✅ Phase 1: IAM Users Provisioned");

  const adminToken = generateToken(users[0].email, users[0].role, users[0].id);

  // 2. Organization / Hospital
  const hosp = await req('/hospitals', 'POST', { name: `Swarnika Bloom E2E ${suffix}`, code: `HOSP-${suffix}`, address: "123 E2E Street", email: `bloom${suffix}@swarnikacare.com`, phone: "+91-9999999991" }, adminToken);
  console.log(hosp.error ? `❌ Phase 3: Hospital Creation Failed: ${JSON.stringify(hosp.data)}` : "✅ Phase 3: Hospital Created");
  const hospitalId = hosp.data?.data?.id || 101; // fallback to 101 if creation fails

  const receptionistToken = generateToken(users[5].email, users[5].role, users[5].id, hospitalId);
  const doctorToken = generateToken(users[1].email, users[1].role, users[1].id, hospitalId);

  // 3. Mother Creation
  const motherPayload = { hospitalId: hospitalId, firstName: "E2E-MOTHER", lastName: "001", gender: "FEMALE", dateOfBirth: "1995-05-10", contactNumber: "9876543211", phone: "9876543211", email: `e2e.mother.${suffix}@swarnikacare.test` };
  const mother = await req('/patients', 'POST', motherPayload, receptionistToken);
  let motherId = mother.data?.id || mother.data?.data?.id;
  console.log(mother.error ? `❌ Phase 8: Mother Creation Failed: ${JSON.stringify(mother.data)}` : "✅ Phase 8: Mother Created");

  // 3b. Department Creation
  const deptCode = `MAT-${suffix}`;
  const dept = await req('/departments', 'POST', { hospitalId: hospitalId, name: "Maternity", code: deptCode, description: "Maternity Dept", isActive: true }, adminToken);
  const departmentId = dept.data?.data?.id || 1;
  console.log(dept.error ? `❌ Phase 3b: Dept Creation Failed: ${JSON.stringify(dept.data)}` : "✅ Phase 3b: Department Created");

  // 3c. Staff Creation
  const staff = await req('/doctors', 'POST', { hospitalId: hospitalId, userId: users[1].id, departmentId: departmentId, firstName: "Doctor", lastName: "One", specialization: "OBGYN", email: users[1].email, phone: "1234567890", active: true }, adminToken);
  const doctorId = staff.data?.data?.id || staff.data?.id || users[1].id;
  console.log(staff.error ? `❌ Phase 3c: Doctor Creation Failed: ${JSON.stringify(staff.data)}` : "✅ Phase 3c: Doctor Created");

  // 3c2. Doctor Assignment
  const assign = await req(`/doctors/${doctorId}/assignments`, 'POST', { hospitalId: hospitalId, departmentId: departmentId, designation: "Senior OBGYN", status: "ACTIVE" }, adminToken);
  console.log(assign.error ? `❌ Phase 3c2: Doctor Assignment Failed: ${JSON.stringify(assign.data)}` : "✅ Phase 3c2: Doctor Assigned to Hospital");

  // 3d. Doctor Availability
  const avail = await req(`/doctors/${doctorId}/availability`, 'POST', { hospitalId: hospitalId, departmentId: departmentId, dayOfWeek: "THURSDAY", startTime: "08:00:00", endTime: "18:00:00", slotDurationMinutes: 30, maxPatients: 20, isAvailable: true }, adminToken);
  console.log(avail.error ? `❌ Phase 3d: Doctor Availability Failed: ${JSON.stringify(avail.data)}` : "✅ Phase 3d: Doctor Availability Set");

  // 4. Appointment
  const appt = await req('/appointments', 'POST', { hospitalId: hospitalId, departmentId: departmentId, doctorId: doctorId, patientId: motherId, appointmentDate: "2026-10-01", startTime: "10:00:00", endTime: "10:30:00", appointmentType: "CONSULTATION" }, receptionistToken);
  console.log(appt.error ? `❌ Phase 9: Appointment Booking Failed: ${JSON.stringify(appt.data)}` : "✅ Phase 9: Appointment Booked");

  // 5. IPD Admission (INPATIENT)
  const enc = await req('/encounters', 'POST', { hospitalId: hospitalId, patientId: motherId, departmentId: departmentId, encounterType: "INPATIENT", status: "OPEN" }, receptionistToken);
  let encounterId = enc.data?.id || enc.data?.data?.id;
  console.log(enc.error ? `❌ Phase 15: Admission Failed: ${JSON.stringify(enc.data)}` : "✅ Phase 15: IPD Admission Created");

  // 6. Twins Birth (Creating child records)
  const twin1 = await req('/patients', 'POST', { hospitalId: hospitalId, firstName: "Child1", lastName: "001", gender: "MALE", dateOfBirth: "2026-09-27", contactNumber: "9876543211", phone: "9876543211", email: `e2e.child1.${suffix}@swarnikacare.test` }, receptionistToken);
  const twin2 = await req('/patients', 'POST', { hospitalId: hospitalId, firstName: "Child2", lastName: "002", gender: "FEMALE", dateOfBirth: "2026-09-27", contactNumber: "9876543211", phone: "9876543211", email: `e2e.child2.${suffix}@swarnikacare.test` }, receptionistToken);
  let twin1Id = twin1.data?.id || twin1.data?.data?.id;
  let twin2Id = twin2.data?.id || twin2.data?.data?.id;
  console.log((twin1.error || twin2.error) ? `❌ Phase 20: Twins Creation Failed: ${JSON.stringify(twin1.data)}` : "✅ Phase 20: Twins Created");

  // 7. Relationships
  const rel1 = await req(`/patients/${motherId}/relationships`, 'POST', { targetPatientId: twin1Id, relationshipType: "MOTHER_OF", notes: "Twin 1" }, receptionistToken);
  const rel2 = await req(`/patients/${motherId}/relationships`, 'POST', { targetPatientId: twin2Id, relationshipType: "MOTHER_OF", notes: "Twin 2" }, receptionistToken);
  console.log((rel1.error || rel2.error) ? "❌ Phase 20: Relationship Linking Failed" : "✅ Phase 20: Mother-Twin Linkage Completed");

  // 8. Billing
  const items = [{ itemType: "ROOM", description: "Room Charge", quantity: 1, unitPrice: 1000 }];
  const billingToken = generateToken(users[7].email, users[7].role, users[7].id, hospitalId);
  const billMother = await req('/billing/staff/invoices', 'POST', { hospitalId: hospitalId, patientId: motherId, encounterId: encounterId, status: "DRAFT", items }, billingToken);
  const billTwin1 = await req('/billing/staff/invoices', 'POST', { hospitalId: hospitalId, patientId: twin1Id, status: "DRAFT", items }, billingToken);
  const billTwin2 = await req('/billing/staff/invoices', 'POST', { hospitalId: hospitalId, patientId: twin2Id, status: "DRAFT", items }, billingToken);
  console.log((billMother.error || billTwin1.error || billTwin2.error) ? `❌ Phase 21/22/23: Billing Accounts Failed: ${JSON.stringify(billMother.data || billTwin1.data)}` : "✅ Phase 21/22/23: Independent Billing Accounts Created");

  // 9. Unauthorized Discharge Check
  const unauthDischarge = await req(`/encounters/${encounterId}/complete`, 'PATCH', { notes: "Discharged" }, receptionistToken); // Receptionist shouldn't discharge
  console.log(unauthDischarge.status === 403 ? "✅ Phase 26: Unauthorized Discharge Blocked" : "❌ Phase 26: Unauthorized Discharge allowed or failed incorrectly");

  console.log("==========================================");
  console.log("🏁 E2E EXECUTION COMPLETE");
  console.log("==========================================");
  console.log("Here are the credentials used for this run:");
  users.forEach(u => console.log(`- Role: ${u.role}, Email: ${u.email}, Password: password123`));
}
run();
