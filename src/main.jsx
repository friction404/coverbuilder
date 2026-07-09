import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const quoteDefaults = {
  dob: "01/01/1985",
  gender: "Male",
  smoker: "No",
  occupation: "Accountant - University qualified",
  income: "120000",
  firstName: "Alex",
  lastName: "Taylor",
  phone: "0491 570 015",
  email: "alex.taylor@example.com",
  postcode: "2000"
};

const assistantPrompts = ["why is this information important?", "how should I answer?", "what happens next?"];

const quoteStepTitles = {
  quote1: "Your Details",
  quote2: "Contact Details",
  select: "Select Cover",
  benefits: "Review Benefits"
};

const frictionThresholds = {
  lowMax: 30,
  mediumMax: 80
};

const navGroups = [
  { key: "quote", label: "Quote", steps: ["Your Details", "Contact Details", "Select Cover", "Review Benefits"] },
  {
    key: "application",
    label: "Your Application",
    steps: [
      "Introduction",
      "Duty to take reasonable care",
      "Your Personal Details",
      "Your Employment & Income",
      "Your Occupation",
      "Your Insurance History",
      "Your Health and Lifestyle",
      "Review",
      "Medical Consent Authority",
      "Payment and Declarations",
      "Application Submission"
    ]
  }
];

const appSections = [
  {
    id: "intro",
    nav: "Introduction",
    title: "Let's start your application",
    kind: "intro",
    copy: [
      "We need to ask you questions about your medical history, lifestyle and occupation. Your answers help us provide the right cover for you.",
      "You can save and return to your application. It usually takes 20-30 minutes."
    ],
    checklist: ["Income details", "Health and medical history", "Credit card or personal/business bank details"]
  },
  {
    id: "duty",
    nav: "Duty to take reasonable care",
    title: "Duty to take reasonable care",
    kind: "duty",
    copy: [
      "Before you enter into an insurance contract with us, you have a legal duty to take reasonable care not to make a misrepresentation.",
      "This means you must answer our questions fully, accurately and truthfully. If you are unsure whether something is relevant, include it or ask us for help.",
      "You should consider your circumstances before applying, including whether you are waiting for surgery, treatment, medical appointments or test results."
    ],
    questions: [{ id: "agreeDuty", label: "I agree to the duty to take reasonable care.", type: "checkbox" }]
  },
  {
    id: "personal",
    nav: "Your Personal Details",
    title: "Your Personal Details",
    meta: "1 sections",
    questions: [
      { id: "title", label: "Title", type: "select", options: ["Mr", "Mrs", "Ms", "Miss", "Dr"] },
      { id: "firstName", label: "First name", type: "text", value: "Alex" },
      { id: "lastName", label: "Last name", type: "text", value: "Taylor" },
      { id: "dobLocked", label: "Date of birth", type: "locked", value: "01/01/1985" },
      { id: "genderLocked", label: "Gender", type: "locked", value: "Male" },
      { id: "mobile", label: "Mobile phone number", type: "text", value: "0491 570 015" },
      { id: "email", label: "Email address", type: "text", value: "alex.taylor@example.com" },
      { id: "address1", label: "Address Line 1", type: "text", value: "123 Demo St" },
      { id: "address2", label: "Address Line 2", type: "text", value: "Unit 1" },
      { id: "suburb", label: "Suburb", type: "text", value: "Sydney" },
      { id: "state", label: "State", type: "select", options: ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "ACT", "NT"] },
      { id: "postcode", label: "Postcode", type: "text", value: "2000" }
    ]
  },
  {
    id: "income",
    nav: "Your Employment & Income",
    title: "Your Employment & Income",
    meta: "1 sections",
    questions: [
      { id: "incomeExSuper", label: "Annual earned income (excluding employer superannuation contribution amount)", type: "money", value: "120000" },
      { id: "superAmount", label: "Employer superannuation contribution amount", type: "money", value: "12000" },
      { id: "incomeIncSuper", label: "Annual earned income (including employer superannuation contribution amount)", type: "calculated", value: "$ 132,000" }
    ]
  },
  {
    id: "occupation",
    nav: "Your Occupation",
    title: "Your Occupation",
    meta: "2 sections",
    questions: [
      { id: "occ", label: "What is your current occupation?", type: "text", value: "Accountant - University qualified" },
      { id: "hours", label: "How many hours per week do you usually work?", type: "number", value: "38" },
      { id: "duties", label: "Which of the following best describes your work duties?", type: "radio", options: ["Mostly office duties", "Some manual work", "Mostly manual work", "Heavy manual or hazardous work"] },
      { id: "selfEmployed", label: "Are you self-employed?", type: "radio", options: ["No", "Yes"] },
      { id: "hazard", label: "Do you work at heights, underground, offshore, with explosives, aviation, diving or in any other hazardous environment?", type: "radio", options: ["No", "Yes"] }
    ]
  },
  {
    id: "history",
    nav: "Your Insurance History",
    title: "Your Insurance History",
    meta: "1 sections",
    questions: [
      { id: "existing", label: "Do you currently have, or are you applying for, any life, disability, trauma, income protection or business expenses insurance with TAL or another insurer?", type: "radio", options: ["No", "Yes"] },
      { id: "replace", label: "Will this policy replace, reduce or change any existing insurance cover, including insurance through superannuation or your employer?", type: "radio", options: ["No", "Yes"] },
      { id: "declined", label: "Have you ever had an application for life, disability, trauma, income protection or business expenses insurance declined, postponed, accepted with an exclusion or accepted with a higher premium?", type: "radio", options: ["No", "Yes"] },
      { id: "claim", label: "Have you ever made, or are you intending to make, a claim for sickness, injury, disability or accident benefits?", type: "radio", options: ["No", "Yes"] }
    ]
  },
  {
    id: "health",
    nav: "Your Health and Lifestyle",
    title: "Your Health and Lifestyle",
    meta: "5 sections",
    questions: [
      { id: "height", label: "Height", type: "number", suffix: "cm", value: "178" },
      { id: "weight", label: "Weight", type: "number", suffix: "kg", value: "82" },
      { id: "smoke", label: "Have you smoked or used any nicotine products in the last 12 months?", type: "radio", options: ["No", "Yes"] },
      { id: "alcohol", label: "On average, how many standard alcoholic drinks do you consume per week?", type: "select", options: ["0", "1-7", "8-14", "15-21", "More than 21"] },
      { id: "drugs", label: "Have you used recreational drugs or non-prescribed controlled substances in the last 5 years?", type: "radio", options: ["No", "Yes"] },
      { id: "medical", label: "Have you ever had, or been told you had, any heart, stroke, cancer, diabetes, mental health, neurological, respiratory, digestive, back, joint or chronic pain condition?", type: "radio", options: ["No", "Yes"] },
      { id: "tests", label: "Are you currently waiting for any medical advice, investigation, test results, surgery or treatment?", type: "radio", options: ["No", "Yes"] },
      { id: "family", label: "Before age 60, have any of your parents, brothers or sisters had heart disease, stroke, cancer, diabetes, Huntington's disease, polycystic kidney disease or another hereditary condition?", type: "radio", options: ["No", "Yes", "I don't know"] },
      { id: "travel", label: "Do you intend to travel, live or work outside Australia in the next 12 months?", type: "radio", options: ["No", "Yes"] },
      { id: "sports", label: "Do you take part in aviation, motor racing, diving, climbing, combat sports, extreme sports or any other hazardous pastime?", type: "radio", options: ["No", "Yes"] }
    ]
  },
  {
    id: "review",
    nav: "Review",
    title: "Review your answers",
    kind: "review",
    copy: ["Please review your answers before you continue. You can go back to change any section."],
    questions: [{ id: "reviewConfirm", label: "I confirm my answers are complete, accurate and truthful.", type: "checkbox" }]
  },
  {
    id: "medical",
    nav: "Medical Consent Authority",
    title: "Medical Consent Authority",
    kind: "consent",
    copy: [
      "TAL may need to collect medical information from doctors, hospitals, clinics, allied health providers, Medicare, Pharmaceutical Benefits Scheme records or other relevant providers.",
      "This authority lets TAL assess, verify and administer your application and any claim."
    ],
    questions: [{ id: "medicalConsent", label: "I consent to TAL collecting and using medical information for this application.", type: "checkbox" }]
  },
  {
    id: "payment",
    nav: "Payment and Declarations",
    title: "Payment and Declarations",
    kind: "payment",
    copy: ["This demo stops before final submission. The real site asks for payment details and final declarations here."],
    questions: [
      { id: "paymentMethod", label: "Payment method", type: "radio", options: ["Credit card", "Direct debit"] },
      { id: "declaration", label: "I understand this is not a finalised policy until TAL accepts the application.", type: "checkbox" }
    ]
  },
  {
    id: "submission",
    nav: "Application Submission",
    title: "Application Submission",
    kind: "stop",
    copy: ["Application submission is intentionally disabled for this prototype."]
  }
];

