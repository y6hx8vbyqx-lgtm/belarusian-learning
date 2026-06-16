"use client";

import { useEffect, useMemo, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

const APP_VERSION = "v0.5.0-real-dashboard-lessons";

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

type Lang = "ru" | "be";
type Screen = "landing" | "auth" | "home" | "lesson";
type Mode = "login" | "register";

type Profile = {
  email: string;
  registeredAtText: string;
  learnedWords: number;
  completedLessons: number;
  streak: number;
  openedCourse: number;
};

const words = [
  { ru: "вода", be: "вада", wrongBe: ["зямля", "воўк"], wrongRu: ["земля", "волк"], example: "Я п'ю ваду." },
  { ru: "земля", be: "зямля", wrongBe: ["людзі", "вада"], wrongRu: ["люди", "вода"], example: "Гэта мая зямля." },
  { ru: "люди", be: "людзі", wrongBe: ["дом", "дзень"], wrongRu: ["дом", "день"], example: "Людзі ідуць дадому." },
  { ru: "волк", be: "воўк", wrongBe: ["сын", "хлеб"], wrongRu: ["сын", "хлеб"], example: "Воўк жыве ў лесе." },
  { ru: "дом", be: "дом", wrongBe: ["кніга", "горад"], wrongRu: ["книга", "город"], example: "Гэта мой дом." },
  { ru: "книга", be: "кніга", wrongBe: ["сястра", "вада"], wrongRu: ["сестра", "вода"], example: "Я чытаю кнігу." },
  { ru: "город", be: "горад", wrongBe: ["бацька", "малако"], wrongRu: ["отец", "молоко"], example: "Мінск — вялікі горад." },
  { ru: "день", be: "дзень", wrongBe: ["ноч", "зямля"], wrongRu: ["ночь", "земля"], example: "Добры дзень!" },
];

const tr = {
  ru: {
    login: "Войти",
    register: "Зарегистрироваться",
    logout: "Выйти",
    title: "Белорусский для русскоязычных",
    subtitle: "Курсы, задания, озвучка, прогресс и аккаунты через Firebase.",
    start: "Начать обучение",
    authTitle: "Вход / регистрация",
    email: "Email",
    password: "Пароль",
    create: "Создать аккаунт",
    enter: "Войти",
    switchLogin: "Уже есть аккаунт? Войти",
    switchRegister: "Нет аккаунта? Зарегистрироваться",
    reset: "Сбросить пароль",
    home: "Главная",
    profile: "Профиль",
    registered: "Дата регистрации",
    learned: "Изучено слов",
    lessons: "Пройдено уроков",
    streak: "Серия дней",
    map: "Карта курсов",
    course1: "Курс 1: Основы",
    course2: "Курс 2: Семья и время",
    course3: "Курс 3: Разговоры",
    open: "Доступно",
    locked: "Закрыто",
    lesson: "Урок",
    lessonWords: "Базовые слова",
    lessonAudio: "Аудио",
    lessonPhrase: "Фразы",
    go: "Начать урок",
    back: "Назад",
    chooseTranslation: "Выбери перевод",
    listenAndChoose: "Послушай и выбери",
    trueFalse: "Верно или неверно?",
    fillBlank: "Вставь слово",
    ruWord: "Русское слово",
    listen: "Слушать",
    correct: "Правильно!",
    wrong: "Неправильно. Ответ:",
    next: "Дальше",
    yes: "Верно",
    no: "Неверно",
    language: "Язык",
    loading: "Загрузка...",
  },
  be: {
    login: "Увайсці",
    register: "Зарэгістравацца",
    logout: "Выйсці",
    title: "Беларуская для рускамоўных",
    subtitle: "Курсы, заданні, агучка, прагрэс і акаўнты праз Firebase.",
    start: "Пачаць навучанне",
    authTitle: "Уваход / рэгістрацыя",
    email: "Email",
    password: "Пароль",
    create: "Стварыць акаўнт",
    enter: "Увайсці",
    switchLogin: "Ужо ёсць акаўнт? Увайсці",
    switchRegister: "Няма акаўнта? Зарэгістравацца",
    reset: "Скінуць пароль",
    home: "Галоўная",
    profile: "Профіль",
    registered: "Дата рэгістрацыі",
    learned: "Вывучана слоў",
    lessons: "Пройдзена ўрокаў",
    streak: "Серыя дзён",
    map: "Мапа курсаў",
    course1: "Курс 1: Асновы",
    course2: "Курс 2: Сям'я і час",
    course3: "Курс 3: Размовы",
    open: "Даступна",
    locked: "Закрыта",
    lesson: "Урок",
    lessonWords: "Базавыя словы",
    lessonAudio: "Аўдыя",
    lessonPhrase: "Фразы",
    go: "Пачаць урок",
    back: "Назад",
    chooseTranslation: "Выберы пераклад",
    listenAndChoose: "Паслухай і выберы",
    trueFalse: "Правільна ці не?",
    fillBlank: "Устаў слова",
    ruWord: "Рускае слова",
    listen: "Слухаць",
    correct: "Правільна!",
    wrong: "Няправільна. Адказ:",
    next: "Далей",
    yes: "Правільна",
    no: "Няправільна",
    language: "Мова",
    loading: "Загрузка...",
  },
};

function speak(value: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(value);
  utterance.lang = "be-BY";
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

function createProfile(user: User): Profile {
  return {
    email: user.email || "",
    registeredAtText: new Date().toLocaleDateString("ru-RU"),
    learnedWords: 0,
    completedLessons: 0,
    streak: 1,
    openedCourse: 1,
  };
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("ru");
  const [screen, setScreen] = useState<Screen>("landing");
  const [mode, setMode] = useState<Mode>("register");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [task, setTask] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);

  const t = tr[lang];
  const word = words[task % words.length];
  const taskType = task % 4;

  const beOptions = useMemo(() => [word.be, ...word.wrongBe].sort(() => Math.random() - 0.5), [word]);
  const ruOptions = useMemo(() => [word.ru, ...word.wrongRu].sort(() => Math.random() - 0.5), [word]);

  useEffect(() => {
    const saved = localStorage.getItem("site-lang");
    if (saved === "ru" || saved === "be") setLang(saved);

    return onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const ref = doc(db, "users", currentUser.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setProfile(snap.data() as Profile);
      } else {
        const newProfile = createProfile(currentUser);
        await setDoc(ref, { ...newProfile, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        setProfile(newProfile);
      }

      setScreen("home");
      setLoading(false);
    });
  }, []);

  function changeLang(value: Lang) {
    setLang(value);
    localStorage.setItem("site-lang", value);
  }

  async function authAction() {
    setMsg("");

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

      setScreen("home");
      setEmail("");
      setPassword("");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Ошибка");
    }
  }

  async function resetPassword() {
    if (!email) {
      setMsg("Введите email");
      return;
    }
    await sendPasswordResetEmail(auth, email);
    setMsg("Письмо отправлено");
  }

  async function logout() {
    await signOut(auth);
    setScreen("landing");
  }

  async function correctProgress() {
    if (!user || !profile) return;
    const learnedWords = Math.min(profile.learnedWords + 1, 100);
    const updated: Profile = {
      ...profile,
      learnedWords,
      completedLessons: learnedWords >= 100 ? 1 : profile.completedLessons,
      openedCourse: learnedWords >= 100 ? 2 : 1,
    };

    setProfile(updated);
    await updateDoc(doc(db, "users", user.uid), {
      learnedWords: updated.learnedWords,
      completedLessons: updated.completedLessons,
      openedCourse: updated.openedCourse,
      updatedAt: serverTimestamp(),
    });
  }

  async function choose(option: string, correct: string) {
    if (answer) return;
    setAnswer(option);
    if (option === correct) await correctProgress();
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f7f7ef] text-2xl font-black">{t.loading}</main>;
  }

  return (
    <main className="min-h-screen bg-[#f7f7ef] pb-28 text-slate-950">
      <Header t={t} user={user} goHome={() => setScreen(user ? "home" : "landing")} login={() => { setMode("login"); setScreen("auth"); }} register={() => { setMode("register"); setScreen("auth"); }} logout={logout} />

      {screen === "landing" && (
        <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-16 lg:grid-cols-2">
          <div>
            <p className="mb-5 inline-flex rounded-full bg-lime-100 px-4 py-2 font-black text-lime-700">A1 · Firebase · {APP_VERSION}</p>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">{t.title}</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">{t.subtitle}</p>
            <button onClick={() => { setMode("register"); setScreen("auth"); }} className="mt-7 rounded-2xl bg-lime-500 px-8 py-4 text-lg font-black text-white shadow-[0_6px_0_#65a30d]">{t.start}</button>
          </div>
          <DemoCard t={t} />
        </section>
      )}

      {screen === "auth" && (
        <section className="mx-auto max-w-xl px-5 py-12">
          <div className="rounded-[2rem] bg-white p-6 shadow-xl">
            <h1 className="text-4xl font-black">{t.authTitle}</h1>
            <p className="mt-2 text-sm font-bold text-lime-700">Firebase Auth активен · {APP_VERSION}</p>
            <div className="mt-6 space-y-3">
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.email} type="email" className="w-full rounded-2xl border px-4 py-4 font-bold outline-none focus:border-lime-500" />
              <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.password} type="password" className="w-full rounded-2xl border px-4 py-4 font-bold outline-none focus:border-lime-500" />
              {msg && <p className="rounded-2xl bg-amber-50 p-4 font-bold text-amber-800">{msg}</p>}
              <button onClick={authAction} className="w-full rounded-2xl bg-lime-500 py-4 font-black text-white shadow-[0_5px_0_#65a30d]">{mode === "register" ? t.create : t.enter}</button>
              {mode === "login" && <button onClick={resetPassword} className="w-full rounded-2xl bg-slate-100 py-4 font-black">{t.reset}</button>}
              <button onClick={() => setMode(mode === "register" ? "login" : "register")} className="w-full rounded-2xl bg-slate-100 py-4 font-black">{mode === "register" ? t.switchLogin : t.switchRegister}</button>
            </div>
          </div>
        </section>
      )}

      {screen === "home" && (
        <section className="mx-auto grid max-w-6xl gap-6 px-5 py-8 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="space-y-5">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-lime-400 text-3xl font-black">ў</div>
                <div>
                  <p className="font-black text-slate-400">{t.profile}</p>
                  <h2 className="break-all text-xl font-black">{profile?.email || user?.email}</h2>
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                <InfoRow label={t.registered} value={profile?.registeredAtText || "—"} />
                <InfoRow label={t.learned} value={`${profile?.learnedWords || 0}/100`} />
                <InfoRow label={t.lessons} value={`${profile?.completedLessons || 0}`} />
                <InfoRow label={t.streak} value={`${profile?.streak || 0}`} />
              </div>
            </div>
          </aside>

          <section>
            <p className="font-black uppercase tracking-[0.2em] text-lime-700">{t.map}</p>
            <h1 className="mt-2 text-5xl font-black">{t.home}</h1>
            <div className="mt-6 grid gap-4">
              <CourseCard title={t.course1} description={`${t.lessonWords} · ${t.lessonAudio} · ${t.lessonPhrase}`} status={t.open} active button={t.go} onClick={() => setScreen("lesson")} />
              <CourseCard title={t.course2} description="Местоимения, семья, числа, время." status={profile && profile.openedCourse >= 2 ? t.open : t.locked} active={Boolean(profile && profile.openedCourse >= 2)} button={profile && profile.openedCourse >= 2 ? t.go : t.locked} onClick={() => profile && profile.openedCourse >= 2 && setScreen("lesson")} />
              <CourseCard title={t.course3} description="Кафе, магазин, транспорт, город." status={t.locked} active={false} button={t.locked} onClick={() => {}} />
            </div>
          </section>
        </section>
      )}

      {screen === "lesson" && (
        <section className="mx-auto max-w-3xl px-5 py-8">
          <button onClick={() => setScreen("home")} className="mb-5 rounded-2xl bg-white px-5 py-3 font-black shadow-sm">← {t.back}</button>
          <div className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-lime-300">{t.lesson} 1 · {APP_VERSION}</p>
                <h1 className="text-3xl font-black">{[t.chooseTranslation, t.listenAndChoose, t.trueFalse, t.fillBlank][taskType]}</h1>
              </div>
              <span className="rounded-full bg-lime-400 px-3 py-1 text-sm font-black text-slate-950">{profile?.learnedWords || 0}/100</span>
            </div>

            {taskType === 0 && <TranslationTask t={t} word={word} options={beOptions} answer={answer} choose={choose} />}
            {taskType === 1 && <AudioTask t={t} word={word} options={ruOptions} answer={answer} choose={choose} />}
            {taskType === 2 && <TrueFalseTask t={t} word={word} answer={answer} choose={choose} />}
            {taskType === 3 && <FillTask word={word} options={beOptions} answer={answer} choose={choose} />}

            {answer && (
              <>
                <div className="mt-4 rounded-2xl bg-white p-4 font-black text-slate-950">
                  {answer === word.be || answer === word.ru || answer === "true" ? t.correct : `${t.wrong} ${word.be}`}
                </div>
                <button onClick={() => { setAnswer(null); setTask((v) => v + 1); }} className="mt-4 w-full rounded-2xl bg-lime-500 py-4 text-lg font-black text-white shadow-[0_5px_0_#65a30d]">{t.next}</button>
              </>
            )}
          </div>
        </section>
      )}

      <div className="fixed bottom-2 right-3 z-50 rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-black text-white">{APP_VERSION}</div>
      <LanguageSwitch lang={lang} setLang={changeLang} t={t} />
    </main>
  );
}

