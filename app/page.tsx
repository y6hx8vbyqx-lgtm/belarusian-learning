const courseSections = [
  {
    title: "1 курс: Асновы",
    description: "Алфавіт, вымаўленне, базавыя словы і першыя фразы.",
    status: "Даступна",
  },
  {
    title: "2 курс: Сям'я і час",
    description: "Людзі, сям'я, лічбы, дні тыдня і простыя дыялогі.",
    status: "Адкрыецца пасля 100 слоў",
  },
  {
    title: "3 курс: Размовы",
    description: "Крама, кавярня, транспарт, горад і штодзённыя сітуацыі.",
    status: "Хутка",
  },
];

const dailyWords = [
  { ru: "вода", by: "вада" },
  { ru: "земля", by: "зямля" },
  { ru: "люди", by: "людзі" },
  { ru: "волк", by: "воўк" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f7ef] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8">
        <header className="flex items-center justify-between rounded-3xl border border-lime-200 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400 text-2xl font-black shadow-sm">
              ў
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lime-700">
                Belarusian Learning
              </p>
              <h1 className="text-xl font-black">Вывучай беларускую мову</h1>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <a
              href="#login"
              className="rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Увайсці
            </a>
            <a
              href="#register"
              className="rounded-2xl bg-lime-500 px-5 py-3 font-black text-white shadow-[0_5px_0_#65a30d] transition hover:-translate-y-0.5"
            >
              Зарэгістравацца
            </a>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-7">
            <div className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-lime-700 shadow-sm">
              A1 для русскоязычных · без каши из русского и белорусского
            </div>

            <div className="space-y-5">
              <h2 className="max-w-3xl text-5xl font-black tracking-tight sm:text-7xl">
                Учим белорусский как игру, а не как скучный учебник.
              </h2>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Слова, аудио, короткие уроки, тесты и прогресс. Сначала 100
                базовых слов, затем открывается второй курс: фразы, семья,
                числа, время и простые диалоги.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#register"
                className="rounded-2xl bg-lime-500 px-7 py-4 text-center text-lg font-black text-white shadow-[0_6px_0_#65a30d] transition hover:-translate-y-0.5"
              >
                Пачаць навучанне
              </a>
              <a
                href="#course"
                className="rounded-2xl border-2 border-slate-200 bg-white px-7 py-4 text-center text-lg font-black text-slate-700 transition hover:bg-slate-50"
              >
                Паглядзець курс
              </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-3xl font-black text-lime-600">0</p>
                <p className="font-bold text-slate-500">слоў вывучана</p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-3xl font-black text-orange-500">1</p>
                <p className="font-bold text-slate-500">курс адкрыты</p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-3xl font-black text-sky-500">A1</p>
                <p className="font-bold text-slate-500">пачатковы ўзровень</p>
              </div>
            </div>
          </section>

          <aside className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl">
            <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-lime-300">
                    Трэніроўка слоў
                  </p>
                  <h3 className="text-2xl font-black">Выберы пераклад</h3>
                </div>
                <span className="rounded-full bg-lime-400 px-3 py-1 text-sm font-black text-slate-950">
                  1/100
                </span>
              </div>

              <div className="rounded-3xl bg-white p-6 text-slate-950">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
                  Русское слово
                </p>
                <p className="mt-2 text-5xl font-black">вода</p>
                <p className="mt-3 text-sm font-bold text-slate-500">
                  Нажми на белорусское слово — появится перевод и аудио.
                </p>
              </div>

              <div className="mt-4 grid gap-3">
                {dailyWords.slice(0, 3).map((word) => (
                  <button
                    key={word.by}
                    className="rounded-2xl border-2 border-white/10 bg-white/10 px-5 py-4 text-left text-lg font-black transition hover:bg-lime-400 hover:text-slate-950"
                  >
                    {word.by}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section id="course" className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="font-black uppercase tracking-[0.2em] text-lime-700">
              План
            </p>
            <h2 className="text-4xl font-black">Курсы обучения</h2>
          </div>
          <p className="hidden max-w-md text-right font-medium text-slate-500 sm:block">
            Каждый следующий курс открывается после практики и мини-теста.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {courseSections.map((section, index) => (
            <article
              key={section.title}
              className="rounded-[2rem] bg-white p-6 shadow-sm"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-100 text-2xl font-black text-lime-700">
                {index + 1}
              </div>
              <h3 className="text-2xl font-black">{section.title}</h3>
              <p className="mt-3 min-h-16 text-slate-600">
                {section.description}
              </p>
              <p className="mt-5 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-600">
                {section.status}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="register" className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        <div className="grid gap-5 rounded-[2rem] bg-slate-950 p-6 text-white md:grid-cols-[1fr_0.9fr] md:p-8">
          <div>
            <p className="font-black uppercase tracking-[0.2em] text-lime-300">
              Акаўнт
            </p>
            <h2 className="mt-3 text-4xl font-black">
              Регистрация и профиль — следующий шаг.
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-slate-300">
              Сейчас это первый экран сайта. Дальше подключим Firebase: вход по
              email и паролю, дату регистрации, количество изученных слов, выход
              из аккаунта, настройки профиля и смену пароля.
            </p>
          </div>

          <div id="login" className="rounded-3xl bg-white p-5 text-slate-950">
            <h3 className="text-2xl font-black">Будущий вход</h3>
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-lime-400"
                placeholder="Email"
              />
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-lime-400"
                placeholder="Пароль"
                type="password"
              />
              <button className="w-full rounded-2xl bg-lime-500 py-3 font-black text-white shadow-[0_5px_0_#65a30d]">
                Создать аккаунт
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
