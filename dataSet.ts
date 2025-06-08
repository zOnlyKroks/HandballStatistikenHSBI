const maxLen : number = 45;
const validGameActionsListParade: string[] = [
    "Parade 9m",
    "Parade 7m",
    "Parade 6m",
    "Parade Flügel",
    "Parade Gegenstoß",
    "Parade Durchbruch"
];
const validGameActionsListGegentor: string[] = [
    "Gegentor 9m",
    "Gegentor 7m",
    "Gegentor 6m",
    "Gegentor Flügel",
    "Gegentor Gegenstoß",
    "Gegentor Durchbruch"
];
const validGameActionsListTor: string[] = [
    "Tor 9m",
    "Tor 7m",
    "Tor 6m",
    "Tor Flügel",
    "Tor Gegenstoß",
    "Tor Durchbruch"
];
const validGameActionsListFehlwurf: string[] = [
    "Fehlwurf 9m",
    "Fehlwurf 7m",
    "Fehlwurf 6m",
    "Fehlwurf Flügel",
    "Fehlwurf Gegenstoß",
    "Fehlwurf Durchbruch"
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

export class dataSet{
    private timeStamp! : string;    //! ist eine Definite Assignment Assertion, damit der Compiler im Konstruktor nicht meckert
    private playerName! : string;
    private gameAction! : string;

    constructor(tS:string, pN:string, gA:string){
        this.setTimeStamp(tS);
        this.setPlayerName(pN);
        this.setGameAction(gA);
    }

    private isTimestampValid(timestamp: string): boolean {
        // Zeitstempel in Stunden und Minuten aufteilen
        const [hours, minutes] = timestamp.split(':').map(Number);

        // Prüfen, ob die Stunden und Minuten innerhalb des gültigen Bereichs (1 Stunde) liegen
        if (hours >= 0 && hours <= 60 && minutes >= 0 && minutes < 60) {
            return true;
        }
    return false;
    }

    private isNameLengthValid(name:string):boolean{
        // Prüfen ob der Name die maximale Länge des Datenbankfeldes nicht überschreitet
        if(name.length <= maxLen) {
            return true;
        }
        else{
            return false;
        }
    }

    private isGameActionValid(action:string):boolean{
        let firstSpaceIndex: number = action.indexOf(" ")       //Ermitteln wo ein Leerzeichen ist
        let filter: string;
        let actionsListName: string = "validGameActionsList"    //Grundname der Liste
        if(firstSpaceIndex !== -1 && !["7m", "2", "Technischer"].includes(action.slice(firstSpaceIndex).trim())){
            filter = action.slice(firstSpaceIndex).trim();      //Vorfilter auswählen
        }
        else{
            filter = "Andere";                                  //Fängt alle Fälle ab, die nicht mit dem selben Wort beginnen
        }
        for(const item of actionsListName.concat(filter)){      //Erstellen des Namensstrings der zugehörigen Liste
            if(action == item){                                 //Prüfen ob die Gameaction Teil der vorausgewählten Liste ist
                return true;
           }
        }
        return false;
    }

    public getTimeStamp(): string{
        return this.timeStamp;
    }
    public getPlayerName(): string{
        return this.playerName;
    }
    public getGameAction(): string{
        return this.gameAction;
    }
    
    public setTimeStamp(tS : string): void{
        if(this.isTimestampValid(tS)){
            this.timeStamp = tS;
        }
        else{/*Errorhandling*/}
    }

    public setPlayerName(pN:string): void{
        if(this.isNameLengthValid(pN)){
            this.playerName = pN;
        }
        else{/*Errorhandling*/}
    }

    public setGameAction(gA:string): void{
        if(this.isGameActionValid(gA)){
            this.gameAction = gA;
        }
        else{/*Errorhandling*/}
    }

}