/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./app.html",
    "./src/**/*.{vue,js,ts,jsx,tsx,svelte}",
    ],
  theme: {
    extend: {
      colors: {
        blue: {50:'#fff5ea',100:'#ffe9d2',200:'#ffd2a5',300:'#ffb773',400:'#ff9d47',500:'#FF871D',600:'#d9690c',700:'#a84d08',800:'#713506',900:'#3e200b',950:'#160c05'},
        slate: {50:'#fafafa',100:'#eeeeee',200:'#dddddd',300:'#cccccc',400:'#aaaaaa',500:'#777777',600:'#444444',700:'#2b2b2b',800:'#1b1b1b',900:'#101010',950:'#060606'},
        gray: {50:'#fafafa',100:'#eeeeee',200:'#dddddd',300:'#cccccc',400:'#aaaaaa',500:'#777777',600:'#444444',700:'#2b2b2b',800:'#1b1b1b',900:'#101010',950:'#060606'}
      }
    },
  },
  plugins: [],
}
