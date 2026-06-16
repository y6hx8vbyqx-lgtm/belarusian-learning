"use client";

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
type Screen = "landing" | "auth" | "dashboard" | "lesson";
type AuthMode = "login" | "register";

type Profile = {
  email: string;
  learnedWords: number;
  completedLessons: number;
  streak: number;
  openedCourse: number;
  registeredAtText: string;
};

type Word = {
  ru: string;
  be: string;
  wrongBe: string[];
  wrongRu: string[];
  example: string;
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

const words: Word[] = [
  { ru: "вода", be: "вада", wrongBe: ["зямля", "воўк"], wrongRu: ["земля", "волк"], example: "Я п'ю ваду." },
  { ru: "земля", be: "зямля", wrongBe: ["людзі", "вада"], wrongRu: ["люди", "вода"], example: "Гэта мая зямля." },
  { ru: "люди", be: "людзі", wrongBe: ["дом", "дзень"], wrongRu: ["дом", "день"], example: "Людзі ідуць дадому." },
  { ru: "волк", be: "воўк", wrongBe: ["сын", "хлеб"], wrongRu: ["сын", "хлеб"], example: "Воўк жыве ў лесе." },
  { ru: "дом", be: "дом", wrongBe: ["кніга", "горад"], wrongRu: ["книга", "город"], example: "Гэта мой дом." },
  { ru: "книга", be: "кніга", wrongBe: ["сястра", "вада"], wrongRu: ["сестра", "вода"], example: "Я чытаю кнігу." },
  { ru: "город", be: "горад", wrongBe: ["бацька", "малако"], wrongRu: ["отец", "молоко"], example: "Мінск — вялікі горад." },
  { ru: "день", be: "дзень", wrongBe: ["ноч", "зямля"], wrongRu: ["ночь", "земля"], example: "Добры дзень!" },
  { ru: "мать", be: "маці", wrongBe: ["бацька", "брат"], wrongRu: ["отец", "брат"], example: "Мая маці дома." },
  { ru: "отец", be: "бацька", wrongBe: ["сястра", "маці"], wrongRu: ["сестра", "мать"], example: "Мой бацька працуе." },
  { ru: "брат", be: "брат", wrongBe: ["сястра", "дачка"], wrongRu: ["сестра", "дочь"], example: "Мой брат вучыцца." },
  { ru: "сестра", be: "сястра", wrongBe: ["бацька", "сын"], wrongRu: ["отец", "сын"], example: "Мая сястра чытае." },
];

const text = {
  ru: {
    login: "Войти",
    register: "Зарегистрироваться",
    logout: "Выйти",
    heroTitle: "Белорусский для русскоязычных",
    heroText: "Учи слова, проходи задания, открывай курсы и не смешивай русский с белорусским.",
    start: "Начать",
    dashboard: "Главная",
    profile: "Профиль",
    registeredAt: "Дата регистрации",
    learned: "слов изучено",
    completedLessons: "уроков пройдено",
    streak: "серия дней",
    opened: "курс открыт",
    authTitle: "Вход или регистрация",
    email: "Email",
    password: "Пароль",
    createAccount: "Создать аккаунт",
    enterAccount: "Войти",
    hasAccount: "Уже есть аккаунт? Войти",
    noAccount: "Нет аккаунта? Зарегистрироваться",
    resetPassword: "Сбросить пароль",
    resetSent: "Письмо для сброса пароля отправлено",
    courseMap: "Карта курса",
    course1: "Курс 1: Основы",
    course2: "Курс 2: Семья и время",
    course3: "Курс 3: Разговоры",
    available: "Доступно",
    locked: "Закрыто",
    lesson1: "Урок 1",
    lessonWords: "Базовые слова",
    lessonPronunciation: "Произношение",
    lessonPhrases: "Фразы",
    startLesson: "Начать урок",
    chooseTranslation: "Выбери перевод",
    chooseAudio: "Что ты услышал?",
    trueFalse: "Верно или неверно?",
    fillBlank: "Выбери пропущенное слово",
    ruWord: "Русское слово",
    listen: "Слушать",
    correct: "Правильно!",
    wrong: "Не совсем. Правильный ответ:",
    next: "Дальше",
    back: "Назад",
    language: "Язык",
    true: "Верно",
    false: "Неверно",
    loading: "Загрузка...",
  },
  be: {
    login: "Увайсці",
    register: "Зарэгістравацца",
    logout: "Выйсці",
    heroTitle: "Беларуская для рускамоўных",
    heroText: "Вучы словы, праходзь заданні, адкрывай курсы і не змешвай рускую з беларускай.",
    start: "Пачаць",
    dashboard: "Галоўная",
    profile: "Профіль",
    registeredAt: "Дата рэгістрацыі",
    learned: "слоў вывучана",
    completedLessons: "урокаў пройдзена",
    streak: "серыя дзён",
    opened: "курс адкрыты",
    authTitle: "Уваход або рэгістрацыя",
    email: "Email",
    password: "Пароль",
    createAccount: "Стварыць акаўнт",
    enterAccount: "Увайсці",
    hasAccount: "Ужо ёсць акаўнт? Увайсці",
    noAccount: "Няма акаўнта? Зарэгістравацца",
    resetPassword: "Скінуць пароль",
    resetSent: "Ліст для скіду пароля адпраўлены",
    courseMap: "Мапа курса",
    course1: "Курс 1: Асновы",
    course2: "Курс 2: Сям'я і час",
    course3: "Курс 3: Размовы",
    available: "Даступна",
    locked: "Закрыта",
    lesson1: "Урок 1",
    lessonWords: "Базавыя словы",
    lessonPronunciation: "Вымаўленне",
    lessonPhrases: "Фразы",
    startLesson: "Пачаць урок",
    chooseTranslation: "Выберы пераклад",
    chooseAudio: "Што ты пачуў?",
    trueFalse: "Правільна ці не?",
    fillBlank: "Выберы прапушчанае слова",
    ruWord: "Рускае слова",
    listen: "Слухаць",
    correct: "Правільна!",
    wrong: "Не зусім. Правільны адказ:",
    next: "Далей",
    back: "Назад",
    language: "Мова",
    true: "Правільна",
    false: "Няправільна",
    loading: "Загрузка...",
  },
};

function speak(value: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const voice = new SpeechSynthesisUtterance(value);
  voice.lang = "be-BY";
  voice.rate = 0.85;
  window.speechSynthesis.speak(voice);
}

function createProfile(user: User): Profile {
  return {
    email: user.email || "",
    learnedWords: 0,
    completedLessons: 0,
    streak: 1,
    openedCourse: 1,
    registeredAtText: new Date().toLocaleDateString("ru-RU"),
  };
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
  const [taskIndex, setTaskIndex] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);

  const t = text[language];
  const currentWord = words[taskIndex % words.length];
  const taskType = taskIndex % 4;

  const beOptions = useMemo(
    () => [currentWord.be, ...currentWord.wrongBe].sort(() => Math.random() - 0.5),
    [currentWord]
  );

  const ruOptions = useMemo(
    () => [currentWord.ru, ...currentWord.wrongRu].sort(() => Math.random() - 0.5),
    [currentWord]
  );

  useEffect(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY) as Language | null;
    if (savedLanguage === "ru" || savedLanguage === "be") setLanguage(savedLanguage);

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
        const newProfile = createProfile(user);
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

  function setSiteLanguage(next: Language) {
    setLanguage(next);
    localStorage.setItem(LANGUAGE_KEY, next);
  }

  async function handleAuth() {
    setMessage("");

    if (!email || !password) {
      setMessage("Введите email и пароль");
      return;
    }

    if (password.length < 6) {
      setMessage("Пароль должен быть минимум 6 символов");
      return;
    }

    try {
      if (mode === "register") {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const newProfile = createProfile(result.user);
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
      setMessage(error instanceof Error ? error.message : "Ошибка");
    }
  }

  async function resetPassword() {
    if (!email) {
      setMessage("Введите email");
      return;
    }

    await sendPasswordResetEmail(auth, email);
    setMessage(t.resetSent);
  }

  async function logout() {
    await signOut(auth);
    setScreen("landing");
  }

  async function markCorrect() {
    if (!firebaseUser || !profile) return;

    const learnedWords = Math.min(profile.learnedWords + 1, 100);
    const updated = {
      ...profile,
      learnedWords,
      openedCourse: learnedWords >= 100 ? 2 : 1,
      completedLessons: learnedWords >= 100 ? 1 : profile.completedLessons,
    };

    setProfile(updated);

    await updateDoc(doc(db, "users", firebaseUser.uid), {
      learnedWords: updated.learnedWords,
      openedCourse: updated.openedCourse,
      completedLessons: updated.completedLessons,
      updatedAt: serverTimestamp(),
    });
  }

  async function choose(option: string, correct: string) {
    if (answer) return;
    setAnswer(option);

    if (option === correct) {
      await markCorrect();
    }
  }

  function nextTask() {
    setAnswer(null);
    setTaskIndex((value) => value + 1);
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7ef]">
        <p className="text-2xl font-black">{t.loading}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7ef] pb-24 text-slate-950">
      <Header
        t={t}
        user={firebaseUser}
        goHome={() => setScreen(firebaseUser ? "dashboard" : "landing")}
        login={() => {
          setMode("login");
          setScreen("auth");
        }}
        register={() => {
          setMode("register");
          setScreen("auth");
        }}
        logout={logout}
      />

      {screen === "landing" && (
        <section className="mx-auto grid min-h-[80vh] max-w-6xl items-center gap-8 px-5 py-10 lg:grid-cols-2">
          <div className="space-y-6">
            <p className="inline-flex rounded-full bg-white px-4 py-2 font-black text-lime-700 shadow-sm">
              A1 · Belarusian Learning
            </p>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">
              {t.heroTitle}
            </h1>
            <p className="max-w-xl text-lg leading-8 text-slate-600">{t.heroText}</p>
            <button
              onClick={() => {
                setMode("register");
                setScreen("auth");
              }}
              className="rounded-2xl bg-lime-500 px-8 py-4 text-lg font-black text-white shadow-[0_6px_0_#65a30d]"
            >
              {t.start}
            </button>
          </div>

          <DemoCard t={t} />
        </section>
      )}

      {screen === "auth" && (
        <section className="mx-auto flex max-w-xl items-center justify-center px-5 py-12">
          <div className="w-full rounded-[2rem] bg-white p-6 shadow-xl">
            <h1 className="text-4xl font-black">{t.authTitle}</h1>
            <div className="mt-6 space-y-3">
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t.email}
                type="email"
                className="w-full rounded-2xl border px-4 py-4 font-bold outline-none focus:border-lime-500"
              />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t.password}
                type="password"
                className="w-full rounded-2xl border px-4 py-4 font-bold outline-none focus:border-lime-500"
              />

              {message && (
                <p className="rounded-2xl bg-amber-50 p-4 font-bold text-amber-800">
                  {message}
                </p>
              )}

              <button
                onClick={handleAuth}
                className="w-full rounded-2xl bg-lime-500 py-4 font-black text-white shadow-[0_5px_0_#65a30d]"
              >
                {mode === "register" ? t.createAccount : t.enterAccount}
              </button>

              {mode === "login" && (
                <button
                  onClick={resetPassword}
                  className="w-full rounded-2xl bg-slate-100 py-4 font-black"
                >
                  {t.resetPassword}
                </button>
              )}

              <button
                onClick={() => setMode(mode === "register" ? "login" : "register")}
                className="w-full rounded-2xl bg-slate-100 py-4 font-black"
              >
                {mode === "register" ? t.hasAccount : t.noAccount}
              </button>
            </div>
          </div>
        </section>
      )}

      {screen === "dashboard" && (
        <section className="mx-auto grid max-w-6xl gap-6 px-5 py-8 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="space-y-5">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-lime-400 text-3xl font-black">
                  ў
                </div>
                <div>
                  <p className="font-black text-slate-400">{t.profile}</p>
                  <h2 className="break-all text-xl font-black">
                    {profile?.email || firebaseUser?.email}
                  </h2>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <InfoRow label={t.registeredAt} value={profile?.registeredAtText || "—"} />
                <InfoRow label={t.learned} value={`${profile?.learnedWords || 0}/100`} />
                <InfoRow label={t.completedLessons} value={`${profile?.completedLessons || 0}`} />
                <InfoRow label={t.streak} value={`${profile?.streak || 0}`} />
              </div>
            </div>

            <Stats profile={profile} t={t} />
          </aside>

          <section className="space-y-5">
            <div>
              <p className="font-black uppercase tracking-[0.2em] text-lime-700">
                {t.courseMap}
              </p>
              <h1 className="text-5xl font-black">{t.dashboard}</h1>
            </div>

            <div className="grid gap-4">
              <CourseCard
                title={t.course1}
                description="Алфавіт, вада, зямля, людзі, воўк, дом, кніга."
                status={t.available}
                active
                button={t.startLesson}
                onClick={() => setScreen("lesson")}
              />
              <CourseCard
                title={t.course2}
                description={t.course2}
                status={profile && profile.openedCourse >= 2 ? t.available : t.locked}
                active={Boolean(profile && profile.openedCourse >= 2)}
                button={profile && profile.openedCourse >= 2 ? t.startLesson : t.locked}
                onClick={() => profile && profile.openedCourse >= 2 && setScreen("lesson")}
              />
              <CourseCard
                title={t.course3}
                description="Крама, кавярня, транспарт, горад."
                status={t.locked}
                active={false}
                button={t.locked}
                onClick={() => {}}
              />
            </div>
          </section>
        </section>
      )}

      {screen === "lesson" && (
        <section className="mx-auto max-w-3xl px-5 py-8">
          <button
            onClick={() => setScreen("dashboard")}
            className="mb-5 rounded-2xl bg-white px-5 py-3 font-black shadow-sm"
          >
            ← {t.back}
          </button>

          <div className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-lime-300">{t.lessonWords}</p>
                <h1 className="text-3xl font-black">
                  {taskType === 0 && t.chooseTranslation}
                  {taskType === 1 && t.chooseAudio}
                  {taskType === 2 && t.trueFalse}
                  {taskType === 3 && t.fillBlank}
                </h1>
              </div>
              <span className="rounded-full bg-lime-400 px-3 py-1 text-sm font-black text-slate-950">
                {profile?.learnedWords || 0}/100
              </span>
            </div>

            {taskType === 0 && (
              <TranslationTask
                t={t}
                word={currentWord}
                options={beOptions}
                answer={answer}
                choose={choose}
              />
            )}

            {taskType === 1 && (
              <AudioTask
                t={t}
                word={currentWord}
                options={ruOptions}
                answer={answer}
                choose={choose}
              />
            )}

            {taskType === 2 && (
              <TrueFalseTask t={t} word={currentWord} answer={answer} choose={choose} />
            )}

            {taskType === 3 && (
              <FillTask
                word={currentWord}
                options={beOptions}
                answer={answer}
                choose={choose}
              />
            )}

            {answer && (
              <>
                <div className="mt-4 rounded-2xl bg-white p-4 font-black text-slate-950">
                  {answer === currentWord.be ||
                  answer === currentWord.ru ||
                  answer === "true"
                    ? t.correct
                    : `${t.wrong} ${currentWord.be}`}
                </div>

                <button
                  onClick={nextTask}
                  className="mt-4 w-full rounded-2xl bg-lime-500 py-4 text-lg font-black text-white shadow-[0_5px_0_#65a30d]"
                >
                  {t.next}
                </button>
              </>
            )}
          </div>
        </section>
      )}

      <div className="fixed bottom-2 right-3 z-50 rounded-full bg-slate-950/70 px-3 py-1 text-[11px] font-bold text-white/70">
        v0.4.1-dashboard-tasks-firebase
      </div>

      <LanguageSwitch language={language} setLanguage={setSiteLanguage} t={t} />
    </main>
  );
}

