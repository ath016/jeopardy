
/* VARIABLES **************************************************** */


// canvas setup
var canvas = document.querySelector('canvas');
var c = canvas.getContext('2d');

// margin
var topMargin = 0.8;
var bottomMargin = 0.8;
var buffer = 0;
var bufferFactor = 0.005;

// text color
var textColor = '#F0F0DF';
// highlightColor
var highlightColor = '#FF9000';
// font
var font = 'px Palatino';
var textSizingHorz = 2;
var textSizingVert = 0.1;

// working question box
var questionBox = undefined;
// question colors
var validColor = '#2B3A42';
var invalidColor = '#BDD3DE';

// note: # of player is currently hard coded to 4. go to line [49, 474, 571]

// player name
var playerName = ['logic', 'team 1: ', 'team 2: ', 'team 3: ', 'team 4: ']

// logic state
var stateBank = 0;
var stateQuestion = 1;
var stateAnswer = 2;

// background color
var backgroundColor = '#3F5866';

// key binds
var keyMap = new Map();
keyMap.set('1', {isPlayer:true, player:1, isAnswer:false, answer:false, continue: false, reset:false});
keyMap.set('2', {isPlayer:true, player:2, isAnswer:false, answer:false, continue: false, reset:false});
keyMap.set('3', {isPlayer:true, player:3, isAnswer:false, answer:false, continue: false, reset:false});
keyMap.set('4', {isPlayer:true, player:4, isAnswer:false, answer:false, continue: false, reset:false});
keyMap.set('y', {isPlayer:false, player:0, isAnswer:true, answer:true, continue: false, reset:false});
keyMap.set('n', {isPlayer:false, player:0, isAnswer:true, answer:false, continue: false, reset:false});
keyMap.set(' ', {isPlayer:false, player:0, isAnswer:false, answer:false, continue: true, reset:false});
keyMap.set('r', {isPlayer:false, player:0, isAnswer:false, answer:false, continue: false, reset:true});

// object
var questionBank = new QuestionBank();
var questionAnswer = undefined;
var score = new Score();
var logic = new Logic();

/* OBJECT ******************************************************* */


// text box
function TextBox(start, end, textColor, text) {
	this.start = start;
	this.end = end;
	this.text = text.toString().split('\n');
	this.width = this.end.x - this.start.x;
	this.height = Math.min(
		(this.end.y - this.start.y) / this.text.length,
		((this.end.x - this.start.x) * textSizingHorz) / Math.max.apply(null, this.text.map(text => {return text.length;}))
	); // end of min
	this.textColor = textColor;
	this.textAlign = 'center';
	this.textAlignVert = 'middle';
	
	// draw function
	this.draw = function() {
		// draw background
		c.fillRect(this.start.x, this.start.y, this.width, this.end.y - this.start.y);
		
		// set text properties
		c.font = this.height + font;
		c.fillStyle = this.textColor;
		c.textAlign = this.textAlign;
		c.textBaseline = this.textAlignVert;
		
		// draw text
		for(var i = 0; i < this.text.length; i++) {
			c.fillText(this.text[i], this.width / 2 + this.start.x, this.height / 2 + this.start.y + this.height * textSizingVert + i * this.height);
		} // end of for
	} // end of draw
	
	// check location
	this.check = function(location) {
		return this.start.x <= location.x && location.x <= this.end.x && this.start.y <= location.y && location.y <= this.end.y;
	} // end of check location
	
	// update text
	this.setText = function(text) {
		this.text = text.toString().split('\n');
		this.height = Math.min(
			(this.end.y - this.start.y) / this.text.length,
			((this.end.x - this.start.x) * textSizingHorz) / Math.max.apply(null, this.text.map(text => {return text.length;}))
		); // end of min
	} // end of update
	
	// update color
	this.setColor = function(color) {
		this.textColor = color;
	} // end of update color
	
	// update size
	this.resize = function(start, end) {
		this.start = start;
		this.end = end;
		this.width = this.end.x - this.start.x;
		this.height = Math.min(
			(this.end.y - this.start.y) / this.text.length,
			((this.end.x - this.start.x) * textSizingHorz) / Math.max.apply(null, this.text.map(text => {return text.length;}))
		); // end of min
	} // end of update size
} // end of text box object

