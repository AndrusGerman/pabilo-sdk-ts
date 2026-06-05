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
    amount: 1200,
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
      } else if (data.data) {
        if (data.data.is_new === true) {
          console.log("Log: Pago encontrado (is_new: true)");
        } else if (data.data.is_new === false) {
          console.log("Log: Pago duplicado encontrado (is_new: false)");
        }
      }
    }
  })
  .catch((error) => {
    console.error("Error:", error);
  });
