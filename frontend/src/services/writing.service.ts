import apiClient from './api.service';

export interface WritingScore {
  id: string;
  user: string;
  task_type: 'task1' | 'task2';
  essay_text: string;
  word_count: number;
  time_spent?: number;
  task_achievement: number;
  coherence_cohesion: number;
  lexical_resource: number;
  grammatical_range: number;
  overall_score: number;
  word_count_penalty: number;
  time_penalty: number;
  adjusted_score: number;
  task_achievement_feedback: string;
  coherence_cohesion_feedback: string;
  lexical_resource_feedback: string;
  grammatical_range_feedback: string;
  corrections: string;
  created_at: string;
}

export interface ScoreEssayRequest {
  task_type: 'task1' | 'task2';
  essay_text: string;
  time_spent?: number;
}

export interface CombinedWritingScore {
  id: string;
  user_id: string;
  task1_score_id?: string;
  task2_score_id?: string;
  combined_score: number;
  created_at: string;
  task1_score?: WritingScore;
  task2_score?: WritingScore;
}

export interface TextPosition {
  start: number;
  end: number;
  text: string;
}

interface Corrections {
  grammar: Array<{
    original: string;
    correction: string;
    explanation: string;
    positions?: TextPosition[];
  }>;
  vocabulary: Array<{
    original: string;
    suggestion: string;
    explanation: string;
    positions?: TextPosition[];
  }>;
  structure: Array<{
    issue: string;
    suggestion: string;
    example: string;
  }>;
}

class WritingService {
  parseCorrections(score: WritingScore): Corrections {
    try {
      return JSON.parse(score.corrections);
    } catch (e) {
      console.error('Error parsing corrections:', e);
      return {
        grammar: [],
        vocabulary: [],
        structure: []
      };
    }
  }

  highlightText(text: string, corrections: Corrections): string {
    let highlightedText = text;
    let offset = 0;

    // Sort all corrections by position to avoid conflicts
    const allCorrections: Array<{
      start: number;
      end: number;
      type: 'grammar' | 'vocabulary';
      correction: any;
    }> = [];

    // Add grammar corrections
    corrections.grammar.forEach(correction => {
      if (correction.positions) {
        correction.positions.forEach(pos => {
          allCorrections.push({
            start: pos.start,
            end: pos.end,
            type: 'grammar',
            correction
          });
        });
      }
    });

    // Add vocabulary corrections
    corrections.vocabulary.forEach(correction => {
      if (correction.positions) {
        correction.positions.forEach(pos => {
          allCorrections.push({
            start: pos.start,
            end: pos.end,
            type: 'vocabulary',
            correction
          });
        });
      }
    });

    // Sort by start position (descending to avoid offset issues)
    allCorrections.sort((a, b) => b.start - a.start);

    // Apply highlighting
    allCorrections.forEach(item => {
      const colorClass = item.type === 'grammar' ? 'bg-red-200' : 'bg-blue-200';
      const before = highlightedText.substring(0, item.start + offset);
      const highlighted = highlightedText.substring(item.start + offset, item.end + offset);
      const after = highlightedText.substring(item.end + offset);
      
      const highlightedSpan = `<span class="${colorClass} rounded px-1" title="${item.correction.explanation}">${highlighted}</span>`;
      highlightedText = before + highlightedSpan + after;
      
      // Update offset for next replacement
      offset += highlightedSpan.length - highlighted.length;
    });

    return highlightedText;
  }

  calculateTimeLimit(taskType: 'task1' | 'task2'): number {
    return taskType === 'task1' ? 20 : 40; // minutes
  }

  calculateWordLimit(taskType: 'task1' | 'task2'): number {
    return taskType === 'task1' ? 150 : 250; // words
  }

  async scoreEssay(data: ScoreEssayRequest): Promise<WritingScore> {
    try {
      const response = await apiClient.post<WritingScore>('/writing/score', data);
      return response.data;
    } catch (error) {
      console.error('Error scoring essay:', error);
      throw error;
    }
  }

  async getUserScores(): Promise<WritingScore[]> {
    try {
      const response = await apiClient.get<WritingScore[]>('/writing/scores');
      return response.data;
    } catch (error) {
      console.error('Error getting user scores:', error);
      throw error;
    }
  }

  async getScore(scoreId: string): Promise<WritingScore> {
    try {
      const response = await apiClient.get<WritingScore>(`/writing/scores/${scoreId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting score:', error);
      throw error;
    }
  }

  async getCombinedScores(): Promise<CombinedWritingScore[]> {
    try {
      const response = await apiClient.get<CombinedWritingScore[]>('/writing/combined-scores');
      return response.data;
    } catch (error) {
      console.error('Error getting combined scores:', error);
      throw error;
    }
  }
}

export default new WritingService(); 