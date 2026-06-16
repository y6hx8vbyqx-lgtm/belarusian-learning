from pathlib import Path

code = r'''"use client";

import { useEffect, useMemo, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
  getAuth,
} from "firebase/auth";
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

type Language = "ru" | "be";
type Screen = "landing" | "auth" | "dashboard" | "words";
type AuthMode = "login" | "register";

type Profile = {
  email: string;
  learnedWords: number;
  completedLessons: number;
  streak: number;
  openedCourse: number;
  registeredAtText: string;
};

const firebaseConfig = {
  apiKey: "AIzaSyC3xr9pXw4OwifjdoxGH1xEYZYl9o86Y6w",
  authDomain: "belarusian-learning-7fa42.firebaseapp.com",
  projectId: "belarusian-learning-7fa42",
  storageBucket: "belarusian-learning-7fa42.firebasestorage.app",
  messagingSenderId: "1028686275944",
  appId: "1:1028686275944:web:55df5a9474062778a062dd",
  measurementId: "G-MMJLKNZ4QH",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const LANGUAGE_KEY = "belarusian-learning-language";

const words = [
  { ru: "вода", be: "вада", wrong: ["зямля", "воўк"], example: "Я п'ю ваду." },
  { ru: "земля", be: "зямля", wrong: ["людзі", "вада"], example: "Гэта мая зямля." },
  { ru: "люди", be: "людзі", wrong: ["дом", "дзень"], example: "Людзі ідуць дадому." },
  { ru: "волк", be: "воўк", wrong: ["сын", "хлеб"], example: "Воўк жыве ў лесе." },
  { ru: "дом", be: "дом", wrong: ["кніга", "горад"], example: "Гэта мой дом." },
  { ru: "книга", be: "кніга", wrong: ["сястра", "вада"], example: "Я чытаю кнігу." },
  { ru: "город", be: "горад", wrong: ["бацька", "малако"], example: "Мінск — вялікі горад." },
  { ru: "день", be: "дзень", wrong: ["ноч", "зямля"], example: "Добры дзень!" },
  { ru: "мать", be: "маці", wrong: ["бацька", "брат"], example: "Мая маці дома." },
  { ru: "отец", be: "бацька", wrong: ["сястра", "маці"], example: "Мой бацька працуе." },
  { ru: "брат", be: "брат", wrong: ["сястра", "дачка"], example: "Мой брат вучыцца." },
  { ru: "сестра", be: "сястра", wrong: ["бацька", "сын"], example: "Мая сястра чытае." },
];

const text = {
  ru: {
    login: "Войти",
    register: "Зарегистрироваться",
    logout: "Выйти",
    heroBadge: "A1 для русскоязычных · без смешения русского и белорусского",
    heroTitle: "Учим белорусский как игру, а не как скучный учебник.",
    heroText:
      "Слова, короткие уроки, тесты и прогресс. Сначала базовые слова, затем открываются новые курсы.",
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
    resetPassword: "Сбросить пароль",
    dashboard: "Главная",
    profile: "Профиль",
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
    chooseAudio: "Что ты услышал?",
    trueFalse: "Верно или неверно?",
    finishPhrase: "Выбери пропущенное слово",
    russianWord: "Русское слово",
    listen: "Слушать",
    correct: "Правильно!",
    wrong: "Не совсем. Правильный ответ:",
    next: "Дальше",
    back: "Назад",
    language: "Язык сайта",
    loading: "Загрузка...",
    needLogin: "Чтобы учить слова, сначала войди или зарегистрируйся.",
    resetSent: "Письмо для сброса пароля отправлено.",
    true: "Верно",
    false: "Неверно",
  },
  be: {
    login: "Увайсці",
    register: "Зарэгістравацца",
    logout: "Выйсці",
    heroBadge: "A1 для рускамоўных · без змешвання рускай і беларускай",
    heroTitle: "Вучым беларускую як гульню, а не як сумны падручнік.",
    heroText:
      "Словы, кароткія ўрокі, тэсты і прагрэс. Спачатку базавыя словы, потым адкрываюцца новыя курсы.",
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
    resetPassword: "Скінуць пароль",
    dashboard: "Галоўная",
    profile: "Профіль",
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
    chooseAudio: "Што ты пачуў?",
    trueFalse: "Правільна ці не?",
    finishPhrase: "Выберы прапушчанае слова",
    russianWord: "Рускае слова",
    listen: "Слухаць",
    correct: "Правільна!",
    wrong: "Не зусім. Правільны адказ:",
    next: "Далей",
    back: "Назад",
    language: "Мова сайта",
    loading: "Загрузка...",
    needLogin: "Каб вучыць словы, спачатку ўвайдзі або зарэгіструйся.",
    resetSent: "Ліст для скіду пароля адпраўлены.",
    true: "Правільна",
    false: "Няправільна",
  },
};

function createEmptyProfile(firebaseUser: User): Profile {
  return {
    email: firebaseUser.email || "",
    learnedWords: 0,
    completedLessons: 0,
    streak: 1,
    openedCourse: 1,
    registeredAtText: new Date().toLocaleDateString("ru-RU"),
  };
}

function speak(textToSpeak: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.lang = "be-BY";
  utterance.rate = 0.85;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("ru");
  const [screen, setScreen] = useState<Screen>("landing");
  const [mode, setMode] = useState<AuthMode>("register");
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);

  const t = text[language];
  const currentWord = words[wordIndex % words.length];
  const taskType = wordIndex % 4;

  const options = useMemo(() => {
    return [currentWord.be, ...currentWord.wrong].sort(() => Math.random() - 0.5);
  }, [currentWord]);

  const audioOptions = useMemo(() => {
    return [currentWord.ru, ...currentWord.wrong.map((wrong) => {
      const found = words.find((word) => word.be === wrong);
      return found?.ru || wrong;
    })].sort(() => Math.random() - 0.5);
  }, [currentWord]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY) as Language | null;

    if (savedLanguage === "ru" || savedLanguage === "be") {
      setLanguage(savedLanguage);
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (!user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        setProfile(snapshot.data() as Profile);
      } else {
        const newProfile = createEmptyProfile(user);
        await setDoc(userRef, {
          ...newProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setProfile(newProfile);
      }

      setScreen("dashboard");
      setIsLoading(false);
    });

    return () => unsubscribe();
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

    try {
      if (mode === "register") {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const newProfile = createEmptyProfile(result.user);

        await setDoc(doc(db, "users", result.user.uid), {
          ...newProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        setProfile(newProfile);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      setEmail("");
      setPassword("");
      setScreen("dashboard");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ошибка входа.");
    }
  }

  async function handlePasswordReset() {
    setMessage("");

    if (!email.trim()) {
      setMessage("Введите email, чтобы сбросить пароль.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(t.resetSent);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ошибка сброса пароля.");
    }
  }

  async function logout() {
    await signOut(auth);
    setFirebaseUser(null);
    setProfile(null);
    setScreen("landing");
  }

  async function completeCorrectAnswer() {
    if (!firebaseUser || !profile) return;

    const nextLearnedWords = Math.min(profile.learnedWords + 1, 100);
    const updatedProfile: Profile = {
      ...profile,
      learnedWords: nextLearnedWords,
      completedLessons: nextLearnedWords >= 100 ? 1 : profile.completedLessons,
      openedCourse: nextLearnedWords >= 100 ? 2 : 1,
    };

    setProfile(updatedProfile);

    await updateDoc(doc(db, "users", firebaseUser.uid), {
      learnedWords: updatedProfile.learnedWords,
      completedLessons: updatedProfile.completedLessons,
      openedCourse: updatedProfile.openedCourse,
      updatedAt: serverTimestamp(),
    });
  }

  async function chooseAnswer(option: string, correctAnswer: string) {
    if (!firebaseUser || !profile || answer) return;

    setAnswer(option);

    if (option === correctAnswer) {
      await completeCorrectAnswer();
    }
  }

  function nextWord() {
    setAnswer(null);
    setWordIndex((current) => current + 1);
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7ef]">
        <p className="text-2xl font-black text-slate-700">{t.loading}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7ef] pb-24 text-slate-950">
      {screen === "landing" && (
        <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8">
          <Header
            t={t}
            user={firebaseUser}
            onLogin={() => {
              setMode("login");
              setScreen("auth");
            }}
            onRegister={() => {
              setMode("register");
              setScreen("auth");
            }}
            onDashboard={() => setScreen(firebaseUser ? "dashboard" : "landing")}
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
                  onClick={() => setScreen(firebaseUser ? "dashboard" : "auth")}
                  className="rounded-2xl border-2 border-slate-200 bg-white px-7 py-4 text-center text-lg font-black text-slate-700 transition hover:bg-slate-50"
                >
                  {t.seeCourse}
                </button>
              </div>

              <StatsCards t={t} profile={profile} />
            </section>

            <WordPreview t={t} />
          </div>
        </section>
      )}

      {screen === "auth" && (
        <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-6 sm:px-8">
          <Header
            t={t}
            user={firebaseUser}
            onLogin={() => setMode("login")}
            onRegister={() => setMode("register")}
            onDashboard={() => setScreen(firebaseUser ? "dashboard" : "landing")}
            onLogout={logout}
          />

          <div className="flex flex-1 items-center justify-center py-10">
            <div className="w-full rounded-[2rem] bg-white p-6 shadow-xl sm:p-8">
              <p className="font-black uppercase tracking-[0.2em] text-lime-700">
                Firebase Auth
              </p>
              <h1 className="mt-3 text-4xl font-black">{t.authTitle}</h1>

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
                  <p className="rounded-2xl bg-amber-50 p-4 font-bold text-amber-800">
                    {message}
                  </p>
                )}

                <button
                  onClick={handleAuth}
                  className="w-full rounded-2xl bg-lime-500 py-4 text-lg font-black text-white shadow-[0_5px_0_#65a30d]"
                >
                  {mode === "register" ? t.createAccount : t.enterAccount}
                </button>

                {mode === "login" && (
                  <button
                    onClick={handlePasswordReset}
                    className="w-full rounded-2xl bg-slate-100 py-4 font-black text-slate-700"
                  >
                    {t.resetPassword}
                  </button>
                )}

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
            user={firebaseUser}
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
                  <h2 className="break-all text-2xl font-black">
                    {profile?.email || firebaseUser?.email || "User"}
                  </h2>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <InfoRow label={t.registeredAt} value={profile?.registeredAtText || "—"} />
                <InfoRow label={t.learned} value={`${profile?.learnedWords || 0}/100`} />
                <InfoRow
                  label={t.completedLessons}
                  value={`${profile?.completedLessons || 0}`}
                />
                <InfoRow label={t.streak} value={`${profile?.streak || 0}`} />
              </div>
            </aside>

            <section className="space-y-5">
              <div>
                <p className="font-black uppercase tracking-[0.2em] text-lime-700">
                  {t.dashboard}
                </p>
                <h1 className="text-5xl font-black">{t.course1Title}</h1>
              </div>

              <StatsCards t={t} profile={profile} />

              <div className="grid gap-4 md:grid-cols-2">
                <article className="rounded-[2rem] bg-white p-6 shadow-sm">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-100 text-2xl font-black text-lime-700">
                    1
                  </div>
                  <p className="font-black text-lime-700">{t.available}</p>
                  <h2 className="mt-2 text-3xl font-black">{t.course1}</h2>
                  <p className="mt-3 text-slate-600">{t.course1Text}</p>
                  <button
                    onClick={() => {
                      if (!firebaseUser) {
                        setMessage(t.needLogin);
                        setMode("login");
                        setScreen("auth");
                        return;
                      }

                      setScreen("words");
                    }}
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
                    {profile && profile.openedCourse >= 2 ? t.available : t.locked}
                  </p>
                  <h2 className="mt-2 text-3xl font-black">{t.course2}</h2>
                  <p className="mt-3 text-slate-600">{t.course2Text}</p>
                  <button
                    disabled={!profile || profile.openedCourse < 2}
                    className="mt-6 w-full rounded-2xl bg-slate-200 py-4 text-lg font-black text-slate-500 disabled:cursor-not-allowed"
                  >
                    {profile && profile.openedCourse >= 2 ? t.start : t.locked}
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
            user={firebaseUser}
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
                  <h1 className="text-3xl font-black">
                    {taskType === 0 && t.chooseTranslation}
                    {taskType === 1 && t.chooseAudio}
                    {taskType === 2 && t.trueFalse}
                    {taskType === 3 && t.finishPhrase}
                  </h1>
                </div>
                <span className="rounded-full bg-lime-400 px-3 py-1 text-sm font-black text-slate-950">
                  {profile?.learnedWords || 0}/100
                </span>
              </div>

              <TaskCard
                t={t}
                taskType={taskType}
                currentWord={currentWord}
                options={options}
                audioOptions={audioOptions}
                answer={answer}
                chooseAnswer={chooseAnswer}
              />

              {answer && (
                <div className="mt-4 rounded-2xl bg-white p-4 font-black text-slate-950">
                  {answer === currentWord.be ||
                  answer === currentWord.ru ||
                  answer === "true"
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

function TaskCard({
  t,
  taskType,
  currentWord,
  options,
  audioOptions,
  answer,
  chooseAnswer,
}: {
  t: typeof text.ru;
  taskType: number;
  currentWord: (typeof words)[number];
  options: string[];
  audioOptions: string[];
  answer: string | null;
  chooseAnswer: (option: string, correctAnswer: string) => void;
}) {
  if (taskType === 1) {
    return (
      <>
        <div className="rounded-3xl bg-white p-6 text-slate-950">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
            Audio
          </p>
          <button
            onClick={() => speak(currentWord.be)}
            className="mt-3 rounded-2xl bg-lime-500 px-6 py-4 text-2xl font-black text-white shadow-[0_5px_0_#65a30d]"
          >
            🔊 {t.listen}
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          {audioOptions.map((option) => (
            <AnswerButton
              key={option}
              option={option}
              answer={answer}
              correctAnswer={currentWord.ru}
              onClick={() => chooseAnswer(option, currentWord.ru)}
            />
          ))}
        </div>
      </>
    );
  }

  if (taskType === 2) {
    return (
      <>
        <button
          onClick={() => speak(currentWord.be)}
          className="w-full rounded-3xl bg-white p-6 text-left text-slate-950"
        >
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
            Нажми на слово
          </p>
          <p className="mt-2 text-6xl font-black">{currentWord.be} 🔊</p>
          <p className="mt-3 text-lg font-bold text-slate-500">
            {currentWord.be} = {currentWord.ru}
          </p>
        </button>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => chooseAnswer("true", "true")}
            disabled={Boolean(answer)}
            className="rounded-2xl bg-lime-500 px-5 py-4 text-lg font-black text-white"
          >
            {t.true}
          </button>
          <button
            onClick={() => chooseAnswer("false", "true")}
            disabled={Boolean(answer)}
            className="rounded-2xl bg-red-500 px-5 py-4 text-lg font-black text-white"
          >
            {t.false}
          </button>
        </div>
      </>
    );
  }

  if (taskType === 3) {
    return (
      <>
        <div className="rounded-3xl bg-white p-6 text-slate-950">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
            Прыклад
          </p>
          <p className="mt-2 text-3xl font-black">
            {currentWord.example.replace(currentWord.be, "_____")}
          </p>
        </div>

        <div className="mt-4 grid gap-3">
          {options.map((option) => (
            <AnswerButton
              key={option}
              option={option}
              answer={answer}
              correctAnswer={currentWord.be}
              onClick={() => chooseAnswer(option, currentWord.be)}
            />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="rounded-3xl bg-white p-6 text-slate-950">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
          {t.russianWord}
        </p>
        <p className="mt-2 text-6xl font-black">{currentWord.ru}</p>
      </div>

      <div className="mt-4 grid gap-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => {
              speak(option);
              chooseAnswer(option, currentWord.be);
            }}
            disabled={Boolean(answer)}
            className={`rounded-2xl border-2 px-5 py-4 text-left text-lg font-black transition ${
              answer && option === currentWord.be
                ? "border-lime-400 bg-lime-400 text-slate-950"
                : answer === option
                ? "border-red-400 bg-red-400 text-white"
                : "border-white/10 bg-white/10 hover:bg-lime-400 hover:text-slate-950"
            }`}
          >
            {option} <span className="float-right">🔊</span>
          </button>
        ))}
      </div>
    </>
  );
}

function AnswerButton({
  option,
  answer,
  correctAnswer,
  onClick,
}: {
  option: string;
  answer: string | null;
  correctAnswer: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={Boolean(answer)}
      className={`rounded-2xl border-2 px-5 py-4 text-left text-lg font-black transition ${
        answer && option === correctAnswer
          ? "border-lime-400 bg-lime-400 text-slate-950"
          : answer === option
          ? "border-red-400 bg-red-400 text-white"
          : "border-white/10 bg-white/10 hover:bg-lime-400 hover:text-slate-950"
      }`}
    >
      {option}
    </button>
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
  user: User | null;
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

function StatsCards({ t, profile }: { t: typeof text.ru; profile: Profile | null }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-3xl font-black text-lime-600">
          {profile?.learnedWords || 0}
        </p>
        <p className="font-bold text-slate-500">{t.learned}</p>
      </div>
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-3xl font-black text-orange-500">
          {profile?.openedCourse || 1}
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
              onClick={() => speak(word)}
              className="rounded-2xl border-2 border-white/10 bg-white/10 px-5 py-4 text-left text-lg font-black transition hover:bg-lime-400 hover:text-slate-950"
            >
              {word} <span className="float-right">🔊</span>
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
'''

path = Path("/mnt/data/page-tsx-duolingo-tasks-audio-firebase.txt")
path.write_text(code, encoding="utf-8")
print(f"Created {path}")
