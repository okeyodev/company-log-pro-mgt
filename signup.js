/* AVENIR Signup — Vanilla JS
   Premium multi-stage flow. No framework.
*/

const state = {
  currentStep: 1,
  totalSteps: 4,
  intent: null,
  interests: new Set(),
  data: {
    fullName: "",
    email: "",
    password: "",
    country: "",
    city: "",
  }
};

const el = {
  form: document.getElementById("signupForm"),
  steps: [...document.querySelectorAll(".step")],
  progressFill: document.getElementById("progressFill"),
  stepNum: document.getElementById("stepNum"),
  stepLabel: document.getElementById("stepLabel"),
  formTitle: document.getElementById("formTitle"),
  formSub: document.getElementById("formSub"),
  primaryBtn: document.getElementById("primaryBtn"),
  backBtn: document.getElementById("backBtn"),
  railProgress: document.getElementById("railProgress"),
  successState: document.getElementById("successState"),
  formShell: document.getElementById("formShell"),
};

const stepConfig = {
  1: { label: "ACCOUNT", title: "Create your account", sub: "Begin building your position in institutional-grade assets. This takes 90 seconds.", cta: "Continue" },
  2: { label: "INTENT", title: "How will you use Avenir?", sub: "Define your primary objective to tailor reporting and deal flow.", cta: "Continue" },
  3: { label: "FOCUS & LOCATION", title: "Personalize your market", sub: "Select focus areas and base location. You can modify this in portfolio settings.", cta: "Continue" },
  4: { label: "CONFIRMATION", title: "Review and create", sub: "Confirm your details. No capital is moved at registration.", cta: "Create account" },
};

// ---------- Validation ----------
function validateEmail(email){
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return re.test(email.trim().toLowerCase());
}

function validatePassword(pw){
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
    score: [pw.length>=8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length
  };
}

function showError(fieldName, msg){
  const field = document.querySelector(`[data-field="${fieldName}"]`);
  if(!field) {
    const custom = document.getElementById(`${fieldName}-error`);
    if(custom){ custom.textContent = msg; custom.classList.add("is-visible"); }
    return;
  }
  const wrap = field.querySelector(".input-wrap");
  const err = field.querySelector(".error") || document.getElementById(`${fieldName}-error`);
  if(wrap){ wrap.classList.remove("has-success"); wrap.classList.add("has-error"); }
  if(err){ err.textContent = msg; err.classList.add("is-visible"); }
  const input = field.querySelector("input, select");
  if(input) input.setAttribute("aria-invalid", "true");
}

function clearError(fieldName){
  const field = document.querySelector(`[data-field="${fieldName}"]`);
  if(!field){
    const custom = document.getElementById(`${fieldName}-error`);
    if(custom){ custom.textContent=""; custom.classList.remove("is-visible"); }
    return;
  }
  const wrap = field.querySelector(".input-wrap");
  const err = field.querySelector(".error");
  if(wrap){ wrap.classList.remove("has-error"); }
  if(err){ err.textContent=""; err.classList.remove("is-visible"); }
  const input = field.querySelector("input, select");
  if(input) input.removeAttribute("aria-invalid");
}

function markSuccess(fieldName){
  const field = document.querySelector(`[data-field="${fieldName}"]`);
  if(!field) return;
  const wrap = field.querySelector(".input-wrap");
  if(wrap && !wrap.classList.contains("has-error")) wrap.classList.add("has-success");
}

// ---------- Password strength ----------
function updatePasswordStrength(){
  const pw = document.getElementById("password").value;
  const result = validatePassword(pw);
  const bars = document.querySelector(".pw-bars");
  const label = document.getElementById("pwLabel");
  const rules = document.querySelectorAll(".pw-rules li");

  if(bars){
    bars.dataset.score = result.score;
    if(pw.length===0) bars.removeAttribute("data-score");
  }
  if(label){
    const map = {0:"STRENGTH —",1:"WEAK",2:"FAIR",3:"STRONG",4:"SECURE"};
    label.textContent = `STRENGTH · ${map[result.score] || "—"}`;
    label.style.color = result.score>=3 ? "var(--ok)" : result.score>=2 ? "#8FAE5A" : pw.length? "var(--error)" : "var(--text-light-faint)";
  }
  rules.forEach(li=>{
    const r = li.dataset.rule;
    li.classList.toggle("is-met", !!result[r]);
  });

  return result;
}

