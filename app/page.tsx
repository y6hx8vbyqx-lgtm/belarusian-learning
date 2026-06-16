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

const APP_VERSION = "v0.11.0-review-mistakes-footer-language";

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
type Screen = "landing" | "auth" | "home" | "lesson" | "words";
type AuthMode = "login" | "register";
type TaskType = "theory" | "translate" | "audio" | "trueFalse" | "fill" | "build" | "finish";

type Profile = {
  email: string;
  registeredAtText: string;
  learnedWords: number;
  completedLessons: number;
  streak: number;
  xp: number;
};

type Word = {
  be: string;
  ru: string;
};

type Task = {
  type: TaskType;
  titleRu: string;
  titleBe: string;
  theoryRu?: string;
  theoryBe?: string;
  word?: Word;
  sentenceBe?: string;
  sentenceRu?: string;
  buildWords?: string[];
};

type Lesson = {
  id: number;
  titleRu: string;
  titleBe: string;
  descriptionRu: string;
  descriptionBe: string;
  words: Word[];
  tasks: Task[];
};


const lessons: Lesson[] = [
  {
    id: 1,
    titleRu: "Знакомство с белорусским языком",
    titleBe: "Знаёмства з беларускай мовай",
    descriptionRu: "Алфавит, буква Ў и первые слова.",
    descriptionBe: "Алфавіт, літара Ў і першыя словы.",
    words: [
      { be: "так", ru: "да" },
      { be: "не", ru: "нет" },
      { be: "добры", ru: "добрый" },
      { be: "дзень", ru: "день" },
      { be: "вечар", ru: "вечер" },
      { be: "ноч", ru: "ночь" },
      { be: "Беларусь", ru: "Беларусь" },
      { be: "беларус", ru: "белорус" },
      { be: "мова", ru: "язык" },
      { be: "літара", ru: "буква" },
      { be: "слова", ru: "слово" },
      { be: "гук", ru: "звук" },
    ],
    tasks: [
      {
        type: "theory",
        titleRu: "Что ты сейчас изучишь",
        titleBe: "Што ты цяпер вывучыш",
        theoryRu:
          "В этом уроке ты знакомишься с белорусским языком. Белорусский похож на русский, но это отдельный язык: у него свои слова, произношение и правила. Важная буква — Ў. Она звучит кратко, не как обычная русская У.",
        theoryBe:
          "У гэтым уроку ты знаёмішся з беларускай мовай. Беларуская падобная да рускай, але гэта асобная мова: у яе свае словы, вымаўленне і правілы. Важная літара — Ў.",
      },
      { type: "translate", titleRu: "Выбери перевод", titleBe: "Выберы пераклад", word: { be: "так", ru: "да" } },
      { type: "audio", titleRu: "Послушай слово", titleBe: "Паслухай слова", word: { be: "дзень", ru: "день" } },
      { type: "trueFalse", titleRu: "Проверь пару", titleBe: "Правер пару", word: { be: "добры", ru: "добрый" } },
      { type: "fill", titleRu: "Вставь слово", titleBe: "Устаў слова", word: { be: "Беларусь", ru: "Беларусь" }, sentenceBe: "Гэта ____.", sentenceRu: "Это Беларусь." },
      { type: "build", titleRu: "Собери приветствие", titleBe: "Збяры вітанне", sentenceBe: "Добры дзень", sentenceRu: "Добрый день", buildWords: ["дзень", "Добры", "ноч"] },
      { type: "finish", titleRu: "Урок завершён", titleBe: "Урок завершаны" },
    ],
  },
  {
    id: 2,
    titleRu: "Особенности произношения",
    titleBe: "Асаблівасці вымаўлення",
    descriptionRu: "Аканье, яканье, дзеканье, цеканье и Ў.",
    descriptionBe: "Аканне, яканне, дзеканне, цеканне і Ў.",
    words: [
      { be: "вада", ru: "вода" },
      { be: "зямля", ru: "земля" },
      { be: "людзі", ru: "люди" },
      { be: "дзеці", ru: "дети" },
      { be: "воўк", ru: "волк" },
      { be: "сонца", ru: "солнце" },
      { be: "малако", ru: "молоко" },
      { be: "цень", ru: "тень" },
      { be: "дзень", ru: "день" },
      { be: "вецер", ru: "ветер" },
      { be: "лес", ru: "лес" },
      { be: "неба", ru: "небо" },
    ],
    tasks: [
      {
        type: "theory",
        titleRu: "Как звучит белорусский",
        titleBe: "Як гучыць беларуская",
        theoryRu:
          "В белорусском важно произношение. О часто звучит как А: молоко → малако. Земля → зямля. Д мягко часто звучит как ДЗ: дзеці. Т мягко часто звучит как Ц: цень. Буква Ў читается как короткое У: воўк.",
        theoryBe:
          "У беларускай важнае вымаўленне. О часта гучыць як А: молоко → малако. Земля → зямля. Мяккае Д часта гучыць як ДЗ: дзеці. Мяккае Т — як Ц: цень. Ў — кароткае У: воўк.",
      },
      { type: "translate", titleRu: "Выбери перевод", titleBe: "Выберы пераклад", word: { be: "вада", ru: "вода" } },
      { type: "audio", titleRu: "Что ты услышал?", titleBe: "Што ты пачуў?", word: { be: "зямля", ru: "земля" } },
      { type: "trueFalse", titleRu: "Проверь пару", titleBe: "Правер пару", word: { be: "воўк", ru: "волк" } },
      { type: "fill", titleRu: "Вставь слово", titleBe: "Устаў слова", word: { be: "сонца", ru: "солнце" }, sentenceBe: "Свеціць ____.", sentenceRu: "Светит солнце." },
      { type: "build", titleRu: "Собери предложение", titleBe: "Збяры сказ", sentenceBe: "Гэта зямля", sentenceRu: "Это земля", buildWords: ["зямля", "Гэта", "вада"] },
      { type: "finish", titleRu: "Урок завершён", titleBe: "Урок завершаны" },
    ],
  },
  {
    id: 3,
    titleRu: "Приветствия и прощания",
    titleBe: "Вітанні і развітанні",
    descriptionRu: "Добры дзень, прывітанне, як справы, да пабачэння.",
    descriptionBe: "Добры дзень, прывітанне, як справы, да пабачэння.",
    words: [
      { be: "Добры дзень", ru: "Добрый день" },
      { be: "Добрай раніцы", ru: "Доброе утро" },
      { be: "Добры вечар", ru: "Добрый вечер" },
      { be: "Прывітанне", ru: "Привет" },
      { be: "Да пабачэння", ru: "До свидания" },
      { be: "Бывай", ru: "Пока" },
      { be: "Як справы?", ru: "Как дела?" },
      { be: "Добра", ru: "Хорошо" },
      { be: "Дзякуй", ru: "Спасибо" },
      { be: "Калі ласка", ru: "Пожалуйста" },
      { be: "Прабачце", ru: "Извините" },
      { be: "Нічога", ru: "Ничего" },
    ],
    tasks: [
      {
        type: "theory",
        titleRu: "Как здороваться",
        titleBe: "Як вітацца",
        theoryRu:
          "Добры дзень — нейтральное приветствие, подходит почти всегда. Прывітанне — более неформально, как «привет». Да пабачэння — обычное «до свидания». На вопрос «Як справы?» можно ответить «Добра».",
        theoryBe:
          "Добры дзень — нейтральнае вітанне. Прывітанне — больш нефармальна. Да пабачэння — звычайнае развітанне. На пытанне «Як справы?» можна адказаць «Добра».",
      },
      { type: "translate", titleRu: "Выбери перевод", titleBe: "Выберы пераклад", word: { be: "Прывітанне", ru: "Привет" } },
      { type: "audio", titleRu: "Послушай фразу", titleBe: "Паслухай фразу", word: { be: "Добры дзень", ru: "Добрый день" } },
      { type: "trueFalse", titleRu: "Проверь пару", titleBe: "Правер пару", word: { be: "Да пабачэння", ru: "До свидания" } },
      { type: "fill", titleRu: "Закончи диалог", titleBe: "Скончы дыялог", word: { be: "Добра", ru: "Хорошо" }, sentenceBe: "— Як справы? — ____.", sentenceRu: "— Как дела? — Хорошо." },
      { type: "build", titleRu: "Собери фразу", titleBe: "Збяры фразу", sentenceBe: "Да пабачэння", sentenceRu: "До свидания", buildWords: ["пабачэння", "Да", "Добры"] },
      { type: "finish", titleRu: "Урок завершён", titleBe: "Урок завершаны" },
    ],
  },
  {
    id: 4,
    titleRu: "Личные местоимения",
    titleBe: "Асабовыя займеннікі",
    descriptionRu: "Я, ты, ён, яна, мы, вы, яны.",
    descriptionBe: "Я, ты, ён, яна, мы, вы, яны.",
    words: [
      { be: "Я", ru: "Я" },
      { be: "Ты", ru: "Ты" },
      { be: "Ён", ru: "Он" },
      { be: "Яна", ru: "Она" },
      { be: "Мы", ru: "Мы" },
      { be: "Вы", ru: "Вы" },
      { be: "Яны", ru: "Они" },
      { be: "студэнт", ru: "студент" },
      { be: "студэнтка", ru: "студентка" },
      { be: "чалавек", ru: "человек" },
      { be: "сябар", ru: "друг" },
      { be: "сяброўка", ru: "подруга" },
    ],
    tasks: [
      {
        type: "theory",
        titleRu: "Кто? Он, она, они",
        titleBe: "Хто? Ён, яна, яны",
        theoryRu:
          "Местоимения похожи на русские, но есть важные отличия. Он = ён. Она = яна. Они = яны. Не говори «он/она/они» внутри белорусской фразы — это сразу делает речь смешанной.",
        theoryBe:
          "Займеннікі падобныя да рускіх, але ёсць важныя адрозненні. Он = ён. Она = яна. Они = яны.",
      },
      { type: "translate", titleRu: "Выбери перевод", titleBe: "Выберы пераклад", word: { be: "Ён", ru: "Он" } },
      { type: "audio", titleRu: "Послушай", titleBe: "Паслухай", word: { be: "Яна", ru: "Она" } },
      { type: "trueFalse", titleRu: "Проверь пару", titleBe: "Правер пару", word: { be: "Яны", ru: "Они" } },
      { type: "fill", titleRu: "Вставь слово", titleBe: "Устаў слова", word: { be: "сябар", ru: "друг" }, sentenceBe: "Гэта мой ____.", sentenceRu: "Это мой друг." },
      { type: "build", titleRu: "Собери предложение", titleBe: "Збяры сказ", sentenceBe: "Ён мой сябар", sentenceRu: "Он мой друг", buildWords: ["сябар", "мой", "Ён"] },
      { type: "finish", titleRu: "Урок завершён", titleBe: "Урок завершаны" },
    ],
  },
  {
    id: 5,
    titleRu: "Кто я?",
    titleBe: "Хто я?",
    descriptionRu: "Я студент. Я врач. Я программист.",
    descriptionBe: "Я студэнт. Я лекар. Я праграміст.",
    words: [
      { be: "настаўнік", ru: "учитель" },
      { be: "лекар", ru: "врач" },
      { be: "інжынер", ru: "инженер" },
      { be: "праграміст", ru: "программист" },
      { be: "студэнт", ru: "студент" },
      { be: "студэнтка", ru: "студентка" },
      { be: "пісьменнік", ru: "писатель" },
      { be: "музыка", ru: "музыкант" },
      { be: "мастак", ru: "художник" },
      { be: "кіроўца", ru: "водитель" },
      { be: "доктар", ru: "доктор" },
      { be: "работнік", ru: "работник" },
    ],
    tasks: [
      {
        type: "theory",
        titleRu: "Как сказать «я программист»",
        titleBe: "Як сказаць «я праграміст»",
        theoryRu:
          "В белорусском часто не нужно слово «есть». По-русски мы тоже говорим «я программист», а не «я есть программист». По-белорусски так же: Я праграміст. Я студэнт. Я лекар.",
        theoryBe:
          "У беларускай часта не патрэбнае слова «ёсць». Кажам: Я праграміст. Я студэнт. Я лекар.",
      },
      { type: "translate", titleRu: "Выбери перевод", titleBe: "Выберы пераклад", word: { be: "праграміст", ru: "программист" } },
      { type: "audio", titleRu: "Послушай", titleBe: "Паслухай", word: { be: "лекар", ru: "врач" } },
      { type: "trueFalse", titleRu: "Проверь пару", titleBe: "Правер пару", word: { be: "студэнт", ru: "студент" } },
      { type: "fill", titleRu: "Вставь слово", titleBe: "Устаў слова", word: { be: "інжынер", ru: "инженер" }, sentenceBe: "Я ____.", sentenceRu: "Я инженер." },
      { type: "build", titleRu: "Собери предложение", titleBe: "Збяры сказ", sentenceBe: "Я праграміст", sentenceRu: "Я программист", buildWords: ["праграміст", "Я", "лекар"] },
      { type: "finish", titleRu: "Урок завершён", titleBe: "Урок завершаны" },
    ],
  },
  {
    id: 6,
    titleRu: "Откуда ты?",
    titleBe: "Адкуль ты?",
    descriptionRu: "Страны и конструкция «Я з…».",
    descriptionBe: "Краіны і канструкцыя «Я з…».",
    words: [
      { be: "Беларусь", ru: "Беларусь" },
      { be: "Расія", ru: "Россия" },
      { be: "Польшча", ru: "Польша" },
      { be: "Сербія", ru: "Сербия" },
      { be: "Германія", ru: "Германия" },
      { be: "Японія", ru: "Япония" },
      { be: "Грэцыя", ru: "Греция" },
      { be: "Амерыка", ru: "Америка" },
      { be: "Канада", ru: "Канада" },
      { be: "Беларусі", ru: "Беларуси" },
      { be: "Расіі", ru: "России" },
      { be: "Польшчы", ru: "Польши" },
      { be: "Сербіі", ru: "Сербии" },
      { be: "Германіі", ru: "Германии" },
      { be: "Японіі", ru: "Японии" },
      { be: "Грэцыі", ru: "Греции" },
      { be: "Амерыкі", ru: "Америки" },
      { be: "Канады", ru: "Канады" },
    ],
    tasks: [
      {
        type: "theory",
        titleRu: "Предлог «з»",
        titleBe: "Прыназоўнік «з»",
        theoryRu:
          "Предлог «з» означает «из» или «с». Запомни шаблон: Я + з + место. Я з Беларусі = Я из Беларуси. Я з Расіі = Я из России. После «з» название страны часто меняет окончание: Польшча → з Польшчы, Германія → з Германіі, Канада → з Канады.",
        theoryBe:
          "Прыназоўнік «з» азначае «из» або «с». Шаблон: Я + з + месца. Я з Беларусі. Я з Расіі. Пасля «з» назва краіны часта змяняе канчатак: Польшча → з Польшчы, Германія → з Германіі, Канада → з Канады.",
      },
      { type: "translate", titleRu: "Выбери страну", titleBe: "Выберы краіну", word: { be: "Германія", ru: "Германия" } },
      { type: "audio", titleRu: "Послушай страну", titleBe: "Паслухай краіну", word: { be: "Японія", ru: "Япония" } },
      { type: "trueFalse", titleRu: "Проверь пару", titleBe: "Правер пару", word: { be: "Сербія", ru: "Сербия" } },
      { type: "fill", titleRu: "Вставь страну", titleBe: "Устаў краіну", word: { be: "Беларусі", ru: "Беларуси" }, sentenceBe: "Я з ____.", sentenceRu: "Я из Беларуси." },
      { type: "build", titleRu: "Собери предложение", titleBe: "Збяры сказ", sentenceBe: "Я з Польшчы", sentenceRu: "Я из Польши", buildWords: ["Польшчы", "з", "Я"] },
      { type: "finish", titleRu: "Урок завершён", titleBe: "Урок завершаны" },
    ],
  },
  {
    id: 7,
    titleRu: "Простые вопросы",
    titleBe: "Простыя пытанні",
    descriptionRu: "Кто, что, где, откуда, как.",
    descriptionBe: "Хто, што, дзе, адкуль, як.",
    words: [
      { be: "хто", ru: "кто" },
      { be: "што", ru: "что" },
      { be: "дзе", ru: "где" },
      { be: "адкуль", ru: "откуда" },
      { be: "як", ru: "как" },
      { be: "калі", ru: "когда" },
      { be: "чаму", ru: "почему" },
      { be: "які", ru: "какой" },
      { be: "якая", ru: "какая" },
      { be: "колькі", ru: "сколько" },
      { be: "імя", ru: "имя" },
      { be: "месца", ru: "место" },
    ],
    tasks: [
      {
        type: "theory",
        titleRu: "Вопросительные слова",
        titleBe: "Пытальныя словы",
        theoryRu:
          "В белорусском вопросы часто строятся так же просто, как в русском: вопросительное слово + остальная фраза. Хто? = Кто? Што? = Что? Дзе? = Где? Адкуль? = Откуда? Як? = Как? Пример: Адкуль ты? = Откуда ты?",
        theoryBe:
          "У беларускай пытанні часта будуюцца проста: пытальнае слова + астатняя фраза. Хто? Што? Дзе? Адкуль? Як? Прыклад: Адкуль ты?",
      },
      { type: "translate", titleRu: "Выбери перевод", titleBe: "Выберы пераклад", word: { be: "хто", ru: "кто" } },
      { type: "audio", titleRu: "Послушай", titleBe: "Паслухай", word: { be: "адкуль", ru: "откуда" } },
      { type: "trueFalse", titleRu: "Проверь пару", titleBe: "Правер пару", word: { be: "дзе", ru: "где" } },
      { type: "fill", titleRu: "Вставь слово", titleBe: "Устаў слова", word: { be: "Як", ru: "Как" }, sentenceBe: "____ справы?", sentenceRu: "Как дела?" },
      { type: "build", titleRu: "Собери вопрос", titleBe: "Збяры пытанне", sentenceBe: "Адкуль ты", sentenceRu: "Откуда ты?", buildWords: ["ты", "Адкуль", "дзе"] },
      { type: "finish", titleRu: "Урок завершён", titleBe: "Урок завершаны" },
    ],
  },
  {
    id: 8,
    titleRu: "Глагол «быць» и частые глаголы",
    titleBe: "Дзеяслоў «быць» і частыя дзеясловы",
    descriptionRu: "Быть, жить, работать, учиться, читать, любить.",
    descriptionBe: "Быць, жыць, працаваць, вучыцца, чытаць, любіць.",
    words: [
      { be: "быць", ru: "быть" },
      { be: "жыць", ru: "жить" },
      { be: "працаваць", ru: "работать" },
      { be: "вучыцца", ru: "учиться" },
      { be: "чытаць", ru: "читать" },
      { be: "любіць", ru: "любить" },
      { be: "пісаць", ru: "писать" },
      { be: "слухаць", ru: "слушать" },
      { be: "гаварыць", ru: "говорить" },
      { be: "ведаць", ru: "знать" },
      { be: "разумець", ru: "понимать" },
      { be: "хацець", ru: "хотеть" },
    ],
    tasks: [
      {
        type: "theory",
        titleRu: "Самые частые глаголы",
        titleBe: "Самыя частыя дзеясловы",
        theoryRu:
          "Глаголы — это действия. В этом уроке не нужно учить всю грамматику. Просто запомни самые нужные слова: жыць = жить, працаваць = работать, вучыцца = учиться, чытаць = читать. Примеры: Я жыву. Я працую. Я вучуся.",
        theoryBe:
          "Дзеясловы — гэта дзеянні. Спачатку вучым самыя патрэбныя словы: жыць, працаваць, вучыцца, чытаць. Прыклады: Я жыву. Я працую. Я вучуся.",
      },
      { type: "translate", titleRu: "Выбери перевод", titleBe: "Выберы пераклад", word: { be: "жыць", ru: "жить" } },
      { type: "audio", titleRu: "Послушай", titleBe: "Паслухай", word: { be: "працаваць", ru: "работать" } },
      { type: "trueFalse", titleRu: "Проверь пару", titleBe: "Правер пару", word: { be: "вучыцца", ru: "учиться" } },
      { type: "fill", titleRu: "Вставь слово", titleBe: "Устаў слова", word: { be: "чытаць", ru: "читать" }, sentenceBe: "Я люблю ____.", sentenceRu: "Я люблю читать." },
      { type: "build", titleRu: "Собери предложение", titleBe: "Збяры сказ", sentenceBe: "Я вучуся", sentenceRu: "Я учусь", buildWords: ["вучуся", "Я", "чытаю"] },
      { type: "finish", titleRu: "Урок завершён", titleBe: "Урок завершаны" },
    ],
  },
  {
    id: 9,
    titleRu: "Полный диалог знакомства",
    titleBe: "Поўны дыялог знаёмства",
    descriptionRu: "Имя, страна, профессия, прощание.",
    descriptionBe: "Імя, краіна, прафесія, развітанне.",
    words: [
      { be: "Прывітанне", ru: "Привет" },
      { be: "Мяне завуць", ru: "Меня зовут" },
      { be: "Я з Беларусі", ru: "Я из Беларуси" },
      { be: "Я з Расіі", ru: "Я из России" },
      { be: "Я з Польшчы", ru: "Я из Польши" },
      { be: "Я з Сербіі", ru: "Я из Сербии" },
      { be: "Я з Германіі", ru: "Я из Германии" },
      { be: "Я з Японіі", ru: "Я из Японии" },
      { be: "Я з Грэцыі", ru: "Я из Греции" },
      { be: "Я з Амерыкі", ru: "Я из Америки" },
      { be: "Я з Канады", ru: "Я из Канады" },
      { be: "Я праграміст", ru: "Я программист" },
      { be: "Я студэнт", ru: "Я студент" },
      { be: "Прыемна пазнаёміцца", ru: "Приятно познакомиться" },
    ],
    tasks: [
      {
        type: "theory",
        titleRu: "Собираем диалог",
        titleBe: "Збіраем дыялог",
        theoryRu:
          "Теперь соединяем всё вместе: приветствие, имя, страну и профессию. Пример: Прывітанне! Мяне завуць Аляксей. Я з Расіі. Я праграміст. Прыемна пазнаёміцца!",
        theoryBe:
          "Цяпер злучаем усё разам: вітанне, імя, краіну і прафесію. Прыклад: Прывітанне! Мяне завуць Аляксей. Я з Расіі. Я праграміст. Прыемна пазнаёміцца!",
      },
      { type: "translate", titleRu: "Выбери перевод", titleBe: "Выберы пераклад", word: { be: "Мяне завуць", ru: "Меня зовут" } },
      { type: "audio", titleRu: "Послушай", titleBe: "Паслухай", word: { be: "Прыемна пазнаёміцца", ru: "Приятно познакомиться" } },
      { type: "trueFalse", titleRu: "Проверь пару", titleBe: "Правер пару", word: { be: "Я з Германіі", ru: "Я из Германии" } },
      { type: "fill", titleRu: "Вставь слово", titleBe: "Устаў слова", word: { be: "Прывітанне", ru: "Привет" }, sentenceBe: "____! Мяне завуць Аляксей.", sentenceRu: "Привет! Меня зовут Алексей." },
      { type: "build", titleRu: "Собери предложение", titleBe: "Збяры сказ", sentenceBe: "Я з Сербіі", sentenceRu: "Я из Сербии", buildWords: ["Сербіі", "з", "Я"] },
      { type: "finish", titleRu: "Урок завершён", titleBe: "Урок завершаны" },
    ],
  },
  {
    id: 10,
    titleRu: "Контрольный урок",
    titleBe: "Кантрольны ўрок",
    descriptionRu: "Повторение всего модуля и итоговый проект.",
    descriptionBe: "Паўтарэнне ўсяго модуля і выніковы праект.",
    words: [
      { be: "Прывітанне", ru: "Привет" },
      { be: "Мяне завуць Аляксей", ru: "Меня зовут Алексей" },
      { be: "Я з Расіі", ru: "Я из России" },
      { be: "Я з Беларусі", ru: "Я из Беларуси" },
      { be: "Я з Польшчы", ru: "Я из Польши" },
      { be: "Я з Сербіі", ru: "Я из Сербии" },
      { be: "Я з Германіі", ru: "Я из Германии" },
      { be: "Я з Японіі", ru: "Я из Японии" },
      { be: "Я з Грэцыі", ru: "Я из Греции" },
      { be: "Я з Амерыкі", ru: "Я из Америки" },
      { be: "Я з Канады", ru: "Я из Канады" },
      { be: "Я праграміст", ru: "Я программист" },
      { be: "Вучу беларускую мову", ru: "Учу белорусский язык" },
      { be: "Прыемна пазнаёміцца", ru: "Приятно познакомиться" },
    ],
    tasks: [
      {
        type: "theory",
        titleRu: "Итоговый проект",
        titleBe: "Выніковы праект",
        theoryRu:
          "Итог модуля — уметь представиться. Пример: Прывітанне! Мяне завуць Аляксей. Я з Расіі. Я праграміст. Вучу беларускую мову. Прыемна пазнаёміцца!",
        theoryBe:
          "Вынік модуля — умець прадставіцца. Прыклад: Прывітанне! Мяне завуць Аляксей. Я з Расіі. Я праграміст. Вучу беларускую мову. Прыемна пазнаёміцца!",
      },
      { type: "audio", titleRu: "Послушай", titleBe: "Паслухай", word: { be: "Прывітанне", ru: "Привет" } },
      { type: "translate", titleRu: "Выбери перевод", titleBe: "Выберы пераклад", word: { be: "Мяне завуць Аляксей", ru: "Меня зовут Алексей" } },
      { type: "trueFalse", titleRu: "Проверь пару", titleBe: "Правер пару", word: { be: "Я праграміст", ru: "Я программист" } },
      { type: "fill", titleRu: "Вставь слово", titleBe: "Устаў слова", word: { be: "беларускую", ru: "белорусский" }, sentenceBe: "Вучу ____ мову.", sentenceRu: "Учу белорусский язык." },
      { type: "build", titleRu: "Собери итоговую фразу", titleBe: "Збяры выніковую фразу", sentenceBe: "Прыемна пазнаёміцца", sentenceRu: "Приятно познакомиться", buildWords: ["пазнаёміцца", "Прыемна", "Добры"] },
      { type: "finish", titleRu: "Модуль завершён", titleBe: "Модуль завершаны" },
    ],
  },
];

