from fastapi import HTTPException
from app.schemas.code_generation import CodeGenerationRequest, CodeGenerationResponse
from typing import Dict, Any


async def generate_code(request: CodeGenerationRequest) -> CodeGenerationResponse:
    """
    Generate code based on problem description.
    
    Args:
        request: CodeGenerationRequest with problem description, language, and optional constraints
        
    Returns:
        CodeGenerationResponse with generated code
        
    Raises:
        HTTPException: If validation fails or code generation fails
    """
    from app.core.llm import call_llm
    
    # Validate problem_description is not empty
    if not request.problem_description or not request.problem_description.strip():
        raise HTTPException(
            status_code=400,
            detail="Problem description must not be empty."
        )
    
    # Validate language is not empty
    if not request.language or not request.language.strip():
        raise HTTPException(
            status_code=400,
            detail="Language must not be empty."
        )
    
    # Build constraints section
    constraints_section = request.constraints if request.constraints else "None"
    
    # Build LLM prompt
    prompt = f"""Generate {request.language} code for the following problem.

Requirements:
- Clean and readable
- Proper function structure
- Add basic comments
- Follow best practices

If constraints are provided, respect them.

Problem:
{request.problem_description}

Constraints:
{constraints_section}

Return only code.
No markdown.
No explanation.
Only code."""
    
    # Call LLM
    try:
        generated_code = await call_llm(prompt)
        
        # Clean up potential markdown code blocks
        code_text = generated_code.strip()
        
        # Remove markdown code blocks if present
        if code_text.startswith("```"):
            lines = code_text.split("\n")
            # Remove first line (```language) and last line (```)
            if len(lines) > 2:
                code_text = "\n".join(lines[1:-1])
        
        return CodeGenerationResponse(
            generated_code=code_text
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate code."
        )
