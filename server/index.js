const express = require("express");
const app = express();
const port = 3000;
const xml2js = require("xml2js");

// Пример VAST XML
const vastXml = `
  <VAST version="3.0">
    <Ad>
      <InLine>
        <AdSystem>Example Ad System</AdSystem>
        <AdTitle>Example Ad Title</AdTitle>
        <!-- Добавьте другие элементы VAST здесь -->
      </InLine>
    </Ad>
  </VAST>
`;

app.use(express.json());

app.get("/vast", (req, res) => {
  // Возвращаем VAST XML в ответ на запрос
  res.type("application/xml");
  res.send(vastXml);
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
