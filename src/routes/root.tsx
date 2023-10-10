import { Outlet, Link } from "react-router-dom";
import DisplayAds from '../components/DisplayAds';
import Icon from '../components/Icon';
import LogoPng from '../assets/logo.png';

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

export default function Root() {

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
  ];

  return (
    <div className="h-screen w-screen max-h-screen max-w-screen inline-flex flex-col">
      <div className="inline-flex flex-col sm:flex-row grow overflow-auto">

        {/* MENU */}
        <div className="px-3 bg-gray-100 py-1 min-w-[240px] min-h-[100px] max-h-[30%] sm:w-[240px] sm:max-h-full sm:text-center border-b border-b-gray-200 sm:border-r sm:border-r-gray-200 overflow-y-auto overflow-x-hidden">
          <Link className="inline-block select-none" to="/">
            <img className="hidden sm:block" src={LogoPng} width={120} height={120} alt="Hand Tools" />
            <h1 className="block sm:hidden text-black">Hand Tools</h1>
          </Link>
          <ul className="m-0 p-1 inline-flex flex-wrap sm:block sm:flex-nowrap">
            {
              menu.map((m, i) => (
                <li key={`menu-${i}`} className="text-center p-1 sm:p-0"><Link className="flex items-center justify-center" to={m.path}>{m.icon && (<Icon className="!text-lg !leading-0">{m.icon}</Icon>)}{m.name}</Link></li>
              ))
            }
          </ul>
          <div className="my-3">
            <DisplayAds.FixedVertical1 />
          </div>
        </div>

        {/* CONTENT */}
        <div className="grow py-1 px-3 overflow-auto">
          <Outlet />
        </div>
      </div>

      {/* BOTTOM */}
      <p className="p-1.5 m-0 border-t">
        Go to <a href="https://github.com/bjtj" target="_blank" rel="noreferrer">Github</a>
      </p>
    </div>
  )
}
