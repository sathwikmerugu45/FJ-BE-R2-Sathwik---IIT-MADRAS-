const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Income {
  static async findAll(userId) {
    const { rows } = await db.query(
      `SELECT i.id, i.amount, i.description, i.date, ic.name AS category_name 
       FROM income i 
       JOIN income_categories ic ON i.category_id = ic.id 
       WHERE i.user_id = $1
       ORDER BY i.date DESC`,
      [userId]
    );
    return rows;
  }

  static async findById(id, userId) {
    const { rows } = await db.query(
      `SELECT i.id, i.amount, i.description, i.date, i.category_id, ic.name AS category_name 
       FROM income i 
       JOIN income_categories ic ON i.category_id = ic.id 
       WHERE i.id = $1 AND i.user_id = $2`,
      [id, userId]
    );
    return rows[0];
  }

  static async create(incomeData) {
    const { user_id, category_id, amount, description, date } = incomeData;
    const id = uuidv4();

    const { rows } = await db.query(
      `INSERT INTO income (id, user_id, category_id, amount, description, date) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, user_id, category_id, amount, description, date`,
      [id, user_id, category_id, amount, description, date]
    );
    
    return rows[0];
  }

  static async update(id, incomeData, userId) {
    const { category_id, amount, description, date } = incomeData;

    const { rows } = await db.query(
      `UPDATE income 
       SET category_id = $1, amount = $2, description = $3, date = $4 
       WHERE id = $5 AND user_id = $6 
       RETURNING id, user_id, category_id, amount, description, date`,
      [category_id, amount, description, date, id, userId]
    );
    
    return rows[0];
  }

  static async delete(id, userId) {
    await db.query('DELETE FROM income WHERE id = $1 AND user_id = $2', [id, userId]);
  }

  static async getCategories(userId) {
    const { rows } = await db.query(
      'SELECT id, name FROM income_categories WHERE user_id = $1 OR user_id IS NULL ORDER BY name',
      [userId]
    );
    return rows;
  }
  
  static async createCategory(name, userId) {
    const { rows } = await db.query(
      'INSERT INTO income_categories (name, user_id) VALUES ($1, $2) RETURNING id, name',
      [name, userId]
    );
    return rows[0];
  }
  
  static async getMonthlySum(userId, year) {
    const { rows } = await db.query(
      `SELECT 
        EXTRACT(MONTH FROM date) as month, 
        SUM(amount) as total 
      FROM income 
      WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = $2
      GROUP BY month 
      ORDER BY month`,
      [userId, year]
    );
    return rows;
  }
  
  static async getCategorySum(userId, startDate, endDate) {
    const { rows } = await db.query(
      `SELECT 
        ic.name as category, 
        SUM(i.amount) as total 
      FROM income i
      JOIN income_categories ic ON i.category_id = ic.id
      WHERE i.user_id = $1 AND i.date BETWEEN $2 AND $3
      GROUP BY ic.name 
      ORDER BY total DESC`,
      [userId, startDate, endDate]
    );
    return rows;
  }
}

module.exports = Income;