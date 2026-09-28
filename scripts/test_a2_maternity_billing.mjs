import crypto from 'crypto';

const SECRET = '404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970';
const BASE_URL = 'http://localhost:8080/api/v1';

const TS = Date.now();
let passCount = 0, failCount = 0;
const results = {
  singleBirth: { pass: 0, fail: 0 },
  twinBirth: { pass: 0, fail: 0 },
  motherBilling: { pass: 0, fail: 0 },
  child1Billing: { pass: 0, fail: 0 },
  child2Billing: { pass: 0, fail: 0 },
  isolation: { pass: 0, fail: 0 },
};

function pass(msg, category) {
  console.log(`  ✅ ${msg}`);
  passCount++;
  if (category) results[category].pass++;
}

function fail(msg, detail, category) {
  console.error(`  ❌ ${msg}: ${detail}`);
  failCount++;
  if (category) results[category].fail++;
}

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

async function api(path, method = 'GET', body = null, token = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (token) opts.headers.Authorization = `Bearer ${token}`;
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(`${BASE_URL}${path}`, opts);
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; } catch(e) { data = text; }
    if (!res.ok) console.warn(`  [WARN] ${method} ${path} → ${res.status}: ${JSON.stringify(data)}`);
    return { status: res.status, ok: res.ok, data };
  } catch(e) {
    console.error(`  [ERR] ${method} ${path} → ${e.message}`);
    return { status: 500, ok: false, error: e.message };
  }
}

