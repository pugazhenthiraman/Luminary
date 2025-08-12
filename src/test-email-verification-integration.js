// Test file to verify email verification integration
// This file can be run to test the complete flow

const testEmailVerificationFlow = () => {
  console.log("=== Email Verification Integration Test ===");

  // Test 1: Check if EmailVerification component exists
  try {
    const EmailVerification = require("./components/EmailVerification").default;
    console.log("✅ EmailVerification component found");
  } catch (error) {
    console.log("❌ EmailVerification component not found:", error.message);
  }

  // Test 2: Check if RegisterParent has been updated
  try {
    const fs = require("fs");
    const registerParentContent = fs.readFileSync(
      "./Login/RegisterParent.tsx",
      "utf8"
    );

    if (registerParentContent.includes("EmailVerification")) {
      console.log("✅ RegisterParent imports EmailVerification");
    } else {
      console.log("❌ RegisterParent does not import EmailVerification");
    }

    if (registerParentContent.includes("currentStep")) {
      console.log("✅ RegisterParent has verification flow state");
    } else {
      console.log("❌ RegisterParent missing verification flow state");
    }

    if (registerParentContent.includes("requiresVerification")) {
      console.log("✅ RegisterParent handles requiresVerification");
    } else {
      console.log("❌ RegisterParent does not handle requiresVerification");
    }
  } catch (error) {
    console.log("❌ Error checking RegisterParent:", error.message);
  }

  // Test 3: Check if RegisterCoach has been updated
  try {
    const fs = require("fs");
    const registerCoachContent = fs.readFileSync(
      "./Login/RegisterCoach.tsx",
      "utf8"
    );

    if (registerCoachContent.includes("EmailVerification")) {
      console.log("✅ RegisterCoach imports EmailVerification");
    } else {
      console.log("❌ RegisterCoach does not import EmailVerification");
    }

    if (registerCoachContent.includes("currentStep")) {
      console.log("✅ RegisterCoach has verification flow state");
    } else {
      console.log("❌ RegisterCoach missing verification flow state");
    }

    if (registerCoachContent.includes("requiresVerification")) {
      console.log("✅ RegisterCoach handles requiresVerification");
    } else {
      console.log("❌ RegisterCoach does not handle requiresVerification");
    }
  } catch (error) {
    console.log("❌ Error checking RegisterCoach:", error.message);
  }

  console.log("=== Test Complete ===");
};

// Run the test
testEmailVerificationFlow();
