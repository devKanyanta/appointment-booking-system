const { getAvailableSlots } = require('../services/availabilityEngine');

const getAvailability = async (req, res, next) => {
  try {
    const { date, serviceId } = req.query;

    if (!date || !serviceId) {
      return res.status(400).json({ message: 'date and serviceId are required' });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Validate date is not in the past
    const [year, month, day] = date.split('-').map(Number);
    const requestedDate = new Date(year, month - 1, day);
    if (requestedDate.getFullYear() !== year || requestedDate.getMonth() !== month - 1 || requestedDate.getDate() !== day) {
      return res.status(400).json({ message: 'Invalid calendar date' });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (requestedDate < today) {
      return res.status(400).json({ message: 'Cannot book appointments in the past' });
    }

    const result = await getAvailableSlots(date, parseInt(serviceId, 10));

    // Normalize slots to snake_case for API consistency
    const normalizedSlots = (result.slots || []).map(slot => ({
      start_time: slot.startTime,
      end_time: slot.endTime,
    }));

    res.json({ data: normalizedSlots });
  } catch (error) {
    if (error.message === 'Service not found') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

module.exports = { getAvailability };
