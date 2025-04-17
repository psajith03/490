const express = require('express');
const router = express.Router();
const progressiveOverloadController = require('../controllers/progressiveOverloadController');
const auth = require('../middlewares/auth');

router.use(auth);
router.post('/', progressiveOverloadController.saveProgressiveOverload);
router.get('/', progressiveOverloadController.getProgressiveOverloads);
router.get('/:id', progressiveOverloadController.getProgressiveOverload);
router.put('/:id', progressiveOverloadController.updateProgressiveOverload);

module.exports = router; 