// ---------- Progress ----------
function updateProgress(){
  const pct = (state.currentStep / state.totalSteps) * 100;
  el.progressFill.style.width = pct + "%";
  el.stepNum.textContent = String(state.currentStep).padStart(2,"0") + " / 0" + state.totalSteps;
  const cfg = stepConfig[state.currentStep];
  el.stepLabel.textContent = cfg.label;
  el.formTitle.textContent = cfg.title;
  el.formSub.textContent = cfg.sub;
  el.primaryBtn.querySelector(".btn-label").textContent = cfg.cta;
  el.backBtn.hidden = state.currentStep===1;
  // rail
  if(el.railProgress){
    el.railProgress.style.height = (pct * 1.05) + "%";
  }
  // flow nodes
  document.querySelectorAll(".f-node").forEach((n,i)=>{
    n.classList.toggle("active", i < state.currentStep);
  });
}

function goToStep(n){
  if(n<1 || n>state.totalSteps) return;
  state.currentStep = n;
  el.steps.forEach(s=>{
    const isActive = Number(s.dataset.step)===n;
    s.classList.toggle("is-active", isActive);
    if(isActive){
      s.querySelectorAll("input, select, button").forEach(el=> el.tabIndex = 0);
    }
  });
  updateProgress();
  // focus first field
  const active = document.querySelector(`.step[data-step="${n}"]`);
  const firstInput = active?.querySelector("input, select, [data-intent]");
  if(firstInput) firstInput.focus({preventScroll:true});
  window.scrollTo({top:0, behavior:"smooth"});
}

function goToNextStep(){
  if(!validateStep(state.currentStep)) return;
  if(state.currentStep===state.totalSteps){
    handleSignup();
    return;
  }
  goToStep(state.currentStep+1);
  if(state.currentStep===4) populateReview();
}

function goToPreviousStep(){
  if(state.currentStep>1) goToStep(state.currentStep-1);
}

// ---------- Step validation ----------
function validateStep(step){
  let ok = true;

  if(step===1){
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const pw = document.getElementById("password").value;
    const confirm = document.getElementById("confirmPassword").value;

    // fullName
    if(fullName.length < 2){
      showError("fullName","Enter your full name");
      ok=false;
    } else { clearError("fullName"); markSuccess("fullName"); state.data.fullName = fullName; }

    if(!validateEmail(email)){
      showError("email","Enter a valid work email");
      ok=false;
    } else { clearError("email"); markSuccess("email"); state.data.email = email; }

    const pwRes = validatePassword(pw);
    if(pwRes.score < 3){
      showError("password","Password does not meet requirements");
      ok=false;
    } else { clearError("password"); markSuccess("password"); state.data.password = pw; }

    if(confirm !== pw || confirm.length===0){
      showError("confirmPassword","Passwords do not match");
      ok=false;
    } else { clearError("confirmPassword"); markSuccess("confirmPassword"); }
  }

  if(step===2){
    const err = document.getElementById("intent-error");
    if(!state.intent){
      err.textContent = "Select how you plan to use Avenir";
      err.classList.add("is-visible");
      ok=false;
    } else {
      err.textContent=""; err.classList.remove("is-visible");
    }
  }

  if(step===3){
    const country = document.getElementById("country").value;
    const city = document.getElementById("city").value.trim();
    if(!country){
      showError("country","Select a country"); ok=false;
    } else { clearError("country"); state.data.country = country; }
    if(city.length < 2){
      showError("city","Enter your city"); ok=false;
    } else { clearError("city"); state.data.city = city; }
  }

  if(step===4){
    const terms = document.getElementById("terms").checked;
    const privacy = document.getElementById("privacy").checked;
    const err = document.getElementById("consent-error");
    if(!terms || !privacy){
      err.textContent = "You must accept the Terms and Privacy Policy to continue";
      err.classList.add("is-visible");
      ok=false;
    } else { err.textContent=""; err.classList.remove("is-visible"); }
  }

  return ok;
}

