# Chalkstone Council Issue Reporting System

A web application that allows residents to report and track local issues such as potholes, street lighting problems, graffiti, and more. The system also includes a staff dashboard for managing and analyzing reported issues.

## Features

- **Interactive Map**: View reported issues on a map with different markers for each issue type
- **Issue Reporting**: Submit new issues with descriptions, locations, and images
- **Issue Tracking**: Follow the status of reported issues
- **User Authentication**: Register and login as a public user or staff member
- **Staff Dashboard**: Access analytics and management tools for council staff
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technologies Used

### Core Technologies
- **React**: JavaScript library for building user interfaces (v18+)
- **React Router**: For handling application routing and navigation
- **React Context API**: For state management across components

### UI Framework & Components
- **Material UI (MUI)**: Comprehensive UI component library and design system
  - MUI Grid System: For responsive layouts
  - MUI Cards, Buttons, Inputs: For consistent UI elements
  - MUI Icons: For iconography throughout the application
  - MUI Theming: For customized styling and dark/light modes
- **Framer Motion**: For smooth animations and transitions

### Data Visualization
- **Recharts**: For charts and graphs in the dashboard
- **Leaflet**: For interactive maps with marker clustering

### Forms & Validation
- **Formik**: For form handling and validation
- **Yup**: Schema-based form validation

### Networking
- **Axios**: Promise-based HTTP client for API requests

### Development Tools
- **ESLint**: For code linting and ensuring code quality
- **npm**: Package management

## Project Structure

```
chalkstone-council-app/
├── public/                 # Static files
├── src/
│   ├── components/         # Reusable components
│   ├── contexts/           # React contexts (auth, notifications)
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components
│   ├── services/           # API service functions
│   ├── styles/             # CSS files
│   ├── utils/              # Helper functions and constants
│   ├── App.jsx             # Main App component
│   └── index.js            # Entry point
└── package.json            # Dependencies and scripts
```

## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/Adz-ai/chalkstone-council-app.git
   cd chalkstone-council-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory with:
   ```
   REACT_APP_API_URL=http://localhost:8080/api
   ```

4. Start the development server:
   ```
   npm start
   ```

5. Build for production:
   ```
   npm run build
   ```

## API Integration

The application integrates with a RESTful API defined in the Swagger documentation. Key endpoints include:

- **Authentication**: `/auth/login`, `/auth/register`
- **Issues**: `/issues` (GET, POST), `/issues/:id` (GET, PUT)
- **Map Data**: `/issues/map`
- **Analytics**: `/issues/analytics`
- **Search**: `/issues/search`

## User Roles

1. **Public Users**:
    - Can view the map of reported issues
    - Can report new issues
    - Can track the status of their reported issues

2. **Staff Users**:
    - All public user capabilities
    - Access to staff dashboard with analytics
    - Can update issue status and assign issues to staff members
    - Can view all reported issues

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- OpenStreetMap for map data
- Leaflet for interactive maps
- Recharts for data visualization
- The Chalkstone Council for the project requirements

---

*This project was created as part of the ECM3432 - Software Engineering 1 coursework at the University of Exeter.*