const repCases = [
  {
    id: "alex-taylor",
    customer: "Alex Taylor",
    stage: "Your Health and Lifestyle",
    stageDetail: "Medical history question",
    frictionScore: 95,
    recommendedAction: "Offer callback and take over",
    stoppedSectionId: "health",
    stoppedQuestion:
      "Have you ever had, or been told you had, any heart, stroke, cancer, diabetes, mental health, neurological, respiratory, digestive, back, joint or chronic pain condition?",
    coverSnapshot: "Life Insurance, $500,000, $29.75/month",
    supportNeed: "Customer may be unsure whether an old diagnosis or investigation needs to be disclosed."
  },
  {
    id: "priya-shah",
    customer: "Priya Shah",
    stage: "Your Employment & Income",
    stageDetail: "Annual income question",
    frictionScore: 68,
    recommendedAction: "Send continuation link with income guidance",
    stoppedSectionId: "income",
    stoppedQuestion: "Annual earned income (excluding employer superannuation contribution amount)",
    coverSnapshot: "Life Insurance and Income Protection, quote calculated",
    supportNeed: "Customer appears unsure whether to include superannuation and variable income."
  },
  {
    id: "jordan-lee",
    customer: "Jordan Lee",
    stage: "Your Insurance History",
    stageDetail: "Existing cover question",
    frictionScore: 42,
    recommendedAction: "Offer CoverBuddy guidance",
    stoppedSectionId: "history",
    stoppedQuestion:
      "Will this policy replace, reduce or change any existing insurance cover, including insurance through superannuation or your employer?",
    coverSnapshot: "Life Insurance and Critical Illness, benefits reviewed",
    supportNeed: "Customer may not know how employer or superannuation insurance should be treated."
  }
];

