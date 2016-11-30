const debugging = (process.argv[2] === 'debug');

export function log(...s: any[]) {
    const now = '[' + new Date().toISOString().replace('T', ' ').slice(0,23) + ']';
    console.log(now, ...s);
}

export function debug(...s: any[]) {
    if (debugging) {
        const now = '[' + new Date().toISOString().replace('T', ' ').slice(0, 23) + ']';
        console.log(now, '(debug)', ...s);
    }
}