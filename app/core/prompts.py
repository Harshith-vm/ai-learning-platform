def build_summary_prompt(text: str) -> str:
    """
    Build a prompt that forces the LLM to return a structured summary with weighted concept tags.
    
    Args:
        text: The input text to summarize
        
    Returns:
        A formatted prompt string
    """
    return f"""Analyze the following text and provide a structured summary.

Text to analyze:
{text}

Provide your response in the following format:

TITLE: <A concise title for the content>

SUMMARY: <A comprehensive summary in 2-3 sentences>

KEY_POINTS:
- <First key point>
- <Second key point>
- <Third key point>

CONCEPT_TAGS: <Concept Name|Score, Concept Name|Score, ...>

Concept tags requirements:
- Return 5-12 concept tags
- Format strictly as: Name|Score (e.g., "Machine Learning|10")
- Score must be integer 1-10 where:
  * 10 = most central idea
  * 1 = minor supporting idea
- Each tag must be a concise noun phrase
- Use Title Case
- No verbs
- No duplicates
- No trailing punctuation
- Order by score descending (highest first)
- Output all tags on a single line after CONCEPT_TAGS:

Example format:
CONCEPT_TAGS: Large Language Models|10, Transformers|9, Hierarchical Summarization|8"""


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



def build_task_prompt(
    task_type: str,
    content: str,
    language: str = None,
    persona: str = None
) -> str:
    """
    Build a task-specific prompt with persona-aware framing.
    
    This function orchestrates prompt construction by adapting the task framing
    based on the persona. The persona influences not just tone (via system role)
    but also what the task asks for.
    
    Args:
        task_type: Type of task (e.g., "code_explain", "concept_explain", etc.)
        content: The content to process (code, text, concept, etc.)
        language: Programming language (for code tasks)
        persona: Persona type (beginner, student, senior_dev, or None)
        
    Returns:
        Formatted task prompt string
    """
    if task_type == "code_explain":
        return _build_code_explain_prompt(content, language, persona)
    
    elif task_type == "concept_explain":
        return _build_concept_explain_prompt(content, persona)
    
    # Future task types can be added here
    # elif task_type == "code_improve":
    #     return _build_code_improve_prompt(content, language, persona)
    
    raise ValueError(f"Unsupported task_type: {task_type}")


def _build_code_explain_prompt(code: str, language: str = None, persona: str = None) -> str:
    """
    Build persona-aware code explanation prompt.
    
    Args:
        code: The code to explain
        language: Programming language
        persona: Persona type (beginner, student, senior_dev, or None)
        
    Returns:
        Formatted prompt string
    """
    lang = language or "unknown"
    
    # Persona-specific task framing
    if persona == "beginner":
        task_instruction = f"""Explain the following {lang} code in very simple terms.

Your explanation should:
- Use everyday language that anyone can understand
- Avoid technical jargon completely
- Focus on WHAT the code does, not how it's optimized
- Break down the explanation into small, clear steps
- Use encouraging, friendly tone

Return plain text only. Do not use markdown formatting.

Code:
{code}"""
    
    elif persona == "student":
        task_instruction = f"""Provide an academic explanation of the following {lang} code.

Your explanation should:
- Use structured paragraphs with clear logical flow
- Explain the reasoning behind each part
- Use proper computer science terminology
- Focus on conceptual understanding
- Maintain moderate technical depth

Return plain text only. Do not use markdown formatting.

Code:
{code}"""
    
    elif persona == "senior_dev":
        task_instruction = f"""Conduct an engineering design review of the following {lang} code.

Your review should:
- Critique the architectural intent and design decisions
- Analyze trade-offs made in this implementation
- Evaluate scalability implications and performance characteristics
- Assess maintainability concerns and technical debt
- Identify specific refactoring opportunities
- Examine edge cases and potential failure modes
- Consider production readiness

Do NOT describe basic syntax or surface-level logic. Focus on engineering implications.

Return plain text only. Do not use markdown formatting.

Code:
{code}"""
    
    else:
        # Default generic prompt (no persona)
        task_instruction = f"""Explain the following {lang} code clearly and professionally.

Describe:
- What the code does
- Input/output behavior
- Main logic
- Important constructs used

Keep explanation structured in paragraphs.
Avoid markdown.
Return plain text only.

Code:
{code}"""
    
    return task_instruction



