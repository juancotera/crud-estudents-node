const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

//obtener datos de estudiantes
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
    .from('students')
    .select('*');
    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener estudiantes',
      details: error.message
    });
  }
});

// Obtener un estudiante por ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener el estudiante',
      details: error.message
    });
  }
});

// Crear un nuevo estudiante
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, email } = req.body;
    const { data, error } = await supabase
      .from('students')
      .insert([{ first_name, last_name, email }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({
      error: 'Error al crear el estudiante',
      details: error.message
    });
  }
});

module.exports = router;