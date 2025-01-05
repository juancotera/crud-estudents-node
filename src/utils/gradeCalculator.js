const calculateAverage = (grades) => {
  if (!grades || grades.length === 0) return 0;
  const sum = grades.reduce((acc, grade) => acc + grade.grade, 0);
  return (sum / grades.length).toFixed(2);
};

module.exports = { calculateAverage };