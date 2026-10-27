/** "Good morning, Alex ☀️" before midday, afternoon until 5pm, then evening. */
export function getGreeting(name: string, now: Date = new Date()): string {
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const emoji = hour < 12 ? '☀️' : hour < 17 ? '🌤️' : '🌙';
  const firstName = name.trim().split(/\s+/)[0];
  return firstName ? `${greeting}, ${firstName} ${emoji}` : `${greeting} ${emoji}`;
}
