import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router";
import Icon from '../components/Icon';
import LogoPng from '../assets/logo.png';
import LogoWhitePng from '../assets/logo_white.png';
import GithubPng from '../assets/github.png';
import GithubDarkmode from '../assets/github-darkmode.svg';
import { useTheme } from '../ThemeProvider';
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

type SideBarProps = {
  closeSideBar: () => void;
} & React.HTMLAttributes<HTMLDivElement>;

function SideBar({closeSideBar} : SideBarProps) {

  const location = useLocation();

  return (
    <div className="drawer-side">
      <div aria-label="close sidebar" className="drawer-overlay" onClick={closeSideBar}></div>

      <div className="bg-base-200 w-60 max-w-[95%] min-h-full text-center">
        <Link
          className="inline-block select-none max-w-[50%] flex justify-center items-center"
          to="/"
          onClick={closeSideBar}>
          <img
            className="min-w-[30px] w-[60px] sm:w-[120px] block dark:hidden"
            src={LogoPng}
            alt="HandTools" />
          <img
            className="min-w-[30px] w-[60px] sm:w-[120px] hidden dark:block"
            src={LogoWhitePng}
            alt="HandTools" />
        </Link>

        <ul
          className="menu">
          {
            menu.map((m, i) => (
              <li
                key={`menu-${i}`}
                className="text-center p-0 whitespace-nowrap">
                <Link
                  className={`flex items-cente justify-start px-1 ${location.pathname === m.path && 'font-bold text-red-600 hover:text-red-900'}`}
                  to={m.path}
                  onClick={closeSideBar}>
                  {m.icon && (<Icon className="!text-lg !leading-0">{m.icon}</Icon>)}{m.name}
                </Link>
              </li>
            ))
          }
        </ul>
      </div>
    </div>);
}

export default function Root() {

  const [openSide, setOpenSide] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <div className="drawer sm:drawer-open">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle"
          checked={openSide}
          onChange={e => setOpenSide(e.target.checked)}
        />
        
        <div className={`drawer-content min-h-screen`}>
          {/* Content */}
          <Outlet />
          <label
            htmlFor="my-drawer-3"
            className="btn btn-xs drawer-button fixed left-0.5 top-0.5 opacity-90">
            <Icon>menu</Icon>
          </label>
        </div>
        <SideBar closeSideBar={() => setOpenSide(false)} />
      </div>

      {/* top right */}
      <div className="fixed right-1 top-1 flex items-center gap-1 opacity-80">
        <label className={`swap swap-flip btn btn-soft btn-xs btn-circle`}>
          <input type="checkbox" value={theme} onChange={toggleTheme} />
          <Icon className="swap-off dark:hidden !text-lg !leading-0">light_mode</Icon>
          <Icon className="swap-on dark:block !text-lg !leading-0">dark_mode</Icon>
        </label>
        
        <a href="https://github.com/bjtj"
          className="btn btn-soft btn-xs btn-circle"
          target="_blank"
          rel="noreferrer noopener">
          <img className="block dark:hidden" src={GithubPng} width={16} height={16} alt="Github" />
          <img className="hidden dark:block" src={GithubDarkmode} width={16} height={16} alt="Github" />
        </a>
      </div>

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
    path: '/datetime',
    name: 'Datetime'
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
    path: '/compare',
    name: 'Compare'
  },
  {
    path: '/random',
    name: 'Random'
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
    path: '/ffmpeg',
    name: 'FFmpeg.wasm'
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
    path: '/markdown',
    name: 'Markdown'
  },
  {
    path: '/fetch',
    name: 'Fetch'
  },
  // {
  //   path: '/timer',
  //   name: 'Timer'
  // },
  {
    path: '/hiccup',
    name: 'Hiccup'
  },
  {
    path: '/youtube',
    name: 'YouTube'
  },
];
