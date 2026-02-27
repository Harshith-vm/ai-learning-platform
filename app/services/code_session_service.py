from fastapi import HTTPException, UploadFile
from typing import Dict, Any, Optional
import uuid

# In-memory code session store
CODE_STORE: Dict[str, Dict[str, Any]] = {}

# Language detection mapping
LANGUAGE_EXTENSIONS = {
    '.py': 'python',
    '.cpp': 'cpp',
    '.c': 'c',
    '.java': 'java',
    '.js': 'javascript',
    '.ts': 'typescript',
    '.go': 'go',
    '.rs': 'rust',
    '.rb': 'ruby',
    '.php': 'php',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.cs': 'csharp',
    '.html': 'html',
    '.css': 'css',
    '.sql': 'sql',
    '.sh': 'bash',
    '.r': 'r',
    '.m': 'matlab',
    '.scala': 'scala'
}


def create_code_session() -> str:
    """
    Generate a unique code session ID.
    
    Returns:
        UUID string for the code session
    """
    return str(uuid.uuid4())


def detect_language_from_filename(filename: str) -> str:
    """
    Detect programming language from file extension.
    
    Args:
        filename: The filename to analyze
        
    Returns:
        Detected language or "unknown"
    """
    filename_lower = filename.lower()
    
    for ext, lang in LANGUAGE_EXTENSIONS.items():
        if filename_lower.endswith(ext):
            return lang
    
    return "unknown"


async def store_code_session(
    code: Optional[str] = None,
    language: Optional[str] = None,
    file: Optional[UploadFile] = None,
    context: Optional[str] = None
) -> Dict[str, Any]:
    """
    Store a code session from either raw code or file upload.
    
    Args:
        code: Raw code string (optional)
        language: Programming language (optional)
        file: Uploaded file (optional)
        context: Additional context about the code (optional)
        
    Returns:
        Dictionary with session_id, language, and message
        
    Raises:
        HTTPException: If validation fails
    """
    code_content = None
    detected_language = language
    filename = None
    
    # Priority: file upload over raw code
    if file:
        # Read file content
        try:
            file_bytes = await file.read()
            code_content = file_bytes.decode('utf-8', errors='ignore')
            filename = file.filename
            
            # Detect language from extension if not provided
            if not detected_language:
                detected_language = detect_language_from_filename(file.filename)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail="Failed to read file content."
            )
    elif code:
        # Use raw code from request body
        code_content = code
        
        # Default to unknown if language not provided
        if not detected_language:
            detected_language = "unknown"
    else:
        # Neither file nor code provided
        raise HTTPException(
            status_code=400,
            detail="Either code or file must be provided."
        )
    
    # Validate code is not empty
    if not code_content or len(code_content.strip()) < 5:
        raise HTTPException(
            status_code=400,
            detail="Code must be at least 5 characters long."
        )
    
    # Generate session ID
    session_id = create_code_session()
    
    # Store in CODE_STORE
    CODE_STORE[session_id] = {
        "code": code_content,
        "language": detected_language,
        "filename": filename,
        "context": context,
        "analysis": None,
        "improvements": None,
        "complexity": None,
        "refactored_code": None,
        "stepwise_explanation": None,
        "architecture_analysis": None,
        "refactor_impact": None,
        "quality_score": None
    }
    
    return {
        "session_id": session_id,
        "language": detected_language,
        "message": "Code stored successfully."
    }


def get_code_session(session_id: str) -> Dict[str, Any]:
    """
    Retrieve a code session by ID.
    
    Args:
        session_id: The code session ID
        
    Returns:
        Code session data
        
    Raises:
        HTTPException: If session not found
    """
    if session_id not in CODE_STORE:
        raise HTTPException(
            status_code=404,
            detail="Code session not found."
        )
    
    return CODE_STORE[session_id]



