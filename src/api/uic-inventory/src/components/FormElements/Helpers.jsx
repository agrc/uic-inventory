export const camelToProper = (text) => {
  const parts = text.split(/(?=[A-Z])/);
  const firstWord = `${parts[0].charAt(0).toUpperCase()}${parts[0].slice(1)}`;

  if (parts.length === 1) {
    return firstWord;
  }

  const theRest = parts.slice(1).map((x) => x.toLowerCase());

  return `${firstWord} ${theRest.join()}`;
};
