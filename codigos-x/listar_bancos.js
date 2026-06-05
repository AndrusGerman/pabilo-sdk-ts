const apiKey = "<API_KEY>"; // proporcionado en https://pabilo.app/integrations

fetch("https://api.pabilo.app/me/usersbank", {
  method: "GET",
  headers: {
    "appKey": apiKey
  }
})
  .then(async (response) => {
    console.log("Status Code:", response.status);
    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));

    if (data && data.user_banks) {
      console.log("\n--- Lista de Bancos ---");
      data.user_banks.forEach((bank) => {
        console.log(`UserBankId: ${bank.id}`);
        console.log(`Descripción: ${bank.description}`);
        console.log(`Proveedor: ${bank.provider}`);
        if (bank.bank_accounts && bank.bank_accounts.length > 0) {
          console.log("Cuentas bancarias:");
          bank.bank_accounts.forEach((acc) => {
            console.log(`  - Número: ${acc.account_number} (${acc.account_type})`);
          });
        }
        console.log("-----------------------");
      });
    }
  })
  .catch((error) => {
    console.error("Error:", error);
  });
