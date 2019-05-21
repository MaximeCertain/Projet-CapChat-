const reModifier = /\!\{(.*?)\}(.*?)(?=(\!\{|$))/m;
const registry = {
  'test':       ['<', '>'],
  'bold'      : ['\0\x1B[1m',  '\0\x1B[22m'],
  'italic'    : ['\0\x1B[3m',  '\0\x1B[23m'],
  'underline' : ['\0\x1B[4m',  '\0\x1B[24m'],
  'blink'     : ['\0\x1B[5m',  '\0\x1B[25m'],
  'inverse'   : ['\0\x1B[7m',  '\0\x1B[27m'],
  'white'     : ['\0\x1B[37m', '\0\x1B[39m'],
  'grey'      : ['\0\x1B[90m', '\0\x1B[39m'],
  'black'     : ['\0\x1B[30m', '\0\x1B[39m'],
  'blue'      : ['\0\x1B[34m', '\0\x1B[39m'],
  'cyan'      : ['\0\x1B[36m', '\0\x1B[39m'],
  'green'     : ['\0\x1B[32m', '\0\x1B[39m'],
  'magenta'   : ['\0\x1B[35m', '\0\x1B[39m'],
  'red'       : ['\0\x1B[31m', '\0\x1B[39m'],
  'yellow'    : ['\0\x1B[33m', '\0\x1B[39m']
};

const symbols = {
  'tick'      : [0x2713],
  'check'     : [0x2713]
};

// create the unicode strings
Object.keys(symbols).forEach(function(key) {
  symbols[key] = String.fromCharCode.apply(null, symbols[key]);
});

const addModifier = (modifier, replacement) => {
  registry[modifier] = replacement;
};

const replace = (input) => {
  let text = input;
  let match = reModifier.exec(text);

  while (match) {
    const modifiedText = match[1].split('|').reduce(applyModifier, match[2]);
    text = `${text.slice(0, match.index)}${modifiedText}${text.slice(match.index + match[0].length)}`;
    match = reModifier.exec(text);
  } // while

  return text;
};

function applyModifier(input, key) {
  const symbol = symbols[key];
  const modifier = registry[key];
  const modifierType = typeof modifier;

  if (modifierType == 'object' && modifier.length) {
    return `${modifier[0] || ''}${input}${modifier[1] || ''}`;
  }

  if (modifierType == 'function') {
    return modifier(input, key);
  }

  if (symbol) {
    return `${symbol}${input}`;
  }

  if (modifier) {
    return `${modifier}${input}`;
  }

  const keyValue = parseInt(key, 16);
  if (!isNaN(keyValue)) {
    return `${String.fromCharCode(keyValue)}${input}`;
  }

  return input;
}

module.exports = {
  addModifier, replace
};
