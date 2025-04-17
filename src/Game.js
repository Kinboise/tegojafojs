import { INVALID_MOVE } from 'boardgame.io/core';

const cols = ['a', 'b', 'c', 'd', 'e', 'f'];
const rows = ['1', '2', '3', '4', '5', '6'];
const dirs = [[-1, 0], [0, -1], [0, 1], [1, 0]];

export const TegoJafo = {
    name: 'tegojafo',
    setup: () => ({
        hands: { 0: 11, 1: 11 },
        cells: [[2, 1, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 1, 3]],
        selected: false,
        validMoves: [[2, 0], [0, 2]],
        suicidePlaces: [],
        suicideMoves: [],
        history: [],
        resigned: null,
    }),
    turn: {
        minMoves: 1,
        // onEnd: (G, ctx) => {
        //     console.log(ctx);
        //     let opponent = (ctx.currentPlayer + 1) % 2;
        //     G.validMoves = GetValidMoves(G, opponent);
        // }
    },
    moves: {
        resign: ({ G, playerID, events }) => {
            G.history.push('/')
            G.resigned = playerID;
            events.endTurn();
        },
        placeJafo: ({ G, events, playerID }, pos) => {
            let player = parseInt(playerID);
            if (G.hands[player] === 0 || G.selected) {
                G.selected = false;
            } else {
                G.validMoves = GetValidMoves(G.cells, playerID);
                G.suicidePlaces = GetSuicidePlaces(G.cells, playerID);
                for (let k in G.suicidePlaces) {
                    if (G.suicidePlaces[k].join(',') === pos.join(',')) {
                        return INVALID_MOVE;
                    }
                }
                G.cells[pos[0]][pos[1]] = 1;
                G.hands[player]--;
                // let opponent = (player + 1) % 2;
                // G.validMoves = GetValidMoves(G, opponent);
                G.history.push(`+${ToId(pos)}`);
                events.endTurn();
            }
        },
        movePiece: ({ G, playerID }) => {
            G.validMoves = GetValidMoves(G.cells, playerID);
            G.suicidePlaces = GetSuicidePlaces(G.cells, playerID);
            G.suicideMoves = GetSuicideMoves(G.validMoves, G.cells, playerID);
            G.selected = G.selected ? false : true;
            return;
        },
        moveHere: ({ G, events, playerID }, id) => {
            let player = parseInt(playerID);
            let origin = FindPiece(G.cells, player + 2);
            G.cells[origin[0]][origin[1]] = 0;
            if (G.cells[id[0]][id[1]] === 1) {
                G.hands[player]++;
                // let opponent = (player + 1) % 2;
                // G.validMoves = GetValidMoves(G, opponent);
                G.history.push(`=${ToId(id)}`);
            } else if (G.cells[id[0]][id[1]] === 0) {
                G.history.push(`-${ToId(id)}`);
            } else {
                G.history.push(`≠${ToId(id)}`);
            }
            G.cells[id[0]][id[1]] = player + 2;
            G.selected = false;
            events.endTurn();
        },
    },

    endIf: ({ G, ctx }) => {
        let opponent = (parseInt(ctx.currentPlayer) + 1) % 2
        // if (IsCheckMated(G, opponent)) {
        // return { winner: ctx.currentPlayer };
        // }
        if (G.resigned === opponent.toString()) {
            return { winner: ctx.currentPlayer };
        }
        if (IsDraw(G, ctx.currentPlayer)) {
            return { draw: true };
        }
    },

    ai: {
        enumerate: (G, ctx) => {
            let moves = [{move: 'resign', args: []}];
            let suicidePlaces = GetSuicidePlaces(G.cells, ctx.currentPlayer)
            if (G.hands[ctx.currentPlayer] > 0) {
                for (let i in G.cells) {
                    for (let j in G.cells[i]) {
                        if (G.cells[i][j] === 0) {
                            let safe = true
                            for (let k of suicidePlaces) {
                                if (k.join(',') === `${i},${j}`) {
                                    safe = false
                                    break;
                                }
                            }
                            if (safe) {
                                moves.push({ move: 'placeJafo', args: [[i, j]] });
                            }
                        }
                    }
                }
            }
            let validMoves = GetValidMoves(G.cells, ctx.currentPlayer)
            let suicideMoves = GetSuicideMoves(validMoves, G.cells, ctx.currentPlayer)
            for (let move of validMoves) {
                let safe = true;
                for (let k of suicideMoves) {
                    if (k.join(',') === move.join(',')) {
                        safe = false
                        break;
                    }
                }
                if (safe) {
                    moves.push({ move: 'moveHere', args: [move] })
                }
            }
            return moves;
        },
    }
};

function ToId(coordinate) {
    if (coordinate[0] < 0 || coordinate[0] > 5 || coordinate[1] < 0 || coordinate[1] > 5) {
        return null;
    } else {
        return `${cols[coordinate[1]]}${rows[coordinate[0]]}`;
    }
}

function FindPiece(cells, piece) {
    for (let i in cells) {
        for (let j in cells[i]) {
            if (cells[i][j] === piece) {
                return [parseInt(i), parseInt(j)];
            }
        }
    }
    return null;
}