// question box
function QuestionBox(textBox, question, answer, score) {
	this.valid = true;
	this.textBox = textBox;
	this.validColor = validColor;
	this.invalidColor = invalidColor;
	this.question = question;
	this.answer = answer;
	this.score = score;
	
	// draw function
	this.draw = function() {
		// set background color
		c.fillStyle = (this.valid) ? this.validColor: this.invalidColor;
		
		// draw text
		this.textBox.draw();
	} // end of draw

	// return question and answer
	this.getQA = function() {
		return {question: this.question, answer: this.answer};
	} // end of get question answer
	
	// check location function
	this.check = function(location) {
		// check if element if click
		if(this.textBox.check(location) && this.valid) {
			// invalidate question
			this.setValid(false);
			
			// question clicked on
			return 1;
		} // end of if
		
		// default
		return 0;
	} // end of check
	
	// update function
	this.setValid = function(valid) {
		// update data
		this.valid = valid;
		
		// update text
		if(this.valid) {
			this.textBox.update(this.score)
		} // end of if
		else {
			this.textBox.setText('')
		} // end of else
	} // end of update
	
	// return score
	this.getScore = function() {
		return this.score;
	} // end of get score
	
	// update size
	this.resize = function(start, end) {
		this.textBox.resize(start, end);
	} // end of update size
} // end of question box object

// question bank
function QuestionBank() {
	this.topic = [];
	this.bank = [];
	
	// add column topics
	this.addTopic = function(topic) {
		this.topic.push(topic);
	} // end of ass column
	
	// fill question bank with shallow copy
	this.addQuestion = function(index, question) {
		// check undefined
		if(this.bank[index] === undefined) {
			this.bank.push([]);
		} // end of if
		
		// push to column
		this.bank[index].push(question);
	} // end of add question
	
	// draw question bank
	this.draw = function() {
		this.topic.forEach(function(topic) {
			// set background color
			c.fillStyle = validColor;
			
			// draw topic
			topic.draw();
		}); // end of for each
		
		// draw question
		this.bank.forEach(function(bank) {
			bank.forEach(function(question) {
				question.draw();
			}); // end of for each
		}); // end of for each
	} // end of draw
	
	// check question clicked
	this.check = function(location) {
		for(var outter = 0; outter < this.bank.length; outter++) {
			for(var inner = 0; inner < this.bank[outter].length; inner++) {
				if(this.bank[outter][inner].check(location)) {
					return this.bank[outter][inner];
				} // end of if
			} // end of inner for
		} // end of outter for
	} // end of check
	
	// update column size
	this.resizeTopic = function(index, start, end) {
		this.topic[index].resize(start, end);
	} // end of update column size
	
	// update bank size
	this.resizeBank = function(column, row, start, end) {
		this.bank[column][row].resize(start, end);
	} // end of update bank size
} // end of question bank object

function QuestionAnswer(questionAnswer) {
	// placement variable
	this.min = Math.min(canvas.width, canvas.height) / 2;
	this.x = canvas.width / 2;
	this.y = canvas.height / 2;
	
	this.start = {x:this.x - this.min, y:this.y - this.min * topMargin};
	this.end = {x:this.x + this.min, y:this.y + this.min * bottomMargin};
	
	// object variables
	this.textBox = new TextBox(this.start, this.end, textColor, 'text');
	this.question = questionAnswer.question;
	this.answer = questionAnswer.answer;
	
	// draw question
	this.drawQuestion = function() {
		this.textBox.setText(this.question);
		c.fillStyle = backgroundColor;
		this.textBox.draw();
	} // end of draw question
	
	// draw answer
	this.drawAnswer = function() {
		this.textBox.setText(this.answer);
		c.fillStyle = backgroundColor;
		this.textBox.draw();
	} // end of draw answer
} // end of question answer object

