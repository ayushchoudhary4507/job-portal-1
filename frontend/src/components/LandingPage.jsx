import Navbar from './landing/Navbar';
import Hero from './landing/Hero';
import Features from './landing/Features';
import Categories from './landing/Categories';
import FeaturedJobs from './landing/FeaturedJobs';
import CTA from './landing/CTA';
import Footer from './landing/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Categories />
        <FeaturedJobs />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
