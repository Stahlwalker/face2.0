# Netlify Deployment Guide

## Prerequisites
- A Netlify account (free tier is fine)
- A Clarifai API key (get it from https://www.clarifai.com/)

## Deployment Steps

### 1. Get Clarifai API Key
1. Sign up at https://www.clarifai.com/
2. Go to your account settings
3. Copy your API key

### 2. Deploy to Netlify

#### Option A: Deploy via Netlify CLI
1. Install Netlify CLI globally:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Initialize and deploy:
   ```bash
   netlify init
   ```
   Follow the prompts to create a new site.

4. Add environment variable:
   ```bash
   netlify env:set CLARIFAI_API_KEY "your_api_key_here"
   ```

5. Deploy:
   ```bash
   netlify deploy --prod
   ```

#### Option B: Deploy via Netlify Web Interface
1. Push your code to GitHub
2. Go to https://app.netlify.com/
3. Click "Add new site" → "Import an existing project"
4. Connect to your GitHub repository
5. Netlify will auto-detect the settings from `netlify.toml`
6. Before deploying, go to Site settings → Environment variables
7. Add variable:
   - Key: `CLARIFAI_API_KEY`
   - Value: Your Clarifai API key
8. Click "Deploy site"

### 3. Test Your Deployment
Once deployed, test the following:
1. Registration - Create a new account
2. Sign in - Log in with your account
3. Face detection - Submit an image URL with a face

## Local Development with Netlify Functions

To test Netlify Functions locally:

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Create a `.env` file in the project root:
   ```bash
   CLARIFAI_API_KEY=your_api_key_here
   ```

3. Run locally:
   ```bash
   netlify dev
   ```

This will start both the React app and the serverless functions locally.

## Important Notes

### Database Limitation
⚠️ The current implementation uses an **in-memory database** which means:
- User data is lost when the function restarts
- Not suitable for production use

### Recommended Production Database Solutions
For a production app, replace the in-memory database with:
- **Supabase** (PostgreSQL, free tier available)
- **Neon** (Serverless PostgreSQL)
- **PlanetScale** (MySQL)
- **MongoDB Atlas** (NoSQL)

### Security Considerations
- Never commit your `.env` file
- Always use environment variables for API keys
- The current password hashing is secure (bcrypt)

## Troubleshooting

### Functions not working
- Check the Netlify function logs in the dashboard
- Verify environment variables are set correctly
- Ensure CLARIFAI_API_KEY is valid

### CORS errors
- The functions include CORS headers
- If issues persist, check Netlify function logs

### Build failures
- Clear cache: `netlify build --clear-cache`
- Check Node version compatibility
- Verify all dependencies are in package.json
