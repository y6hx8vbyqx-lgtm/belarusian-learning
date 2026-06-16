"use client";

import { useEffect, useMemo, useState } from "react";

type Language = "ru" | "be";
type Screen = "landing" | "auth" | "dashboard" | "words";

type StoredUser = {
  email: string;
  passwordHash: string;
  registeredAt: string;
  learnedWords: number;
  completedLessons: number;
  streak: number;
  openedCourse: number;
};

const STORAGE_KEY = "belarusian-learning-user";
const SESSION_KEY = "belarusian-learning-session";
const LANGUAGE_KEY = "belarusian-learning-language";

const words = [
  { ru: "вода", be: "вада", wrong: ["зямля", "воўк"] },
  { ru: "земля", be: "зямля", wrong: ["людзі", "вада"] },
  { ru: "люди", be: "людзі", wrong: ["дом", "дзень"] },
  { ru: "волк", be: "воўк", wrong: ["сын", "хлеб"] },
  { ru: "дом", be: "дом", wrong: ["кніга", "горад"] },
  { ru: "книга", be: "кніга", wrong: ["сястра", "вада"] },
  { ru: "город", be: "горад", wrong: ["бацька", "малако"] },
  { ru: "день", be: "дзень", wrong: ["ноч", "зямля"] },
  { ru: "мать", be: "маці", wrong: ["бацька", "брат"] },
  { ru: "отец", be: "бацька", wrong: ["сястра", "маці"] },
];

const text = {
  ru: {
    login: "Войти",
    register: "Зарегистрироваться",
    logout: "Выйти",
    heroBadge: "A1 для русскоязычных · без смешения русского и белорусского",
    heroTitle: "Учим белорусский как игру, а не как скучный учебник.",
    heroText:
      "Слова, аудио, короткие уроки, тесты и прогресс. Сначала 100 базовых слов, затем открывается второй курс.",
    start: "Начать обучение",
    seeCourse: "Посмотреть курс",
    learned: "слов изучено",
    opened: "курс открыт",
    level: "начальный уровень",
    authTitle: "Вход или регистрация",
    email: "Email",
    password: "Пароль",
    createAccount: "Создать аккаунт",
    enterAccount: "Войти в аккаунт",
    noAccount: "Нет аккаунта? Зарегистрируйся.",
    hasAccount: "Уже есть аккаунт? Войди.",
    dashboard: "Главная",
    profile: "Профиль",
    settings: "Настройки",
    registeredAt: "Дата регистрации",
    completedLessons: "Пройдено уроков",
    streak: "Серия дней",
    learnWords: "Учить слова",
    course1: "Курс 1",
    course2: "Курс 2",
    locked: "Закрыто",
    available: "Доступно",
    course1Title: "Основы белорусского",
    course1Text: "Алфавит, произношение, первые слова и простые фразы.",
    course2Title: "Семья, числа и время",
    course2Text: "Откроется после изучения 100 базовых слов.",
    chooseTranslation: "Выбери перевод",
    russianWord: "Русское слово",
    correct: "Правильно!",
    wrong: "Не совсем. Правильный ответ:",
    next: "Дальше",
    back: "Назад",
    language: "Язык сайта",
    reset: "Сбросить прогресс",
    passwordNote:
      "Это временный прототип. В настоящей версии пароль будет храниться через Firebase Auth, а не в коде сайта.",
  },
  be: {
    login: "Увайсці",
    register: "Зарэгістравацца",
    logout: "Выйсці",
    heroBadge: "A1 для рускамоўных · без змешвання рускай і беларускай",
    heroTitle: "Вучым беларускую як гульню, а не як сумны падручнік.",
    heroText:
      "Словы, аўдыя, кароткія ўрокі, тэсты і прагрэс. Спачатку 100 базавых слоў, потым адкрываецца другі курс.",
    start: "Пачаць навучанне",
    seeCourse: "Паглядзець курс",
    learned: "слоў вывучана",
    opened: "курс адкрыты",
    level: "пачатковы ўзровень",
    authTitle: "Уваход або рэгістрацыя",
    email: "Email",
    password: "Пароль",
    createAccount: "Стварыць акаўнт",
    enterAccount: "Увайсці ў акаўнт",
    noAccount: "Няма акаўнта? Зарэгіструйся.",
    hasAccount: "Ужо ёсць акаўнт? Увайдзі.",
    dashboard: "Галоўная",
    profile: "Профіль",
    settings: "Налады",
    registeredAt: "Дата рэгістрацыі",
    completedLessons: "Пройдзена ўрокаў",
    streak: "Серыя дзён",
    learnWords: "Вучыць словы",
    course1: "Курс 1",
    course2: "Курс 2",
    locked: "Закрыта",
    available: "Даступна",
    course1Title: "Асновы беларускай",
    course1Text: "Алфавіт, вымаўленне, першыя словы і простыя фразы.",
    course2Title: "Сям'я, лічбы і час",
    course2Text: "Адкрыецца пасля вывучэння 100 базавых слоў.",
    chooseTranslation: "Выберы пераклад",
    russianWord: "Рускае слова",
    correct: "Правільна!",
    wrong: "Не зусім. Правільны адказ:",
    next: "Далей",
    back: "Назад",
    language: "Мова сайта",
    reset: "Скінуць прагрэс",
    passwordNote:
      "Гэта часовы прататып. У сапраўднай версіі пароль будзе захоўвацца праз Firebase Auth, а не ў кодзе сайта.",
  },
};

