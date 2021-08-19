import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import io, { Socket } from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.css';
import { MsgInfo, UserInfo } from './chat_repository';

function App() {
    const [ws, setWs] = useState<Socket|null>(null);
    const [sysmsg, setSysmsg] = useState('Please enter your name');
    const [username, setUsername] = useState('');
    const [passLogin, setPassLogin] = useState(false);
    const [toserver, setToserver] = useState(false);
    const [allUsers, setAllUsers] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [privateTo, setPrivateTo] = useState('');
    const [allMessages, setAllMessages] = useState<Pick<MsgInfo, 'user'|'msg'|'action'>[]>([]);

    useEffect(() => {
        if (toserver) {
          setWs(io('http://localhost:3000'));
        }
    }, [toserver])

    useEffect(() => {
        if (ws) {
            ws.emit('setUsername', {user: username}, () => {});

            ws.on('setSuccess', (ret) => {
                setPassLogin(ret);
                setSysmsg('hello, '+ username);
                ws.emit('getAllUser',() => {});
            })

            ws.on('setFail', (ret) => {
                setUsername('');
                setPassLogin(ret);
                setToserver(ret);
                setSysmsg('exist name, pls retry other name');
            })

            ws.on('getUserList', (userlist: UserInfo[]) => {
                const newList = userlist.map(item => item.user); 
                setAllUsers(allUsers=>[...allUsers,...newList]);
            })
        }

        getPublicMessages();
        getPrivateMessage();
        updateUsers();
        userLeave();
    },[ws])

    const getPublicMessages = () => {
        if (ws) {
            ws.on('all', (message: Pick<MsgInfo, 'user'|'msg'>) => {
                const newMessage = {...message, action: ''};
                setAllMessages(allMessages => [...allMessages, newMessage]);
            })
        }
    }

    const getPrivateMessage = () => {
        if (ws) {
            ws.on('privateTo', (message: MsgInfo) => {
                setAllMessages(allMessages => [...allMessages, message]);
            })
        }
    }

    const updateUsers = () => {
        if (ws) {
            ws.on('updateUser', (name: string) => {
                setAllUsers(allUsers=>[...allUsers,name]);
            })
        }
    }

    const userLeave = () => {
        if (ws) {
            ws.on('someoneLeave', (name: string) => {
                setAllUsers(prevActions => (
                    prevActions.filter((value, i) => i !== prevActions.indexOf(name))
                ));
            })
        }
    }

    const postMessage = (privateTo:string|null) => {
        let msg :Omit<MsgInfo,'id'> = {user:username, msg:message, to:'all', action:''};

        if (privateTo) {
            msg.to = 'other';
            msg.action = privateTo;
        }

        if (ws) {
            ws.emit('postMessage', msg, () => {});
            setMessage('');
        }
    }

    const selectUser = (user: string) =>{
        if (user == username) { return; }
        setPrivateTo(user);
    }

    const cancelPrivate = () =>{
        setPrivateTo('');
    }

  return (
    <div>
      <div className='container-fluid'>
        <div className='row'>
          <div className='col-sm-4'>
            {sysmsg}
            {passLogin && (
              <div>
                <div>Online Users:</div>
                <div>
                  {
                    allUsers.map(
                      (user,index) => <div key={index} onMouseDown={e => selectUser(user)}>{user}</div>
                    )
                  }
                </div>
              </div>
            )}
          </div>
          <div className='col-sm-8'>
            {passLogin && (
              <div>                   
                <div>
                  {
                    allMessages.map((msg, index) => 
                      <div key={index}>{msg.user}{msg.action != '' && '偷偷對' + msg.action}說 : {msg.msg}
                      </div>
                    )
                  }
                </div>
                <div>
                  <input type='text' value={message} id='text' onChange={e => setMessage(e.currentTarget.value)}/>
                  <input type='button' value='送出' onClick={() => postMessage(privateTo)} />
                  {privateTo && (
                    <div>只給{privateTo}<input type='button' value='取消指定' onClick={() => cancelPrivate()} /></div>
                  )}
                </div>
              </div>
            )}
            {!passLogin && (
              <div>
              <input type='text' value={username} id='inputNmae' onChange={e => setUsername(e.currentTarget.value)}/>
              <input type='button' value='進入聊天室' onClick={() => setToserver(true)}/>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
