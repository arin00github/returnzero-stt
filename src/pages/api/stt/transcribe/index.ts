import { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function postControl(req: NextApiRequest, res: NextApiResponse) {
  try {
    const formFile = await new Promise((resolve, reject) => {
      const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ err, fields, files });
      });
    });

    const { files, fields } = formFile as any;
    let { file } = files;
    let { token, config } = fields;
    token = Array.isArray(token) ? token[0] : token;
    config = Array.isArray(config) ? config[0] : config;
    file = Array.isArray(file) ? (file[0] as File) : (file as File);

    if (!file || !token || !config) {
      return res.status(400).json({ message: "check request upload file, token, config" });
    }
    // console.log("config", typeof config, config);
    // console.log("token", token);
    // console.log("file", file);

    const fileBuffer = await fs.promises.readFile(file.filepath);
    const blob = new Blob([fileBuffer], { type: file.mimetype });

    const formData = new FormData();
    formData.append("file", blob, file.originalFilename);
    formData.append("config", config);

    const response = await fetch(`https://openapi.vito.ai/v1/transcribe`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `bearer ${token}`,
      },
      body: formData,
    });
    // console.log("response", response);
    if (response.status === 200) {
      const data = await response.json();
      return res.status(200).json({ message: response.statusText, result: data });
    } else {
      return res.status(response.status).json({ message: response.statusText });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    return postControl(req, res);
  }
  return res.status(101).json({ messsage: "handler error" });
};

export default handler;
