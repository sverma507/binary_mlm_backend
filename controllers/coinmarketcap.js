const axios = require('axios');

// Controller to get latest cryptocurrency listings
exports.getCryptocurrencyListings = async (req, res) => {
  try {
    // Make the API call to CoinMarketCap
    const response = await axios.get('https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
      headers: {
        'X-CMC_PRO_API_KEY': 'fbb44ea9-bd5f-4c15-8480-6cdc17935e12',
      },
    });

    // If the request is successful, send the data as a response
    return res.status(200).json({
      success: true,
      data: response.data,
    });

  } catch (error) {
    // If an error occurs, log it and send an error response
    console.error('Error fetching cryptocurrency listings:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching cryptocurrency listings',
      error: error.message,
    });
  }
};


