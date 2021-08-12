import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import io from "socket.io-client";

function App() {
  const [message, setMessage] = useState("");

  const ws = io('http://localhost:3000');

  useEffect(()=> {
//    console.log('success connect!')
    ws.on('toUser', (message: string) => {
      setMessage(message);
     })
  })

  const sayHi = () => {
      ws.emit('sayHi','hi')
  }

  return (
    <div>
      <div>
      {message}
      </div>
      <input type='button' value='say hi' onClick={sayHi} />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
