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
      return Response.json({ success: true, result: data });
    }
  } catch (err) {
    console.error(err);
    return Response.json({ success: false });
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
