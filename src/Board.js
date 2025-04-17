import React from 'react';
import './Board.css';

export function TegoJafoBoard({ ctx, G, moves }) {
    const placeJafo = (pos) => moves.placeJafo(pos);
    const movePiece = () => moves.movePiece();
    const moveHere = (pos) => moves.moveHere(pos);
    const resign = () => moves.resign();

    let turn = `第${ctx.turn}手`;
    let winner = '';
    if (ctx.gameover) {
        winner =
            ctx.gameover.winner !== undefined ? (
                <span>{ctx.currentPlayer === '0' ? '黑棋' : '白棋'}获胜</span>
            ) : (
                <span>平局</span>
            );
    } else {
        winner = <span>{ctx.currentPlayer === '0' ? '黑棋' : '白棋'}走棋</span>;
    }

    const cellStyle = {
        0: {
            border: '1px solid #888',
            width: '50px',
            height: '50px',
            lineHeight: '50px',
            textAlign: 'center',
            cursor: 'pointer',
        },
        1: {
            border: '1px solid #888',
            width: '50px',
            height: '50px',
            lineHeight: '50px',
            textAlign: 'center',
            backgroundColor: '#888',
            boxShadow: '1px 1px 1px #888',
            cursor: 'pointer',
        },
        2: {
            border: '1px solid #000',
            width: '50px',
            height: '50px',
            lineHeight: '50px',
            textAlign: 'center',
            borderRadius: '50%',
            backgroundColor: '#000',
            color: '#fff',
            fontFamily: 'monospace',
            boxShadow: '1px 1px 1px #888',
            cursor: 'pointer',
        },
        3: {
            border: '1px solid #000',
            width: '50px',
            height: '50px',
            lineHeight: '50px',
            textAlign: 'center',
            borderRadius: '50%',
            backgroundColor: '#fff',
            color: '#000',
            fontFamily: 'monospace',
            boxShadow: '1px 1px 1px #888',
            cursor: 'pointer',
        },
    };

    let tbody = [];
    const cols = ['a', 'b', 'c', 'd', 'e', 'f'];
    const rows = ['1', '2', '3', '4', '5', '6'];
    // const display = {
    //     0: '',
    //     1: '',
    //     2: '⚫',
    //     3: '⚪'
    // };
    for (let i = 0; i < 6; i++) {
        let cells = [];
        for (let j = 0; j < 6; j++) {
            let pos = [i, j];
            let piece = G.cells[i][j];
            let valid = 0;
            for (let k in G.validMoves) {
                if (G.validMoves[k].join(',') === pos.join(',')) {
                    valid = 1;
                    break;
                }
            }
            if (valid === 1) {
                for (let k in G.suicideMoves) {
                    if (G.suicideMoves[k].join(',') === pos.join(',')) {
                        valid = 2;
                        break;
                    }
                }
            }
            // let canPlace = true;
            // for (let k in G.suicidePlaces) {
            //     if (G.suicidePlaces[k].join(',') === pos.join(',')) {
            //         canPlace = false;
            //         break;
            //     }
            // }
            if (piece === 0) {
                if (G.selected && valid === 1) {
                    cells.push(
                        <td row={i} col={j}>
                            <div style={cellStyle[0]} onClick={() => moveHere(pos)}>◉</div>
                        </td>
                    );
                } else if (G.selected && valid === 2) {
                    cells.push(
                        <td row={i} col={j}>
                            <div style={cellStyle[0]}>✕</div>
                        </td>
                    );
                } else {
                    cells.push(
                        <td row={i} col={j}>
                            <div style={cellStyle[0]} onClick={() => placeJafo(pos)} />
                        </td>
                    );
                }
            } else if (piece === 1) {
                if (G.selected && valid === 1) {
                    cells.push(
                        <td row={i} col={j}>
                            <div style={cellStyle[1]} onClick={() => moveHere(pos)}>◉</div>
                        </td>
                    );
                } else if (G.selected && valid === 2) {
                    cells.push(
                        <td row={i} col={j}>
                            <div style={cellStyle[1]}>✕</div>
                        </td>
                    );
                } else {
                    cells.push(
                        <td row={i} col={j}>
                            <div style={cellStyle[1]}></div>
                        </td>
                    );
                }
            } else {
                let player = parseInt(ctx.currentPlayer);
                let opponent = (player + 1) % 2;
                if (piece === player + 2) {
                    cells.push(
                        <td row={i} col={j}>
                            <div style={cellStyle[player + 2]} onClick={() => movePiece(pos)}></div>
                        </td>
                    );
                } else {
                    if (G.selected && valid) {
                        cells.push(
                            <td row={i} col={j}>
                                <div style={cellStyle[opponent + 2]} onClick={() => moveHere(pos)}>◉</div>
                            </td>
                        );
                    } else {
                        cells.push(
                            <td row={i} col={j}>
                                <div style={cellStyle[opponent + 2]}></div>
                            </td>
                        );
                    }
                }
            }
        }
        tbody.push(<tr key={i}><th>{rows[i]}</th>{cells}<th>{rows[i]}</th></tr>);
    }
    let last = ctx.turn === 1 ? '对局开始' : `${G.history.length}${G.history.at(-1)}`;
    const History = () => {
        // const lines = G.history.map((line, index) => {
            // return (<span key={index}>
            //     {parseInt(index)+1}{line}<br />
            // </span>)
        // });
        let lines = ''
        for (let i in G.history) {
            lines += `${parseInt(i)+1}${G.history[i]}\n`
        }
        return <div id="history"><h2 style={{paddingLeft: '1em'}}>棋谱</h2><div id="history-box"><textarea readOnly id="hist-lines" value={lines}></textarea><button onClick={() => {navigator.clipboard.writeText(document.getElementById("hist-lines").value);}}>复制</button></div></div>
    }
    return (
        <div id="board-box" style={{ margin: '5%' }}>
            <div id="main">
                <div>
                    <h1>主辅棋</h1>
                    <a href='https://k.guc1010.top/tegojafo'>返回主页</a>&emsp;
                    <a href='https://newchessbar.fandom.com/zh/wiki/%E4%B8%BB%E8%BE%85%E6%A3%8B' target='_blank'>查看规则</a>
                </div>
                <table id="board">
                    <thead>
                        <tr>
                        <td style={{textAlign: 'center', width: '30px', height: '30px', border: '1px solid #000', backgroundColor: '#000', color: '#fff', boxShadow: '1px 1px 1px #888'}}>{G.hands[0]}</td>
                            <th>a</th>
                            <th>b</th>
                            <th>c</th>
                            <th>d</th>
                            <th>e</th>
                            <th>f</th>
                            <td></td>
                        </tr>
                    </thead>
                    <tbody>{tbody}</tbody>
                    <thead>
                        <tr>
                            <td></td>
                            <th>a</th>
                            <th>b</th>
                            <th>c</th>
                            <th>d</th>
                            <th>e</th>
                            <th>f</th>
                            <td style={{textAlign: 'center', width: '30px', height: '30px', border: '1px solid #000', backgroundColor: '#fff', color: '#000', boxShadow: '1px 1px 1px #888'}}>{G.hands[1]}</td>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <td></td>
                            {/* <td style={{textAlign: 'center'}} colSpan="2">{last}</td> */}
                            <td style={{textAlign: 'center'}} colSpan="2">
                                <button onClick={() => resign()}>投降</button>
                            </td>
                            <td style={{textAlign: 'center', fontWeight: 'bold'}} colSpan="2">{turn}</td>
                            <td style={{textAlign: 'center'}} colSpan="2">{winner}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <History />
        </div>
    );
}