// score
function Score() {
	// object variables
	this.scores = Array(playerName.length).fill(0);
	this.scoreBox = [];

	// add score box
	this.addScoreBox = function(scoreBox) {
		// add text box
		this.scoreBox.push(scoreBox);
	} // end of add score box
	
	// update score
	this.updateScore = function(playerNumber, score) {
		// update score array
		this.scores[playerNumber] += score;
		// update text box
		this.scoreBox[playerNumber].setText(playerName[playerNumber] + this.scores[playerNumber]);
	} // end of update
	
	// update color
	this.setColor = function(playerNumber, color) {
		this.scoreBox[playerNumber].setColor(color);
	} // end of color
	
	// draw score box
	this.draw = function() {
		for(var i = 1; i < this.scoreBox.length; i++) {
			// set background color
			c.fillStyle = backgroundColor;
			// draw text box
			this.scoreBox[i].draw();
		} // end of for
	} // end of draw
	
	// update size
	this.resize = function(playerNumber, start, end) {
		//update text box size
		this.scoreBox[playerNumber].resize(start, end);
	} // end of update size
} // end of score object

// game logic
function Logic() {
	// current player
	this.player = 0;
	// current state 
	this.state = 0;
	
	// get player
	this.getPlayer = function() {
		return this.player;
	} // end of get player
	
	// set player
	this.setPlayer = function(player) {
		// change to default color
		score.setColor(this.player, textColor);
		
		// update current player
		this.player = player;
		
		// change to highlight color
		score.setColor(this.player, highlightColor);
	} // end of set player
	
	// set state
	this.setState = function(state) {
		// error check
		if(state < stateBank) return;
		if(state > stateAnswer) return;
		
		// update state
		this.state = state
	} // end of set state

	// get state
	this.getState = function() {
		return this.state;
	} // end of get state
} // end of game logic object


/* FUNCTIONS **************************************************** */


// initiation
function init() {
	// update canvas dimension
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight - 5;
	
	// resize buffer;
	buffer = Math.min(canvas.width, canvas.height) * bufferFactor;
} // end of init

// animation function
function animate() {
	// call animation
	requestAnimationFrame(animate);
	// clear screen
	c.clearRect(0, 0, canvas.width, canvas.height);
	
	// set default fill color
	c.fillStyle = backgroundColor;
	c.fillRect(0, 0, canvas.width, canvas.height);
	
	// draw scores
	score.draw();
	
	// display question bank
	if(logic.getState() == stateBank) {
		questionBank.draw();
	} // end of if
	
	// display question
	if(logic.getState() == stateQuestion) {
		questionAnswer.drawQuestion();
	} // end of if
	
	// display answer
	if(logic.getState() == stateAnswer) {
		questionAnswer.drawAnswer();
	} // end of if
} // end of animate

// add questions
function addQuestion() {
	// placement variable
	var min = Math.min(canvas.width, canvas.height) / 2;
	var x = canvas.width / 2;
	var y = canvas.height / 2;
	
	var start = {x:x - min, y:y - min * topMargin};
	var end = {x:x + min, y:y + min * bottomMargin};
	var width = end.x - start.x;
	var height = end.y - start.y;
	
	var textStart = undefined;
	var textEnd = undefined;
	
	// working text box
	var workingTextBox = undefined
	// using global question box
	
	for(var outter = 0; outter < input.length; outter++) {
		for(var inner = 0; inner < input[outter].length; inner++) {
			// calculate start and end points
			textStart = {x:start.x + (outter / input.length) * width + buffer,
									 y:start.y + (inner / input[outter].length) * height + buffer};
			textEnd = {x:end.x - (input.length - 1 - outter) / input.length * width - buffer,
								 y:end.y - (input[outter].length - 1 - inner) / (input[outter].length) * height - buffer}
			
			if(!inner) {
				// create new text object
				workingTextBox = new TextBox(textStart, textEnd, highlightColor, input[outter][0]);
				// add text box to columns
				questionBank.addTopic(workingTextBox);
			} // end of if
			else {
				// create new text object
				workingTextBox = new TextBox(textStart, textEnd, textColor, inner * 100);
				// create new question object
				questionBox = new QuestionBox(workingTextBox, input[outter][inner].question, input[outter][inner].answer, inner * 100)
				// add question object to question bank
				questionBank.addQuestion(outter, questionBox);
			} // end of else
		} // end of inner for
	} // end of outter for
} // end of add question

