import Robot from '../../lib/robot';
import async from 'async';
import redis from 'redis';
import mysql from 'mysql';
import chai from 'chai';

chai.use(require('chai-subset'));

const cRedis = redis.createClient();
const cMysql = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'beam',
});

export function setGamerKey(id, key, game, callback) {
    cRedis.set('tetrisd:gamekey:' + id + ':' + key, game, callback);
}

export function setPlayerKey(id, key, influence, callback) {
    cRedis.hmset('tetrisd:playkey:' + id + ':' + key,
        'influence', influence,
        callback
    );
}

export function setGame(id, controls, callback) {
    cMysql.query('delete from tetris_games where id = ?', id, function (err) {
        if (err) return callback(err);

        cMysql.query(
            'insert into tetris_games (id, controls) values (?, ?)',
            [id, JSON.stringify(controls)], callback
        );
    });
}

/**
 * Creates a new robot connection on tetrisd with an ID of 42.
 * @param  {Function} callback
 */
export function connectRobot(callback) {
    async.parallel([
        async.apply(setGamerKey, 42, 'asdf', 3),
        async.apply(setGame, 3, { reportInterval: 100 }),
    ], (err) => {
        if (err) return callback(err);

        const robot = new Robot('127.0.0.1:3442', 42, 'asdf');
        robot.handshake((err) => callback(err, robot));
    });
}