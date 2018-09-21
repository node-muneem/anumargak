'use strict';

var stars = '\x1B[1m***\x1B[0m';
var yellow = "\033[1;33m";
var light_green = "\033[1;32m";
var light_blue = "\033[1;34m";
var NC="\033[0m"; // No Color

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

process.exit(0);