async def explain_code(session_id: str) -> Dict[str, Any]:
    """
    Generate structured explanation for stored code.
    
    Args:
        session_id: The code session ID
        
    Returns:
        Dictionary with explanation text
        
    Raises:
        HTTPException: If session not found or explanation fails
    """
    from app.core.llm import call_llm
    
    # Validate session exists
    if session_id not in CODE_STORE:
        raise HTTPException(
            status_code=404,
            detail="Code session not found."
        )
    
    # Retrieve code and language
    session = CODE_STORE[session_id]
    code = session.get("code")
    language = session.get("language", "unknown")
    
    # Validate code exists
    if not code:
        raise HTTPException(
            status_code=400,
            detail="No code found in session."
        )
    
    # Build LLM prompt
    prompt = f"""Explain the following {language} code clearly and professionally.

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
    
    # Call LLM
    try:
        explanation_text = await call_llm(prompt)
        
        # Store explanation in CODE_STORE
        CODE_STORE[session_id]["analysis"] = explanation_text
        
        return {
            "explanation": explanation_text
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate code explanation."
        )



async def improve_code(session_id: str) -> Dict[str, Any]:
    """
    Generate improvement suggestions for stored code.
    
    Args:
        session_id: The code session ID
        
    Returns:
        Dictionary with improvement suggestions
        
    Raises:
        HTTPException: If session not found or improvement generation fails
    """
    from app.core.llm import call_llm
    
    # Validate session exists
    if session_id not in CODE_STORE:
        raise HTTPException(
            status_code=404,
            detail="Code session not found."
        )
    
    # Retrieve code, language, and context
    session = CODE_STORE[session_id]
    code = session.get("code")
    language = session.get("language", "unknown")
    context = session.get("context")
    
    # Validate code exists
    if not code:
        raise HTTPException(
            status_code=400,
            detail="No code found in session."
        )
    
    # Build context section
    context_section = context if context else "No specific context provided."
    
    # Build LLM prompt
    prompt = f"""Analyze the following {language} code and suggest improvements.

If context is provided, tailor suggestions accordingly.

Provide:
- Code quality improvements
- Performance suggestions
- Readability suggestions
- Best practice recommendations

Be specific.
Avoid markdown.
Return structured paragraphs.

Context:
{context_section}

Code:
{code}"""
    
    # Call LLM
    try:
        improvement_text = await call_llm(prompt)
        
        # Store improvements in CODE_STORE
        CODE_STORE[session_id]["improvements"] = improvement_text
        
        return {
            "improvements": improvement_text
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate code improvements."
        )



async def analyze_complexity(session_id: str) -> Dict[str, Any]:
    """
    Analyze time and space complexity of stored code.
    
    Args:
        session_id: The code session ID
        
    Returns:
        Dictionary with time_complexity, space_complexity, and justification
        
    Raises:
        HTTPException: If session not found or complexity analysis fails
    """
    from app.core.llm import call_llm
    import json
    import re
    
    # Validate session exists
    if session_id not in CODE_STORE:
        raise HTTPException(
            status_code=404,
            detail="Code session not found."
        )
    
    # Retrieve code and language
    session = CODE_STORE[session_id]
    code = session.get("code")
    language = session.get("language", "unknown")
    
    # Validate code exists
    if not code:
        raise HTTPException(
            status_code=400,
            detail="No code found in session."
        )
    
    # Build LLM prompt
    prompt = f"""Analyze the following {language} code and determine:

1) Time complexity (Big-O notation)
2) Space complexity (Big-O notation)
3) Short justification (2-4 sentences)

Be precise.
Avoid markdown.
Return strictly in this JSON format:

{{
  "time_complexity": "O(...)",
  "space_complexity": "O(...)",
  "justification": "..."
}}

Code:
{code}

