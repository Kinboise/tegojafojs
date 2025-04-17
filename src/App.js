import { Client } from 'boardgame.io/react';
import { TegoJafo } from './Game';
import { TegoJafoBoard } from './Board';
// import { Local } from 'boardgame.io/multiplayer';
import { SocketIO } from 'boardgame.io/multiplayer';
import { BrowserRouter, Routes, Route, useParams } from "react-router";
import { md5 } from 'js-md5';
import { Debug } from 'boardgame.io/debug';

const TegoJafoRemoteClient = Client({
    game: TegoJafo,
    board: TegoJafoBoard,
    multiplayer: SocketIO({ server: 'http://tegs.guc1010.top:8000' }),
    debug: false,
    // multiplayer: Local({
    //   // Enable localStorage cache.
    //   persist: true,

    //   // Set custom prefix to store data under. Default: 'bgio'.
    //   storageKey: 'bgio',
    // }),
    // multiplayer: Local(),
});
const TegoJafoLocalClient = Client({
    game: TegoJafo,
    board: TegoJafoBoard,
    debug: {
        impl: Debug,
        collapseOnLoad: true,
    },
});

const RouteTegoJafoClient = () => {
    let player = 2;
    const { id, hash } = useParams();
    const blackSalt = '2057101615';
    const blackHash = md5(id + blackSalt).substring(0, 6);
    if (hash === blackHash) {
        player = 0;
    } else {
        const whiteSalt = '2025011516';
        const whiteHash = md5(id + whiteSalt).substring(0, 6);
        if (hash === whiteHash) {
            player = 1;
        }
    }
    return (
        <TegoJafoRemoteClient matchID={id} playerID={player.toString()} />
    )
}

const RouteTegoJafoSpectatorClient = () => {
    const { id } = useParams();
    return (
        <TegoJafoRemoteClient matchID={id} playerID="2"/>
    )
}

const App = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" exact element={<TegoJafoLocalClient />} />
            <Route path="/:id" element={<RouteTegoJafoSpectatorClient />} />
            <Route path="/:id/:hash" element={<RouteTegoJafoClient />} />
        </Routes>
    </BrowserRouter>
)
// const App = () => {
//   return (
//     <div>
//       <TegoJafoClient playerID="0" />
//       <TegoJafoClient playerID="1" />
//     </div>
//   );
// }

export default App;