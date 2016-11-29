export default function log(...s: String[]) {
    const now = '[' + new Date().toISOString().replace('T', ' ').slice(0,23) + ']';
    console.log(now, ...s);
}
