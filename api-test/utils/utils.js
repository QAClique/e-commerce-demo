function fn() {
  return {
    /**
     * Generates unique string ID based on the current date with a random component
     *
     * @returns {string} - The generated unique ID
     */
    getUniqueId() {
      const now = new Date();
      const year = now.getUTCFullYear();
      const month = (now.getUTCMonth() + 1).toString().padStart(2, '0');
      const day = now.getUTCDate().toString().padStart(2, '0');
      const hours = now.getUTCHours().toString().padStart(2, '0');
      const minutes = now.getUTCMinutes().toString().padStart(2, '0');
      const seconds = now.getUTCSeconds().toString().padStart(2, '0');
      const milliseconds = now.getUTCMilliseconds().toString().padStart(3, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}${random}`;
    },

    /**
     * Generates a random string based on the specified options
     *
     * @param {Object} opt options for the random string
     * @param {number} [opt.size] of the string (default is 150)
     * @param {boolean} [opt.fixed] true uses length as max, random size up to length if false (default)
     * @param {string[]} [opt.charSets] Character sets to use (['letters', 'numbers', 'special'] - all three by default)
     * @param {boolean} [opt.useSpaces] in the string or not (default is false)
     * @param {string} [opt.illegalChars] characters to remove from the allowed set (default is nothing is removed)
     * @returns {string} the random string
     */
    getRandomString(opt = {}) {
      const {
        size = 150,
        fixed = false,
        charSets = ['letters', 'numbers', 'special'],
        useSpaces = true,
        illegalChars = ''
      } = opt;

      const sets = {
        letters: 'aàâbcçdeéèêëfghiîïjklmnoôöpqrstuùûüvwxyzAÀÂBCÇDEÉÈÊËFGHIÎÏJKLMNOÔÖPQRSTUÙÛÜVWXYZ',
        numbers: '0123456789',
        special: '!@#$%^&*()_+-=[]{}|;:,.<>?/~`"\''
      };

      // Combine selected character sets or default to all sets
      let characters = charSets.reduce((acc, set) => {
        if (sets[set]) {
          return acc + sets[set];
        }
        return acc + set;
      }, '');

      // Remove illegal characters from the allowed set using regex
      if (illegalChars !== '') {
        // Escape regex special characters in illegalChars
        const escaped = illegalChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const illegalRegex = new RegExp(`[${escaped}]`, 'g');
        characters = characters.replace(illegalRegex, '');
      }

      // Include spaces if specified - add more of them to increase the odds of getting spaces
      if (useSpaces) {
        characters += '  ';
      }

      const finalLength = fixed ? size : Math.floor(Math.random() * size + 1);
      let result = '';

      // Generate the random string and ensure it meets the fixed length after trimming
      do {
        result = '';
        for (let i = 0; i < finalLength; i += 1) {
          result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        result = result.trim();
      } while (fixed && result.length < size);

      return result;
    },

    /**
     * Generates a random string with only letters of random length (with size as max length)
     *
     * @param {number} size max size of the string
     * @param {boolean} useSpaces whether to use spaces in the string or not
     * @returns {string} the random string
     */
    getRndAlphaString(size, useSpaces) {
      return this.getRandomString({ size, fixed: false, charSets: ['letters'], useSpaces });
    },

    /**
     * Generates a random string with only letters of fixed length (size)
     *
     * @param {number} size of the string
     * @param {boolean} useSpaces whether to use spaces in the string or not
     * @returns the random string
     */
    getRndFixedAlphaString(size, useSpaces) {
      return this.getRandomString({ size, fixed: true, charSets:['letters'], useSpaces });
    },

    /**
     * Generates a random string with letters and numbers of random length (with size as max length)
     *
     * @param {number} size max size of the string
     * @param {boolean} useSpaces whether to use spaces in the string or not
     * @returns {string} the random string
     */
    getRndAlphaNumericString(size, useSpaces) {
      return this.getRandomString({ size, fixed: false, charSets:['letters', 'numbers'], useSpaces });
    },

    /**
     * Generates a random string with with letters and numbers of fixed length (size)
     *
     * @param {number} size of the string
     * @param {boolean} useSpaces whether to use spaces in the string or not
     * @returns the random string
     */
    getRndFixedAlphaNumericString(size, useSpaces) {
      return this.getRandomString({ size, fixed: true, charSets:['letters', 'numbers'], useSpaces });
    },

    /**
     * Get a random element from an array
     *
     * @param {Array} elements to pick randomly from
     * @returns {*} a random element from the array
     */
    getRandomInArray(elements) {
      return elements[Math.floor(Math.random() * elements.length)];
    },

    /**
     * Generates a random number between min and max (inclusive). Min is defaulted to 0
     *
     * @param {number} max value (inclusive)
     * @param {number} min value (inclusive, default is 0)
     * @returns {number} a random number between min and max (inclusive)
     */
    getRandomNumber(max, min = 0) {
      return parseInt((Math.floor(Math.random() * (max - min + 1)) + min).toString(10), 10);
    },

    /**
     * Generates a random boolean value (true or false)
     *
     * @returns {boolean} a random boolean value
     */
    getRandomBoolean() {
      return Math.random() < 0.5;
    },
  };
}
