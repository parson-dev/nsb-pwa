import os
import sys
import argparse
import re

import fitz
import json


def is_valid_line(line):
    """
    Checks if the line is valid (for processing).

    Returns:
        True, or False if invalid.
    """
    line = line.strip()
    if not line:
        return False  # blank lines
    if re.fullmatch(r"[^\w]*", line):
        return False  # only punctuation/symbols
    if re.fullmatch(r"[_\W\d\s]{5,}", line):
        return False  # long lines of underscores, dashes, etc.
    if "page" in line.lower() and re.search(r"\d", line):
        return False
    return True

def get_question_subject(line: str) -> str | None:
    """
    Extracts and normalizes the subject from a line of text.

    Supports variants like 'EARTH AND  SPACE', 'MATHEMATICS', etc.,
    and returns a consistent format like 'EARTH AND SPACE'.

    Returns:
        Normalized subject string or None.
    """
    subject_patterns = {
        r"BIOLOGY": "LIFE SCIENCE",
        r"EARTH\s+AND\s+SPACE(\s+SCIENCE)?": "EARTH SCIENCE",
        r"EARTH\s+SCIENCE": "EARTH SCIENCE",
        r"ENERGY": "ENERGY",
        r"GENERAL\s+SCIENCE": "GENERAL SCIENCE",
        r"LIFE\s+SCIENCE": "LIFE SCIENCE",
        r"MATH(EMATICS)?": "MATH",
        r"PHYSICAL\s+SCIENCE": "PHYSICAL SCIENCE"
    }

    for pattern, normalized in subject_patterns.items():
        if re.search(rf"\b{pattern}\b", line, re.IGNORECASE):
            return normalized

    return "UNKNOWN"

def get_question_type(line: str) -> str | None:
    """
    Extracts and normalizes question type from a line.
    Supports variations like 'TOSS-UP', 'TOSS - UP', 'TOSS–UP', etc.
    
    Returns:
        "TOSS-UP", "BONUS", or None if not found.
    """
    match = re.search(r"\b(TOSS\s*[-–]?\s*UP|BONUS)\b", line.upper(), re.IGNORECASE)
    if match:
        raw_type = match.group(1).upper()
        if "TOSS" in raw_type:
            return "TOSS-UP"
        else:
            return "BONUS"
    return None

def extract_multiple_choice_options(question_text):
    """
    Extracts multiple choice options from question text.
    
    Args:
        question_text (str): The full question text containing choices
        
    Returns:
        tuple: (clean_question, choices_dict) where choices_dict maps letters to options
    """
    # First, find where the choices start
    first_choice_match = re.search(r'\s+([WXYZ])\)\s*', question_text, re.IGNORECASE)
    if not first_choice_match:
        return question_text, {}
    
    # Split the text into question part and choices part
    question_part = question_text[:first_choice_match.start()].strip()
    choices_part = question_text[first_choice_match.start():].strip()
    
    # Remove trailing colon from question if present
    question_part = re.sub(r':\s*$', '', question_part)
    
    # Pattern to match each choice: letter) followed by text until next letter) or end
    # This handles cases where choices contain parentheses or other special characters
    choice_pattern = r'([WXYZ])\)\s*(.*?)(?=\s+[WXYZ]\)|$)'
    
    # Find all choices in the choices part
    choices = re.findall(choice_pattern, choices_part, re.IGNORECASE | re.DOTALL)
    
    if not choices:
        return question_text, {}
    
    # Create choices dictionary
    choices_dict = {}
    for letter, option in choices:
        # Clean up the option text
        option = option.strip()
        # Remove any trailing punctuation that might interfere
        option = re.sub(r'\s+', ' ', option)  # Normalize whitespace
        choices_dict[letter.upper()] = option
    
    return question_part, choices_dict