async function run() {
  console.log('============================================================');
  console.log('👶 PHASE A2: Maternity & Billing Isolation');
  console.log('============================================================\n');

  const adminToken = jwt(`admin.${TS}@test.sc`, 'SUPER_ADMIN', 301, 1);
  const recToken = jwt(`rec.${TS}@test.sc`, 'RECEPTIONIST', 302, 1);
  
  let motherId, motherToken, motherMrn;
  let babyId, babyMrn;
  let twin1Id, twin1Mrn, twin2Id, twin2Mrn;
  let patient2Id, patient2Token;

  console.log('── SETUP: Create Mother and Unrelated Patient ────────────────');
  
  // 1. Create Mother
  const motherEmail = `E2E-A2-MOTHER-${TS}@test.sc`;
  const mRes = await api('/patients', 'POST', {
    firstName: 'Mother', lastName: 'Test', email: motherEmail,
    phone: '8888888888', dateOfBirth: '1995-01-01', gender: 'FEMALE', hospitalId: 1
  }, recToken);
  if (mRes.ok) {
    motherId = mRes.data?.data?.id || mRes.data?.id;
    motherMrn = mRes.data?.data?.mrn || mRes.data?.mrn;
    motherToken = jwt(motherEmail, 'PATIENT', motherId, 1);
    pass(`Mother created (id=${motherId}, MRN=${motherMrn})`, 'singleBirth');
  } else {
    fail('Mother creation failed', JSON.stringify(mRes.data), 'singleBirth');
    return;
  }

  // 2. Create Unrelated Patient
  const p2Email = `E2E-A2-PATIENT2-${TS}@test.sc`;
  const p2Res = await api('/patients', 'POST', {
    firstName: 'Patient2', lastName: 'Unrelated', email: p2Email,
    phone: '7777777777', dateOfBirth: '1990-01-01', gender: 'MALE'
  }, recToken);
  if (p2Res.ok) {
    patient2Id = p2Res.data?.data?.id || p2Res.data?.id;
    patient2Token = jwt(p2Email, 'PATIENT', patient2Id, 1);
    pass(`Unrelated Patient created (id=${patient2Id})`, 'isolation');
  } else {
    fail('Patient 2 creation failed', JSON.stringify(p2Res.data), 'isolation');
  }

  console.log('\n── WORKFLOW 1: SINGLE BIRTH ────────────────────────────────');
  // 3. Register Single Birth Baby
  const babyRes = await api('/patients/newborns', 'POST', {
    motherId: motherId,
    firstName: 'Baby', lastName: 'Test',
    gender: 'MALE',
    dateOfBirth: new Date().toISOString().split('T')[0],
    birthWeightKg: 3.2,
    gestationalAgeWeeks: 39,
    deliveryMethod: 'NORMAL',
    timeOfBirth: new Date().toISOString()
  }, recToken);

  if (babyRes.ok) {
    babyId = babyRes.data?.data?.id || babyRes.data?.id;
    babyMrn = babyRes.data?.data?.mrn || babyRes.data?.mrn;
    pass(`Baby created (id=${babyId}, MRN=${babyMrn})`, 'singleBirth');
    
    if (babyId !== motherId && babyMrn !== motherMrn) {
      pass('Baby has unique ID and MRN', 'singleBirth');
    } else {
      fail('Baby has same ID or MRN as mother', `b_id=${babyId}, m_id=${motherId}`, 'singleBirth');
    }
  } else {
    fail('Baby creation failed', JSON.stringify(babyRes.data), 'singleBirth');
  }

  // Check Relationship
  if (babyId) {
    const relRes = await api(`/patients/${motherId}/relationships`, 'GET', null, adminToken);
    const rels = Array.isArray(relRes.data?.data) ? relRes.data.data : [];
    const babyRel = rels.find(r => r.targetPatientId === babyId && r.relationshipType === 'MOTHER_OF');
    if (babyRel) {
      pass('MOTHER_OF relationship persisted for single birth', 'singleBirth');
    } else {
      fail('MOTHER_OF relationship missing for single birth', JSON.stringify(rels), 'singleBirth');
    }
  }

  console.log('\n── WORKFLOW 2: TWIN BIRTH ──────────────────────────────────');
  // 4. Register Twin 1
  const t1Res = await api('/patients/newborns', 'POST', {
    motherId: motherId,
    firstName: 'Twin1', lastName: 'Test',
    gender: 'FEMALE',
    dateOfBirth: new Date().toISOString().split('T')[0],
    birthWeightKg: 2.5,
    gestationalAgeWeeks: 37,
    deliveryMethod: 'C_SECTION',
    timeOfBirth: new Date().toISOString()
  }, recToken);

  // 5. Register Twin 2
  const t2Res = await api('/patients/newborns', 'POST', {
    motherId: motherId,
    firstName: 'Twin2', lastName: 'Test',
    gender: 'FEMALE',
    dateOfBirth: new Date().toISOString().split('T')[0],
    birthWeightKg: 2.4,
    gestationalAgeWeeks: 37,
    deliveryMethod: 'C_SECTION',
    timeOfBirth: new Date().toISOString()
  }, recToken);

  if (t1Res.ok && t2Res.ok) {
    twin1Id = t1Res.data?.data?.id || t1Res.data?.id;
    twin1Mrn = t1Res.data?.data?.mrn || t1Res.data?.mrn;
    twin2Id = t2Res.data?.data?.id || t2Res.data?.id;
    twin2Mrn = t2Res.data?.data?.mrn || t2Res.data?.mrn;
    
    pass(`Twin 1 created (id=${twin1Id})`, 'twinBirth');
    pass(`Twin 2 created (id=${twin2Id})`, 'twinBirth');
    
    if (twin1Id !== twin2Id && twin1Mrn !== twin2Mrn && twin1Id !== motherId && twin2Id !== motherId) {
      pass('Twins have unique IDs and MRNs distinct from each other and mother', 'twinBirth');
    } else {
      fail('Twins ID/MRN uniqueness failed', `t1=${twin1Id}, t2=${twin2Id}`, 'twinBirth');
    }
  } else {
    fail('Twin creation failed', `t1=${t1Res.status}, t2=${t2Res.status}`, 'twinBirth');
  }

  // Check Twin Relationships
  if (twin1Id && twin2Id) {
    const relRes = await api(`/patients/${motherId}/relationships`, 'GET', null, adminToken);
    const rels = Array.isArray(relRes.data?.data) ? relRes.data.data : [];
    const hasT1 = rels.find(r => r.targetPatientId === twin1Id && r.relationshipType === 'MOTHER_OF');
    const hasT2 = rels.find(r => r.targetPatientId === twin2Id && r.relationshipType === 'MOTHER_OF');
    if (hasT1 && hasT2) {
      pass('MOTHER_OF relationship persisted for both twins', 'twinBirth');
    } else {
      fail('MOTHER_OF relationship missing for twins', JSON.stringify(rels), 'twinBirth');
    }
  }

  console.log('\n── WORKFLOW 3: MOTHER BILLING ──────────────────────────────');
  // 6. Create Charge for Mother
  let mInvId;
  const mcRes = await api('/billing/staff/charges', 'POST', {
    patientId: motherId, hospitalId: 1, 
    category: 'CONSULTATION', description: 'Maternity Consultation',
    quantity: 1, unitPrice: 1500
  }, adminToken);
  
  if (mcRes.ok) {
    pass('Charge created for Mother', 'motherBilling');
    
    // Create Invoice
    const miRes = await api('/billing/staff/invoices', 'POST', {
      patientId: motherId, hospitalId: 1, notes: 'Maternity billing',
      items: [{ itemType: 'CONSULTATION', description: 'Maternity Consultation', quantity: 1, unitPrice: 1500 }]
    }, adminToken);
    if (miRes.ok) {
      mInvId = miRes.data?.data?.id || miRes.data?.id;
      pass(`Invoice created for Mother (id=${mInvId})`, 'motherBilling');
      
      // Pay Invoice
      const mpRes = await api('/billing/staff/payments', 'POST', {
        invoiceId: mInvId, amount: 1500, paymentMethod: 'CARD', transactionRef: 'TX-111'
      }, adminToken);
      mpRes.ok ? pass('Payment processed for Mother', 'motherBilling') : fail('Mother payment failed', JSON.stringify(mpRes.data), 'motherBilling');
    } else {
      fail('Mother invoice failed', JSON.stringify(miRes.data), 'motherBilling');
    }
  } else {
    fail('Mother charge failed', JSON.stringify(mcRes.data), 'motherBilling');
  }

  console.log('\n── WORKFLOW 4: CHILD 1 BILLING ─────────────────────────────');
  let c1InvId;
  if (babyId) {
    const cc1Res = await api('/billing/staff/charges', 'POST', {
      patientId: babyId, hospitalId: 1,
      category: 'CLINICAL_SERVICE', description: 'Neonatal Care',
      quantity: 1, unitPrice: 5000
    }, adminToken);
    
    if (cc1Res.ok) {
      pass('Charge created for Child 1 (independent)', 'child1Billing');
      const ci1Res = await api('/billing/staff/invoices', 'POST', {
        patientId: babyId, hospitalId: 1, 
        items: [{ itemType: 'CLINICAL_SERVICE', description: 'Neonatal Care', quantity: 1, unitPrice: 5000 }]
      }, adminToken);
      if (ci1Res.ok) {
        c1InvId = ci1Res.data?.data?.id || ci1Res.data?.id;
        pass(`Invoice created for Child 1 (id=${c1InvId})`, 'child1Billing');
        const cp1Res = await api('/billing/staff/payments', 'POST', {
          invoiceId: c1InvId, amount: 5000, paymentMethod: 'CASH', transactionRef: 'TX-222'
        }, adminToken);
        cp1Res.ok ? pass('Payment processed for Child 1', 'child1Billing') : fail('Child 1 payment failed', JSON.stringify(cp1Res.data), 'child1Billing');
      } else fail('Child 1 invoice failed', JSON.stringify(ci1Res.data), 'child1Billing');
    } else fail('Child 1 charge failed', JSON.stringify(cc1Res.data), 'child1Billing');
  }

  console.log('\n── WORKFLOW 5: CHILD 2 BILLING (TWIN 1) ────────────────────');
  let c2InvId;
  if (twin1Id) {
    const cc2Res = await api('/billing/staff/charges', 'POST', {
      patientId: twin1Id, hospitalId: 1,
      category: 'CLINICAL_SERVICE', description: 'NICU Care',
      quantity: 1, unitPrice: 8000
    }, adminToken);
    
    if (cc2Res.ok) {
      pass('Charge created for Child 2 (independent)', 'child2Billing');
      const ci2Res = await api('/billing/staff/invoices', 'POST', {
        patientId: twin1Id, hospitalId: 1,
        items: [{ itemType: 'CLINICAL_SERVICE', description: 'NICU Care', quantity: 1, unitPrice: 8000 }]
      }, adminToken);
      if (ci2Res.ok) {
        c2InvId = ci2Res.data?.data?.id || ci2Res.data?.id;
        pass(`Invoice created for Child 2 (id=${c2InvId})`, 'child2Billing');
      } else fail('Child 2 invoice failed', JSON.stringify(ci2Res.data), 'child2Billing');
    } else fail('Child 2 charge failed', JSON.stringify(cc2Res.data), 'child2Billing');
  }

  console.log('\n── WORKFLOW 6: BILLING ISOLATION (SECURITY) ────────────────');
  // Mother trying to get Child 1's invoice (API is /billing/me/invoices/{id})
  // Let's test the patient-facing API for isolation
  if (c1InvId) {
      const mFetchC1 = await api(`/billing/me/invoices/${c1InvId}`, 'GET', null, motherToken);
      if (mFetchC1.status === 403 || mFetchC1.status === 404) {
        pass('Mother cannot access Child 1 billing directly (isolated)', 'isolation');
      } else {
        fail('Isolation failed! Mother accessed Child 1 billing', `status: ${mFetchC1.status}`, 'isolation');
      }
  }

  if (mInvId) {
      const p2FetchM = await api(`/billing/me/invoices/${mInvId}`, 'GET', null, patient2Token);
      if (p2FetchM.status === 403 || p2FetchM.status === 404) {
        pass('Unrelated Patient 2 cannot access Mother billing', 'isolation');
      } else {
        fail('Isolation failed! Patient 2 accessed Mother billing', `status: ${p2FetchM.status}`, 'isolation');
      }

      const noTokenFetch = await api(`/billing/me/invoices/${mInvId}`, 'GET', null, null);
      if (noTokenFetch.status === 401 || noTokenFetch.status === 403) {
        pass('No token = 401/403 enforced', 'isolation');
      } else {
        fail('Unauthenticated user accessed billing', `status: ${noTokenFetch.status}`, 'isolation');
      }
  }

  console.log('\n============================================================');
  console.log('📊 PHASE A2 FINAL REPORT');
  console.log('============================================================\n');
  
  const total = passCount + failCount;
  const rate = total > 0 ? (passCount / total * 100).toFixed(1) : 0;
  console.log(`Total: ${total}  |  ✅ PASS: ${passCount}  |  ❌ FAIL: ${failCount}`);
  console.log(`Pass Rate: ${rate}%\n`);

  for (const [k, v] of Object.entries(results)) {
    const st = v.fail === 0 && v.pass > 0 ? 'PASS' : (v.pass > 0 ? 'PARTIAL' : 'FAIL');
    console.log(`  ${st === 'PASS' ? '✅' : '❌'} ${k.toUpperCase()}: ${v.pass}/${v.pass + v.fail} passed`);
  }
}

run();
