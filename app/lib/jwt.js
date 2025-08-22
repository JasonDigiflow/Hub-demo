import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d'
  });
}

export async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Pour le mode démo, retourner un utilisateur par défaut
    if (!decoded || !decoded.id) {
      return {
        id: 'demo-user',
        email: 'jason@behype-app.com',
        organizationName: 'DigiFlow'
      };
    }
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    // En mode démo, retourner un utilisateur par défaut
    return {
      id: 'demo-user',
      email: 'jason@behype-app.com',
      organizationName: 'DigiFlow'
    };
  }
}