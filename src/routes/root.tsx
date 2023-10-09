import { Outlet, Link } from "react-router-dom";
import DisplayAds from '../components/DisplayAds';
import LogoPng from '../assets/logo.png';

export async function loader() {
  return {};
}

export async function action() {
  return {};
}

export default function Root() {

  const menu = [
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
        <div className="px-3 py-1 min-w-[240px] min-h-[240px] max-h-[30%] sm:w-[240px] sm:max-h-full sm:text-center border-b border-b-gray-100 sm:border-r sm:border-r-gray-100 overflow-y-auto overflow-x-hidden">
          <Link className="inline-block select-none" to="/">
            <img className="" src={LogoPng} width={120} height={120} alt="Hand Tools" />
          </Link>
          <ul className="m-0 p-1 inline-flex flex-wrap sm:block sm:flex-nowrap">
            {
              menu.map((m, i) => (
                <li key={`menu-${i}`} className="text-center p-1 sm:p-0"><Link to={m.path}>{m.name}</Link></li>
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
