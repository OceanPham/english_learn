#!/usr/bin/env python3
"""
Database migration script for enhanced writing scoring system
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import Flask app and extensions
from extensions import db
from __init__ import create_app

def migrate_database():
    app = create_app()
    with app.app_context():
        print("Starting database migration...")
        
        # Check if columns already exist
        inspector = db.inspect(db.engine)
        existing_columns = [col['name'] for col in inspector.get_columns('WritingScores')]
        
        # Add new columns to WritingScores table if they don't exist
        if 'word_count' not in existing_columns:
            try:
                db.engine.execute('ALTER TABLE WritingScores ADD COLUMN word_count INTEGER NOT NULL DEFAULT 0')
                print('✓ Added word_count column')
            except Exception as e:
                print(f'Error adding word_count column: {e}')
        else:
            print('word_count column already exists')
        
        if 'time_spent' not in existing_columns:
            try:
                db.engine.execute('ALTER TABLE WritingScores ADD COLUMN time_spent INTEGER')
                print('✓ Added time_spent column')
            except Exception as e:
                print(f'Error adding time_spent column: {e}')
        else:
            print('time_spent column already exists')
        
        if 'word_count_penalty' not in existing_columns:
            try:
                db.engine.execute('ALTER TABLE WritingScores ADD COLUMN word_count_penalty FLOAT NOT NULL DEFAULT 0.0')
                print('✓ Added word_count_penalty column')
            except Exception as e:
                print(f'Error adding word_count_penalty column: {e}')
        else:
            print('word_count_penalty column already exists')
        
        if 'time_penalty' not in existing_columns:
            try:
                db.engine.execute('ALTER TABLE WritingScores ADD COLUMN time_penalty FLOAT NOT NULL DEFAULT 0.0')
                print('✓ Added time_penalty column')
            except Exception as e:
                print(f'Error adding time_penalty column: {e}')
        else:
            print('time_penalty column already exists')
        
        if 'adjusted_score' not in existing_columns:
            try:
                db.engine.execute('ALTER TABLE WritingScores ADD COLUMN adjusted_score FLOAT NOT NULL DEFAULT 0.0')
                print('✓ Added adjusted_score column')
            except Exception as e:
                print(f'Error adding adjusted_score column: {e}')
        else:
            print('adjusted_score column already exists')
        
        # Create CombinedWritingScores table
        try:
            existing_tables = inspector.get_table_names()
            if 'CombinedWritingScores' not in existing_tables:
                db.create_all()
                print('✓ Created CombinedWritingScores table')
            else:
                print('CombinedWritingScores table already exists')
        except Exception as e:
            print(f'Error creating tables: {e}')
        
        # Update existing records
        try:
            result = db.engine.execute('UPDATE WritingScores SET adjusted_score = overall_score WHERE adjusted_score = 0.0')
            print(f'✓ Updated {result.rowcount} existing records with adjusted_score')
        except Exception as e:
            print(f'Error updating existing records: {e}')
        
        print("✅ Database migration completed successfully!")

if __name__ == "__main__":
    migrate_database() 