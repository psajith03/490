const ProgressiveOverload = require('../models/ProgressiveOverload');
const SavedWorkout = require('../models/SavedWorkout');

exports.saveProgressiveOverload = async (req, res) => {
  try {
    const { workoutId, exercises } = req.body;
    const userId = req.user.uid;
    const workout = await SavedWorkout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    const progressiveOverload = new ProgressiveOverload({
      userId,
      workout: workoutId,
      exercises
    });

    await progressiveOverload.save();
    res.status(201).json(progressiveOverload);
  } catch (error) {
    console.error('Error saving progressive overload:', error);
    res.status(500).json({ message: 'Error saving progressive overload data' });
  }
};

exports.getProgressiveOverloads = async (req, res) => {
  try {
    const userId = req.user.uid;
    const progressiveOverloads = await ProgressiveOverload.find({ userId })
      .populate('workout')
      .sort({ createdAt: -1 });
    res.json(progressiveOverloads);
  } catch (error) {
    console.error('Error fetching progressive overloads:', error);
    res.status(500).json({ message: 'Error fetching progressive overload data' });
  }
};

exports.getProgressiveOverload = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const progressiveOverload = await ProgressiveOverload.findOne({
      _id: id,
      userId
    }).populate('workout');

    if (!progressiveOverload) {
      return res.status(404).json({ message: 'Progressive overload not found' });
    }

    res.json(progressiveOverload);
  } catch (error) {
    console.error('Error fetching progressive overload:', error);
    res.status(500).json({ message: 'Error fetching progressive overload data' });
  }
};

exports.updateProgressiveOverload = async (req, res) => {
  try {
    const { id } = req.params;
    const { exercises } = req.body;
    const userId = req.user.uid;

    const progressiveOverload = await ProgressiveOverload.findOne({
      _id: id,
      userId
    });

    if (!progressiveOverload) {
      return res.status(404).json({ message: 'Progressive overload not found' });
    }

    progressiveOverload.exercises = exercises;
    await progressiveOverload.save();

    res.json(progressiveOverload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 