def _build_concept_explain_prompt(concept: str, persona: str = None) -> str:
    """
    Build persona-aware concept explanation prompt with layered structure.
    
    Args:
        concept: The concept to explain
        persona: Persona type (beginner, student, senior_dev, or None)
        
    Returns:
        Formatted prompt string
    """
    # Persona-specific task framing with layered structure
    if persona == "beginner":
        task_instruction = f"""Explain the concept: "{concept}"

Structure your explanation in the following order:

1. Simple definition: Provide a simple, clear definition in everyday language.

2. Step-by-step explanation: Break down how this concept works into small, easy-to-follow steps.

3. Real-world analogies: Include at least 2 simple real-world analogies. Use everyday objects or situations that anyone can relate to. Each analogy must clearly map to the concept. Do not use technical metaphors. Keep language simple.

4. Small example: Provide a simple, concrete example that illustrates the concept.

Keep language simple. Avoid technical jargon completely. Use plain text only. Do not use markdown formatting, bullet points, or symbols.

After completing the explanation, add a new line and write:
PREREQUISITES: <list 3-6 prerequisite concepts required to understand this topic as a clean comma-separated list without explanations>

Concept to explain: {concept}"""
    
    elif persona == "student":
        task_instruction = f"""Provide an academic explanation of the concept: "{concept}"

Structure your explanation in the following order:

1. Formal definition: Provide a precise, academic definition of the concept.

2. How it works: Explain the underlying mechanism and how this concept operates.

3. Why it is important: Discuss the significance and relevance of this concept.

4. Conceptual analogies: Include 1 or 2 conceptual analogies that reinforce understanding. Analogies should connect the mechanism to familiar systems. Avoid childish comparisons. Keep tone academic.

5. Example: Provide a meaningful example that illustrates the concept in practice.

6. Common misunderstandings: Address typical misconceptions or confusion points.

Maintain moderate technical depth. Use proper terminology with definitions. Use plain text only. Do not use markdown formatting, bullet points, or symbols.

After completing the explanation, add a new line and write:
PREREQUISITES: <list 3-6 prerequisite concepts required to understand this topic as a clean comma-separated list without explanations>

Concept to explain: {concept}"""
    
    elif persona == "senior_dev":
        task_instruction = f"""Provide a technical conceptual breakdown of: "{concept}"

Structure your explanation in the following order:

1. Precise definition: Provide a technically accurate, concise definition.

2. Underlying mechanism: Explain the deeper technical mechanisms and how it works internally.

3. Architectural implications: Discuss how this concept affects system design and architecture.

4. Trade-offs: Analyze the trade-offs, benefits, and costs of using this concept.

5. Technical analogy (if applicable): Include an analogy only if it clarifies architectural reasoning. If included, the analogy must be technical, such as system architecture parallels or engineering patterns. Do not use simplistic metaphors. If an analogy is unnecessary, omit it.

6. Failure modes: Identify potential failure scenarios or edge cases.

7. When not to use: Explain situations where this concept should be avoided.

8. Performance implications: Discuss performance characteristics if relevant.

Use dense, technical tone. Do not explain basic terminology. Assume strong technical background. Use plain text only. Do not use markdown formatting, bullet points, or symbols.

After completing the explanation, add a new line and write:
PREREQUISITES: <list 3-6 prerequisite concepts required to understand this topic as a clean comma-separated list without explanations>

Concept to explain: {concept}"""
    
    else:
        # Default generic prompt (no persona) with neutral structure
        task_instruction = f"""Explain the following concept clearly and professionally.

Structure your explanation in the following order:

1. Definition: Provide a clear definition of what this concept means.

2. Explanation: Explain how this concept works and its key characteristics.

3. Analogy: Include 1 general analogy that helps illustrate the concept.

4. Example: Provide a concrete example that illustrates the concept.

Use plain text only. Do not use markdown formatting, bullet points, or symbols.

After completing the explanation, add a new line and write:
PREREQUISITES: <list 3-6 prerequisite concepts required to understand this topic as a clean comma-separated list without explanations>

Concept to explain: {concept}"""
    
    return task_instruction
