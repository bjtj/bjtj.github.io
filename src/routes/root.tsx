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
    /* {
     *   path: '/xmlparser',
     *   name: 'XML Parser'
     * }, */
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
  ];

  return (
    <div className="h-screen w-screen inline-flex flex-col">
      <div className="inline-flex grow">
        <div className="px-3 py-1 border-r bg-gray-100 min-w-[240px] text-center">
          <Link className="inline-block" to="/">
            <img className="text-center" src={LogoPng} width={120} height={120} alt="Hand Tools" />
          </Link>
          <ul className="m-0 p-1">
            {
              menu.map((m, i) => (
                <li key={`menu-${i}`} className="text-center"><Link to={m.path}>{m.name}</Link></li>
              ))
            }
          </ul>
          <div className="my-3">
            <DisplayAds.FixedVertical1 />
          </div>
        </div>
        <div className="grow py-1 px-3 overflow-auto">
          <Outlet />
        </div>
      </div>
      <p className="p-1.5 m-0 border-t">
        Go to <a href="https://github.com/bjtj" target="_blank" rel="noreferrer">Github</a>
      </p>
    </div>
  )
}
