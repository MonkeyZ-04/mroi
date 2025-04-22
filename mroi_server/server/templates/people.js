export default ({ type, image_url, name, threshold }) => {
  return {
    type: "bubble",
    size: "kilo",
    header: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: type,
          weight: "bold",
          style: "normal",
          align: "center",
          size: "md",
        },
      ],
    },
    hero: {
      type: "image",
      url: image_url,
      size: "full",
      aspectRatio: "1:1",
      aspectMode: "cover",
      action: {
        type: "uri",
        uri: "http://linecorp.com/",
      },
      animated: true,
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: name,
          weight: "bold",
          size: "sm",
          align: "center",
        },
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              align: "center",
              offsetEnd: "sm",
              text: "Similarity",
              margin: "xs",
              weight: "bold",
              size: "xs",
            },
            {
              type: "text",
              text: `${threshold}%`,
              size: "xs",
              align: "center",
            },
          ],
          paddingTop: "md",
        },
      ],
      paddingBottom: "xl",
    },
  };
};
