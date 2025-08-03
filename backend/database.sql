CREATE DATABASE IF NOT EXISTS ielts_ai_platform;
USE ielts_ai_platform;

-- 1. Users table
CREATE TABLE Users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(100),
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Essays table
CREATE TABLE Essays (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36),
  title VARCHAR(255),
  task_type ENUM('task1', 'task2') NOT NULL,
  input_text TEXT NOT NULL,
  feedback_text TEXT,
  band_score_total FLOAT,
  band_task_response FLOAT,
  band_coherence FLOAT,
  band_grammar FLOAT,
  band_lexical FLOAT,
  status ENUM('pending', 'scored', 'exported') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 3. EssaySuggestions table
CREATE TABLE EssaySuggestions (
  id CHAR(36) PRIMARY KEY,
  essay_id CHAR(36),
  sentence_excerpt TEXT,
  issue_type ENUM('grammar', 'vocabulary', 'coherence', 'task'),
  suggestion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (essay_id) REFERENCES Essays(id) ON DELETE CASCADE
);

-- 4. AIChats table
CREATE TABLE AIChats (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36),
  message TEXT NOT NULL,
  role ENUM('user', 'assistant') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 5. Exports table
CREATE TABLE Exports (
  id CHAR(36) PRIMARY KEY,
  essay_id CHAR(36),
  format ENUM('pdf', 'docx') NOT NULL,
  file_url TEXT NOT NULL,
  exported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (essay_id) REFERENCES Essays(id) ON DELETE CASCADE
);

-- 6. Subscriptions table
CREATE TABLE Subscriptions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36),
  plan ENUM('free', 'student', 'pro', 'unlimited') NOT NULL,
  status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 7. Payments table
CREATE TABLE Payments (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36),
  amount DECIMAL(10, 2) NOT NULL,
  method ENUM('credit_card', 'paypal', 'momo', 'vn_pay') NOT NULL,
  payment_status ENUM('success', 'failed', 'pending') DEFAULT 'pending',
  transaction_id VARCHAR(255) UNIQUE,
  paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 8. UserCredits table
CREATE TABLE UserCredits (
  user_id CHAR(36) PRIMARY KEY,
  available_credits INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 9. WritingScores table
CREATE TABLE WritingScores (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  task_type VARCHAR(20) NOT NULL,
  essay_text TEXT NOT NULL,
  
  -- Scoring criteria (0-9 scale with 0.5 increments)
  task_achievement FLOAT NOT NULL,
  coherence_cohesion FLOAT NOT NULL,
  lexical_resource FLOAT NOT NULL,
  grammatical_range FLOAT NOT NULL,
  
  -- Overall score
  overall_score FLOAT NOT NULL,
  
  -- Feedback for each criterion
  task_achievement_feedback TEXT,
  coherence_cohesion_feedback TEXT,
  lexical_resource_feedback TEXT,
  grammatical_range_feedback TEXT,
  
  -- Corrections data
  corrections TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