function TranslationTask({
  t,
  word,
  options,
  answer,
  choose,
}: {
  t: typeof text.ru;
  word: Word;
  options: string[];
  answer: string | null;
  choose: (option: string, correct: string) => void;
}) {
  return (
    <>
      <div className="rounded-3xl bg-white p-6 text-slate-950">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
          {t.ruWord}
        </p>
        <p className="mt-2 text-6xl font-black">{word.ru}</p>
      </div>
      <OptionGrid options={options} answer={answer} correct={word.be} choose={choose} audio />
    </>
  );
}

function AudioTask({
  t,
  word,
  options,
  answer,
  choose,
}: {
  t: typeof text.ru;
  word: Word;
  options: string[];
  answer: string | null;
  choose: (option: string, correct: string) => void;
}) {
  return (
    <>
      <div className="rounded-3xl bg-white p-6 text-slate-950">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Audio</p>
        <button
          onClick={() => speak(word.be)}
          className="mt-3 rounded-2xl bg-lime-500 px-6 py-4 text-2xl font-black text-white shadow-[0_5px_0_#65a30d]"
        >
          🔊 {t.listen}
        </button>
      </div>
      <OptionGrid options={options} answer={answer} correct={word.ru} choose={choose} />
    </>
  );
}

function TrueFalseTask({
  t,
  word,
  answer,
  choose,
}: {
  t: typeof text.ru;
  word: Word;
  answer: string | null;
  choose: (option: string, correct: string) => void;
}) {
  return (
    <>
      <button
        onClick={() => speak(word.be)}
        className="w-full rounded-3xl bg-white p-6 text-left text-slate-950"
      >
        <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
          Нажми на слово
        </p>
        <p className="mt-2 text-6xl font-black">{word.be} 🔊</p>
        <p className="mt-3 text-xl font-black text-slate-500">
          {word.be} = {word.ru}
        </p>
      </button>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => choose("true", "true")}
          disabled={Boolean(answer)}
          className="rounded-2xl bg-lime-500 px-5 py-4 text-lg font-black text-white"
        >
          {t.true}
        </button>
        <button
          onClick={() => choose("false", "true")}
          disabled={Boolean(answer)}
          className="rounded-2xl bg-red-500 px-5 py-4 text-lg font-black text-white"
        >
          {t.false}
        </button>
      </div>
    </>
  );
}

