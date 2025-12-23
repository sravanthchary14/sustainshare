import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUsers,
  FaHeart,
  FaHandshake,
  FaUtensils,
  FaHandsHelping,
  FaMapMarkedAlt,
  FaSmile
} from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const aboutRef = useRef(null);

  const [showAbout, setShowAbout] = useState(false); // 👈 Added state to toggle About section

  const scrollToAbout = () => {
    setShowAbout(true); // 👈 Show About section when Learn More is clicked
    setTimeout(() => {
      aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const [impactStats, setImpactStats] = useState({
    peopleFed: 12847,
    activeDonors: 1256,
    foodWastePrevented: 45.6,
    partnerCharities: 89
  });

  useEffect(() => {
    const animateCounters = (targetStats) => {
      let start = null;
      const duration = 2000;

      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);

        setImpactStats({
          peopleFed: Math.floor(targetStats.peopleFed * progress),
          activeDonors: Math.floor(targetStats.activeDonors * progress),
          foodWastePrevented: parseFloat((targetStats.foodWastePrevented * progress).toFixed(1)),
          partnerCharities: Math.floor(targetStats.partnerCharities * progress)
        });

        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };

      window.requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateCounters({
            peopleFed: 12,
            activeDonors: 12,
            foodWastePrevented: 1,
            partnerCharities: 1
          });
        }
      },
      { threshold: 0.1 }
    );

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) observer.observe(statsSection);

    return () => observer.disconnect();
  }, []);

  const processSteps = [
    {
      icon: <FaUtensils className="step-icon" />,
      title: "Donate Food",
      description: "Restaurants and individuals post available surplus food"
    },
    {
      icon: <FaHandsHelping className="step-icon" />,
      title: "Connect",
      description: "Charities browse and claim food donations in real-time"
    },
    {
      icon: <FaMapMarkedAlt className="step-icon" />,
      title: "Location",
      description: "Location viewing which ensures safe and timely food delivery"
    },
    {
      icon: <FaSmile className="step-icon" />,
      title: "Impact",
      description: "Meals reach those in need, reducing waste and hunger"
    }
  ];

  const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // This makes the scroll animated
  });
};

  return (
    <div className="home-page">
      {/* Hero Section */}
      <motion.section
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-content">
          <div className="hero-label">✨ Making a Difference Together</div>

          <motion.h1
            className="hero-heading"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Help End <span className="highlight-text">Hunger</span>
          </motion.h1>

          <motion.h2
            className="hero-subtitle"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.3 }}
          >
            One Meal at a Time
          </motion.h2>

          <motion.p
            className="hero-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Join thousands of compassionate people fighting hunger in our communities.
            Every donation makes a real difference in someone's life today.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              className="primary-button"
              onClick={() => navigate('/signup?role=donor')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Donating
            </motion.button>
            <motion.button
              className="secondary-button"
              onClick={scrollToAbout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* About SustainShare Section - Hides until Learn More is clicked */}
      {showAbout && (
        <section ref={aboutRef} className="about-section">
          <h2>About SustainShare</h2>
          <div className="cards">
            <div className="card">
              <span role="img" aria-label="earth">🌍</span>
              <h3>Our Mission</h3>
              <p>
                SustainShare bridges the gap between food surplus and food insecurity.
                We connect restaurants, cafes, and individuals with charitable organizations to ensure
                no meal goes to waste.
              </p>
            </div>
            <div className="card">
              <span role="img" aria-label="rocket">🚀</span>
              <h3>How It Works</h3>
              <p>
                Real-time notifications, GPS tracking, and organized dashboards make food donation
                simple and efficient. Every meal donated is tracked from kitchen to table.
              </p>
            </div>
            <div className="card">
              <span role="img" aria-label="chart">📊</span>
              <h3>Track Impact</h3>
              <p>
                See your real impact with detailed analytics showing how many people you've helped,
                food waste prevented, and communities strengthened.
              </p>
            </div>
          </div>
<button 
  id="backToTopBtn" 
  onClick={scrollToTop} // Changed from onclick to onClick
  className="back-to-top-button" // Add this class for styling
>
  ↑ Back to Top
</button>
        </section>
      )}

      {/* Impact Stats Section */}
      <section className="stats-section">
        <motion.div
          className="stats-container"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2>Our Impact in Numbers</h2>
          <p>Real-time statistics showing the difference we're making together</p>

          <div className="stats-grid">
            <motion.div className="stat-card" whileHover={{ scale: 1.05 }}>
              <h3>{impactStats.peopleFed.toLocaleString()}+</h3>
              <p>People Fed This Year</p>
            </motion.div>
            <motion.div className="stat-card" whileHover={{ scale: 1.05 }}>
              <h3>{impactStats.activeDonors.toLocaleString()}+</h3>
              <p>Active Donors</p>
            </motion.div>
            <motion.div className="stat-card" whileHover={{ scale: 1.05 }}>
              <h3>{impactStats.foodWastePrevented}t+</h3>
              <p>Food Waste Prevented</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="process-section">
        <motion.div
          className="section-header"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2>How SustainShare Works</h2>
          <p>Our simple 4-step process to reduce food waste and fight hunger</p>
        </motion.div>

        <div className="process-steps">
          {processSteps.map((step, index) => (
            <motion.div
              key={index}
              className="process-step"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="step-number">{index + 1}</div>
              {step.icon}
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="cta-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="cta-content">
          <h2>Ready to Make a Difference?</h2>
          <p>Your generosity can provide meals, hope, and a brighter future for families in need.</p>

          <div className="cta-actions">
            <motion.button
              className="primary-button"
              onClick={() => navigate('/signup?role=donor')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Donating Today
            </motion.button>
            <motion.button
              className="secondary-button"
              onClick={() => navigate('/signup?role=charity')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Join as Charity
            </motion.button>
          </div>
        </div>

        <div className="cta-footer">
          <p>Trusted by {impactStats.partnerCharities}+ organizations</p>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
