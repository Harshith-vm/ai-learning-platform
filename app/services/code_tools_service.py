from fastapi import HTTPException
from typing import Dict, Any, List
import re
import json


async def detect_code_blocks(page_content: str) -> Dict[str, Any]:
    """
    Detect and extract code blocks from webpage content.
    
    Args:
        page_content: The webpage text content
        
    Returns:
        Dictionary with list of detected code blocks
        
    Raises:
        HTTPException: If detection fails
    """
    code_blocks = []
    
    # Pattern 1: Markdown fenced code blocks with language
    # ```python
    # code here
    # ```
    markdown_pattern = r'```(\w+)?\n(.*?)```'
    markdown_matches = re.finditer(markdown_pattern, page_content, re.DOTALL)
    
    for match in markdown_matches:
        language = match.group(1) if match.group(1) else "unknown"
        code = match.group(2).strip()
        if code:
            code_blocks.append({
                "language": language,
                "code": code
            })
    
    # Pattern 2: Indented code blocks (4+ spaces or tab)
    # Common in plain text or markdown without fences
    lines = page_content.split('\n')
    current_block = []
    in_code_block = False
    
    for line in lines:
        # Check if line is indented (4+ spaces or starts with tab)
        if line.startswith('    ') or line.startswith('\t'):
            in_code_block = True
            # Remove leading indentation
            cleaned_line = line.lstrip()
            current_block.append(cleaned_line)
        else:
            # End of code block
            if in_code_block and current_block:
                code = '\n'.join(current_block).strip()
                if len(code) > 10:  # Minimum code length
                    code_blocks.append({
                        "language": "unknown",
                        "code": code
                    })
                current_block = []
                in_code_block = False
    
    # Handle last block if exists
    if current_block:
        code = '\n'.join(current_block).strip()
        if len(code) > 10:
            code_blocks.append({
                "language": "unknown",
                "code": code
            })
    
    # Pattern 3: HTML <code> or <pre> tags
    html_code_pattern = r'<(?:code|pre)(?:\s+class="(\w+)")?>(.*?)</(?:code|pre)>'
    html_matches = re.finditer(html_code_pattern, page_content, re.DOTALL | re.IGNORECASE)
    
    for match in html_matches:
        language = match.group(1) if match.group(1) else "unknown"
        code = match.group(2).strip()
        # Remove HTML entities
        code = code.replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&')
        if len(code) > 10:
            code_blocks.append({
                "language": language,
                "code": code
            })
    
    return {
        "code_blocks": code_blocks
    }


async def review_pull_request(code_diff: str, language: str) -> Dict[str, Any]:
    """
    Analyze a pull request diff and provide review feedback.
    
    Args:
        code_diff: The code diff to review
        language: Programming language
        
    Returns:
        Dictionary with summary, issues, and suggestions
        
    Raises:
        HTTPException: If review fails
    """
    from app.core.llm import call_llm
    
    # Build LLM prompt
    prompt = f"""Analyze this pull request diff for {language} code.

Provide:
1. Summary: Brief overview of changes (2-3 sentences)
2. Issues: List of potential bugs, problems, or concerns
3. Suggestions: List of improvement recommendations

Be specific and actionable.
Return strictly in this JSON format:

{{
  "summary": "...",
  "issues": ["issue 1", "issue 2", ...],
  "suggestions": ["suggestion 1", "suggestion 2", ...]
}}

Code Diff:
{code_diff}

Return ONLY the JSON object. No markdown, no code blocks, no explanations."""
    
    try:
        llm_response = await call_llm(prompt)
        
        # Extract JSON using regex
        json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', llm_response, re.DOTALL)
        
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
            review_data = json.loads(json_text)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=500,
                detail="Failed to parse PR review response."
            )
        
        # Validate required fields
        if "summary" not in review_data or "issues" not in review_data or "suggestions" not in review_data:
            raise HTTPException(
                status_code=500,
                detail="Invalid PR review response format."
            )
        
        return {
            "summary": review_data["summary"],
            "issues": review_data["issues"] if isinstance(review_data["issues"], list) else [],
            "suggestions": review_data["suggestions"] if isinstance(review_data["suggestions"], list) else []
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate PR review."
        )


async def explain_code_inline(code: str, language: str) -> Dict[str, Any]:
    """
    Generate line-by-line explanation of code.
    
    Args:
        code: The code to explain
        language: Programming language
        
    Returns:
        Dictionary with line-by-line explanations
        
    Raises:
        HTTPException: If explanation fails
    """
    from app.core.llm import call_llm
    
    # Split code into lines
    lines = code.split('\n')
    num_lines = len(lines)
    
    # Build LLM prompt
    prompt = f"""Explain each line of the following {language} code.

For each line, provide a brief explanation of what it does.

Return strictly in this JSON format:

{{
  "explanations": [
    {{"line": 1, "explanation": "..."}},
    {{"line": 2, "explanation": "..."}},
    ...
  ]
}}

Code:
{code}

Return ONLY the JSON object. No markdown, no code blocks, no explanations outside JSON."""
    
    try:
        llm_response = await call_llm(prompt)
        
        # Extract JSON using regex
        json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', llm_response, re.DOTALL)
        
        if not json_match:
            # Fallback: try cleaning markdown code blocks
            cleaned_response = llm_response.strip()
            if cleaned_response.startswith("```"):
                lines_resp = cleaned_response.split("\n")
                cleaned_response = "\n".join(lines_resp[1:-1]) if len(lines_resp) > 2 else cleaned_response
            json_text = cleaned_response
        else:
            json_text = json_match.group(0)
        
        # Parse JSON
        try:
            explanation_data = json.loads(json_text)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=500,
                detail="Failed to parse inline explanation response."
            )
        
        # Validate required fields
        if "explanations" not in explanation_data or not isinstance(explanation_data["explanations"], list):
            raise HTTPException(
                status_code=500,
                detail="Invalid inline explanation response format."
            )
        
        return {
            "explanations": explanation_data["explanations"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate inline explanation."
        )


async def convert_code(source_code: str, source_language: str, target_language: str) -> Dict[str, Any]:
    """
    Convert code from one programming language to another.
    
    Args:
        source_code: The source code to convert
        source_language: Source programming language
        target_language: Target programming language
        
    Returns:
        Dictionary with converted code
        
    Raises:
        HTTPException: If conversion fails
    """
    from app.core.llm import call_llm
    
    # Build LLM prompt
    prompt = f"""Convert the following code from {source_language} to {target_language}.

Requirements:
- Maintain the same logic and functionality
- Follow {target_language} best practices and idioms
- Preserve code structure where possible
- Use appropriate {target_language} syntax

Return only the converted code.
No markdown code blocks.
No explanations.
Only code.

Source Code ({source_language}):
{source_code}"""
    
    try:
        converted_code = await call_llm(prompt)
        
        # Clean up potential markdown code blocks
        code_text = converted_code.strip()
        
        # Remove markdown code blocks if present
        if code_text.startswith("```"):
            lines = code_text.split("\n")
            # Remove first line (```language) and last line (```)
            if len(lines) > 2:
                code_text = "\n".join(lines[1:-1])
        
        return {
            "converted_code": code_text
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to convert code."
        )
