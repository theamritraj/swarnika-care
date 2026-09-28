import jwt from 'jsonwebtoken';

const secret = '404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970';
const token = jwt.sign({
  sub: 'admin@test.sc',
  roles: ['SUPER_ADMIN'],
  iss: 'swarnika-iam',
  aud: 'swarnika-care'
}, Buffer.from(secret, 'base64'), { expiresIn: '1h' });

fetch('http://localhost:8085/api/v1/beds/1/status', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({ status: 'AVAILABLE' })
}).then(res => res.text()).then(console.log);