Return ONLY the JSON object. No markdown, no code blocks, no explanations."""
    
    # Call LLM
    try:
        llm_response = await call_llm(prompt)
        
        # Extract JSON using regex (handles markdown code blocks and extra text)
        json_match = re.search(r'\{{[^{{}}]*(?:\{{[^{{}}]*\}}[^{{}}]*)*\}}', llm_response, re.DOTALL)
        
        if not json_match:
            # Fallback: try cleaning markdown code blocks
            cleaned_response = llm_response.strip()
            if cleaned_response.startswith("```"):
                lines = cleaned_response.split("\n")
                cleaned_response = "\n".join(lines[1:-1]) if len(lines) > 2 else cleaned_response
            json_text = cleaned_response
        else:
            json_text = json_match.group(0)
        
        # Parse JSON
        try:
            complexity_data = json.loads(json_text)
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=500,
                detail="Failed to parse complexity analysis response."
            )
        
        # Validate required fields
        if "time_complexity" not in complexity_data or "space_complexity" not in complexity_data or "justification" not in complexity_data:
            raise HTTPException(
                status_code=500,
                detail="Invalid complexity analysis response format."
            )
        
        # Store complexity in CODE_STORE
        CODE_STORE[session_id]["complexity"] = {
            "time_complexity": complexity_data["time_complexity"],
            "space_complexity": complexity_data["space_complexity"],
            "justification": complexity_data["justification"]
        }
        
        return {
            "time_complexity": complexity_data["time_complexity"],
            "space_complexity": complexity_data["space_complexity"],
            "justification": complexity_data["justification"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate complexity analysis."
        )



async def refactor_code(session_id: str) -> Dict[str, Any]:
    """
    Refactor and improve stored code.
    
    Args:
        session_id: The code session ID
        
    Returns:
        Dictionary with refactored code
        
    Raises:
        HTTPException: If session not found or refactoring fails
    """
    from app.core.llm import call_llm
    
    # Validate session exists
    if session_id not in CODE_STORE:
        raise HTTPException(
            status_code=404,
            detail="Code session not found."
        )
    
    # Retrieve code, language, and context
    session = CODE_STORE[session_id]
    code = session.get("code")
    language = session.get("language", "unknown")
    context = session.get("context")
    
    # Validate code exists
    if not code:
        raise HTTPException(
            status_code=400,
            detail="No code found in session."
        )
    
    # Build context section
    context_section = context if context else "None"
    
    # Build LLM prompt
    prompt = f"""Improve and refactor the following {language} code.

Goals:
- Improve performance if possible
- Improve readability
- Follow best practices
- Maintain same functionality

If context is provided, respect it.

Return only the improved code.
No markdown.
No explanation.
Only code.

Context:
{context_section}

Original Code:
{code}"""
    
    # Call LLM
    try:
        refactored_code = await call_llm(prompt)
        
        # Clean up potential markdown code blocks
        code_text = refactored_code.strip()
        
        # Remove markdown code blocks if present
        if code_text.startswith("```"):
            lines = code_text.split("\n")
            # Remove first line (```language) and last line (```)
            if len(lines) > 2:
                code_text = "\n".join(lines[1:-1])
        
        # Store refactored code in CODE_STORE (do NOT overwrite original)
        CODE_STORE[session_id]["refactored_code"] = code_text
        
        return {
            "refactored_code": code_text
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to refactor code."
        )



async def explain_code_stepwise(session_id: str) -> Dict[str, Any]:
    """
    Generate step-by-step explanation for stored code.
    
    Args:
        session_id: The code session ID
        
    Returns:
        Dictionary with stepwise explanation
        
    Raises:
        HTTPException: If session not found or explanation fails
    """
    from app.core.llm import call_llm
    
    # Validate session exists
    if session_id not in CODE_STORE:
        raise HTTPException(
            status_code=404,
            detail="Code session not found."
        )
    
    # Retrieve code and language
    session = CODE_STORE[session_id]
    code = session.get("code")
    language = session.get("language", "unknown")
    
    # Validate code exists
    if not code:
        raise HTTPException(
            status_code=400,
            detail="No code found in session."
        )
    
    # Build LLM prompt
    prompt = f"""Explain the following {language} code step-by-step.

Break the explanation into logical steps.

For each step:
- Describe what part of the code is executing
- Explain what it does
- Mention how data changes
- Keep explanation clear and structured

Avoid markdown.
Return plain structured text.

