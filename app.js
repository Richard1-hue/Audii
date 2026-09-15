const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const SYMBOLS = {
"A":"🅰️","B":"🅱️","C":"🌜","D":"🔸","E":"📧","F":"🎏","G":"🌀",
"H":"♓","I":"ℹ️","J":"🎷","K":"🔑","L":"👢","M":"〽️","N":"🎵",
"O":"⭕","P":"🅿️","Q":"❓","R":"®️","S":"💲","T":"✝️","U":"♈",
"V":"♌","W":"〰️","X":"❌","Y":"💴","Z":"⚡"
};

let boardText = "";

function showPanel(name){
  ["translator","camera","alphabet","guide"].forEach(n => {
    $(`#${n}Panel`).classList.toggle("hidden", n !== name);
  });
  $$(".side-link[data-panel]").forEach(b => b.classList.toggle("active", b.dataset.panel === name));
}

function addMessage(text, who="audii"){
  const el = document.createElement("div");
  el.className = `message ${who}`;
  el.textContent = text;
  $("#messages").appendChild(el);
  $("#chat").scrollTop = $("#chat").scrollHeight;
}

function speak(text){
  if(!text || !text.trim()) return;
  if(!("speechSynthesis" in window)){
    alert("Speech synthesis is not available in this browser.");
    return;
  }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = .92;
  u.pitch = 1;
  speechSynthesis.speak(u);
}

async function translateSymbols(){
  const input = $("#symbolInput").value;
  if(!input.trim()) return;
  $("#confidence").textContent = "Translating…";
  try{
    const res = await fetch("/api/translate", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({symbols:input})
    });
    const data = await res.json();
    $("#resultText").textContent = data.text || "No alphabet detected.";
    $("#confidence").textContent = data.text ? "Translated" : "Empty";
  }catch(e){
    $("#confidence").textContent = "Offline";
    $("#resultText").textContent = "Audii could not reach the translator service.";
  }
}

function renderLetters(){
  const grid = $("#letterGrid");
  grid.innerHTML = "";
  Object.entries(SYMBOLS).forEach(([letter,symbol])=>{
    const b = document.createElement("button");
    b.className = "letter";
    b.innerHTML = `<b>${letter}</b><small>${symbol}</small>`;
    b.title = `Add ${letter}`;
    b.onclick = ()=>{
      boardText += letter;
      $("#boardText").textContent = boardText || "Tap letters…";
    };
    grid.appendChild(b);
  });
}

function newChat(){
  $("#messages").innerHTML = "";
  $("#symbolInput").value = "";
  $("#resultText").textContent = "Your translated message will appear here.";
  $("#confidence").textContent = "Ready";
  boardText = "";
  $("#boardText").textContent = "Tap letters…";
  addMessage("New Audii conversation started. Build a message using the alphabet board or symbol translator.", "audii");
}

function openModal(type){
  const content = $("#modalContent");
  if(type === "help"){
    content.innerHTML = `<h2>How to use Audii</h2>
      <p>Use the alphabet board to tap letters, or enter Audii symbols in the translator. Translate the message, then press <b>Speak</b> to make your device read it aloud.</p>
      <br><p><b>Tip:</b> browsers use their own installed voices, so the voice depends on your device and browser.</p>`;
  }else{
    content.innerHTML = `<h2>Audii settings</h2>
      <div class="setting-row"><span>Auto speech after translation</span><input class="switch" id="autoSpeech" type="checkbox"></div>
      <div class="setting-row"><span>Large accessibility controls</span><input class="switch" id="largeMode" type="checkbox"></div>
      <div class="setting-row"><span>Sound on button press</span><input class="switch" id="buttonSound" type="checkbox" checked></div>
      <p style="margin-top:10px">These settings are stored only in this browser.</p>`;
    const saved = JSON.parse(localStorage.getItem("audiiSettings") || "{}");
    ["autoSpeech","largeMode","buttonSound"].forEach(id=>{
      const x = document.getElementById(id);
      if(x) x.checked = saved[id] ?? x.checked;
      x?.addEventListener("change", saveSettings);
    });
  }
  $("#modal").classList.remove("hidden");
}
function saveSettings(){
  const obj = {};
  ["autoSpeech","largeMode","buttonSound"].forEach(id=>{
    const x = document.getElementById(id); if(x) obj[id] = x.checked;
  });
  localStorage.setItem("audiiSettings", JSON.stringify(obj));
  document.body.classList.toggle("large-access", obj.largeMode);
}
function closeModal(){ $("#modal").classList.add("hidden"); }

