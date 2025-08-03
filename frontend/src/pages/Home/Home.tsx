import React, { useState, useEffect } from 'react';
import styles from './Home.module.css';

const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const sliderImages = [
    {
      url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&h=600&fit=crop&crop=center",
      title: "AI-Powered IELTS Training",
      description: "Experience the future of language learning with our advanced AI technology"
    },
    {
      url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=600&fit=crop&crop=center",
      title: "Personalized Learning Path",
      description: "Get customized study plans tailored to your specific learning needs"
    },
    {
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=600&fit=crop&crop=center",
      title: "Real-time Feedback",
      description: "Receive instant detailed feedback to improve your writing skills effectively"
    },
    {
      url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=600&fit=crop&crop=center",
      title: "Global Community",
      description: "Join thousands of successful students worldwide achieving their IELTS goals"
    }
  ];

  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, sliderImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className={styles.homeContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.leftPanel}>
            <span className={styles.tag}>
              <span className={styles.tagIcon}>⭐</span>
              #1 Popular - Vietnam
            </span>
            <h1 className={styles.title}>
              BandBoost for
              <span className={styles.titleAccent}> IELTS</span>
            </h1>
            <p className={styles.description}>
              The popular IELTS Writing scoring, prediction, practice support, and assessment tool used by over 85,000 students & teachers globally.
            </p>
            <p className={styles.description}>
              BandBoost, powered by AI – artificial intelligence, proprietary algorithms, and machine learning trained on tens of thousands of essays, helps estimate IELTS Writing band scores with high accuracy.
            </p>
            <div className={styles.heroButtons}>
              <button className={styles.startButton}>
                <span className={styles.buttonIcon}>🚀</span>
                Get Started for Free
              </button>
              <button className={styles.watchDemoButton}>
                <span className={styles.buttonIcon}>▶️</span>
                Watch Demo
              </button>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatNumber}>85K+</span>
                <span className={styles.heroStatLabel}>Active Users</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatNumber}>98%</span>
                <span className={styles.heroStatLabel}>Accuracy</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatNumber}>4.9/5</span>
                <span className={styles.heroStatLabel}>Rating</span>
              </div>
            </div>
          </div>
          <div className={styles.rightPanel}>
            <div className={styles.textEditorPlaceholder}>
              <div className={styles.editorToolbar}>
                <div className={styles.toolbarLeft}>
                  <span className={styles.toolbarTitle}>✨ IELTS Writing Assistant</span>
                </div>
                <div className={styles.toolbarRight}>
                  <button className={styles.toolBtn}>B</button>
                  <button className={styles.toolBtn}>I</button>
                  <button className={styles.toolBtn}>U</button>
                  <button className={styles.toolBtn}>🔗</button>
                </div>
              </div>
              <textarea 
                placeholder="Paste your IELTS essay here for instant band score prediction and detailed feedback... ✍️"
                className={styles.editorTextarea}
              ></textarea>
              <div className={styles.editorFooter}>
                <button className={styles.footerBtn}>
                  <span className={styles.btnIcon}>🎯</span>
                  Generate Sample
                </button>
                <button className={styles.footerBtn}>
                  <span className={styles.btnIcon}>🤖</span>
                  AI Feedback
                </button>
                <button className={styles.footerBtn}>
                  <span className={styles.btnIcon}>✅</span>
                  Check Grammar
                </button>
                <div className={styles.wordCount}>
                  <span className={styles.wordCountIcon}>📊</span>
                  Words: 0
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Slider Section */}
      <section className={styles.sliderSection}>
        <div className={styles.sliderContainer}>
          <div className={styles.sliderWrapper}>
            <div 
              className={styles.sliderTrack}
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {sliderImages.map((image, index) => (
                <div key={index} className={styles.slide}>
                  <div className={styles.slideImageContainer}>
                    <img 
                      src={image.url} 
                      alt={image.title}
                      className={styles.slideImage}
                    />
                    <div className={styles.slideOverlay}></div>
                  </div>
                  <div className={styles.slideContent}>
                    <h3 className={styles.slideTitle}>{image.title}</h3>
                    <p className={styles.slideDescription}>{image.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              className={`${styles.sliderBtn} ${styles.sliderBtnPrev}`}
              onClick={prevSlide}
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              &#8249;
            </button>
            <button 
              className={`${styles.sliderBtn} ${styles.sliderBtnNext}`}
              onClick={nextSlide}
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              &#8250;
            </button>
          </div>
          
          <div className={styles.sliderDots}>
            {sliderImages.map((_, index) => (
              <button
                key={index}
                className={`${styles.sliderDot} ${index === currentSlide ? styles.sliderDotActive : ''}`}
                onClick={() => goToSlide(index)}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className={styles.statsSection}>
        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <div className={styles.statIcon}>👥</div>
            <h3 className={styles.statNumber}>85,000+</h3>
            <p className={styles.statLabel}>Active Users</p>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statIcon}>🎯</div>
            <h3 className={styles.statNumber}>98%</h3>
            <p className={styles.statLabel}>Accuracy Rate</p>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statIcon}>📝</div>
            <h3 className={styles.statNumber}>500,000+</h3>
            <p className={styles.statLabel}>Essays Analyzed</p>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statIcon}>🌟</div>
            <h3 className={styles.statNumber}>24/7</h3>
            <p className={styles.statLabel}>AI Support</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Why Choose BandBoost?</h2>
          <p className={styles.sectionSubtitle}>
            Advanced AI technology meets IELTS expertise to help you achieve your target band score
          </p>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🎯</div>
              <h3 className={styles.featureTitle}>Instant Band Score</h3>
              <p className={styles.featureDescription}>
                Get immediate band score predictions with 98% accuracy using our advanced AI algorithms
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📝</div>
              <h3 className={styles.featureTitle}>Detailed Feedback</h3>
              <p className={styles.featureDescription}>
                Receive comprehensive feedback on grammar, vocabulary, coherence, and task achievement
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📊</div>
              <h3 className={styles.featureTitle}>Progress Tracking</h3>
              <p className={styles.featureDescription}>
                Monitor your improvement over time with detailed analytics and performance insights
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🤖</div>
              <h3 className={styles.featureTitle}>AI Writing Coach</h3>
              <p className={styles.featureDescription}>
                Get personalized writing suggestions and tips from our intelligent tutoring system
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📚</div>
              <h3 className={styles.featureTitle}>Essay Bank</h3>
              <p className={styles.featureDescription}>
                Access thousands of sample essays and practice questions for all IELTS Writing tasks
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⚡</div>
              <h3 className={styles.featureTitle}>Real-time Analysis</h3>
              <p className={styles.featureDescription}>
                Get instant feedback as you type with our real-time grammar and style checker
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorksSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <div className={styles.stepsContainer}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Write Your Essay</h3>
              <p className={styles.stepDescription}>
                Type or paste your IELTS essay into our advanced text editor
              </p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>AI Analysis</h3>
              <p className={styles.stepDescription}>
                Our AI instantly analyzes your essay using machine learning algorithms
              </p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Get Feedback</h3>
              <p className={styles.stepDescription}>
                Receive detailed band score prediction and improvement suggestions
              </p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <h3 className={styles.stepTitle}>Improve & Practice</h3>
              <p className={styles.stepDescription}>
                Use our recommendations to improve and track your progress over time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonialsSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>What Our Users Say</h2>
          <div className={styles.testimonialsGrid}>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialContent}>
                "BandBoost helped me improve from band 6.5 to 8.0 in just 3 months. The AI feedback is incredibly accurate!"
              </div>
              <div className={styles.testimonialAuthor}>
                <strong>Nguyen Minh Anh</strong>
                <span>University Student</span>
              </div>
            </div>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialContent}>
                "As an IELTS teacher, I use BandBoost to help my students practice more efficiently. It's a game-changer!"
              </div>
              <div className={styles.testimonialAuthor}>
                <strong>Sarah Johnson</strong>
                <span>IELTS Instructor</span>
              </div>
            </div>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialContent}>
                "The detailed feedback helped me understand exactly what I needed to improve. Highly recommended!"
              </div>
              <div className={styles.testimonialAuthor}>
                <strong>Le Thanh Duc</strong>
                <span>Professional</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Why Choose BandBoost?</h2>
          <p className={styles.sectionSubtitle}>
            Advanced AI technology meets IELTS expertise to help you achieve your target band score
          </p>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🎯</div>
              <h3 className={styles.featureTitle}>Instant Band Score</h3>
              <p className={styles.featureDescription}>
                Get immediate band score predictions with 98% accuracy using our advanced AI algorithms
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📝</div>
              <h3 className={styles.featureTitle}>Detailed Feedback</h3>
              <p className={styles.featureDescription}>
                Receive comprehensive feedback on grammar, vocabulary, coherence, and task achievement
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📊</div>
              <h3 className={styles.featureTitle}>Progress Tracking</h3>
              <p className={styles.featureDescription}>
                Monitor your improvement over time with detailed analytics and performance insights
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🤖</div>
              <h3 className={styles.featureTitle}>AI Writing Coach</h3>
              <p className={styles.featureDescription}>
                Get personalized writing suggestions and tips from our intelligent tutoring system
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📚</div>
              <h3 className={styles.featureTitle}>Essay Bank</h3>
              <p className={styles.featureDescription}>
                Access thousands of sample essays and practice questions for all IELTS Writing tasks
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⚡</div>
              <h3 className={styles.featureTitle}>Real-time Analysis</h3>
              <p className={styles.featureDescription}>
                Get instant feedback as you type with our real-time grammar and style checker
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorksSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <div className={styles.stepsContainer}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Write Your Essay</h3>
              <p className={styles.stepDescription}>
                Type or paste your IELTS essay into our advanced text editor
              </p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>AI Analysis</h3>
              <p className={styles.stepDescription}>
                Our AI instantly analyzes your essay using machine learning algorithms
              </p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Get Feedback</h3>
              <p className={styles.stepDescription}>
                Receive detailed band score prediction and improvement suggestions
              </p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <h3 className={styles.stepTitle}>Improve & Practice</h3>
              <p className={styles.stepDescription}>
                Use our recommendations to improve and track your progress over time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonialsSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>What Our Users Say</h2>
          <div className={styles.testimonialsGrid}>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialContent}>
                "BandBoost helped me improve from band 6.5 to 8.0 in just 3 months. The AI feedback is incredibly accurate!"
              </div>
              <div className={styles.testimonialAuthor}>
                <strong>Nguyen Minh Anh</strong>
                <span>University Student</span>
              </div>
            </div>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialContent}>
                "As an IELTS teacher, I use BandBoost to help my students practice more efficiently. It's a game-changer!"
              </div>
              <div className={styles.testimonialAuthor}>
                <strong>Sarah Johnson</strong>
                <span>IELTS Instructor</span>
              </div>
            </div>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialContent}>
                "The detailed feedback helped me understand exactly what I needed to improve. Highly recommended!"
              </div>
              <div className={styles.testimonialAuthor}>
                <strong>Le Thanh Duc</strong>
                <span>Professional</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>Ready to Boost Your IELTS Writing Score?</h2>
          <p className={styles.ctaDescription}>
            Join thousands of successful students who achieved their target band scores with BandBoost
          </p>
          <div className={styles.ctaButtons}>
            <button className={styles.ctaButtonPrimary}>
              <span className={styles.buttonIcon}>🚀</span>
              Start Free Trial
            </button>
            <button className={styles.ctaButtonSecondary}>
              <span className={styles.buttonIcon}>💎</span>
              View Pricing
            </button>
          </div>
          <p className={styles.ctaNote}>✨ No credit card required • 7-day free trial • Cancel anytime</p>
        </div>
      </section>
    </div>
  );
};

export default Home; 