// Runs once in the main Jest process, before the test workers start, so they inherit it. Setting
// process.env.TZ inside a test file doesn't work: each file gets its own copy of process.env.
// Sydney time matches the app's users and the team's machines, and it has daylight saving, which
// schedule.dst.test.ts needs. Without this, CI runs in UTC.
module.exports = async () => {
  process.env.TZ = 'Australia/Sydney';
};
