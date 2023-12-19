

export const file_to_base64 = async (a_file: File) => {
    let a_function =
      (file: File) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          let base64_string = String(reader.result).split(",")[1]
          resolve(base64_string)
        };
        reader.onerror = error => reject(error);
      })
    return (await a_function(a_file) as string)
  }