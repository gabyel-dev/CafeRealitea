import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./routes/Login";
import Sample from ".//routes/Dashboard/Sample"

const App = () => {
  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={<Login />} 
        />

      <Route 
          path="/dashboard" 
          element={<Sample />} 
        />
      </Routes>
    </Router>
  )
}

export default App
