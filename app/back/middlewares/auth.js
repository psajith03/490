const admin = require('../firebase');

const authenticate = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];

  console.log('Received ID Token:', idToken);

  if (!idToken) {
    console.error('No ID Token provided');
    return res.status(401).send('Unauthorized');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log('Decoded Token:', decodedToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(401).send('Unauthorized');
  }
};

module.exports = authenticate;
