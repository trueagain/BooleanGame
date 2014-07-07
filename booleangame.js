function toNDigitsString(t, n){
	var result = t + "";
	while(result.length < n){
		result = "0" + result;
	}
	return result;
}

function log(message){
	var date = new Date();
    var timeToDisplay = toNDigitsString(date.getHours(), 2) + ":" + 
    toNDigitsString(date.getMinutes(), 2) + ":" + 
    toNDigitsString(date.getSeconds(), 2) + "." + 
    toNDigitsString(date.getMilliseconds(), 3) + " | ";
	console.log(timeToDisplay + message);
}

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
    vView.showLevel = function(l) {
        document.getElementById("level").innerHTML = l;
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
        QUESTION : 3,
        OVER : 4
    };
    qGenerator.step = (-1 * varNum) - 1;
    qGenerator.getQState = function(s) {
        if (s < 0) {
            return this.QSTATES.INIT;
        }
        if (s < this.VAR_NUM) {
            return this.QSTATES.UPDATE;
        }
        if (s < this.VAR_NUM * 2) {
            return this.QSTATES.QUESTION;
        }
        if (s < this.VAR_NUM * 4) {
            return this.QSTATES.UPDATE;
        }
        if (s < this.VAR_NUM * 5) {
            return this.QSTATES.QUESTION;
        }
        if (s < this.VAR_NUM * 8) {
            return this.QSTATES.UPDATE;
        }
        if (s < this.VAR_NUM * 9) {
            return this.QSTATES.QUESTION;
        }
        return this.QSTATES.OVER;
    }
    qGenerator.getUpdateCount = function(s) {
    	if (s < this.VAR_NUM * 2) {
            return 1;
        }
        if (s < this.VAR_NUM * 5) {
            return 2;
        }
        if (s < this.VAR_NUM * 9) {
            return 3;
        }
        return 0;
    }
    qGenerator.next = function() {
        var result = {};
        this.step++;
        result.qState = this.getQState(this.step);
        result.updateCount = this.getUpdateCount(this.step);
        var curVar;
        if (result.qState == this.QSTATES.INIT) {
            curVar = this.vars[this.step + this.VAR_NUM];
            var rBool = randomBoolean();
            curVar.value = rBool;
            result.qState = this.QSTATES.INIT;
            result.toDisplay = curVar.name + " = " + rBool;
        } else {
            var curVarIndex = this.step % this.VAR_NUM;
            curVar = this.vars[curVarIndex];
            if (result.qState == this.QSTATES.UPDATE) {
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
            } else if (result.qState == this.QSTATES.QUESTION) {
                result.qState = this.QSTATES.QUESTION;
                result.toDisplay = curVar.name + " = ?";
                result.answer = curVar.value;
            }
        }
        return result;
    }
    return qGenerator;
}

function playSound(s) {
    var audio = new Audio(s + ".mp3");
    audio.play();
}