function populateReview(){
  document.getElementById("reviewEmail").textContent = state.data.email || "—";
  const intentMap = {invest:"Invest in Assets", buy:"Buy an Asset", both:"Invest & Buy", explore:"Explore Opportunities"};
  document.getElementById("reviewIntent").textContent = intentMap[state.intent] || "—";
  document.getElementById("reviewInterests").textContent = state.interests.size ? [...state.interests].map(s=> s.charAt(0).toUpperCase()+s.slice(1)).join(", ") : "Generalist";
  const countryEl = document.getElementById("country");
  const countryText = countryEl.options[countryEl.selectedIndex]?.text || "";
  document.getElementById("reviewLocation").textContent = countryText && state.data.city ? `${state.data.city}, ${countryText}` : "—";
}

// ---------- Handlers ----------
function selectIntent(target){
  state.intent = target.dataset.intent;
  document.querySelectorAll(".choice-card").forEach(c=>{
    const sel = c===target;
    c.classList.toggle("is-selected", sel);
    c.setAttribute("aria-checked", sel ? "true" : "false");
  });
  document.getElementById("intent-error").textContent="";
  document.getElementById("intent-error").classList.remove("is-visible");
}

function toggleInterest(btn){
  const key = btn.dataset.interest;
  const isSel = btn.classList.contains("is-selected");
  if(isSel){
    btn.classList.remove("is-selected");
    state.interests.delete(key);
  } else {
    btn.classList.add("is-selected");
    state.interests.add(key);
    btn.animate([{transform:"scale(0.98)"},{transform:"scale(1)"}],{duration:220, easing:"cubic-bezier(.34,1.56,.64,1)"});
  }
}

async function handleSignup(){
  if(!validateStep(4)) return;
  const btn = el.primaryBtn;
  btn.disabled = true;
  btn.classList.add("is-loading");
  btn.querySelector(".btn-label").textContent = "Provisioning workspace";

  // simulate async provisioning
  await new Promise(r=> setTimeout(r, 1400));

  // success
  btn.classList.remove("is-loading");
  btn.disabled = false;

  // generate id
  const id = "AV-" + Math.floor(100000 + Math.random()*900000);
  document.getElementById("successId").textContent = id;
  const focusText = state.interests.size ? [...state.interests].slice(0,2).join(" & ") : (state.intent || "your selection");
  document.getElementById("successFocus").textContent = focusText;

  el.formShell.hidden = true;
  el.successState.hidden = false;
  el.successState.style.display = "flex";

  // small confetti of rail
  if(el.railProgress) el.railProgress.style.height = "100%";

  // store demo data
  try{
    localStorage.setItem("avenir_demo", JSON.stringify({...state.data, intent: state.intent, interests:[...state.interests], id, createdAt: new Date().toISOString()}));
  }catch(e){}
}