function TranslationTask({ t, word, options, answer, choose }: any) {
  return (
    <>
      <div className="rounded-3xl bg-white p-6 text-slate-950">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t.ruWord}</p>
        <p className="mt-2 text-6xl font-black">{word.ru}</p>
      </div>
      <OptionGrid options={options} answer={answer} correct={word.be} choose={choose} audio />
    </>
  );
}

function AudioTask({ t, word, options, answer, choose }: any) {
  return (
    <>
      <div className="rounded-3xl bg-white p-6 text-slate-950">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Audio</p>
        <button onClick={() => speak(word.be)} className="mt-3 rounded-2xl bg-lime-500 px-6 py-4 text-2xl font-black text-white shadow-[0_5px_0_#65a30d]">🔊 {t.listen}</button>
      </div>
      <OptionGrid options={options} answer={answer} correct={word.ru} choose={choose} />
    </>
  );
}

function TrueFalseTask({ t, word, answer, choose }: any) {
  return (
    <>
      <button onClick={() => speak(word.be)} className="w-full rounded-3xl bg-white p-6 text-left text-slate-950">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Нажми на слово</p>
        <p className="mt-2 text-6xl font-black">{word.be} 🔊</p>
        <p className="mt-3 text-xl font-black text-slate-500">{word.be} = {word.ru}</p>
      </button>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button onClick={() => choose("true", "true")} disabled={Boolean(answer)} className="rounded-2xl bg-lime-500 px-5 py-4 text-lg font-black text-white">{t.yes}</button>
        <button onClick={() => choose("false", "true")} disabled={Boolean(answer)} className="rounded-2xl bg-red-500 px-5 py-4 text-lg font-black text-white">{t.no}</button>
      </div>
    </>
  );
}

