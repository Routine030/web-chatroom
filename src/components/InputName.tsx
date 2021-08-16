import React from 'react';
import { UsernameContext } from '../UsernameContext';

export default class InputName extends React.Component {
    static contextType = UsernameContext;

    submitValue = () => {
      this.context.setToserver(true);
    }

    render() {
      return(
        <div>
            <input type='text' value={this.context.username} id='inputNmae' onChange={e => this.context.setUsername(e.currentTarget.value)}/>
            <input type='button' value='進入聊天室' onClick={this.submitValue}/>
        </div>
      )
    }
}