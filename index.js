#!/usr/bin/env node

const { Client } = require('tplink-smarthome-api');
const hosts = {
    light: '192.168.1.6',
    tv: '192.168.1.29',
}
const actions = {
    power: {
        run: (device, status) => device.setPowerState(status === 'true' || status === 'on'),
        about: 'Sets the power state of any device.',
    },
    brightness: {
        about: 'Sets the brightness of any light device.',
        run: (device, status) => device.lighting.setLightState({
                brightness: parseFloat(status),
        }),
    }
}

const checkShortHand = (status) => {
    return status === 'on' || status === 'off';
}

let [ a, b, host, action, status ] = process.argv;

if (host === '--help') {

    const actionList = Object.keys(actions)
                        .map(action => `        ${action}: ${actions[action].about}`).join('\n');

    console.log(`
        Format: <common host name> <action> <action state>

        Commands:\n
        --hosts: gets hosts
        --help: opens up help

        Actions:
${actionList}
`);

    return;
}

if (host === '--hosts') {
    Object.keys(hosts).forEach((value) => {
        console.log(value);
    }) ;
    return;
}

if (!action || !actions[action]) {
    if (!checkShortHand(action)) {
        return console.log('Invalid or no utility provided');
    }

    status = action;
    action = 'power';
}



if (!host || !hosts[host]) {
    return console.log('Invalid or no host provided');
}


// perform services
const client = new Client();

client.getDevice({ host: hosts[host] }).then((device) => {
    actions[action]
        .run(device, status)
        .catch(({ response: { err_msg }}) => {
            console.log(err_msg);
        })
}).catch(e => {
    console.log(e);
});
