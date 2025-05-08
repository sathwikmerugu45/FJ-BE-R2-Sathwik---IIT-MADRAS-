const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Expense {
  static async findAll(userId) {
    const { rows } = await db.query(
      `SELECT e.id, e.amount, e.description, e.date, ec.name AS category_name 
       FROM expenses e 
       JOIN expense_categories ec ON e.category_id = ec.id 
       WHERE e.user_id = $1
       ORDER BY e.date DESC`,
      [userId]
    );
    return rows;
  }

  static async findById(id, userId) {
    const { rows } = await db.query(
      `SELECT e.id, e.amount, e.description, e.date, e.category_id, ec.name AS category_name 
       FROM expenses e 
       JOIN expense_categories ec ON e.category_id = ec.id 
       WHERE e.id = $1 AND e.user_id = $2`,
      [id, userId]
    );
    return rows[0];
  }

  static async create(expenseData) {
    const { user_id, category_id, amount, description, date } = expenseData;
    const id = uuidv4();

    const { rows } = await db.query(
      `INSERT INTO expenses (id, user_id, category_id, amount, description, date) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, user_id, category_id, amount, description, date`,
      [id, user_id, category_id, amount, description, date]
    );
    
    return rows[0];
  }

  static async update(id, expenseData, userId) {
    const { category_id, amount, description, date } = expenseData;

    const { rows } = await db.query(
      `UPDATE expenses 
       SET category_id = $1, amount = $2, description = $3, date = $4 
       WHERE id = $5 AND user_id = $6 
       RETURNING id, user_id, category_id, amount, description, date`,
      [category_id, amount, description, date, id, userId]
    );
    
    return rows[0];
  }

  static async delete(id, userId) {
    await db.query('DELETE FROM expenses WHERE id = $1 AND user_id = $2', [id, userId]);
  }

  static async getCategories(userId) {
    const { rows } = await db.query(
      'SELECT id, name FROM expense_categories WHERE user_id = $1 OR user_id IS NULL ORDER BY name',
      [userId]
    );
    return rows;
  }
  
  static async createCategory(name, userId) {
    const { rows } = await db.query(
      'INSERT INTO expense_categories (name, user_id) VALUES ($1, $2) RETURNING id, name',
      [name, userId]
    );
    return rows[0];
  }
  
  static async getMonthlySum(userId, year) {
    const { rows } = await db.query(
      `SELECT 
        EXTRACT(MONTH FROM date) as month, 
        SUM(amount) as total 
      FROM expenses 
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
        ec.name as category, 
        SUM(e.amount) as total 
      FROM expenses e
      JOIN expense_categories ec ON e.category_id = ec.id
      WHERE e.user_id = $1 AND e.date BETWEEN $2 AND $3
      GROUP BY ec.name 
      ORDER BY total DESC`,
      [userId, startDate, endDate]
    );
    return rows;
  }
}

module.exports = Expense;