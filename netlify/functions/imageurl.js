const fetch = require('node-fetch');

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
    const { input } = JSON.parse(event.body);

    if (!input) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing image URL' })
      };
    }

    // Call Clarifai API v2 using direct REST API
    const PAT = process.env.CLARIFAI_API_KEY;
    // Use your own user ID and app ID, or fall back to public ones
    const USER_ID = process.env.CLARIFAI_USER_ID || 'clarifai';
    const APP_ID = process.env.CLARIFAI_APP_ID || 'main';
    const MODEL_ID = 'face-detection';
    const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';

    const raw = JSON.stringify({
      "user_app_id": {
        "user_id": USER_ID,
        "app_id": APP_ID
      },
      "inputs": [
        {
          "data": {
            "image": {
              "url": input
            }
          }
        }
      ]
    });

    const requestOptions = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Key ' + PAT,
        'Content-Type': 'application/json'
      },
      body: raw
    };

    const apiResponse = await fetch(
      `https://api.clarifai.com/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`,
      requestOptions
    );

    const result = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error('Clarifai API error:', result);
      console.error('Using USER_ID:', USER_ID, 'APP_ID:', APP_ID);
      return {
        statusCode: apiResponse.status,
        headers,
        body: JSON.stringify({
          error: 'Clarifai API error',
          details: result.status?.description || 'Unknown error',
          hint: 'Make sure CLARIFAI_USER_ID and CLARIFAI_APP_ID are set correctly'
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Image processing error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Image processing failed',
        details: error.message || 'Unknown error'
      })
    };
  }
};
