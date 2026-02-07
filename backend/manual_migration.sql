-- Database migration for manual products support
-- Run this script in your MySQL client (Workbench, phpMyAdmin, or command line)
--
-- Command line usage:
-- mysql -u root -p store_apps_db < manual_migration.sql
--
-- Or copy and paste these commands into your MySQL client

-- Check if we're in the right database
SELECT DATABASE();

-- Make product_id nullable for manual products
ALTER TABLE order_items
MODIFY COLUMN product_id INT NULL
COMMENT 'Nullable for manual products';

-- Add name column for manual product names
ALTER TABLE order_items
ADD COLUMN name VARCHAR(255) NULL
COMMENT 'Product name (required for manual products)';

-- Add description column for manual product descriptions
ALTER TABLE order_items
ADD COLUMN description VARCHAR(500) NULL
COMMENT 'Product description (optional for manual products)';

-- Ensure discount column exists in orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS discount FLOAT DEFAULT 0.0
COMMENT 'Order discount percentage (0-100)';

-- Verify the changes
SELECT 'Migration completed successfully!' as status;
DESCRIBE order_items;
DESCRIBE orders;
