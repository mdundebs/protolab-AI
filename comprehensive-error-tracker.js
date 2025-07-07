#!/usr/bin/env node

/**
 * Comprehensive Error Tracker for ProtoLab
 * Systematically tests all features and tracks errors for systematic fixing
 */

import fs from 'fs';
import path from 'path';

class ProtoLabErrorTracker {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.errors = [];
    this.successes = [];
    this.warnings = [];
    this.testResults = {};
  }

  async runComprehensiveTest() {
    console.log('🔍 ProtoLab Comprehensive Error Tracking Started\n');

    await this.testCoreFeatures();
    await this.testFileUploads();
    await this.testWorkspaceFeatures();
    await this.testPricingConsistency();
    await this.testSharingFunctionality();
    await this.generateDetailedReport();
  }

  async testCoreFeatures() {
    console.log('1. Testing Core Features...');

    // Test pitch generation
    try {
      const pitchResponse = await fetch(`${this.baseUrl}/api/generate-pitch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessIdea: 'Test AgTech Startup',
          industry: 'AgTech',
          country: 'Kenya',
          targetAudience: 'investors'
        })
      });

      if (pitchResponse.ok) {
        const data = await pitchResponse.json();
        this.recordSuccess('Pitch Generation', 'Basic pitch generation working');
        
        // Test customization
        if (data.content && data.content.slides) {
          this.recordSuccess('Pitch Customization', 'Slides generated with customizable content');
        } else {
          this.recordError('Pitch Customization', 'No customizable slides returned');
        }
      } else {
        this.recordError('Pitch Generation', `HTTP ${pitchResponse.status}: ${await pitchResponse.text()}`);
      }
    } catch (error) {
      this.recordError('Pitch Generation', `Network error: ${error.message}`);
    }

    // Test 3D video generation
    try {
      const videoResponse = await fetch(`${this.baseUrl}/api/intelligence/generate-3d-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'test_user',
          baseData: {
            businessName: 'Test 3D Business',
            industry: 'FinTech',
            country: 'Nigeria',
            businessType: 'startup',
            description: 'Test 3D video generation'
          }
        })
      });

      if (videoResponse.ok) {
        this.recordSuccess('3D Video Generation', 'Video generation endpoint responding');
      } else if (videoResponse.status === 402) {
        this.recordError('3D Video Generation', 'Still returning 402 premium restriction error');
      } else {
        this.recordError('3D Video Generation', `HTTP ${videoResponse.status}`);
      }
    } catch (error) {
      this.recordError('3D Video Generation', `Error: ${error.message}`);
    }

    // Test grants database
    try {
      const grantsResponse = await fetch(`${this.baseUrl}/api/grants/all`);
      if (grantsResponse.ok) {
        const grants = await grantsResponse.json();
        if (grants.length > 0) {
          this.recordSuccess('Grants Database', `${grants.length} grants loaded successfully`);
        } else {
          this.recordWarning('Grants Database', 'No grants returned from database');
        }
      } else {
        this.recordError('Grants Database', `HTTP ${grantsResponse.status}`);
      }
    } catch (error) {
      this.recordError('Grants Database', `Error: ${error.message}`);
    }
  }

  async testFileUploads() {
    console.log('2. Testing File Upload Systems...');

    // Test document upload
    try {
      const formData = new FormData();
      const testFile = new Blob(['Test document content'], { type: 'text/plain' });
      formData.append('file', testFile, 'test-document.txt');

      const uploadResponse = await fetch(`${this.baseUrl}/api/documents/upload`, {
        method: 'POST',
        body: formData
      });

      if (uploadResponse.ok) {
        const data = await uploadResponse.json();
        if (data.success) {
          this.recordSuccess('Document Upload', 'File upload and processing working');
        } else {
          this.recordError('Document Upload', data.error || 'Upload failed');
        }
      } else {
        this.recordError('Document Upload', `HTTP ${uploadResponse.status}: Buffer error likely`);
      }
    } catch (error) {
      this.recordError('Document Upload', `Buffer error: ${error.message}`);
    }

    // Test CV builder upload
    try {
      const cvFormData = new FormData();
      const cvFile = new Blob(['Name: John Doe\nSkills: JavaScript, React'], { type: 'text/plain' });
      cvFormData.append('file', cvFile, 'resume.txt');

      const cvResponse = await fetch(`${this.baseUrl}/api/documents/upload`, {
        method: 'POST',
        body: cvFormData
      });

      if (cvResponse.ok) {
        this.recordSuccess('CV Builder Upload', 'CV file processing working');
      } else {
        this.recordError('CV Builder Upload', 'Buffer is not defined error likely present');
      }
    } catch (error) {
      this.recordError('CV Builder Upload', `Buffer error: ${error.message}`);
    }
  }

  async testWorkspaceFeatures() {
    console.log('3. Testing Workspace Features...');

    // Test workspace creation
    try {
      const workspaceResponse = await fetch(`${this.baseUrl}/api/collab/workspace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Workspace',
          type: 'proposal',
          participants: []
        })
      });

      if (workspaceResponse.ok) {
        const data = await workspaceResponse.json();
        if (data.success) {
          this.recordSuccess('Workspace Creation', 'Workspace creation working');
        } else {
          this.recordError('Workspace Creation', 'Workspace name validation failing');
        }
      } else {
        this.recordError('Workspace Creation', 'Workspace name is required error');
      }
    } catch (error) {
      this.recordError('Workspace Creation', `Error: ${error.message}`);
    }

    // Test empty workspace name
    try {
      const emptyNameResponse = await fetch(`${this.baseUrl}/api/collab/workspace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '',
          type: 'proposal',
          participants: []
        })
      });

      if (emptyNameResponse.status === 400) {
        this.recordSuccess('Workspace Validation', 'Empty name validation working');
      } else {
        this.recordError('Workspace Validation', 'Empty name validation not working');
      }
    } catch (error) {
      this.recordError('Workspace Validation', `Error: ${error.message}`);
    }
  }

  async testPricingConsistency() {
    console.log('4. Testing Pricing Consistency...');

    const pricingEndpoints = [
      '/api/user/subscription',
      '/api/config'
    ];

    for (const endpoint of pricingEndpoints) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`);
        if (response.ok) {
          const data = await response.json();
          this.recordSuccess('Pricing Endpoints', `${endpoint} responding`);
        } else {
          this.recordError('Pricing Endpoints', `${endpoint} returning ${response.status}`);
        }
      } catch (error) {
        this.recordError('Pricing Endpoints', `${endpoint} error: ${error.message}`);
      }
    }

    // Check for pricing tier consistency
    this.recordWarning('Pricing Consistency', 'Manual review needed for tier consistency across app');
  }

  async testSharingFunctionality() {
    console.log('5. Testing Sharing Functionality...');

    try {
      const shareResponse = await fetch(`${this.baseUrl}/api/share/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: 'test@example.com',
          shareUrl: 'http://localhost:5000/shared/pitch_deck/123',
          contentTitle: 'Test Pitch Deck',
          contentType: 'pitch_deck'
        })
      });

      if (shareResponse.ok) {
        this.recordSuccess('Sharing Functionality', 'Email sharing endpoint working');
      } else {
        this.recordError('Sharing Functionality', 'Share is not working as reported');
      }
    } catch (error) {
      this.recordError('Sharing Functionality', `Error: ${error.message}`);
    }

    // Test shared content viewing
    try {
      const sharedResponse = await fetch(`${this.baseUrl}/shared/pitch_deck/123`);
      if (sharedResponse.ok) {
        this.recordSuccess('Shared Content', 'Shared content viewing working');
      } else {
        this.recordError('Shared Content', 'Shared content not accessible');
      }
    } catch (error) {
      this.recordError('Shared Content', `Error: ${error.message}`);
    }
  }

  recordError(feature, message) {
    this.errors.push({ feature, message, timestamp: new Date().toISOString() });
    console.log(`❌ ${feature}: ${message}`);
  }

  recordSuccess(feature, message) {
    this.successes.push({ feature, message, timestamp: new Date().toISOString() });
    console.log(`✅ ${feature}: ${message}`);
  }

  recordWarning(feature, message) {
    this.warnings.push({ feature, message, timestamp: new Date().toISOString() });
    console.log(`⚠️  ${feature}: ${message}`);
  }

  generateDetailedReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE ERROR TRACKING REPORT');
    console.log('='.repeat(80));

    console.log(`\n🎯 SUMMARY:`);
    console.log(`   ✅ Successes: ${this.successes.length}`);
    console.log(`   ❌ Errors: ${this.errors.length}`);
    console.log(`   ⚠️  Warnings: ${this.warnings.length}`);

    if (this.errors.length > 0) {
      console.log(`\n🚨 CRITICAL ERRORS TO FIX:`);
      this.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.feature}: ${error.message}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS TO ADDRESS:`);
      this.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning.feature}: ${warning.message}`);
      });
    }

    console.log(`\n🔧 RECOMMENDED FIXES:`);
    console.log(`   1. Fix buffer errors in document upload system`);
    console.log(`   2. Ensure 3D video generation bypasses premium restrictions`);
    console.log(`   3. Fix workspace name validation messages`);
    console.log(`   4. Standardize pricing tiers across all components`);
    console.log(`   5. Test sharing functionality thoroughly`);
    console.log(`   6. Add proper error boundaries and monitoring`);

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        successes: this.successes.length,
        errors: this.errors.length,
        warnings: this.warnings.length
      },
      errors: this.errors,
      successes: this.successes,
      warnings: this.warnings
    };

    fs.writeFileSync('protolab-error-report.json', JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: protolab-error-report.json`);
    console.log('='.repeat(80));
  }
}

// Run the comprehensive test
async function main() {
  const tracker = new ProtoLabErrorTracker();
  await tracker.runComprehensiveTest();
}

main().catch(console.error);