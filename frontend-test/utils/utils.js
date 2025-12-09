class Utils {

  /**
   * Generates a random string based on the specified options
   *
   * @param {object} opt Options for the random string
   * @param {number} [opt.size] Of the string (default is 150)
   * @param {boolean} [opt.fixed] "true" uses length as max, random size up to length if false (default)
   * @param {string[]} [opt.charSets] Character sets to use (['letters', 'numbers', 'special'] - all of them by default)
   * @param {boolean} [opt.useSpaces] In the string or not (default is false)
   * @param {string} [opt.illegalChars] Characters to remove from the allowed set (default is nothing is removed)
   * @returns {string} The random string
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
  }

  /**
   * Generates a random number between min and max (inclusive). Min is defaulted to 0
   *
   * @param {number} max value (inclusive)
   * @param {number} min value (inclusive, default is 0)
   * @returns {number} a random number between min and max (inclusive)
   */
  getRandomNumber(max, min = 0) {
    return parseInt((Math.floor(Math.random() * (max - min + 1)) + min).toString(10), 10);
  }
}

export default new Utils();