function FillTask({
  word,
  options,
  answer,
  choose,
}: {
  word: Word;
  options: string[];
  answer: string | null;
  choose: (option: string, correct: string) => void;
}) {
  return (
    <>
      <div className="rounded-3xl bg-white p-6 text-slate-950">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
          Прыклад
        </p>
        <p className="mt-2 text-3xl font-black">
          {word.example.replace(word.be, "_____")}
        </p>
      </div>
      <OptionGrid options={options} answer={answer} correct={word.be} choose={choose} audio />
    </>
  );
}

function OptionGrid({
  options,
  answer,
  correct,
  choose,
  audio = false,
}: {
  options: string[];
  answer: string | null;
  correct: string;
  choose: (option: string, correct: string) => void;
  audio?: boolean;
}) {
  return (
    <div className="mt-4 grid gap-3">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => {
            if (audio) speak(option);
            choose(option, correct);
          }}
          disabled={Boolean(answer)}
          className={`rounded-2xl border-2 px-5 py-4 text-left text-lg font-black transition ${
            answer && option === correct
              ? "border-lime-400 bg-lime-400 text-slate-950"
              : answer === option
              ? "border-red-400 bg-red-400 text-white"
              : "border-white/10 bg-white/10 hover:bg-lime-400 hover:text-slate-950"
          }`}
        >
          {option} {audio && <span className="float-right">🔊</span>}
        </button>
      ))}
    </div>
  );
}

