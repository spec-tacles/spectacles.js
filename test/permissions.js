const { Permissions } = require('../dist');
const p = new Permissions();

const guild = require('./guild');
const member = require('./member');
const channel = require('./channel');

p.apply({ guild, channel, member });
console.log(p.serialize());
