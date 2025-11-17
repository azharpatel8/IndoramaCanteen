export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.details || err.message,
    });
  }

  if (err.name === 'DatabaseError' || err.code) {
    return res.status(500).json({
      error: 'Database Error',
      message: 'An error occurred while processing your request',
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong',
  });
}