const initialAnswers = Object.fromEntries(
  appSections.flatMap((section) =>
    (section.questions || []).map((question) => [
      question.id,
      question.value || (question.type === "checkbox" ? false : question.options?.[0] || "")
    ])
  )
);

function createFrictionState(contextKey) {
  return {
    contextKey,
    score: 0,
    causes: [],
    editCounts: {},
    flags: {},
    notifiedLevel: "low"
  };
}

function getFrictionLevel(score) {
  if (score <= frictionThresholds.lowMax) return "low";
  if (score <= frictionThresholds.mediumMax) return "medium";
  return "high";
}

function addUniqueCause(causes, cause) {
  return causes.includes(cause) ? causes : [...causes, cause];
}

function applyFrictionSignal(current, { points, cause, flag }) {
  if (flag && current.flags[flag]) return current;

  return {
    ...current,
    score: Math.min(100, current.score + points),
    causes: addUniqueCause(current.causes, cause),
    flags: flag ? { ...current.flags, [flag]: true } : current.flags
  };
}

function getRepCaseHandoffSummary(repCase) {
  return `${repCase.customer} is paused at ${repCase.stage} (${repCase.stageDetail}). They stopped on: "${repCase.stoppedQuestion}" Current cover context: ${repCase.coverSnapshot}. Suggested handoff: ${repCase.supportNeed}`;
}

function getRepCase(caseId) {
  return repCases.find((repCase) => repCase.id === caseId) || repCases[0];
}

function getAppSectionIndex(sectionId) {
  const index = appSections.findIndex((section) => section.id === sectionId);
  return index > -1 ? index : 0;
}

function getRouteFromLocation() {
  if (typeof window === "undefined") return { name: "customer", screen: "quote1" };

  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  const takeoverMatch = pathname.match(/^\/rep\/takeover\/([^/]+)$/);

  if (takeoverMatch) {
    return {
      name: "repTakeover",
      screen: "application",
      repCaseId: decodeURIComponent(takeoverMatch[1])
    };
  }

  if (pathname === "/rep") return { name: "rep", screen: "rep" };

  return { name: "customer", screen: "quote1" };
}

