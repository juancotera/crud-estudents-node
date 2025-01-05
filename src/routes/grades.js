const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { calculateAverage } = require('../utils/gradeCalculator');

// Obtener todas las calificaciones de un estudiante
router.get('/student/:studentId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('grades')
      .select(`
        *,
        competencies (
          name,
          areas (name)
        )
      `)
      .eq('student_id', req.params.studentId);

    if (error) throw error;

    // Agrupar calificaciones por competencia
    const groupedGrades = data.reduce((acc, grade) => {
      const competencyId = grade.competency_id;
      if (!acc[competencyId]) {
        acc[competencyId] = {
          competency: grade.competencies.name,
          area: grade.competencies.areas.name,
          grades: []
        };
      }
      acc[competencyId].grades.push(grade);
      return acc;
    }, {});

    // Calcular promedios
    const results = Object.entries(groupedGrades).map(([competencyId, data]) => ({
      competency_id: competencyId,
      competency_name: data.competency,
      area_name: data.area,
      grades: data.grades.map(g => g.grade),
      average: calculateAverage(data.grades)
    }));

    res.json(results);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener calificaciones',
      details: error.message
    });
  }
});

// Obtener calificaciones por competencia
router.get('/competency/:competencyId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('grades')
      .select(`
        *,
        students (first_name, last_name)
      `)
      .eq('competency_id', req.params.competencyId);

    if (error) throw error;

    const results = data.map(grade => ({
      ...grade,
      student_name: `${grade.students.first_name} ${grade.students.last_name}`
    }));

    res.json(results);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener calificaciones de la competencia',
      details: error.message
    });
  }
});

// Registrar nueva calificación
router.post('/', async (req, res) => {
  try {
    const { student_id, competency_id, grade } = req.body;

    // Verificar que no exceda el límite de 5 calificaciones
    const { data: existingGrades, error: countError } = await supabase
      .from('grades')
      .select('*', { count: 'exact' })
      .eq('student_id', student_id)
      .eq('competency_id', competency_id);

    if (countError) throw countError;

    if (existingGrades.length >= 5) {
      return res.status(400).json({
        error: 'Límite de calificaciones alcanzado',
        message: 'Ya existen 5 calificaciones para esta competencia'
      });
    }

    // Validar que la calificación esté en el rango correcto (por ejemplo, 0-100)
    if (grade < 0 || grade > 20) {
      return res.status(400).json({
        error: 'Calificación inválida',
        message: 'La calificación debe estar entre 0 y 20'
      });
    }

    const { data, error } = await supabase
      .from('grades')
      .insert([{
        student_id,
        competency_id,
        grade,
        evaluation_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({
      error: 'Error al registrar calificación',
      details: error.message
    });
  }
});

// Obtener promedio general de un estudiante
router.get('/student/:studentId/average', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('grades')
      .select(`
        *,
        competencies (
          name,
          areas (name)
        )
      `)
      .eq('student_id', req.params.studentId);

    if (error) throw error;

    // Agrupar por área y competencia
    const areaAverages = data.reduce((acc, grade) => {
      const areaName = grade.competencies.areas.name;
      const competencyName = grade.competencies.name;

      if (!acc[areaName]) {
        acc[areaName] = {
          competencies: {}
        };
      }

      if (!acc[areaName].competencies[competencyName]) {
        acc[areaName].competencies[competencyName] = {
          grades: []
        };
      }

      acc[areaName].competencies[competencyName].grades.push(grade.grade);
      return acc;
    }, {});

    // Calcular promedios
    Object.keys(areaAverages).forEach(areaName => {
      const area = areaAverages[areaName];
      let competencyAverages = [];

      Object.keys(area.competencies).forEach(competencyName => {
        const competency = area.competencies[competencyName];
        competency.average = calculateAverage(competency.grades.map(g => ({ grade: g })));
        competencyAverages.push(parseFloat(competency.average));
      });

      area.average = (competencyAverages.reduce((a, b) => a + b, 0) / competencyAverages.length).toFixed(2);
    });

    res.json(areaAverages);
  } catch (error) {
    res.status(500).json({
      error: 'Error al calcular promedios',
      details: error.message
    });
  }
});

module.exports = router;