// add score box
function addScoreBox() {
	// placement variable
	var min = Math.min(canvas.width, canvas.height) / 2;
	var x = canvas.width / 2;
	var y = canvas.height / 2;
	
	var start = {x:x - min, y:y - min};
	var end = {x:x + min, y:y + min};
	var width = end.x - start.x;
	var height = end.y - start.y;
	
	var textStart = undefined;
	var textEnd = undefined;
	
	// working text box
	var workingTextBox = undefined
	
	// create new text object
	workingTextBox = new TextBox({x:0, y:0}, {x:0, y:0}, textColor, 0);
	// push score box
	score.addScoreBox(workingTextBox);
	
	// note: possible to convert into two for loops
	
	// calculate start and end points
	textStart = {x:start.x, y:start.y}
	textEnd = {x:start.x + width / 2, y:start.y  + height * (1 - topMargin) / 2}
	// create new text object
	workingTextBox = new TextBox(textStart, textEnd, textColor, playerName[1] + 0);
	// push score box
	score.addScoreBox(workingTextBox);
	
	// calculate start and end points
	textStart = {x:end.x - width / 2, y:start.y}
	textEnd = {x:end.x, y:start.y  + height * (1 - topMargin) / 2}
	// create new text object
	workingTextBox = new TextBox(textStart, textEnd, textColor, playerName[2] + 0);
	// push score box
	score.addScoreBox(workingTextBox);
	
	// calculate start and end points
	textStart = {x:start.x, y:end.y - height * (1 - bottomMargin) / 2}
	textEnd = {x:start.x + width / 2, y:end.y}
	// create new text object
	workingTextBox = new TextBox(textStart, textEnd, textColor, playerName[3] + 0);
	// push score box
	score.addScoreBox(workingTextBox);
	
	// calculate start and end points
	textStart = {x:end.x - width / 2, y:end.y - height * (1 - bottomMargin) / 2}
	textEnd = {x:end.x, y:end.y}
	// create new text object
	workingTextBox = new TextBox(textStart, textEnd, textColor, playerName[4] + 0);
	// push score box
	score.addScoreBox(workingTextBox);
} // end of add question

// check
function check(location) { 
	// check if question got clicked
	if(questionBox = questionBank.check(location)) {
		// update logic state
		logic.setState(stateQuestion);
		// create question answer object
		questionAnswer = new QuestionAnswer(questionBox.getQA());
	} // end of if
} // end of check

// update bank size
function resizeBank() {
	// placement variable
	var min = Math.min(canvas.width, canvas.height) / 2;
	var x = canvas.width / 2;
	var y = canvas.height / 2;
	
	var start = {x:x - min, y:y - min * topMargin};
	var end = {x:x + min, y:y + min * bottomMargin};
	var width = end.x - start.x;
	var height = end.y - start.y;
	
	var textStart = undefined;
	var textEnd = undefined;
	
	// update topic and question size
	for(var outter = 0; outter < input.length; outter++) {
		for(var inner = 0; inner < input[outter].length; inner++) {
			// calculate start and end points
			textStart = {x:start.x + (outter / input.length) * width + buffer,
									 y:start.y + (inner / input[outter].length) * height + buffer};
			textEnd = {x:end.x - (input.length - 1 - outter) / input.length * width - buffer,
								 y:end.y - (input[outter].length - 1 - inner) / (input[outter].length) * height - buffer}
			
			if(!inner) {
				// update column size
				questionBank.resizeTopic(outter, textStart, textEnd);
			} // end of if
			else {
				// update bank size
				questionBank.resizeBank(outter, inner - 1, textStart, textEnd);
			} // end of else
		} // end of inner for
	} // end of outter for
} // end of add question

