const { Service } = require('../models');

// Public: list active services
const getServices = async (req, res, next) => {
  try {
    const services = await Service.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']],
    });
    res.json({ data: services });
  } catch (error) {
    next(error);
  }
};

// Public: get single service
const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service || !service.is_active) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ data: service });
  } catch (error) {
    next(error);
  }
};

// Admin: list all services (including inactive)
const adminGetServices = async (req, res, next) => {
  try {
    const services = await Service.findAll({ order: [['name', 'ASC']] });
    res.json({ data: services });
  } catch (error) {
    next(error);
  }
};

// Admin: create service
const createService = async (req, res, next) => {
  try {
    const { name, description, duration, price } = req.body;
    const service = await Service.create({ name, description, duration, price });
    res.status(201).json({ success: true, message: 'Service created', data: service });
  } catch (error) {
    next(error);
  }
};

// Admin: update service
const updateService = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const { name, description, duration, price } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (duration !== undefined) updates.duration = duration;
    if (price !== undefined) updates.price = price;

    await service.update(updates);
    res.json({ success: true, message: 'Service updated', data: service });
  } catch (error) {
    next(error);
  }
};

// Admin: soft-delete service
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    await service.update({ is_active: false });
    res.json({ success: true, message: 'Service deactivated' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  getServiceById,
  adminGetServices,
  createService,
  updateService,
  deleteService,
};
