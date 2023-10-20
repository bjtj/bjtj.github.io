import React from "react";
import ReactDOM from "react-dom/client";
import {
  createRoutesFromElements,
  createHashRouter,
  RouterProvider,
  Route,
} from "react-router-dom";
import "./index.css";

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

import reportWebVitals from "./reportWebVitals";
import "material-icons/iconfont/material-icons.css";

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

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
