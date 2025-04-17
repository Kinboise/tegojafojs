const { Server, Origins } = require('boardgame.io/server');
const { TegoJafo } = require('./Game');
// import { Server, Origins } from 'boardgame.io/server';
// import { TegoJafo } from './Game';

const server = Server({
  games: [TegoJafo],
  origins: [Origins.LOCALHOST],
});

server.run(2057);