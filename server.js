const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { response } = require('express');
const app = express();
const port = process.env.PORT || 3000;


const BASE_URL= 'https://finnhub.io/api/v1/stock/profile2';
const API_KEY = 'cn8imjpr01qocbpgeuc0cn8imjpr01qocbpgeucg';
const API_KEY2 = 'chLsvUjYEHxxMx3yGdtGbMVZo76wbV1t';

const BASE_URL1 ='https://finnhub.io/api/v1/quote?';
const BASE_URL2 ='https://finnhub.io/api/v1/company-news?';
const BASE_URL3 ='https://finnhub.io/api/v1/stock/peers';
const BASE_URL4='https://finnhub.io/api/v1/stock/insider-sentiment';
const POLYGON_BASE_URL = 'https://api.polygon.io/v2/aggs/ticker';
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = "mongodb+srv://aayushi:Aayushi%40123@cluster0.slgmxda.mongodb.net/Stock_Search?retryWrites=true&w=majority&appName=Cluster0"
const client = new MongoClient(uri);


    client.connect().then(() => {
        console.log('Connected to Mongo');
    })
    .catch ((e) => {
        console.error(e);
    })

app.use(cors());

// app.use('/', express.static('browser'))

app.get('/autocomplete', (req, res) => {
    let symbol = req.query.symbol;
    const url = `https://finnhub.io/api/v1/search?q=${symbol}&token=cn8imjpr01qocbpgeuc0cn8imjpr01qocbpgeucg`;
    console.log(`Requesting: ${url}`);
    axios.get(url)
        .then(response => {
            console.log(response.data);
            const temp = response.data.result;
            res.json(temp);
            //data['sampleEndpoints'] = appRoutes()
        })
        .catch(error => {
            console.error(error);
            res.status(500).send("An error occurred while fetching autocomplete suggestions.");
        });
});

app.get('/api/stock/:symbol', async (req, res) => {
    const { symbol } = req.params;
    try {
        console.log(`${BASE_URL}?symbol=${symbol}&token=${API_KEY}`)
        const response = await axios.get(`${BASE_URL}?symbol=${symbol}&token=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        console.error(`Error fetching stock details for symbol ${symbol}:`, error);
        res.status(500).json({ error: 'Failed to fetch stock details' });
    }
});

app.get('/api/price/:symbol', async (req, res) => {
    const symbol = req.params.symbol;
    try {
        console.log(`${BASE_URL1}symbol=${symbol}&token=${API_KEY}`)
        const response = await axios.get(`${BASE_URL1}symbol=${symbol}&token=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        console.error(`Error fetching stock details for symbol ${symbol}:`, error);
        res.status(500).json({ error: 'Failed to fetch stock details' });
    }
});


app.get('/api/peers/:symbol', async (req, res) => {
    const symbol = req.params.symbol;
    try {
        console.log(`${BASE_URL3}?symbol=${symbol}&token=${API_KEY}`)
        const response = await axios.get(`${BASE_URL3}?symbol=${symbol}&token=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        console.error(`Error fetching stock details for symbol ${symbol}:`, error);
        res.status(500).json({ error: 'Failed to fetch stock details' });
    }
});

app.get('/api/news/:symbol', async (req, res) => {
    const symbol = req.params.symbol;
    try {
        var to_date = new Date().toISOString().slice(0, 10);
        var from_date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        console.log(`https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from_date}&to=${to_date}&token=${API_KEY}`)
        const response = await axios.get(`https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from_date}&to=${to_date}&token=${API_KEY}`);
        const newsWithImages = (response.data).filter(newsItem => newsItem.image !== '');
        res.json(newsWithImages.slice(0, 20));
    } catch (error) {
        console.error(`Error fetching stock details for symbol ${symbol}:`, error);
        res.status(500).json({ error: 'Failed to fetch stock details' });
    }
});

app.get('/api/insights/:symbol', async (req, res) => {
    const symbol = req.params.symbol;
    try {
        var to_date = new Date().toISOString().slice(0, 10);
        var from_date = "2022-01-01"; 
        console.log(`https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${symbol}&from=${from_date}&to=${to_date}&token=${API_KEY}`)
        const response = await axios.get(`https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${symbol}&from=${from_date}&to=${to_date}&token=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        console.error(`Error fetching stock details for symbol ${symbol}:`, error);
        res.status(500).json({ error: 'Failed to fetch stock details' });
    }
});


app.get('/api/historical/:symbol', async (req, res) => {
    const symbol = (req.params.symbol).toLocaleUpperCase();
    var to_date = new Date().toISOString().slice(0, 10);
    const twoYearsAgo = new Date(new Date().getFullYear() - 2, new Date().getMonth(), new Date().getDate());
    var from_date = twoYearsAgo.toISOString().substring(0, 10);
    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${from_date}/${to_date}?adjusted=true&sort=asc&apiKey=chLsvUjYEHxxMx3yGdtGbMVZo76wbV1t`;
    try {
        console.log(`Requesting historical data: ${url}`);
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error(`Error fetching historical data for symbol ${symbol}:`, error);
        res.status(500).json({ error: 'Failed to fetch historical data' });
    }
})


app.get('/api/hourly/:symbol', async (req, res) => {
    const symbol = (req.params.symbol).toLocaleUpperCase();
    var to_date = new Date().toISOString().slice(0, 10);
    const twoYearsAgo = new Date(new Date().getFullYear() - 2, new Date().getMonth(), new Date().getDate());
    var from_date = twoYearsAgo.toISOString().substring(0, 10);
    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/hour/${from_date}/${to_date}?adjusted=true&sort=asc&&apiKey=chLsvUjYEHxxMx3yGdtGbMVZo76wbV1t`;
    try {
        console.log(`Requesting hourly data: ${url}`);
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error(`Error fetching historical data for symbol ${symbol}:`, error);
        res.status(500).json({ error: 'Failed to fetch historical data' });
    }
})


app.use(express.json());

app.post('/api/watchlist', async (req, res) => {
    try {
      const stock = req.body;
      await client.db('Stock_Search').collection('watchlist').insertOne(stock);
      res.status(201).json({ message: 'Stock added to watchlist', data: stock });
    } catch (error) {
      console.error(`Error adding to watchlist:`, error);
      res.status(500).json({ error: 'Failed to add to watchlist' });
    }
  });


app.get('/api/watchlist', async (req, res) => {
  try {
    const watchlist = await client.db('Stock_Search').collection('watchlist').find({}).toArray();
    res.status(200).json(watchlist);
  } catch (error) {
    console.error(`Error fetching watchlist:`, error);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

app.delete('/api/watchlist/:symbol', async (req, res) => {
    try {
      const { symbol } = req.params;
      const result = await client.db('Stock_Search').collection('watchlist').deleteOne({ symbol: symbol });
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Stock not found in watchlist' });
      }
      res.status(204).json({ message: 'Stock removed from watchlist' });
    } catch (error) {
      console.error(`Error removing from watchlist:`, error);
      res.status(500).json({ error: 'Failed to remove from watchlist' });
    }
  });


app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});



