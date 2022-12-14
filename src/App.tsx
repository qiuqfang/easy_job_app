import { useEffect, useState } from "react";
import "./App.css";
import { readText } from "@tauri-apps/api/clipboard";

import { Input, Image, Button, Spin } from "@arco-design/web-react";
const TextArea = Input.TextArea;

import { createWorker } from "tesseract.js";

function App() {
  const [imageSrc, setImageSrc] = useState<string>();
  const [parseText, setParseText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const parse = async (imgSrcUrl: string) => {
    setParseText("");
    setLoading(true);
    const worker = createWorker({
      logger: (m) => console.log(m),
    });
    await worker.load();
    await worker.loadLanguage("eng+chi_sim");
    await worker.initialize("eng+chi_sim");
    const {
      data: { text },
    } = await worker.recognize(imgSrcUrl);
    console.log(text);
    setParseText(text);
    await worker.terminate();
    setLoading(false);
  };

  const checkFile = (tempFile: any) => {
    if (!tempFile) {
      return false;
    }
    if (tempFile.type.substr(0, 5) != "image") {
      return;
    }
    const imgSrcUrl = URL.createObjectURL(tempFile);
    setImageSrc(imgSrcUrl);
    parse(imgSrcUrl);
  };

  const handleClick = () => {
    const inputFile = document.querySelector(`#fileUpload`) as HTMLInputElement;
    inputFile.click();
    inputFile.onchange = (e: any) => {
      const tempFile = e.target.files[0];
      e.target.value = ""; // 同一个文件做两次上传操作，第二次无效解决办法

      checkFile(tempFile);
    };
  };

  const getClipboardContents = async () => {
    const clipboardText = await readText();
    console.log(clipboardText);
  };

  useEffect(() => {
    getClipboardContents();
  }, []);

  return (
    <div className="easy-ocr-app">
      <Spin block dot loading={loading} tip="正在解析图片中的文字，请稍候...">
        <div className="flex justify-center p-[20px]">
          <Button type="primary" onClick={handleClick}>
            上传图片解析
          </Button>
        </div>

        <div className="flex justify-around">
          <Image
            width="49%"
            height="300px"
            style={{ display: "flex" }}
            className="justify-center items-center shadow-lg"
            src={imageSrc}
            alt="请上传图片..."
          />

          <TextArea
            style={{ width: "49%", height: "300px" }}
            className="shadow-lg"
            placeholder="请上传图片..."
            value={parseText}
            onChange={(value) => {
              setParseText(value);
            }}
          />
        </div>
      </Spin>

      <input type="file" id="fileUpload" accept="image/*" hidden />
    </div>
  );
}

export default App;
