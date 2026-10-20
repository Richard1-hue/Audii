# Audii

**Audii** is a free, installation-free web app that helps deaf and hearing people communicate using the **American Sign Language (ASL) manual alphabet**.

- **Hearing → deaf:** type a message and Audii shows it letter by letter as real fingerspelling signs.
- **Deaf → hearing:** tap signs on the sign keyboard, or sign to your camera. Audii turns them into text and can speak them aloud.

Live demo: `https://YOUR-PROJECT.pages.dev` *(replace after deploying)*

---

## Features

| Feature | What it does |
| --- | --- |
| Translate chat | Type text and get it back as a strip of real ASL letter signs, with icon buttons to speak aloud, replay slowly (timer) and copy |
| Voice mode | Speak, and Audii writes what you said and turns it into signs. A 3D robot reacts with facial expressions (happy, curious, sad, in love, surprised, waving goodbye) |
| 3D logo | A blue 3D ball with a real ear and pulsing sound vibrations, shown large on the opening splash |
| Quick messages | One-tap phrases such as Good morning and Hello on the first page |
| Sign keyboard | Tap real ASL handshapes (A–Z) to build a message, with Space and Delete |
| Camera mode | Choose the built-in, back or any USB webcam from a dropdown (press Find cameras to list them all). Tracks one hand in your browser and recognises A, B, I, L, U, V, W and Y |
| Voice | Speaks each accepted letter, then the whole word after about 1.5 seconds of silence. A 950 ms cooldown stops a held sign repeating |
| Alphabet guide | All 26 signs as 3D, ghost-like floating cards. Tap one to hear the letter. J and Z are marked as moving letters |
| Settings | Dark or light theme, text size, speech speed, camera confidence and voice language, saved in your browser |
| Responsive | Collapsible sidebar, works on phones, tablets and desktops |

## Privacy

Camera mode uses [MediaPipe Hands](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker) to find 21 hand landmarks **inside your browser**. Video frames are never uploaded. Voice mode uses your browser's built-in speech recognition, which in Chrome and Edge may send audio to the browser vendor's servers. Audii itself has no backend, no accounts and no tracking. Settings are stored only in your browser's localStorage.

## Project structure

```
audii/
├── index.html   ← the whole app (HTML, CSS, JavaScript and the 26 sign images)
└── README.md
```

Audii is a single static file, so there is nothing to install or build.

## Deploy with no downloads

1. **GitHub:** create a repository named `audii`, choose **Add file → Upload files**, upload `index.html` and `README.md`, then commit.
2. **Cloudflare Pages:** go to **Workers & Pages → Create → Pages → Connect to Git**, pick the `audii` repository, set the framework to **None**, leave the build command empty, set the output directory to `/`, and click **Deploy**.
3. Open your `*.pages.dev` link and allow camera access. The camera needs HTTPS, which Cloudflare provides automatically.

Every commit to GitHub redeploys the site automatically. To edit without installing anything, open your repository and press the `.` key to launch the browser editor.

## How recognition works

```
camera → MediaPipe hand landmarks (21 points) → rule-based classifier → letter → text → speech
```

The starter classifier checks which fingers are extended and how far apart they are, normalised by palm size. It currently supports **A, B, I, L, U, V, W, Y**. It is a starting point, not a finished product.

## Known limitations

- **J and Z** are motion letters. They appear in the guide and the sign keyboard, but the camera cannot recognise them yet.
- Many letters (for example M, N, S, T, E) differ only by subtle thumb and finger positions, so rules alone are unreliable for them.
- Signers, hand sizes, lighting and camera angles vary a lot, and the starter rules were not evaluated across them.
- Audii covers **fingerspelling only**. It does not translate full ASL, which has its own grammar, facial expressions and vocabulary.
- Audii uses **ASL**. Other sign languages, including Rwandan Sign Language, use different signs and need their own data.
- Voice mode works best in Chrome, Edge and Safari, and is not available in Firefox. Kinyarwanda recognition depends on browser support.
- The camera libraries load from jsDelivr, so camera mode needs an internet connection unless you self-host them.

## Roadmap

- [ ] Train a landmark-based classifier for all static letters (for example on Hugging Face Spaces, called from the page)
- [ ] Add recognition for the moving letters J and Z using hand-motion tracking
- [ ] Add common words and phrases beyond fingerspelling
- [ ] Add support for Rwandan Sign Language with input from the local Deaf community
- [ ] Add a practice mode with scoring
- [ ] Make the app installable offline (PWA)
- [ ] Test with Deaf signers and incorporate their feedback

## Credits

- Built by **Ituze Richard**. © 2026 Audii. All rights reserved.
- Sign illustrations are cropped from an ASL alphabet chart. Replace them with images you have the licence to use before any public release.
- Hand tracking by Google MediaPipe.

## Disclaimer

Audii is a learning and communication prototype. It is not a certified interpreting tool, so do not rely on it for medical, legal or emergency communication.
