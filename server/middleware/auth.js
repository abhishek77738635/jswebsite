const { admin, db } = require('../config/firebase');

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Fetch user from Firestore to check payment status
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    let hasPaid = false;
    let phone = '';

    if (userDoc.exists) {
      const data = userDoc.data();
      hasPaid = data.hasPaid || false;
      phone = data.phone || '';
    } else {
      await db.collection('users').doc(decodedToken.uid).set({
        email: decodedToken.email,
        displayName: decodedToken.name || decodedToken.email?.split('@')[0] || 'Anonymous',
        hasPaid: false,
        phone: '',
        createdAt: new Date().toISOString(),
      });
    }

    req.user = {
      ...decodedToken,
      name: decodedToken.name || decodedToken.email?.split('@')[0] || 'Anonymous',
      hasPaid,
      phone,
    };
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    req.user = null;
    next();
  }
}

// Middleware that blocks request if user is not authenticated
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No valid token provided' });
  }
  next();
}

module.exports = { verifyToken, requireAuth };
