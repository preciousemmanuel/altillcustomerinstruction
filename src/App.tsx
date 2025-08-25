import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import { ToastContainer } from "react-toastify";

import "./App.css";
import { store } from "./store";
import AppRoutes from "./pages/Routes";
import AppHeader from "./components/appHeader/AppHeader";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ToastContainer />
        <AppHeader />
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
