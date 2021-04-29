var readlineSync = require("readline-sync");

function interpreter(postfixCode) {

    let stack = [];
    let scope = [];
    let variable;
    let type;
    let previous = {};

    for (let i = 0; i < postfixCode.length; i++) {

        let item = postfixCode[i];
        console.log(item);

        if (!Number.isNaN(+item.lexeme)) {
            stack.push({value: +item.lexeme});
        } else if (item.token === "word" && scope.filter(element => element.variable === item.lexeme).length === 1 && previous.lexeme !== "int") {
            if (scope.filter(element => element.variable === item.lexeme).length === 1) {
                scope.forEach(element => {
                    if (element.variable === item.lexeme) {
                        stack.push(element);
                    }
                })
            }
        } else if (item.lexeme === "true" || item.lexeme === "false") {
            stack.push(item.lexeme);
        } else if (item.lexeme === "print") {
            item = postfixCode[i];
            if (scope.filter(element => element.variable === item.lexeme).length === 0) {
                console.error(`Variable "${item.lexeme}" is not exists`);
                throw "Init Error";
            }
            scope.forEach(element => {
                if (element.variable === item.lexeme) {
                    console.log(element.value);
                }
            });
        } else if (item.lexeme === "read") {
            let value = readlineSync.question("");
            let item = postfixCode[i];
            scope.forEach(element => {
                if (element.variable === item.lexeme) {
                    element.value = +value;
                }
            });
        } else {
            try {
                if (!type && (item.lexeme === "int" || item.lexeme === "double" || item.lexeme === "bool")) {
                    type = item.lexeme;
                }
                if (item.token === "word") {
                    variable = item.lexeme;
                    if (scope.filter(element => element.variable === variable).length === 0) {
                        if (!type) {
                            console.error(`Variable "${variable}" is not exists`);
                            throw "Init Error";
                        }
                        let ident = {type: type, variable: variable, value: 0}
                        scope.push(ident)
                        stack.push(ident)
                        type = undefined;
                        continue;
                    } else if (type && scope.filter(element => element.variable === variable).length > 0) {
                        console.error(`Variable "${variable}" is already exists`);
                        throw "Init Error";
                    }
                }
                // console.log("Current stack", stack);
                let second, first;
                if (item.token === "JF") {
                    first = stack.pop();
                    if (first.value === false) {
                        i = item.jumpToIdx;
                    }
                } else if (item.token === "JUMP") {
                    first = stack.pop();
                    i = item.jumpToIdx;
                } else {
                    second = stack.pop();
                    first = stack.pop();
                }
                if (item.lexeme === "+") {
                    stack.push({value: first.value + second.value});
                } else if (item.lexeme === "-") {
                    stack.push({value: first.value - second.value});
                } else if (item.lexeme === "*") {
                    stack.push({value: first.value * second.value});
                } else if (item.lexeme === "/") {
                    if (second === 0) {
                        console.error("Can not divide by 0");
                        throw "Divide Error";
                    }
                    stack.push({value: first.value / second.value});
                } else if (item.lexeme === "^") {
                    stack.push({value: first.value ** second.value});
                } else if (item.lexeme === "=") {
                    if (checkType(second.value, first)) {
                        first.value = second.value;
                    } else {
                        console.error(`"${first.variable}" has type "${first.type}" type but got another type`)
                        throw "Type Error";
                    }
                } else if (item.token === "rel") {
                    if (item.lexeme === "==") {
                        stack.push({value: first.value === second.value})
                    } else if (item.lexeme === "<") {
                        stack.push({value: first.value < second.value})
                    } else if (item.lexeme === ">") {
                        stack.push({value: first.value > second.value})
                    } else if (item.lexeme === ">=") {
                        stack.push({value: first.value >= second.value})
                    } else if (item.lexeme === "<=") {
                        stack.push({value: first.value <= second.value})
                    }
                }
            } catch (err) {
                if (err === "Type Error") {
                    throw "Interpreter Type Error";
                } else if (err === "Init Error") {
                    throw "Interpreter Init Error";
                } else if (err === "Divide Error") {
                    throw "Interpreter Divide Error";
                } else {
                    throw "Interpreter Error";
                }
            }
        }
        previous = item;
    }

    console.log(scope);
}

function checkType(second, variable) {
    if (variable.type === "int" && Number.isInteger(second)) {
        return true;
    } else if (variable.type === "double" && !Number.isNaN(second)) {
        return true;
    } else if (variable.type === "bool" && (second === "true" || second === "false")) {
        return true;
    } else {
        return false;
    }
}

module.exports = interpreter;
