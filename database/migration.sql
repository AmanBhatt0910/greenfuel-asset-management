-- ============================================================
-- Greenfuel Asset Management — RBAC Migration
-- Run this script once to set up roles, permissions and users
-- ============================================================

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role-Permission mapping table
CREATE TABLE IF NOT EXISTS role_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_permission (role_id, permission_id)
);

-- Users table (replaces the admins table)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  department VARCHAR(100),
  status ENUM('active', 'inactive') DEFAULT 'active',
  must_change_password TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- -------------------------------------------------------
-- Seed default roles
-- -------------------------------------------------------
INSERT IGNORE INTO roles (name, description) VALUES
  ('admin',    'Administrator with full access'),
  ('manager',  'Manager with asset and user management access'),
  ('employee', 'Employee with limited read-only access');

-- -------------------------------------------------------
-- Seed permissions
-- -------------------------------------------------------
INSERT IGNORE INTO permissions (name, description) VALUES
  ('view_dashboard',   'View the main dashboard'),
  ('manage_users',     'Create, edit and deactivate user accounts'),
  ('manage_assets',    'Create, edit and delete assets'),
  ('view_assets',      'View asset information'),
  ('manage_issues',    'Create, edit and close issues'),
  ('view_issues',      'View issue information'),
  ('manage_reports',   'Create and generate reports'),
  ('view_reports',     'View reports'),
  ('manage_transfers', 'Manage asset transfers'),
  ('view_transfers',   'View asset transfers'),
  ('manage_software',  'Manage software licences'),
  ('view_software',    'View software information'),
  ('view_history',     'View operation history');

-- -------------------------------------------------------
-- Assign ALL permissions to Admin
-- -------------------------------------------------------
INSERT IGNORE INTO role_permissions (role_id, permission_id)
  SELECT r.id, p.id
  FROM roles r, permissions p
  WHERE r.name = 'admin';

-- -------------------------------------------------------
-- Assign Manager permissions
-- -------------------------------------------------------
INSERT IGNORE INTO role_permissions (role_id, permission_id)
  SELECT r.id, p.id
  FROM roles r, permissions p
  WHERE r.name = 'manager'
    AND p.name IN (
      'view_dashboard', 'manage_assets', 'view_assets',
      'manage_issues', 'view_issues', 'view_reports',
      'manage_transfers', 'view_transfers',
      'view_software', 'view_history'
    );

-- -------------------------------------------------------
-- Assign Employee permissions
-- -------------------------------------------------------
INSERT IGNORE INTO role_permissions (role_id, permission_id)
  SELECT r.id, p.id
  FROM roles r, permissions p
  WHERE r.name = 'employee'
    AND p.name IN (
      'view_dashboard', 'view_assets', 'view_issues',
      'view_reports', 'view_software', 'view_history'
    );

-- -------------------------------------------------------
-- Migrate existing admin account into users table
-- (Run only if the admins table exists in your database)
-- Adjust the INSERT if your admins table has different columns.
-- -------------------------------------------------------
INSERT IGNORE INTO users (email, passwordHash, role_id, first_name, status)
  SELECT
    a.email,
    a.passwordHash,
    r.id,
    'Admin',
    'active'
  FROM admins a
  CROSS JOIN roles r
  WHERE r.name = 'admin'
  LIMIT 1;
