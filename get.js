const soap = require("soap");

soap.createClient(
  "http://localhost:8000/products?wsdl",
  {},
  function (err, client) {
    if (err) {
      console.error(err);
      return;
    }
    client.GetProducts(
      {
        id: 1,
      },
      function (err, result) {
        if (err) {
          console.error(
            "Error making SOAP request: ",
            err.response.status,
            err.response.statusText,
            err.body
          );
          return;
        }

        console.log("Result:", result);
      }
    );
  }
);
