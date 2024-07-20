export const useClipboard = () => {
  const copy = (text: string) => {
    if (!navigator.clipboard) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return copy;
};
