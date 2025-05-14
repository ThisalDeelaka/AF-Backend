const fetch = require('node-fetch');


const API_KEY = 'e28d9340c2-c49c714dd0-ssy1um';  


const getExchangeRate = async (fromCurrency, toCurrency) => {
  try {
    // Make an API request to the FastFOREX API
    const response = await fetch(`https://api.fastforex.io/fetch-all?api_key=${API_KEY}`);

    if (!response.ok) {
      throw new Error('Error fetching exchange rates');
    }

    const data = await response.json();

    // Check if the desired currencies are available in the response
    if (data && data.results && data.results[fromCurrency] && data.results[toCurrency]) {
      const fromRate = data.results[fromCurrency];
      const toRate = data.results[toCurrency];
      
      // Calculate the exchange rate between the two currencies
      return toRate / fromRate;
    } else {
      throw new Error(`Exchange rate for ${fromCurrency} to ${toCurrency} not found`);
    }
  } catch (err) {
    console.error("Error occurred while fetching exchange rates:", err.message);
    throw new Error("Error fetching exchange rates");
  }
};

module.exports = { getExchangeRate };
