import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TripProvider } from './context/TripContext.jsx';
import RootLayout from './layouts/RootLayout.jsx';

import HomePage from './pages/HomePage.jsx';
import PlanPage from './pages/PlanPage.jsx';
import BudgetDiscoveryPage from './pages/BudgetDiscoveryPage.jsx';
import JourneyPage from './pages/JourneyPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import SavedTripsPage from './pages/SavedTripsPage.jsx';
import PreferencesPage from './pages/PreferencesPage.jsx';
import HowItWorksPage from './pages/HowItWorksPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <TripProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="plan" element={<PlanPage />} />
            <Route path="discovery" element={<BudgetDiscoveryPage />} />
            <Route path="journey" element={<JourneyPage />} />
            <Route path="checkout/:tripId" element={<CheckoutPage />} />
            <Route path="book" element={<BookingPage />} />
            <Route path="trips" element={<SavedTripsPage />} />
            <Route path="preferences" element={<PreferencesPage />} />
            <Route path="how-it-works" element={<HowItWorksPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TripProvider>
  );
}
