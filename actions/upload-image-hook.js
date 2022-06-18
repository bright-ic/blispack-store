const path = require('path');
const fs = require('fs');
const AdminBro = require('admin-bro');



const after = async (response, request, context) => {
  const { record, uploadImage } = context;

  if (record.isValid() && uploadImage) {
    try {
      const filePath = path.join('uploads', 'products', record.id().toString()+'_'+uploadImage.name);
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      const file = await fs.promises.readFile(uploadImage.path);
      if(file) {
        await fs.promises.writeFile(filePath, file);
        await fs.promises.unlink(uploadImage.path);
      }

      await record.update({ imagePath: `/${filePath}` });
    } catch(e) {}
  }
  return response;
};


const before = async (request, context) => {
  try {
    if (request.method === 'post') {
      const { uploadImage, ...otherParams } = request.payload;
  
      // eslint-disable-next-line no-param-reassign
      context.uploadImage = uploadImage;
  
      return {
        ...request,
        payload: otherParams,
      };
    }
  } catch(e) {}
  return request;
};

module.exports = { after, before };