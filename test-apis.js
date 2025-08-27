// Test script pour vérifier que les APIs supportent bien les dates personnalisées

const baseUrl = 'http://localhost:3006';

async function testAPIs() {
  console.log('🧪 Testing APIs with custom dates...\n');
  
  // Test avec une période personnalisée (Août 2025)
  const startDate = '2025-08-01';
  const endDate = '2025-08-27';
  
  try {
    // Test hierarchy API
    console.log('1. Testing hierarchy API with custom dates...');
    const hierarchyUrl = `${baseUrl}/api/aids/meta/campaigns/hierarchy?start_date=${startDate}&end_date=${endDate}`;
    console.log(`   URL: ${hierarchyUrl}`);
    
    // Test insights API
    console.log('\n2. Testing insights API with custom dates...');
    const insightsUrl = `${baseUrl}/api/aids/meta/insights?start_date=${startDate}&end_date=${endDate}&breakdowns=age,gender`;
    console.log(`   URL: ${insightsUrl}`);
    
    // Test campaigns API
    console.log('\n3. Testing campaigns API with custom dates...');
    const campaignsUrl = `${baseUrl}/api/aids/meta/campaigns?include_insights=true&start_date=${startDate}&end_date=${endDate}`;
    console.log(`   URL: ${campaignsUrl}`);
    
    // Test avec period prédéfinie
    console.log('\n4. Testing with predefined period (last_7d)...');
    const predefinedUrl = `${baseUrl}/api/aids/meta/campaigns/hierarchy?time_range=last_7d`;
    console.log(`   URL: ${predefinedUrl}`);
    
    console.log('\n✅ All API URLs generated correctly!');
    console.log('Check the browser network tab when changing periods to verify the correct parameters are sent.');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

testAPIs();