def get_qnas(document):
    """
    Extracts questions and answers from document text.

    Returns:
        List.
    """
    # Read all lines in the document, skipping header/footer/non-content lines
    lines = []
    for page in document:
        page_lines = page.get_text().splitlines()
        if len(page_lines) > 1:
            filtered = [
                line.strip()
                for line in page_lines
                if is_valid_line(line)
            ]
            lines.extend(filtered)

    qnas = []
    i = 0
    while i < len(lines):
        t = s = f = q = a = "" 
        t = get_question_type(lines[i])

        # Ignore if type i.e., TOSS-UP or BONUS is not found
        if not t:
            i += 1
            continue
        # Collect lines of TOSS-UP or BONUS block into a single line
        block = []
        i += 1
        while i < len(lines) and not get_question_type(lines[i]):
            block.append(lines[i])
            i += 1
        block_text = " ".join(block)
        # Extract subject, format, question and answer
        pattern = re.compile(
            r"""
            ^[\*]?\s*\d+[\)\.]? # number
            \s+
            (BIOLOGY|EARTH\s+AND\s+SPACE|EARTH\s+SCIENCE|EARTH\s+AND\s+SPACE\s+SCIENCE|ENERGY|GENERAL\s+SCIENCE|LIFE\s+SCIENCE|MATH|MATHEMATICS|PHYSICAL\s+SCIENCE)[\.]?
            \s*[-–]?\s*
            (SHORT\s*ANSWER|MULTIPLE\s*CHOICE) # format
            \s+(.*?) # question (non-greedy)
            \s+ANSWER:?\s*(.*) # answer
            """,
            re.IGNORECASE | re.VERBOSE,
        )
        match = pattern.match(block_text)
        if match:
            s = match.group(1).strip()
            f = match.group(2).strip()
            q = match.group(3).strip()
            a = match.group(4).strip()
        # Ignore if question or answer is blank
        if not q or not a:
            continue
        
        # Process multiple choice questions to extract choices
        question_obj = {
            "source" : document.name,
            "type" : t,
            "subject" : get_question_subject(s),
            "format" : f,
            "question": q,
            "answer":   a
        }
        
        # If it's a multiple choice question, extract the choices
        # This will separate the question text from the W) X) Y) Z) options
        if f.upper().replace(" ", "") == "MULTIPLECHOICE":
            clean_question, choices = extract_multiple_choice_options(q)
            if choices:
                question_obj["question"] = clean_question
                question_obj["choices"] = choices
                # Example output format:
                # {
                #   "question": "What is the capital of France",
                #   "choices": {
                #     "W": "London",
                #     "X": "Berlin", 
                #     "Y": "Paris",
                #     "Z": "Madrid"
                #   },
                #   "answer": "Y) PARIS"
                # }
        
        qnas.append(question_obj)

    return qnas


def main():
    parser = argparse.ArgumentParser(
        description="""\
Script to extract questions from sample sets downloaded from National Science Bowl.

Features:
- Extracts questions, answers, subjects, and types from PDF files
- For Multiple Choice questions, automatically separates the question text 
  from the W) X) Y) Z) choices into a structured format
- Outputs JSON with clean question text and separate choices dictionary

Example Multiple Choice output:
{
  "question": "What is the capital of France",
  "choices": {"W": "London", "X": "Berlin", "Y": "Paris", "Z": "Madrid"},
  "answer": "Y) PARIS",
  "format": "Multiple Choice"
}
""",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        '-i', '--input',
        type=str,
        default='./',
        help='path to the sample sets (default: ./)'
    )
    parser.add_argument(
        '-o', '--output',
        type=str,
        default='./qnas.json',
        help='path to the output file (default: ./qnas.json)'
    )
    args = parser.parse_args()
    
    pdf_files = []
    # Find .pdf files under the base path (default: current-dir)
    for root, _, files in os.walk(args.input):
        for file in files:
            if file.lower().endswith(".pdf"):
                pdf_files.append(os.path.join(root, file))
                
    qnas = []
    # Find question and answers in each .pdf
    for pdf_file in pdf_files:
        try:
            document = fitz.open(pdf_file)
            doc_qnas = get_qnas(document)
            # print(f"{pdf_file}: Found {len(doc_qnas)} questions.")
            qnas.extend(doc_qnas)
        except Exception as e:
            print(f"{pdf_file}: ERROR {e}")

    # Save question and answers to output
    with open(args.output, "w") as f:
        json.dump(qnas, f, indent=4)

    print(f"\nFound {len(qnas)}.")
    print("\nFinished!")

if __name__ == "__main__":
    main()


