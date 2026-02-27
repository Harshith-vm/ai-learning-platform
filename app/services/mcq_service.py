import json
from app.core.llm import call_llm
from app.core.prompts import build_mcq_prompt
from app.schemas.mcq import MCQResponse


async def generate_mcqs(text: str) -> MCQResponse:
    """
    Generate 5 multiple choice questions from the input text.
    
    Args:
        text: The input text to generate questions from
        
    Returns:
        Validated MCQResponse object containing exactly 5 MCQs
        
    Raises:
        ValueError: If LLM returns invalid JSON or schema validation fails
        RuntimeError: If LLM API call fails
    """
    prompt = build_mcq_prompt(text)
    
    try:
        llm_response = await call_llm(prompt)
        
        # Clean potential markdown code blocks
        cleaned_response = llm_response.strip()
        if cleaned_response.startswith("```"):
            lines = cleaned_response.split("\n")
            cleaned_response = "\n".join(lines[1:-1]) if len(lines) > 2 else cleaned_response
        
        # Parse JSON
        try:
            parsed_data = json.loads(cleaned_response)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON response from LLM: {str(e)}")
        
        # Validate against Pydantic schema
        try:
            validated_mcqs = MCQResponse(**parsed_data)
            return validated_mcqs
        except Exception as e:
            raise ValueError(f"Schema validation failed: {str(e)}")
            
    except RuntimeError:
        raise
    except ValueError:
        raise
    except Exception as e:
        raise RuntimeError(f"Unexpected error during MCQ generation: {str(e)}")