const allWords: Word[] = lessons.flatMap((lesson) => lesson.words);

const tr = {
  ru: {
    login: "Войти",
    register: "Зарегистрироваться",
    logout: "Выйти",
    title: "Белорусский для русскоязычных",
    subtitle: "Уроки как в Duolingo: несколько заданий подряд, отдельная тренировка слов и прогресс.",
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
    xp: "XP",
    course: "Курс A1",
    courseGoal: "Цель: научиться читать, здороваться, представляться и понимать базовую речь.",
    wordsMode: "Учить слова",
    lessonMap: "Карта уроков",
    open: "Доступно",
    locked: "Закрыто",
    done: "Пройдено",
    lesson: "Урок",
    go: "Начать",
    back: "Назад",
    theory: "Теория",
    chooseTranslation: "Выбери перевод",
    listenAndChoose: "Послушай и выбери",
    trueFalse: "Верно или неверно?",
    fillBlank: "Вставь слово",
    buildSentence: "Собери предложение",
    listen: "Слушать",
    correct: "Правильно!",
    wrong: "Неправильно. Ответ:",
    next: "Дальше",
    finishLesson: "Завершить урок",
    reviewMistakes: "Повторить ошибки",
    reviewText: "Ты почти закончил урок. Сначала переделаем задания, где был неверный ответ.",
    check: "Проверить",
    yes: "Верно",
    no: "Неверно",
    language: "Язык",
    loading: "Загрузка...",
    resetSent: "Письмо для сброса пароля отправлено.",
    accountExists: "Аккаунт с таким email уже есть. Нажми «Уже есть аккаунт? Войти».",
    invalidLogin: "Неверный email или пароль.",
    weakPassword: "Пароль должен быть минимум 6 символов.",
    invalidEmail: "Введите корректный email.",
    unknownError: "Что-то пошло не так. Попробуй ещё раз.",
  },
  be: {
    login: "Увайсці",
    register: "Зарэгістравацца",
    logout: "Выйсці",
    title: "Беларуская для рускамоўных",
    subtitle: "Урокі як у Duolingo: некалькі заданняў запар, асобная трэніроўка слоў і прагрэс.",
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
    xp: "XP",
    course: "Курс A1",
    courseGoal: "Мэта: навучыцца чытаць, вітацца, прадстаўляцца і разумець базавую гаворку.",
    wordsMode: "Вучыць словы",
    lessonMap: "Мапа ўрокаў",
    open: "Даступна",
    locked: "Закрыта",
    done: "Пройдзена",
    lesson: "Урок",
    go: "Пачаць",
    back: "Назад",
    theory: "Тэорыя",
    chooseTranslation: "Выберы пераклад",
    listenAndChoose: "Паслухай і выберы",
    trueFalse: "Правільна ці не?",
    fillBlank: "Устаў слова",
    buildSentence: "Збяры сказ",
    listen: "Слухаць",
    correct: "Правільна!",
    wrong: "Няправільна. Адказ:",
    next: "Далей",
    finishLesson: "Завяршыць урок",
    reviewMistakes: "Паўтарыць памылкі",
    reviewText: "Ты амаль скончыў урок. Спачатку пераробім заданні, дзе быў няправільны адказ.",
    check: "Праверыць",
    yes: "Правільна",
    no: "Няправільна",
    language: "Мова",
    loading: "Загрузка...",
    resetSent: "Ліст для скіду пароля адпраўлены.",
    accountExists: "Акаўнт з такім email ужо ёсць. Націсні «Ужо ёсць акаўнт? Увайсці».",
    invalidLogin: "Няправільны email або пароль.",
    weakPassword: "Пароль павінен мець мінімум 6 сімвалаў.",
    invalidEmail: "Увядзі карэктны email.",
    unknownError: "Нешта пайшло не так. Паспрабуй яшчэ раз.",
  },
};

