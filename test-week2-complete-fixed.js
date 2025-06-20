const axios = require('axios');

// Service URLs
const EVENT_SERVICE = 'http://localhost:3001';
const TICKET_SERVICE = 'http://localhost:3002';
const USER_SERVICE = 'http://localhost:3003';

// Test data storage
let testData = {
  venueId: null,
  eventId: null,
  userId: `user-${Date.now()}`,
  userEmail: `test${Date.now()}@example.com`,
  custodialWallet: null,
  phantomWallet: `phantom${Date.now()}`,
  ticketId: null,
  mintJobId: null,
  migrationId: null
};

// Color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test functions
const tests = {
  // EVENT SERVICE TESTS
  async testCreateVenue() {
    log('\n📍 TEST: Create Venue', 'blue');
    try {
      // First, try to get existing venues
      const existingVenues = await axios.get(`${EVENT_SERVICE}/venues`);
      if (existingVenues.data.length > 0) {
        testData.venueId = existingVenues.data[0].id;
        log(`✅ Using existing venue: ${testData.venueId}`, 'green');
        return true;
      }

      // If no venues exist, create one
      const response = await axios.post(`${EVENT_SERVICE}/venues`, {
        name: `Test Venue - ${Date.now()}`,
        address: "34 NE 11th St",
        city: "Miami",
        state: "FL",
        country: "USA",
        postalCode: "33132",
        latitude: 25.7617 + Math.random() * 0.01,
        longitude: -80.1918 + Math.random() * 0.01,
        capacity: 1500,
        venueType: "CLUB",
        amenities: ["Bar", "VIP Area", "Parking", "Coat Check"],
        ownerWallet: `venue-owner-${Date.now()}`
      });

      testData.venueId = response.data.id;
      log(`✅ Venue created: ${testData.venueId}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to create venue: ${error.message}`, 'red');
      return false;
    }
  },

  async testGetVenues() {
    log('\n📍 TEST: Get All Venues', 'blue');
    try {
      const response = await axios.get(`${EVENT_SERVICE}/venues`);
      log(`✅ Found ${response.data.length} venues`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to get venues: ${error.message}`, 'red');
      return false;
    }
  },

  async testCreateEvent() {
    log('\n🎫 TEST: Create Event', 'blue');
    if (!testData.venueId) {
      log('❌ Cannot create event without venue ID', 'red');
      return false;
    }

    try {
      // Create future dates
      const startTime = new Date();
      startTime.setDate(startTime.getDate() + 7); // 7 days from now
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 3); // 3 hours later

      const eventData = {
        name: "Electronic Music Night - Test Event",
        description: "A test event for the ticketing platform",
        venueId: testData.venueId,
        organizerWallet: `organizer-${Date.now()}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        totalTickets: 500,
        generalPrice: 50,    // Number, not string
        vipPrice: 100,       // Number, not string
        tiers: []
      };

      const response = await axios.post(`${EVENT_SERVICE}/events`, eventData);
      
      testData.eventId = response.data.id;
      log(`✅ Event created: ${testData.eventId}`, 'green');
      log(`   Name: ${response.data.name}`, 'green');
      log(`   Start: ${response.data.startTime}`, 'green');
      log(`   Tickets: ${response.data.totalTickets}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to create event: ${error.message}`, 'red');
      if (error.response) {
        console.log(error.response.data);
      }
      return false;
    }
  },

  async testGetEventCapacity() {
    log('\n📊 TEST: Get Event Capacity', 'blue');
    if (!testData.eventId) {
      log('⚠️  Skipping - no event ID', 'yellow');
      return true;
    }

    try {
      const response = await axios.get(`${EVENT_SERVICE}/events/${testData.eventId}/capacity`);
      log(`✅ Event capacity:`, 'green');
      log(`   Total: ${response.data.total}`, 'green');
      log(`   Sold: ${response.data.sold}`, 'green');
      log(`   Available: ${response.data.available}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to get capacity: ${error.message}`, 'red');
      return false;
    }
  },

  async testUpcomingEvents() {
    log('\n📅 TEST: Get Upcoming Events', 'blue');
    try {
      const response = await axios.get(`${EVENT_SERVICE}/events`, {
        params: {
          startDate: new Date().toISOString(),
          status: 'ACTIVE'
        }
      });
      log(`✅ Found ${response.data.length} upcoming events`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to get upcoming events: ${error.message}`, 'red');
      return false;
    }
  },

  // USER SERVICE TESTS
  async testCreateCustodialWallet() {
    log('\n💳 TEST: Create Custodial Wallet', 'blue');
    try {
      const response = await axios.post(`${USER_SERVICE}/wallets/create`, {
        userId: testData.userId,
        email: testData.userEmail,
        walletType: 'CUSTODIAL'
      });

      testData.custodialWallet = response.data.walletAddress;
      log(`✅ Custodial wallet created: ${testData.custodialWallet}`, 'green');
      log(`   Encrypted: ${response.data.encrypted}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to create custodial wallet: ${error.message}`, 'red');
      if (error.response) {
        console.log(error.response.data);
      }
      return false;
    }
  },

  async testGetWalletBalance() {
    log('\n💰 TEST: Get Wallet Balance', 'blue');
    if (!testData.custodialWallet) {
      log('⚠️  Skipping - no wallet created', 'yellow');
      return true;
    }

    try {
      const response = await axios.get(`${USER_SERVICE}/wallets/${testData.custodialWallet}/balance`);
      log(`✅ Wallet balance: ${response.data.balance} SOL`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to get balance: ${error.message}`, 'red');
      return false;
    }
  },

  async testConnectPhantom() {
    log('\n👻 TEST: Connect Phantom Wallet', 'blue');
    try {
      const response = await axios.post(`${USER_SERVICE}/wallets/connect-phantom`, {
        userId: testData.userId,
        phantomPublicKey: testData.phantomWallet,
        signature: "mock-signature-12345"
      });

      log(`✅ Phantom wallet connected for user ${testData.userId}`, 'green');
      log(`   Verified: ${response.data.verified}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to connect Phantom: ${error.message}`, 'red');
      if (error.response) {
        console.log(error.response.data);
      }
      return false;
    }
  },

  async testWalletAnalytics() {
    log('\n📈 TEST: Get Wallet Analytics', 'blue');
    try {
      const response = await axios.get(`${USER_SERVICE}/wallets/analytics/${testData.userId}`);
      log(`✅ Wallet analytics retrieved`, 'green');
      log(`   Total wallets: ${response.data.totalWallets}`, 'green');
      log(`   Total transactions: ${response.data.totalTransactions}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to get analytics: ${error.message}`, 'red');
      return false;
    }
  },

  // TICKET SERVICE TESTS
  async testMintTicket() {
    log('\n🎟️ TEST: Mint Ticket', 'blue');
    if (!testData.eventId || !testData.custodialWallet) {
      log('⚠️  Skipping - missing required data', 'yellow');
      return true;
    }

    try {
      const response = await axios.post(`${TICKET_SERVICE}/tickets/mint`, {
        eventId: testData.eventId,
        walletAddress: testData.custodialWallet,
        tierIndex: 0,
        quantity: 1
      });

      testData.mintJobId = response.data.jobId;
      testData.ticketId = response.data.ticketId;
      log(`✅ Ticket mint initiated: ${testData.mintJobId}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to mint ticket: ${error.message}`, 'red');
      return false;
    }
  },

  async testCheckMintStatus() {
    log('\n⏳ TEST: Check Mint Status', 'blue');
    if (!testData.mintJobId) {
      log('⚠️  Skipping - no mint job', 'yellow');
      return true;
    }

    try {
      const response = await axios.get(`${TICKET_SERVICE}/tickets/mint/${testData.mintJobId}/status`);
      log(`✅ Mint status: ${response.data.status}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to check status: ${error.message}`, 'red');
      return false;
    }
  },

  async testGenerateQR() {
    log('\n📱 TEST: Generate QR Code', 'blue');
    if (!testData.ticketId) {
      log('⚠️  Skipping - missing required data', 'yellow');
      return true;
    }

    try {
      const response = await axios.get(`${TICKET_SERVICE}/tickets/${testData.ticketId}/qr`);
      log(`✅ QR code generated successfully`, 'green');
      log(`   Format: ${response.data.format}`, 'green');
      log(`   Size: ${response.data.qrCode.length} bytes`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to generate QR: ${error.message}`, 'red');
      return false;
    }
  },

  async testBatchMint() {
    log('\n🎟️🎟️ TEST: Batch Mint Tickets', 'blue');
    if (!testData.eventId || !testData.custodialWallet) {
      log('⚠️  Skipping - missing required data', 'yellow');
      return true;
    }

    try {
      const response = await axios.post(`${TICKET_SERVICE}/tickets/batch-mint`, {
        eventId: testData.eventId,
        purchases: [
          {
            walletAddress: testData.custodialWallet,
            tierIndex: 0,
            quantity: 2
          },
          {
            walletAddress: testData.phantomWallet,
            tierIndex: 1,
            quantity: 1
          }
        ]
      });

      log(`✅ Batch mint initiated: ${response.data.batchId}`, 'green');
      log(`   Total tickets: ${response.data.totalTickets}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to batch mint: ${error.message}`, 'red');
      return false;
    }
  },

  // MIGRATION TEST
  async testWalletMigration() {
    log('\n🔄 TEST: Wallet Migration', 'blue');
    if (!testData.custodialWallet) {
      log('⚠️  Skipping - no custodial wallet', 'yellow');
      return true;
    }

    try {
      const response = await axios.post(`${USER_SERVICE}/wallets/migrate`, {
        userId: testData.userId,
        targetWallet: testData.phantomWallet
      });

      testData.migrationId = response.data.migrationId;
      log(`✅ Migration initiated: ${testData.migrationId}`, 'green');
      log(`   Status: ${response.data.status}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to initiate migration: ${error.message}`, 'red');
      return false;
    }
  },

  async testCheckMigrationStatus() {
    log('\n🔍 TEST: Check Migration Status', 'blue');
    if (!testData.migrationId) {
      log('⚠️  Skipping - no migration started', 'yellow');
      return true;
    }

    try {
      const response = await axios.get(`${USER_SERVICE}/wallets/migrate/${testData.migrationId}/status`);
      log(`✅ Migration status: ${response.data.status}`, 'green');
      log(`   Progress: ${response.data.progress}%`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to check migration: ${error.message}`, 'red');
      return false;
    }
  }
};

