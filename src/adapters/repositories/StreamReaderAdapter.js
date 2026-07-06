import { IStreamReader } from '../../usecases/ports/IStreamReader.js';

export class StreamReaderAdapter extends IStreamReader {
  async readJson(stream) {
    return new Promise((resolve, reject) => {
      let data = '';
      stream.setEncoding('utf8');
      
      stream.on('data', (chunk) => {
        data += chunk;
      });
      
      stream.on('end', () => {
        try {
          if (!data || data.trim() === '') {
            return reject(new Error('Input stream is empty'));
          }
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
      
      stream.on('error', (error) => {
        reject(error);
      });
    });
  }
}
