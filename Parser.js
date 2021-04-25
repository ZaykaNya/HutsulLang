const LexicalAnalyzer = require("./LexicalAnalyzer");
const Interpreter = require("./Interpreter");

const lexemeTable = LexicalAnalyzer().filter(lexeme => lexeme.token !== "spaces");

console.log(lexemeTable);

let currentLexemeIndex = 0;
let postfixCode = [];
let stack = [];

function parseProgram() {
    try {
        parseToken("program", "key word", "");

        parseName("word", "");

        parseToken("{", "bracket", "")

        parseStatementList();

        parseToken("}", "bracket", "")

        console.log("Done!")
    } catch (err) {
        console.error(`Error: ${err}`);
    }
}

function getLexeme() {
    if (currentLexemeIndex > lexemeTable.length) {
        failParse("Error! No lexemes left!");
    }

    return {
        lexeme: lexemeTable[currentLexemeIndex].lexeme,
        token: lexemeTable[currentLexemeIndex].token,
        line: lexemeTable[currentLexemeIndex].line
    };
}

function failParse(message) {
    throw message;
}

function parseName(token, indent) {
    let currentLexeme = getLexeme();
    currentLexemeIndex += 1;

    if (currentLexemeIndex > lexemeTable.length) {
        failParse("Error! No lexemes left!");
    }

    if (token === currentLexeme.token) {
        console.log(`${indent}parseName: In line ${currentLexeme.line} token "${currentLexeme.token}" lexeme "${currentLexeme.lexeme}"`);
        return true;
    } else {
        failParse(`Expected token "${token}" not same as received token "${currentLexeme.token}"`);
        return false;
    }
}

function parseToken(lexeme, token, indent) {
    let currentLexeme = getLexeme();
    currentLexemeIndex += 1;

    if (currentLexemeIndex > lexemeTable.length) {
        failParse("Error! No lexemes left!");
    }

    if (lexeme === currentLexeme.lexeme && token === currentLexeme.token) {
        console.log(`${indent}parseToken: In line ${currentLexeme.line} token "${currentLexeme.token}" lexeme "${currentLexeme.lexeme}"`);
        return true;
    } else {
        failParse(`Expected lexeme "${lexeme}" not same as received lexeme "${currentLexeme.lexeme}"`);
        return false;
    }
}

function parseStatementList() {
    console.log("\tparseStatementList():");
    while (parseStatement()) {
    }
    return true;
}

function parseStatement(checkEnd = true, init = true) {
    console.log("\t\tparseStatement():");

    let currentLexeme = getLexeme();

    if (init && (currentLexeme.lexeme === "int" || currentLexeme.lexeme === "double" || currentLexeme.lexeme === "bool")) {
        console.log(`\t\tparseStatement(): In line ${currentLexeme.line} token ${currentLexeme.token} lexeme ${currentLexeme.lexeme}`);
        currentLexemeIndex += 1;

        postfixCode.push({lexeme: currentLexeme.lexeme, token: currentLexeme.token});

        // may cause an error
        parseStatement(true,false)
        return true;
    } else if (currentLexeme.token === "word") {
        parseAssign(checkEnd);
        return true;
    } else if (currentLexeme.lexeme === "if") {
        parseIf();
        return true;
    } else if (currentLexeme.lexeme === "do") {
        parseDoWhile();
        return true;
    } else if (currentLexeme.lexeme === "print") {
        parsePrint();
        return true;
    } else if (currentLexeme.lexeme === "read") {
        parseRead();
        return true;
    } else if (currentLexeme.lexeme === "}") {
        return false;
    } else {
        failParse("Error in parseStatement()");
        return false;
    }
}

function parseAssign(checkEnd) {
    console.log("\t\t\t\tparseAssign():");

    let currentLexeme = getLexeme();
    currentLexemeIndex += 1;

    postfixCode.push({lexeme: currentLexeme.lexeme, token: currentLexeme.token});

    console.log(`\t\t\t\t\tIn line ${currentLexeme.line} lexeme "${currentLexeme.lexeme}"`);
    if (parseToken("=", "assign", "\t\t\t\t\t")) {
        parseExpression();

        postfixCode.push({lexeme: "=", token: "assign"});

        currentLexeme = getLexeme();
        if (currentLexeme.lexeme === ",") {
            currentLexemeIndex += 1;
            parseStatement(false, false);
        }
        if(checkEnd) {
            parseName("end", "\t\t\t\t\t");
        }

        return true;
    } else {
        return false;
    }
}

function parseExpression() {
    console.log("\t\t\t\t\tparseExpression():");

    let currentLexeme = getLexeme();
    if (currentLexeme.lexeme === "true" || currentLexeme.lexeme === "false") {
        currentLexemeIndex += 1;
        console.log(`\t\t\t\t\t\tIn line ${currentLexeme.line} lexeme "${currentLexeme.lexeme}"`);
        return true;
    }

    parseTerm();

    let condition = true;
    while (condition) {
        let currentLexeme = getLexeme();
        if (currentLexeme.token === "add") {
            currentLexemeIndex += 1;
            console.log(`\t\t\t\t\t\tIn line ${currentLexeme.line} lexeme "${currentLexeme.lexeme}"`);
            parseTerm();

            postfixCode.push({lexeme: currentLexeme.lexeme, token: currentLexeme.token});

        } else {
            condition = false;
        }
    }

    return true;
}

