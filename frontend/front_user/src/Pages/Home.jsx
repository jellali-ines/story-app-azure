import React, { useState } from "react";
import HeroSection from "../components/home/HeroSection";
import SignIn from "../components/auth/SignIn";
import FAQSection from "../components/home/FAQSection";
import FeaturesSection from "../components/home/FeaturesSections";
import Testimonials from "../components/home/Testimonials";
const Home = () => {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
       <div className="relative">
      {/* Hero Section */}
      <HeroSection onSignInClick={() => setShowSignIn(true)} />

      {/* Overlay Modal */}
      {showSignIn && (
        <div className="fixed inset-0 z-50 flex justify-center items-center">
          {/* Backdrop flou */}
          <div
            className="absolute inset-0  bg-opacity-30 backdrop-blur-sm"
            onClick={() => setShowSignIn(false)}
          />

          {/* SignIn Form */}
          <div className="relative z-10">
            <SignIn />
          </div>
        </div>
      )}
      <FeaturesSection  />
      <FAQSection />
      <Testimonials />
    </div>
  );
};

export default Home;
