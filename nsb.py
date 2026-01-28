import os
import sys
import argparse
import json
import keyboard
import random
import requests
import signal
import textwrap
import time

from datetime import datetime
from tts_handler import speak_and_interrupt

def handle_exit(signum, frame):
    """
    Signal handler to catch Ctrl+C (SIGINT) and exit gracefully.
    """
    print("\nExiting...")
    sys.exit(0)

signal.signal(signal.SIGINT, handle_exit)


def set_subjects(questions):
    """
    Identify all unique subjects from the question bank, display them to the user,
    and prompt the user to select one or more subjects by entering their corresponding numbers.

    Args:
        questions (list): List of question dictionaries, each potentially containing a "subject" key.

    Returns:
        list: List of selected subject names (uppercase strings).
    """
    subjects = sorted(set(q.get("subject", "UNKNOWN").upper() for q in questions))
    print("\nSubjects:\n")
    for i, sub in enumerate(subjects):
        print(f"{i + 1}. {sub}")
    choices = input("\nEnter the numbers corresponding to the desired subjects (comma-separated): ")
    indices = [int(c.strip()) - 1 for c in choices.split(",") if c.strip().isdigit()]
    return [subjects[i] for i in indices if 0 <= i < len(subjects)]


def evaluate_answer_with_lmstudio(user_answer, correct_answer):
    prompt = f"""
You are a National Science Bowl judge. Compare the user's answer with the correct answer, and decide if it is semantically correct. Respond with "YES" or "NO".

User Answer:    {user_answer}
Correct Answer: {correct_answer}

Is the user's answer correct?
"""
    payload = {
        "model": "local-model",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.0,
        "max_tokens": 10,
    }

    try:
        response = requests.post("http://localhost:1234/v1/chat/completions", json=payload)
        response.raise_for_status()
        result = response.json()
        output = result['choices'][0]['message']['content'].strip().upper()
        return "YES" in output
    except Exception as e:
        print(f"[LMStudio ERROR] {e}")
        return input("Could not get answer from model. Is answer correct? [Y/N]: ").strip().upper() == "Y"


def ask_question(n, q):
    """
    Present a single question to the user, read it aloud with TTS, and wait for the user to buzz in.
    Stops the speech upon buzz. Then prompts the user to type an answer and finally asks if the answer
    was correct.

    Args:
        n (int): The index number of the question (for display).
        q (dict): A question dictionary with keys like 'type', 'subject', 'format', 'question', 'answer'.

    Returns:
        tuple:
            - bool: True if the user indicates the answer is correct, False otherwise.
            - float: The reaction time in seconds between question start and buzz.
    """
    print("\n" + "=" * 100)
    print(f"#{n} {q['type']} {q.get('subject','UNKNOWN')} ({q['format']})")
    print("=" * 100 + "\n")
    print(textwrap.fill(q["question"], width=100) + "\n")
    # Speak question and wait for buzz, returns buzz reaction time
    buzz_time = speak_and_interrupt(f"{q['type']} {q.get('subject','UNKNOWN')} ({q['format']}) {q['question']}")   
    answer = input("> ").strip()
    print(f"\nANSWER: {q['answer']}")
    # is_correct = input("> Is answer correct? [Y/N] ").strip().upper() == "Y"
    is_correct = evaluate_answer_with_lmstudio(answer, q['answer'])
    print(f"{'Correct!' if is_correct else 'Incorrect!'}")
    return is_correct, buzz_time



def run_training(questions):
    """
    Runs an unlimited training session where questions are asked until the user presses ESC.

    Returns:
        tuple:
            - int: Total score for the round.
            - list of float: List of reaction times (seconds) for all buzzes.
    """
    score = 0
    reaction_times = []
    print("\nPress ESC to exit training mode.")
    i = 0
    while True:
        if keyboard.is_pressed('esc'):
            break
        question = random.choice(questions)
        is_correct, buzz_time = ask_question(i, question)
        reaction_times.append(buzz_time)
        i += 1
    return score, reaction_times


def run_round(questions):
    """
    Simulates a full round of National Science Bowl questions.

    Returns:
        tuple:
            - int: Total score for the round.
            - list of float: List of reaction times (seconds) for all buzzes.
    """
    score = 0
    reaction_times = []
    correct_tossups = 0
    correct_bonuses = 0      
    # Separate toss-up and bonus questions
    tossups = [q for q in questions if q["type"].upper() == "TOSS-UP"]
    tossups_used = set()
    bonuses = [q for q in questions if q["type"].upper() == "BONUS"]
    bonuses_used = set()

    # Loop for 23 questions (toss-ups + possible bonuses)
    for i in range(23):
        # Select a random unused toss-up question
        t_question = random.choice([q for q in tossups if id(q) not in tossups_used])
        tossups_used.add(id(t_question))
        is_correct, buzz_time = ask_question(i, t_question)
        reaction_times.append(buzz_time)
        if is_correct:
            correct_tossups += 1
        else:
            continue
        # Select a random unused bonus question matching toss-up subject
        b_question = random.choice([q for q in bonuses if id(q) not in bonuses_used and q.get("subject", "").upper() == t_question.get("subject", "").upper()])
        bonuses_used.add(id(b_question))
        is_correct, buzz_time = ask_question(i, b_question)
        reaction_times.append(buzz_time)
        if is_correct:
            correct_bonuses += 1

    # Calculate final score
    score = correct_tossups * 4 + correct_bonuses * 10
    return score, reaction_times


def main():
    """
    Main entry point for the simulation.
    Parses command-line arguments, loads question bank, filters questions by user-selected subjects,
    runs a full round of questions, and then prints the final score and reaction time statistics.
    """
    parser = argparse.ArgumentParser(
        description="""\
Simulate National Science Bowl.
""",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        '-l', '--level',
        choices=['MS', 'HS'],
        required=True,
        help='choose the school level: "MS" for middle school, or "HS" for high school'
    )
    parser.add_argument(
        '-m', '--mode',
        choices=['GAME', 'TRAINING'],
        default='GAME',
        help='choose the mode: "GAME" for competitive mode, or "TRAINING" for practice mode'
    )
    args = parser.parse_args()

    # Determine path to questions file based on level
    qnas_path = f"./{args.level}/{args.level}-Questions.json"
    # Load questions from JSON file
    qnas = []
    try:
        with open(qnas_path, "r") as f:
            qnas = json.load(f)
    except Exception as e:
        print(f"Failed to read {qnas_path}: {e}")    
        sys.exit(1)

    # Ask user to select subject(s) to include
    subjects = set_subjects(qnas)
    # Filter questions to only include selected subjects
    qnas_subj = [q for q in qnas if q.get("subject", "UNKNOWN").upper() in subjects]

    score = 0
    reaction_times = []
    if args.mode == 'GAME':
        score, reaction_times = run_round(qnas_subj)
    else:
        score, reaction_times = run_training(qnas_subj)
    
    # Output final results
    print(f"\n")
    print(f"Score: {score}")
    print(f"Reaction Time - Min: {min(reaction_times):.2f}s, Max: {max(reaction_times):.2f}s, Avg: {sum(reaction_times)/len(reaction_times):.2f}s")

    
if __name__ == "__main__":
    main()
