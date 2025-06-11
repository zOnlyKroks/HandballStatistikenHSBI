const maxLen: number = 45;
const validGameActionsListParade: string[] = [
  "Parade 9m",
  "Parade 7m",
  "Parade 6m",
  "Parade Flügel",
  "Parade Gegenstoß",
  "Parade Durchbruch",
];
const validGameActionsListGegentor: string[] = [
  "Gegentor 9m",
  "Gegentor 7m",
  "Gegentor 6m",
  "Gegentor Flügel",
  "Gegentor Gegenstoß",
  "Gegentor Durchbruch",
];
const validGameActionsListTor: string[] = [
  "Tor 9m",
  "Tor 7m",
  "Tor 6m",
  "Tor Flügel",
  "Tor Gegenstoß",
  "Tor Durchbruch",
];
const validGameActionsListFehlwurf: string[] = [
  "Fehlwurf 9m",
  "Fehlwurf 7m",
  "Fehlwurf 6m",
  "Fehlwurf Flügel",
  "Fehlwurf Gegenstoß",
  "Fehlwurf Durchbruch",
];
const validGameActionsListSonstige: string[] = [
  "Ballgewinn",
  "Assist",
  "7m geholt",
  "7m verursacht",
  "2 Minuten",
  "Rote Karte",
  "Block",
  "Technischer Fehler",
  "Fehlpass",
  "Stoppfoul",
];

export class dataSet {
  private timeStamp!: string; //! ist eine Definite Assignment Assertion, damit der Compiler im Konstruktor nicht meckert
  private playerName!: string;
  private gameAction!: string;

  constructor(tS: string, pN: string, gA: string) {
    this.setTimeStamp(tS);
    this.setPlayerName(pN);
    this.setGameAction(gA);
  }

  private isTimestampValid(timestamp: string): boolean {
    // Zeitstempel in Stunden und Minuten aufteilen
    const [hours, minutes] = timestamp.split(":").map(Number);

    // Prüfen, ob die Stunden und Minuten innerhalb des gültigen Bereichs (1 Stunde) liegen
    if (hours >= 0 && hours <= 60 && minutes >= 0 && minutes < 60) {
      return true;
    }
    return false;
  }

  private isNameLengthValid(name: string): boolean {
    // Prüfen ob der Name die maximale Länge des Datenbankfeldes nicht überschreitet
    if (name.length <= maxLen) {
      return true;
    } else {
      return false;
    }
  }

  private isGameActionValid(action: string): boolean {
    const actionTypes = [
      ...validGameActionsListParade,
      ...validGameActionsListGegentor,
      ...validGameActionsListTor,
      ...validGameActionsListFehlwurf,
      ...validGameActionsListSonstige,
    ];

    return actionTypes.includes(action);
  }

  public getTimeStamp(): string {
    return this.timeStamp;
  }
  public getPlayerName(): string {
    return this.playerName;
  }
  public getGameAction(): string {
    return this.gameAction;
  }

  public setTimeStamp(tS: string): void {
    if (this.isTimestampValid(tS)) {
      this.timeStamp = tS;
    } else {
      /*Errorhandling*/
    }
  }

  public setPlayerName(pN: string): void {
    if (this.isNameLengthValid(pN)) {
      this.playerName = pN;
    } else {
      /*Errorhandling*/
    }
  }

  public setGameAction(gA: string): void {
    if (this.isGameActionValid(gA)) {
      this.gameAction = gA;
    } else {
      console.error(`Ungültige Aktion: ${gA}`);
    }
  }
}
