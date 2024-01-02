import React, { useState, useEffect } from 'react';
import useStore from '@store/store';
import i18n from './i18n';

import Chat from '@components/Chat';
import Menu from '@components/Menu';
import useInitialiseNewChat from '@hooks/useInitialiseNewChat';
import { ChatInterface } from '@type/chat';
import { Theme } from '@type/theme';
import ApiPopup from '@components/ApiPopup';
import Toast from '@components/Toast';
import './main.css'; // 确保引入CSS文件

function App() {
  const initialiseNewChat = useInitialiseNewChat();
  const setChats = useStore((state) => state.setChats);
  const setTheme = useStore((state) => state.setTheme);
  const setApiKey = useStore((state) => state.setApiKey);
  const setCurrentChatIndex = useStore((state) => state.setCurrentChatIndex);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(true); // 默认显示密码模态框

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    i18n.on('languageChanged', (lng) => {
      document.documentElement.lang = lng;
    });
  }, []);

  useEffect(() => {
    const oldChats = localStorage.getItem('chats');
    const apiKey = localStorage.getItem('apiKey');
    const theme = localStorage.getItem('theme');

    if (apiKey) {
      setApiKey(apiKey);
      localStorage.removeItem('apiKey');
    }

    if (theme) {
      setTheme(theme as Theme);
      localStorage.removeItem('theme');
    }

    if (oldChats) {
      try {
        const chats: ChatInterface[] = JSON.parse(oldChats);
        if (chats.length > 0) {
          setChats(chats);
          setCurrentChatIndex(0);
        } else {
          initialiseNewChat();
        }
      } catch (e) {
        console.log(e);
        initialiseNewChat();
      }
      localStorage.removeItem('chats');
    } else {
      const chats = useStore.getState().chats;
      const currentChatIndex = useStore.getState().currentChatIndex;
      if (!chats || chats.length === 0) {
        initialiseNewChat();
      }
      if (
        chats &&
        !(currentChatIndex >= 0 && currentChatIndex < chats.length)
      ) {
        setCurrentChatIndex(0);
      }
    }
  }, [initialiseNewChat, setApiKey, setChats, setCurrentChatIndex, setTheme]);

const handlePasswordSubmit = () => {
  // 添加的调试信息
  console.log("ENV Password:", process.env.REACT_APP_ACCESS_PASSWORD);
  console.log("Entered Password:", password);

  // 检查环境变量是否存在
  const envPassword = process.env.REACT_APP_ACCESS_PASSWORD;

  // 如果环境变量不存在或者密码匹配，则认证成功
  if (!envPassword || password === envPassword) {
    setIsAuthenticated(true);
    setShowPasswordModal(false);
  } else {
    alert('Incorrect password');
  }
};


  return (
    <div className='overflow-hidden w-full h-full relative'>
      {!isAuthenticated && (
        <button onClick={() => setShowPasswordModal(true)} className="modal-btn">
          Enter Password
        </button>
      )}

      {showPasswordModal && !isAuthenticated && (
        <div className="password-modal-container">
          <div className="password-modal">
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
            <button onClick={handlePasswordSubmit}>Submit</button>
            <button onClick={() => setShowPasswordModal(false)}>Close</button>
          </div>
        </div>
      )}

      {isAuthenticated && (
        <>
          <Menu />
          <Chat />
          <ApiPopup />
          <Toast />
        </>
      )}
    </div>
  );
}

export default App;