function App() {
  const [initialRoute] = useState(getRouteFromLocation);
  const initialRepCase = initialRoute.repCaseId ? getRepCase(initialRoute.repCaseId) : repCases[0];
  const [screen, setScreen] = useState(initialRoute.screen);
  const [quote, setQuote] = useState(quoteDefaults);
  const [cover, setCover] = useState({ life: true, tpd: false, trauma: false, income: false, amount: "500000" });
  const [appIndex, setAppIndex] = useState(
    initialRoute.name === "repTakeover" ? getAppSectionIndex(initialRepCase.stoppedSectionId) : 0
  );
  const [answers, setAnswers] = useState(initialAnswers);
  const [assistantQuestion, setAssistantQuestion] = useState(null);
  const [assistantPrompt, setAssistantPrompt] = useState(null);
  const [assistantSessionId, setAssistantSessionId] = useState(0);
  const [frictionAlert, setFrictionAlert] = useState(null);
  const [lastActivityAt, setLastActivityAt] = useState(Date.now());
  const [selectedRepCaseId, setSelectedRepCaseId] = useState(initialRepCase.id);
  const [repNotice, setRepNotice] = useState("");
  const [repTakeoverCase, setRepTakeoverCase] = useState(initialRoute.name === "repTakeover" ? initialRepCase : null);
  const isRepScreen = screen === "rep";
  const isPremiumCalculated = screen !== "quote1" && screen !== "quote2";
  const selectedRepCase = repCases.find((repCase) => repCase.id === selectedRepCaseId) || repCases[0];

  const activeStep = useMemo(() => {
    if (isRepScreen) return "Rep Dashboard";
    return screen === "application" ? appSections[appIndex].nav : quoteStepTitles[screen];
  }, [isRepScreen, screen, appIndex]);

  const activeContextKey = screen === "application" ? `application:${appSections[appIndex].id}` : screen;
  const activeContextLabel = screen === "application" ? appSections[appIndex].title : activeStep;
  const [friction, setFriction] = useState(() => createFrictionState(activeContextKey));

  const recordActivity = () => setLastActivityAt(Date.now());

  const recordFrictionSignal = (signal) => {
    setFriction((current) => applyFrictionSignal(current, signal));
  };

  const recordHelpClick = (question) => {
    recordActivity();
    recordFrictionSignal({
      points: 25,
      cause: `Help opened for "${question.label}".`
    });
  };

  const recordAnswerEdit = (id, label) => {
    recordActivity();
    setFriction((current) => {
      const nextCount = (current.editCounts[id] || 0) + 1;
      const next = {
        ...current,
        editCounts: { ...current.editCounts, [id]: nextCount }
      };

      if (nextCount === 2) {
        return applyFrictionSignal(next, {
          points: 15,
          cause: `The answer for "${label}" was changed more than once.`,
          flag: `edit-${id}-2`
        });
      }

      if (nextCount === 4 || nextCount === 6) {
        return applyFrictionSignal(next, {
          points: 10,
          cause: `Repeated changes suggest uncertainty on "${label}".`,
          flag: `edit-${id}-${nextCount}`
        });
      }

      return next;
    });
  };

  const openAssistant = (question) => {
    recordHelpClick(question);
    setFrictionAlert(null);
    setAssistantQuestion(question);
    setAssistantPrompt(null);
    setAssistantSessionId((value) => value + 1);
  };

  const applyRoute = (route) => {
    if (route.name === "rep") {
      setScreen("rep");
      setRepTakeoverCase(null);
      setAssistantQuestion(null);
      setAssistantPrompt(null);
      setFrictionAlert(null);
      setRepNotice("");
      return;
    }

    if (route.name === "repTakeover") {
      const nextRepCase = getRepCase(route.repCaseId);
      setSelectedRepCaseId(nextRepCase.id);
      setRepTakeoverCase(nextRepCase);
      setAppIndex(getAppSectionIndex(nextRepCase.stoppedSectionId));
      setScreen("application");
      setAssistantQuestion(null);
      setAssistantPrompt(null);
      setFrictionAlert(null);
      setRepNotice("");
      return;
    }

    setScreen("quote1");
    setAppIndex(0);
    setRepTakeoverCase(null);
    setAssistantQuestion(null);
    setAssistantPrompt(null);
    setFrictionAlert(null);
    setRepNotice("");
  };

  const navigateTo = (path) => {
    if (typeof window === "undefined") return;
    window.history.pushState({}, "", path);
    applyRoute(getRouteFromLocation());
  };

  const openRepDashboard = () => {
    navigateTo("/rep");
  };

  const takeOverApplication = () => {
    navigateTo(`/rep/takeover/${encodeURIComponent(selectedRepCase.id)}`);
  };

  const sendContinuationLink = () => {
    setRepNotice(`Continuation link sent to ${selectedRepCase.customer}.`);
  };

  const offerCallback = () => {
    setRepNotice(`Callback offer queued for ${selectedRepCase.customer}.`);
  };

  useEffect(() => {
    const handlePopState = () => {
      applyRoute(getRouteFromLocation());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    setFriction(createFrictionState(activeContextKey));
    setFrictionAlert(null);
    setAssistantQuestion(null);
    setAssistantPrompt(null);
    setAssistantSessionId((value) => value + 1);
    setLastActivityAt(Date.now());
  }, [activeContextKey]);

  useEffect(() => {
    if (isRepScreen) return undefined;

    const timeout = window.setTimeout(() => {
      recordFrictionSignal({
        points: 35,
        cause: "No activity detected for 10 seconds.",
        flag: "inactivity-10"
      });
    }, 10000);

    return () => window.clearTimeout(timeout);
  }, [isRepScreen, lastActivityAt, activeContextKey]);

  useEffect(() => {
    if (isRepScreen) return undefined;

    const longDwellTimer = window.setTimeout(() => {
      recordFrictionSignal({
        points: 20,
        cause: `Spent a long time on "${activeContextLabel}".`,
        flag: "dwell-30"
      });
    }, 30000);

    const extendedDwellTimer = window.setTimeout(() => {
      recordFrictionSignal({
        points: 15,
        cause: `Still reviewing "${activeContextLabel}" after an extended pause.`,
        flag: "dwell-60"
      });
    }, 60000);

    return () => {
      window.clearTimeout(longDwellTimer);
      window.clearTimeout(extendedDwellTimer);
    };
  }, [isRepScreen, activeContextKey, activeContextLabel]);

  useEffect(() => {
    if (isRepScreen) return;

    const level = getFrictionLevel(friction.score);
    if (level === "low" || level === friction.notifiedLevel) return;

    setFrictionAlert({
      level,
      score: friction.score,
      causes: friction.causes.slice(-3)
    });
    setAssistantQuestion({ label: activeContextLabel });
    setAssistantPrompt(null);
    setAssistantSessionId((value) => value + 1);
    setFriction((current) => ({ ...current, notifiedLevel: level }));
  }, [isRepScreen, activeContextLabel, friction.causes, friction.notifiedLevel, friction.score]);

  const goAppNext = () => {
    recordActivity();
    if (appIndex < appSections.length - 1) setAppIndex((value) => value + 1);
  };

  return (
    <div className="app" onPointerDown={recordActivity} onKeyDown={recordActivity}>
      <Header mode={isRepScreen ? "REP DASHBOARD" : screen === "application" ? "YOUR APPLICATION" : "TAL COVERBUILDER"} onRepDashboard={openRepDashboard} />
      {isRepScreen ? (
        <main className="rep-shell">
          <RepDashboard
            cases={repCases}
            selectedCase={selectedRepCase}
            notice={repNotice}
            onSelectCase={(id) => {
              setSelectedRepCaseId(id);
              setRepNotice("");
            }}
            onTakeOver={takeOverApplication}
            onSendLink={sendContinuationLink}
            onOfferCallback={offerCallback}
          />
        </main>
      ) : (
        <main className={`shell ${screen === "application" ? "application-shell" : ""} ${isPremiumCalculated ? "" : "no-summary"}`}>
          <ProgressRail activeStep={activeStep} appIndex={appIndex} screen={screen} />
          <section className="content-panel">
            {screen === "quote1" && <QuoteStepOne quote={quote} setQuote={setQuote} onHelp={openAssistant} onEdit={recordAnswerEdit} onNext={() => setScreen("quote2")} />}
            {screen === "quote2" && <QuoteStepTwo quote={quote} setQuote={setQuote} onHelp={openAssistant} onEdit={recordAnswerEdit} onBack={() => setScreen("quote1")} onNext={() => setScreen("select")} />}
            {screen === "select" && <SelectCover cover={cover} setCover={setCover} onHelp={openAssistant} onEdit={recordAnswerEdit} onBack={() => setScreen("quote2")} onNext={() => setScreen("benefits")} />}
            {screen === "benefits" && <Benefits cover={cover} onBack={() => setScreen("select")} onNext={() => setScreen("application")} />}
            {screen === "application" && (
              <>
                {repTakeoverCase && <RepTakeoverBanner repCase={repTakeoverCase} onBackToDashboard={openRepDashboard} />}
                <ApplicationSection
                  section={appSections[appIndex]}
                  answers={answers}
                  setAnswers={setAnswers}
                  onHelp={openAssistant}
                  onEdit={recordAnswerEdit}
                  onBack={() => (appIndex === 0 ? setScreen("benefits") : setAppIndex((value) => value - 1))}
                  onNext={goAppNext}
                  isLast={appIndex === appSections.length - 1}
                />
              </>
            )}
          </section>
          {isPremiumCalculated && <QuoteSummary cover={cover} screen={screen} />}
        </main>
      )}
      <AssistantDrawer
        key={`${assistantQuestion?.label || "assistant-closed"}-${assistantSessionId}`}
        question={assistantQuestion}
        selectedPrompt={assistantPrompt}
        frictionAlert={frictionAlert}
        onAsk={setAssistantPrompt}
        onClose={() => {
          setAssistantQuestion(null);
          setAssistantPrompt(null);
          setFrictionAlert(null);
        }}
      />
      <Footer />
    </div>
  );
}

function Header({ mode, onRepDashboard }) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="logo-mark">TAL</span>
        <span className="mode">{mode}</span>
      </div>
      <div className="support">
        <button className="rep-nav-button" type="button" onClick={onRepDashboard}>
          REP DASHBOARD
        </button>
        <span>Secure</span>
        <a href="tel:131825">Need Help?</a>
        <strong>131 825</strong>
      </div>
    </header>
  );
}

