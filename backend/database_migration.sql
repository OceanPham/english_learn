-- Migration to add new features to writing scoring system
-- Run this SQL to update your existing database

-- Add new columns to WritingScores table
ALTER TABLE WritingScores 
ADD COLUMN word_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN time_spent INTEGER,
ADD COLUMN word_count_penalty FLOAT NOT NULL DEFAULT 0.0,
ADD COLUMN time_penalty FLOAT NOT NULL DEFAULT 0.0,
ADD COLUMN adjusted_score FLOAT NOT NULL DEFAULT 0.0;

-- Create CombinedWritingScores table
CREATE TABLE CombinedWritingScores (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    task1_score_id VARCHAR(36),
    task2_score_id VARCHAR(36),
    combined_score FLOAT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (task1_score_id) REFERENCES WritingScores(id),
    FOREIGN KEY (task2_score_id) REFERENCES WritingScores(id)
);

-- Update existing records to set adjusted_score = overall_score for backward compatibility
UPDATE WritingScores SET adjusted_score = overall_score WHERE adjusted_score = 0.0; 