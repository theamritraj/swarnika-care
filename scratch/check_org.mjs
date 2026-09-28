import crypto from 'crypto';

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

const adminToken = jwt('admin@test.sc', 'SUPER_ADMIN', 401, 1);
async function go() {
  const r = await fetch('http://localhost:8085/api/v1/beds/1', {
    headers: { 'Authorization': 'Bearer ' + adminToken }
  });
  console.log(r.status);
  console.log(await r.text());
}
go();
