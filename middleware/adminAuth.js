module.exports = (req, res, next) => {
  const auth = { login: 'admin', password: 'password123' }; 

  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

  if (login === auth.login && password === auth.password) {
    return next(); // Auth success
  }

  // No or wrong credentials: send 401
  res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
  res.status(401).send('Authentication required.');
};
