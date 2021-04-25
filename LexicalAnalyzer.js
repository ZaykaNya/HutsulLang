const keyWords = require("./enums/keyWordsEnum");
const punctOperators = require("./enums/punctOperatorsEnum");
const brackets = require("./enums/bracketEnum");
const relOperators = require("./enums/relOperatorsEnum");
const addOperators = require("./enums/addOperatorsEnum");
const multOperators = require("./enums/multOperatorsEnum");

function StateMachine(name, rules) {
    this.prevState = {name: 'begin'}
    this.state = {name: 'begin'}
    this.rules = rules
    this.name = name
}

StateMachine.prototype.inputChar = function (char) {
    this.prevState = this.state
    if (this.state) {
        this.state = this.rules[this.state.name](char)
    }
}

StateMachine.prototype.resetState = function () {
    this.prevState = {name: 'begin'}
    this.state = {name: 'begin'}
}

const keyWordMachine = new StateMachine('key word', {
    begin: char => {
        if (/[a-z]/i.test(char)) {
            return {name: 'begin'}
        }
    }
})

const wordMachine = new StateMachine('word', {
    begin: char => {
        if (/[a-z]/i.test(char)) {
            return {name: 'next'}
        }
    },
    next: char => {
        if (/[a-z]/i.test(char)) {
            return {name: 'next'}
        } else if (/[0-9]/.test(char)) {
            return {name: 'next'}
        }
    }
})

const spaceMachine = new StateMachine('spaces', {
    begin: char => {
        if (char === ' ') {
            return {name: 'begin'}
        } else if (char === '\n') {
            line++
            return {name: 'begin'}
        }
    }
})

const bracketMachine = new StateMachine('bracket', {
    begin: char => {
        if (brackets.hasOwnProperty(char)) {
            return {name: 'end'}
        }
    },
    end: () => undefined
})

const endMachine = new StateMachine('end', {
    begin: char => {
        if (char === ';') {
            return {name: 'begin'}
        }
    }
})

const intNumberMachine = new StateMachine('intNumber', {
    begin: char => {
        if (/[0-9]/.test(char)) {
            return {name: 'num'}
        }
    },
    num: char => {
        if (/[0-9]/.test(char)) {
            return {name: 'num'}
        } else if (char === 'e') {
            return {name: 'scientific'}
        }
    },
    scientific: char => {
        if (char === '+' || char === '-') {
            return {name: 'integer'}
        } else if (/[0-9]/.test(char)) {
            return {name: 'integer'}
        }
    },
    integer: char => {
        if (/[0-9]/.test(char)) {
            return {name: 'integer'}
        }
    }
})

const doubleNumberMachine = new StateMachine('doubleNumber', {
    begin: char => {
        if (/[0-9]/.test(char)) {
            return {name: 'num'}
        }
    },
    num: char => {
        if (/[0-9]/.test(char)) {
            return {name: 'num'}
        } else if (char === '.') {
            return {name: 'dot', notEnd: true}
        } else if (char === 'e') {
            return {name: 'scientific'}
        }
    },
    dot: char => {
        if (/[0-9]/.test(char)) {
            return {name: 'dot1'}
        }
    },
    dot1: char => {
        if (/[0-9]/.test(char)) {
            return {name: 'dot1'}
        } else if (char === 'e') {
            return {name: "scientific"}
        }
    },
    scientific: char => {
        if (char === '+' || char === '-') {
            return {name: 'integer'}
        } else if (/[0-9]/.test(char)) {
            return {name: 'integer'}
        }
    },
    integer: char => {
        if (/[0-9]/.test(char)) {
            return {name: 'integer'}
        }
    }
})

const assignMachine = new StateMachine('assign', {
    begin: char => {
        if (char === "=") {
            return {name: "end"};
        }
    },
    end: () => undefined
});

const relMachine = new StateMachine('rel', {
    begin: char => {
        if (relOperators.hasOwnProperty(char)) {
            if (char === '>' || char === '<') {
                return {name: 'compare'}
            } else if (char === '!') {
                return {name: 'compare', notEnd: true}
            } else {
                return {name: 'end'}
            }
        } else if (char === '=') {
            return {name: 'compare', notEnd: true}
        }
    },
    compare: char => {
        if (char === '=') {
            return {name: 'end'}
        }
    },
    end: () => undefined
})

