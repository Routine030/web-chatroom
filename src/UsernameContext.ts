import { createContext, useContext } from 'react';

export type UsernameContextType = {
    username: string,
    setUsername: React.Dispatch<React.SetStateAction<string>>,
    passLogin: boolean,
    setPassLogin: React.Dispatch<React.SetStateAction<boolean>>,
    toserver: boolean,
    setToserver: React.Dispatch<React.SetStateAction<boolean>>
}

export const UsernameContext = createContext<UsernameContextType>({username:'',
                                                                    setUsername: username=> {},
                                                                    passLogin:false,
                                                                    setPassLogin: passLogin=> {},
                                                                    toserver:false,
                                                                    setToserver:toserver =>{}});

export const Username = () => useContext(UsernameContext);