// ---------- Events ----------
document.addEventListener("DOMContentLoaded", ()=>{
  updateProgress();

  // input live validation
  const fullName = document.getElementById("fullName");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");
  const country = document.getElementById("country");
  const city = document.getElementById("city");

  fullName?.addEventListener("blur", ()=>{
    if(fullName.value.trim().length>=2){ clearError("fullName"); markSuccess("fullName"); }
  });
  fullName?.addEventListener("input", ()=> clearError("fullName"));

  email?.addEventListener("blur", ()=>{
    if(validateEmail(email.value)){ clearError("email"); markSuccess("email"); }
  });
  email?.addEventListener("input", ()=> clearError("email"));

  password?.addEventListener("input", ()=>{
    updatePasswordStrength();
    clearError("password");
    if(confirmPassword.value) {
      if(confirmPassword.value===password.value){ clearError("confirmPassword"); }
      else { /* keep */ }
    }
  });

  confirmPassword?.addEventListener("input", ()=>{
    if(confirmPassword.value===password.value && confirmPassword.value.length>0){
      clearError("confirmPassword"); markSuccess("confirmPassword");
    } else {
      document.querySelector(`[data-field="confirmPassword"] .input-wrap`)?.classList.remove("has-success");
    }
  });

  country?.addEventListener("change", ()=> clearError("country"));
  city?.addEventListener("input", ()=> clearError("city"));

  // toggle password
  document.querySelectorAll(".toggle-pass").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      if(!input) return;
      const isText = input.type==="text";
      input.type = isText ? "password" : "text";
      btn.setAttribute("aria-label", isText ? "Show password" : "Hide password");
      btn.style.color = isText ? "" : "var(--text-light)";
    });
  });

  // intent selection
  document.querySelectorAll(".choice-card").forEach(card=>{
    card.addEventListener("click", ()=> selectIntent(card));
    card.addEventListener("keydown", (e)=>{
      if(e.key==="Enter" || e.key===" "){ e.preventDefault(); selectIntent(card); }
    });
  });

  // interests
  document.querySelectorAll(".interest-chip").forEach(chip=>{
    chip.addEventListener("click", ()=> toggleInterest(chip));
  });

  // form submit
  el.form.addEventListener("submit", (e)=>{
    e.preventDefault();
    goToNextStep();
  });

  el.backBtn.addEventListener("click", goToPreviousStep);

  // Google demo
  document.getElementById("googleBtn")?.addEventListener("click", ()=>{
    const btn = document.getElementById("googleBtn");
    btn.textContent = "Connecting…";
    setTimeout(()=>{
      // prefill
      document.getElementById("fullName").value = "Alex Morgan";
      document.getElementById("email").value = "alex.morgan@firm.com";
      state.data.fullName = "Alex Morgan";
      state.data.email = "alex.morgan@firm.com";
      markSuccess("fullName"); markSuccess("email");
      btn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"/><path fill="#FBBC05" d="M5.84 14.09A6.995 6.995 0 0 1 5.48 12c0-.72.13-1.42.36-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84Z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"/></svg> Continue with Google`;
      if(state.currentStep===1) goToNextStep();
    }, 700);
  });

  document.getElementById("continueBtn")?.addEventListener("click", ()=>{
    // demo transition
    const btn = document.getElementById("continueBtn");
    btn.classList.add("is-loading");
    btn.querySelector(".btn-label").textContent = "Opening platform";
    setTimeout(()=>{ window.location.href = "login.html"; }, 1200);
  });

  // cursor parallax for isometric field
  const isoField = document.getElementById("isoField");
  const visualPanel = document.querySelector(".visual-panel");
  if(visualPanel && isoField && !window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    let raf = null;
    let mouseX=0, mouseY=0;
    visualPanel.addEventListener("mousemove", (e)=>{
      const rect = visualPanel.getBoundingClientRect();
      mouseX = (e.clientX - rect.left)/rect.width - 0.5;
      mouseY = (e.clientY - rect.top)/rect.height - 0.5;
      if(!raf){
        raf = requestAnimationFrame(()=>{
          isoField.style.transform = `perspective(1000px) rotateX(${18+mouseY* -6}deg) rotateY(${-8+mouseX*10}deg) translate(${mouseX*12}px, ${mouseY*8}px)`;
          const grid = document.querySelector(".grid-layer");
          if(grid) grid.style.transform = `perspective(800px) rotateX(${22+mouseY* -2}deg) translateY(-10%) translate(${mouseX*10}px, ${mouseY*6}px)`;
          raf=null;
        });
      }
    });
    visualPanel.addEventListener("mouseleave", ()=>{
      isoField.style.transform = "";
      const grid = document.querySelector(".grid-layer");
      if(grid) grid.style.transform = "";
    });
  }

  // keyboard: Enter on steps handled via form submit, but also handle cmd+Enter fast path
  document.addEventListener("keydown", (e)=>{
    if((e.metaKey||e.ctrlKey) && e.key==="Enter"){
      goToNextStep();
    }
  });
});