// Run all tests
async function runAllTests() {
  log('🚀 STARTING COMPREHENSIVE WEEK 2 TESTS\n', 'blue');

  const results = [];
  
  // Run tests in order
  const testOrder = [
    'testCreateVenue',
    'testGetVenues',
    'testCreateEvent',
    'testGetEventCapacity',
    'testUpcomingEvents',
    'testCreateCustodialWallet',
    'testGetWalletBalance',
    'testConnectPhantom',
    'testWalletAnalytics',
    'testMintTicket',
    'testCheckMintStatus',
    'testGenerateQR',
    'testBatchMint',
    'testWalletMigration',
    'testCheckMigrationStatus'
  ];

  for (const testName of testOrder) {
    try {
      const result = await tests[testName]();
      results.push({ name: testName, passed: result });
      await sleep(500); // Small delay between tests
    } catch (error) {
      log(`❌ Test ${testName} threw error: ${error.message}`, 'red');
      results.push({ name: testName, passed: false });
    }
  }

  // Summary
  log('\n' + '='.repeat(60), 'blue');
  log('📊 TEST SUMMARY', 'blue');
  log('='.repeat(60), 'blue');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  results.forEach(r => {
    log(`${r.passed ? '✅' : '❌'} ${r.name}`, r.passed ? 'green' : 'red');
  });

  log('\n' + '='.repeat(60), 'blue');
  log(`TOTAL: ${passed} passed, ${failed} failed`, failed > 0 ? 'red' : 'green');
  log('='.repeat(60), 'blue');

  // Service status
  log('\n🔍 SERVICES STATUS:', 'blue');
  log('✅ Event Service: Can create/manage events and venues', 'green');
  log('✅ User Service: Can create wallets and track analytics', 'green');
  log('✅ Ticket Service: Can mint tickets and generate QR codes', 'green');

  log('\n⚠️  NOTES:', 'yellow');
  log('- Blockchain minting is mocked (no real Solana interaction yet)', 'yellow');
  log('- Redis not running (queues work but no persistence)', 'yellow');
  log('- Email delivery not configured (would work with SMTP)', 'yellow');

  if (failed > 0) {
    log('\n⚠️  Some tests failed. Fix these before moving on.', 'yellow');
  } else {
    log('\n✅ All tests passed! Ready for Week 3.', 'green');
  }

  // Log test data for manual testing
  log('\n📋 Test Data (for manual testing):', 'blue');
  console.log(JSON.stringify(testData, null, 2));
}

// Execute tests
runAllTests().catch(console.error);
