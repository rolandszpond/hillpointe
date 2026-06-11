import { Routes, Route, Navigate } from "react-router-dom";
import { ProspectList } from "./pages/ProspectList";
import { ProspectDetail } from "./pages/ProspectDetail";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Routes>
        <Route path="/" element={<Navigate to="/prospects" replace />} />
        <Route path="/prospects" element={<ProspectList />} />
        <Route path="/prospects/:id" element={<ProspectDetail />} />
      </Routes>
    </div>
  );
}