function parseTerm() {
    console.log("\t\t\t\t\t\tparseTerm():");

    parseSubm();

    let condition = true;
    while (condition) {
        let currentLexeme = getLexeme();
        if (currentLexeme.token === "mult") {
            currentLexemeIndex += 1;
            console.log(`\t\t\t\t\t\tIn line ${currentLexeme.line} lexeme "${currentLexeme.lexeme}"`);
            parseSubm();

            postfixCode.push({lexeme: currentLexeme.lexeme, token: currentLexeme.token});

        } else {
            condition = false;
        }
    }

    return true;
}

function parseSubm() {
    console.log("\t\t\t\t\t\tparseSubm():");

    parseFactor();

    let condition = true;
    while (condition) {
        let currentLexeme = getLexeme();
        if (currentLexeme.token === "subm") {
            currentLexemeIndex += 1;
            console.log(`\t\t\t\t\t\tIn line ${currentLexeme.line} lexeme "${currentLexeme.lexeme}"`);
            parseFactor();

            postfixCode.push({lexeme: currentLexeme.lexeme, token: currentLexeme.token});

        } else {
            condition = false;
        }
    }

    return true;
}

function parseFactor() {
    console.log("\t\t\t\t\t\t\tparseFactor():");

    let currentLexeme = getLexeme();

    console.log(`\t\t\t\t\t\t\tparseFactor(): ============ In line ${currentLexeme.line} lexeme "${currentLexeme.lexeme}"`);

    if (currentLexeme.token === "intNumber" || currentLexeme.token === "doubleNumber" || currentLexeme.token === "word") {
        currentLexemeIndex += 1;

        postfixCode.push({lexeme: currentLexeme.lexeme, token: currentLexeme.token});

        console.log(`\t\t\t\t\t\t\tIn line ${currentLexeme.line} lexeme "${currentLexeme.lexeme}"`);
    } else if(currentLexeme.lexeme === "(") {
        currentLexemeIndex += 1;
        parseExpression();
        parseToken(")", "bracket", "\t\t\t\t\t\t\t")
        console.log(`\t\t\t\t\t\t\tIn line ${currentLexeme.line} lexeme "${currentLexeme.lexeme}"`);
    } else {
        failParse("Error in parseFactor()");
    }

    return true;
}

function parseBoolExpression() {
    parseExpression();
    let currentLexeme = getLexeme();
    let saveLexeme;

    if(currentLexeme.token === "rel") {
        saveLexeme = getLexeme();
        currentLexemeIndex += 1;
        console.log(`\t\t\t\t\tIn line ${currentLexeme.line} lexeme "${currentLexeme.lexeme}"`)
    } else {
        failParse("Error in Bool Expression");
    }

    parseExpression();

    postfixCode.push({lexeme: saveLexeme.lexeme, token: saveLexeme.token});

    return true;
}

function parsePrint() {
    try {
        parseToken("print", "key word", "");
        postfixCode.push({lexeme: "print", token: "key word"});
        parseToken("(", "bracket", "");
        let currentLexeme = getLexeme();
        postfixCode.push({lexeme: currentLexeme.lexeme, token: currentLexeme.token});
        parseName("word", "");
        parseToken(")", "bracket", "");
        parseName("end", "");

        return true;
    } catch (err) {
        console.error(`Error in "print" statement`);
        return false;
    }
}

function parseRead() {
    try {
        parseToken("read", "key word", "");
        postfixCode.push({lexeme: "read", token: "key word"});
        parseToken("(", "bracket", "");
        let currentLexeme = getLexeme();
        postfixCode.push({lexeme: currentLexeme.lexeme, token: currentLexeme.token});
        parseName("word", "");
        parseToken(")", "bracket", "");
        parseName("end", "");

        return true;
    } catch (err) {
        console.error(`Error in "read" statement`);
        return false;
    }
}

function parseIf() {
    try {
        parseToken("if", "key word", "");
        parseToken("(", "bracket", "");
        parseBoolExpression();
        parseToken(")", "bracket", "");
        parseToken("?", "punct", "");
        postfixCode.push({lexeme: "?", token: "punct"});
        parseStatement(false);

        let currentLexeme = getLexeme();

        if (currentLexeme.lexeme === ":") {
            parseToken(":", "punct", "");
            postfixCode.push({lexeme: ":", token: "punct"});
            parseStatement();
        } else {
            parseName("end", "");
        }

        postfixCode.push({lexeme: "if", token: "key word"});
        return true;
    } catch (err) {
        console.error(`Error in "if" statement`);
        return false;
    }
}

function parseDoWhile() {
    try {
        parseToken("do", "key word", "");
        postfixCode.push({lexeme: "do", token: "key word"});
        parseToken("{", "bracket", "");
        parseStatementList();
        parseToken("}", "bracket", "");
        parseToken("while", "key word", "");
        parseToken("(", "bracket", "");
        parseBoolExpression();
        parseToken(")", "bracket", "");
        parseName("end", "");
    } catch (err) {
        console.error(`Error in "do while" statement`);
        return false;
    }
}

parseProgram();

console.log("\n\n");
console.error(postfixCode);
Interpreter(postfixCode);