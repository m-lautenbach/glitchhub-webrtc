(function () {
  const socket = io();

  const messages = document.getElementById('messages');
  const form = document.getElementById('form');
  const message = document.getElementById('text');
  const username = document.getElementById('username');
  const warning = document.getElementById('warning');
  
  // focus on text input when page loads
  
  document.getElementById('text').focus();

  // form stuff

  form.onsubmit = function (e) {
    e.preventDefault();
    if (message.value.length > 20) {
      warning.innerHTML = 'Make sure your message is fewer than 20 characters!';
    } else {
      socket.emit('send', { chat: message.value });
      message.value = '';
      warning.innerHTML = '';
    }
    document.getElementById('text').focus();
  };


  // morse stuff

  const symbolMap = new Map([[' ', [' ']], ['A', ['•', '–']], ['B', ['–', '•', '•', '•']], ['C', ['–', '•', '–', '•']], ['D', ['–', '•', '•']], ['E', ['•']], ['F', ['•', '•', '–', '•']], ['G', ['–', '–', '•']], ['H', ['•', '•', '•', '•']], ['I', ['•', '•']], ['J', ['•', '–', '–', '–']], ['K', ['–', '•', '–']], ['L', ['•', '–', '•', '•']], ['M', ['–', '–']], ['N', ['–', '•']], ['O', ['–', '–', '–']], ['P', ['•', '–', '–', '•']], ['Q', ['–', '–', '•', '–']], ['R', ['•', '–', '•']], ['S', ['•', '•', '•']], ['T', ['–']], ['U', ['•', '•', '–']], ['V', ['•', '•', '•', '–']], ['W', ['•', '–', '–']], ['X', ['–', '•', '•', '–']], ['Y', ['–', '•', '–', '–']], ['Z', ['–', '–', '•', '•']], ['0', ['–', '–', '–', '–', '–']], ['1', ['•', '–', '–', '–', '–']], ['2', ['•', '•', '–', '–', '–']], ['3', ['•', '•', '•', '–', '–']], ['4', ['•', '•', '•', '•', '–']], ['5', ['•', '•', '•', '•', '•']], ['6', ['–', '•', '•', '•', '•']], ['7', ['–', '–', '•', '•', '•']], ['8', ['–', '–', '–', '•', '•']], ['9', ['–', '–', '–', '–', '•']]]);

  function visualTranslate(message) {
    function digestedString(string) {
      string = string.toUpperCase();
      const regex = /[\w\d\s]/g;
      return string.match(regex);
    }

    digestedString = digestedString(message);

    function run(array) {
      for (letter of array) {
        for (const [key, value] of symbolMap) {
          if (letter === key) {
            newArray.push(value);
          }
        }
      }
    }

    let newArray = [];

    run(digestedString);

    const joinedArray = [];

    function join(array) {
      for (each of array) {
        const string = each.join(' ');
        joinedArray.push(string);
      }
    }

    join(newArray);

    const output = joinedArray.join(' ');

    return output;
  }

  function audioTranslate(message, pitch) {
    const audioCtx = new AudioContext();
    gainNode = audioCtx.createGain();
    osc = audioCtx.createOscillator();
    osc.connect(gainNode);

    function digestedString(string) {
      string = string.toUpperCase();
      const regex = /[\w\d\s]/g;
      return string.match(regex);
    }

    digestedString = digestedString(message);

    function run(array) {
      for (letter of array) {
        for (const [key, value] of symbolMap) {
          if (letter === key) {
            newArray.push(value);
          }
        }
      }
    }

    let newArray = [];

    run(digestedString);

    const joinedArray = [];

    function join(array) {
      for (each of array) {
        const string = each.join('+');
        joinedArray.push(string);
      }
    }

    join(newArray);

    let output = joinedArray.join('/');

    const audioArray = ['gainNode.gain.value = 1.0'];

    // keep track of the total time value
    let timeValue = 0;

    output = output.split('');

    function toAudio(array) {
      for (const string of array) {
        if (string === '•') {
          timeValue += 0.1;
          audioArray.push(`gainNode.gain.setValueAtTime(0, audioCtx.currentTime + ${timeValue})`);
        } else if (string === '–') {
          timeValue += 0.3;
          audioArray.push(`gainNode.gain.setValueAtTime(0, audioCtx.currentTime + ${timeValue})`);
        } else if (string === '+') {
          timeValue += 0.1;
          audioArray.push(`gainNode.gain.setValueAtTime(1, audioCtx.currentTime + ${timeValue})`);
        } else if (string === 'wordPause') {
          timeValue += wordPause;
          audioArray.push(`gainNode.gain.setValueAtTime(1, audioCtx.currentTime + ${timeValue})`);
        } else if (string === '/') {
          timeValue += 0.3;
          audioArray.push(`gainNode.gain.setValueAtTime(1, audioCtx.currentTime + ${timeValue})`);
        }
      }
    }

    toAudio(output);

    function runStatements(statements) {
      statements.forEach((statement) => {
        return eval(statement);
      });
    }

    runStatements(audioArray);

    gainNode.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);
    osc.start(0);
    osc.stop(audioCtx.currentTime + timeValue);
  }

  // socket stuff

  socket.on('user joined', (msg) => {
    const newuser = document.createElement('li');
    newuser.innerHTML = `${msg.username} has joined! There are now ${msg.people} users in the room!`;
    messages.appendChild(newuser);
    username.innerText = `You are ${msg.username}`;
    getScrollin();
  });

  socket.on('user left', (msg) => {
    const newuser = document.createElement('li');
    newuser.innerHTML = `${msg.username} has left! There are now ${msg.people} users in the room!`;
    messages.appendChild(newuser);
    getScrollin();
  });

  socket.on('chat message', (msg) => {
    audioTranslate(msg.message, msg.pitch);
    const newli = document.createElement('li');
    const morse = `${msg.username  }: ${  visualTranslate(msg.message)}`;
    newli.innerText = morse;
    messages.appendChild(newli);
    getScrollin();
  });

  // chat scroll
  
  const getScrollin = function () {
    messages.scrollTop = messages.scrollHeight;
  };
}());
