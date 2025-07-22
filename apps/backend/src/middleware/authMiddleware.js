function authMiddleware(req, res, next) {
  if (req.header('x-api-key') !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}
module.exports = authMiddleware;