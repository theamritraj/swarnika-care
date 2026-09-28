import jwt from 'jsonwebtoken';

const GATEWAY_URL = 'http://localhost:8095/api/v1';

async function main() {
    console.log("=== Billing Service E2E Production Verification ===");

    // 1. Generate auth tokens (Mocking Gateway-compatible JWT)
    const SECRET = Buffer.from('404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970', 'base64');
    const iss = 'swarnika-iam';
    const aud = 'swarnika-care';

    const STAFF_JWT = jwt.sign({ sub: 'staff-1', roles: ['BILLING_STAFF'], hospitalId: 1, userId: 101, iss, aud }, SECRET, { expiresIn: '1h' });
    const PATIENT_JWT = jwt.sign({ sub: 'patient-test-1', roles: ['PATIENT'], userId: 1, iss, aud }, SECRET, { expiresIn: '1h' });
    const OTHER_PATIENT_JWT = jwt.sign({ sub: 'patient-2', roles: ['PATIENT'], userId: 2, iss, aud }, SECRET, { expiresIn: '1h' });
    const DOCTOR_JWT = jwt.sign({ sub: 'doctor-1', roles: ['DOCTOR'], hospitalId: 1, userId: 301, iss, aud }, SECRET, { expiresIn: '1h' });

    let invoiceId = null;
    let paymentId = null;
    let patientId = 1;
    let hospitalId = 1;

    try {
        console.log("\n[1] Creating Charge (Staff)");
        let res = await fetch(`${GATEWAY_URL}/billing/staff/charges`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${STAFF_JWT}` },
            body: JSON.stringify({
                patientId, hospitalId, category: 'OPD', description: 'Consultation', quantity: 1, unitPrice: 500, taxRate: 10
            })
        });
        if (!res.ok) throw new Error("Failed to create charge. Status: " + res.status + " " + res.statusText + " " + await res.text());
        let data = await res.json();
        console.log("✅ Charge Created:", data.data.id);

        console.log("\n[2] Creating Invoice (Staff)");
        res = await fetch(`${GATEWAY_URL}/billing/staff/invoices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${STAFF_JWT}` },
            body: JSON.stringify({
                patientId, hospitalId,
                items: [
                    { itemType: 'OPD', description: 'Consultation', quantity: 1, unitPrice: 500, taxRate: 10 }
                ]
            })
        });
        if (!res.ok) throw new Error("Failed to create invoice: " + await res.text());
        data = await res.json();
        invoiceId = data.data.id;
        console.log("✅ Invoice Created:", invoiceId);
        
        console.log("\n[3] Security Test: Nurse/Doctor invoice creation (Should Fail)");
        res = await fetch(`${GATEWAY_URL}/billing/staff/invoices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DOCTOR_JWT}` },
            body: JSON.stringify({
                patientId, hospitalId, items: [{ itemType: 'OPD', description: 'Consultation', quantity: 1, unitPrice: 500, taxRate: 10 }]
            })
        });
        if (res.status !== 401 && res.status !== 403) throw new Error("Security failure: Doctor was able to create invoice!");
        console.log("✅ Security enforced: Doctor denied");

        console.log("\n[4] Recording Payment (Staff)");
        res = await fetch(`${GATEWAY_URL}/billing/staff/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${STAFF_JWT}` },
            body: JSON.stringify({
                invoiceId, amount: 550, paymentMethod: 'CARD' // 500 + 10% tax = 550
            })
        });
        if (!res.ok) throw new Error("Failed to record payment. Status: " + res.status + " " + res.statusText + " " + await res.text());
        data = await res.json();
        paymentId = data.data.id;
        console.log("✅ Payment Recorded:", paymentId);

        console.log("\n[5] Patient fetching own invoice (Patient)");
        res = await fetch(`${GATEWAY_URL}/billing/me/invoices/${invoiceId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${PATIENT_JWT}` }
        });
        if (!res.ok) throw new Error("Failed patient invoice fetch. Status: " + res.status + " " + res.statusText + " " + await res.text());
        console.log("✅ Patient successfully retrieved own invoice");

        console.log("\n[6] Patient fetching another patient's invoice (Security)");
        res = await fetch(`${GATEWAY_URL}/billing/me/invoices/${invoiceId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${OTHER_PATIENT_JWT}` }
        });
        if (res.status !== 401 && res.status !== 403) throw new Error("Security failure: Patient accessed another's invoice!");
        console.log("✅ Security enforced: Cross-patient access denied");
        
        console.log("\n[7] Processing Refund (Staff)");
        res = await fetch(`${GATEWAY_URL}/billing/staff/refunds`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${STAFF_JWT}` },
            body: JSON.stringify({
                paymentId, amount: 50, reason: 'Overcharged'
            })
        });
        if (!res.ok) throw new Error("Failed to process refund: " + await res.text());
        console.log("✅ Refund processed");
        
        console.log("\n[8] Processing Adjustment (Staff)");
        res = await fetch(`${GATEWAY_URL}/billing/staff/adjustments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${STAFF_JWT}` },
            body: JSON.stringify({
                invoiceId, amount: 50, reason: 'Reconcile'
            })
        });
        if (!res.ok) throw new Error("Failed to process adjustment: " + await res.text());
        console.log("✅ Adjustment processed");

        console.log("\n=== E2E Test Completed Successfully ===");
    } catch (e) {
        console.error("E2E Test Failed:", e);
        process.exit(1);
    }
}

main();
