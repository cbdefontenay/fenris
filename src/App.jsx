import "./App.css";
import {ThemeProvider} from "./data/ThemeProvider.jsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import HomePage from "./page/HomePage.jsx";
import SettingPage from "./page/SettingPage.jsx";
import NavBarComponent from "./components/NavBarComponent.jsx";
import {ShellProvider} from "./context/ShellContext.jsx";
import ShellPopup from "./components/ShellPopup.jsx";
import JsonUrlFormatPage from "./page/JsonUrlFormatPage.jsx";

function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <ShellProvider>
                    <Routes>
                        <Route path="/" element={<NavBarComponent/>}>
                            <Route index element={<HomePage/>}/>
                            <Route path="home" element={<HomePage/>}/>
                            <Route path="json" element={<JsonUrlFormatPage/>}/>
                            <Route path="settings" element={<SettingPage/>}/>
                        </Route>
                    </Routes>
                    <ShellPopup/>
                </ShellProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;