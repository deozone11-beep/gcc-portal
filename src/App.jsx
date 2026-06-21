import { useState } from "react";
import LoginPage from "./pages/LoginPage.jsx";
import Layout from "./components/Layout.jsx";
import QrCode from "./pages/QrCode.jsx";
import PpaDetails from "./pages/PpaDetails.jsx";
import "./App.css";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState("qr");

  if (!loggedIn) {
    return <LoginPage onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} onLogout={() => setLoggedIn(false)}>
      {activePage === "qr" && <QrCode />}
      {activePage === "ppa" && <PpaDetails />}
    </Layout>
  );
}
