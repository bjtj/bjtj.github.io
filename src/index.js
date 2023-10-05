import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createRoutesFromElements,
  createBrowserRouter,
  createHashRouter,
  RouterProvider,
  Route,
} from "react-router-dom";
import './index.css';

import Root, { loader as rootLoader, action as rootAction } from "./routes/root";
import ErrorPage from "./error-page";
import Start from './routes/Start';
import UrlEncoder from './routes/UrlEncoder';
import XmlParser from './routes/XmlParser';

import reportWebVitals from './reportWebVitals';
import 'material-icons/iconfont/material-icons.css';


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
        <Route
          path="urlencoder"
          element={<UrlEncoder />}
        />
        <Route
          path="xmlparser"
          element={<XmlParser />}
        />
      </Route>
    </Route>
  )
);


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
