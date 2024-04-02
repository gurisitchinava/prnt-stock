/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  './frontend/*.html',
  "./node_modules/flowbite/**/*.js"
  ],

  theme: {
    extend: {
      colors: {
        primary: '#ff0000', // Example custom color
      },
    },
  },

  plugins: [
   require('flowbite/plugin')
  ],

}

