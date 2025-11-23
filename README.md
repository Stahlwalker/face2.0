# Face Detection App

A React-based face detection application that uses the Clarifai Face Detection API to identify and highlight faces in images. Built with React and deployed on Netlify with serverless functions.

**Live Demo:** https://face-app-80d9450b.netlify.app

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Setup & Installation](#setup--installation)
- [Deployment](#deployment)
- [Current Limitations](#current-limitations)
- [Future Improvements](#future-improvements)

## Features

- **User Authentication**: Register and sign in with bcrypt password hashing
- **Face Detection**: Upload image URLs to detect faces using Clarifai's AI
- **Visual Feedback**: Detected faces are highlighted with bounding boxes
- **Entry Tracking**: Tracks the number of images processed (session-based)
- **Responsive UI**: Particle background effect with clean, intuitive interface

## Tech Stack

### Frontend
- **React 16.2.0**: Component-based UI framework
- **react-particles-js**: Animated particle background
- **Tachyons CSS**: Functional CSS framework for styling
- **Create React App**: Build tooling and development environment

### Backend
- **Netlify Functions**: Serverless backend (AWS Lambda compatible)
- **Node.js**: Server-side JavaScript runtime
- **bcryptjs**: Password hashing and authentication
- **node-fetch**: HTTP client for API requests

### APIs & Services
- **Clarifai Face Detection API v2**: AI-powered face recognition
- **Netlify**: Hosting and serverless function deployment

## Architecture

The app follows a modern serverless architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                      │
│  ┌───────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ Register  │  │   Sign In    │  │  Face Detection UI   │ │
│  └─────┬─────┘  └──────┬───────┘  └──────────┬───────────┘ │
│        │                │                     │              │
│        └────────────────┼─────────────────────┘              │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          │ HTTPS
                          │
┌─────────────────────────┼────────────────────────────────────┐
│                Netlify Functions (Serverless)                 │
│  ┌────────────────┐  ┌──────────┐  ┌──────────────────────┐ │
│  │ register.js    │  │signin.js │  │    imageurl.js       │ │
│  │ (User Create)  │  │ (Auth)   │  │ (Face Detection)     │ │
│  └────────────────┘  └──────────┘  └──────────┬───────────┘ │
│           │               │                    │              │
│           └───────┬───────┘                    │              │
│                   │                            │              │
│         ┌─────────▼──────────┐                 │              │
│         │   db.js (Memory)   │                 │              │
│         │   User Storage     │                 │              │
│         └────────────────────┘                 │              │
└────────────────────────────────────────────────┼──────────────┘
                                                  │
                                                  │ HTTPS
                                                  │
                                    ┌─────────────▼────────────┐
                                    │   Clarifai Face API      │
                                    │   (AI Face Detection)    │
                                    └──────────────────────────┘
```

## Project Structure

```
face2.0/
├── public/                      # Static assets
│   ├── index.html              # HTML template
│   └── favicon.ico             # App icon
│
├── src/                        # React source code
│   ├── components/             # React components
│   │   ├── FaceRecognition/   # Face box display component
│   │   ├── ImageLinkForm/     # Image URL input form
│   │   ├── Logo/              # App logo component
│   │   ├── Navigation/        # Sign in/out navigation
│   │   ├── Rank/              # User entry count display
│   │   ├── Register/          # Registration form
│   │   └── Signin/            # Sign in form
│   │
│   ├── App.js                 # Main application component
│   ├── App.css                # Application styles
│   ├── index.js               # React entry point
│   └── index.css              # Global styles
│
├── netlify/                   # Backend serverless functions
│   ├── functions/
│   │   ├── register.js       # User registration endpoint
│   │   ├── signin.js         # User authentication endpoint
│   │   ├── imageurl.js       # Face detection API proxy
│   │   └── image.js          # Entry counter endpoint
│   │
│   └── lib/
│       └── db.js             # In-memory database (temporary)
│
├── netlify.toml              # Netlify configuration
├── package.json              # Dependencies and scripts
└── .env                      # Environment variables (not in git)
```

## How It Works

### 1. User Registration & Authentication

**Frontend (src/components/Register/Register.js)**
```javascript
// User fills in email, name, and password
fetch('/.netlify/functions/register', {
  method: 'post',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({ email, password, name })
})
```

**Backend (netlify/functions/register.js)**
- Receives user credentials
- Hashes password with bcrypt (10 rounds)
- Stores user in in-memory database
- Returns user object (without password)

### 2. Face Detection Flow

**Step 1: User submits image URL**
```javascript
// Frontend (src/App.js)
onButtonSubmit = () => {
  this.setState({imageUrl: this.state.input});
  fetch('/.netlify/functions/imageurl', {
    method: 'post',
    body: JSON.stringify({ input: this.state.input })
  })
}
```

**Step 2: Backend calls Clarifai API**
```javascript
// Backend (netlify/functions/imageurl.js)
const response = await fetch(
  'https://api.clarifai.com/v2/models/face-detection/versions/xxx/outputs',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Key ' + CLARIFAI_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: [{ data: { image: { url: imageUrl }}}]
    })
  }
);
```

**Step 3: Calculate face bounding box**
```javascript
// Frontend (src/App.js)
calculateFaceLocation = (data) => {
  const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
  const image = document.getElementById('inputimage');

  // Convert percentage-based coordinates to pixels
  return {
    leftCol: clarifaiFace.left_col * image.width,
    topRow: clarifaiFace.top_row * image.height,
    rightCol: image.width - (clarifaiFace.right_col * image.width),
    bottomRow: image.height - (clarifaiFace.bottom_row * image.height)
  }
}
```

**Step 4: Display face box**
```javascript
// Frontend (src/components/FaceRecognition/FaceRecognition.js)
<div className="bounding-box" style={{
  top: box.topRow + 'px',
  right: box.rightCol + 'px',
  bottom: box.bottomRow + 'px',
  left: box.leftCol + 'px'
}}></div>
```

### 3. Entry Counter

After successful face detection, the app attempts to increment the user's entry count:

```javascript
fetch('/.netlify/functions/image', {
  method: 'put',
  body: JSON.stringify({ id: this.state.user.id })
})
```

## Setup & Installation

### Prerequisites
- Node.js 14+ and npm
- Clarifai account with API key
- Netlify account (for deployment)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/Stahlwalker/face2.0.git
cd face2.0
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:
```env
CLARIFAI_API_KEY=your_clarifai_api_key
CLARIFAI_USER_ID=your_clarifai_user_id
CLARIFAI_APP_ID=your_clarifai_app_id
```

To get these credentials:
- Sign up at [Clarifai](https://www.clarifai.com/)
- Create a new application
- Copy your Personal Access Token (API Key)
- Get your User ID and App ID from the dashboard

4. **Run the app locally**
```bash
# Start development server
npm start

# Or test with Netlify Functions locally
netlify dev
```

The app will open at `http://localhost:3000`

## Deployment

The app is configured for automatic deployment to Netlify.

### Deploy to Netlify

1. **Push to GitHub**
```bash
git add .
git commit -m "Your commit message"
git push origin master
```

2. **Connect to Netlify**
- Go to [Netlify](https://app.netlify.com)
- Click "Add new site" > "Import an existing project"
- Connect your GitHub repository
- Configure build settings:
  - Build command: `npm run build`
  - Publish directory: `build`
  - Functions directory: `netlify/functions`

3. **Set environment variables in Netlify**

In your Netlify site dashboard:
- Go to Site settings > Environment variables
- Add the following variables:
  - `CLARIFAI_API_KEY`
  - `CLARIFAI_USER_ID`
  - `CLARIFAI_APP_ID`

4. **Deploy**

Netlify will automatically build and deploy your app. Every push to `master` will trigger a new deployment.

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod
```

## Current Limitations

### 1. In-Memory Database
- **Issue**: User data is stored in memory and lost when serverless functions restart
- **Impact**: Users must re-register after function cold starts
- **Solution**: Integrate a persistent database (PostgreSQL, MongoDB, or Supabase)

### 2. Entry Counter Persistence
- **Issue**: Entry counts reset when the database clears
- **Impact**: User statistics are not preserved across sessions
- **Solution**: Use persistent database for user data

### 3. Single Face Detection
- **Issue**: Only highlights the first detected face
- **Impact**: Multiple faces in an image won't all be highlighted
- **Solution**: Map through all `regions` in the API response

### 4. No Image Upload
- **Issue**: Only accepts image URLs, not direct file uploads
- **Impact**: Users must host images elsewhere
- **Solution**: Add file upload with cloud storage (Cloudinary, AWS S3)

## Future Improvements

- [ ] **Persistent Database**: Integrate Supabase or PostgreSQL for user data
- [ ] **Multiple Face Detection**: Highlight all detected faces in an image
- [ ] **Image Upload**: Allow users to upload images directly
- [ ] **User Profile**: Add profile pages with detection history
- [ ] **JWT Authentication**: Implement token-based authentication
- [ ] **Rate Limiting**: Prevent API abuse
- [ ] **Loading States**: Better UX with loading indicators
- [ ] **Error Messages**: More descriptive error messages for users
- [ ] **Mobile Optimization**: Improve responsive design for mobile devices
- [ ] **Dark Mode**: Add theme switching capability

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `CLARIFAI_API_KEY` | Your Clarifai Personal Access Token | Yes |
| `CLARIFAI_USER_ID` | Your Clarifai user ID | Yes |
| `CLARIFAI_APP_ID` | Your Clarifai application ID | Yes |

## Scripts

```bash
# Development
npm start              # Start development server
netlify dev           # Start with Netlify Functions locally

# Production
npm run build         # Create production build
netlify deploy --prod # Deploy to Netlify

# Testing
npm test              # Run tests
```

## Technologies Explained

### Why Serverless Functions?
- **No server management**: Focus on code, not infrastructure
- **Auto-scaling**: Handles traffic spikes automatically
- **Cost-effective**: Pay only for actual usage
- **Easy deployment**: Integrated with Netlify hosting

### Why Clarifai?
- **Pre-trained models**: No need to train face detection from scratch
- **High accuracy**: Industry-leading computer vision models
- **Simple API**: Easy to integrate and use
- **Generous free tier**: Good for development and small projects

### Why React?
- **Component-based**: Reusable UI components
- **Virtual DOM**: Efficient rendering and updates
- **Large ecosystem**: Tons of libraries and tools
- **Developer experience**: Great tooling and community support

## Credits

- Face Detection powered by [Clarifai](https://www.clarifai.com/)
- Particle effects by [react-particles-js](https://github.com/Wufe/react-particles-js)
- CSS framework: [Tachyons](https://tachyons.io/)
- Hosting: [Netlify](https://www.netlify.com/)

## License

This project is open source and available under the [MIT License](LICENSE).
