const validateId = (id) => {
  return id && typeof id === 'string' && id.trim().length > 0;
};

const formatResponse = (success, data = null, message = '') => {
  return {
    success,
    ...(message && { message }),
    ...(data && { data })
  };
};

module.exports = {
  validateId,
  formatResponse
};
