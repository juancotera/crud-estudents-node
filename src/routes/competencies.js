const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Obtener todas las competencias
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('competencies')
      .select(`
        *,
        areas (name)
      `);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener competencias',
      details: error.message
    });
  }
});

// Obtener una competencia específica
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('competencies')
      .select(`
        *,
        areas (name)
      `)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ message: 'Competencia no encontrada' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener la competencia',
      details: error.message
    });
  }
});

// Crear nueva competencia
router.post('/', async (req, res) => {
  try {
    const { area_id, name, description } = req.body;
    const { data, error } = await supabase
      .from('competencies')
      .insert([{ area_id, name, description }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({
      error: 'Error al crear la competencia',
      details: error.message
    });
  }
});

// Obtener competencias por área
router.get('/area/:areaId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('competencies')
      .select('*')
      .eq('area_id', req.params.areaId);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener competencias del área',
      details: error.message
    });
  }
});

module.exports = router;