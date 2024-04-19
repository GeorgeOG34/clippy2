export async function getChatResponse(prompt) {
  return await (await fetch("http://localhost:11434/api/chat", {method: "POST", body: JSON.stringify({
      model: 'llama3',
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    })})).json();

  console.log(response.message.content)
  return response.message.content;
}

export async function getImageChatResponse(screenshotAsBase64){
  const response = await (await fetch("http://localhost:11434/api/generate", {method: "POST", body: JSON.stringify({
      model: 'llava:7b',
      prompt: "Give me one piece of coding advice based on the code in the following picture in 20 words or less, and in a rude undertone:" ,
      images: [screenshotAsBase64],
      stream: false,
    })})).json();
  return response;
}