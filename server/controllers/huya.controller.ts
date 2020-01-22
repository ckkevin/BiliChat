import { Controller, Get, Param, HttpService, Header } from "@nestjs/common";

@Controller()
export class HuyaController {

    constructor(private http: HttpService) { }

    @Get("/v1/huya/stat/:id")
    public async getState(@Param('id') id: number) {
        const ret = await this.http.get(`https://m.huya.com/${id}`,{
            headers:{
                'User-Agent':'Mozilla/5.0 (Linux; Android 5.1.1; Nexus 6 Build/LYZ28E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Mobile Safari/537.36'
            }
        }).toPromise();
        if (ret.status != 200) {
            return '';
        }
        return ret.data;
    }
}