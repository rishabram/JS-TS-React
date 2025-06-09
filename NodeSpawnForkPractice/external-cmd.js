process.stdin.on('data', (data) => {
    const input = data.toString().trim();
    console.log(` EXTERNAL PROCESS RECEIVED: ${input}`);

    const output = `Processed: ${input.split('').reverse().join('')}`;
    process.stdout.write(output);
});