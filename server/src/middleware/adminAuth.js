// Ye login/signup system NAHI hai — sirf ek shared secret key check hoti hai
// jo admin panel ko normal users se chhupata hai. Key .env me ADMIN_KEY se set hoti hai.
export function adminAuth(req, res, next) {
  const key = req.header('x-admin-key');
  const expected = process.env.ADMIN_KEY;

  if (!expected || key !== expected) {
    return res.status(401).json({ error: 'Unauthorized: galat ya missing admin key' });
  }
  next();
}
