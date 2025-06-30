import {
  createRoutesFromElements,
  createHashRouter,
  RouterProvider,
  Route,
} from 'react-router';

import Root, {
  loader as rootLoader,
  action as rootAction,
} from "./routes/root";
import ErrorPage from "./error-page";
import Start from "./routes/Start";
import UrlEncoder from "./routes/UrlEncoder";
import XmlParser from "./routes/XmlParser";
import Keycode from "./routes/Keycode";
import FileBase64 from "./routes/FileBase64";
import ImageInfo from "./routes/ImageInfo";
import WebCam from './routes/Webcam';
import Json from './routes/Json';
import Datetime from './routes/Datetime';
import Markdown from './routes/Markdown';
import Fetch from './routes/Fetch';
import Compare from './routes/Compare';
import Ffmpeg from './routes/Ffmpeg';
import Ascii from './routes/Ascii';
import Text from './routes/Text';
import Random from './routes/Random';

const router = createHashRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={<Root />}
      loader={rootLoader}
      action={rootAction}
      errorElement={<ErrorPage />}
    >
      <Route errorElement={<ErrorPage />}>
        <Route index element={<Start />} />
        <Route path="urlencoder" element={<UrlEncoder />} />
        <Route path="xmlparser" element={<XmlParser />} />
        <Route path="keycode" element={<Keycode />} />
        <Route path="filebase64" element={<FileBase64 />} />
        <Route path="imageinfo" element={<ImageInfo />} />
        <Route path="webcam" element={<WebCam />} />
        <Route path="json" element={<Json />} />
        <Route path="datetime" element={<Datetime />} />
        <Route path="markdown" element={<Markdown />} />
        <Route path="fetch" element={<Fetch />} />
        <Route path="compare" element={<Compare />} />
        <Route path="ffmpeg" element={<Ffmpeg />} />
        <Route path="ascii" element={<Ascii />} />
        <Route path="text" element={<Text />} />
        <Route path="random" element={<Random />} />

      </Route>
    </Route>
  )
);

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
