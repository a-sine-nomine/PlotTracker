const ajax = async (url, method, body = null) => {
  const options = {
    headers: {
      "Content-Type": "application/json",
    },
    method,
    credentials: "include",
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    const raw = await response.text();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
    const message = parsed ? "API Error" : raw || "API Error";
    const err = new Error(message);

    err.status = response.status;
    if (parsed !== null) err.body = parsed;

    throw err;
  }
  return response;
};

export default ajax;
