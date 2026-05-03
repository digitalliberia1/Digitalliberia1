import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/context/ThemeContext";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import ServicesHub from "@/pages/ServicesHub";
import ServiceDetail from "@/pages/ServiceDetail";
import "@/App.css";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="dl-root" data-testid="app-root">
          <Nav />

          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<ServicesHub />} />
              <Route path="/services/:slug" element={<ServiceDetail />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </main>

          <Footer />

          <Toaster
            position="bottom-right"
            theme="system"
            toastOptions={{
              style: {
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: "14px",
              },
            }}
          />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;