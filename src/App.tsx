import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Workshop from '@/pages/Workshop';
import Commissions from '@/pages/Commissions';
import Records from '@/pages/Records';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/workshop" element={<Workshop />} />
        <Route path="/commissions" element={<Commissions />} />
        <Route path="/records" element={<Records />} />
      </Routes>
    </Router>
  );
}
