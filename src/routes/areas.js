const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Obtener todas las áreas
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('areas')
      .select('*');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener áreas',
      details: error.message
    });
  }
});

// Obtener un área específica con sus competencias
router.get('/:id', async (req, res) => {
  try {
    const { data: area, error: areaError } = await supabase
      .from('areas')
      .select(`
        *,
        competencies (*)
      `)
      .eq('id', req.params.id)
      .single();

    if (areaError) throw areaError;
    if (!area) {
      return res.status(404).json({ message: 'Área no encontrada' });
    }

    res.json(area);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener el área',
      details: error.message
    });
  }
});

// Crear nueva área
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const { data, error } = await supabase
      .from('areas')
      .insert([{ name, description }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({
      error: 'Error al crear el área',
      details: error.message
    });
  }
});

module.exports = router;