function FillTask({ word, options, answer, choose }: any) {
  return (
    <>
      <div className="rounded-3xl bg-white p-6 text-slate-950">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Прыклад</p>
        <p className="mt-2 text-3xl font-black">{word.example.replace(word.be, "_____")}</p>
      </div>
      <OptionGrid options={options} answer={answer} correct={word.be} choose={choose} audio />
    </>
  );
}

function OptionGrid({ options, answer, correct, choose, audio = false }: any) {
  return (
    <div className="mt-4 grid gap-3">
      {options.map((option: string) => (
        <button key={option} onClick={() => { if (audio) speak(option); choose(option, correct); }} disabled={Boolean(answer)} className={`rounded-2xl border-2 px-5 py-4 text-left text-lg font-black transition ${answer && option === correct ? "border-lime-400 bg-lime-400 text-slate-950" : answer === option ? "border-red-400 bg-red-400 text-white" : "border-white/10 bg-white/10 hover:bg-lime-400 hover:text-slate-950"}`}>
          {option} {audio && <span className="float-right">🔊</span>}
        </button>
      ))}
    </div>
  );
}

function Header({ t, user, goHome, login, register, logout }: any) {
  return (
    <header className="sticky top-3 z-40 mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-3xl border border-lime-200 bg-white/90 px-5 py-4 shadow-sm backdrop-blur">
      <button onClick={goHome} className="flex items-center gap-3 text-left">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400 text-2xl font-black">ў</div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-lime-700">Belarusian Learning</p>
          <h1 className="text-lg font-black">Вывучай беларускую</h1>
        </div>
      </button>
      <div className="flex gap-2">
        {user ? (
          <>
            <button onClick={goHome} className="rounded-2xl bg-slate-100 px-4 py-3 font-black">{t.home}</button>
            <button onClick={logout} className="rounded-2xl bg-slate-950 px-4 py-3 font-black text-white">{t.logout}</button>
          </>
        ) : (
          <>
            <button onClick={login} className="rounded-2xl bg-slate-100 px-4 py-3 font-black">{t.login}</button>
            <button onClick={register} className="rounded-2xl bg-lime-500 px-4 py-3 font-black text-white">{t.register}</button>
          </>
        )}
      </div>
    </header>
  );
}

