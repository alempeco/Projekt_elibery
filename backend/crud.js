const express = require('express');

function createCRUDRoutes(tableName, pool) {
    const router = express.Router();

    // 📥 GET - Dohvati sve
    router.get('/', async (req, res) => {
        try {
            const [rows] = await pool.execute(`SELECT * FROM ${tableName}`);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: 'Greška pri čitanju', details: err.message });
        }
    });

    // 📥 GET - Dohvati jedan po ID-u
    router.get('/:id', async (req, res) => {
        try {
            const [rows] = await pool.execute(`SELECT * FROM ${tableName} WHERE Id = ?`, [req.params.id]);
            if (rows.length === 0) return res.status(404).json({ message: 'Zapis nije pronađen' });
            res.json(rows[0]);
        } catch (err) {
            res.status(500).json({ error: 'Greška pri čitanju', details: err.message });
        }
    });

    // 📤 POST - Kreiraj novi zapis
    router.post('/', async (req, res) => {
        try {
            const keys = Object.keys(req.body);
            const values = Object.values(req.body);
            const placeholders = keys.map(() => '?').join(', ');
            
            const sql = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
            const [result] = await pool.execute(sql, values);
            
            res.status(201).json({ id: result.insertId, ...req.body });
        } catch (err) {
            res.status(500).json({ error: 'Greška pri spašavanju', details: err.message });
        }
    });

    // 🔄 PUT - Ažuriraj zapis
    router.put('/:id', async (req, res) => {
        try {
            const { Id, ...updateData } = req.body; // Izbacujemo Id da ga ne pokušamo pregaziti
            const keys = Object.keys(updateData);
            const values = Object.values(updateData);
            
            const setClause = keys.map(key => `${key} = ?`).join(', ');
            const sql = `UPDATE ${tableName} SET ${setClause} WHERE Id = ?`;
            
            await pool.execute(sql, [...values, req.params.id]);
            res.json({ message: 'Zapis uspješno ažuriran' });
        } catch (err) {
            res.status(500).json({ error: 'Greška pri ažuriranju', details: err.message });
        }
    });

    // ❌ DELETE - Obriši zapis
    router.delete('/:id', async (req, res) => {
        try {
            await pool.execute(`DELETE FROM ${tableName} WHERE Id = ?`, [req.params.id]);
            res.json({ message: 'Zapis obrisan' });
        } catch (err) {
            res.status(500).json({ error: 'Greška pri brisanju', details: err.message });
        }
    });

    return router;
}

module.exports = createCRUDRoutes;