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

function createView() {
    var vView = {};
    vView.showScore = function(s) {
        document.getElementById("score").innerHTML = s;
    }
    vView.showGain = function(g) {
        document.getElementById("gain").innerHTML = g;
    }
    vView.showLives = function(l) {
        document.getElementById("lives").innerHTML = l;
    }
    vView.showLastAnswerRight = function() {
        document.getElementById("last_answer").innerHTML = "Right";
    }
    vView.showLastAnswerWrong = function() {
        document.getElementById("last_answer").innerHTML = "Wrong";
    }
    vView.clearLastAnswer = function() {
        document.getElementById("last_answer").innerHTML = "";
    }
    vView.showOnDisplay = function(d) {
        document.getElementById("display").innerHTML = d;
    }
    vView.changeNextFalseButtonName = function(n) {
        document.getElementById("next_false_button").innerHTML = n;
    }
    vView.hideNextFalseButton = function() {
        document.getElementById("next_false_button").style.visibility = "hidden";
    }
    vView.showNextFalseButton = function() {
        document.getElementById("next_false_button").style.visibility = "visible";
    }
    vView.hideTrueButton = function() {
        document.getElementById("true_button").style.visibility = "hidden";
    }
    vView.showTrueButton = function() {
        document.getElementById("true_button").style.visibility = "visible";
    }
    vView.activateNoGame = function() {
        this.hideTrueButton();
        this.changeNextFalseButtonName("New Game");
    }
    vView.activateNext = function() {
        this.hideTrueButton();
        this.changeNextFalseButtonName("Next");
    }
    vView.activateFalseTrue = function() {
        this.showTrueButton();
        this.changeNextFalseButtonName("False");
    }
    vView.getFalseNextButton = function() {
        return document.getElementById("next_false_button");
    }
    vView.getTrueButton = function() {
        return document.getElementById("true_button");
    }
    return vView;
}

function createQuestionsGenerator(varNum) {
    var qGenerator = {};
    qGenerator.VAR_NUM = varNum;
    qGenerator.vars = generateVars(qGenerator.VAR_NUM);
    qGenerator.QSTATES = {
        INACTIVE : 0,
        INIT : 1,
        UPDATE : 2,
        QUESTION : 3
    };
    qGenerator.qState = qGenerator.QSTATES.INACTIVE;
    qGenerator.step = (-1 * varNum) - 1;
    qGenerator.next = function() {
        var result = {};
        this.step++;
        var curVar;
        if (this.step < 0) {
        	curVar = this.vars[this.step + this.VAR_NUM];
            var rBool = randomBoolean();
            curVar.value = rBool;
            result.qState = this.QSTATES.INIT;
            result.toDisplay = curVar.name + " = " + rBool;
        } else {
        	var curVarIndex = this.step % this.VAR_NUM;
            curVar = this.vars[curVarIndex];
            if ((this.step % (2 * this.VAR_NUM)) < this.VAR_NUM) {
                var rBool = randomBoolean();
                var rOp;
                if (randomBoolean()) {
                    rOp = "OR";
                    curVar.value = curVar.value || rBool;
                } else {
                    rOp = "AND";
                    curVar.value = curVar.value && rBool;
                }
                result.qState = this.QSTATES.UPDATE;
                result.toDisplay = curVar.name + " = " + curVar.name + " " + rOp + " " + rBool;
            } else {
                result.qState = this.QSTATES.QUESTION;
                result.toDisplay = curVar.name + " = ?";
                result.answer = curVar.value;
            }
        }
        return result;
    }
    return qGenerator;
}

function createEngine(eView, eGenerator) {
    var eEngine = {};
    eEngine.score = 0;
    eEngine.changeScore = function(delta){
    	this.score += delta;
    	eView.showScore(this.score);
    }
    eEngine.INITIAL_NUMBER_OF_LIVES = 3;
    eEngine.lives = eEngine.INITIAL_NUMBER_OF_LIVES;
    eEngine.changeLives = function(delta){
    	this.lives += delta;
    	eView.showLives(this.lives);
    }
    eEngine.prevQState == eGenerator.QSTATES.INACTIVE;
    eEngine.prevAnswer;
    eEngine.onButton = function(userAnswer) {
    	var generatedQuestion = eGenerator.next();
    	if(this.prevQState == eGenerator.QSTATES.QUESTION){
    		if(userAnswer == this.prevAnswer){
    			this.changeScore(1);
    			eView.showLastAnswerRight();
    		} else {
    			this.changeLives(-1);
    			eView.showLastAnswerWrong();
    		}	
		} else {
			eView.clearLastAnswer();
		}
		if(generatedQuestion.qState == eGenerator.QSTATES.INIT){
			eView.activateNext();
		} else if(generatedQuestion.qState == eGenerator.QSTATES.UPDATE){
			eView.activateNext();
		} else if(generatedQuestion.qState == eGenerator.QSTATES.QUESTION){
			eView.activateFalseTrue();
		}
		eView.showOnDisplay(generatedQuestion.toDisplay);
		this.prevQState = generatedQuestion.qState;
		this.prevAnswer = generatedQuestion.answer;
    }
    eEngine.init = function(){
    	eView.getFalseNextButton().onclick = function(){
    		eEngine.onButton(false);
    	}
    	eView.getTrueButton().onclick = function(){
    		eEngine.onButton(true);
    	}
    }
    return eEngine;
}

function booleanGameMainFunction() {
    var view = createView();
    var generator = createQuestionsGenerator(2);
    var engine = createEngine(view, generator);
    engine.init();
}

window.onload = booleanGameMainFunction;