function CourseCard({ title, description, status, active, button, onClick }: any) {
  return (
    <article className={`rounded-[2rem] p-6 shadow-sm ${active ? "bg-white" : "bg-white/60"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`font-black ${active ? "text-lime-700" : "text-slate-400"}`}>{status}</p>
          <h2 className="mt-2 text-3xl font-black">{title}</h2>
          <p className="mt-3 text-slate-600">{description}</p>
        </div>
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-black ${active ? "bg-lime-100 text-lime-700" : "bg-slate-100 text-slate-400"}`}>{active ? "✓" : "🔒"}</div>
      </div>
      <button onClick={onClick} disabled={!active} className={`mt-6 w-full rounded-2xl py-4 text-lg font-black ${active ? "bg-lime-500 text-white shadow-[0_5px_0_#65a30d]" : "bg-slate-200 text-slate-500"}`}>{button}</button>
    </article>
  );
}

function DemoCard({ t }: any) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl">
      <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
        <p className="font-black text-lime-300">{t.chooseTranslation}</p>
        <div className="mt-5 rounded-3xl bg-white p-6 text-slate-950">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t.ruWord}</p>
          <p className="mt-2 text-5xl font-black">вода</p>
        </div>
        <div className="mt-4 grid gap-3">
          {["вада", "зямля", "воўк"].map((w) => <button key={w} onClick={() => speak(w)} className="rounded-2xl bg-white/10 px-5 py-4 text-left text-lg font-black hover:bg-lime-400 hover:text-slate-950">{w} <span className="float-right">🔊</span></button>)}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: any) {
  return <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"><span className="font-bold text-slate-500">{label}</span><span className="font-black">{value}</span></div>;
}

function LanguageSwitch({ lang, setLang, t }: any) {
  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-slate-200 bg-white p-2 shadow-xl">
      <div className="flex items-center gap-2">
        <span className="hidden pl-3 text-sm font-black text-slate-500 sm:block">{t.language}</span>
        <button onClick={() => setLang("ru")} className={`rounded-full px-4 py-2 text-sm font-black ${lang === "ru" ? "bg-lime-500 text-white" : "text-slate-500"}`}>RU</button>
        <button onClick={() => setLang("be")} className={`rounded-full px-4 py-2 text-sm font-black ${lang === "be" ? "bg-lime-500 text-white" : "text-slate-500"}`}>BY</button>
      </div>
    </div>
  );
}