function GetPiece(cells, pos) {
    if (pos[0] < 0 || pos[0] > 5 || pos[1] < 0 || pos[1] > 5) {
        return null;
    }
    return cells[pos[0]][pos[1]];
}
function IsCheckMated(G, player) {
    let emptyCells = (G.hands[player] === 0) ? GetEmptyCells(G.cells) : []
    let suicidePlaces = (G.hands[player] === 0) ? GetSuicidePlaces(G.cells, player) : []
    const validMoves = GetValidMoves(G.cells, player)
    if (validMoves.length === GetSuicideMoves(validMoves, G.cells, player).length && emptyCells.length === suicidePlaces.length) {
        return true;
    }
    return false;
}

function IsVictory(cells, player) {
    let temp = {
        '0': [2, 3, 5, 5],
        '1': [3, 2, 0, 0],
    }
    // 主子在对方基地
    if (cells[temp[player][2]][temp[player][3]] === temp[player][0]) {
        return true;
    }
    let pos = FindPiece(cells, temp[player][1]);
    if (pos !== null) {
        // 对方主子四周无辅子
        let hasJafo = false;
        for (let i in dirs) {
            let d = dirs[i];
            let p = Move(pos, d);
            if (GetPiece(cells, p) === 1) {
                hasJafo = true;
            }
        }
        if (!hasJafo) {
            return true;
        }
    } else {
        // 对方主子被吃
        return true;
    }
    return false;
}

// Return true if all `cells` are occupied.
function IsDraw(G, player) {
    if (G.hands[parseInt(player)] === 0 && G.validMoves.length === 0) {
        return true;
    }
    return false;
}

function Move(p, d) {
    return [p[0] + d[0], p[1] + d[1]];
}

function Rev(d) {
    return [d[0] * -1, d[1] * -1];
}

function FindFrom(cells, route, dests) {
    // 路线的当前终点
    let p0 = route.at(-1);
    // 最后一次移动的方向
    let d0 = Move(p0, Rev(route.at(-2)));
    for (let i in dirs) {
        let d = dirs[i];
        // 尝试往一个方向移动
        let p = Move(p0, d);
        // 移动方向不是上次的反方向（不回头）且移动后仍在盘上
        if (d.join(',') !== Rev(d0).join(',') && GetPiece(cells, p) !== null) {
            // 移动方向与上一步相同，则添加终点
            if (d.join(',') === d0.join(',')) {
                dests.push(p)
            }
            // 检查下一个点是否已经在路线中，避免重复
            let notInRoute = true;
            for (let j in route) {
                if (p.join(',') === route.at(j).join(',')) {
                    notInRoute = false;
                }
            }
            // 是辅子，则添加到路线，递归查找
            if (cells[p[0]][p[1]] === 1 && notInRoute) {
                FindFrom(cells, [...route, p], dests)
            }
        }
    }
}

function GetValidMoves(cells, player) {
    let start = null
    start = FindPiece(cells, parseInt(player) + 2)
    let dests = []
    for (let i in dirs) {
        let d0 = dirs[i];
        let p = Move(start, d0);
        if (p !== null) {
            let route = [start, p]
            if (GetPiece(cells, p) === 1) {
                FindFrom(cells, route, dests)
            }
        }
    }
    return dests
}

function GetEmptyCells(cells) {
    let emptyCells = [];
    for (let i in cells) {
        for (let j in cells[i]) {
            if (cells[i][j] === 0) {
                emptyCells.push([i, j]);
            }
        }
    }
    return emptyCells;
}

function GetSuicidePlaces(cells, player) {
    let suicidePlaces = []
    let opponent = (parseInt(player) + 1) % 2
    let emptyCells = GetEmptyCells(cells);
    for (let i in emptyCells) {
        let cell = emptyCells[i];
        let newCells = JSON.parse(JSON.stringify(cells));
        newCells[cell[0]][cell[1]] = 1;
        let origin = FindPiece(newCells, opponent + 2)
        let nextMoves = GetValidMoves(newCells, opponent)
        for (let j in nextMoves) {
            let nextCell = nextMoves[j];
            let nextCells = JSON.parse(JSON.stringify(newCells));
            nextCells[origin[0]][origin[1]] = 0;
            nextCells[nextCell[0]][nextCell[1]] = opponent + 2;
            if (IsVictory(nextCells, opponent)) {
                suicidePlaces.push(cell);
                break;
            }
        }
    }
    return suicidePlaces;
}

function GetSuicideMoves(moves, cells, player) {
    if (moves.length === 0) {
        return [];
    }
    let suicideMoves = [];
    let self = parseInt(player);
    let origin = FindPiece(cells, self + 2)
    let opponent = (parseInt(player) + 1) % 2;
    let opponentOrigin = FindPiece(cells, opponent + 2)
    for (let cell of moves) {
        if (cell.join(',') !== opponentOrigin.join(',')) {
            let newCells = JSON.parse(JSON.stringify(cells));
            newCells[origin[0]][origin[1]] = 0;
            newCells[cell[0]][cell[1]] = self + 2;
            let nextMoves = GetValidMoves(newCells, opponent)
            for (let j in nextMoves) {
                let nextCell = nextMoves[j];
                let nextCells = JSON.parse(JSON.stringify(newCells));
                nextCells[nextCell[0]][nextCell[1]] = opponent + 2;
                if (IsVictory(nextCells, opponent)) {
                    suicideMoves.push(cell);
                    break;
                }
            }
        }
    }
    return suicideMoves;
}
