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
      path: '/xmlparser',
      name: 'XML Parser'
    },
    {
      path: '/keycode',
      name: 'Keycode'
    }
  ];

  return (
    <div className="h-screen flex flex-col">
      <div className="flex grow">
        <div className="px-3 py-1 border-r bg-gray-100 min-w-[240px] flex flex-col items-center">
          <Link to="/">
            <img src={LogoPng} width={120} height={120} />
          </Link>
          <ul className="m-0 p-1">
            {
              menu.map((m, i) => (
                <li key={`menu-${i}`} className="text-center"><Link to={m.path}>{m.name}</Link></li>
              ))
            }
          </ul>
          <div className="border my-3 ">
            <DisplayAds.FixedVertical1 />
          </div>
        </div>
        <div className="grow py-1 px-3">
          <Outlet />
        </div>
      </div>
      <p className="p-1.5 m-0 border-t">
        Go to <a href="https://github.com/bjtj" target="_blank" rel="noreferrer">Github</a>
      </p>
    </div>
  )
}
