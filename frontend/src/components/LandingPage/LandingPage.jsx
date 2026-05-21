import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import FeatureSection from "./FeatureSection";
import Workflow from "./Workflow";
import Testimonials from "./Testimonials";
import Footer from "./Footer";
import FAQ from "./FAQ";

const LandingPage = () => {
  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-10">
        <HeroSection />
        <FeatureSection />
        <Workflow />
        <Testimonials />
        <FAQ />
        <Footer />
      </div>

    </>
  );
};

export default LandingPage;