const fs = require('fs');
const csv = require('csv-parser');

const filePath = 'megaGymDataset.csv';

const uniqueValues = {
  Title: new Set(),
  Desc: new Set(),
  Type: new Set(),
  BodyPart: new Set(),
  Equipment: new Set(),
  Level: new Set(),
  Rating: new Set(),
  RatingDesc: new Set(),
};

fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (row) => {
    Object.keys(uniqueValues).forEach((key) => {
      if (row[key]) {
        uniqueValues[key].add(row[key]);
      }
    });
  })
  .on('end', () => {
    Object.keys(uniqueValues).forEach((key) => {
      console.log(`Unique values for ${key}:`);
      console.log([...uniqueValues[key]]);
      console.log('--------------------------------');
    });
  });