function speak(value: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const synth = window.speechSynthesis;
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(value);
  const voices = synth.getVoices();

  const preferredVoice =
    voices.find((voice) => voice.lang === "be-BY") ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith("uk")) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith("pl")) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith("cs")) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith("sk")) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith("ru")) ||
    voices[0];

  if (preferredVoice) {
    utterance.voice = preferredVoice;
    utterance.lang = preferredVoice.lang;
  } else {
    utterance.lang = "be-BY";
  }

  utterance.rate = 0.88;
  utterance.pitch = 1;
  utterance.volume = 1;

  synth.speak(utterance);
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {};
}

function createProfile(user: User): Profile {
  return {
    email: user.email || "",
    registeredAtText: new Date().toLocaleDateString("ru-RU"),
    learnedWords: 0,
    completedLessons: 0,
    streak: 1,
    xp: 0,
  };
}

function authError(error: unknown, t: typeof tr.ru) {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("email-already-in-use")) return t.accountExists;
  if (message.includes("invalid-credential") || message.includes("wrong-password")) return t.invalidLogin;
  if (message.includes("weak-password")) return t.weakPassword;
  if (message.includes("invalid-email")) return t.invalidEmail;
  return t.unknownError;
}

function wrongBe(correct: string, lesson: Lesson) {
  return lesson.words.map((word) => word.be).filter((word) => word !== correct).slice(0, 2);
}