function Header({
  t,
  user,
  goHome,
  login,
  register,
  logout,
}: {
  t: typeof text.ru;
  user: User | null;
  goHome: () => void;
  login: () => void;
  register: () => void;
  logout: () => void;
}) {
  return (
    <header className="sticky top-3 z-40 mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-3xl border border-lime-200 bg-white/90 px-5 py-4 shadow-sm backdrop-blur">
      <button onClick={goHome} className="flex items-center gap-3 text-left">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400 text-2xl font-black">
          ў
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-lime-700">
            Belarusian Learning
          </p>
          <h1 className="text-lg font-black">Вывучай беларускую</h1>
        </div>
      </button>
      <div className="flex gap-2">
        {user ? (
          <>
            <button onClick={goHome} className="rounded-2xl bg-slate-100 px-4 py-3 font-black">
              {t.dashboard}
            </button>
            <button onClick={logout} className="rounded-2xl bg-slate-950 px-4 py-3 font-black text-white">
              {t.logout}
            </button>
          </>
        ) : (
          <>
            <button onClick={login} className="rounded-2xl bg-slate-100 px-4 py-3 font-black">
              {t.login}
            </button>
            <button onClick={register} className="rounded-2xl bg-lime-500 px-4 py-3 font-black text-white">
              {t.register}
            </button>
          </>
        )}
      </div>
    </header>
  );
}

