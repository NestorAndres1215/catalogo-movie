import { Component, OnDestroy, signal } from '@angular/core';

interface EmojiQuestion {
  id: number;
  emojis: string;
  hint: string;
  answer: string;
  options: string[];
}

@Component({
  selector: 'app-emoji-game',
  standalone: true,
  imports: [],
  templateUrl: './emoji-game.html',
  styleUrl: './emoji-game.css',
})
export class EmojiGameComponent implements OnDestroy {
  private readonly questionBank: EmojiQuestion[] = [
    {
      id: 1,
      emojis: '🦁 👑 🌅',
      hint: 'Un joven león debe recuperar su reino.',
      answer: 'El rey león',
      options: ['Madagascar', 'El rey león', 'La era de hielo', 'Kung Fu Panda'],
    },
    {
      id: 2,
      emojis: '🚢 ❤️ 🧊 🌊',
      hint: 'Una historia de amor durante un famoso naufragio.',
      answer: 'Titanic',
      options: ['Titanic', 'Piratas del Caribe', 'Náufrago', 'La tormenta perfecta'],
    },
    {
      id: 3,
      emojis: '🐠 🌊 🐢 🔎',
      hint: 'Un padre cruza el océano buscando a su hijo.',
      answer: 'Buscando a Nemo',
      options: ['La sirenita', 'Luca', 'Buscando a Nemo', 'Shark Tale'],
    },
    {
      id: 4,
      emojis: '🦖 🧬 🏝️ 🚙',
      hint: 'Un parque temático donde los dinosaurios vuelven a vivir.',
      answer: 'Jurassic Park',
      options: ['King Kong', 'Jurassic Park', 'Godzilla', 'Avatar'],
    },
    {
      id: 5,
      emojis: '🕷️ 🧑 🏙️ 🦸',
      hint: 'Un joven obtiene poderes después de la picadura de una araña.',
      answer: 'Spider-Man',
      options: ['Batman', 'Iron Man', 'Spider-Man', 'Superman'],
    },
    {
      id: 6,
      emojis: '🧙 ⚡ 🪄 🏰',
      hint: 'Un joven mago estudia en una escuela de magia.',
      answer: 'Harry Potter',
      options: [
        'El señor de los anillos',
        'Harry Potter',
        'Las crónicas de Narnia',
        'Animales fantásticos',
      ],
    },
    {
      id: 7,
      emojis: '❄️ 👸 ⛄ 🏰',
      hint: 'Dos hermanas y un reino cubierto de hielo.',
      answer: 'Frozen',
      options: ['Cenicienta', 'Enredados', 'Frozen', 'La bella durmiente'],
    },
    {
      id: 8,
      emojis: '💀 🎸 🎶 🌼',
      hint: 'Un niño viaja al mundo de los muertos y descubre su historia familiar.',
      answer: 'Coco',
      options: ['Encanto', 'Coco', 'Soul', 'Intensamente'],
    },
    {
      id: 9,
      emojis: '😈 👨‍👧 🍌 🟡',
      hint: 'Un villano tiene pequeños ayudantes amarillos.',
      answer: 'Mi villano favorito',
      options: ['Shrek', 'Los increíbles', 'Mi villano favorito', 'Megamente'],
    },
    {
      id: 10,
      emojis: '🚗 🏁 💨 👨‍👩‍👧‍👦',
      hint: 'Carreras, velocidad y una familia muy unida.',
      answer: 'Rápidos y furiosos',
      options: ['Cars', 'Rápidos y furiosos', 'Need for Speed', 'Mad Max'],
    },
    {
      id: 11,
      emojis: '💍 🧙 🏔️ 🧝',
      hint: 'Un pequeño hobbit debe destruir un poderoso anillo.',
      answer: 'El señor de los anillos',
      options: [
        'Harry Potter',
        'El hobbit',
        'El señor de los anillos',
        'Las crónicas de Narnia',
      ],
    },
    {
      id: 12,
      emojis: '🏴‍☠️ 🚢 🦜 ⚔️',
      hint: 'Un pirata muy peculiar busca un barco legendario.',
      answer: 'Piratas del Caribe',
      options: [
        'Piratas del Caribe',
        'Peter Pan',
        'La isla del tesoro',
        'Master and Commander',
      ],
    },
    {
      id: 13,
      emojis: '🧊 🦣 🐿️ 🌍',
      hint: 'Un grupo de animales intenta sobrevivir a una glaciación.',
      answer: 'La era de hielo',
      options: ['Madagascar', 'La era de hielo', 'Zootopia', 'Dinosaurio'],
    },
    {
      id: 14,
      emojis: '🐼 🥋 🐉 🍜',
      hint: 'Un panda torpe se convierte en un gran maestro de kung fu.',
      answer: 'Kung Fu Panda',
      options: ['Mulan', 'Kung Fu Panda', 'Ratatouille', 'Shrek'],
    },
    {
      id: 15,
      emojis: '👹 🟢 🏰 🐴',
      hint: 'Un ogro verde vive en un pantano y conoce a una princesa.',
      answer: 'Shrek',
      options: ['Shrek', 'Monsters, Inc.', 'Megamente', 'El gato con botas'],
    },
    {
      id: 16,
      emojis: '🐀 👨‍🍳 🍲 🇫🇷',
      hint: 'Una rata sueña con convertirse en un gran chef.',
      answer: 'Ratatouille',
      options: ['Lluvia de hamburguesas', 'Ratatouille', 'Chef', 'WALL-E'],
    },
    {
      id: 17,
      emojis: '🤖 🌱 🚀 ❤️',
      hint: 'Un pequeño robot limpia un planeta abandonado.',
      answer: 'WALL-E',
      options: ['Big Hero 6', 'WALL-E', 'Robots', 'El gigante de hierro'],
    },
    {
      id: 18,
      emojis: '🎈 👴 🏠 🌎',
      hint: 'Un anciano vuela con su casa usando miles de globos.',
      answer: 'Up',
      options: ['Up', 'Coco', 'Encanto', 'Toy Story'],
    },
    {
      id: 19,
      emojis: '🤠 🚀 🧸 🧒',
      hint: 'Los juguetes cobran vida cuando nadie los está mirando.',
      answer: 'Toy Story',
      options: ['Toy Story', 'Pequeños guerreros', 'Los increíbles', 'Monsters, Inc.'],
    },
    {
      id: 20,
      emojis: '👾 🚪 👧 🏭',
      hint: 'Dos monstruos trabajan asustando niños para producir energía.',
      answer: 'Monsters, Inc.',
      options: ['Hotel Transylvania', 'Monsters, Inc.', 'Shrek', 'Luca'],
    },
    {
      id: 21,
      emojis: '🦸‍♂️ 👨‍👩‍👧‍👦 🦹 💥',
      hint: 'Una familia de superhéroes intenta llevar una vida normal.',
      answer: 'Los increíbles',
      options: ['Los increíbles', 'Avengers', 'Watchmen', 'Megamente'],
    },
    {
      id: 22,
      emojis: '🧠 😊 😢 😡 😱',
      hint: 'Las emociones controlan la mente de una niña.',
      answer: 'Intensamente',
      options: ['Coco', 'Soul', 'Intensamente', 'Red'],
    },
    {
      id: 23,
      emojis: '🐉 👧 🏹 🏔️',
      hint: 'Una joven debe salvar su reino con la ayuda de un dragón.',
      answer: 'Raya y el último dragón',
      options: ['Mulán', 'Raya y el último dragón', 'Valiente', 'Cómo entrenar a tu dragón'],
    },
    {
      id: 24,
      emojis: '🐉 🧑‍🦰 🏹 🌌',
      hint: 'Un joven vikingo desarrolla una amistad con un dragón.',
      answer: 'Cómo entrenar a tu dragón',
      options: ['Shrek', 'Cómo entrenar a tu dragón', 'Eragon', 'Raya y el último dragón'],
    },
    {
      id: 25,
      emojis: '🦇 🌃 🃏 💰',
      hint: 'Un héroe de Gotham se enfrenta a un villano llamado Joker.',
      answer: 'Batman: El caballero de la noche',
      options: [
        'Superman',
        'Batman: El caballero de la noche',
        'Joker',
        'Iron Man',
      ],
    },
    {
      id: 26,
      emojis: '🦾 ❤️ 🕶️ 🚀',
      hint: 'Un millonario construye una armadura tecnológica.',
      answer: 'Iron Man',
      options: ['Iron Man', 'Capitán América', 'Thor', 'Ant-Man'],
    },
    {
      id: 27,
      emojis: '🛡️ 🇺🇸 💥 🧊',
      hint: 'Un soldado recibe un escudo y despierta décadas después.',
      answer: 'Capitán América',
      options: ['Iron Man', 'Hulk', 'Capitán América', 'Black Panther'],
    },
    {
      id: 28,
      emojis: '⚡ 🔨 🌩️ 🛡️',
      hint: 'Un dios del trueno utiliza un poderoso martillo.',
      answer: 'Thor',
      options: ['Aquaman', 'Thor', 'Superman', 'Shazam'],
    },
    {
      id: 29,
      emojis: '🟣 💎 🌌 🦸',
      hint: 'Un poderoso villano busca reunir seis piedras especiales.',
      answer: 'Avengers: Infinity War',
      options: [
        'Avengers: Endgame',
        'Avengers: Infinity War',
        'Guardianes de la Galaxia',
        'Eternals',
      ],
    },
    {
      id: 30,
      emojis: '🕷️ 🌆 🕸️ 👨‍👩‍👧',
      hint: 'Varios Spider-Man de diferentes universos se encuentran.',
      answer: 'Spider-Man: Un nuevo universo',
      options: [
        'Venom',
        'Spider-Man: Sin camino a casa',
        'Spider-Man: Un nuevo universo',
        'Morbius',
      ],
    },
    {
      id: 31,
      emojis: '💊 🕶️ 💻 🐇',
      hint: 'Un hombre descubre que vive dentro de una realidad simulada.',
      answer: 'Matrix',
      options: ['Matrix', 'Origen', 'Tron', 'Ready Player One'],
    },
    {
      id: 32,
      emojis: '🦈 🌊 🚤 😱',
      hint: 'Un enorme tiburón aterroriza una playa.',
      answer: 'Tiburón',
      options: ['Megalodón', 'Buscando a Nemo', 'Tiburón', 'Piraña'],
    },
    {
      id: 33,
      emojis: '🦍 🏙️ ✈️ 💔',
      hint: 'Un enorme gorila es llevado a una gran ciudad.',
      answer: 'King Kong',
      options: ['Godzilla', 'King Kong', 'Jurassic Park', 'Rampage'],
    },
    {
      id: 34,
      emojis: '🦕 🌋 🏝️ 🔥',
      hint: 'Una criatura gigante prehistórica amenaza una ciudad.',
      answer: 'Godzilla',
      options: ['King Kong', 'Godzilla', 'Jurassic Park', 'Pacific Rim'],
    },
    {
      id: 35,
      emojis: '💙 🌳 🏹 🌌',
      hint: 'Un humano llega a un planeta habitado por seres azules.',
      answer: 'Avatar',
      options: ['Avatar', 'Valerian', 'Dune', 'John Carter'],
    },
    {
      id: 36,
      emojis: '🏜️ 🪱 👑 🌌',
      hint: 'Un joven llega a un planeta desértico muy importante.',
      answer: 'Dune',
      options: ['Star Wars', 'Dune', 'Mad Max', 'Avatar'],
    },
    {
      id: 37,
      emojis: '🚀 🌌 🤖 ⭐',
      hint: 'Un grupo de héroes viaja por el espacio con un mapache.',
      answer: 'Guardianes de la Galaxia',
      options: [
        'Star Trek',
        'Guardianes de la Galaxia',
        'Star Wars',
        'Interstellar',
      ],
    },
    {
      id: 38,
      emojis: '🌌 ⚔️ 🤖 👨‍🚀',
      hint: 'Una guerra galáctica enfrenta a Jedi y Sith.',
      answer: 'Star Wars',
      options: ['Star Trek', 'Dune', 'Star Wars', 'Guardianes de la Galaxia'],
    },
    {
      id: 39,
      emojis: '🧑‍🚀 🌌 🕳️ ⏳',
      hint: 'Un astronauta viaja por el espacio buscando salvar a la humanidad.',
      answer: 'Interestelar',
      options: ['Gravity', 'Interestelar', 'Marte', 'Ad Astra'],
    },
    {
      id: 40,
      emojis: '👨‍🚀 🔴 🌱 🥔',
      hint: 'Un astronauta queda atrapado solo en Marte.',
      answer: 'Misión rescate',
      options: ['Gravity', 'Misión rescate', 'Interestelar', 'Apollo 13'],
    },
    {
      id: 41,
      emojis: '🧸 🪟 🌙 🧒',
      hint: 'Un niño se hace amigo de un extraterrestre.',
      answer: 'E.T., el extraterrestre',
      options: [
        'E.T., el extraterrestre',
        'Super 8',
        'Encuentros cercanos del tercer tipo',
        'Wall-E',
      ],
    },
    {
      id: 42,
      emojis: '🦸‍♂️ 🦸‍♀️ 🏙️ ⚡',
      hint: 'Un equipo de superhéroes debe salvar el mundo.',
      answer: 'Los Vengadores',
      options: ['Liga de la Justicia', 'Los Vengadores', 'X-Men', 'Los increíbles'],
    },
    {
      id: 43,
      emojis: '🧙‍♀️ 🧹 🐈 🌙',
      hint: 'Una joven bruja aprende a vivir por su cuenta.',
      answer: 'Kiki: Entregas a domicilio',
      options: [
        'El viaje de Chihiro',
        'Kiki: Entregas a domicilio',
        'Mi vecino Totoro',
        'Ponyo',
      ],
    },
    {
      id: 44,
      emojis: '🐉 🏯 👧 👻',
      hint: 'Una niña entra en un misterioso mundo de espíritus.',
      answer: 'El viaje de Chihiro',
      options: [
        'Ponyo',
        'El viaje de Chihiro',
        'La princesa Mononoke',
        'Mi vecino Totoro',
      ],
    },
    {
      id: 45,
      emojis: '🌳 🐱 👧 🌧️',
      hint: 'Dos niñas conocen a una criatura gigante del bosque.',
      answer: 'Mi vecino Totoro',
      options: [
        'Mi vecino Totoro',
        'Ponyo',
        'El viaje de Chihiro',
        'El castillo ambulante',
      ],
    },
    {
      id: 46,
      emojis: '🧜‍♀️ 🐚 🌊 👑',
      hint: 'Una sirena sueña con vivir en el mundo de los humanos.',
      answer: 'La sirenita',
      options: ['Moana', 'La sirenita', 'Ponyo', 'Frozen'],
    },
    {
      id: 47,
      emojis: '🌺 🌊 🛶 🐓',
      hint: 'Una joven navega por el océano para salvar su isla.',
      answer: 'Moana',
      options: ['Encanto', 'Moana', 'Raya y el último dragón', 'Lilo y Stitch'],
    },
    {
      id: 48,
      emojis: '👧 🏠 🌸 🎶',
      hint: 'Una familia colombiana tiene poderes mágicos.',
      answer: 'Encanto',
      options: ['Coco', 'Encanto', 'Frozen', 'Turning Red'],
    },
    {
      id: 49,
      emojis: '🐻 🍯 🌳 🐝',
      hint: 'Un oso amarillo ama la miel y vive en el bosque.',
      answer: 'Winnie the Pooh',
      options: ['Paddington', 'Winnie the Pooh', 'El libro de la selva', 'Zootopia'],
    },
    {
      id: 50,
      emojis: '🐻 🎩 🇬🇧 🥪',
      hint: 'Un pequeño oso peruano llega a Londres.',
      answer: 'Paddington',
      options: ['Winnie the Pooh', 'Ted', 'Paddington', 'El oso Yogui'],
    },
  ];

