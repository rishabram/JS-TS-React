const { spawn, fork } = require('child_process');

function runSpawn() {
    const child = spawn('node', ['external-cmd.js']);

    child.stdout.on('data', (data) => {
        console.log(` SPAWN OUTPUT: ${data}`);
    });

    child.stdin.write('Hello Spawn!\n');
    child.stdin.end();
}

function runFork() {
    const child = fork('child-script.js');

    child.on('message', (msg) => {
        console.log(` PARENT RECEIVED: ${msg}`);
        child.disconnect();
    });

    child.send('Hello Fork!');
}

runSpawn();
setTimeout(runFork, 1000);