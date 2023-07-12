//modelImagesDb();
//modelImagesFolder();

const ms = require('./Servers/mainServer.js');

ms.init(ms.app);

//ms.modelImagesDb();
//ms.modelImagesFolder();



/* Start the server*/
ms.server.listen(ms.port, () => {
  console.log(`Server running on http://localhost:${ms.port}`);
});
/* Start the server*/

