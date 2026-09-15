# Audii

Audii is a Flask + HTML/CSS/JavaScript prototype for accessible deaf/hearing communication.

## Run it

1. Install Python 3.10+.
2. Open a terminal in this folder.
3. Install Flask:

   pip install flask

4. Start Audii:

   python app.py

5. Open the local address shown by Flask, normally:
   http://127.0.0.1:5000

## What works

- ChatGPT-style single-page interface
- Collapsible navigation
- New chat
- Settings modal saved in localStorage
- Help modal
- A-Z interactive alphabet board
- Symbol → alphabet translation endpoint in Python
- Copy translated text
- Browser text-to-speech
- Responsive/mobile layout
- Dark blue/black visual system
- Footer credit to Ituze Richard

## Important engineering note

This prototype's symbols are a software-friendly input layer. They are NOT a claim that the emoji/symbols themselves are official sign-language handshapes.

For a production Audii that understands real signed communication, add a camera pipeline such as:

camera → hand/pose landmark detection → sign-language classification model → Python API → translated text → speech.

The classifier must be trained/evaluated for the specific sign language being supported (for example ASL, RSL, or another regional language), rather than assuming one universal set of signs.


## Camera mode

Audii now includes a browser camera mode using MediaPipe Hands. The browser:
1. Requests webcam permission.
2. Detects a single hand and extracts 21 hand landmarks.
3. Draws the tracked hand on the video.
4. Sends landmark coordinates (not camera frames) to `/api/recognize`.
5. The Python endpoint applies a small starter heuristic for A, B, I, L, V and Y.
6. Recognized letters can be added to the camera transcript and chat.

The MediaPipe JavaScript libraries are loaded from jsDelivr, so an internet connection is required for the camera model unless you self-host those assets.

The starter classifier is deliberately limited. Real sign-language recognition should use a trained model and should be evaluated for the target sign language, signer variation, handedness, lighting, camera angle, and continuous signing.


### Camera voice behavior

Camera mode now supports browser text-to-speech:
- Each newly accepted sign letter at >=82% confidence is spoken immediately.
- A held pose is protected by a ~950 ms letter cooldown to reduce repeated speech.
- After ~1.5 seconds without another accepted letter, Audii speaks the assembled camera transcript.
- The **Voice on / Voice muted** toggle can silence all automatic camera speech.
- **Speak word** manually speaks the current assembled transcript.
