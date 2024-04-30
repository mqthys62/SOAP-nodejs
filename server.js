const soap = require("soap");
const fs = require("fs");
const http = require("http");
const postgres = require("postgres");

const sql = postgres({ db: "mydb", user:"user", password: "password" });

const service = {
  ProductsService: {
    ProductsPort: {
      CreateProduct: async function ({ name, about, price }, callback) {
        if (!name || !about || !price) {
          throw {
            Fault: {
              Code: {
                Value: "soap:Sender",
                Subcode: { value: "rpc:BadArguments" },
              },
              Reason: { Text: "Processing Error" },
              statusCode: 400,
            },
          };
        }
        const product = await sql`
            INSERT INTO products (name, about, price)
            VALUES (${name}, ${about}, ${price})
            RETURNING *
        `;
        callback(product[0]);
      },
      GetProducts: async function ({ id }, callback) {
        if (!id) {
          throw {
            Fault: {
              Code: {
                Value: "soap:Sender",
                Subcode: { value: "rpc:BadArguments" },
              },
              Reason: { Text: "Processing Error" },
              statusCode: 400,
            },
          };
        }
        const product = await sql`
            SELECT * FROM products
            WHERE id = ${id}
        `;
        callback(product[0]);
      },
      PatchProduct: async function ({ id, name, about, price }, callback) {
        if (!id || (!name && !about && !price)) {
          throw {
            Fault: {
              Code: {
                Value: "soap:Sender",
                Subcode: { value: "rpc:BadArguments" },
              },
              Reason: { Text: "Processing Error" },
              statusCode: 400,
            },
          };
        }
        const product = await sql`
            UPDATE products
            SET ${sql({ name, about, price })}
            WHERE id = ${id}
            RETURNING *
        `;
        callback(product[0]);
      },
      DeleteProduct: async function ({ id }, callback) {
        if (!id) {
          throw {
            Fault: {
              Code: {
                Value: "soap:Sender",
                Subcode: { value: "rpc:BadArguments" },
              },
              Reason: { Text: "Processing Error" },
              statusCode: 400,
            },
          };
        }
        const product = await sql`
            DELETE FROM products
            WHERE id = ${id}
            RETURNING *
        `;
        callback(product[0]);
      },
    },
  },
};

const server = http.createServer(function (request, response) {
  response.end("404: Not Found: " + request.url);
});

server.listen(8001);

const xml = fs.readFileSync("productService.wsdl", "utf8");
soap.listen(server, "/products", service, xml, function () {
  console.log("SOAP server running at http://localhost:8001/products?wsdl");
});
