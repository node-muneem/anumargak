//Display message after instalation


const stars = '\x1B[1m***\x1B[0m';
const yellow = "\033[1;33m";
const light_green = "\033[1;32m";
const light_blue = "\033[1;34m";
const NC="\033[0m"; // No Color

console.log(yellow+"              Donating to an open source project is more affordable than paying salary"+NC);

console.log('');
console.log('                         ' + stars + ' Thank you for using Anumargak (अनुमार्गक)! ' + stars);
console.log('');
console.log('                    Please consider donating to help us maintain this package');
console.log('');
console.log( light_blue + '                          https://www.patreon.com/bePatron?u=9531404' + NC);
console.log('                                             or');
console.log( light_blue + '          https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=KQJAX48SPUKNC' + NC);
console.log('');
console.log('                                            ' + stars);

console.log('');
console.log('');

console.log('Try' + light_green +' Nimn (निम्न)' + NC + ' format. It can save bandwidth and reduce response size.');
console.log('');
console.log('Give us a \x1B[1m*\x1B[0m on '+ light_blue + 'https://github.com/NaturalIntelligence/rasta'+ NC +' and help us to grow');
console.log('');
process.exit(0);