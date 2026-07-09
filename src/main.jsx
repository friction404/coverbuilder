import React, { useMemo, useState } from "react";
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

const initialAnswers = Object.fromEntries(
  appSections.flatMap((section) =>
    (section.questions || []).map((question) => [
      question.id,
      question.value || (question.type === "checkbox" ? false : question.options?.[0] || "")
    ])
  )
);

function App() {
  const [screen, setScreen] = useState("quote1");
  const [quote, setQuote] = useState(quoteDefaults);
  const [cover, setCover] = useState({ life: true, tpd: false, trauma: false, income: false, amount: "500000" });
  const [appIndex, setAppIndex] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);
  const isPremiumCalculated = screen !== "quote1" && screen !== "quote2";

  const activeStep = useMemo(() => {
    const quoteMap = { quote1: "Your Details", quote2: "Contact Details", select: "Select Cover", benefits: "Review Benefits" };
    return screen === "application" ? appSections[appIndex].nav : quoteMap[screen];
  }, [screen, appIndex]);

  const goAppNext = () => {
    if (appIndex < appSections.length - 1) setAppIndex((value) => value + 1);
  };

  return (
    <div className="app">
      <Header mode={screen === "application" ? "YOUR APPLICATION" : "TAL COVERBUILDER"} />
      <main className={`shell ${screen === "application" ? "application-shell" : ""} ${isPremiumCalculated ? "" : "no-summary"}`}>
        <ProgressRail activeStep={activeStep} appIndex={appIndex} screen={screen} />
        <section className="content-panel">
          {screen === "quote1" && <QuoteStepOne quote={quote} setQuote={setQuote} onNext={() => setScreen("quote2")} />}
          {screen === "quote2" && <QuoteStepTwo quote={quote} setQuote={setQuote} onBack={() => setScreen("quote1")} onNext={() => setScreen("select")} />}
          {screen === "select" && <SelectCover cover={cover} setCover={setCover} onBack={() => setScreen("quote2")} onNext={() => setScreen("benefits")} />}
          {screen === "benefits" && <Benefits cover={cover} onBack={() => setScreen("select")} onNext={() => setScreen("application")} />}
          {screen === "application" && (
            <ApplicationSection
              section={appSections[appIndex]}
              answers={answers}
              setAnswers={setAnswers}
              onBack={() => (appIndex === 0 ? setScreen("benefits") : setAppIndex((value) => value - 1))}
              onNext={goAppNext}
              isLast={appIndex === appSections.length - 1}
            />
          )}
        </section>
        {isPremiumCalculated && <QuoteSummary cover={cover} screen={screen} />}
      </main>
      <Footer />
    </div>
  );
}

function Header({ mode }) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="logo-mark">TAL</span>
        <span className="mode">{mode}</span>
      </div>
      <div className="support">
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

function QuoteStepOne({ quote, setQuote, onNext }) {
  return (
    <FormFrame title="Let’s get started" eyebrow="STEP 1 OF 2">
      <Field label="Date of birth" value={quote.dob} onChange={(value) => setQuote({ ...quote, dob: value })} />
      <RadioGroup label="Gender" value={quote.gender} options={["Male", "Female"]} onChange={(value) => setQuote({ ...quote, gender: value })} />
      <RadioGroup label="Have you smoked or used nicotine products in the last 12 months?" value={quote.smoker} options={["No", "Yes"]} onChange={(value) => setQuote({ ...quote, smoker: value })} />
      <Field label="Occupation" value={quote.occupation} onChange={(value) => setQuote({ ...quote, occupation: value })} hint="Start typing and select the closest occupation." />
      <Field label="Annual income" prefix="$" value={quote.income} onChange={(value) => setQuote({ ...quote, income: value })} />
      <Actions onNext={onNext} nextLabel="NEXT" />
    </FormFrame>
  );
}

function QuoteStepTwo({ quote, setQuote, onBack, onNext }) {
  return (
    <FormFrame title="Your contact details" eyebrow="STEP 2 OF 2">
      <div className="two-col">
        <Field label="First name" value={quote.firstName} onChange={(value) => setQuote({ ...quote, firstName: value })} />
        <Field label="Last name" value={quote.lastName} onChange={(value) => setQuote({ ...quote, lastName: value })} />
      </div>
      <Field label="Mobile phone number" value={quote.phone} onChange={(value) => setQuote({ ...quote, phone: value })} />
      <Field label="Email address" value={quote.email} onChange={(value) => setQuote({ ...quote, email: value })} />
      <Field label="Postcode" value={quote.postcode} onChange={(value) => setQuote({ ...quote, postcode: value })} />
      <Actions onBack={onBack} onNext={onNext} nextLabel="CALCULATE QUOTE" />
    </FormFrame>
  );
}

function SelectCover({ cover, setCover, onBack, onNext }) {
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
      <Field label="Life Insurance cover amount" prefix="$" value={cover.amount} onChange={(value) => setCover({ ...cover, amount: value })} />
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

function ApplicationSection({ section, answers, setAnswers, onBack, onNext, isLast }) {
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
        <Question key={question.id} question={question} value={answers[question.id]} onChange={(value) => setAnswer(question.id, value)} />
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

function Question({ question, value, onChange }) {
  if (question.type === "radio") return <RadioGroup label={question.label} options={question.options} value={value} onChange={onChange} />;
  if (question.type === "select") return <SelectField label={question.label} options={question.options} value={value} onChange={onChange} />;
  if (question.type === "checkbox") {
    return (
      <label className="check-row">
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />
        <span>{question.label}</span>
      </label>
    );
  }
  if (question.type === "locked" || question.type === "calculated") {
    return (
      <div className="field">
        <label>{question.label}</label>
        <div className="locked-value">{question.value}</div>
      </div>
    );
  }
  return <Field label={question.label} value={value} onChange={onChange} prefix={question.type === "money" ? "$" : undefined} suffix={question.suffix} type={question.type === "number" ? "number" : "text"} />;
}

function Field({ label, value, onChange, prefix, suffix, hint, type = "text" }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="input-wrap">
        {prefix && <span>{prefix}</span>}
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
        {suffix && <span>{suffix}</span>}
      </div>
      {hint && <small className="hint">{hint}</small>}
    </div>
  );
}

function SelectField({ label, options, value, onChange }) {
  return (
    <div className="field">
      <label>{label}</label>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </div>
  );
}

function RadioGroup({ label, options, value, onChange }) {
  return (
    <fieldset className="radio-group">
      <legend>{label}</legend>
      <div className="radio-options">
        {options.map((option) => (
          <label className={value === option ? "radio selected" : "radio"} key={option}>
            <input type="radio" checked={value === option} onChange={() => onChange(option)} />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
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