function wrongRu(correct: string, lesson: Lesson) {
  return lesson.words.map((word) => word.ru).filter((word) => word !== correct).slice(0, 2);
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("ru");
  const [screen, setScreen] = useState<Screen>("landing");
  const [mode, setMode] = useState<AuthMode>("register");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState(1);
  const [taskIndex, setTaskIndex] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [wordTrainerIndex, setWordTrainerIndex] = useState(0);
  const [builtWords, setBuiltWords] = useState<string[]>([]);
  const [reviewTasks, setReviewTasks] = useState<Task[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);

  const t = tr[lang];
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId) || lessons[0];
  const finishTask = selectedLesson.tasks.find((task) => task.type === "finish") || selectedLesson.tasks[selectedLesson.tasks.length - 1];
  const currentTask = reviewMode ? reviewTasks[reviewIndex] || finishTask : selectedLesson.tasks[taskIndex];
  const currentWord = currentTask?.word || selectedLesson.words[0];

  const beOptions = useMemo(() => {
    return [...new Set([currentWord.be, ...wrongBe(currentWord.be, selectedLesson)])]
      .slice(0, 3)
      .sort(() => Math.random() - 0.5);
  }, [currentWord.be, selectedLesson]);

  const ruOptions = useMemo(() => {
    return [...new Set([currentWord.ru, ...wrongRu(currentWord.ru, selectedLesson)])]
      .slice(0, 3)
      .sort(() => Math.random() - 0.5);
  }, [currentWord.ru, selectedLesson]);

  useEffect(() => {
    console.log(`Belarusian Learning version: ${APP_VERSION}`);
  }, []);

  useEffect(() => {
    const savedLang = localStorage.getItem("site-lang");
    if (savedLang === "ru" || savedLang === "be") setLang(savedLang);

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
        const data = snap.data() as Profile;
        setProfile({
          ...data,
          xp: data.xp || 0,
          completedLessons: data.completedLessons || 0,
          learnedWords: data.learnedWords || 0,
          streak: data.streak || 1,
        });
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

    if (!email || !password) {
      setMsg(t.invalidLogin);
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
      setScreen("home");
    } catch (error) {
      setMsg(authError(error, t));
    }
  }

  async function resetPassword() {
    if (!email) {
      setMsg(t.invalidEmail);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMsg(t.resetSent);
    } catch (error) {
      setMsg(authError(error, t));
    }
  }

  async function logout() {
    await signOut(auth);
    setScreen("landing");
  }

  function startLesson(lessonId: number) {
    setSelectedLessonId(lessonId);
    setTaskIndex(0);
    setAnswer(null);
    setBuiltWords([]);
    setReviewTasks([]);
    setReviewIndex(0);
    setReviewMode(false);
    setScreen("lesson");
  }

  function nextTask() {
    setAnswer(null);
    setBuiltWords([]);

    if (reviewMode) {
      if (reviewIndex + 1 < reviewTasks.length) {
        setReviewIndex((value) => value + 1);
      } else {
        setReviewMode(false);
        setReviewTasks([]);
        setReviewIndex(0);
        setTaskIndex(selectedLesson.tasks.findIndex((task) => task.type === "finish"));
      }
      return;
    }

    setTaskIndex((value) => value + 1);
  }

  async function finishLesson() {
    if (!user || !profile) return;

    const updated = {
      ...profile,
      completedLessons: Math.max(profile.completedLessons || 0, selectedLessonId),
      xp: (profile.xp || 0) + 50,
      learnedWords: Math.min((profile.learnedWords || 0) + selectedLesson.words.length, 150),
    };

    setProfile(updated);

    await updateDoc(doc(db, "users", user.uid), {
      completedLessons: updated.completedLessons,
      learnedWords: updated.learnedWords,
      xp: updated.xp,
      updatedAt: serverTimestamp(),
    });

    setScreen("home");
  }

  function rememberMistakeIfNeeded(isCorrect: boolean) {
    if (isCorrect || reviewMode || currentTask.type === "theory" || currentTask.type === "finish") return;

    setReviewTasks((tasks) => {
      const alreadyAdded = tasks.some(
        (task) =>
          task.type === currentTask.type &&
          task.titleRu === currentTask.titleRu &&
          task.word?.be === currentTask.word?.be &&
          task.sentenceBe === currentTask.sentenceBe
      );

      return alreadyAdded ? tasks : [...tasks, currentTask];
    });
  }

  function choose(option: string) {
    if (answer) return;

    setAnswer(option);

    const isCorrect =
      option === currentWord.be ||
      option === currentWord.ru ||
      option === "true";

    rememberMistakeIfNeeded(isCorrect);
  }

  function checkBuiltSentence(correctSentence: string) {
    if (answer) return;

    const userSentence = builtWords.join(" ");
    setAnswer(userSentence);
    rememberMistakeIfNeeded(userSentence === correctSentence);
  }

  function startReview() {
    setAnswer(null);
    setBuiltWords([]);
    setReviewMode(true);
    setReviewIndex(0);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7ef] text-2xl font-black">
        {t.loading}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7ef] pb-28 text-slate-950">
      <Header
        t={t}
        user={user}
        goHome={() => setScreen(user ? "home" : "landing")}
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
        <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-16 lg:grid-cols-2">
          <div>
            <p className="mb-5 inline-flex rounded-full bg-lime-100 px-4 py-2 font-black text-lime-700">
              A1 · Belarusian Learning
            </p>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">{t.title}</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">{t.subtitle}</p>
            <button
              onClick={() => {
                setMode("register");
                setScreen("auth");
              }}
              className="mt-7 rounded-2xl bg-lime-500 px-8 py-4 text-lg font-black text-white shadow-[0_6px_0_#65a30d]"
            >
              {t.start}
            </button>
          </div>
          <DemoCard t={t} />
        </section>
      )}

      {screen === "auth" && (
        <section className="mx-auto max-w-xl px-5 py-12">
          <div className="rounded-[2rem] bg-white p-6 shadow-xl">
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
              {msg && <p className="rounded-2xl bg-amber-50 p-4 font-bold text-amber-800">{msg}</p>}
              <button
                onClick={authAction}
                className="w-full rounded-2xl bg-lime-500 py-4 font-black text-white shadow-[0_5px_0_#65a30d]"
              >
                {mode === "register" ? t.create : t.enter}
              </button>
              {mode === "login" && (
                <button onClick={resetPassword} className="w-full rounded-2xl bg-slate-100 py-4 font-black">
                  {t.reset}
                </button>
              )}
              <button
                onClick={() => setMode(mode === "register" ? "login" : "register")}
                className="w-full rounded-2xl bg-slate-100 py-4 font-black"
              >
                {mode === "register" ? t.switchLogin : t.switchRegister}
              </button>
            </div>
          </div>
        </section>
      )}

      {screen === "home" && (
        <section className="mx-auto grid max-w-6xl gap-6 px-5 py-8 lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="space-y-5">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-lime-400 text-3xl font-black">
                  ў
                </div>
                <div>
                  <p className="font-black text-slate-400">{t.profile}</p>
                  <h2 className="break-all text-xl font-black">{profile?.email || user?.email}</h2>
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                <InfoRow label={t.registered} value={profile?.registeredAtText || "—"} />
                <InfoRow label={t.learned} value={`${profile?.learnedWords || 0}/150`} />
                <InfoRow label={t.lessons} value={`${profile?.completedLessons || 0}/${lessons.length}`} />
                <InfoRow label={t.xp} value={`${profile?.xp || 0}`} />
                <InfoRow label={t.streak} value={`${profile?.streak || 0}`} />
              </div>
            </div>

            <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-sm">
              <p className="font-black uppercase tracking-[0.2em] text-lime-300">{t.course}</p>
              <h2 className="mt-2 text-3xl font-black">{t.lessonMap}</h2>
              <p className="mt-4 leading-7 text-slate-300">{t.courseGoal}</p>
              <button
                onClick={() => setScreen("words")}
                className="mt-5 w-full rounded-2xl bg-lime-500 py-4 font-black text-white shadow-[0_5px_0_#65a30d]"
              >
                {t.wordsMode}
              </button>
            </div>
          </aside>

          <section>
            <p className="font-black uppercase tracking-[0.2em] text-lime-700">{t.lessonMap}</p>
            <h1 className="mt-2 text-5xl font-black">{t.home}</h1>

            <div className="mt-6 grid gap-4">
              {lessons.map((lesson) => {
                const completed = (profile?.completedLessons || 0) >= lesson.id;
                const unlocked = lesson.id === 1 || (profile?.completedLessons || 0) >= lesson.id - 1;

                return (
                  <LessonCard
                    key={lesson.id}
                    title={`${t.lesson} ${lesson.id}. ${lang === "ru" ? lesson.titleRu : lesson.titleBe}`}
                    description={lang === "ru" ? lesson.descriptionRu : lesson.descriptionBe}
                    status={completed ? t.done : unlocked ? t.open : t.locked}
                    active={unlocked}
                    completed={completed}
                    button={completed ? t.done : unlocked ? t.go : t.locked}
                    onClick={() => unlocked && startLesson(lesson.id)}
                  />
                );
              })}
            </div>
          </section>
        </section>
      )}

      {screen === "lesson" && (
        <section className="mx-auto max-w-3xl px-5 py-8">
          <button onClick={() => setScreen("home")} className="mb-5 rounded-2xl bg-white px-5 py-3 font-black shadow-sm">
            ← {t.back}
          </button>

          <div className="mb-4 rounded-full bg-white p-2 shadow-sm">
            <div
              className="h-4 rounded-full bg-lime-500 transition-all"
              style={{ width: `${Math.min((taskIndex / (selectedLesson.tasks.length - 1)) * 100, 100)}%` }}
            />
          </div>

          <div className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black text-lime-300">
                  {reviewMode
                    ? `${t.reviewMistakes} · ${reviewIndex + 1}/${reviewTasks.length}`
                    : `${t.lesson} ${selectedLesson.id} · ${taskIndex + 1}/${selectedLesson.tasks.length}`}
                </p>
                <h1 className="text-3xl font-black">{lang === "ru" ? currentTask.titleRu : currentTask.titleBe}</h1>
              </div>
              <span className="rounded-full bg-lime-400 px-3 py-1 text-sm font-black text-slate-950">
                +50 XP
              </span>
            </div>

            {currentTask.type === "theory" && (
              <TheoryTask t={t} task={currentTask} lang={lang} nextTask={nextTask} />
            )}

            {currentTask.type === "translate" && currentTask.word && (
              <TranslationTask t={t} word={currentTask.word} options={beOptions} answer={answer} choose={choose} />
            )}

            {currentTask.type === "audio" && currentTask.word && (
              <AudioTask t={t} word={currentTask.word} options={ruOptions} answer={answer} choose={choose} />
            )}

            {currentTask.type === "trueFalse" && currentTask.word && (
              <TrueFalseTask t={t} word={currentTask.word} answer={answer} choose={choose} />
            )}

            {currentTask.type === "fill" && currentTask.word && (
              <FillTask task={currentTask} word={currentTask.word} options={beOptions} answer={answer} choose={choose} />
            )}

            {currentTask.type === "build" && (
              <BuildTask
                t={t}
                task={currentTask}
                answer={answer}
                builtWords={builtWords}
                setBuiltWords={setBuiltWords}
                check={() => checkBuiltSentence(currentTask.sentenceBe || "")}
              />
            )}

            {currentTask.type === "finish" && !reviewMode && reviewTasks.length > 0 && (
              <ReviewMistakesTask t={t} count={reviewTasks.length} startReview={startReview} />
            )}

            {currentTask.type === "finish" && (reviewMode || reviewTasks.length === 0) && (
              <FinishTask t={t} lesson={selectedLesson} lang={lang} finishLesson={finishLesson} />
            )}

            {answer && currentTask.type !== "finish" && (
              <>
                <div className="mt-4 rounded-2xl bg-white p-4 font-black text-slate-950">
                  {currentTask.type === "build"
                    ? answer === currentTask.sentenceBe
                      ? t.correct
                      : `${t.wrong} ${currentTask.sentenceBe}`
                    : answer === currentWord.be || answer === currentWord.ru || answer === "true"
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

      {screen === "words" && (
        <WordsTrainer
          t={t}
          words={allWords}
          index={wordTrainerIndex}
          setIndex={setWordTrainerIndex}
          back={() => setScreen("home")}
        />
      )}

      <footer className="mx-auto mt-16 max-w-6xl px-5 pb-10">
        <LanguageSwitch lang={lang} setLang={changeLang} t={t} />
      </footer>
    </main>
  );
}

function TheoryTask({ t, task, lang, nextTask }: { t: typeof tr.ru; task: Task; lang: Lang; nextTask: () => void }) {
  return (
    <>
      <div className="rounded-3xl bg-white p-6 text-slate-950">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t.theory}</p>
        <p className="mt-4 text-xl font-bold leading-9">{lang === "ru" ? task.theoryRu : task.theoryBe}</p>
      </div>
      <button onClick={nextTask} className="mt-4 w-full rounded-2xl bg-lime-500 py-4 text-lg font-black text-white shadow-[0_5px_0_#65a30d]">
        {t.next}
      </button>
    </>
  );
}

function TranslationTask({ t, word, options, answer, choose }: { t: typeof tr.ru; word: Word; options: string[]; answer: string | null; choose: (option: string) => void }) {
  return (
    <>
      <div className="rounded-3xl bg-white p-6 text-slate-950">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t.chooseTranslation}</p>
        <p className="mt-2 text-6xl font-black">{word.ru}</p>
      </div>
      <OptionGrid options={options} answer={answer} correct={word.be} choose={choose} audio />
    </>
  );
}

function AudioTask({ t, word, options, answer, choose }: { t: typeof tr.ru; word: Word; options: string[]; answer: string | null; choose: (option: string) => void }) {
  return (
    <>
      <div className="rounded-3xl bg-white p-6 text-slate-950">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t.listenAndChoose}</p>
        <button onClick={() => speak(word.be)} className="mt-3 rounded-2xl bg-lime-500 px-6 py-4 text-2xl font-black text-white shadow-[0_5px_0_#65a30d]">
          🔊 {t.listen}
        </button>
      </div>
      <OptionGrid options={options} answer={answer} correct={word.ru} choose={choose} />
    </>
  );
}

