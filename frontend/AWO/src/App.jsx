import {BrowserRouter, Route, Routes} from "react-router-dom";
import './App.css'
import Register from './pages/Register'
import { Toaster } from 'sonner';
function App() {
 return (
  <>

  <Register/>
<Toaster/>
  </>
)
}

export default App