Code:
{code}"""
    
    # Call LLM
    try:
        stepwise_text = await call_llm(prompt)
        
        # Store stepwise explanation in CODE_STORE
        CODE_STORE[session_id]["stepwise_explanation"] = stepwise_text
        
        return {
            "stepwise_explanation": stepwise_text
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate step-by-step explanation."
        )



async def analyze_architecture(session_id: str) -> Dict[str, Any]:
    """
    Perform high-level architectural analysis of stored code.
    
    Args:
        session_id: The code session ID
        
    Returns:
        Dictionary with architecture analysis
        
    Raises:
        HTTPException: If session not found or analysis fails
    """
    from app.core.llm import call_llm
    
    # Validate session exists
    if session_id not in CODE_STORE:
        raise HTTPException(
            status_code=404,
            detail="Code session not found."
        )
    
    # Retrieve code and language
    session = CODE_STORE[session_id]
    code = session.get("code")
    language = session.get("language", "unknown")
    
    # Validate code exists
    if not code:
        raise HTTPException(
            status_code=400,
            detail="No code found in session."
        )
    
    # Build LLM prompt
    prompt = f"""Perform a high-level architectural analysis of the following {language} code.

Provide structured analysis including:

1) Components:
- What logical components/functions/classes exist?

2) Data Flow:
- How does data move through the system?

3) Design Patterns:
- Any observable patterns (procedural, functional, OOP, etc.)

4) Strengths:
- What is good about this structure?

5) Weaknesses:
- Architectural limitations or design concerns

Be concise but professional.
Avoid markdown.
Return structured paragraphs with clear headings.

Code:
{code}"""
    
    # Call LLM
    try:
        architecture_text = await call_llm(prompt)
        
        # Store architecture analysis in CODE_STORE
        CODE_STORE[session_id]["architecture_analysis"] = architecture_text
        
        return {
            "architecture_analysis": architecture_text
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate architecture analysis."
        )



async def compare_refactor_impact(session_id: str) -> Dict[str, Any]:
    """
    Compare complexity between original and refactored code.
    
    Args:
        session_id: The code session ID
        
    Returns:
        Dictionary with original complexity, refactored complexity, and improvement summary
        
    Raises:
        HTTPException: If session not found, refactored code not available, or analysis fails
    """
    from app.core.llm import call_llm
    import json
    import re
    
    # Validate session exists
    if session_id not in CODE_STORE:
        raise HTTPException(
            status_code=404,
            detail="Code session not found."
        )
    
    # Retrieve code data
    session = CODE_STORE[session_id]
    original_code = session.get("code")
    refactored_code = session.get("refactored_code")
    language = session.get("language", "unknown")
    
    # Validate original code exists
    if not original_code:
        raise HTTPException(
            status_code=400,
            detail="No code found in session."
        )
    
    # Validate refactored code exists
    if not refactored_code:
        raise HTTPException(
            status_code=400,
            detail="Refactored code not available. Run /code/refactor/{session_id} first."
        )
    
    # Helper function to get complexity from LLM
    async def get_complexity_from_llm(code: str) -> Dict[str, str]:
        prompt = f"""Analyze the following {language} code and determine:

1) Time complexity (Big-O notation)
2) Space complexity (Big-O notation)
3) Short justification (2-4 sentences)

Be precise.
Avoid markdown.
Return strictly in this JSON format:

{{
  "time_complexity": "O(...)",
  "space_complexity": "O(...)",
  "justification": "..."
}}

Code:
{code}

Return ONLY the JSON object. No markdown, no code blocks, no explanations."""
        
        llm_response = await call_llm(prompt)
        
        # Extract JSON using regex
        json_match = re.search(r'\{{[^{{}}]*(?:\{{[^{{}}]*\}}[^{{}}]*)*\}}', llm_response, re.DOTALL)
        
        if not json_match:
            # Fallback: try cleaning markdown code blocks
            cleaned_response = llm_response.strip()
            if cleaned_response.startswith("```"):
                lines = cleaned_response.split("\n")
                cleaned_response = "\n".join(lines[1:-1]) if len(lines) > 2 else cleaned_response
            json_text = cleaned_response
        else:
            json_text = json_match.group(0)
        
        # Parse JSON
        try:
            complexity_data = json.loads(json_text)
        except json.JSONDecodeError:
            raise Exception("Failed to parse complexity response.")
        
        return complexity_data
    
    # Get complexity for original code
    try:
        original_complexity = await get_complexity_from_llm(original_code)
        original_time = original_complexity.get("time_complexity", "Unknown")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to analyze original code complexity."
        )
    
    # Get complexity for refactored code
    try:
        refactored_complexity = await get_complexity_from_llm(refactored_code)
        refactored_time = refactored_complexity.get("time_complexity", "Unknown")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to analyze refactored code complexity."
        )
    
    # Generate improvement summary
    comparison_prompt = f"""Compare these two time complexities:

