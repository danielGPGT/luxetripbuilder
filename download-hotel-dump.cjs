const fs = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');
const { pipeline } = require('stream');
const { execSync } = require('child_process');
const { decompress } = require('zstddec');

// Load environment variables from server.env
require('dotenv').config({ path: './server.env' });

const ET_API_KEY_ID = process.env.ET_API_KEY_ID;
const ET_API_KEY = process.env.ET_API_KEY;

if (!ET_API_KEY_ID || !ET_API_KEY) {
  console.error('❌ Missing environment variables: ET_API_KEY_ID and ET_API_KEY');
  console.error('Please set these in your server.env file');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
console.log(`📋 API Key ID: ${ET_API_KEY_ID}`);
console.log(`🔑 API Key: ${ET_API_KEY.substring(0, 8)}...`);

async function downloadHotelDump() {
  console.log('🚀 Starting hotel dump download...');
  
  const requestData = {
    inventory: "all",
    language: "en"
  };

  const postData = JSON.stringify(requestData);
  
  const options = {
    hostname: 'api.worldota.net',
    path: '/api/b2b/v3/hotel/info/dump/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${ET_API_KEY_ID}:${ET_API_KEY}`).toString('base64')}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log(`📡 Response status: ${res.statusCode}`);
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('📋 API Response:', JSON.stringify(response, null, 2));
          
          if (response.status === 'ok' && response.data) {
            resolve(response.data);
          } else if (response.error === 'dump_not_ready') {
            reject(new Error('❌ Hotel dump is not ready. Please try again later.'));
          } else {
            reject(new Error(`❌ API Error: ${response.error || 'Unknown error'}`));
          }
        } catch (error) {
          reject(new Error(`❌ Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`❌ Request failed: ${error.message}`));
    });

    req.write(postData);
    req.end();
  });
}

async function downloadFile(url, outputPath) {
  console.log(`📥 Downloading file from: ${url}`);
  console.log(`💾 Saving to: ${outputPath}`);
  
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      console.log(`📡 Download status: ${response.statusCode}`);
      
      if (response.statusCode !== 200) {
        reject(new Error(`❌ Download failed with status: ${response.statusCode}`));
        return;
      }
      
      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;
      
      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        const progress = ((downloadedSize / totalSize) * 100).toFixed(2);
        process.stdout.write(`\r📊 Download progress: ${progress}%`);
      });
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log('\n✅ Download completed!');
        resolve();
      });
    }).on('error', (error) => {
      fs.unlink(outputPath, () => {}); // Delete file on error
      reject(new Error(`❌ Download failed: ${error.message}`));
    });
  });
}

async function decompressFile(inputPath, outputPath) {
  console.log(`🔧 Decompressing file: ${inputPath}`);
  
  try {
    const inputBuffer = fs.readFileSync(inputPath);
    const outputBuffer = decompress(inputBuffer);
    fs.writeFileSync(outputPath, outputBuffer);
        console.log('✅ Decompression completed!');
  } catch (error) {
    throw new Error(`❌ Decompression failed: ${error.message}`);
      }
}

async function parseHotelData(jsonPath) {
  console.log(`📖 Parsing hotel data from: ${jsonPath}`);
  
  return new Promise((resolve, reject) => {
    const hotels = [];
    let lineCount = 0;
    
    const readStream = fs.createReadStream(jsonPath, { encoding: 'utf8' });
    const lineReader = require('readline').createInterface({
      input: readStream,
      crlfDelay: Infinity
    });
    
    lineReader.on('line', (line) => {
      lineCount++;
      if (lineCount % 1000 === 0) {
        console.log(`📊 Processed ${lineCount} lines...`);
      }
      
      try {
        if (line.trim()) {
          const hotel = JSON.parse(line);
          hotels.push(hotel);
        }
      } catch (error) {
        console.warn(`⚠️  Skipping invalid JSON on line ${lineCount}: ${error.message}`);
      }
    });
    
    lineReader.on('close', () => {
      console.log(`✅ Parsed ${hotels.length} hotels from ${lineCount} lines`);
      resolve(hotels);
    });
    
    lineReader.on('error', (error) => {
      reject(new Error(`❌ Failed to read file: ${error.message}`));
    });
  });
}

async function createHotelIndex(hotels) {
  console.log('🔍 Creating hotel index...');
  
  const hotelIndex = {
    byId: {},
    byName: {},
    byLocation: {},
    stats: {
      total: hotels.length,
      countries: new Set(),
      cities: new Set(),
      chains: new Set()
    }
  };
  
  hotels.forEach((hotel) => {
    // Index by hotel ID
    if (hotel.id) {
      hotelIndex.byId[hotel.id] = hotel;
    }
    
    // Index by name (case-insensitive)
    if (hotel.name) {
      const nameKey = hotel.name.toLowerCase();
      if (!hotelIndex.byName[nameKey]) {
        hotelIndex.byName[nameKey] = [];
      }
      hotelIndex.byName[nameKey].push(hotel);
    }
    
    // Index by location
    if (hotel.country && hotel.city) {
      const locationKey = `${hotel.country.toLowerCase()}_${hotel.city.toLowerCase()}`;
      if (!hotelIndex.byLocation[locationKey]) {
        hotelIndex.byLocation[locationKey] = [];
      }
      hotelIndex.byLocation[locationKey].push(hotel);
      
      hotelIndex.stats.countries.add(hotel.country);
      hotelIndex.stats.cities.add(hotel.city);
    }
    
    // Track hotel chains
    if (hotel.chain) {
      hotelIndex.stats.chains.add(hotel.chain);
    }
  });
  
  // Convert sets to arrays for JSON serialization
  hotelIndex.stats.countries = Array.from(hotelIndex.stats.countries);
  hotelIndex.stats.cities = Array.from(hotelIndex.stats.cities);
  hotelIndex.stats.chains = Array.from(hotelIndex.stats.chains);
  
  console.log(`✅ Created index with ${Object.keys(hotelIndex.byId).length} hotels`);
  console.log(`📊 Stats: ${hotelIndex.stats.countries.length} countries, ${hotelIndex.stats.cities.length} cities, ${hotelIndex.stats.chains.length} chains`);
  
  return hotelIndex;
}

async function main() {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Step 1: Get dump URL
    console.log('\n=== Step 1: Getting hotel dump URL ===');
    const dumpInfo = await downloadHotelDump();
    
    // Step 2: Download the compressed file
    console.log('\n=== Step 2: Downloading hotel dump file ===');
    const compressedPath = path.join(dataDir, 'hotels_dump.json.zst');
    await downloadFile(dumpInfo.url, compressedPath);
    
    // Step 3: Decompress the file
    console.log('\n=== Step 3: Decompressing file ===');
    const jsonPath = path.join(dataDir, 'hotels_dump.json');
    await decompressFile(compressedPath, jsonPath);
    
    // Step 4: Parse hotel data
    console.log('\n=== Step 4: Parsing hotel data ===');
    const hotels = await parseHotelData(jsonPath);
    
    // Step 5: Create searchable index
    console.log('\n=== Step 5: Creating searchable index ===');
    const hotelIndex = await createHotelIndex(hotels);
    
    // Step 6: Save processed data
    console.log('\n=== Step 6: Saving processed data ===');
    const indexPath = path.join(dataDir, 'hotel_index.json');
    fs.writeFileSync(indexPath, JSON.stringify(hotelIndex, null, 2));
    
    // Save sample hotels for testing
    const sampleHotels = hotels.slice(0, 10);
    const samplePath = path.join(dataDir, 'sample_hotels.json');
    fs.writeFileSync(samplePath, JSON.stringify(sampleHotels, null, 2));
    
    console.log('\n🎉 Hotel dump processing completed successfully!');
    console.log(`📁 Data saved to: ${dataDir}`);
    console.log(`📊 Total hotels: ${hotels.length}`);
    console.log(`🔍 Index file: ${indexPath}`);
    console.log(`🧪 Sample file: ${samplePath}`);
    
    // Clean up compressed file
    fs.unlinkSync(compressedPath);
    console.log('🧹 Cleaned up compressed file');
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  downloadHotelDump,
  downloadFile,
  decompressFile,
  parseHotelData,
  createHotelIndex
}; 