function TrueFalseTask({ t, word, answer, choose }: { t: typeof tr.ru; word: Word; answer: string | null; choose: (option: string) => void }) {
  return (
    <>
      <button onClick={() => speak(word.be)} className="w-full rounded-3xl bg-white p-6 text-left text-slate-950">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t.trueFalse}</p>
        <p className="mt-2 text-6xl font-black">{word.be} 🔊</p>
        <p className="mt-3 text-xl font-black text-slate-500">{word.be} = {word.ru}</p>
      </button>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button onClick={() => choose("true")} disabled={Boolean(answer)} className="rounded-2xl bg-lime-500 px-5 py-4 text-lg font-black text-white">{t.yes}</button>
        <button onClick={() => choose("false")} disabled={Boolean(answer)} className="rounded-2xl bg-red-500 px-5 py-4 text-lg font-black text-white">{t.no}</button>
      </div>
    </>
  );
}

function FillTask({ task, word, options, answer, choose }: { task: Task; word: Word; options: string[]; answer: string | null; choose: (option: string) => void }) {
  return (
    <>
      <div className="rounded-3xl bg-white p-6 text-slate-950">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Прыклад</p>
        <p className="mt-2 text-3xl font-black">{task.sentenceBe}</p>
        <p className="mt-3 text-lg font-bold text-slate-500">{task.sentenceRu}</p>
      </div>
      <OptionGrid options={options} answer={answer} correct={word.be} choose={choose} audio />
    </>
  );
}

