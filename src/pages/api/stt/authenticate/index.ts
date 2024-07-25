import { NextApiRequest, NextApiResponse } from "next";

const getAuthorization = async () => {
  try {
    const data = new URLSearchParams({
      client_id: process.env.CLIENT_ID || "",
      client_secret: process.env.CLIENT_SECRETE || "",
    });
    console.log("data", data);

    const res = await fetch(`https://openapi.vito.ai/v1/authenticate`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: data,
    });

    console.log("res", res);

    if (res.status === 200) {
      const data = await res.json();
      console.log("getAuthorization", data);
      return data;
    }
  } catch (err) {
    console.error(err);
    return null;
  }
};

async function postControl(req: NextApiRequest, res: NextApiResponse) {
  console.log("### postControl");
  try {
    const result = await getAuthorization();

    if (result) {
      return res.status(200).json({ success: true, result });
    } else {
      return res.status(500).json({ messsage: "postControl error" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ messsage: "postControl error" });
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
