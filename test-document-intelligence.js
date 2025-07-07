// Test document intelligence system functionality
const BASE_URL = 'http://localhost:5000';

async function testDocumentIntelligence() {
  console.log('Testing Document Intelligence System...\n');
  
  // Test 1: Check if frontend loads
  try {
    const response = await fetch(`${BASE_URL}/documents`);
    console.log('✓ Frontend loads successfully:', response.status === 200);
  } catch (error) {
    console.log('✗ Frontend load failed:', error.message);
  }

  // Test 2: Test website analysis endpoint
  try {
    const response = await fetch(`${BASE_URL}/api/documents/analyze-website`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: 'https://example.com' })
    });
    
    if (response.status === 401) {
      console.log('✓ Website analysis endpoint responds (requires auth)');
    } else {
      const data = await response.json();
      console.log('✓ Website analysis response:', data);
    }
  } catch (error) {
    console.log('✗ Website analysis failed:', error.message);
  }

  // Test 3: Test upload endpoint structure
  try {
    const formData = new FormData();
    const testBlob = new Blob(['test content'], { type: 'text/plain' });
    formData.append('file', testBlob, 'test.txt');
    
    const response = await fetch(`${BASE_URL}/api/documents/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (response.status === 401) {
      console.log('✓ Upload endpoint responds (requires auth)');
    } else {
      const data = await response.json();
      console.log('✓ Upload response:', data);
    }
  } catch (error) {
    console.log('✗ Upload test failed:', error.message);
  }

  // Test 4: Check if API config loads
  try {
    const response = await fetch(`${BASE_URL}/api/config`);
    const data = await response.json();
    console.log('✓ API config loads:', !!data);
  } catch (error) {
    console.log('✗ API config failed:', error.message);
  }

  console.log('\nDocument Intelligence System Test Complete');
}

// Run the test
testDocumentIntelligence().catch(console.error);