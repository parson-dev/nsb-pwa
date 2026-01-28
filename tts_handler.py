from multiprocessing import Process

import pyttsx3
import time

def speak(text):
    """
    Initialize the pyttsx3 engine and speak the given text aloud.
    This function runs in a separate process to allow concurrent input.
    """
    engine = pyttsx3.init()
    engine.say(text)
    engine.runAndWait()

def speak_and_interrupt(text):
    """
    Speaks the given text in a separate process and waits for the user to 'buzz' in by pressing Enter.
    Measures and returns the reaction time between speech start and buzz.
    Terminates the speech as soon as the buzz is detected.
    """
    # Start speaking the text asynchronously in a separate process
    p = Process(target=speak, args=(text,))
    p.start()
    # Start timer to measure buzz reaction time
    start = time.time()
    # Prompt user to press Enter to buzz (blocks until Enter is pressed)
    input("[Press ENTER to BUZZ]")
    # Calculate the time elapsed until buzz
    buzz_time = time.time() - start
    print(f"Buzzed in {buzz_time:.2f} seconds!\n")

    # Terminate the speech process if it is still running
    if p.is_alive():
        p.terminate()
    p.join()

    return buzz_time