const punctMachine = new StateMachine('punct', {
    begin: char => {
        if (punctOperators.hasOwnProperty(char)) {
            return {name: "end"};
        }
    },
    end: () => undefined
});

const addMachine = new StateMachine('add', {
    begin: char => {
        if (addOperators.hasOwnProperty(char)) {
            return {name: "end"};
        }
    },
    end: () => undefined
});

const multMachine = new StateMachine('mult', {
    begin: char => {
        if (multOperators.hasOwnProperty(char)) {
            if (char === "*") {
                return {name: "end"};
            } else if (char === "/") {
                return {name: "slash"}
            }
        }
    },
    slash: char => {
        if (char === '/') {
            return {name: 'end'}
        }
    },
    end: () => undefined
});

const submMachine = new StateMachine('subm', {
    begin: char => {
        if (char === "^") {
            return {name: "end"};
        }
    },
    end: () => undefined
});

function getActiveName(machinesList) {
    for (let i = 0; i < machinesList.length; i++) {
        if (machinesList[i].prevState && !machinesList[i].prevState.notEnd) {
            return machinesList[i].name
        }
    }
}

function resetAllRules(machinesList) {
    machinesList.forEach(item => {
        item.resetState();
    })
}

const allRules = [keyWordMachine, wordMachine, spaceMachine, endMachine, addMachine, multMachine, submMachine,
    assignMachine, relMachine, punctMachine, intNumberMachine, doubleNumberMachine, bracketMachine]

let line = 1;

function LexicalAnalyzer() {
    const program =
        'program testProgram {\n' +
    '    int a = 10;' +
    '    do {' +
    '        a = a - 2;' +
    '    } while (a > 6);' +
    '    print(a);' +
    '    int b = 100;' +
    '    print(b);' +
    '    int c = 0;' +
    '    read(c);' +
    '    c = c * 2;' +
    '    print(c);' +
    '}\n'
    const tokens = []
    const identifiers = []
    let charsCounter = 0
    for (let i = 0; i <= program.length; i++) {
        charsCounter++
        let hasActiveMachine = false
        allRules.forEach(machine => {
            machine.inputChar(program[i])
            if (machine.state) {
                hasActiveMachine = true
            }
        })

        if (!hasActiveMachine) {
            if (getActiveName(allRules) === 'key word' && charsCounter > 1) {
                if (keyWords.hasOwnProperty(program.substring(i - charsCounter + 1, i))) {
                    tokens.push({
                        line: line,
                        token: 'key word',
                        lexeme: program.substring(i - charsCounter + 1, i)
                    })
                    i--
                } else {
                    tokens.push({
                        line: line,
                        token: 'word',
                        lexeme: program.substring(i - charsCounter + 1, i)
                    })
                    if (identifiers.length === 0 || identifiers.filter(identifier => identifier.identifier === program.substring(i - charsCounter + 1, i)).length === 0) {
                        identifiers.push({
                            identifier: program.substring(i - charsCounter + 1, i)
                        })
                    }
                    i--
                }
            } else if (getActiveName(allRules) === 'number' && charsCounter > 1) {
                if (!Number.isNaN(+program.substring(i - charsCounter + 1, i))) {
                    tokens.push({
                        line: line,
                        token: 'number',
                        lexeme: program.substring(i - charsCounter + 1, i)
                    })
                    i--
                } else {
                    tokens.push({
                        line: line,
                        token: undefined,
                        lexeme: program.substring(i - charsCounter + 1, i)
                    })
                    i--
                }
            } else if (charsCounter > 1) {
                tokens.push({
                    line: line,
                    token: getActiveName(allRules),
                    lexeme: program.substring(i - charsCounter + 1, i)
                })
                i--
            } else {
                tokens.push({
                    line: line,
                    token: undefined,
                    lexeme: program.substring(i, i + 1)
                })
            }
            charsCounter = 0
            resetAllRules(allRules)
        }
    }

    // console.log(tokens, "\n")
    // console.log(identifiers)

    let error = false;

    tokens.forEach(token => {
        if (!token.token) {
            error = true;
            console.error(`Unexpected token ${token.lexeme} on line: ${token.line + 1}`)
        }
    })
    if (error) throw `Lexer: fail`;

    console.log("Lexer: success")

    return tokens;
}

module.exports = LexicalAnalyzer;