// add score box
function resizeScore() {
	// placement variable
	var min = Math.min(canvas.width, canvas.height) / 2;
	var x = canvas.width / 2;
	var y = canvas.height / 2;
	
	var start = {x:x - min, y:y - min};
	var end = {x:x + min, y:y + min};
	var width = end.x - start.x;
	var height = end.y - start.y;
	
	var textStart = undefined;
	var textEnd = undefined;
	
	// note: possible to convert into two for loops
	
	// calculate start and end points
	textStart = {x:start.x, y:start.y}
	textEnd = {x:start.x + width / 2, y:start.y  + height *  (1 - bottomMargin) / 2}
	// update score size
	score.resize(1, textStart, textEnd);
	
	// calculate start and end points
	textStart = {x:end.x - width / 2, y:start.y}
	textEnd = {x:end.x, y:start.y  + height *  (1 - bottomMargin) / 2}
	// update score size
	score.resize(2, textStart, textEnd);
	
	// calculate start and end points
	textStart = {x:start.x, y:end.y - height *  (1 - bottomMargin) / 2}
	textEnd = {x:start.x + width / 2, y:end.y}
	// update score size
	score.resize(3, textStart, textEnd);
	
	// calculate start and end points
	textStart = {x:end.x - width / 2, y:end.y - height *  (1 - bottomMargin) / 2}
	textEnd = {x:end.x, y:end.y}
	// update score size
	score.resize(4, textStart, textEnd);
} // end of add question


/* EVENT ******************************************************** */


window.addEventListener('click', function(event) {	
	// check question bank
	if(logic.getState() == stateBank) {
		check({x:event.x, y:event.y});
	} // end of if
	
	// return to question bank
	if(logic.getState() == stateAnswer) {
		logic.setState(stateBank);
	} // end of if
}) // end of mouse event listener */

window.addEventListener('touchstart', function(event) {
	// check question bank
	if(logic.getState() == stateBank) {
		check({x:event.touches[0].clientX, y:event.touches[0].clientY});
	} // end of if
	
	// return to question bank
	if(logic.getState() == stateAnswer) {
		logic.setState(stateBank);
	} // end of if
}) // end of mouse event listener */

window.addEventListener('resize', function() {
	init();
	resizeBank();
	resizeScore();
}) // end of resize event listener

window.addEventListener('keydown', function(event) {
	// check key map
	if(!keyMap.has(event.key)) {
		return;
	} // end of if
	
	// get key state
	var keyState =  keyMap.get(event.key);
	
	// focus player
	if(logic.getState() == stateQuestion && !logic.getPlayer() && keyState.isPlayer) {
		logic.setPlayer(keyState.player);
	} // end of if
	
	// score question
	if(logic.getState() == stateQuestion && keyState.isAnswer) {
		// update logic state
		logic.setState(stateAnswer);
		
		// check answer
		if(keyState.answer) {
			score.updateScore(logic.getPlayer(), questionBox.getScore());
		} // end of if
		
		// incorrect answer
		else {
			score.updateScore(logic.getPlayer(), -questionBox.getScore());
		} // end of else
		
		// reset player
		logic.setPlayer(0);
	} // end of if
	
	// continue to question bank
	if(logic.getState() == stateAnswer && keyState.continue) {
		logic.setState(stateBank);
	} // end of if
	
	// reset current player
	if(keyState.reset) {
		 logic.setPlayer(0);
	} // end of if
}) // end of keydown event listener


/* START UP ***************************************************** */


init();
addQuestion();
addScoreBox();
animate();