const jwt = require('jsonwebtoken');
const secret = Buffer.from('404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970', 'base64');
const token = jwt.sign({ sub: '1', roles: ['SUPER_ADMIN'] }, secret, {
  issuer: 'swarnika-iam',
  audience: 'swarnika-care',
  expiresIn: '1h'
});
console.log(token);
