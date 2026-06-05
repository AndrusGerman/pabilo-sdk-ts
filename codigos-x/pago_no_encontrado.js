const userBankId = "<USER_BANK_ID>";
const apiKey = "<API_KEY>"; // proporcionado en https://pabilo.app/integrations
const referencia_bancaria = "37166";

fetch(`https://api.pabilo.app/userbankpayment/${userBankId}/betaserio`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "appKey": apiKey
  },
  body: JSON.stringify({
    amount: 0, // 0 es nulo por defecto
    bank_reference: referencia_bancaria,
    movement_type: "GENERIC"
  })
})
  .then(async (response) => {
    console.log("Status Code:", response.status);
    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));

    if (data) {
      if (data.error === "BANK_NOT_AVAILABLE") {
        console.log("Log: El banco no está disponible actualmente (BANK_NOT_AVAILABLE)");
      } else if (data.error === "PAYMENT_NOT_FOUND") {
        console.log("Log: Pago no encontrado (PAYMENT_NOT_FOUND)");
      }
    }
  })
  .catch((error) => {
    console.error("Error:", error);
  });
