function ajax(url, requestMethod, requestBody) {
  const fetchData = {
    headers: {
      "Content-Type": "application/json",
    },
    method: requestMethod,
    credentials: "include",
  };

  if (requestBody) {
    fetchData.body = JSON.stringify(requestBody);
  }

  return fetch(url, fetchData).then((response) => {
    if (response.status === 200 || response.status === 201) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      } else {
        return response.text();
      } 
    } else {
      return response.text().then((text) => {
        throw new Error(text || `Request failed with status ${response.status}`);
      });
    }
  });
}

export default ajax;