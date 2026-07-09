async function runTests() {
  console.log("--- Starting AI Assistant & Auth Registration Verification ---");

  try {
    // 1. Fetch current users list (should only contain admin by default)
    const res1 = await fetch("http://localhost:3001/api/auth/current");
    const data1 = await res1.json();
    console.log("\n[Test 1 - Initial Users (Should contain admin only)]:\n", data1.users);

    // 2. Register a new client user
    const res2 = await fetch("http://localhost:3001/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Client",
        email: "test-client@legaltalk.in",
        mobile: "9988776655",
        role: "client",
        city: "Mumbai",
        language: "English"
      })
    });
    const data2 = await res2.json();
    console.log("\n[Test 2 - Register Client Response]:\n", data2.user);

    // 3. Fetch current users list again (should contain admin AND the new client)
    const res3 = await fetch("http://localhost:3001/api/auth/current");
    const data3 = await res3.json();
    console.log("\n[Test 3 - Updated Users (Should contain admin & new client)]:\n", data3.users);

  } catch (e) {
    console.error("Verification error:", e);
  }
}

runTests().catch(console.error);
