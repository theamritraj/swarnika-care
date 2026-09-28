import crypto from 'crypto';

const GATEWAY_URL = 'http://localhost:8080/api/v1';
const SECRET_KEY = '404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970';

function base64UrlEncode(str) {
  return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function generateToken(email, role, userId) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: email,
    roles: [role],
    hospitalId: 1,
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
  if (!res.ok) console.log(`[WARN] ${method} ${path} returned ${res.status}: ${text}`);
  try { return JSON.parse(text); } catch { return text; }
}

async function provisionUser(email, role) {
  try {
    await fetch('http://localhost:8081/api/v1/internal/users/provision-staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Internal-Secret': 'InternalSecret12345!' },
      body: JSON.stringify({ email, role })
    });
    console.log(` Provisioned ${email} as ${role} in IAM`);
  } catch(e) {
    console.log(` Skipped IAM provision for ${email} (might exist)`);
  }
}

async function run() {
  console.log("==========================================");
  console.log("🤰 SWARNIKA MATERNITY WORKFLOW SEEDER 🍼");
  console.log("==========================================");

  console.log("[0] Provisioning users in IAM...");
  await provisionUser('dr.maternity@swarnikacare.com', 'DOCTOR');
  await provisionUser('nurse.jane@swarnikacare.com', 'NURSE');
  await provisionUser('frontdesk@swarnikacare.com', 'RECEPTIONIST');

  const adminToken = generateToken('admin@swarnikacare.com', 'SUPER_ADMIN', 1);
  const doctorToken = generateToken('dr.maternity@swarnikacare.com', 'DOCTOR', 2);
  const nurseToken = generateToken('nurse.jane@swarnikacare.com', 'NURSE', 3);
  const receptionistToken = generateToken('frontdesk@swarnikacare.com', 'RECEPTIONIST', 4);

  console.log("[1] Admin creating Hospital...");
  await req('/organizations/hospitals', 'POST', { name: "Swarnika Bloom", email: "bloom@swarnikacare.com", phone: "+91-9999999999" }, adminToken);

  console.log("[2] Receptionist creating Mother (Patient)...");
  const motherRes = await req('/patients', 'POST', { firstName: "Sita", lastName: "Sharma", gender: "FEMALE", dateOfBirth: "1995-05-10", contactNumber: "9876543210" }, receptionistToken);
  const motherId = motherRes?.data?.id || 4; // fallback to 4
  console.log(` -> Mother ID: ${motherId}`);

  console.log("[3] Receptionist booking OPD Appointment for Mother...");
  const apptRes = await req('/appointments', 'POST', { hospitalId: 1, doctorId: 2, patientId: motherId, departmentId: 1, appointmentDate: "2026-10-01", startTime: "10:00:00", endTime: "10:30:00", appointmentType: "CONSULTATION" }, receptionistToken);
  
  console.log("[4] Receptionist opening IPD Encounter (Maternity Admission)...");
  const encRes = await req('/encounters', 'POST', { hospitalId: 1, patientId: motherId, encounterType: "IPD", status: "OPEN" }, receptionistToken);
  const encounterId = encRes?.data?.id || 1;

  console.log("[5] Mother gives birth to Twins! Creating Twin 1 & Twin 2...");
  const twin1Res = await req('/patients', 'POST', { firstName: "Luv", lastName: "Sharma", gender: "MALE", dateOfBirth: new Date().toISOString().split('T')[0] }, receptionistToken);
  const twin2Res = await req('/patients', 'POST', { firstName: "Kush", lastName: "Sharma", gender: "MALE", dateOfBirth: new Date().toISOString().split('T')[0] }, receptionistToken);
  const twin1Id = twin1Res?.data?.id || 5;
  const twin2Id = twin2Res?.data?.id || 6;

  console.log("[6] Establishing MOTHER_OF relationship...");
  await req(`/patients/${motherId}/relationships`, 'POST', { targetPatientId: twin1Id, relationshipType: "MOTHER_OF", notes: "Twin 1" }, receptionistToken);
  await req(`/patients/${motherId}/relationships`, 'POST', { targetPatientId: twin2Id, relationshipType: "MOTHER_OF", notes: "Twin 2" }, receptionistToken);

  console.log("[7] Opening separate Billing Accounts...");
  await req('/billing/invoices', 'POST', { hospitalId: 1, patientId: motherId, encounterId: encounterId, status: "DRAFT" }, receptionistToken);
  await req('/billing/invoices', 'POST', { hospitalId: 1, patientId: twin1Id, status: "DRAFT" }, receptionistToken);
  await req('/billing/invoices', 'POST', { hospitalId: 1, patientId: twin2Id, status: "DRAFT" }, receptionistToken);

  console.log("[8] Doctor discharges Mother (Release Gate Pass)...");
  await req(`/encounters/${encounterId}/status`, 'PUT', { status: "DISCHARGED" }, doctorToken);

  console.log("==========================================");
  console.log("✅ DATA SEEDING COMPLETE!");
  console.log("==========================================");
  console.log("CREDENTIALS TO LOG IN AND VERIFY:");
  console.log("Admin:        admin@swarnikacare.com");
  console.log("Doctor:       dr.maternity@swarnikacare.com");
  console.log("Nurse:        nurse.jane@swarnikacare.com");
  console.log("Receptionist: frontdesk@swarnikacare.com");
  console.log("Mother (Pat): sita.sharma@dummy.com");
  console.log("------------------------------------------");
  console.log("HOW TO LOG IN:");
  console.log("1. Enter the email in the frontend login page.");
  console.log("2. Check the running terminal logs (iam-service) for the line:");
  console.log("   🚀 YOUR LOCAL DEVELOPMENT OTP IS: 123456");
  console.log("3. Enter that OTP in the UI.");
}
run();
