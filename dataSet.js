"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSet = void 0;
var maxLen = 45;
var validGameActionsListParade = [
    "Parade 9m",
    "Parade 7m",
    "Parade 6m",
    "Parade Flügel",
    "Parade Gegenstoß",
    "Parade Durchbruch"
];
var validGameActionsListGegentor = [
    "Gegentor 9m",
    "Gegentor 7m",
    "Gegentor 6m",
    "Gegentor Flügel",
    "Gegentor Gegenstoß",
    "Gegentor Durchbruch"
];
var validGameActionsListTor = [
    "Tor 9m",
    "Tor 7m",
    "Tor 6m",
    "Tor Flügel",
    "Tor Gegenstoß",
    "Tor Durchbruch"
];
var validGameActionsListFehlwurf = [
    "Fehlwurf 9m",
    "Fehlwurf 7m",
    "Fehlwurf 6m",
    "Fehlwurf Flügel",
    "Fehlwurf Gegenstoß",
    "Fehlwurf Durchbruch"
];
var validGameActionsListSonstige = [
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
var dataSet = /** @class */ (function () {
    function dataSet(tS, pN, gA) {
        this.setTimeStamp(tS);
        this.setPlayerName(pN);
        this.setGameAction(gA);
    }
    dataSet.prototype.isTimestampValid = function (timestamp) {
        // Zeitstempel in Stunden und Minuten aufteilen
        var _a = timestamp.split(':').map(Number), hours = _a[0], minutes = _a[1];
        // Prüfen, ob die Stunden und Minuten innerhalb des gültigen Bereichs (1 Stunde) liegen
        if (hours >= 0 && hours <= 60 && minutes >= 0 && minutes < 60) {
            return true;
        }
        return false;
    };
    dataSet.prototype.isNameLengthValid = function (name) {
        // Prüfen ob der Name die maximale Länge des Datenbankfeldes nicht überschreitet
        if (name.length <= maxLen) {
            return true;
        }
        else {
            return false;
        }
    };
    dataSet.prototype.isGameActionValid = function (action) {
        var actionTypes = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], validGameActionsListParade, true), validGameActionsListGegentor, true), validGameActionsListTor, true), validGameActionsListFehlwurf, true), validGameActionsListSonstige, true);
        return actionTypes.includes(action);
    };
    dataSet.prototype.getTimeStamp = function () {
        return this.timeStamp;
    };
    dataSet.prototype.getPlayerName = function () {
        return this.playerName;
    };
    dataSet.prototype.getGameAction = function () {
        return this.gameAction;
    };
    dataSet.prototype.setTimeStamp = function (tS) {
        if (this.isTimestampValid(tS)) {
            this.timeStamp = tS;
        }
        else { /*Errorhandling*/ }
    };
    dataSet.prototype.setPlayerName = function (pN) {
        if (this.isNameLengthValid(pN)) {
            this.playerName = pN;
        }
        else { /*Errorhandling*/ }
    };
    dataSet.prototype.setGameAction = function (gA) {
        if (this.isGameActionValid(gA)) {
            this.gameAction = gA;
        }
        else {
            console.error("Ung\u00FCltige Aktion: ".concat(gA));
        }
    };
    return dataSet;
}());
exports.dataSet = dataSet;
