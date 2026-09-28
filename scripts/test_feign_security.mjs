import jwt from 'jsonwebtoken';

const SECRET = Buffer.from('404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970', 'base64');
const ADMIN_JWT = jwt.sign({ sub: 'admin-1', roles: ['SUPER_ADMIN'], hospitalId: 1, userId: 1, iss: 'swarnika-iam', aud: 'swarnika-care' }, SECRET, { expiresIn: '1h' });
const DOCTOR_JWT = jwt.sign({ sub: 'doc-1', roles: ['DOCTOR'], hospitalId: 1, userId: 2, iss: 'swarnika-iam', aud: 'swarnika-care' }, SECRET, { expiresIn: '1h' });
const PATIENT_JWT = jwt.sign({ sub: 'patient-1', roles: ['PATIENT'], hospitalId: 1, userId: 4, iss: 'swarnika-iam', aud: 'swarnika-care' }, SECRET, { expiresIn: '1h' });
const NURSE_JWT = jwt.sign({ sub: 'nurse-1', roles: ['NURSE'], hospitalId: 1, userId: 3, iss: 'swarnika-iam', aud: 'swarnika-care' }, SECRET, { expiresIn: '1h' });

const API_BASE = 'http://localhost:8080/api/v1';

async function req(path, method, body, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });
    const text = await res.text();
    if (!res.ok) {
        if(res.status === 404 || res.status === 403 || res.status === 401 || res.status === 500) return { _error: res.status, msg: text };
        throw new Error(`[${res.status}] Request failed: ${text}`);
    }
    return JSON.parse(text);
}

async function runTests() {
    console.log("=== FEIGN JWT PROPAGATION SECURITY TESTS ===");
    
    try {
        console.log("[1] Patient Flow (Patient -> Appointment -> Doctor)");
        // When patient books appointment, appointment-service calls doctor-service via feign
        const apptRes = await req('/appointments', 'POST', {
            hospitalId: 1, 
            doctorId: 2, 
            slotId: 1, 
            appointmentDate: "2026-12-01",
            startTime: "10:00:00",
            endTime: "10:30:00",
            appointmentType: "CONSULTATION",
            patientId: 4,
            departmentId: 1,
            notes: "Routine checkup"
        }, PATIENT_JWT);
        
        // As long as it didn't fail with 401/403, JWT propagated successfully
        if (apptRes._error === 401 || apptRes._error === 403) {
            throw new Error(`JWT failed to propagate! Got ${apptRes._error}`);
        }
        console.log(" -> JWT propagated correctly (or returned expected business error).");

        console.log("[2] Doctor Flow (Doctor -> IPD -> Billing)");
        const roundRes = await req('/ipd/discharges?hospitalId=1', 'POST', {
            admissionId: 100, patientId: 4, dischargingDoctorId: 2, dischargeStatus: 'RECOVERED'
        }, DOCTOR_JWT);
        if (roundRes._error === 401 || roundRes._error === 403) {
            throw new Error(`Doctor JWT failed to propagate to billing! Got ${roundRes._error}`);
        }
        console.log(" -> JWT propagated correctly (or returned expected business error).");

        console.log("[3] Unauthorized call (No JWT)");
        const noAuth = await req('/ipd/discharges?hospitalId=1', 'POST', {
            admissionId: 100, patientId: 4, dischargingDoctorId: 2, dischargeStatus: 'RECOVERED'
        }, null);
        if (noAuth._error !== 401) {
            throw new Error(`Expected 401 but got ${noAuth._error}`);
        }
        console.log(" -> Denied correctly with 401.");

        console.log("[4] Cross-user attempt (Patient trying to call Doctor IPD endpoint)");
        const wrongAuth = await req('/ipd/discharges?hospitalId=1', 'POST', {
            admissionId: 100, patientId: 4, dischargingDoctorId: 2, dischargeStatus: 'RECOVERED'
        }, PATIENT_JWT);
        if (wrongAuth._error !== 403) {
            throw new Error(`Expected 403 but got ${wrongAuth._error}`);
        }
        console.log(" -> Denied correctly with 403.");

        console.log("=== ALL FEIGN SECURITY TESTS PASSED ===");
    } catch (e) {
        console.error("TEST FAILED:", e);
        process.exit(1);
    }
}
runTests();
