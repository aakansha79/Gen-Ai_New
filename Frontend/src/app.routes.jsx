import { createBrowserRouter } from "react-router-dom";
import Login from "./features/auth/pages/Login.jsx";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/component/Protected"
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/InterviewPage.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Protected><Home /> </Protected> 
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/interview/:interviewId",
    element: <Protected><Interview /></Protected>
  }
]);
