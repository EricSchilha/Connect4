"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("./Util");
class Game {
    constructor(p1, p2) {
        this.nWidth = 7;
        this.nHeight = 6;
        this.redTiles = 0;
        this.blueTiles = 0;
        this.win = false;
        this.players = {};
        this.turn = Util_1.TileState.Red;
        p1.color = Util_1.TileState.Red;
        p2.color = Util_1.TileState.Blue;
        this.players[p1.color] = p1;
        this.players[p2.color] = p2;
        this.board = [];
        for (let i = 0; i < this.nHeight; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.nWidth; j++) {
                this.board[i][j] = Util_1.TileState.Empty;
            }
        }
        p1.socket.emit("setColor", {
            color: 0
        });
        p2.socket.emit("setColor", {
            color: 1
        });
        this.players[this.turn].socket.emit("changeTurn", {
            turn: true
        });
        console.log(`${p1.id} is matched with ${p2.id}`);
    }
    update(tileColumn, player) {
        if (this.turn != player.color)
            return;
        console.log(`Turn: ${this.turn} , Player: ${player.color}`);
        for (let i = this.board.length - 1; i >= 0; i--) {
            if (this.board[i][tileColumn] == Util_1.TileState.Empty) {
                this.board[i][tileColumn] = this.turn;
                if (this.turn == Util_1.TileState.Red)
                    this.redTiles++;
                else
                    this.blueTiles++;
                break;
            }
        }
        if (this.checkWin()) {
            let winner = this.players[this.turn];
            winner.socket.emit("WIN");
            winner.partner.socket.emit("LOSE");
            winner.wins++;
            console.log("Somebody Won");
        }
        this.players[this.turn].socket.emit("changeTurn", {
            turn: false
        });
        this.players[(this.turn == Util_1.TileState.Blue) ? Util_1.TileState.Red : Util_1.TileState.Blue].socket.emit("changeTurn", {
            turn: true,
            move: tileColumn
        });
        this.turn = (this.turn == Util_1.TileState.Blue) ? Util_1.TileState.Red : Util_1.TileState.Blue;
        for (let y = 0; y < this.nHeight; y++) {
            for (let x = 0; x < this.nWidth; x++) {
                switch (this.board[y][x]) {
                    case Util_1.TileState.Blue:
                        process.stdout.write("B ");
                        break;
                    case Util_1.TileState.Red:
                        process.stdout.write("R ");
                        break;
                    default:
                        process.stdout.write("- ");
                        break;
                }
            }
            console.log();
        }
    }
    reset() {
        for (let i in this.players) {
            this.players[i].socket.emit("reset");
        }
        this.win = false;
        this.redTiles = 0;
        this.blueTiles = 0;
        this.players[this.turn].socket.emit("changeTurn", {
            turn: true
        });
        this.board = [];
        for (let i = 0; i < this.nHeight; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.nWidth; j++) {
                this.board[i][j] = Util_1.TileState.Empty;
            }
        }
    }
    checkWin() {
        // console.log("CHECKWIN");
        let winColor = this.turn;
        let nWinTiles = (this.turn == Util_1.TileState.Blue) ? this.blueTiles : this.redTiles;
        let nTotal = nWinTiles;
        let nConnected = 0;
        if (nWinTiles < 4)
            return false;
        for (let y = this.board.length - 1; y >= 0; y--) { //HORIZONTAL
            if (nTotal < 4)
                break;
            nConnected = 0;
            for (let x = 0; x < this.board[y].length; x++) {
                if (this.board[y][x] == winColor) {
                    nConnected++;
                    if (nConnected == 4) {
                        return true;
                    }
                }
                else {
                    nTotal -= nConnected;
                    nConnected = 0;
                }
            }
        }
        nTotal = nWinTiles;
        for (let x = 0; x < this.board[0].length; x++) { //VERTICAL
            if (nTotal < 4)
                break;
            nConnected = 0;
            for (let y = this.board.length - 1; y >= 0; y--) {
                if (this.board[y][x] == winColor) {
                    nConnected++;
                    if (nConnected == 4) {
                        return true;
                    }
                }
                else {
                    nTotal -= nConnected;
                    nConnected = 0;
                }
            }
        }
        nTotal = nWinTiles;
        for (let x = 0; x < this.board[0].length - 3; x++) { //NORTHEAST DIAGONAL
            if (nTotal < 4)
                break;
            nConnected = 0;
            for (let y = this.board.length - 1, x2 = x; y >= 0 && x2 < this.board[0].length; y--, x2++) {
                if (this.board[y][x2] == winColor) {
                    nConnected++;
                    if (nConnected == 4) {
                        return true;
                    }
                }
                else {
                    nTotal -= nConnected;
                    nConnected = 0;
                }
            }
        }
        for (let y = this.board.length - 2; y >= 3; y--) {
            if (nTotal < 4)
                break;
            nConnected = 0;
            for (let y2 = y, x = 0; y2 >= 0 && x < this.board[0].length; y2--, x++) {
                if (this.board[y2][x] == winColor) {
                    nConnected++;
                    if (nConnected == 4) {
                        return true;
                    }
                }
                else {
                    nTotal -= nConnected;
                    nConnected = 0;
                }
            }
        }
        nTotal = nWinTiles;
        for (let x = this.board[0].length - 1; x >= 3; x--) { //NORTHWEST DIAGONAL
            if (nTotal < 4)
                break;
            nConnected = 0;
            for (let y = this.board.length - 1, x2 = x; y >= 0 && x2 >= 0; y--, x2--) {
                if (this.board[y][x2] == winColor) {
                    nConnected++;
                    if (nConnected == 4) {
                        return true;
                    }
                }
                else {
                    nTotal -= nConnected;
                    nConnected = 0;
                }
            }
        }
        for (let y = this.board.length - 2; y >= 3; y--) {
            if (nTotal < 4)
                break;
            nConnected = 0;
            for (let y2 = y, x = this.board[0].length - 1; y2 >= 0 && x >= 0; y2--, x--) {
                if (this.board[y2][x] == winColor) {
                    nConnected++;
                    if (nConnected == 4) {
                        return true;
                    }
                }
                else {
                    nTotal -= nConnected;
                    nConnected = 0;
                }
            }
        }
        return false;
    }
}
exports.Game = Game;
