export const getBase64 = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

export const handleErrors = response => {
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response;
};
