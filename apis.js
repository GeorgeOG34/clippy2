import {setLastUrl} from "./browserwindow.js";

export async function getChatResponse(prompt) {
  const response = await (await fetch("http://localhost:11434/api/chat", {method: "POST", body: JSON.stringify({
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

export async function getStackOverflowAnswer(question){
  console.log(question);
  const withoutQuotes = question.match(/([^"]*)"$/)[1].replace(/"/g, "");
  console.log(withoutQuotes);
  const response = await (await fetch(`https://api.stackexchange.com/2.3/similar?order=desc&sort=relevance&site=stackoverflow&title=${encodeURIComponent(withoutQuotes)}`)).json();
  console.log(response);
  const answeredResponses = response.items.filter(item => item.is_answered);
  if (answeredResponses.length === 0) {
    return undefined;
  }
  console.log(answeredResponses);
  const questionId = answeredResponses[0].question_id;
  console.log(questionId);
  setLastUrl(answeredResponses[0].link);
  const answers = await (await fetch(`https://api.stackexchange.com/2.3/questions/${questionId}/answers?order=desc&sort=activity&site=stackoverflow&filter=withbody`)).json();

  console.log(answers);
  if (answers.items.length > 0) {
    console.log(answers.items[0].body)
    return convertMarkdownToHtml(await answers.items[0].body);
  }
  return undefined;
}

const converter = new window.showdown.Converter();

function convertMarkdownToHtml(markdown){
  return converter.makeHtml(markdown);
}
