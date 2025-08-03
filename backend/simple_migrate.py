import sqlite3
import os

def migrate_database():
    # Connect to the database
    db_path = 'database.db'
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check existing columns
        cursor.execute('PRAGMA table_info(WritingScores)')
        columns = [row[1] for row in cursor.fetchall()]
        print('Existing columns:', columns)
        
        # Add missing columns
        new_columns = [
            ('word_count', 'INTEGER NOT NULL DEFAULT 0'),
            ('time_spent', 'INTEGER'),
            ('word_count_penalty', 'REAL NOT NULL DEFAULT 0.0'),
            ('time_penalty', 'REAL NOT NULL DEFAULT 0.0'),
            ('adjusted_score', 'REAL NOT NULL DEFAULT 0.0')
        ]
        
        for col_name, col_def in new_columns:
            if col_name not in columns:
                try:
                    cursor.execute(f'ALTER TABLE WritingScores ADD COLUMN {col_name} {col_def}')
                    print(f'✓ Added {col_name} column')
                except Exception as e:
                    print(f'Error adding {col_name}: {e}')
            else:
                print(f'{col_name} already exists')
        
        # Create CombinedWritingScores table
        try:
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS CombinedWritingScores (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                task1_score_id VARCHAR(36),
                task2_score_id VARCHAR(36),
                combined_score REAL NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
                FOREIGN KEY (task1_score_id) REFERENCES WritingScores(id),
                FOREIGN KEY (task2_score_id) REFERENCES WritingScores(id)
            )
            ''')
            print('✓ Created/verified CombinedWritingScores table')
        except Exception as e:
            print(f'Error creating table: {e}')
        
        # Update existing records
        try:
            cursor.execute('UPDATE WritingScores SET adjusted_score = overall_score WHERE adjusted_score = 0.0')
            print(f'✓ Updated {cursor.rowcount} records with adjusted_score')
        except Exception as e:
            print(f'Error updating records: {e}')
        
        conn.commit()
        conn.close()
        print('✅ Database migration completed!')
    else:
        print('Database file not found at:', db_path)

if __name__ == "__main__":
    migrate_database() 