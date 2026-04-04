import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import LoadingScreen from "./components/LoadingScreen";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //Simulate a delay to represent loading time
    const timer = setTimeout(() => setLoading(false), 3000); // Adjust the delay as needed
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <div className="w-full flex">
        {loading ? (
          <LoadingScreen />
        ) : (
          <main className="grow">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
        )}
        <ToastContainer
          position="top-left"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;
