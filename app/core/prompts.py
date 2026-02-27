def build_summary_prompt(text: str) -> str:
    """
    Build a prompt that forces the LLM to return a structured summary in strict JSON format.
    
    Args:
        text: The input text to summarize
        
    Returns:
        A formatted prompt string
    """
    return f"""You are a JSON-only API. Analyze the following text and return ONLY valid JSON with no additional text or explanation.

Text to analyze:
{text}

Return ONLY this exact JSON structure:
{{
  "title": "A concise title for the content",
  "summary": "A comprehensive summary in 2-3 sentences",
  "key_points": ["First key point", "Second key point", "Third key point"]
}}

CRITICAL: Return ONLY the JSON object. No markdown, no code blocks, no explanations."""


def build_mcq_prompt(text: str) -> str:
    """
    Build a prompt that forces the LLM to return exactly 5 MCQs in strict JSON format.
    
    Args:
        text: The input text to generate questions from
        
    Returns:
        A formatted prompt string
    """
    return f"""You are a JSON-only API. Generate exactly 5 multiple choice questions based on the following text. Return ONLY valid JSON with no additional text.

Text:
{text}

Return ONLY this exact JSON structure:
{{
  "mcqs": [
    {{
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_index": 0,
      "explanation": "Why this answer is correct",
      "difficulty": "easy"
    }}
  ]
}}

Requirements:
- Generate exactly 5 MCQs
- Each MCQ must have exactly 4 options
- correct_index must be 0, 1, 2, or 3
- difficulty must be "easy", "medium", or "hard"
- Return ONLY the JSON object. No markdown, no code blocks, no explanations."""
