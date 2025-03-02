// src/pages/AboutPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>About the Chalkstone Council Reports System</h1>
        <p className="lead">
          Connecting residents with council services to build a better community
        </p>
      </div>

      <section className="about-section">
        <h2>Our Mission</h2>
        <p>
          The Chalkstone Council Reports System is designed to empower residents to take an active role
          in improving their community. By providing an easy-to-use platform for reporting local issues,
          we aim to enhance the efficiency of council services and create a more responsive local government.
        </p>
      </section>

      <section className="about-section">
        <h2>How It Works</h2>
        <div className="process-steps">
          <div className="process-step">
            <div className="step-number">1</div>
            <h3>Report an Issue</h3>
            <p>
              Use our platform to report issues such as potholes, street lighting problems,
              graffiti, and more. Provide details, location, and photos to help our team
              understand the problem.
            </p>
          </div>

          <div className="process-step">
            <div className="step-number">2</div>
            <h3>Council Review</h3>
            <p>
              Council staff review and validate the reported issues. Each report is categorized
              and assigned to the appropriate department for resolution.
            </p>
          </div>

          <div className="process-step">
            <div className="step-number">3</div>
            <h3>Resolution</h3>
            <p>
              The responsible department takes action to resolve the issue. You'll receive
              updates on the progress and can check the status of your report at any time.
            </p>
          </div>

          <div className="process-step">
            <div className="step-number">4</div>
            <h3>Verification</h3>
            <p>
              Once the issue is resolved, you'll be notified and have the opportunity to
              provide feedback on the resolution.
            </p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>Types of Issues We Handle</h2>
        <div className="issues-grid">
          <div className="issue-type">
            <div className="issue-icon pothole"></div>
            <h3>Potholes</h3>
            <p>Damage to road surfaces that can cause hazards for drivers and pedestrians.</p>
          </div>

          <div className="issue-type">
            <div className="issue-icon street-light"></div>
            <h3>Street Lighting</h3>
            <p>Issues with street lamps, including those that are broken or malfunctioning.</p>
          </div>

          <div className="issue-type">
            <div className="issue-icon graffiti"></div>
            <h3>Graffiti</h3>
            <p>Unauthorized painting, writing, or drawings on public or private property.</p>
          </div>

          <div className="issue-type">
            <div className="issue-icon anti-social"></div>
            <h3>Anti-Social Behavior</h3>
            <p>Activities that cause harassment, alarm, or distress to community members.</p>
          </div>

          <div className="issue-type">
            <div className="issue-icon fly-tipping"></div>
            <h3>Fly-Tipping</h3>
            <p>Illegal disposal of waste or rubbish on land not licensed to receive it.</p>
          </div>

          <div className="issue-type">
            <div className="issue-icon blocked-drain"></div>
            <h3>Blocked Drains</h3>
            <p>Clogged drains or sewers causing water buildup or potential flooding.</p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>Our Team</h2>
        <p>
          The Chalkstone Council Reports System is managed by a dedicated team of council staff
          who are committed to maintaining high standards of public service. Our team includes:
        </p>
        <ul className="team-list">
          <li>Customer service representatives who receive and process reports</li>
          <li>Field staff who investigate and resolve issues</li>
          <li>Supervisors who oversee the resolution process and ensure quality</li>
          <li>Analysts who study patterns and improve service efficiency</li>
        </ul>
      </section>

      <section className="about-section cta-section">
        <h2>Get Involved</h2>
        <p>
          Join our community effort to make Chalkstone a better place to live, work, and visit.
          Your reports help us identify issues quickly and address them efficiently.
        </p>
        <div className="cta-buttons">
          <Link to="/register" className="btn btn-primary">Create an Account</Link>
          <Link to="/report" className="btn btn-secondary">Report an Issue</Link>
        </div>
      </section>

      <style jsx>{`
        .about-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .about-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .about-header h1 {
          color: var(--primary-color);
          margin-bottom: 1rem;
        }

        .lead {
          font-size: 1.2rem;
          color: var(--text-muted);
        }

        .about-section {
          margin-bottom: 3rem;
        }

        .about-section h2 {
          color: var(--primary-color);
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .about-section p {
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .process-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .process-step {
          background-color: var(--light-color);
          padding: 1.5rem;
          border-radius: 8px;
          position: relative;
        }

        .step-number {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          background-color: var(--primary-color);
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .process-step h3 {
          text-align: center;
          margin-top: 0.5rem;
          margin-bottom: 1rem;
          color: var(--dark-color);
        }

        .issues-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .issue-type {
          background-color: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .issue-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 1rem;
          border-radius: 50%;
          background-size: 60%;
          background-repeat: no-repeat;
          background-position: center;
        }

        .issue-icon.pothole {
          background-image: url('/assets/markers/pothole.png');
          background-color: #ffecec;
        }

        .issue-icon.street-light {
          background-image: url('/assets/markers/street_light.png');
          background-color: #fff9ec;
        }

        .issue-icon.graffiti {
          background-image: url('/assets/markers/graffiti.png');
          background-color: #ecf8ff;
        }

        .issue-icon.anti-social {
          background-image: url('/assets/markers/anti_social.png');
          background-color: #eefff1;
        }

        .issue-icon.fly-tipping {
          background-image: url('/assets/markers/fly_tipping.png');
          background-color: #fff0fa;
        }

        .issue-icon.blocked-drain {
          background-image: url('/assets/markers/blocked_drain.png');
          background-color: #f0f8ff;
        }

        .issue-type h3 {
          margin-bottom: 0.5rem;
          color: var(--dark-color);
        }

        .team-list {
          margin-left: 1.5rem;
          line-height: 1.8;
        }

        .cta-section {
          background-color: var(--light-color);
          padding: 2rem;
          border-radius: 8px;
          text-align: center;
        }

        .cta-buttons {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        @media (max-width: 768px) {
          .process-steps,
          .issues-grid {
            grid-template-columns: 1fr;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }

          .cta-buttons .btn {
            width: 100%;
            max-width: 250px;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
