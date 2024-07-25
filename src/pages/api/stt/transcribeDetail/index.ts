import { NextApiRequest, NextApiResponse } from "next";

async function postControl(req: NextApiRequest, res: NextApiResponse) {
  try {
    const reqData = JSON.parse(req.body);
    const { token, id } = reqData;

    const response = await fetch(`https://openapi.vito.ai/v1/transcribe/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        // "Content-Type": "multipart/form-data",
        Authorization: `bearer ${token}`,
      },
    });
    console.log("response", response);
    if (response.status === 200) {
      const data = await response.json();
      return res.status(200).json({ success: true, result: data });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "api fail" });
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("### handler req", req.method);
  if (req.method === "POST") {
    return postControl(req, res);
  }
  return res.status(101).json({ messsage: "handler error" });
};

export default handler;
