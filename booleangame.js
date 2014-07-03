function randomBoolean() {
    var r = Math.random();
    if (r > 0.5) {
        return true;
    }
    return false;
}

function getVarName(n) {
    var letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
    var m = n;
    var curName = "";
    do {
        var rest = m % 26;
        curName = letters[rest] + curName;
        m = (m - rest) / 26;
    } while (m != 0);
    return curName;
}

function generateVars(n) {
    var result = [];
    for (var i = 0; i < n; i++) {
        result[i] = {
            name : getVarName(i),
            value : false
        };
    }
    return result;
}

function booleanGameMainFunction() {

    var timeAndScoreView = {};
    timeAndScoreView.time = 0;
    timeAndScoreView.timeTickFunc = function() {
        this.time++;
        document.getElementById("timer").innerHTML = "Time: " + this.time + "s";
    }
    timeAndScoreView.timerInterval

    timeAndScoreView.rightScore = 0;
    timeAndScoreView.increaseRightScore = function() {
        this.rightScore++;
        document.getElementById("right_score").innerHTML = "Right: " + this.rightScore;
    }

    timeAndScoreView.wrongScore = 0;
    timeAndScoreView.increaseWrongScore = function() {
        this.wrongScore++;
        document.getElementById("wrong_score").innerHTML = "Wrong: " + this.wrongScore;
    }
    var g_nextButton = document.getElementById("next_button");
    var g_display = document.getElementById("display");
    var g_answerInput = document.getElementById("answer_input");
    var g_answerResult = document.getElementById("answer_result");

    var STATES = {
        NO_GAME : 0,
        INIT : 1,
        UPDATE : 2,
        QUESTION : 3
    };
    var state = STATES.NO_GAME;
    var prevState = STATES.NO_GAME;
    function getState() {
        return state;
    }

    function getPrevState() {
        return prevState;
    }

    function setState(s) {
        prevState = state;
        state = s;
        if (state == STATES.NO_GAME) {
            g_nextButton.innerHTML = "New Game";
        } else {
            g_nextButton.innerHTML = "Next";
        }
    }

    var NUMBER_OF_VARIABLES = 3;
    var variables = generateVars(NUMBER_OF_VARIABLES);
    var curVariable = variables[0];
    var prevQuestionAnswer;

    var step = (-1 * NUMBER_OF_VARIABLES) - 1;
    function nextStep() {
        step++;
        if (step < 0) {
            setState(STATES.INIT);
            curVariable = variables[step + NUMBER_OF_VARIABLES];
        } else {
            if ((step % (2 * NUMBER_OF_VARIABLES)) < 3) {
                setState(STATES.UPDATE);
            } else {
                setState(STATES.QUESTION);
            }
            var curVariableIndex = step % NUMBER_OF_VARIABLES;
            curVariable = variables[curVariableIndex];
        }
    }

    function checkAnswer() {
    	console.log("g_answerInput.value: " + g_answerInput.value + " prevQuestionAnswer: " + prevQuestionAnswer);
		if(g_answerInput.value == (prevQuestionAnswer + "")){
			g_answerResult.innerHTML = "Right";
			timeAndScoreView.increaseRightScore();
		} else {
			g_answerResult.innerHTML = "Wrong";
			timeAndScoreView.increaseWrongScore();
		}
    }

    function nextLine() {
        nextStep();
        if (getPrevState() == STATES.QUESTION) {
            checkAnswer();
        } else {
        	g_answerResult.innerHTML = "";
        }
        var result;
        if (getState() == STATES.INIT) {
            var rBool = randomBoolean();
            result = curVariable.name + " = " + rBool;
            curVariable.value = rBool;
        } else if (getState() == STATES.UPDATE) {
            var rBool = randomBoolean();
            var rOp;
            if (randomBoolean()) {
                rOp = "OR";
                curVariable.value = curVariable.value || rBool;
            } else {
                rOp = "AND";
                curVariable.value = curVariable.value && rBool;
            }
            result = curVariable.name + " = " + curVariable.name + " " + rOp + " " + rBool;
        } else if (getState() == STATES.QUESTION) {
            result = curVariable.name + " = ?";
            prevQuestionAnswer = curVariable.value;
        }
        console.log(curVariable.name + " = " + curVariable.value);
        return result;
    }


    g_nextButton.onclick = function() {
        g_display.innerHTML = nextLine();
    }
}

window.onload = booleanGameMainFunction;