$("#translateBtn").onclick = async ()=>{
  await translateSymbols();
  const s = JSON.parse(localStorage.getItem("audiiSettings") || "{}");
  if(s.autoSpeech) speak($("#resultText").textContent);
};
$("#clearInput").onclick = ()=>{$("#symbolInput").value="";$("#resultText").textContent="Your translated message will appear here.";$("#confidence").textContent="Ready"};
$("#speakResult").onclick = ()=>speak($("#resultText").textContent);
$("#copyResult").onclick = async ()=>{
  const t=$("#resultText").textContent;
  if(t && t !== "Your translated message will appear here.") await navigator.clipboard.writeText(t);
};
$("#sendResult").onclick = ()=>{
  const t=$("#resultText").textContent;
  if(t && !t.startsWith("Your translated")) { addMessage(t,"user"); addMessage("I can read that as: “"+t+"”. You can press Speak to make Audii voice it.","audii"); }
};
$("#clearBoard").onclick = ()=>{boardText="";$("#boardText").textContent="Tap letters…"};
$("#speakBoard").onclick = ()=>speak(boardText);
$("#sendBoard").onclick = ()=>{if(boardText){addMessage(boardText,"user");addMessage("Message received. Audii has converted your selected letters into readable text.","audii")}};

$("#newChat").onclick = newChat;
$("#topNewChat").onclick = newChat;
$("#helpBtn").onclick = ()=>openModal("help");
$("#topHelp").onclick = ()=>openModal("help");
$("#settingsBtn").onclick = ()=>openModal("settings");
$("#topSettings").onclick = ()=>openModal("settings");
$("#modalClose").onclick = closeModal;
$("#modal").addEventListener("click",e=>{if(e.target.id==="modal")closeModal()});

$("#openNav").onclick = ()=>$("#sidebar").classList.remove("closed");
$("#closeNav").onclick = ()=>$("#sidebar").classList.add("closed");

$$(".side-link[data-panel]").forEach(b=>b.onclick=()=>showPanel(b.dataset.panel));
$$(".quick-card").forEach(b=>b.onclick=()=>{
  if(b.dataset.action==="speech") speak($("#resultText").textContent);
  else showPanel(b.dataset.action);
});

$("#symbolInput").addEventListener("input", ()=>{
  // Live preview for an intentionally simple local symbol layer.
  const raw=$("#symbolInput").value;
  let out=raw;
  Object.entries(SYMBOLS).sort((a,b)=>b[1].length-a[1].length).forEach(([letter,symbol])=>{
    out=out.split(symbol).join(letter);
  });
  if(out !== raw) {
    $("#resultText").textContent = out.replace(/\s+/g," ").trim();
    $("#confidence").textContent = "Live preview";
  }
});

renderLetters();
addMessage("Hello. I’m Audii. Build your message and I’ll help turn it into readable text and speech.", "audii");

// -------------------- Camera sign mode --------------------
let cameraStream = null;
let cameraEngine = null;
let cameraRunning = false;
let lastDetected = "?";
let lastConfidence = 0;
let lastSent = 0;
let cameraMuted = false;
let cameraTranscript = "";
let lastSpokenLetter = "";
let lastAcceptedAt = 0;
let wordSpeakTimer = null;

// Tunable thresholds. A letter must be recognized consistently before speech.
const SPEECH_CONFIDENCE = 0.82;
const LETTER_COOLDOWN_MS = 950;
const WORD_PAUSE_MS = 1500;

function cameraSpeechEnabled(){
  return !cameraMuted && ("speechSynthesis" in window);
}

function speakCamera(text){
  if(!cameraSpeechEnabled() || !text || !text.trim()) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.88;
  u.pitch = 1;
  u.volume = 1;
  speechSynthesis.speak(u);
}

function scheduleWordSpeech(){
  clearTimeout(wordSpeakTimer);
  if(!cameraSpeechEnabled() || !cameraTranscript.trim()) return;

  wordSpeakTimer = setTimeout(()=>{
    if(cameraSpeechEnabled() && cameraTranscript.trim()){
      speakCamera(cameraTranscript);
    }
  }, WORD_PAUSE_MS);
}

function acceptCameraLetter(letter, confidence){
  if(!letter || letter === "?" || confidence < SPEECH_CONFIDENCE) return;

  const now = Date.now();

  // Require a short cooldown so one held hand shape does not become
  // "LLLLLLLL" while the signer is holding a pose.
  if(letter === lastSpokenLetter && now - lastAcceptedAt < LETTER_COOLDOWN_MS){
    return;
  }

  // If the signer changes to another recognized letter, accept it.
  lastSpokenLetter = letter;
  lastAcceptedAt = now;

  cameraTranscript += letter;
  $("#cameraTranscript").textContent = cameraTranscript;

  // Speak each confidently detected letter immediately.
  speakCamera(letter);

  // Then, if signing pauses, speak the complete assembled word.
  scheduleWordSpeech();
}

