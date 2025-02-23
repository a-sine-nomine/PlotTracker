const ajax = async (url, requestMethod, requestBody = null) => {
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

  try {
    const response = await fetch(url, fetchData);
    if (response.status === 200 || response.status === 201) {
      return response;
    } else {
      return response.text().then((text) => {
        throw new Error(
          text || `Request failed with status ${response.status}`
        );
      });
    }
  } catch (error) {
    console.error("AJAX request failed:", error);
    throw error;
  }
};

export default ajax;
