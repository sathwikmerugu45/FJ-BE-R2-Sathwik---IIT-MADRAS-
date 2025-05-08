const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  static async findByEmail(email) {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
  }

  static async findById(id) {
    const { rows } = await db.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [id]);
    return rows[0];
  }

  static async create(userData) {
    const { name, email, password } = userData;
    
    // Check if user already exists
    const userExists = await this.findByEmail(email);
    if (userExists) {
      throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generate unique id
    const id = uuidv4();

    // Insert user into database
    const { rows } = await db.query(
      'INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4) RETURNING id, name, email, created_at',
      [id, name, email, hashedPassword]
    );
    
    await this.createDefaultCategories(id);
    
    return rows[0];
  }
  
  static async createDefaultCategories(userId) {
    // Copy default income categories for this user
    await db.query(`
      INSERT INTO income_categories (name, user_id)
      SELECT name, $1 FROM income_categories WHERE user_id IS NULL
    `, [userId]);
    
    // Copy default expense categories for this user
    await db.query(`
      INSERT INTO expense_categories (name, user_id)
      SELECT name, $1 FROM expense_categories WHERE user_id IS NULL
    `, [userId]);
  }

  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
}

module.exports = User;