  readonly questions = signal<EmojiQuestion[]>([]);
  readonly currentQuestionIndex = signal(0);
  readonly selectedAnswer = signal<string | null>(null);
  readonly score = signal(0);
  readonly answered = signal(false);
  readonly gameFinished = signal(false);
  readonly gameStarted = signal(false);

  readonly totalQuestions = 10;
  readonly totalTime = 30;
  readonly timeLeft = signal(30);

  private timerInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // El juego espera a que el usuario pulse el botón de inicio.
  }

  startGame(): void {
    this.stopTimer();

    const shuffled = this.shuffle([...this.questionBank]);

    this.questions.set(shuffled.slice(0, this.totalQuestions));
    this.currentQuestionIndex.set(0);
    this.selectedAnswer.set(null);
    this.score.set(0);
    this.answered.set(false);
    this.gameFinished.set(false);
    this.timeLeft.set(this.totalTime);
    this.gameStarted.set(true);

    this.startTimer();
  }

  private startTimer(): void {
    this.stopTimer();
    this.timeLeft.set(this.totalTime);

    this.timerInterval = setInterval(() => {
      if (this.answered() || this.gameFinished()) {
        this.stopTimer();
        return;
      }

      if (this.timeLeft() > 1) {
        this.timeLeft.update((time) => time - 1);
        return;
      }

      this.timeLeft.set(0);
      this.timeExpired();
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private timeExpired(): void {
    if (this.answered() || this.gameFinished()) {
      return;
    }

    this.stopTimer();
    this.selectedAnswer.set(null);
    this.answered.set(true);
  }

  answerQuestion(option: string): void {
    if (this.answered() || this.gameFinished()) {
      return;
    }

    const question = this.currentQuestion();

    if (!question) {
      return;
    }

    this.stopTimer();
    this.selectedAnswer.set(option);
    this.answered.set(true);

    if (option === question.answer) {
      this.score.update((value) => value + 1);
    }
  }

  nextQuestion(): void {
    if (!this.answered()) {
      return;
    }

    this.stopTimer();

    const nextIndex = this.currentQuestionIndex() + 1;

    if (nextIndex >= this.questions().length) {
      this.gameFinished.set(true);
      return;
    }

    this.currentQuestionIndex.set(nextIndex);
    this.selectedAnswer.set(null);
    this.answered.set(false);

    this.startTimer();
  }

  currentQuestion(): EmojiQuestion | undefined {
    return this.questions()[this.currentQuestionIndex()];
  }

  isCorrect(option: string): boolean {
    return option === this.currentQuestion()?.answer;
  }

  isSelected(option: string): boolean {
    return option === this.selectedAnswer();
  }

  getProgress(): number {
    return (
      ((this.currentQuestionIndex() + 1) / this.totalQuestions) * 100
    );
  }

  getResultMessage(): string {
    const result = this.score();

    if (result === 10) {
      return '¡Perfecto! Eres un verdadero experto del cine.';
    }

    if (result >= 8) {
      return '¡Excelente! Conoces muchísimo de películas.';
    }

    if (result >= 5) {
      return '¡Muy bien! Tienes buenos conocimientos de cine.';
    }

    if (result >= 3) {
      return '¡Buen intento! Todavía puedes mejorar.';
    }

    return '¡No te rindas! Sigue practicando y vuelve a intentarlo.';
  }

  private shuffle<T>(items: T[]): T[] {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [items[i], items[j]] = [items[j], items[i]];
    }

    return items;
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }
}