function createEngine(eView, eStartVarNum) {
    var eEngine = {};
    eEngine.score = 0;
    eEngine.gain = 0;
    eEngine.view = eView;
    eEngine.startVarNum = eStartVarNum;
    eEngine.varNum = eStartVarNum;
    eEngine.changeVarNum = function(delta) {
        this.varNum++;
        this.view.showLevel(this.varNum);
    }
    eEngine.setVarNum = function(newValue) {
    	this.varNum = newValue;
    	this.view.showLevel(this.varNum);
    }
    eEngine.generator = createQuestionsGenerator(eEngine.varNum);
    eEngine.changeScore = function(delta) {
        this.score += delta;
        this.view.showScore(this.score);
    }
    eEngine.setScore = function(newValue) {
        this.score = newValue;
        this.view.showScore(this.score);
    }
    eEngine.setGain = function(newValue) {
        this.gain = newValue;
        this.view.showGain(this.gain);
    }
    eEngine.gainCountFuncInterval = null;
    eEngine.clearGainCount = function() {
    	this.setGain(0);
    	if(this.gainCountFuncInterval != null){
    		window.clearInterval(this.gainCountFuncInterval);
    	}
    }
    eEngine.resetGainCount = function(startValue, decreaseRate){
    	this.clearGainCount();
    	this.setGain(startValue);
    	var gainCountFunc = function(){
    		eEngine.setGain(Math.floor(eEngine.gain * decreaseRate));
    	}
    	this.gainCountFuncInterval = window.setInterval(gainCountFunc, 1000);
    }
    eEngine.INITIAL_NUMBER_OF_LIVES = 3;
    eEngine.lives = eEngine.INITIAL_NUMBER_OF_LIVES;
    eEngine.changeLives = function(delta) {
        this.lives += delta;
        this.view.showLives(this.lives);
    }
    eEngine.setLives = function(newValue) {
        this.lives = newValue;
        this.view.showLives(this.lives);
    }
    eEngine.prevQState = eEngine.generator.QSTATES.INACTIVE;
    eEngine.prevAnswer = null;
    eEngine.onButton = function(userAnswer) {
    	if(this.prevQState == this.generator.QSTATES.INACTIVE){
            log("reset")
            this.reset();
    	}
        var generatedQuestion = this.generator.next();
        log("generated question: qstate: " + generatedQuestion.qState + ", toDisplay: "
         + generatedQuestion.toDisplay + ", answer: " + generatedQuestion.answer
         + ", updateCount: " + generatedQuestion.updateCount);
        if (generatedQuestion.qState == this.generator.QSTATES.OVER) {
            playSound("nextlevel");
            log("creating next level");
            this.changeVarNum(1);
            this.generator = createQuestionsGenerator(this.varNum);
            this.onButton(userAnswer);
            return;
        }
        if (this.prevQState == this.generator.QSTATES.QUESTION) {
            if (userAnswer == this.prevAnswer) {
            	log("correct answer");
                playSound("correct");
                this.changeScore(this.gain);
                this.view.showLastAnswerRight();
            } else {
            	log("wrong answer");
                this.changeLives(-1);
                this.view.showLastAnswerWrong();
                if (this.lives < 1) {
                    playSound("gameover");
                    log("game over");
                    this.clearGainCount();
                    this.view.activateNoGame();
                    this.view.showOnDisplay("GAME OVER");
                    this.prevQState = this.generator.QSTATES.INACTIVE;
                    return;
                } else {
                    playSound("wrong");
                }
            }
            
        } else {
        	log("clean last answer");
            this.view.clearLastAnswer();
        }
        if ((generatedQuestion.qState == this.generator.QSTATES.INIT) || (generatedQuestion.qState == this.generator.QSTATES.UPDATE)) {
        	if((this.prevQState == this.generator.QSTATES.QUESTION) || (this.prevQState == this.generator.QSTATES.INACTIVE)){
        		var startGain = generatedQuestion.updateCount * 100 * this.varNum;
        		var decreaseRatio = 0.9;
        		log("reset gain to " + startGain + " with decrease ratio " + decreaseRatio);
        		this.resetGainCount(startGain, decreaseRatio);
        	}
        }
        if (generatedQuestion.qState == this.generator.QSTATES.INIT) {
            this.view.activateNext();
        } else if (generatedQuestion.qState == this.generator.QSTATES.UPDATE) {
            this.view.activateNext();
        } else if (generatedQuestion.qState == this.generator.QSTATES.QUESTION) {
            this.view.activateFalseTrue();
        }
        this.view.showOnDisplay(generatedQuestion.toDisplay);
        this.prevQState = generatedQuestion.qState;
        this.prevAnswer = generatedQuestion.answer;
    }
    eEngine.reset = function() {
        this.setVarNum(this.startVarNum);
        this.generator = createQuestionsGenerator(this.varNum);
        this.setLives(this.INITIAL_NUMBER_OF_LIVES);
        this.setScore(0);
    }
    eEngine.start = function() {
        this.view.getFalseNextButton().onclick = function() {
            eEngine.onButton(false);
        }
        this.view.getTrueButton().onclick = function() {
            eEngine.onButton(true);
        }
    }
    return eEngine;
}

function booleanGameMainFunction() {
    var view = createView();
    var engine = createEngine(view, 2);
    engine.start();
}

window.onload = booleanGameMainFunction;
