const BASE_URL = 'http://localhost:5000';

class ProtoLabSystemTester {
  constructor() {
    this.results = {
      endpoints: {},
      performance: {},
      errors: [],
      success: 0,
      total: 0
    };
  }

  async testEndpoint(endpoint, method = 'GET', data = null) {
    const start = Date.now();
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };
      
      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, options);
      const duration = Date.now() - start;
      
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      this.total++;
      if (response.ok) {
        this.success++;
      }

      this.results.endpoints[endpoint] = {
        status: response.status,
        duration,
        success: response.ok,
        contentType,
        dataType: typeof responseData,
        hasData: !!responseData
      };

      console.log(`${method} ${endpoint}: ${response.status} (${duration}ms)`);
      return { success: response.ok, data: responseData, status: response.status };
      
    } catch (error) {
      this.total++;
      this.results.errors.push(`${endpoint}: ${error.message}`);
      console.error(`${method} ${endpoint}: ERROR - ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async testIntelligenceWorkflow() {
    console.log('\n🧠 Testing Intelligence Workflow...');
    
    // Test Gamma-quality pitch generation
    const gammaResult = await this.testEndpoint('/api/intelligence/generate-gamma-pitch', 'POST', {
      user_id: 'test_user_001',
      website_url: 'https://example-agtech.com',
      uploaded_docs: [],
      baseData: {
        businessName: 'AgroTech Solutions',
        industry: 'AgTech',
        country: 'Kenya',
        businessType: 'startup',
        description: 'Smart irrigation system for precision agriculture',
        fundingAmount: 500000,
        useCase: 'Series A funding'
      }
    });

    // Test smart pitch generation
    const smartResult = await this.testEndpoint('/api/intelligence/generate-smart-pitch', 'POST', {
      user_id: 'test_user_002',
      website_url: 'https://example-fintech.com',
      uploaded_docs: [],
      baseData: {
        businessName: 'FinTech Nigeria',
        industry: 'FinTech',
        country: 'Nigeria',
        businessType: 'startup',
        description: 'Mobile payment platform for rural communities',
        fundingAmount: 1000000,
        useCase: 'Series A funding'
      }
    });

    // Test website analysis
    const websiteResult = await this.testEndpoint('/api/intelligence/analyze-website', 'POST', {
      url: 'https://example.com',
      userId: 'test_user_003'
    });

    return {
      gamma: gammaResult,
      smart: smartResult,
      website: websiteResult
    };
  }

  async testCoreWorkflow() {
    console.log('\n🏗️ Testing Core Workflow...');
    
    // Test pitch request creation
    const pitchRequest = await this.testEndpoint('/api/create-pitch-request', 'POST', {
      businessName: 'Test Company',
      industry: 'AgTech',
      country: 'Kenya',
      businessType: 'startup',
      description: 'IoT farming solution',
      fundingAmount: 500000,
      useCase: 'Series A'
    });

    // Test grants endpoint
    const grants = await this.testEndpoint('/api/grants/all');

    // Test collaborative proposals
    const proposals = await this.testEndpoint('/api/collab/proposals');

    return {
      pitchRequest,
      grants,
      proposals
    };
  }

  async testFileUpload() {
    console.log('\n📁 Testing File Upload...');
    
    // Test file upload endpoint
    const uploadResult = await this.testEndpoint('/api/intelligence/upload-file', 'POST', {
      user_id: 'test_user_004',
      filename: 'test.pdf',
      content: 'Test document content for analysis',
      mimeType: 'application/pdf'
    });

    return uploadResult;
  }

  async testPerformance() {
    console.log('\n⚡ Testing Performance...');
    
    const performanceTests = [];
    const testData = {
      user_id: 'perf_test_user',
      baseData: {
        businessName: 'Performance Test Co',
        industry: 'FinTech',
        country: 'Nigeria',
        businessType: 'startup',
        description: 'Performance testing application',
        fundingAmount: 100000,
        useCase: 'Seed funding'
      }
    };

    // Run 5 concurrent requests
    for (let i = 0; i < 5; i++) {
      performanceTests.push(
        this.testEndpoint('/api/intelligence/generate-smart-pitch', 'POST', {
          ...testData,
          user_id: `perf_test_user_${i}`
        })
      );
    }

    const results = await Promise.all(performanceTests);
    const avgDuration = results.reduce((sum, result, index) => {
      const endpoint = '/api/intelligence/generate-smart-pitch';
      return sum + (this.results.endpoints[endpoint]?.duration || 0);
    }, 0) / results.length;

    this.results.performance.averageResponseTime = avgDuration;
    this.results.performance.concurrentRequests = results.length;
    this.results.performance.successRate = results.filter(r => r.success).length / results.length;

    console.log(`Average response time: ${avgDuration.toFixed(2)}ms`);
    console.log(`Success rate: ${(this.results.performance.successRate * 100).toFixed(1)}%`);
  }

  async runFullSystemTest() {
    console.log('🚀 Starting ProtoLab System Test Suite...\n');
    
    const workflows = await Promise.all([
      this.testIntelligenceWorkflow(),
      this.testCoreWorkflow(),
      this.testFileUpload()
    ]);

    await this.testPerformance();

    this.generateReport();
    return this.results;
  }

  generateReport() {
    console.log('\n📊 SYSTEM TEST REPORT');
    console.log('====================');
    
    console.log(`\nOverall Success Rate: ${(this.success / this.total * 100).toFixed(1)}% (${this.success}/${this.total})`);
    
    console.log('\n🎯 Endpoint Results:');
    Object.entries(this.results.endpoints).forEach(([endpoint, result]) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${endpoint}: ${result.status} (${result.duration}ms)`);
    });

    if (this.results.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.results.errors.forEach(error => console.log(`  - ${error}`));
    }

    console.log('\n⚡ Performance Metrics:');
    if (this.results.performance.averageResponseTime) {
      console.log(`  - Average Response Time: ${this.results.performance.averageResponseTime.toFixed(2)}ms`);
      console.log(`  - Concurrent Success Rate: ${(this.results.performance.successRate * 100).toFixed(1)}%`);
    }

    console.log('\n🔧 Recommendations:');
    if (this.success / this.total < 0.8) {
      console.log('  - System reliability needs improvement');
    }
    if (this.results.performance.averageResponseTime > 2000) {
      console.log('  - Response times are high, consider optimization');
    }
    if (this.results.errors.length > 0) {
      console.log('  - Address error handling for failed endpoints');
    }
    
    console.log('\n✅ System test completed');
  }
}

// Run the comprehensive test
const tester = new ProtoLabSystemTester();
tester.runFullSystemTest().catch(console.error);