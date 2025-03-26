const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS with more options - explicitly allow browser origin
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', (req, res) => {
  console.log('Received OPTIONS request');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).send();
});

// Parse JSON bodies
app.use(express.json());

// IMPORTANT: Override authenticateToken middleware
const authenticateToken = (req, res, next) => {
  console.log('Mock authenticateToken middleware - skipping authentication!');
  // Always set a mock user
  req.user = { id: 1, username: 'testuser' };
  next();
};

// Enable logging for all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers));
  
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Body:', req.body);
  }
  
  next();
});

// Mock data
const mockVirtues = [
  { id: 1, name: 'Test Virtue', type: 'Virtue', size: 'Minor', category: 'Test', description: 'Test virtue description' },
  { id: 2, name: 'Test Flaw', type: 'Flaw', size: 'Minor', category: 'Test', description: 'Test flaw description' },
  { id: 564, name: 'Mockup Virtue', type: 'Virtue', size: 'Minor', category: 'Test', description: 'This is created for testing' }
];

// Mock characters
const mockCharacters = [
  { 
    id: 1, 
    name: 'Test Character',
    character_type: 'grog',
    virtueFlawPoints: 0,
    user_id: 1,
    virtuesFlaws: []
  }
];

// Root route
app.get('/', (req, res) => {
  res.send('Mock Ars Saga Manager API is running');
});

// Authentication route - always returns a valid token
app.post('/api/auth/login', (req, res) => {
  console.log('Login request:', req.body);
  
  // Always succeed with a mock token
  res.json({
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzQwNTk0NjMzLCJleHAiOjE3NDA2ODEwMzN9.mock-token-always-valid',
    user: {
      id: 1,
      username: 'testuser',
      email: 'test@example.com'
    }
  });
});

// Get characters - protected with our mock authenticateToken
app.get('/api/characters', authenticateToken, (req, res) => {
  console.log('Getting all characters for user:', req.user.id);
  res.json({
    message: 'Characters fetched successfully',
    count: mockCharacters.length,
    characters: mockCharacters
  });
});

// Get virtues and flaws - not protected
app.get('/api/reference-virtues-flaws', (req, res) => {
  console.log('Sending mock virtues and flaws data');
  res.json(mockVirtues);
});

// Get character - protected with our mock authenticateToken
app.get('/api/characters/:id', authenticateToken, (req, res) => {
  console.log(`Getting character with ID: ${req.params.id}`);
  
  // Find the character or return the first mock character
  const character = mockCharacters.find(c => c.id === parseInt(req.params.id)) || mockCharacters[0];
  
  res.json(character);
});

// Get character virtues/flaws - protected with our mock authenticateToken
app.get('/api/characters/:id/virtues-flaws', authenticateToken, (req, res) => {
  console.log(`Getting virtues/flaws for character ID: ${req.params.id}`);
  
  // Find the character or return the first mock character
  const character = mockCharacters.find(c => c.id === parseInt(req.params.id)) || mockCharacters[0];
  
  res.json({
    virtuesFlaws: character.virtuesFlaws || [],
    remainingPoints: 10
  });
});

// Add virtue/flaw to character - protected with our mock authenticateToken
app.post('/api/characters/:id/virtues-flaws', authenticateToken, (req, res) => {
  console.log(`Adding virtue/flaw to character ID: ${req.params.id}`);
  console.log('Request body:', req.body);
  
  const { referenceVirtueFlawId } = req.body;
  
  if (!referenceVirtueFlawId) {
    console.log('Error: referenceVirtueFlawId is required');
    return res.status(400).json({ message: 'referenceVirtueFlawId is required' });
  }
  
  // Find the character
  const character = mockCharacters.find(c => c.id === parseInt(req.params.id)) || mockCharacters[0];
  
  // Find the referenced virtue/flaw
  const virtue = mockVirtues.find(v => v.id === parseInt(referenceVirtueFlawId));
  
  if (!virtue) {
    console.log(`Error: Virtue/flaw not found for ID: ${referenceVirtueFlawId}`);
    return res.status(404).json({ message: 'Virtue or Flaw not found' });
  }
  
  console.log(`Found virtue/flaw: ${virtue.name}`);
  
  // Create a new virtue/flaw entry
  const newVirtueFlaw = {
    id: Date.now(), // Use timestamp as a unique ID
    character_id: parseInt(req.params.id),
    reference_virtue_flaw_id: parseInt(referenceVirtueFlawId),
    cost: virtue.type === 'Virtue' ? (virtue.size === 'Major' ? 3 : 1) : 0,
    is_house_virtue_flaw: req.body.is_house_virtue_flaw || false,
    referenceVirtueFlaw: virtue
  };
  
  // Add it to the character's virtues/flaws
  if (!character.virtuesFlaws) {
    character.virtuesFlaws = [];
  }
  character.virtuesFlaws.push(newVirtueFlaw);
  
  console.log('Created new virtue/flaw entry:', newVirtueFlaw);
  console.log('Updated character virtues/flaws:', character.virtuesFlaws);
  
  // Return the new virtue/flaw
  res.status(201).json(newVirtueFlaw);
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start server
const port = 3001;
app.listen(port, '0.0.0.0', () => {
  console.log(`Mock server running on port ${port}`);
  console.log(`Server URL: http://localhost:${port}`);
  console.log('Server bound to all network interfaces (0.0.0.0)');
});