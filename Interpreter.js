function interpreter(postfixCode) {

    let stack = [];
    let scope = [];
    let variable;
    let type;
    let previous = {};

    while (postfixCode.length > 0) {

        let item = postfixCode[0];
        postfixCode = postfixCode.slice(1);

        if (!Number.isNaN(+item.lexeme)) {
            stack.push(+item.lexeme);
        } else if (item.token === "word" && scope.filter(element => element.variable === item.lexeme).length === 1 && previous.lexeme !== "=") {
            if(scope.filter(element => element.variable === item.lexeme).length === 1) {
                scope.forEach(element => {
                    if (element.variable === item.lexeme) {
                        stack.push(element.value);
                    }
                })
            }
        } else if (item.lexeme === "true" || item.lexeme === "false") {
            stack.push(item.lexeme);
        } else {
            try {
                if (!type && (item.lexeme === "int" || item.lexeme === "double" || item.lexeme === "bool")) {
                    type = item.lexeme;
                }
                if (item.token === "word") {
                    variable = item.lexeme;
                    if (scope.filter(element => element.variable === variable).length === 0) {
                        if(!type) {
                            console.error(`Variable "${variable}" is not exists`);
                            throw "Init Error";
                        }
                        scope.push({type: type, variable: variable, value: 0})
                        type = undefined;
                    } else if (type && scope.filter(element => element.variable === variable).length > 0) {
                        console.error(`Variable "${variable}" is already exists`);
                        throw "Init Error";
                    }
                }
                console.log("Current stack:", stack);
                let second = stack.pop();
                let first = stack.pop();
                if (item.lexeme === "+") {
                    stack.push(first + second);
                } else if (item.lexeme === "-") {
                    stack.push(first - second);
                } else if (item.lexeme === "*") {
                    stack.push(first * second);
                } else if (item.lexeme === "/") {
                    if(second === 0) {
                        console.error("Can not divide by 0");
                        throw "Divide Error";
                    }
                    stack.push(first / second);
                } else if (item.lexeme === "^") {
                    stack.push(first ** second);
                } else if (item.lexeme === "=") {
                    scope.forEach(element => {
                        if (element.variable === variable && second !== undefined) {
                            if (checkType(second, element)) {
                                element.value = second;
                            } else {
                                console.error(`"${element.variable}" has type "${element.type}" type but got another type`)
                                throw "Type Error";
                            }
                        }
                    })
                }
            } catch (err) {
                if (err === "Type Error") {
                    throw "Interpreter Type Error";
                } else if(err === "Init Error") {
                    throw "Interpreter Init Error";
                } else if(err === "Divide Error") {
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