Original: {original_time}
Refactored: {refactored_time}

Explain in 2-3 sentences whether performance improved and why."""
    
    try:
        improvement_summary = await call_llm(comparison_prompt)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate improvement summary."
        )
    
    # Store refactor impact in CODE_STORE
    CODE_STORE[session_id]["refactor_impact"] = {
        "original_time_complexity": original_time,
        "refactored_time_complexity": refactored_time,
        "improvement_summary": improvement_summary.strip()
    }
    
    return {
        "original_time_complexity": original_time,
        "refactored_time_complexity": refactored_time,
        "improvement_summary": improvement_summary.strip()
    }



async def evaluate_code_quality(session_id: str) -> Dict[str, Any]:
    """
    Evaluate code quality with scores for readability, efficiency, and maintainability.
    
    Args:
        session_id: The code session ID
        
    Returns:
        Dictionary with quality scores and summary
        
    Raises:
        HTTPException: If session not found or evaluation fails
    """
    from app.core.llm import call_llm
    import json
    import re
    
    # Validate session exists
    if session_id not in CODE_STORE:
        raise HTTPException(
            status_code=404,
            detail="Code session not found."
        )
    
    # Retrieve code and language
    session = CODE_STORE[session_id]
    code = session.get("code")
    language = session.get("language", "unknown")
    
    # Validate code exists
    if not code:
        raise HTTPException(
            status_code=400,
            detail="No code found in session."
        )
    
    # Build LLM prompt
    prompt = f"""Evaluate the following {language} code and score it on:

1) Readability (0-10)
2) Efficiency (0-10)
3) Maintainability (0-10)
4) Overall score (0-10)

Be strict but fair.

Return strictly in this JSON format:

{{
  "readability": <int>,
  "efficiency": <int>,
  "maintainability": <int>,
  "overall": <int>,
  "summary": "Short 2-3 sentence justification."
}}

Code:
{code}

Return ONLY the JSON object. No markdown, no code blocks, no explanations."""
    
    # Call LLM
    try:
        llm_response = await call_llm(prompt)
        
        # Extract JSON using regex
        json_match = re.search(r'\{{[^{{}}]*(?:\{{[^{{}}]*\}}[^{{}}]*)*\}}', llm_response, re.DOTALL)
        
        if not json_match:
            # Fallback: try cleaning markdown code blocks
            cleaned_response = llm_response.strip()
            if cleaned_response.startswith("```"):
                lines = cleaned_response.split("\n")
                cleaned_response = "\n".join(lines[1:-1]) if len(lines) > 2 else cleaned_response
            json_text = cleaned_response
        else:
            json_text = json_match.group(0)
        
        # Parse JSON
        try:
            quality_data = json.loads(json_text)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=500,
                detail="Failed to parse quality score response."
            )
        
        # Validate required fields
        required_fields = ["readability", "efficiency", "maintainability", "overall", "summary"]
        for field in required_fields:
            if field not in quality_data:
                raise HTTPException(
                    status_code=500,
                    detail=f"Invalid quality score response: missing '{field}' field."
                )
        
        # Validate scores are integers between 0-10
        score_fields = ["readability", "efficiency", "maintainability", "overall"]
        for field in score_fields:
            score = quality_data[field]
            if not isinstance(score, int) or score < 0 or score > 10:
                raise HTTPException(
                    status_code=500,
                    detail=f"Invalid score for '{field}': must be integer between 0-10."
                )
        
        # Store quality score in CODE_STORE
        CODE_STORE[session_id]["quality_score"] = {
            "readability": quality_data["readability"],
            "efficiency": quality_data["efficiency"],
            "maintainability": quality_data["maintainability"],
            "overall": quality_data["overall"],
            "summary": quality_data["summary"]
        }
        
        return {
            "readability": quality_data["readability"],
            "efficiency": quality_data["efficiency"],
            "maintainability": quality_data["maintainability"],
            "overall": quality_data["overall"],
            "summary": quality_data["summary"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to evaluate code quality."
        )
