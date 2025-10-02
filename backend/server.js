const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Backend radi!');
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server pokrenut na portu ${PORT}`));