function ProgressRail({ activeStep, screen, appIndex }) {
  const visibleGroups = screen === "application" ? navGroups.filter((group) => group.key === "application") : navGroups.filter((group) => group.key === "quote");

  return (
    <aside className="rail">
      {visibleGroups.map((group) => (
        <div className="rail-group" key={group.key}>
          <div className="rail-title">{group.label}</div>
          <ul>
            {group.steps.map((step) => {
              const stepIndex = appSections.findIndex((item) => item.nav === step);
              const isDone = screen === "application" && stepIndex > -1 && stepIndex < appIndex;
              const isActive = activeStep === step;
              return (
                <li className={isActive ? "active" : isDone ? "done" : ""} key={step}>
                  <span className="dot">{isDone ? "✓" : ""}</span>
                  {step}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </aside>
  );
}

function QuoteStepOne({ quote, setQuote, onHelp, onEdit, onNext }) {
  return (
    <FormFrame title="Let’s get started" eyebrow="STEP 1 OF 2">
      <Field id="quote-dob" label="Date of birth" value={quote.dob} onHelp={onHelp} onEdit={onEdit} onChange={(value) => setQuote({ ...quote, dob: value })} />
      <RadioGroup id="quote-gender" label="Gender" value={quote.gender} options={["Male", "Female"]} onHelp={onHelp} onEdit={onEdit} onChange={(value) => setQuote({ ...quote, gender: value })} />
      <RadioGroup id="quote-smoker" label="Have you smoked or used nicotine products in the last 12 months?" value={quote.smoker} options={["No", "Yes"]} onHelp={onHelp} onEdit={onEdit} onChange={(value) => setQuote({ ...quote, smoker: value })} />
      <Field id="quote-occupation" label="Occupation" value={quote.occupation} onHelp={onHelp} onEdit={onEdit} onChange={(value) => setQuote({ ...quote, occupation: value })} hint="Start typing and select the closest occupation." />
      <Field id="quote-income" label="Annual income" prefix="$" value={quote.income} onHelp={onHelp} onEdit={onEdit} onChange={(value) => setQuote({ ...quote, income: value })} />
      <Actions onNext={onNext} nextLabel="NEXT" />
    </FormFrame>
  );
}

function QuoteStepTwo({ quote, setQuote, onHelp, onEdit, onBack, onNext }) {
  return (
    <FormFrame title="Your contact details" eyebrow="STEP 2 OF 2">
      <div className="two-col">
        <Field id="quote-first-name" label="First name" value={quote.firstName} onHelp={onHelp} onEdit={onEdit} onChange={(value) => setQuote({ ...quote, firstName: value })} />
        <Field id="quote-last-name" label="Last name" value={quote.lastName} onHelp={onHelp} onEdit={onEdit} onChange={(value) => setQuote({ ...quote, lastName: value })} />
      </div>
      <Field id="quote-phone" label="Mobile phone number" value={quote.phone} onHelp={onHelp} onEdit={onEdit} onChange={(value) => setQuote({ ...quote, phone: value })} />
      <Field id="quote-email" label="Email address" value={quote.email} onHelp={onHelp} onEdit={onEdit} onChange={(value) => setQuote({ ...quote, email: value })} />
      <Field id="quote-postcode" label="Postcode" value={quote.postcode} onHelp={onHelp} onEdit={onEdit} onChange={(value) => setQuote({ ...quote, postcode: value })} />
      <Actions onBack={onBack} onNext={onNext} nextLabel="CALCULATE QUOTE" />
    </FormFrame>
  );
}

function SelectCover({ cover, setCover, onHelp, onEdit, onBack, onNext }) {
  const benefits = [
    ["life", "Life Insurance", "A lump sum payment if you die or are diagnosed with a terminal illness.", "$21.75"],
    ["tpd", "Total Permanent Disability", "A lump sum payment if you are unlikely to work again.", "$18.05"],
    ["trauma", "Critical Illness", "A lump sum payment for specified serious medical events.", "$25.20"],
    ["income", "Income Protection", "Monthly benefit if sickness or injury stops you working.", "$42.10"]
  ];
  return (
    <FormFrame title="Your quote" eyebrow="QUOTE NUMBER Q7397953">
      <div className="quote-banner">
        <b>$29.75/month</b>
        <span>Includes Life Insurance and an $8.00 policy fee.</span>
      </div>
      <Field id="cover-amount" label="Life Insurance cover amount" prefix="$" value={cover.amount} onHelp={onHelp} onEdit={onEdit} onChange={(value) => setCover({ ...cover, amount: value })} />
      <div className="benefit-list">
        {benefits.map(([key, title, copy, price]) => (
          <label className={cover[key] ? "benefit selected" : "benefit"} key={key}>
            <input type="checkbox" checked={cover[key]} onChange={(event) => setCover({ ...cover, [key]: event.target.checked })} />
            <span>
              <b>{title}</b>
              <small>{copy}</small>
            </span>
            <strong>{price}</strong>
          </label>
        ))}
      </div>
      <Actions onBack={onBack} onNext={onNext} nextLabel="CONTINUE" />
    </FormFrame>
  );
}

function Benefits({ cover, onBack, onNext }) {
  return (
    <FormFrame title="Your chosen benefits at a glance" eyebrow="REVIEW">
      <div className="review-box">
        <div>
          <span>Life Insurance</span>
          <strong>${Number(cover.amount).toLocaleString()}</strong>
        </div>
        <p>
          Your policy contains exclusions, limits and conditions. Read the Product Disclosure Statement before deciding whether this cover is right for you.
        </p>
      </div>
      <div className="warning">
        If you are replacing existing insurance, including insurance through superannuation, consider the terms, waiting periods, exclusions and benefits before you continue.
      </div>
      <Actions onBack={onBack} onNext={onNext} nextLabel="START APPLICATION" />
    </FormFrame>
  );
}

function RepDashboard({ cases, selectedCase, notice, onSelectCase, onTakeOver, onSendLink, onOfferCallback }) {
  return (
    <section className="rep-dashboard" aria-label="Representative friction dashboard">
      <div className="rep-heading">
        <div>
          <div className="eyebrow">CUSTOMER SUPPORT</div>
          <h1>Rep dashboard</h1>
        </div>
        <div className="rep-kpis" aria-label="Case totals">
          <div>
            <span>Open cases</span>
            <strong>{cases.length}</strong>
          </div>
          <div>
            <span>High friction</span>
            <strong>{cases.filter((repCase) => repCase.frictionScore > frictionThresholds.mediumMax).length}</strong>
          </div>
        </div>
      </div>

      <div className="rep-layout">
        <div className="rep-table-wrap">
          <table className="rep-table">
            <thead>
              <tr>
                <th scope="col">Customer</th>
                <th scope="col">Stage</th>
                <th scope="col">Friction score</th>
                <th scope="col">Recommended action</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((repCase) => (
                <tr className={repCase.id === selectedCase.id ? "selected" : ""} key={repCase.id}>
                  <td>
                    <button className="rep-row-button" type="button" onClick={() => onSelectCase(repCase.id)}>
                      {repCase.customer}
                    </button>
                  </td>
                  <td>
                    <strong>{repCase.stage}</strong>
                    <span>{repCase.stageDetail}</span>
                  </td>
                  <td>
                    <span className={repCase.frictionScore > frictionThresholds.mediumMax ? "score-pill high" : "score-pill"}>
                      {repCase.frictionScore}
                    </span>
                  </td>
                  <td>{repCase.recommendedAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="handoff-panel" aria-label="Generated handoff summary">
          <div className="handoff-title">Handoff summary</div>
          <p>{getRepCaseHandoffSummary(selectedCase)}</p>
          <dl className="handoff-details">
            <div>
              <dt>Stopped question</dt>
              <dd>{selectedCase.stoppedQuestion}</dd>
            </div>
            <div>
              <dt>Support focus</dt>
              <dd>{selectedCase.supportNeed}</dd>
            </div>
          </dl>
          {notice && <div className="rep-notice" role="status">{notice}</div>}
          <div className="rep-actions">
            <button className="primary" type="button" onClick={onTakeOver}>
              TAKE OVER APPLICATION
            </button>
            <button className="secondary" type="button" onClick={onSendLink}>
              SEND CONTINUATION LINK
            </button>
            <button className="secondary" type="button" onClick={onOfferCallback}>
              OFFER CALLBACK
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function RepTakeoverBanner({ repCase, onBackToDashboard }) {
  return (
    <div className="rep-takeover-banner" role="status">
      <div>
        <span>Rep takeover active</span>
        <strong>{repCase.customer} stopped at {repCase.stage}</strong>
        <p>{repCase.supportNeed}</p>
      </div>
      <button className="secondary" type="button" onClick={onBackToDashboard}>
        BACK TO REP DASHBOARD
      </button>
    </div>
  );
}

function ApplicationSection({ section, answers, setAnswers, onHelp, onEdit, onBack, onNext, isLast }) {
  const setAnswer = (id, value) => setAnswers((current) => ({ ...current, [id]: value }));
  return (
    <FormFrame title={section.title} eyebrow={section.meta}>
      {section.copy?.map((item) => (
        <p className="body-copy" key={item}>{item}</p>
      ))}
      {section.checklist && (
        <ul className="need-list">
          {section.checklist.map((item) => <li key={item}>{item}</li>)}
        </ul>
      )}
      {(section.questions || []).map((question) => (
        <Question key={question.id} question={question} value={answers[question.id]} onHelp={onHelp} onEdit={onEdit} onChange={(value) => setAnswer(question.id, value)} />
      ))}
      {section.kind === "review" && <ReviewAnswers answers={answers} />}
      {section.kind === "stop" && <div className="stop-box">This prototype intentionally does not finalise or submit an application.</div>}
      <Actions onBack={onBack} onNext={isLast ? undefined : onNext} nextLabel={section.id === "intro" ? "START APPLICATION" : "NEXT"} />
    </FormFrame>
  );
}

function FormFrame({ eyebrow, title, children }) {
  return (
    <div className="form-frame">
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h1>{title}</h1>
      {children}
    </div>
  );
}

function Question({ question, value, onHelp, onEdit, onChange }) {
  if (question.type === "radio") return <RadioGroup id={question.id} label={question.label} options={question.options} value={value} onHelp={onHelp} onEdit={onEdit} onChange={onChange} />;
  if (question.type === "select") return <SelectField id={question.id} label={question.label} options={question.options} value={value} onHelp={onHelp} onEdit={onEdit} onChange={onChange} />;
  if (question.type === "checkbox") {
    return (
      <div className="check-question">
        <label className="check-row">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => {
              onEdit?.(question.id, question.label);
              onChange(event.target.checked);
            }}
          />
          <span>{question.label}</span>
        </label>
        <HelpButton question={{ label: question.label }} onHelp={onHelp} />
      </div>
    );
  }
  if (question.type === "locked" || question.type === "calculated") {
    return (
      <div className="field">
        <QuestionLabel label={question.label} onHelp={onHelp} />
        <div className="locked-value">{question.value}</div>
      </div>
    );
  }
  return <Field id={question.id} label={question.label} value={value} onHelp={onHelp} onEdit={onEdit} onChange={onChange} prefix={question.type === "money" ? "$" : undefined} suffix={question.suffix} type={question.type === "number" ? "number" : "text"} />;
}

function Field({ id, label, value, onHelp, onEdit, onChange, prefix, suffix, hint, type = "text" }) {
  return (
    <div className="field">
      <QuestionLabel label={label} onHelp={onHelp} />
      <div className="input-wrap">
        {prefix && <span>{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={(event) => {
            onEdit?.(id || label, label);
            onChange(event.target.value);
          }}
        />
        {suffix && <span>{suffix}</span>}
      </div>
      {hint && <small className="hint">{hint}</small>}
    </div>
  );
}

function SelectField({ id, label, options, value, onHelp, onEdit, onChange }) {
  return (
    <div className="field">
      <QuestionLabel label={label} onHelp={onHelp} />
      <select
        value={value}
        onChange={(event) => {
          onEdit?.(id || label, label);
          onChange(event.target.value);
        }}
      >
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </div>
  );
}

function RadioGroup({ id, label, options, value, onHelp, onEdit, onChange }) {
  return (
    <fieldset className="radio-group">
      <legend>
        <span className="question-label-inline">
          <span>{label}</span>
          <HelpButton question={{ label }} onHelp={onHelp} />
        </span>
      </legend>
      <div className="radio-options">
        {options.map((option) => (
          <label className={value === option ? "radio selected" : "radio"} key={option}>
            <input
              type="radio"
              checked={value === option}
              onChange={() => {
                onEdit?.(id || label, label);
                onChange(option);
              }}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function QuestionLabel({ label, onHelp }) {
  return (
    <label className="question-label-inline">
      <span>{label}</span>
      <HelpButton question={{ label }} onHelp={onHelp} />
    </label>
  );
}

function HelpButton({ question, onHelp }) {
  if (!onHelp) return null;

  return (
    <button className="help-button" type="button" aria-label={`Ask AI about ${question.label}`} title="Ask AI" onClick={() => onHelp(question)}>
      ?
    </button>
  );
}

function AssistantDrawer({ question, selectedPrompt, frictionAlert, onAsk, onClose }) {
  const [customQuestion, setCustomQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const latestExchangeRef = useRef(null);

  useEffect(() => {
    latestExchangeRef.current?.scrollIntoView({ block: "start" });
  }, [messages]);

  if (!question) return null;

  const askPreset = (prompt) => {
    onAsk(prompt);
    setMessages((current) => [
      ...current,
      { role: "customer", text: prompt },
      { role: "assistant", text: getAssistantAnswer(question.label, prompt) }
    ]);
  };

  const askCustomQuestion = (event) => {
    event.preventDefault();
    const trimmedQuestion = customQuestion.trim();
    if (!trimmedQuestion) return;
    onAsk(null);
    setMessages((current) => [
      ...current,
      { role: "customer", text: trimmedQuestion },
      { role: "assistant", text: getCustomAssistantAnswer(question.label, trimmedQuestion) }
    ]);
    setCustomQuestion("");
  };

  return (
    <aside className="assistant-drawer" aria-label="CoverBuddy help panel">
      <div className="assistant-header">
        <div>
          <span>COVERBUDDY</span>
          <h2>Need help with this question?</h2>
        </div>
        <button className="assistant-close" type="button" aria-label="Close CoverBuddy" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="assistant-question">{question.label}</div>
      <div className="assistant-chat" aria-live="polite">
        {frictionAlert && messages.length === 0 && (
          <div className={`chat-message assistant-message friction-message ${frictionAlert.level === "high" ? "high-friction" : ""}`}>
            <span>CoverBuddy</span>
            <p>{getFrictionMessage(frictionAlert)}</p>
            {frictionAlert.level === "high" && (
              <button className="rep-call-button" type="button">
                REQUEST A CALL
              </button>
            )}
          </div>
        )}
        {!frictionAlert && messages.length === 0 && (
          <div className="chat-message assistant-message">
            <span>CoverBuddy</span>
            <p>I can help explain this question in plain language. Choose a quick question or type your own below.</p>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            className={`chat-message ${message.role === "customer" ? "customer-message" : "assistant-message"}`}
            key={`${message.role}-${index}`}
            ref={message.role === "customer" && index === messages.length - 2 ? latestExchangeRef : undefined}
          >
            <span>{message.role === "customer" ? "You" : "CoverBuddy"}</span>
            <p>{message.text}</p>
          </div>
        ))}
      </div>
      <div className="assistant-quick-actions" aria-label="Suggested questions">
        <span>Suggested questions</span>
        <div className="assistant-prompts">
          {assistantPrompts.map((prompt) => (
            <button className={selectedPrompt === prompt ? "prompt-chip selected" : "prompt-chip"} type="button" key={prompt} onClick={() => askPreset(prompt)}>
              {prompt}
            </button>
          ))}
        </div>
      </div>
      <form className="assistant-custom" onSubmit={askCustomQuestion}>
        <label htmlFor="assistant-free-question">Ask your own question</label>
        <textarea
          id="assistant-free-question"
          value={customQuestion}
          onChange={(event) => setCustomQuestion(event.target.value)}
          placeholder="For example, what if I am not sure about the exact date?"
          rows={2}
        />
        <button className="assistant-ask-button" type="submit" disabled={!customQuestion.trim()}>
          ASK AI
        </button>
      </form>
    </aside>
  );
}

function getFrictionMessage(frictionAlert) {
  if (frictionAlert.level === "high") {
    return "It looks like this question may need a little extra support. I can walk you through what it means, what details to check, and what usually happens next. If you would rather talk it through, you can request a representative call.";
  }

  return "Need a hand with this question? I can explain what it means, why it matters, and how to think about your answer before you continue.";
}

function getQuestionTopic(label) {
  const lowerLabel = label.toLowerCase();
  return lowerLabel.includes("income")
    ? "income"
    : lowerLabel.includes("occupation") || lowerLabel.includes("work")
      ? "occupation"
      : lowerLabel.includes("smoked") || lowerLabel.includes("health") || lowerLabel.includes("medical")
        ? "health"
        : lowerLabel.includes("insurance") || lowerLabel.includes("policy")
          ? "insurance history"
          : "application";
}

function getAssistantAnswer(label, prompt) {
  const topic = getQuestionTopic(label);

  if (prompt === "why is this information important?") {
    return `TAL asks this because your ${topic} information can affect eligibility, pricing, underwriting, or whether extra details are needed before cover can be offered.`;
  }

  if (prompt === "how should I answer?") {
    return `Answer based on your situation today. If unclear, add detail instead of guessing, or contact TAL.`;
  }

  return `After you answer, the application saves your response and moves to the next question or section. If your answer needs more detail, the real application may ask follow-up questions before final review.`;
}

function getCustomAssistantAnswer(label, customerQuestion) {
  const topic = getQuestionTopic(label);
  return `For this prototype, the assistant would explain how this ${topic} question is used, then point you to your records or best current knowledge before you answer.`;
}

function Actions({ onBack, onNext, nextLabel }) {
  return (
    <div className="actions">
      {onBack && <button className="secondary" onClick={onBack}>BACK</button>}
      {onNext && <button className="primary" onClick={onNext}>{nextLabel}</button>}
    </div>
  );
}

function QuoteSummary({ cover, screen }) {
  return (
    <aside className="summary">
      <div className="summary-title">{screen === "application" ? "YOUR COVER" : "QUOTE SUMMARY"}</div>
      <div className="summary-row">
        <span>Life Insurance</span>
        <strong>${Number(cover.amount).toLocaleString()}</strong>
      </div>
      <div className="summary-row">
        <span>Premium</span>
        <strong>$29.75/month</strong>
      </div>
      <div className="discount">Health Sense Plus discount applied</div>
    </aside>
  );
}

function ReviewAnswers({ answers }) {
  return (
    <div className="answer-review">
      {["title", "incomeExSuper", "occ", "existing", "medical", "tests"].map((key) => (
        <div key={key}>
          <span>{key}</span>
          <strong>{String(answers[key])}</strong>
        </div>
      ))}
    </div>
  );
}

function Footer() {
  return (
    <footer>
      <nav>
        <a>Financial Services Guide</a>
        <a>Privacy Policy</a>
        <a>Security</a>
      </nav>
      <p>
        The information provided on this website is general advice only and does not take into account your individual needs, objectives or financial situation. Before you decide to buy or continue to hold an insurance product, read the relevant Product Disclosure Statement.
      </p>
    </footer>
  );
}

createRoot(document.getElementById("root")).render(<App />);
