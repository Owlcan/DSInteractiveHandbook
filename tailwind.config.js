/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './cellardungeon.html',
    './*.html',
    './src/**/*.html'
  ],
  // Classes used only from JS (worldmap dev/tools) must be safelisted
  // so Tailwind doesn't purge them from styles/tailwind.css.
  safelist: [
    'text-emerald-500',
    'text-sky-500',
    'text-amber-500',
    'text-fuchsia-500',
    'text-lime-500',
    'text-rose-500',
    'text-violet-500',
    'text-orange-500',
    'text-teal-500',
    'text-cyan-500',
    'text-blue-500',
    'text-indigo-500',
    'text-purple-500',
    'text-pink-500',
    'text-red-500',
    'text-yellow-500',
    'text-slate-500',
  ],
  theme: {
    extend: {}
  },
  plugins: []
};
