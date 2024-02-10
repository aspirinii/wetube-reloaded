// Desc: 서버를 실행하는 파일
import "dotenv/config";
import "./db";
import "./models/Video";
import "./models/User";
import "./models/Comment";
import app from "./server";

const PORT = 4000;

const handleListening = () =>
    console.log(`✅ Listening on: http://localhost:${PORT} 🚀`);

app.listen(PORT, handleListening);
//app.listen: 이 함수는 지정된 포트에서 네트워크 요청을 수신할 준비를 합니다. 이 때, app.set과 app.use를 통해 설정된 모든 사항들이 적용된 상태로 서버가 시작됩니다.
