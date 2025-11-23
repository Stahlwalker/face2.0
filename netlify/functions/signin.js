const bcrypt = require('bcryptjs');
const db = require('../lib/db');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email, password } = JSON.parse(event.body);

    // Validate input
    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing email or password' })
      };
    }

    // Find user
    const user = db.getUserByEmail(email);
    if (!user) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    // Return user data (without password)
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        entries: user.entries,
        joined: user.joined
      })
    };
  } catch (error) {
    console.error('Signin error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Sign in failed' })
    };
  }
};
