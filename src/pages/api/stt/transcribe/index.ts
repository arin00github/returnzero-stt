import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";

async function postControl(req: NextApiRequest, res: NextApiResponse) {
  try {
    const formFile = await new Promise((resolve, reject) => {
      const form = formidable();
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ err, fields, files });
      });
    });

    const { files, fields } = formFile as any;
    const { file } = files;

    const reqData = JSON.parse(req.body);
    console.log("reqData", reqData);
    const { token, config } = reqData;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("token", token);
    formData.append("config", config);

    const response = await fetch(`https://openapi.vito.ai/v1/transcribe`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        // "Content-Type": "multipart/form-data",
        Authorization: `bearer ${token}`,
      },
      body: formData,
    });
    if (response.status === 200) {
      console.log("response", response);
      const data = await response.json();
      return res.status(200).json({ success: true, result: data });
    }
  } catch (err) {
    console.error(err);
    return res.status(502).json({ success: false });
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("### handler req", req.method);
  if (req.method === "POST") {
    await postControl(req, res);
  }
  return res.status(501).json({ messsage: "handler error" });
};

export default handler;
