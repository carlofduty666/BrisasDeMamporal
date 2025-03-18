const db = require('../models');
const Aranceles = db.Aranceles;

const arancelesController = {
  getAllAranceles: async (req, res) => {
    try {
      const aranceles = await Aranceles.findAll({
        order: [['nombre', 'ASC']]
      });
      res.json(aranceles);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  getArancelById: async (req, res) => {
    try {
      const arancel = await Aranceles.findByPk(req.params.id);
      if (!arancel) {
        return res.status(404).json({ message: 'Arancel no encontrado' });
      }
      res.json(arancel);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  getArancelesActivos: async (req, res) => {
    try {
      const aranceles = await Aranceles.findAll({
        where: { activo: true },
        order: [['nombre', 'ASC']]
      });
      res.json(aranceles);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  createArancel: async (req, res) => {
    try {
      const nuevoArancel = await Aranceles.create(req.body);
      res.status(201).json(nuevoArancel);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: err.message });
    }
  },
  
  updateArancel: async (req, res) => {
    try {
      const arancel = await Aranceles.findByPk(req.params.id);
      if (!arancel) {
        return res.status(404).json({ message: 'Arancel no encontrado' });
      }
      
      await arancel.update(req.body);
      res.json(arancel);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: err.message });
    }
  },
  
  deleteArancel: async (req, res) => {
    try {
      const arancel = await Aranceles.findByPk(req.params.id);
      if (!arancel) {
        return res.status(404).json({ message: 'Arancel no encontrado' });
      }
      
      // Verificar si hay pagos asociados
      const pagosAsociados = await db.PagoEstudiantes.count({
        where: { arancelID: arancel.id }
      });
      
      if (pagosAsociados > 0) {
        // En lugar de eliminar, desactivar
        await arancel.update({ activo: false });
        return res.json({ 
          message: 'Arancel desactivado porque tiene pagos asociados',
          arancel
        });
      }
      
      await arancel.destroy();
      res.json({ message: 'Arancel eliminado correctamente' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = arancelesController;