async function hashPassword(password: string) {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

function saveStoredUser(user: StoredUser) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  localStorage.setItem(SESSION_KEY, user.email);
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("ru");
  const [screen, setScreen] = useState<Screen>("landing");
  const [mode, setMode] = useState<"login" | "register">("register");
  const [user, setUser] = useState<StoredUser | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);

  const t = text[language];
  const currentWord = words[wordIndex % words.length];

  const options = useMemo(() => {
    return [currentWord.be, ...currentWord.wrong].sort(() => Math.random() - 0.5);
  }, [currentWord]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY) as Language | null;
    const savedUser = getStoredUser();
    const session = localStorage.getItem(SESSION_KEY);

    if (savedLanguage === "ru" || savedLanguage === "be") {
      setLanguage(savedLanguage);
    }

    if (savedUser && session === savedUser.email) {
      setUser(savedUser);
      setScreen("dashboard");
    }
  }, []);

  function changeLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);
    localStorage.setItem(LANGUAGE_KEY, nextLanguage);
  }

  async function handleAuth() {
    setMessage("");

    if (!email.trim() || !password.trim()) {
      setMessage("Введите email и пароль.");
      return;
    }

    if (password.length < 6) {
      setMessage("Пароль должен быть минимум 6 символов.");
      return;
    }

    const savedUser = getStoredUser();
    const passwordHash = await hashPassword(password);

    if (mode === "register") {
      if (savedUser?.email === email) {
        setMessage("Аккаунт с таким email уже существует.");
        return;
      }

      const newUser: StoredUser = {
        email,
        passwordHash,
        registeredAt: new Date().toLocaleDateString("ru-RU"),
        learnedWords: 0,
        completedLessons: 0,
        streak: 1,
        openedCourse: 1,
      };

      saveStoredUser(newUser);
      setUser(newUser);
      setScreen("dashboard");
      setEmail("");
      setPassword("");
      return;
    }

    if (!savedUser || savedUser.email !== email || savedUser.passwordHash !== passwordHash) {
      setMessage("Неверный email или пароль.");
      return;
    }

    localStorage.setItem(SESSION_KEY, savedUser.email);
    setUser(savedUser);
    setScreen("dashboard");
    setEmail("");
    setPassword("");
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setScreen("landing");
  }

  function resetProgress() {
    if (!user) return;

    const updatedUser = {
      ...user,
      learnedWords: 0,
      completedLessons: 0,
      streak: 1,
      openedCourse: 1,
    };

    saveStoredUser(updatedUser);
    setUser(updatedUser);
    setWordIndex(0);
  }

  function chooseAnswer(option: string) {
    if (!user || answer) return;

    setAnswer(option);

    if (option === currentWord.be) {
      const nextLearnedWords = Math.min(user.learnedWords + 1, 100);
      const updatedUser = {
        ...user,
        learnedWords: nextLearnedWords,
        completedLessons: nextLearnedWords >= 100 ? 1 : user.completedLessons,
        openedCourse: nextLearnedWords >= 100 ? 2 : 1,
      };

      saveStoredUser(updatedUser);
      setUser(updatedUser);
    }
  }

  function nextWord() {
    setAnswer(null);
    setWordIndex((current) => current + 1);
  }

  return (
    <main className="min-h-screen bg-[#f7f7ef] pb-24 text-slate-950">
      {screen === "landing" && (
        <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8">
          <Header
            t={t}
            user={user}
            onLogin={() => {
              setMode("login");
              setScreen("auth");
            }}
            onRegister={() => {
              setMode("register");
              setScreen("auth");
            }}
            onDashboard={() => setScreen("dashboard")}
            onLogout={logout}
          />

          <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-7">
              <div className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-lime-700 shadow-sm">
                {t.heroBadge}
              </div>

              <div className="space-y-5">
                <h1 className="max-w-3xl text-5xl font-black tracking-tight sm:text-7xl">
                  {t.heroTitle}
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600">
                  {t.heroText}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    setMode("register");
                    setScreen("auth");
                  }}
                  className="rounded-2xl bg-lime-500 px-7 py-4 text-center text-lg font-black text-white shadow-[0_6px_0_#65a30d] transition hover:-translate-y-0.5"
                >
                  {t.start}
                </button>
                <button
                  onClick={() => setScreen("dashboard")}
                  className="rounded-2xl border-2 border-slate-200 bg-white px-7 py-4 text-center text-lg font-black text-slate-700 transition hover:bg-slate-50"
                >
                  {t.seeCourse}
                </button>
              </div>

              <StatsCards t={t} user={user} />
            </section>

            <WordPreview t={t} />
          </div>
        </section>
      )}

      {screen === "auth" && (
        <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-6 sm:px-8">
          <Header
            t={t}
            user={user}
            onLogin={() => setMode("login")}
            onRegister={() => setMode("register")}
            onDashboard={() => setScreen("dashboard")}
            onLogout={logout}
          />

          <div className="flex flex-1 items-center justify-center py-10">
            <div className="w-full rounded-[2rem] bg-white p-6 shadow-xl sm:p-8">
              <p className="font-black uppercase tracking-[0.2em] text-lime-700">
                Account
              </p>
              <h1 className="mt-3 text-4xl font-black">{t.authTitle}</h1>
              <p className="mt-3 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-800">
                {t.passwordNote}
              </p>

              <div className="mt-6 space-y-4">
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-4 font-bold outline-none focus:border-lime-400"
                  placeholder={t.email}
                  type="email"
                />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-4 font-bold outline-none focus:border-lime-400"
                  placeholder={t.password}
                  type="password"
                />

                {message && (
                  <p className="rounded-2xl bg-red-50 p-4 font-bold text-red-600">
                    {message}
                  </p>
                )}

                <button
                  onClick={handleAuth}
                  className="w-full rounded-2xl bg-lime-500 py-4 text-lg font-black text-white shadow-[0_5px_0_#65a30d]"
                >
                  {mode === "register" ? t.createAccount : t.enterAccount}
                </button>

                <button
                  onClick={() => setMode(mode === "register" ? "login" : "register")}
                  className="w-full rounded-2xl bg-slate-100 py-4 font-black text-slate-700"
                >
                  {mode === "register" ? t.hasAccount : t.noAccount}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {screen === "dashboard" && (
        <section className="mx-auto min-h-screen w-full max-w-6xl px-5 py-6 sm:px-8">
          <Header
            t={t}
            user={user}
            onLogin={() => {
              setMode("login");
              setScreen("auth");
            }}
            onRegister={() => {
              setMode("register");
              setScreen("auth");
            }}
            onDashboard={() => setScreen("dashboard")}
            onLogout={logout}
          />

          <div className="grid gap-6 py-8 lg:grid-cols-[0.75fr_1.25fr]">
            <aside className="rounded-[2rem] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-lime-400 text-3xl font-black">
                  ў
                </div>
                <div>
                  <p className="font-black text-slate-400">{t.profile}</p>
                  <h2 className="text-2xl font-black">
                    {user?.email || "Guest"}
                  </h2>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <InfoRow label={t.registeredAt} value={user?.registeredAt || "—"} />
                <InfoRow label={t.learned} value={`${user?.learnedWords || 0}/100`} />
                <InfoRow
                  label={t.completedLessons}
                  value={`${user?.completedLessons || 0}`}
                />
                <InfoRow label={t.streak} value={`${user?.streak || 0}`} />
              </div>

              <button
                onClick={resetProgress}
                className="mt-5 w-full rounded-2xl bg-slate-100 py-3 font-black text-slate-700"
              >
                {t.reset}
              </button>
            </aside>

            <section className="space-y-5">
              <div>
                <p className="font-black uppercase tracking-[0.2em] text-lime-700">
                  {t.dashboard}
                </p>
                <h1 className="text-5xl font-black">{t.course1Title}</h1>
              </div>

              <StatsCards t={t} user={user} />

              <div className="grid gap-4 md:grid-cols-2">
                <article className="rounded-[2rem] bg-white p-6 shadow-sm">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-100 text-2xl font-black text-lime-700">
                    1
                  </div>
                  <p className="font-black text-lime-700">{t.available}</p>
                  <h2 className="mt-2 text-3xl font-black">{t.course1}</h2>
                  <p className="mt-3 text-slate-600">{t.course1Text}</p>
                  <button
                    onClick={() => setScreen("words")}
                    className="mt-6 w-full rounded-2xl bg-lime-500 py-4 text-lg font-black text-white shadow-[0_5px_0_#65a30d]"
                  >
                    {t.learnWords}
                  </button>
                </article>

                <article className="rounded-[2rem] bg-white/70 p-6 shadow-sm">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl font-black text-slate-500">
                    2
                  </div>
                  <p className="font-black text-slate-400">
                    {user && user.openedCourse >= 2 ? t.available : t.locked}
                  </p>
                  <h2 className="mt-2 text-3xl font-black">{t.course2}</h2>
                  <p className="mt-3 text-slate-600">{t.course2Text}</p>
                  <button
                    disabled={!user || user.openedCourse < 2}
                    className="mt-6 w-full rounded-2xl bg-slate-200 py-4 text-lg font-black text-slate-500 disabled:cursor-not-allowed"
                  >
                    {user && user.openedCourse >= 2 ? t.start : t.locked}
                  </button>
                </article>
              </div>
            </section>
          </div>
        </section>
      )}

      {screen === "words" && (
        <section className="mx-auto min-h-screen w-full max-w-3xl px-5 py-6 sm:px-8">
          <Header
            t={t}
            user={user}
            onLogin={() => {
              setMode("login");
              setScreen("auth");
            }}
            onRegister={() => {
              setMode("register");
              setScreen("auth");
            }}
            onDashboard={() => setScreen("dashboard")}
            onLogout={logout}
          />

          <div className="py-8">
            <button
              onClick={() => setScreen("dashboard")}
              className="mb-5 rounded-2xl bg-white px-5 py-3 font-black text-slate-700 shadow-sm"
            >
              ← {t.back}
            </button>

            <div className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-lime-300">
                    {t.learnWords}
                  </p>
                  <h1 className="text-3xl font-black">{t.chooseTranslation}</h1>
                </div>
                <span className="rounded-full bg-lime-400 px-3 py-1 text-sm font-black text-slate-950">
                  {user?.learnedWords || 0}/100
                </span>
              </div>

              <div className="rounded-3xl bg-white p-6 text-slate-950">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
                  {t.russianWord}
                </p>
                <p className="mt-2 text-6xl font-black">{currentWord.ru}</p>
              </div>

              <div className="mt-4 grid gap-3">
                {options.map((option) => {
                  const isCorrect = option === currentWord.be;
                  const isSelected = answer === option;

                  return (
                    <button
                      key={option}
                      onClick={() => chooseAnswer(option)}
                      disabled={Boolean(answer)}
                      className={`rounded-2xl border-2 px-5 py-4 text-left text-lg font-black transition ${
                        answer && isCorrect
                          ? "border-lime-400 bg-lime-400 text-slate-950"
                          : isSelected
                          ? "border-red-400 bg-red-400 text-white"
                          : "border-white/10 bg-white/10 hover:bg-lime-400 hover:text-slate-950"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {answer && (
                <div className="mt-4 rounded-2xl bg-white p-4 font-black text-slate-950">
                  {answer === currentWord.be
                    ? t.correct
                    : `${t.wrong} ${currentWord.be}`}
                </div>
              )}

              {answer && (
                <button
                  onClick={nextWord}
                  className="mt-4 w-full rounded-2xl bg-lime-500 py-4 text-lg font-black text-white shadow-[0_5px_0_#65a30d]"
                >
                  {t.next}
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      <LanguageSwitch language={language} setLanguage={changeLanguage} t={t} />
    </main>
  );
}

function Header({
  t,
  user,
  onLogin,
  onRegister,
  onDashboard,
  onLogout,
}: {
  t: typeof text.ru;
  user: StoredUser | null;
  onLogin: () => void;
  onRegister: () => void;
  onDashboard: () => void;
  onLogout: () => void;
}) {
  return (
    <header className="flex items-center justify-between rounded-3xl border border-lime-200 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
      <button onClick={onDashboard} className="flex items-center gap-3 text-left">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400 text-2xl font-black shadow-sm">
          ў
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lime-700">
            Belarusian Learning
          </p>
          <h1 className="text-xl font-black">Вывучай беларускую мову</h1>
        </div>
      </button>

      <div className="hidden items-center gap-3 sm:flex">
        {user ? (
          <>
            <button
              onClick={onDashboard}
              className="rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
            >
              {t.dashboard}
            </button>
            <button
              onClick={onLogout}
              className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white"
            >
              {t.logout}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onLogin}
              className="rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
            >
              {t.login}
            </button>
            <button
              onClick={onRegister}
              className="rounded-2xl bg-lime-500 px-5 py-3 font-black text-white shadow-[0_5px_0_#65a30d] transition hover:-translate-y-0.5"
            >
              {t.register}
            </button>
          </>
        )}
      </div>
    </header>
  );
}

function StatsCards({ t, user }: { t: typeof text.ru; user: StoredUser | null }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-3xl font-black text-lime-600">
          {user?.learnedWords || 0}
        </p>
        <p className="font-bold text-slate-500">{t.learned}</p>
      </div>
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-3xl font-black text-orange-500">
          {user?.openedCourse || 1}
        </p>
        <p className="font-bold text-slate-500">{t.opened}</p>
      </div>
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-3xl font-black text-sky-500">A1</p>
        <p className="font-bold text-slate-500">{t.level}</p>
      </div>
    </div>
  );
}

function WordPreview({ t }: { t: typeof text.ru }) {
  return (
    <aside className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl">
      <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-lime-300">{t.learnWords}</p>
            <h3 className="text-2xl font-black">{t.chooseTranslation}</h3>
          </div>
          <span className="rounded-full bg-lime-400 px-3 py-1 text-sm font-black text-slate-950">
            1/100
          </span>
        </div>

        <div className="rounded-3xl bg-white p-6 text-slate-950">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
            {t.russianWord}
          </p>
          <p className="mt-2 text-5xl font-black">вода</p>
        </div>

        <div className="mt-4 grid gap-3">
          {["вада", "зямля", "воўк"].map((word) => (
            <button
              key={word}
              className="rounded-2xl border-2 border-white/10 bg-white/10 px-5 py-4 text-left text-lg font-black transition hover:bg-lime-400 hover:text-slate-950"
            >
              {word}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <span className="font-bold text-slate-500">{label}</span>
      <span className="font-black">{value}</span>
    </div>
  );
}

function LanguageSwitch({
  language,
  setLanguage,
  t,
}: {
  language: Language;
  setLanguage: (language: Language) => void;
  t: typeof text.ru;
}) {
  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-slate-200 bg-white p-2 shadow-xl">
      <div className="flex items-center gap-2">
        <span className="hidden pl-3 text-sm font-black text-slate-500 sm:block">
          {t.language}
        </span>
        <button
          onClick={() => setLanguage("ru")}
          className={`rounded-full px-4 py-2 text-sm font-black transition ${
            language === "ru"
              ? "bg-lime-500 text-white"
              : "bg-transparent text-slate-500"
          }`}
        >
          RU
        </button>
        <button
          onClick={() => setLanguage("be")}
          className={`rounded-full px-4 py-2 text-sm font-black transition ${
            language === "be"
              ? "bg-lime-500 text-white"
              : "bg-transparent text-slate-500"
          }`}
        >
          BY
        </button>
      </div>
    </div>
  );
}
