process.on('message', (msg) => {
    console.log(` CHILD RECEIVED: ${msg}`);

    const result = msg.toUpperCase() + ' PROCESSED!';

    process.send(result);
});