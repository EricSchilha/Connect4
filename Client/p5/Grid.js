var TileState;
(function (TileState) {
    TileState[TileState["Blue"] = 0] = "Blue";
    TileState[TileState["Red"] = 1] = "Red";
    TileState[TileState["Empty"] = 2] = "Empty";
})(TileState || (TileState = {}));
class Grid {
    constructor(nWidth, nHeight, socket) {
        this.nRedTiles = 0;
        this.nBlueTiles = 0;
        this.nRedWins = 0;
        this.nBlueWins = 0;
        this.isTurn = false;
        this.isWinner = false;
        this.nWidth = nWidth;
        this.nHeight = nHeight;
        this.socket = socket;
        this.socket.on("changeTurn", this.onChangeTurn.bind(this));
        this.socket.on("setColor", this.onSetColor.bind(this));
        this.socket.on("WIN", this.onWin.bind(this));
        this.socket.on("LOSE", this.onLose.bind(this));
        this.socket.on("reset", this.onReset.bind(this));
        this.init();
    }
    init() {
        // console.log("INIT");
        this.isTurn = false;
        this.isWinner = false;
        this.gameOver = false;
        this.isPressed = false;
        this.nRedTiles = 0;
        this.nBlueTiles = 0;
        this.board = [];
        for (let i = 0; i < this.nHeight; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.nWidth; j++) {
                this.board[i][j] = TileState.Empty;
            }
        }
    }
    onChangeTurn(data) {
        this.isTurn = data.turn;
        if (data.turn) {
            for (let i = this.board.length - 1; i >= 0; i--) {
                if (this.board[i][data.move] == TileState.Empty) {
                    this.board[i][data.move] = (this.myColor == TileState.Red) ? TileState.Blue : TileState.Red;
                    break;
                }
            }
        }
        console.log(`My Turn: ${data.turn}`);
    }
    onLose(data) {
        this.gameOver = true;
        this.nBlueWins++;
        this.isWinner = false;
        console.log(`I lost`);
    }
    onWin(data) {
        this.gameOver = true;
        this.nRedWins++;
        this.isWinner = true;
        console.log(`I won`);
    }
    onReset(data) {
        this.init();
    }
    onSetColor(data) {
        if (data.color == 0)
            this.myColor = TileState.Red;
        else
            this.myColor = TileState.Blue;
    }
    run(p) {
        // console.log("RUN");
        this.draw(p);
        if (this.gameOver) {
            if (p.keyIsPressed && (p.key == 'r' || p.key == 'R'))
                this.socket.emit("requestReset");
            return;
        }
        this.update(p);
    }
    update(p) {
        // console.log("UPDATE");
        if (p.mouseIsPressed && !this.isPressed) {
            if (this.isTurn) {
                this.isPressed = true;
                try {
                    if (p.mouseY < p.height - 100) {
                        let nColumn = Math.floor(p.mouseX / nTileSize);
                        for (let i = this.board.length - 1; i >= 0; i--) {
                            if (this.board[i][nColumn] == TileState.Empty) {
                                this.board[i][nColumn] = this.myColor;
                                this.socket.emit("sendMove", {
                                    move: nColumn
                                });
                                break;
                            }
                        }
                    }
                }
                catch (e) {
                }
            }
            else {
                console.log("Not my turn.");
            }
        }
        else if (!p.mouseIsPressed) {
            this.isPressed = false;
        }
    }
    draw(p) {
        // console.log("DRAW");
        p.background("#ffffff");
        for (let y = 0; y < this.board.length; y++) {
            for (let x = 0; x < this.board[y].length; x++) {
                p.fill("#CCCCCC");
                p.rect(x * nTileSize, y * nTileSize, nTileSize, nTileSize);
                switch (this.board[y][x]) {
                    case TileState.Blue:
                        p.fill("#1c54f5");
                        break;
                    case TileState.Red:
                        p.fill("#f0261f");
                        break;
                    case TileState.Empty:
                        p.fill("#ffffff");
                        break;
                }
                p.ellipse(x * nTileSize + nTileSize / 2, y * nTileSize + nTileSize / 2, nTileSize * 7 / 8, nTileSize * 7 / 8);
            }
        }
        p.textSize(p.width / 8);
        p.fill("#FF0000");
        p.text("RED:" + this.nRedWins, p.width * 1 / 4, p.height - 100 / 2 - 10);
        p.fill("#0000FF");
        p.text("BLUE:" + this.nBlueWins, p.width * 3 / 4, p.height - 100 / 2 - 10);
        if (this.gameOver) {
            p.textSize(p.width / 8);
            if (this.isWinner) {
                p.fill("#FF0000");
                p.text("RED WINS", p.width / 2, p.height / 2 - 100 / 2);
            }
            else {
                p.fill("#0000FF");
                p.text("BLUE WINS", p.width / 2, p.height / 2 - 100 / 2);
            }
            p.textSize(p.width / 16);
            p.text("Press 'R' to Restart", p.width / 2, p.height / 2 + p.height / 10 - 100 / 2);
        }
    }
}
