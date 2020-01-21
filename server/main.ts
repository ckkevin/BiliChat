import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';
import * as request from 'request';

const VERSION = 1030;

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
  app.setGlobalPrefix('api');
  const version = await doRequest<{version:number}>('https://bilichat.3shain.com/version',{json:true});
  if(version.version > VERSION){
    console.info('Bilichat有新版本了！输入指令 npm install bilichat -g 更新!')
  }
  await app.listen(4200);
}
bootstrap();

function doRequest<T>(path:string,options:request.CoreOptions):Promise<T>{
  return new Promise((resolve,reject)=>{
    request(path,options,(error,response,body)=>{
      if(error){
        reject(error);
      }
      resolve(<T>body);
    });
  });
}