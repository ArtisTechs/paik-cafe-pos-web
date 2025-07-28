export const formatDate = (dateString, format) => {
  const date = new Date(dateString);

  // Define available format options
  const formatOptions = {
    "YYYY-MM-DD": () => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    "Month Day, YYYY": new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date),
    "MM/DD/YYYY": new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date),
    // New format: "YYYY-MM-DD HH:mm:ss"
    "YYYY-MM-DD HH:mm:ss": () => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    // Add more formats as needed
  };

  // Check if the format exists
  if (!formatOptions[format]) {
    throw new Error("Invalid format specified");
  }

  // Use the appropriate format function or string
  return typeof formatOptions[format] === "function"
    ? formatOptions[format]()
    : formatOptions[format];
};

export const arrangeMessagesByTimestamp = (senderHistory, receiverHistory) => {
  const allMessages = [...senderHistory, ...receiverHistory];

  return allMessages.sort((a, b) => {
    // Parsing the timestamp string to Date objects to compare
    const timestampA = new Date(a.timestamp);
    const timestampB = new Date(b.timestamp);

    return timestampA - timestampB;
  });
};
