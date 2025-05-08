-- Create database
CREATE DATABASE personal_finance_tracker;

-- Connect to database
\c personal_finance_tracker;

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Income categories table
CREATE TABLE income_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (name, user_id)
);

-- Income table
CREATE TABLE income (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES income_categories(id) ON DELETE SET NULL,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expense categories table
CREATE TABLE expense_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (name, user_id)
);

-- Expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES expense_categories(id) ON DELETE SET NULL,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default income categories
INSERT INTO income_categories (name, user_id) VALUES 
('Salary', NULL),
('Freelance', NULL),
('Investments', NULL),
('Gifts', NULL),
('Other', NULL);

-- Insert default expense categories
INSERT INTO expense_categories (name, user_id) VALUES 
('Housing', NULL),
('Food', NULL),
('Transportation', NULL),
('Utilities', NULL),
('Entertainment', NULL),
('Healthcare', NULL),
('Education', NULL),
('Shopping', NULL),
('Personal Care', NULL),
('Other', NULL);