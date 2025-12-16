import React, { useState } from "react";
import HeroSection from "../Components/home/HeroSection";
import SignIn from "../Components/auth/SignIn";
import FAQSection from "../Components/home/FAQSection";
import FeaturesSection from "../Components/home/FeaturesSections";
import Testimonials from "../Components/home/Testimonials";
import Layout from "../layout/layout";
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