function initCameraMode(){
  const video = $("#cameraVideo");
  const canvas = $("#cameraCanvas");
  if(!video || !canvas) return;

  const ctx = canvas.getContext("2d");

  if(typeof Hands === "undefined"){
    $("#cameraStatus").textContent = "LIBRARY ERROR";
    return;
  }

  const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.65,
    minTrackingConfidence: 0.65
  });

  hands.onResults(async (results)=>{
    if(!cameraRunning) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if(results.multiHandLandmarks && results.multiHandLandmarks.length){
      const landmarks = results.multiHandLandmarks[0];

      drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {lineWidth:3});
      drawLandmarks(ctx, landmarks, {lineWidth:1, radius:3});

      // Avoid flooding Flask: recognize at most ~5 times/sec.
      const now = Date.now();
      if(now - lastSent > 200){
        lastSent = now;

        try{
          const response = await fetch("/api/recognize", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({
              landmarks: landmarks.map(p=>({x:p.x,y:p.y,z:p.z}))
            })
          });

          const data = await response.json();

          lastDetected = data.letter || "?";
          lastConfidence = Number(data.confidence || 0);

          $("#detectedLetter").textContent =
            lastDetected === "?" ? "—" : lastDetected;

          $("#detectedConfidence").textContent =
            lastDetected === "?" ? "—" : Math.round(lastConfidence*100)+"%";

          if(lastDetected !== "?" && lastConfidence >= SPEECH_CONFIDENCE){
            $("#cameraStatus").textContent =
              cameraMuted ? "DETECTING · MUTED" : "DETECTING · VOICE";
            acceptCameraLetter(lastDetected, lastConfidence);
          }else{
            $("#cameraStatus").textContent =
              cameraMuted ? "READY · MUTED" : "READY";
          }

        }catch(err){
          $("#cameraStatus").textContent = "SERVER ERROR";
        }
      }
    }else{
      $("#detectedLetter").textContent = "—";
      $("#detectedConfidence").textContent = "—";
      $("#cameraStatus").textContent =
        cameraMuted ? "NO HAND · MUTED" : "NO HAND";
    }
  });

  cameraEngine = new Camera(video, {
    onFrame: async () => {
      if(cameraRunning) await hands.send({image: video});
    },
    width: 960,
    height: 540
  });

  $("#startCamera").onclick = async ()=>{
    try{
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video:{
          facingMode:"user",
          width:{ideal:960},
          height:{ideal:540}
        },
        audio:false
      });

      video.srcObject = cameraStream;
      await video.play();

      cameraRunning = true;
      $("#cameraPlaceholder").style.display = "none";
      $("#cameraStatus").textContent =
        cameraMuted ? "STARTING · MUTED" : "STARTING";
      cameraEngine.start();

    }catch(err){
      $("#cameraStatus").textContent = "BLOCKED";
      alert("Audii needs camera permission. Please allow camera access in your browser and try again.");
    }
  };

  $("#stopCamera").onclick = stopCamera;

  $("#addDetected").onclick = ()=>{
    if(lastDetected !== "?" && lastDetected){
      acceptCameraLetter(lastDetected, lastConfidence);

      // This button also puts the current detected letter into chat.
      if(lastConfidence >= SPEECH_CONFIDENCE){
        addMessage(lastDetected, "user");
      }
    }
  };

  $("#speakWord").onclick = ()=>{
    if(cameraTranscript.trim()) speakCamera(cameraTranscript);
  };

  $("#clearCameraText").onclick = ()=>{
    clearTimeout(wordSpeakTimer);
    cameraTranscript = "";
    lastSpokenLetter = "";
    lastAcceptedAt = 0;
    $("#cameraTranscript").textContent = "—";
    speechSynthesis?.cancel();
  };

  $("#cameraMute").onclick = ()=>{
    cameraMuted = !cameraMuted;

    const button = $("#cameraMute");
    button.setAttribute("aria-pressed", String(cameraMuted));

    if(cameraMuted){
      button.textContent = "🔇 Voice muted";
      button.classList.add("voice-muted");
      speechSynthesis?.cancel();
      clearTimeout(wordSpeakTimer);
      $("#cameraStatus").textContent = cameraRunning ? "DETECTING · MUTED" : "OFF · MUTED";
    }else{
      button.textContent = "🔊 Voice on";
      button.classList.remove("voice-muted");
      $("#cameraStatus").textContent = cameraRunning ? "DETECTING · VOICE" : "OFF";
    }
  };
}

function stopCamera(){
  cameraRunning = false;

  if(cameraStream){
    cameraStream.getTracks().forEach(track=>track.stop());
    cameraStream = null;
  }

  const video = $("#cameraVideo");
  if(video) video.srcObject = null;

  $("#cameraPlaceholder").style.display = "flex";
  $("#cameraStatus").textContent =
    cameraMuted ? "OFF · MUTED" : "OFF";

  $("#detectedLetter").textContent = "—";
  $("#detectedConfidence").textContent = "—";

  clearTimeout(wordSpeakTimer);
}

initCameraMode();
