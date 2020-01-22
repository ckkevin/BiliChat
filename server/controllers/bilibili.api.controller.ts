import { Controller, Get, Param, HttpService, Header } from "@nestjs/common";

@Controller()
export class BilibiliApiController {

    constructor(private http: HttpService) { }

    @Get("/v1/bili/stat/:id")
    public async getState(@Param('id') id: number) {
        const ret = await this.http.get(`https://api.live.bilibili.com/room/v1/Room/room_init?id=${id}`, { responseType: "json" }).toPromise();
        if (ret.status != 200) {
            return '';
        }
        const msgs = await this.http.post(`https://api.live.bilibili.com/ajax/msg`,`roomid=${ret.data.data.room_id}`, { responseType: "json" }).toPromise();
        const emojis = await this.http.get("https://api.bilibili.com/x/v2/reply/v2/emojis").toPromise();
        return {
            info: ret.data.data,
            msgs: msgs.data.data.room,
            emojis: emojis.data.data
        };
    }

    @Get("/v1/bili/avturl/:id")
    @Header("Cache-Control", "public,max-age=86400")
    public async getAvatarUrl(@Param('id') id: number) {
        const ret = await this.http.get(`https://api.bilibili.com/x/space/acc/info?mid=${id}`, { responseType: "json" }).toPromise();
        if (ret.status != 200) {
            return '';
        }
        return {
            face: ret.data.data.face
        };
    }
}