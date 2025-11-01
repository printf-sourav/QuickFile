import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "QuickFile API",
      version: "1.0.0",
      description: "API documentation for QuickFile"
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8000}`
      }
    ]
  },
  apis: [
    "./src/routes/*.js",
    "./src/controllers/*.js"
  ]
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
