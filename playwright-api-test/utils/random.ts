interface RandomStringOptions {
  size?: number;
  fixed?: boolean;
  charSets?: string[];
  useSpaces?: boolean;
  illegalChars?: string;
}

/**
 * Generates unique string ID based on the current date with a random component
 */
export function getUniqueId(): string {
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
}

/**
 * Generates a random string based on the specified options
 */
export function getRandomString(opt: RandomStringOptions = {}): string {
  const {
    size = 150,
    fixed = false,
    charSets = ['letters', 'numbers', 'special'],
    useSpaces = true,
    illegalChars = '',
  } = opt;

  const sets: Record<string, string> = {
    letters: 'aàâbcçdeéèêëfghiîïjklmnoôöpqrstuùûüvwxyzAÀÂBCÇDEÉÈÊËFGHIÎÏJKLMNOÔÖPQRSTUÙÛÜVWXYZ',
    numbers: '0123456789',
    special: '!@#$%^&*()_+-=[]{}|;:,.<>?/~`"\'',
  };

  let characters = charSets.reduce((acc, set) => {
    if (sets[set]) {
      return acc + sets[set];
    }
    return acc + set;
  }, '');

  if (illegalChars !== '') {
    const escaped = illegalChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const illegalRegex = new RegExp(`[${escaped}]`, 'g');
    characters = characters.replace(illegalRegex, '');
  }

  if (useSpaces) {
    characters += '  ';
  }

  const finalLength = fixed ? size : Math.floor(Math.random() * size + 1);
  let result = '';

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
 * Generates a random string with only letters of random length (with size as max length)
 */
export function getRndAlphaString(size?: number, useSpaces?: boolean): string {
  return getRandomString({
    size, fixed: false, charSets: ['letters'], useSpaces,
  });
}

/**
 * Generates a random string with only letters of fixed length (size)
 */
export function getRndFixedAlphaString(size: number, useSpaces?: boolean): string {
  return getRandomString({
    size, fixed: true, charSets: ['letters'], useSpaces,
  });
}

/**
 * Generates a random string with letters and numbers of random length (with size as max length)
 */
export function getRndAlphaNumericString(size?: number, useSpaces?: boolean): string {
  return getRandomString({
    size, fixed: false, charSets: ['letters', 'numbers'], useSpaces,
  });
}

/**
 * Generates a random string with letters and numbers of fixed length (size)
 */
export function getRndFixedAlphaNumericString(size: number, useSpaces?: boolean): string {
  return getRandomString({
    size, fixed: true, charSets: ['letters', 'numbers'], useSpaces,
  });
}

/**
 * Get a random element from an array
 */
export function getRandomInArray<T>(elements: T[]): T {
  return elements[Math.floor(Math.random() * elements.length)];
}

/**
 * Generates a random number between min and max (inclusive). Min defaults to 0
 */
export function getRandomNumber(max: number, min: number = 0): number {
  return parseInt(
    (Math.floor(Math.random() * (max - min + 1)) + min).toString(10),
    10,
  );
}

/**
 * Generates a random boolean value (true or false)
 */
export function getRandomBoolean(): boolean {
  return Math.random() < 0.5;
}
