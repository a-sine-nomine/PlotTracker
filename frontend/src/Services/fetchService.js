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
    const errorText = await response.text();
    throw new Error(
      errorText || `Request failed with status ${response.status}`
    );
  }
  return response;
};

export default ajax;