function CourseCard({
  title,
  description,
  status,
  active,
  button,
  onClick,
}: {
  title: string;
  description: string;
  status: string;
  active: boolean;
  button: string;
  onClick: () => void;
}) {
  return (
    <article className={`rounded-[2rem] p-6 shadow-sm ${active ? "bg-white" : "bg-white/60"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`font-black ${active ? "text-lime-700" : "text-slate-400"}`}>
            {status}
          </p>
          <h2 className="mt-2 text-3xl font-black">{title}</h2>
          <p className="mt-3 text-slate-600">{description}</p>
        </div>
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-black ${active ? "bg-lime-100 text-lime-700" : "bg-slate-100 text-slate-400"}`}>
          {active ? "✓" : "🔒"}
        </div>
      </div>
      <button
        onClick={onClick}
        disabled={!active}
        className={`mt-6 w-full rounded-2xl py-4 text-lg font-black ${
          active
            ? "bg-lime-500 text-white shadow-[0_5px_0_#65a30d]"
            : "bg-slate-200 text-slate-500"
        }`}
      >
        {button}
      </button>
    </article>
  );
}

function DemoCard({ t }: { t: typeof text.ru }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl">
      <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
        <p className="font-black text-lime-300">{t.chooseTranslation}</p>
        <div className="mt-5 rounded-3xl bg-white p-6 text-slate-950">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
            {t.ruWord}
          </p>
          <p className="mt-2 text-5xl font-black">вода</p>
        </div>
        <div className="mt-4 grid gap-3">
          {["вада", "зямля", "воўк"].map((word) => (
            <button
              key={word}
              onClick={() => speak(word)}
              className="rounded-2xl bg-white/10 px-5 py-4 text-left text-lg font-black hover:bg-lime-400 hover:text-slate-950"
            >
              {word} <span className="float-right">🔊</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stats({ profile, t }: { profile: Profile | null; t: typeof text.ru }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
      <Stat value={profile?.learnedWords || 0} label={t.learned} />
      <Stat value={profile?.openedCourse || 1} label={t.opened} />
      <Stat value="A1" label="Level" />
    </div>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <p className="text-3xl font-black text-lime-600">{value}</p>
      <p className="font-bold text-slate-500">{label}</p>
    </div>
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
          className={`rounded-full px-4 py-2 text-sm font-black ${
            language === "ru" ? "bg-lime-500 text-white" : "text-slate-500"
          }`}
        >
          RU
        </button>
        <button
          onClick={() => setLanguage("be")}
          className={`rounded-full px-4 py-2 text-sm font-black ${
            language === "be" ? "bg-lime-500 text-white" : "text-slate-500"
          }`}
        >
          BY
        </button>
      </div>
    </div>
  );
}
