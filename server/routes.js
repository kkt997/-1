// FILE: server/routes.js
const express = require('express');
const { authController, farmlandController, dataController, knowledgeController } = require('./controllers');
const { verifyToken } = require('./middleware');
const router = express.Router();

// --- Auth Routes ---
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);

// --- Farmland Routes (Protected) ---
router.post('/farmlands', verifyToken, farmlandController.create);
router.get('/farmlands', verifyToken, farmlandController.getAll);
router.get('/farmlands/:id', verifyToken, farmlandController.getById);

// --- Data Routes (Protected) ---
router.get('/data/farmland/:id/latest', verifyToken, dataController.getLatest);
router.get('/data/farmland/:id/history', verifyToken, dataController.getHistory);

// --- Knowledge Routes (Protected) ---
router.get('/knowledge', verifyToken, knowledgeController.getAll);

module.exports = router;