// Google Apps Script para subir imagenes a Google Drive
// Este script debe desplegarse como Web App en Google Apps Script

const FOLDER_NAME = 'Webriders_Catalogos_Imagenes';

function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) {
      return createCorsResponse({
        success: false,
        error: 'No se recibieron datos'
      });
    }

    const data = JSON.parse(e.postData.contents);
    const imageData = data.image;
    const fileName = data.fileName || 'image_' + new Date().getTime();
    const mimeType = data.mimeType || 'image/jpeg';

    const imageBlob = Utilities.newBlob(
      Utilities.base64Decode(imageData.split(',')[1] || imageData),
      mimeType,
      fileName
    );

    let folder;
    const folders = DriveApp.getFoldersByName(FOLDER_NAME);

    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(FOLDER_NAME);
      folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      Logger.log('Carpeta creada: ' + FOLDER_NAME + ' (ID: ' + folder.getId() + ')');
    }

    const file = folder.createFile(imageBlob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    const publicUrl = 'https://drive.google.com/uc?id=' + fileId;

    return createCorsResponse({
      success: true,
      url: publicUrl,
      fileId: fileId,
      fileName: file.getName(),
      size: file.getSize()
    });

  } catch (error) {
    Logger.log('Error: ' + error.toString());

    return createCorsResponse({
      success: false,
      error: error.toString()
    });
  }
}

// Función helper para habilitar CORS
function createCorsResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Manejar peticiones OPTIONS (preflight CORS)
function doOptions() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doGet() {
  return ContentService
    .createTextOutput('Webriders Catalogos - Image Upload Service (POST only)')
    .setMimeType(ContentService.MimeType.TEXT);
}

// Función de prueba (opcional)
function testUpload() {
  // Esta función es solo para probar el script
  const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  const e = {
    postData: {
      contents: JSON.stringify({
        image: testImage,
        fileName: 'test.png',
        mimeType: 'image/png'
      })
    }
  };

  const result = doPost(e);
  Logger.log(result.getContent());
}
