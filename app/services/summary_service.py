import json
import re
from app.core.llm import call_llm
from app.core.prompts import build_summary_prompt
from app.schemas.summary import SummaryResponse, ConceptTag, ConceptHeatmapEntry


async def generate_summary(text: str) -> SummaryResponse:
    """
    Generate a structured summary from the input text with weighted concept tags and heatmap.
    
    Args:
        text: The input text to summarize
        
    Returns:
        Validated SummaryResponse object
        
    Raises:
        ValueError: If LLM returns invalid format or parsing fails
        RuntimeError: If LLM API call fails
    """
    prompt = build_summary_prompt(text)
    
    try:
        llm_response = await call_llm(prompt)
        
        # Parse structured text response
        try:
            # Extract title
            title_match = re.search(r'TITLE:\s*(.+?)(?:\n|$)', llm_response, re.IGNORECASE)
            title = title_match.group(1).strip() if title_match else "Untitled"
            
            # Extract summary
            summary_match = re.search(r'SUMMARY:\s*(.+?)(?=\n\n|\nKEY_POINTS:)', llm_response, re.IGNORECASE | re.DOTALL)
            summary = summary_match.group(1).strip() if summary_match else ""
            
            # Extract key points
            key_points_match = re.search(r'KEY_POINTS:\s*(.+?)(?=\n\nCONCEPT_TAGS:|\nCONCEPT_TAGS:|$)', llm_response, re.IGNORECASE | re.DOTALL)
            key_points_text = key_points_match.group(1).strip() if key_points_match else ""
            
            # Parse key points (remove bullet points and empty lines)
            key_points = [
                line.strip().lstrip('-•*').strip()
                for line in key_points_text.split('\n')
                if line.strip() and line.strip().lstrip('-•*').strip()
            ]
            
            # Extract and parse concept tags
            concept_tags_match = re.search(r'CONCEPT_TAGS:\s*(.+?)(?:\n|$)', llm_response, re.IGNORECASE)
            concept_tags = []
            
            if concept_tags_match:
                tags_text = concept_tags_match.group(1).strip()
                
                # Split by comma
                tag_entries = tags_text.split(',')
                
                for entry in tag_entries:
                    entry = entry.strip()
                    if '|' in entry:
                        # Split on pipe
                        parts = entry.split('|')
                        if len(parts) == 2:
                            name = parts[0].strip()
                            try:
                                score = int(parts[1].strip())
                                # Validate score range
                                if 1 <= score <= 10:
                                    concept_tags.append(ConceptTag(name=name, importance=score))
                            except ValueError:
                                # Skip invalid scores
                                continue
            
            # Validate we have required data
            if not summary:
                raise ValueError("Failed to extract summary from response")
            if not key_points:
                raise ValueError("Failed to extract key points from response")
            if not concept_tags:
                raise ValueError("Failed to extract concept tags from response")
            
            # Compute concept heatmap
            total_importance = sum(tag.importance for tag in concept_tags)
            concept_heatmap = {}
            
            for tag in concept_tags:
                weight = round(tag.importance / total_importance, 3)
                concept_heatmap[tag.name] = ConceptHeatmapEntry(
                    importance=tag.importance,
                    weight=weight
                )
            
            # Create and validate response
            validated_summary = SummaryResponse(
                title=title,
                summary=summary,
                key_points=key_points,
                concept_tags=concept_tags,
                concept_heatmap=concept_heatmap
            )
            return validated_summary
            
        except Exception as e:
            raise ValueError(f"Failed to parse LLM response: {str(e)}")
            
    except RuntimeError:
        raise
    except ValueError:
        raise
    except Exception as e:
        raise RuntimeError(f"Unexpected error during summary generation: {str(e)}")