function BuildTask({
  t,
  task,
  answer,
  builtWords,
  setBuiltWords,
  check,
}: {
  t: typeof tr.ru;
  task: Task;
  answer: string | null;
  builtWords: string[];
  setBuiltWords: (words: string[]) => void;
  check: () => void;
}) {
  const availableWords = task.buildWords || [];

  return (
    <>
      <div className="rounded-3xl bg-white p-6 text-slate-950">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t.buildSentence}</p>
        <p className="mt-3 text-lg font-bold text-slate-500">{task.sentenceRu}</p>

        <div className="mt-5 min-h-20 rounded-2xl border-2 border-dashed border-slate-200 p-4">
          {builtWords.length === 0 ? (
            <p className="font-bold text-slate-400">Выбери слова ниже</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {builtWords.map((word, index) => (
                <button
                  key={`${word}-${index}`}
                  onClick={() => setBuiltWords(builtWords.filter((_, i) => i !== index))}
                  className="rounded-xl bg-lime-100 px-4 py-2 font-black text-lime-700"
                >
                  {word}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {availableWords.map((word) => (
            <button
              key={word}
              onClick={() => setBuiltWords([...builtWords, word])}
              disabled={Boolean(answer)}
              className="rounded-xl bg-slate-100 px-4 py-2 font-black text-slate-700"
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={check}
        disabled={Boolean(answer) || builtWords.length === 0}
        className="mt-4 w-full rounded-2xl bg-lime-500 py-4 text-lg font-black text-white shadow-[0_5px_0_#65a30d] disabled:bg-slate-300 disabled:shadow-none"
      >
        {t.check}
      </button>
    </>
  );
}

function ReviewMistakesTask({
  t,
  count,
  startReview,
}: {
  t: typeof tr.ru;
  count: number;
  startReview: () => void;
}) {
  return (
    <>
      <div className="rounded-3xl bg-white p-6 text-center text-slate-950">
        <p className="text-6xl">🧠</p>
        <h2 className="mt-3 text-4xl font-black">{t.reviewMistakes}</h2>
        <p className="mt-3 text-lg font-bold text-slate-500">{t.reviewText}</p>
        <p className="mt-5 text-2xl font-black text-amber-600">{count}</p>
      </div>

      <button
        onClick={startReview}
        className="mt-4 w-full rounded-2xl bg-lime-500 py-4 text-lg font-black text-white shadow-[0_5px_0_#65a30d]"
      >
        {t.reviewMistakes}
      </button>
    </>
  );
}

function FinishTask({ t, lesson, lang, finishLesson }: { t: typeof tr.ru; lesson: Lesson; lang: Lang; finishLesson: () => void }) {
  return (
    <>
      <div className="rounded-3xl bg-white p-6 text-center text-slate-950">
        <p className="text-6xl">🎉</p>
        <h2 className="mt-3 text-4xl font-black">{lang === "ru" ? "Урок завершён" : "Урок завершаны"}</h2>
        <p className="mt-3 text-lg font-bold text-slate-500">{lang === "ru" ? lesson.titleRu : lesson.titleBe}</p>
        <p className="mt-5 text-2xl font-black text-lime-600">+50 XP</p>
      </div>
      <button onClick={finishLesson} className="mt-4 w-full rounded-2xl bg-lime-500 py-4 text-lg font-black text-white shadow-[0_5px_0_#65a30d]">
        {t.finishLesson}
      </button>
    </>
  );
}

function OptionGrid({ options, answer, correct, choose, audio = false }: { options: string[]; answer: string | null; correct: string; choose: (option: string) => void; audio?: boolean }) {
  return (
    <div className="mt-4 grid gap-3">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => {
            if (audio) speak(option);
            choose(option);
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

function WordsTrainer({ t, words, index, setIndex, back }: { t: typeof tr.ru; words: Word[]; index: number; setIndex: (fn: number | ((value: number) => number)) => void; back: () => void }) {
  const word = words[index % words.length];

  return (
    <section className="mx-auto max-w-3xl px-5 py-8">
      <button onClick={back} className="mb-5 rounded-2xl bg-white px-5 py-3 font-black shadow-sm">← {t.back}</button>
      <div className="rounded-[2rem] bg-white p-6 text-center shadow-xl">
        <p className="font-black uppercase tracking-[0.2em] text-lime-700">{t.wordsMode}</p>
        <button onClick={() => speak(word.be)} className="mt-8 text-7xl font-black">{word.be} 🔊</button>
        <p className="mt-5 text-3xl font-black text-slate-500">{word.ru}</p>
        <button onClick={() => setIndex((value) => value + 1)} className="mt-8 w-full rounded-2xl bg-lime-500 py-4 text-lg font-black text-white shadow-[0_5px_0_#65a30d]">
          {t.next}
        </button>
      </div>
    </section>
  );
}

function Header({ t, user, goHome, login, register, logout }: { t: typeof tr.ru; user: User | null; goHome: () => void; login: () => void; register: () => void; logout: () => void }) {
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

function LessonCard({ title, description, status, active, completed, button, onClick }: { title: string; description: string; status: string; active: boolean; completed: boolean; button: string; onClick: () => void }) {
  return (
    <article className={`rounded-[2rem] p-6 shadow-sm ${active ? "bg-white" : "bg-white/60"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`font-black ${completed ? "text-sky-600" : active ? "text-lime-700" : "text-slate-400"}`}>{status}</p>
          <h2 className="mt-2 text-3xl font-black">{title}</h2>
          <p className="mt-3 text-slate-600">{description}</p>
        </div>
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-black ${completed ? "bg-sky-100 text-sky-700" : active ? "bg-lime-100 text-lime-700" : "bg-slate-100 text-slate-400"}`}>
          {completed ? "✓" : active ? "▶" : "🔒"}
        </div>
      </div>
      <button onClick={onClick} disabled={!active} className={`mt-6 w-full rounded-2xl py-4 text-lg font-black ${active ? "bg-lime-500 text-white shadow-[0_5px_0_#65a30d]" : "bg-slate-200 text-slate-500"}`}>
        {button}
      </button>
    </article>
  );
}

function DemoCard({ t }: { t: typeof tr.ru }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl">
      <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
        <p className="font-black text-lime-300">{t.chooseTranslation}</p>
        <div className="mt-5 rounded-3xl bg-white p-6 text-slate-950">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Русское слово</p>
          <p className="mt-2 text-5xl font-black">вода</p>
        </div>
        <div className="mt-4 grid gap-3">
          {["вада", "зямля", "воўк"].map((word) => (
            <button key={word} onClick={() => speak(word)} className="rounded-2xl bg-white/10 px-5 py-4 text-left text-lg font-black hover:bg-lime-400 hover:text-slate-950">
              {word} <span className="float-right">🔊</span>
            </button>
          ))}
        </div>
      </div>
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

function LanguageSwitch({ lang, setLang, t }: { lang: Lang; setLang: (lang: Lang) => void; t: typeof tr.ru }) {
  return (
    <div className="flex justify-center">
      <div className="rounded-full border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="pl-3 text-sm font-black text-slate-500">{t.language}</span>
          <button onClick={() => setLang("ru")} className={`rounded-full px-4 py-2 text-sm font-black ${lang === "ru" ? "bg-lime-500 text-white" : "text-slate-500"}`}>
            RU
          </button>
          <button onClick={() => setLang("be")} className={`rounded-full px-4 py-2 text-sm font-black ${lang === "be" ? "bg-lime-500 text-white" : "text-slate-500"}`}>
            BY
          </button>
        </div>
      </div>
    </div>
  );
}
