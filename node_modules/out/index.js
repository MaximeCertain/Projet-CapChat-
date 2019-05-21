const formatters = {};
const reFormatHolders = /\{(\d+)(?=\})/g;
const modifiers = require('./modifiers');

let targets = [process.stderr];

const out = (format, ...values) => {
  // if we have no format provided, then return the modifiers
  if (! format) {
    return modifiers;
  }

  // if we haven't already create the formatter do so now
  if (!formatters[format]) {
    formatters[format] = createFormatter(modifiers.replace(format));
  }

  const output = formatters[format](...values);

  // write the output to stdout
  targets.forEach((target) => target.write(output + out.end));

  // return the output so we can test as required
  return output;
};

// define what will be appended to the end of each write statement
out.end = '\n';
out.error = errorOut;
out.to = setTargets;

module.exports = out;

function errorOut() {
  const args = Array.from(arguments).map(function(arg) {
    return (arg instanceof Error) ? arg.message : arg;
  });

  // call out making things red :)
  out(['!{red}' + args.shift()].concat(args));
}

function setTargets(...newTargets) {
  targets = newTargets.filter((writer) => writer && typeof writer.write == 'function');
}

function createFormatter(format) {
  const regexes = [];

  const matches = format.match(reFormatHolders);
  for (let ii = matches ? matches.length : 0; ii--; ) {
    const argIndex = matches[ii].slice(1);
    if (! regexes[argIndex]) {
      regexes[argIndex] = new RegExp(`\\{${argIndex}\\}`, 'g');
    }
  }

  // update the regex count
  const regexCount = regexes.length;
  return (...values) => {
    let output = format;
    for (let ii = 0; ii < regexCount; ii++) {
      const argValue = typeof values[ii] != 'undefined' ? values[ii] : '';
      output = output.replace(regexes[ii], argValue);
    }

    return output;
  };
}
