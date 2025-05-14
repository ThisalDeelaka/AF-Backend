
const validateTags = (tags) => {
    // Ensure each tag only contains letters, numbers, and underscores
    const tagRegex = /^[a-zA-Z0-9_]+$/;
    return tags.every(tag => tagRegex.test(tag)); // Returns true if all tags are valid
  };
  
  module.exports = validateTags;
  