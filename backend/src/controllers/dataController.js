const DataModel = require('../models/DataModel');

class DataController {
  async getAllData(req, res, next) {
    try {
      const data = await DataModel.findAll();
      res.json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  async getDataById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await DataModel.findById(id);
      
      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Data not found'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  async createData(req, res, next) {
    try {
      const { name, value, description } = req.body;
      const newData = await DataModel.create({ name, value, description });
      
      res.status(201).json({
        success: true,
        message: 'Data created successfully',
        data: newData
      });
    } catch (error) {
      next(error);
    }
  }

  async updateData(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const updatedData = await DataModel.update(id, updates);
      
      if (!updatedData) {
        return res.status(404).json({
          success: false,
          message: 'Data not found'
        });
      }

      res.json({
        success: true,
        message: 'Data updated successfully',
        data: updatedData
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteData(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await DataModel.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Data not found'
        });
      }

      res.json({
        success: true,
        message: 'Data deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DataController();
