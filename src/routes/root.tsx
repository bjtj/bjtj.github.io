import { useState } from 'react';
import { Outlet, Link, useLocation } from "react-router-dom";
import DisplayAds from '../components/DisplayAds';
import Icon from '../components/Icon';
import Button from '../components/Button';
import LogoPng from '../assets/logo.png';
import GithubPng from '../assets/github.png';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export async function loader() {
  return {};
}

export async function action() {
  return {};
}

type MenuItem = {
  path: string;
  icon?: string;
  name: string;
};

const test_ad_vertical = false;

export default function Root() {

  const location = useLocation();
  const [showMenu, setShowMenu] = useState<boolean>(false);

  return (
    <div className="h-screen w-screen max-h-screen max-w-screen inline-flex flex-col">

      <Button
        className="fixed bottom-0 left-1 z-50 sm:hidden opacity-50 hover:opacity-100 active:opacity-100"
        icon="menu"
        onClick={() => setShowMenu(!showMenu)}
      />
      
      <div
        className={`inline-flex flex-row grow overflow-auto`}>

        {/* MENU */}
        <div
          className={`z-50 fixed inset-0 bg-black/50 sm:static sm:w-[200px] ${showMenu ? '' : 'hidden sm:block'}`}
          onClick={() => setShowMenu(false)}
        >
          <div
            className={`flex items-center flex-col bg-gray-100 py-1 w-[200px] max-w-[90%] sm:max-w-full h-full text-center border-r border-r-1 border-r-gray-200 overflow-y-auto overflow-x-hidden ${showMenu ? '' : 'hidden sm:flex'}`}>
            <Link
              className="inline-block select-none max-w-[50%] flex justify-center items-center" to="/">
              <img
                className=" min-w-[30px] w-[60px] sm:w-[120px]" src={LogoPng} alt="HandTools" />
            </Link>
            <div
              className="overflow-x-hidden overflow-y-auto h-full w-full">
              <ul
                className="m-0 p-0 block flex-nowrap">
                {
                  menu.map((m, i) => (
                    <li
                      key={`menu-${i}`}
                      className="text-center p-0 whitespace-nowrap">
                      <Link
                        className={`flex items-cente justify-start px-1 ${location.pathname === m.path && 'font-bold text-red-600 hover:text-red-900'}`}
                        to={m.path}>
                        {m.icon && (<Icon className="!text-lg !leading-0">{m.icon}</Icon>)}{m.name}
                      </Link>
                    </li>
                  ))
                }
              </ul>

              { location.pathname !== '/' && (
                  <div
                    className={`mx-auto my-3 block ${test_ad_vertical && 'w-[140px] h-[480px] border'}`}>
                    <DisplayAds.FixedVertical1 />
                  </div>)}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div
          className={`grow flex-1 py-0 px-1 pb-7 sm:pb-0 overflow-x-hidden w-full h-full`}>
          <Outlet />
        </div>
      </div>

      {/* BOTTOM */}
      <p className="p-1.5 m-0 border-t hidden sm:block">
        <a href="https://github.com/bjtj" target="_blank" rel="noreferrer"><img className="inline-block mr-1" src={GithubPng} width={20} height={20} alt="Github" />Github</a>
      </p>

      <ToastContainer />
    </div>
  )
}


const menu: MenuItem[] = [
    {
      path: '/',
      name: 'Home'
    },
    {
      path: '/urlencoder',
      name: 'URL Encoder/Decoder'
    },
    {
      path: '/keycode',
      name: 'Keycode'
    },
    {
      path: '/filebase64',
      name: 'File -> Base64'
    },
    {
      path: '/imageinfo',
      name: 'Image Info'
    },
    {
      path: '/webcam',
      icon: 'videocam',
      name: 'Webcam'
    },
    {
      path: '/json',
      name: 'Json'
    },
    {
      path: '/datetime',
      name: 'Datetime'
    },
    {
      path: '/markdown',
      name: 'Markdown'
    },
    {
      path: '/fetch',
      name: 'Fetch'
    },
    {
      path: '/compare',
      name: 'Compare'
    },
    {
      path: '/ffmpeg',
      name: 'FFMPEG'
    },
    {
      path: '/ascii',
      name: 'ASCII'
    },
    {
      path: '/text',
      name: 'Text'
    },
    {
      path: '/random',
      name: 'Random'
    },
];
